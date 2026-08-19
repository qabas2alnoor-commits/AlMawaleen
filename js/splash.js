document.addEventListener("DOMContentLoaded", () => {
    const splashScreen = document.getElementById("splash-screen");
    const introVideo = document.getElementById("intro-video");

    if (!splashScreen || !introVideo) {
        console.error("❌ Splash elements not found");
        return;
    }

    console.log("✅ Splash loaded");
    console.log(
        "🎬 Video source:",
        introVideo.currentSrc || introVideo.src
    );

    let splashFinished = false;

    // ============================================
    // إخفاء شاشة البداية
    // ============================================

    function hideSplash(reason) {
        if (splashFinished) return;

        splashFinished = true;

        console.log("🎬 Hiding splash:", reason);

        splashScreen.classList.add("hide");

        setTimeout(() => {
            splashScreen.remove();
        }, 700);
    }

    // ============================================
    // تشغيل الفيديو
    // محاولة التشغيل بالصوت أولًا
    // وإذا رفض المتصفح → التشغيل بصمت
    // ============================================

    function startVideo() {
        if (splashFinished) return;

        console.log("▶️ Attempting to play video with sound");

        // نحاول أولًا تشغيل الفيديو بالصوت
        introVideo.muted = false;

        introVideo.play()
            .then(() => {
                console.log("🔊 Video playing with sound");
            })
            .catch(error => {
                console.warn(
                    "⚠️ Browser blocked autoplay with sound:",
                    error
                );

                // ============================================
                // fallback
                // إذا منع المتصفح التشغيل بالصوت
                // نشغل الفيديو بصمت حتى لا يبقى التطبيق أسود
                // ============================================

                introVideo.muted = true;

                introVideo.play()
                    .then(() => {
                        console.log("🔇 Video playing muted");
                    })
                    .catch(playError => {
                        console.error(
                            "❌ Video play failed:",
                            playError
                        );

                        hideSplash("video play failed");
                    });
            });
    }

    // ============================================
    // الفيديو أصبح محملًا
    // ============================================

    introVideo.addEventListener("loadeddata", () => {
        console.log("✅ Video loaded successfully");

        startVideo();
    });

    // ============================================
    // الفيديو أصبح قابلًا للتشغيل
    // ============================================

    introVideo.addEventListener("canplay", () => {
        console.log("✅ Video can play");
    });

    // ============================================
    // حدث خطأ في تحميل الفيديو
    // ============================================

    introVideo.addEventListener("error", () => {
        console.error(
            "❌ Video failed to load:",
            introVideo.error
        );

        // لا نبقي التطبيق أسودًا
        hideSplash("video load failed");
    });

    // ============================================
    // انتهاء الفيديو
    // ============================================

    introVideo.addEventListener("ended", () => {
        console.log("✅ Video ended");

        hideSplash("video ended");
    });

    // ============================================
    // مهم:
    // إذا كان الفيديو قد تم تحميله قبل تسجيل الأحداث
    // ============================================

    if (introVideo.readyState >= 2) {
        console.log(
            "ℹ️ Video was already loaded. readyState:",
            introVideo.readyState
        );

        console.log("✅ Video loaded successfully");

        startVideo();
    }

    // ============================================
    // إذا كان الفيديو جاهزًا للتشغيل مسبقًا
    // ============================================

    if (introVideo.readyState >= 3) {
        console.log(
            "ℹ️ Video is already ready to play. readyState:",
            introVideo.readyState
        );
    }
});