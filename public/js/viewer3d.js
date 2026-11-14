/**
 * ToyBrick 3D Model Viewer (Three.js r128)
 * Trình dựng 3D các chi tiết đồ chơi lắp ráp với OrbitControls tự viết,
 * chế độ Bung tách (Exploded View) và tự giải phóng bộ nhớ khi rời trang.
 */
class ToyBrickViewer3D {
  constructor(containerElement, modelData, options = {}) {
    this.container = containerElement;
    this.partsData = (modelData && modelData.parts) ? modelData.parts : [];
    this.options = Object.assign({
      autoRotate: true,
      autoRotateSpeed: 0.005,
      cameraDistance: 7,
      minDistance: 3,
      maxDistance: 15
    }, options);

    this.meshParts = [];
    this.isExploded = false;
    this.explodeFactor = 0; // 0: gộp, 1: bung hết
    this.targetExplodeFactor = 0;
    this.isUserInteracting = false;
    this.idleTimer = null;

    // Orbit Controls tự viết
    this.spherical = {
      radius: this.options.cameraDistance,
      theta: Math.PI / 4, // Xoay ngang
      phi: Math.PI / 3    // Xoay dọc
    };
    this.isPointerDown = false;
    this.pointerStart = { x: 0, y: 0 };
    this.sphericalStart = { theta: 0, phi: 0 };

    this.animationId = null;
    this.init();
  }

