/**
 * Trang Quét & Tra Cứu Mã QR (O2O Scanner)
 * Hỗ trợ nhập mã tra cứu nhanh hoặc bật camera quét trực tiếp (BarcodeDetector API)
 */
const QRPage = {
  videoStream: null,
  scanInterval: null,

  render: async (container) => {
    container.innerHTML = `
      <div class="max-w-3xl mx-auto mb-12 text-center">
        <div class="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs font-semibold mb-3">
          <i class="fa-solid fa-qrcode"></i>
          <span>TRẢI NGHIỆM TẠI SHOWROOM (O2O)</span>
        </div>
        <h1 class="text-3xl sm:text-4xl font-extrabold font-heading text-slate-100">Tra Cứu & Quét Mã <span class="text-sky-400">QR 3D</span></h1>
        <p class="text-sm text-slate-400 font-lora mt-2 max-w-xl mx-auto">
          Nhập mã QR/SKU in trên vỏ hộp hoặc bật Camera quét trực tiếp để mở ngay mô hình 3D tương tác.
        </p>
      </div>

      <div class="max-w-2xl mx-auto space-y-8">

        <!-- KHUNG QUÉT CAMERA HOẶC NHẬP TAY -->
        <div class="glass-panel rounded-3xl p-6 sm:p-8 border border-sky-500/30 shadow-2xl relative">

          <!-- Vùng Camera Quét -->
          <div id="camera-scanner-wrapper" class="hidden mb-6">
            <div class="relative w-full h-64 sm:h-80 rounded-2xl bg-black overflow-hidden border-2 border-sky-400">
              <video id="qr-video" class="w-full h-full object-cover" playsinline autoplay muted></video>

              <!-- Khung viền ngắm quét QR -->
              <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div class="w-48 h-48 border-2 border-amber-400 rounded-2xl relative animate-pulse shadow-lg shadow-amber-400/20">
                  <div class="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-amber-400 -mt-1 -ml-1"></div>
                  <div class="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-amber-400 -mt-1 -mr-1"></div>
                  <div class="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-amber-400 -mb-1 -ml-1"></div>
                  <div class="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-amber-400 -mb-1 -mr-1"></div>
                </div>
              </div>

              <!-- Nút tắt camera -->
              <button id="close-camera-btn" class="absolute top-3 right-3 px-3 py-1.5 rounded-xl bg-slate-900/80 text-white text-xs hover:bg-rose-600 transition flex items-center space-x-1.5">
                <i class="fa-solid fa-video-slash"></i>
                <span>Tắt Camera</span>
              </button>
            </div>
            <p class="text-xs text-center text-slate-400 mt-2">Đưa mã QR trên vỏ hộp vào giữa khung ngắm</p>
          </div>

          <!-- Nút kích hoạt Camera -->
          <div class="mb-6 flex justify-center">
            <button id="start-camera-btn" class="px-5 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 text-slate-950 font-bold text-xs tracking-wide shadow-lg shadow-sky-500/25 transition flex items-center space-x-2">
              <i class="fa-solid fa-camera text-sm"></i>
              <span>Bật Camera Quét Mã QR</span>
            </button>
          </div>

          <div class="flex items-center my-6">
            <div class="flex-1 border-t border-slate-700/60"></div>
            <span class="px-4 text-xs font-semibold text-slate-400 uppercase tracking-widest">HOẶC NHẬP MÃ TAY</span>
            <div class="flex-1 border-t border-slate-700/60"></div>
          </div>

          <!-- Form Tra cứu mã bằng tay -->
          <form id="qr-lookup-form" class="space-y-4">
            <div>
              <label class="block text-xs font-semibold text-slate-300 mb-1.5">Mã QR hoặc Mã SKU sản phẩm</label>
              <div class="flex space-x-2">
                <input type="text" id="qr-input" required class="flex-1 px-4 py-3 bg-slate-900/90 border border-slate-700 rounded-xl text-slate-100 text-sm font-mono focus:outline-none focus:border-amber-400 transition" placeholder="Ví dụ: TOYBRICK-F1-2026 hoặc TECH-F1-1639">
                <button type="submit" class="px-6 py-3 rounded-xl btn-gold text-slate-950 font-bold text-xs transition flex items-center space-x-1.5">
                  <i class="fa-solid fa-magnifying-glass"></i>
                  <span>Tra cứu</span>
                </button>
              </div>
            </div>

            <!-- Gợi ý mã mẫu -->
            <div class="text-xs text-slate-400 flex flex-wrap items-center gap-2 pt-1">
              <span>Mã mẫu tại showroom:</span>
              <button type="button" class="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 font-mono" onclick="document.getElementById('qr-input').value='TOYBRICK-F1-2026'">TOYBRICK-F1-2026</button>
              <button type="button" class="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 font-mono" onclick="document.getElementById('qr-input').value='TOYBRICK-SPACE-ORB'">TOYBRICK-SPACE-ORB</button>
              <button type="button" class="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 font-mono" onclick="document.getElementById('qr-input').value='TOYBRICK-CLOCK-TOWER'">TOYBRICK-CLOCK-TOWER</button>
            </div>
          </form>

        </div>

        <!-- KẾT QUẢ TRA CỨU -->
        <div id="qr-result-container"></div>

      </div>
    `;

    QRPage.bindEvents();
  },

  bindEvents: () => {
    const form = document.getElementById('qr-lookup-form');
    const input = document.getElementById('qr-input');
    const startCamBtn = document.getElementById('start-camera-btn');
    const closeCamBtn = document.getElementById('close-camera-btn');

    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const code = input.value.trim();
        if (code) {
          await QRPage.lookupCode(code);
        }
      });
    }

    if (startCamBtn) {
      startCamBtn.addEventListener('click', () => {
        QRPage.startCamera();
      });
    }

    if (closeCamBtn) {
      closeCamBtn.addEventListener('click', () => {
        QRPage.stopCamera();
      });
    }
  },

  lookupCode: async (code) => {
    const resultContainer = document.getElementById('qr-result-container');
    if (!resultContainer) return;

    resultContainer.innerHTML = `
      <div class="py-8 flex justify-center items-center">
        <div class="w-8 h-8 border-4 border-sky-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    `;

    try {
      const res = await API.products.getByQr(code);
      if (!res.success || !res.data) {
        resultContainer.innerHTML = UI.renderEmptyState(
          'fa-qrcode',
          'Không tìm thấy sản phẩm',
          `Không có sản phẩm nào khớp với mã "${code}". Vui lòng kiểm tra lại vỏ hộp!`
        );
        return;
      }

      const p = res.data;
      const isSale = p.salePrice && p.salePrice < p.price;
      const displayPrice = isSale ? p.salePrice : p.price;
      const mainImg = (p.images && p.images[0]) || 'https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?auto=format&fit=crop&w=600&q=80';

      resultContainer.innerHTML = `
        <div class="glass-panel rounded-3xl p-6 sm:p-8 border-2 border-emerald-500/40 shadow-2xl space-y-6 animate-celestial">
          <div class="flex items-center space-x-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <i class="fa-solid fa-circle-check text-sm"></i>
            <span>ĐÃ NHẬN DIỆN THÀNH CÔNG SẢN PHẨM TẠI SHOWROOM</span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
            <div class="sm:col-span-4 rounded-2xl overflow-hidden bg-slate-950 h-44">
              <img src="${UI.escapeHTML(mainImg)}" alt="${UI.escapeHTML(p.name)}" class="w-full h-full object-cover">
            </div>

            <div class="sm:col-span-8 space-y-3">
              <span class="text-xs font-semibold text-amber-400 uppercase">${UI.escapeHTML(p.category)}</span>
              <h3 class="text-xl font-heading font-extrabold text-slate-100">${UI.escapeHTML(p.name)}</h3>
              <p class="text-xs text-slate-300 font-lora line-clamp-2">${UI.escapeHTML(p.description)}</p>

              <div class="flex items-center space-x-4 pt-2">
                <span class="text-xl font-extrabold text-amber-300 font-sans">${UI.formatCurrency(displayPrice)}</span>
                <span class="text-xs text-slate-400">${UI.escapeHTML(p.pieceCount)} mảnh ghép</span>
                <span class="text-xs text-emerald-400 font-medium">Còn ${p.stock} bộ tại kho</span>
              </div>
            </div>
          </div>

          <div class="pt-4 border-t border-slate-700/60 flex flex-wrap items-center justify-between gap-4">
            <div class="text-xs text-slate-400">
              Mã QR xác thực: <span class="text-amber-400 font-mono font-bold">${UI.escapeHTML(p.qrCode)}</span>
            </div>
            <a href="#/product/${UI.escapeHTML(p.slug)}" class="px-6 py-3 rounded-xl btn-gold text-slate-950 font-bold text-xs transition flex items-center space-x-2 shadow-xl">
              <span>Mở Trình Xem 3D & Chi Tiết</span>
              <i class="fa-solid fa-arrow-right text-xs"></i>
            </a>
          </div>
        </div>
      `;

    } catch (err) {
      resultContainer.innerHTML = UI.renderEmptyState('fa-triangle-exclamation', 'Không tìm thấy', err.message);
    }
  },

  startCamera: async () => {
    const wrapper = document.getElementById('camera-scanner-wrapper');
    const video = document.getElementById('qr-video');
    const startBtn = document.getElementById('start-camera-btn');

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      UI.toast('warning', 'Trình duyệt không hỗ trợ truy cập Camera');
      return;
    }

    try {
      QRPage.videoStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });

      if (video) {
        video.srcObject = QRPage.videoStream;
        await video.play();
      }

      if (wrapper) wrapper.classList.remove('hidden');
      if (startBtn) startBtn.classList.add('hidden');

      // Nếu hỗ trợ BarcodeDetector API
      if ('BarcodeDetector' in window) {
        const barcodeDetector = new window.BarcodeDetector({ formats: ['qr_code'] });
        QRPage.scanInterval = setInterval(async () => {
          try {
            if (video && video.readyState === video.HAVE_ENOUGH_DATA) {
              const barcodes = await barcodeDetector.detect(video);
              if (barcodes.length > 0) {
                const detectedCode = barcodes[0].rawValue;
                UI.toast('success', `Đã quét được mã: ${detectedCode}`);
                QRPage.stopCamera();
                const input = document.getElementById('qr-input');
                if (input) input.value = detectedCode;
                await QRPage.lookupCode(detectedCode);
              }
            }
          } catch (e) {
            // bỏ qua
          }
        }, 500);
      } else {
        UI.toast('info', 'Camera đã bật. Nếu trình duyệt chưa hỗ trợ giải mã trực tiếp, vui lòng nhập mã trên vỏ hộp.');
      }

    } catch (err) {
      UI.toast('error', `Không thể mở Camera: ${err.message}`);
    }
  },

  stopCamera: () => {
    if (QRPage.scanInterval) {
      clearInterval(QRPage.scanInterval);
      QRPage.scanInterval = null;
    }

    if (QRPage.videoStream) {
      QRPage.videoStream.getTracks().forEach(track => track.stop());
      QRPage.videoStream = null;
    }

    const wrapper = document.getElementById('camera-scanner-wrapper');
    const startBtn = document.getElementById('start-camera-btn');
    if (wrapper) wrapper.classList.add('hidden');
    if (startBtn) startBtn.classList.remove('hidden');
  },

  destroy: () => {
    QRPage.stopCamera();
  }
};

window.QRPage = QRPage;
