document.addEventListener("DOMContentLoaded", () => {
    const splashScreen = document.getElementById("splash-screen");
    const introVideo = document.getElementById("intro-video");

    if (!splashScreen || !introVideo) {
        console.error("❌ Splash elements not found");
        return;
    }

    let splashFinished = false;

    // ============================================
    // إخفاء شاشة البداية
    // ============================================

    function hideSplash(reason) {
        if (splashFinished) return;

        splashFinished = true;

        splashScreen.classList.add("hide");

        setTimeout(() => {
            splashScreen.remove();
        }, 700);
    }

    // ============================================
    // تشغيل الفيديو
    // ============================================

    function startVideo() {
        if (splashFinished) return;

        // محاولة التشغيل بالصوت
        introVideo.muted = false;

        introVideo.play()
            .catch(() => {

                // المتصفح منع التشغيل بالصوت
                // ننتقل للتشغيل بصمت
                introVideo.muted = true;

                introVideo.play()
                    .catch(() => {
                        hideSplash("video play failed");
                    });
            });
    }

    // ============================================
    // الفيديو أصبح محملًا
    // ============================================

    introVideo.addEventListener("loadeddata", () => {
        startVideo();
    });

    // ============================================
    // خطأ تحميل الفيديو
    // ============================================

    introVideo.addEventListener("error", () => {
        console.error(
            "❌ Video failed to load:",
            introVideo.error
        );

        hideSplash("video load failed");
    });

    // ============================================
    // انتهاء الفيديو
    // ============================================

    introVideo.addEventListener("ended", () => {
        hideSplash("video ended");
    });

    // ============================================
    // إذا كان الفيديو محملًا مسبقًا
    // ============================================

    if (introVideo.readyState >= 2) {
        startVideo();
    }
});