  init() {
    if (!this.container || typeof THREE === 'undefined') {
      console.warn('[Viewer3D] Container không tồn tại hoặc Three.js chưa tải');
      return;
    }

    const width = this.container.clientWidth || 400;
    const height = this.container.clientHeight || 350;

    // 1. Scene
    this.scene = new THREE.Scene();

    // 2. Camera
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    this.updateCameraPosition();

    // 3. Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Dọn sạch container trước khi append
    this.container.innerHTML = '';
    this.renderer.domElement.style.outline = 'none';
    this.renderer.domElement.style.cursor = 'grab';
    this.container.appendChild(this.renderer.domElement);

    // 4. Ánh sáng
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
    this.scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xfff7ed, 1.0);
    dirLight1.position.set(5, 10, 7);
    this.scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x38bdf8, 0.4);
    dirLight2.position.set(-5, -3, -5);
    this.scene.add(dirLight2);

    const pointLight = new THREE.PointLight(0xf59e0b, 0.8, 15);
    pointLight.position.set(0, 4, 3);
    this.scene.add(pointLight);

    // 5. Group chứa toàn bộ mô hình
    this.modelGroup = new THREE.Group();
    this.scene.add(this.modelGroup);

    // 6. Dựng các chi tiết parts
    this.buildParts();

    // 7. Gắn sự kiện Orbit Controls
    this.bindEvents();

    // 8. Bắt đầu vòng lặp Render
    this.animate = this.animate.bind(this);
    this.animationId = requestAnimationFrame(this.animate);
  }

  buildParts() {
    if (!this.partsData || this.partsData.length === 0) {
      // Chi tiết mẫu mặc định nếu dữ liệu rỗng
      const defaultGeo = new THREE.BoxGeometry(1.5, 1, 1.5);
      const defaultMat = new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        roughness: 0.3,
        metalness: 0.2
      });
      const defaultMesh = new THREE.Mesh(defaultGeo, defaultMat);
      this.modelGroup.add(defaultMesh);
      return;
    }

    this.partsData.forEach((part, index) => {
      let geometry;
      const size = part.size || [1, 1, 1];

      if (part.shape === 'cylinder') {
        // radiusTop, radiusBottom, height, radialSegments
        geometry = new THREE.CylinderGeometry(size[0], size[1], size[2], 24);
      } else {
        // Box mặc định
        geometry = new THREE.BoxGeometry(size[0], size[1], size[2]);
      }

      // Màu sắc dạng chuẩn
      const colorVal = part.color || '#f59e0b';
      const material = new THREE.MeshStandardMaterial({
        color: new THREE.Color(colorVal),
        roughness: 0.28,
        metalness: 0.18
      });

      const mesh = new THREE.Mesh(geometry, material);
      const pos = part.position || [0, 0, 0];
      mesh.position.set(pos[0], pos[1], pos[2]);

      // Lưu lại vị trí gốc và vector bung tách
      mesh.userData = {
        basePosition: new THREE.Vector3(pos[0], pos[1], pos[2]),
        explodeOffset: new THREE.Vector3(
          (part.explodeOffset && part.explodeOffset[0]) || 0,
          (part.explodeOffset && part.explodeOffset[1]) || 0,
          (part.explodeOffset && part.explodeOffset[2]) || 0
        ),
        name: part.name || `Chi tiết #${index + 1}`
      };

      this.meshParts.push(mesh);
      this.modelGroup.add(mesh);
    });

    // Căn giữa mô hình theo bounding box
    const box = new THREE.Box3().setFromObject(this.modelGroup);
    const center = new THREE.Vector3();
    box.getCenter(center);
    this.modelGroup.position.sub(center);
  }

  updateCameraPosition() {
    // Chuyển đổi tọa độ cầu sang tọa độ Descartes
    const x = this.spherical.radius * Math.sin(this.spherical.phi) * Math.sin(this.spherical.theta);
    const y = this.spherical.radius * Math.cos(this.spherical.phi);
    const z = this.spherical.radius * Math.sin(this.spherical.phi) * Math.cos(this.spherical.theta);

    this.camera.position.set(x, y, z);
    this.camera.lookAt(0, 0, 0);
  }

  bindEvents() {
    const el = this.renderer.domElement;

    this.onPointerDown = (e) => {
      this.isPointerDown = true;
      this.isUserInteracting = true;
      el.style.cursor = 'grabbing';

      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;

      this.pointerStart.x = clientX;
      this.pointerStart.y = clientY;
      this.sphericalStart.theta = this.spherical.theta;
      this.sphericalStart.phi = this.spherical.phi;
    };

    this.onPointerMove = (e) => {
      if (!this.isPointerDown) return;

      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;

      const deltaX = clientX - this.pointerStart.x;
      const deltaY = clientY - this.pointerStart.y;

      const sensitivity = 0.007;
      this.spherical.theta = this.sphericalStart.theta - deltaX * sensitivity;

      // Giới hạn góc nhìn phi không để lật ngửa camera (0.1 đến PI - 0.1)
      const newPhi = this.sphericalStart.phi - deltaY * sensitivity;
      this.spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, newPhi));

      this.updateCameraPosition();
    };

    this.onPointerUp = () => {
      this.isPointerDown = false;
      el.style.cursor = 'grab';

      // Trở lại tự xoay sau 2.5s không thao tác
      clearTimeout(this.idleTimer);
      this.idleTimer = setTimeout(() => {
        this.isUserInteracting = false;
      }, 2500);
    };

    this.onWheel = (e) => {
      e.preventDefault();
      this.isUserInteracting = true;

      const zoomFactor = e.deltaY * 0.005;
      this.spherical.radius = Math.max(
        this.options.minDistance,
        Math.min(this.options.maxDistance, this.spherical.radius + zoomFactor)
      );
      this.updateCameraPosition();

      clearTimeout(this.idleTimer);
      this.idleTimer = setTimeout(() => {
        this.isUserInteracting = false;
      }, 2000);
    };

    // Chuột
    el.addEventListener('mousedown', this.onPointerDown);
    window.addEventListener('mousemove', this.onPointerMove);
    window.addEventListener('mouseup', this.onPointerUp);
    el.addEventListener('wheel', this.onWheel, { passive: false });

    // Cảm ứng Mobile
    el.addEventListener('touchstart', this.onPointerDown, { passive: true });
    window.addEventListener('touchmove', this.onPointerMove, { passive: true });
    window.addEventListener('touchend', this.onPointerUp);

    // Resize container
    this.onResize = () => {
      if (!this.container || !this.renderer || !this.camera) return;
      const width = this.container.clientWidth;
      const height = this.container.clientHeight;
      if (width === 0 || height === 0) return;

      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(width, height);
    };

    if (window.ResizeObserver) {
      this.resizeObserver = new ResizeObserver(() => this.onResize());
      this.resizeObserver.observe(this.container);
    } else {
      window.addEventListener('resize', this.onResize);
    }
  }

  toggleExplode() {
    this.isExploded = !this.isExploded;
    this.targetExplodeFactor = this.isExploded ? 1 : 0;
    return this.isExploded;
  }

  resetView() {
    this.spherical.theta = Math.PI / 4;
    this.spherical.phi = Math.PI / 3;
    this.spherical.radius = this.options.cameraDistance;
    this.updateCameraPosition();
  }

  loadModel(modelData, options = {}) {
    if (this.isExploded) {
      this.isExploded = false;
      this.explodeFactor = 0;
      this.targetExplodeFactor = 0;
    }

    // Dọn dẹp các mesh cũ
    this.meshParts.forEach(mesh => {
      if (mesh.geometry) mesh.geometry.dispose();
      if (mesh.material) {
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach(m => m.dispose());
        } else {
          mesh.material.dispose();
        }
      }
    });
    this.meshParts = [];

    // Xóa các mesh con trong modelGroup
    if (this.modelGroup) {
      while (this.modelGroup.children.length > 0) {
        const obj = this.modelGroup.children[0];
        this.modelGroup.remove(obj);
      }
      this.modelGroup.position.set(0, 0, 0);
      this.modelGroup.rotation.set(0, 0, 0);
    }

    this.partsData = (modelData && modelData.parts) ? modelData.parts : [];
    if (options.cameraDistance) {
      this.options.cameraDistance = options.cameraDistance;
      this.spherical.radius = options.cameraDistance;
    }
    this.resetView();
    this.buildParts();
  }

  animate() {
    this.animationId = requestAnimationFrame(this.animate);

    // 1. Tự động xoay chậm khi rảnh
    if (this.options.autoRotate && !this.isUserInteracting && !this.isPointerDown) {
      this.spherical.theta += this.options.autoRotateSpeed;
      this.updateCameraPosition();
    }

    // 2. Nội suy bung tách (Explosion Animation mượt mà bằng lerp)
    if (Math.abs(this.explodeFactor - this.targetExplodeFactor) > 0.001) {
      this.explodeFactor += (this.targetExplodeFactor - this.explodeFactor) * 0.1;

      for (let i = 0; i < this.meshParts.length; i++) {
        const mesh = this.meshParts[i];
        const base = mesh.userData.basePosition;
        const offset = mesh.userData.explodeOffset;

        mesh.position.x = base.x + offset.x * this.explodeFactor;
        mesh.position.y = base.y + offset.y * this.explodeFactor;
        mesh.position.z = base.z + offset.z * this.explodeFactor;
      }
    }

    this.renderer.render(this.scene, this.camera);
  }

  // Giải phóng toàn bộ bộ nhớ và tài nguyên khi chuyển trang
  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }

    clearTimeout(this.idleTimer);

    // Gỡ các sự kiện
    window.removeEventListener('mousemove', this.onPointerMove);
    window.removeEventListener('mouseup', this.onPointerUp);
    window.removeEventListener('touchmove', this.onPointerMove);
    window.removeEventListener('touchend', this.onPointerUp);
    window.removeEventListener('resize', this.onResize);

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }

    // Dispose Geometries và Materials
    this.meshParts.forEach(mesh => {
      if (mesh.geometry) mesh.geometry.dispose();
      if (mesh.material) {
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach(m => m.dispose());
        } else {
          mesh.material.dispose();
        }
      }
    });
    this.meshParts = [];

    if (this.renderer) {
      this.renderer.dispose();
      if (this.renderer.domElement && this.renderer.domElement.parentNode) {
        this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
      }
    }

    this.scene = null;
    this.camera = null;
    this.renderer = null;
  }
}

window.ToyBrickViewer3D = ToyBrickViewer3D;
