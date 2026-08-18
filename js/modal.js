// ============================================
// modal.js
// إدارة نوافذ التطبيق
// مواقيت الولاء
// ============================================

document.addEventListener(
    "DOMContentLoaded",
    initializeModals
);


// ============================================
// تهيئة جميع النوافذ
// ============================================

function initializeModals() {

    setupAboutModal();

    setupDetailsModal();

    setupEventModal();

    setupEscapeKey();

}


// ============================================
// نافذة حول التطبيق
// ============================================

function setupAboutModal() {

    const aboutButton =
        document.getElementById(
            "aboutBtn"
        );

    const aboutModal =
        document.getElementById(
            "aboutModal"
        );

    const closeButton =
        document.getElementById(
            "closeAbout"
        );

    if (
        !aboutButton ||
        !aboutModal
    ) {

        return;

    }


    aboutButton.addEventListener(
        "click",
        () => {

            aboutModal.classList.add(
                "show"
            );

        }
    );


    if (closeButton) {

        closeButton.addEventListener(
            "click",
            () => {

                closeAboutModal();

            }
        );

    }


    aboutModal.addEventListener(
        "click",
        event => {

            if (
                event.target === aboutModal
            ) {

                closeAboutModal();

            }

        }
    );

}


// ============================================
// إغلاق نافذة حول التطبيق
// ============================================

function closeAboutModal() {

    const modal =
        document.getElementById(
            "aboutModal"
        );

    if (!modal) {

        return;

    }

    modal.classList.remove(
        "show"
    );

}


// ============================================
// نافذة تفاصيل اليوم
// ============================================

function setupDetailsModal() {

    const modal =
        document.getElementById(
            "detailsModal"
        );

    const closeButton =
        document.getElementById(
            "closeDetails"
        );

    if (!modal) {

        return;

    }


    if (closeButton) {

        closeButton.addEventListener(
            "click",
            closeDetailsModal
        );

    }


    modal.addEventListener(
        "click",
        event => {

            if (
                event.target === modal
            ) {

                closeDetailsModal();

            }

        }
    );

}


// ============================================
// إغلاق تفاصيل اليوم
// ============================================

function closeDetailsModal() {

    const modal =
        document.getElementById(
            "detailsModal"
        );

    if (!modal) {

        return;

    }

    modal.style.display =
        "none";

}


// ============================================
// نافذة إضافة / تعديل المناسبة
// ============================================

function setupEventModal() {

    const modal =
        document.getElementById(
            "eventModal"
        );

    const closeButton =
        document.getElementById(
            "closeModal"
        );

    if (!modal) {

        return;

    }


    if (closeButton) {

        closeButton.addEventListener(
            "click",
            closeEventModal
        );

    }


    modal.addEventListener(
        "click",
        event => {

            if (
                event.target === modal
            ) {

                closeEventModal();

            }

        }
    );

}


// ============================================
// إغلاق نافذة المناسبة
// ============================================

function closeEventModal() {

    const modal =
        document.getElementById(
            "eventModal"
        );

    if (!modal) {

        return;

    }

    modal.style.display =
        "none";

}


// ============================================
// ESC لإغلاق النوافذ
// ============================================

function setupEscapeKey() {

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key !== "Escape"
            ) {

                return;

            }

            closeAboutModal();

            closeDetailsModal();

            closeEventModal();

        }
    );

}


// ============================================
// الدوال العامة
// ============================================

window.closeAboutModal =
    closeAboutModal;

window.closeDetailsModal =
    closeDetailsModal;

window.closeEventModal =
    closeEventModal;