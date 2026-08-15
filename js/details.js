
// ============================================
// details.js
// إدارة نافذة تفاصيل اليوم
// ============================================

document.addEventListener("DOMContentLoaded", function () {

    var detailsModal =
        document.getElementById("detailsModal");

    var closeDetails =
        document.getElementById("closeDetails");

    if (!detailsModal) {

        console.warn(
            "لم يتم العثور على #detailsModal"
        );

        return;
    }

    // زر الإغلاق
    if (closeDetails) {

        closeDetails.addEventListener(
            "click",
            function () {

                closeDetailsModal();

            }
        );

    }

    // الضغط خارج النافذة
    detailsModal.addEventListener(
        "click",
        function (event) {

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

    var modal =
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

    var modal =
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
