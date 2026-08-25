// ============================================
// details.js
// إدارة نافذة تفاصيل اليوم
// مواقيت الموالين
// ============================================

document.addEventListener("DOMContentLoaded", () => {

    const detailsModal =
        document.getElementById("detailsModal");

    const closeDetails =
        document.getElementById("closeDetails");

    if (!detailsModal) {

        console.warn(
            "Details: لم يتم العثور على #detailsModal"
        );

        return;
    }

    // ========================================
    // زر الإغلاق
    // ========================================

    if (closeDetails) {

        closeDetails.addEventListener(
            "click",
            closeDetailsModal
        );

    }

    // ========================================
    // الضغط خارج محتوى النافذة
    // ========================================

    detailsModal.addEventListener(
        "click",
        event => {

            if (event.target === detailsModal) {

                closeDetailsModal();

            }

        }
    );

});


// ============================================
// إغلاق نافذة التفاصيل
// ============================================

function closeDetailsModal() {

    const modal =
        document.getElementById("detailsModal");

    if (!modal) {
        return;
    }

    modal.style.display = "none";

}


// ============================================
// فتح نافذة التفاصيل
// ============================================

function showDetailsModal() {

    const modal =
        document.getElementById("detailsModal");

    if (!modal) {
        return;
    }

    modal.style.display = "flex";

}


// ============================================
// إتاحة الدوال عالميًا
// ============================================

window.closeDetailsModal =
    closeDetailsModal;

window.showDetailsModal =
    showDetailsModal;