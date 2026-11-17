/**
 * Trang Công Cụ Nhận Diện Hộp Đồ Chơi Trực Tuyến (Toy Box Searcher AI)
 * Nhúng ứng dụng Streamlit qua iframe với cơ chế Lazy Loading & Persistent DOM
 * Tự động quản lý state isLoading và loading spinner trong khi iframe tải
 */
const QRPage = {
  isInitialized: false,
  isLoading: true,

  render: async (container) => {
    const pageContent = document.getElementById('page-content');
    let detectorSection = document.getElementById('box-detector-page');

    // Tạo container nếu chưa tồn tại trong DOM
    if (!detectorSection) {
      detectorSection = document.createElement('section');
      detectorSection.id = 'box-detector-page';
      detectorSection.className = 'flex-1 w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-4 sm:py-6';
      if (pageContent && pageContent.parentNode) {
        pageContent.parentNode.insertBefore(detectorSection, pageContent.nextSibling);
      } else {
        document.body.appendChild(detectorSection);
      }
    }

    // Ẩn vùng page-content chung và hiển thị khung nhận diện
    if (pageContent) pageContent.classList.add('hidden');
    detectorSection.classList.remove('hidden');

    // TỐI ƯU HIỆU NĂNG (LAZY LOADING):
    // Chỉ render thẻ <iframe> khi người dùng mở mục/tab này lên lần đầu tiên.
    // Sau lần mở đầu tiên, giữ trạng thái DOM để chuyển tab không bị load lại từ đầu.
    if (!QRPage.isInitialized) {
      QRPage.isLoading = true;

      detectorSection.innerHTML = `
        <div class="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div class="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold mb-2 shadow-sm">
              <i class="fa-solid fa-cube"></i>
              <span>CÔNG CỤ NHẬN DIỆN THÔNG MINH</span>
            </div>
            <h1 class="text-2xl sm:text-3xl font-extrabold font-heading text-slate-100">
              Nhận Diện Hộp <span class="text-amber-400">Đồ Chơi Trực Tuyến</span>
            </h1>
            <p class="text-xs sm:text-sm text-slate-400 font-lora mt-1">
              Ứng dụng AI phân tích hình ảnh và nhận diện chính xác vỏ hộp mô hình trong nháy mắt
            </p>
          </div>
          <div class="flex items-center space-x-2 self-start sm:self-auto">
            <span class="px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-xs font-mono text-slate-300 flex items-center space-x-1.5 shadow-inner">
              <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>AI Cloud Live</span>
            </span>
          </div>
        </div>

        <!-- KHUNG CHỨA IFRAME VỚI TAILWIND CSS ĐỒNG BỘ GIAO DIỆN -->
        <div class="relative w-full h-[85vh] rounded-xl overflow-hidden shadow-md border-0 bg-slate-900/80 glass-panel">
          
          <!-- TRẠNG THÁI TẢI TRANG (LOADING SPINNER) -->
          <div id="detector-loading-overlay" class="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/85 backdrop-blur-md z-20 transition-opacity duration-300">
            <div class="w-12 h-12 sm:w-14 sm:h-14 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mb-4 shadow-xl shadow-amber-400/20"></div>
            <p class="text-slate-100 text-sm sm:text-base font-medium tracking-wide flex items-center space-x-2">
              <i class="fa-solid fa-wand-magic-sparkles text-amber-400"></i>
              <span>Đang khởi động công cụ nhận diện...</span>
            </p>
            <p class="text-xs text-slate-400 mt-2 font-lora">Đang kết nối tới máy chủ AI và nạp giao diện phân tích vỏ hộp</p>
          </div>

          <!-- THẺ <iframe> NHÚNG ỨNG DỤNG STREAMLIT -->
          <iframe
            id="toy-box-detector-iframe"
            src="https://toy-box-searcher.streamlit.app/?embedded=true"
            class="w-full h-[85vh] rounded-xl overflow-hidden shadow-md border-0"
            allow="camera; microphone; clipboard-read; clipboard-write;"
            title="Công cụ nhận diện hộp đồ chơi trực tuyến"
          ></iframe>

        </div>
      `;

      const iframe = document.getElementById('toy-box-detector-iframe');
      const loadingOverlay = document.getElementById('detector-loading-overlay');

      if (iframe) {
        // Tự động ẩn loading spinner khi sự kiện onLoad của iframe kích hoạt
        iframe.addEventListener('load', () => {
          QRPage.isLoading = false;
          if (loadingOverlay) {
            loadingOverlay.style.opacity = '0';
            setTimeout(() => {
              loadingOverlay.classList.add('hidden');
            }, 300);
          }
        });
      }

      QRPage.isInitialized = true;
    }
  },

  destroy: () => {
    // Tối ưu hiệu năng: Khi rời tab, chỉ ẩn hidden khung chứa
    // để giữ trạng thái ứng dụng đang chạy, không bị reload từ đầu khi quay lại
    const detectorSection = document.getElementById('box-detector-page');
    const pageContent = document.getElementById('page-content');
    if (detectorSection) {
      detectorSection.classList.add('hidden');
    }
    if (pageContent) {
      pageContent.classList.remove('hidden');
    }
  }
};

window.QRPage = QRPage;
