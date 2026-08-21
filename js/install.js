// ============================================
// PWA INSTALL
// زر تثبيت تطبيق مواقيت الولاء
// ============================================

let deferredInstallPrompt = null;

const installAppBtn =
    document.getElementById("installAppBtn");

// ============================================
// استقبال طلب التثبيت من المتصفح
// ============================================

window.addEventListener("beforeinstallprompt", (event) => {

    event.preventDefault();

    deferredInstallPrompt = event;

    console.log("PWA: التثبيت المباشر متاح");
});

// ============================================
// الضغط على زر التثبيت
// ============================================

if (installAppBtn) {

    installAppBtn.addEventListener("click", async () => {

        // ========================================
        // التثبيت المباشر متاح
        // ========================================

        if (deferredInstallPrompt) {

            deferredInstallPrompt.prompt();

            const { outcome } =
                await deferredInstallPrompt.userChoice;

            console.log("PWA install:", outcome);

            deferredInstallPrompt = null;

            if (outcome === "accepted") {
                installAppBtn.style.display = "none";
            }

            return;
        }

        // ========================================
        // التثبيت المباشر غير متاح
        // ========================================

        alert(
            "📲 لتثبيت تطبيق مواقيت الولاء:\n\n" +
            "اضغط على ⋮ أعلى المتصفح، " +
            "ثم اختر «تثبيت التطبيق» أو «إضافة إلى الشاشة الرئيسية»."
        );
    });
}

// ============================================
// عند اكتمال تثبيت التطبيق
// ============================================

window.addEventListener("appinstalled", () => {

    console.log("PWA: تم تثبيت التطبيق بنجاح");

    deferredInstallPrompt = null;

    if (installAppBtn) {
        installAppBtn.style.display = "none";
    }
});