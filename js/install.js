// ============================================
// PWA INSTALL
// زر تثبيت تطبيق مواقيت الموالين
// ============================================

let deferredInstallPrompt = null;

const installAppBtn =
    document.getElementById("installAppBtn");


// ============================================
// استقبال طلب التثبيت من المتصفح
// ============================================

window.addEventListener(
    "beforeinstallprompt",
    (event) => {

        event.preventDefault();

        deferredInstallPrompt = event;

        console.log(
            "PWA: التثبيت المباشر متاح"
        );
    }
);


// ============================================
// الضغط على زر التثبيت
// ============================================

if (installAppBtn) {

    installAppBtn.addEventListener(
        "click",
        async () => {

            // ========================================
            // التثبيت المباشر متاح
            // ========================================

            if (deferredInstallPrompt) {

                deferredInstallPrompt.prompt();

                const { outcome } =
                    await deferredInstallPrompt.userChoice;

                console.log(
                    "PWA install:",
                    outcome
                );

                deferredInstallPrompt = null;

                if (
                    outcome === "accepted"
                ) {

                    installAppBtn.style.display =
                        "none";

                }

                return;
            }


            // ========================================
            // التثبيت المباشر غير متاح
            // ========================================

            showInstallInstructions();

        }
    );

}


// ============================================
// عرض تعليمات التثبيت
// ============================================

function showInstallInstructions() {

    const modal =
        document.getElementById(
            "installInstructionsModal"
        );

    if (modal) {

        modal.style.display =
            "flex";

    }

}


// ============================================
// إغلاق تعليمات التثبيت
// ============================================

function closeInstallInstructions() {

    const modal =
        document.getElementById(
            "installInstructionsModal"
        );

    if (modal) {

        modal.style.display =
            "none";

    }

}


// ============================================
// الضغط خارج النافذة
// ============================================

document.addEventListener(
    "click",
    (event) => {

        const modal =
            document.getElementById(
                "installInstructionsModal"
            );

        if (
            modal &&
            event.target === modal
        ) {

            closeInstallInstructions();

        }

    }
);


// ============================================
// عند اكتمال تثبيت التطبيق
// ============================================

window.addEventListener(
    "appinstalled",
    () => {

        console.log(
            "PWA: تم تثبيت التطبيق بنجاح"
        );

        deferredInstallPrompt = null;

        if (installAppBtn) {

            installAppBtn.style.display =
                "none";

        }

    }
);


// ============================================
// الدوال العامة
// ============================================

window.showInstallInstructions =
    showInstallInstructions;

window.closeInstallInstructions =
    closeInstallInstructions;