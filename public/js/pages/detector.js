/**
 * Trang Công Cụ Nhận Diện Hộp Đồ Chơi Trực Tuyến (Toy Box Searcher AI)
 * Nhúng ứng dụng Streamlit qua iframe với cơ chế Lazy Loading & Persistent DOM
 * Lớp phủ Skeleton + Spinner chuyên nghiệp hiển thị "Đang tải công cụ tìm kiếm..."
 */
const DetectorPage = {
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
    if (!DetectorPage.isInitialized) {
      DetectorPage.isLoading = true;

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

        <!-- KHUNG CHỨA IFRAME VỚI TAILWIND CSS ĐỒNG BỘ GIAO DIỆN:
             w-full h-[85vh] rounded-xl overflow-hidden shadow-md border-0 -->
        <div class="relative w-full h-[85vh] rounded-xl overflow-hidden shadow-md border-0 bg-[#0e1117] glass-panel">
          
          <!-- LỚP PHỦ SKELETON & SPINNER CHUYÊN NGHIỆP TRONG KHI IFRAME ĐANG TẢI -->
          <div id="detector-loading-overlay" class="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/95 backdrop-blur-md transition-opacity duration-500 p-6">
            
            <!-- Skeleton Layout mô phỏng cấu trúc giao diện phía sau -->
            <div class="absolute inset-x-6 sm:inset-x-12 top-8 bottom-8 pointer-events-none opacity-20 flex flex-col space-y-6">
              <div class="h-10 w-1/3 rounded-xl skeleton"></div>
              <div class="h-4 w-2/3 rounded-lg skeleton"></div>
              <div class="flex-1 rounded-2xl border-2 border-dashed border-slate-700 skeleton flex items-center justify-center"></div>
              <div class="grid grid-cols-3 gap-4 h-24">
                <div class="rounded-xl skeleton"></div>
                <div class="rounded-xl skeleton"></div>
                <div class="rounded-xl skeleton"></div>
              </div>
            </div>

            <!-- Vòng xoay Loading Spinner Celestial cùng dòng chữ theo yêu cầu -->
            <div class="relative z-30 flex flex-col items-center text-center max-w-md px-6 py-8 rounded-3xl bg-slate-900/80 border border-amber-500/30 shadow-2xl backdrop-blur-xl">
              
              <!-- Spinner vòng xoay ánh kim đa tầng -->
              <div class="relative w-16 h-16 sm:w-20 sm:h-20 mb-5 flex items-center justify-center">
                <div class="absolute inset-0 border-4 border-amber-500/20 rounded-full"></div>
                <div class="absolute inset-0 border-4 border-amber-400 border-t-transparent rounded-full animate-spin shadow-lg shadow-amber-500/20"></div>
                <div class="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center border border-amber-500/40">
                  <i class="fa-solid fa-cube text-amber-400 text-sm animate-pulse"></i>
                </div>
              </div>

              <!-- Dòng chữ chính xác theo yêu cầu -->
              <h3 class="text-base sm:text-lg font-bold font-heading text-slate-100 tracking-wide flex items-center justify-center space-x-2">
                <span>Đang tải công cụ tìm kiếm...</span>
              </h3>

              <p class="text-xs sm:text-sm text-slate-400 font-lora mt-2 leading-relaxed">
                Đang khởi tạo máy chủ AI Streamlit và thiết lập không gian nhận diện hình ảnh
              </p>

              <!-- Thanh tiến độ tải hiệu ứng sóng ánh sáng -->
              <div class="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mt-5 relative">
                <div class="h-full bg-gradient-to-r from-amber-500 via-yellow-300 to-amber-500 rounded-full animate-pulse w-3/4"></div>
              </div>

              <span class="text-[11px] text-amber-400/80 font-mono mt-3">
                toy-box-searcher.streamlit.app
              </span>
            </div>

          </div>

          <!-- THẺ <iframe> NHÚNG ỨNG DỤNG STREAMLIT -->
          <iframe
            id="toy-box-detector-iframe"
            src="https://toy-box-searcher.streamlit.app/?embedded=true"
            class="w-full h-[85vh] rounded-xl overflow-hidden shadow-md border-0 bg-[#0e1117]"
            allow="camera; microphone; clipboard-read; clipboard-write;"
            title="Công cụ nhận diện hộp đồ chơi trực tuyến"
          ></iframe>

        </div>
      `;

      const iframe = document.getElementById('toy-box-detector-iframe');
      const loadingOverlay = document.getElementById('detector-loading-overlay');

      const hideLoadingOverlay = () => {
        DetectorPage.isLoading = false;
        if (loadingOverlay && !loadingOverlay.classList.contains('hidden')) {
          loadingOverlay.style.opacity = '0';
          setTimeout(() => {
            loadingOverlay.classList.add('hidden');
          }, 500);
        }
      };

      if (iframe) {
        // Tự động ẩn loading overlay khi sự kiện onLoad kích hoạt
        iframe.addEventListener('load', hideLoadingOverlay);

        // Đảm bảo ẩn overlay sau tối đa 12 giây nếu mạng người dùng chập chờn
        setTimeout(hideLoadingOverlay, 12000);
      }

      DetectorPage.isInitialized = true;
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

window.DetectorPage = DetectorPage;
window.QRPage = DetectorPage; // Giữ alias tương thích
