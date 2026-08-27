// ============================================
// PWA INSTALL
// زر تثبيت تطبيق مواقيت الموالين
// ============================================

let deferredInstallPrompt = null;


// ============================================
// التحقق من نسخة Capacitor Android
// ============================================

function isAndroidApp() {

    return (
        window.Capacitor &&
        typeof window.Capacitor.isNativePlatform === "function" &&
        window.Capacitor.isNativePlatform() &&
        typeof window.Capacitor.getPlatform === "function" &&
        window.Capacitor.getPlatform() === "android"
    );

}


// ============================================
// الحصول على زر التثبيت
// ============================================

function getInstallAppButton() {

    return document.getElementById(
        "installAppBtn"
    );

}


// ============================================
// إخفاء زر التثبيت داخل تطبيق Android
// ============================================

function hideInstallButtonForAndroid() {

    const installAppBtn =
        getInstallAppButton();

    if (
        isAndroidApp() &&
        installAppBtn
    ) {

        installAppBtn.style.display =
            "none";

    }

}


// ============================================
// استقبال طلب التثبيت من المتصفح
// ============================================

window.addEventListener(
    "beforeinstallprompt",
    (event) => {

        // منع Chrome من إظهار نافذة التثبيت تلقائيًا
        event.preventDefault();

        // حفظ الطلب لاستخدامه عند الضغط على الزر
        deferredInstallPrompt = event;

        console.log(
            "PWA: التثبيت المباشر متاح"
        );

    }
);


// ============================================
// الضغط على زر التثبيت
// ============================================

function setupInstallButton() {

    const installAppBtn =
        getInstallAppButton();

    if (!installAppBtn) {

        console.warn(
            "PWA: لم يتم العثور على زر التثبيت #installAppBtn"
        );

        return;

    }


    // ----------------------------------------
    // داخل تطبيق Android
    // ----------------------------------------

    if (isAndroidApp()) {

        installAppBtn.style.display =
            "none";

        return;

    }


    // ----------------------------------------
    // منع تكرار إضافة الحدث
    // ----------------------------------------

    if (
        installAppBtn.dataset.installReady ===
        "true"
    ) {

        return;

    }

    installAppBtn.dataset.installReady =
        "true";


    // ----------------------------------------
    // الضغط على الزر
    // ----------------------------------------

    installAppBtn.addEventListener(
        "click",
        async () => {

            // ====================================
            // التثبيت المباشر متاح
            // ====================================

            if (deferredInstallPrompt) {

                const installPrompt =
                    deferredInstallPrompt;

                // نزيل الطلب المحفوظ
                deferredInstallPrompt =
                    null;

                try {

                    // إظهار نافذة التثبيت
                    installPrompt.prompt();

                    const { outcome } =
                        await installPrompt.userChoice;

                    console.log(
                        "PWA install:",
                        outcome
                    );


                    // --------------------------------
                    // تم قبول التثبيت
                    // --------------------------------

                    if (
                        outcome === "accepted"
                    ) {

                        installAppBtn.style.display =
                            "none";

                    }

                } catch (error) {

                    console.error(
                        "PWA: خطأ أثناء التثبيت:",
                        error
                    );

                }

                return;

            }


            // ====================================
            // التثبيت المباشر غير متاح
            // ====================================

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

    if (!modal) {

        console.warn(
            "PWA: لم يتم العثور على نافذة تعليمات التثبيت"
        );

        return;

    }

    modal.style.display =
        "flex";

}


// ============================================
// إغلاق تعليمات التثبيت
// ============================================

function closeInstallInstructions() {

    const modal =
        document.getElementById(
            "installInstructionsModal"
        );

    if (!modal) {
        return;
    }

    modal.style.display =
        "none";

}


// ============================================
// الضغط خارج نافذة التعليمات
// ============================================

function setupInstallModal() {

    const modal =
        document.getElementById(
            "installInstructionsModal"
        );

    if (!modal) {
        return;
    }

    if (
        modal.dataset.installModalReady ===
        "true"
    ) {

        return;

    }

    modal.dataset.installModalReady =
        "true";


    modal.addEventListener(
        "click",
        (event) => {

            if (
                event.target === modal
            ) {

                closeInstallInstructions();

            }

        }
    );

}


// ============================================
// عند اكتمال تثبيت التطبيق
// ============================================

window.addEventListener(
    "appinstalled",
    () => {

        console.log(
            "PWA: تم تثبيت التطبيق بنجاح"
        );

        deferredInstallPrompt =
            null;

        const installAppBtn =
            getInstallAppButton();

        if (installAppBtn) {

            installAppBtn.style.display =
                "none";

        }

    }
);


// ============================================
// تشغيل الملف بعد تحميل HTML
// ============================================

function initializePWAInstall() {

    hideInstallButtonForAndroid();

    setupInstallButton();

    setupInstallModal();

}


// ============================================
// تشغيل عند تحميل الصفحة
// ============================================

if (
    document.readyState === "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializePWAInstall
    );

} else {

    initializePWAInstall();

}


// ============================================
// الدوال العامة
// ============================================

window.showInstallInstructions =
    showInstallInstructions;

window.closeInstallInstructions =
    closeInstallInstructions;