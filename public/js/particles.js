/**
 * Celestial Ambient Canvas Particles
 * Hệ thống hạt bụi tinh vân thiên giới và sao băng chuyển động phía nền
 */
(function () {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let animationFrameId = null;
  let width = 0;
  let height = 0;
  let dpr = window.devicePixelRatio || 1;

  // Kiểm tra giảm chuyển động
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    canvas.style.display = 'none';
    return;
  }

  // Cấu hình số lượng hạt
  const isMobile = window.innerWidth < 768;
  const particleCount = isMobile ? 40 : 110;

  const particles = [];
  const shootingStars = [];

  // Tọa độ chuột
  const mouse = {
    x: -9999,
    y: -9999,
    radius: isMobile ? 80 : 150
  };

  class Particle {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      this.x = Math.random() * width;
      this.y = initial ? Math.random() * height : height + 10;
      this.baseRadius = Math.random() * 1.8 + 0.6;
      this.radius = this.baseRadius;
      this.vx = (Math.random() - 0.5) * 0.35;
      this.vy = -(Math.random() * 0.45 + 0.15); // Bay nhẹ lên trên
      this.alpha = Math.random() * 0.6 + 0.2;
      this.pulseSpeed = Math.random() * 0.03 + 0.01;
      this.pulseOffset = Math.random() * Math.PI * 2;

      // Màu sắc: Vàng kim hoàng gia hoặc Cyan tinh vân
      const isGold = Math.random() > 0.35;
      this.color = isGold
        ? { r: 245, g: 158, b: 11 }   // Amber / Gold
        : { r: 56, g: 189, b: 248 };  // Cyan Nebula
    }

    update(time) {
      this.x += this.vx;
      this.y += this.vy;

      // Nhấp nháy nhẹ theo hàm sin
      const pulse = Math.sin(time * this.pulseSpeed + this.pulseOffset);
      this.currentAlpha = Math.max(0.1, this.alpha + pulse * 0.25);

      // Tương tác nhẹ với con trỏ chuột (đẩy nhẹ)
      const dx = mouse.x - this.x;
      const dy = mouse.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < mouse.radius && dist > 0) {
        const force = (1 - dist / mouse.radius) * 1.5;
        this.x -= (dx / dist) * force;
        this.y -= (dy / dist) * force;
      }

      // Tái sinh hạt khi ra ngoài màn hình
      if (this.y < -20 || this.x < -20 || this.x > width + 20) {
        this.reset(false);
      }
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.currentAlpha})`;
      ctx.shadowBlur = this.radius * 4;
      ctx.shadowColor = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 0.8)`;
      ctx.fill();
    }
  }

  class ShootingStar {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * width * 1.2;
      this.y = Math.random() * (height * 0.4);
      this.len = Math.random() * 120 + 80;
      this.speed = Math.random() * 10 + 12;
      this.size = Math.random() * 1.5 + 0.8;
      this.angle = (Math.PI / 4) + (Math.random() - 0.5) * 0.2; // Chéo góc ~45 độ
      this.vx = Math.cos(this.angle) * this.speed;
      this.vy = Math.sin(this.angle) * this.speed;
      this.active = false;
      this.alpha = 1;
    }

    trigger() {
      this.reset();
      this.active = true;
    }

    update() {
      if (!this.active) return;
      this.x += this.vx;
      this.y += this.vy;
      this.alpha -= 0.02;
      if (this.alpha <= 0 || this.x > width + 100 || this.y > height + 100) {
        this.active = false;
      }
    }

    draw() {
      if (!this.active) return;
      ctx.save();
      ctx.strokeStyle = `rgba(254, 240, 138, ${this.alpha})`;
      ctx.lineWidth = this.size;
      ctx.lineCap = 'round';
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#facc15';

      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(this.x - Math.cos(this.angle) * this.len, this.y - Math.sin(this.angle) * this.len);
      ctx.stroke();
      ctx.restore();
    }
  }

  function resize() {
    dpr = window.devicePixelRatio || 1;
    width = window.innerWidth;
    height = window.innerHeight;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';

    ctx.scale(dpr, dpr);
  }

  function init() {
    resize();
    particles.length = 0;
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }
    // Chuẩn bị 2 sao băng
    shootingStars.push(new ShootingStar());
    shootingStars.push(new ShootingStar());
  }

  let lastShootingStarTime = 0;
  let globalTick = 0;

  function loop(time) {
    globalTick++;
    ctx.clearRect(0, 0, width, height);

    // Vẽ và cập nhật các hạt
    for (let i = 0; i < particles.length; i++) {
      particles[i].update(globalTick);
      particles[i].draw();
    }

    // Thỉnh thoảng kích hoạt sao băng (mỗi 4 - 8 giây)
    if (time - lastShootingStarTime > 4500 && Math.random() < 0.015) {
      const freeStar = shootingStars.find(s => !s.active);
      if (freeStar) {
        freeStar.trigger();
        lastShootingStarTime = time;
      }
    }

    for (let i = 0; i < shootingStars.length; i++) {
      shootingStars[i].update();
      shootingStars[i].draw();
    }

    animationFrameId = requestAnimationFrame(loop);
  }

  // Lắng nghe di chuyển chuột
  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  }, { passive: true });

  window.addEventListener('mouseleave', () => {
    mouse.x = -9999;
    mouse.y = -9999;
  });

  window.addEventListener('resize', () => {
    resize();
  });

  // Tạm dừng khi tab bị ẩn để tiết kiệm pin
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
    } else {
      if (!animationFrameId) {
        animationFrameId = requestAnimationFrame(loop);
      }
    }
  });

  // Khởi động
  init();
  animationFrameId = requestAnimationFrame(loop);
})();
