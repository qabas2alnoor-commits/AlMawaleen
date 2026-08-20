// ============================================
// PWA INSTALL
// زر تثبيت تطبيق مواقيت الولاء
// ============================================

let deferredInstallPrompt = null;

const installAppBtn = document.getElementById("installAppBtn");

// ============================================
// استقبال طلب التثبيت من المتصفح
// ============================================

window.addEventListener("beforeinstallprompt", (event) => {

    event.preventDefault();

    deferredInstallPrompt = event;

    // إظهار زر التثبيت
    if (installAppBtn) {
        installAppBtn.style.display = "inline-flex";
    }

    console.log("PWA: التثبيت متاح");
});

// ============================================
// الضغط على زر التثبيت
// ============================================

if (installAppBtn) {

    installAppBtn.addEventListener("click", async () => {

        if (!deferredInstallPrompt) {
            console.log("PWA: التثبيت غير متاح حاليًا");
            return;
        }

        // إظهار نافذة التثبيت
        deferredInstallPrompt.prompt();

        // انتظار اختيار المستخدم
        const { outcome } =
            await deferredInstallPrompt.userChoice;

        console.log("PWA install:", outcome);

        // التخلص من الطلب بعد استخدامه
        deferredInstallPrompt = null;

        // إخفاء الزر
        installAppBtn.style.display = "none";
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