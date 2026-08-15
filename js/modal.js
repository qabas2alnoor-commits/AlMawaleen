// ============================================
// modal.js
// إدارة نافذة "حول التطبيق"
// ============================================

document.addEventListener("DOMContentLoaded", function () {

    const aboutBtn = document.getElementById("aboutBtn");
    const aboutModal = document.getElementById("aboutModal");
    const closeAbout = document.getElementById("closeAbout");

    if (!aboutBtn || !aboutModal) {
        console.warn("نافذة حول التطبيق غير موجودة");
        return;
    }

    // فتح النافذة
    aboutBtn.addEventListener("click", function () {
        aboutModal.classList.add("show");
    });

    // إغلاق النافذة
    if (closeAbout) {
        closeAbout.addEventListener("click", function () {
            aboutModal.classList.remove("show");
        });
    }

    // إغلاق عند الضغط خارج النافذة
    aboutModal.addEventListener("click", function (event) {

        if (event.target === aboutModal) {
            aboutModal.classList.remove("show");
        }

    });

});