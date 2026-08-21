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

        console.log("Splash finished:", reason);

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

        introVideo.muted = false;
        introVideo.volume = 1;

        const playPromise = introVideo.play();

        if (playPromise !== undefined) {
            playPromise
                .then(() => {
                    console.log("🔊 Intro playing with sound");
                })
                .catch((error) => {
                    console.warn(
                        "⚠️ Autoplay with sound blocked:",
                        error
                    );

                    // إذا منع الصوت، نشغل الفيديو بصمت
                    introVideo.muted = true;

                    introVideo.play()
                        .catch(() => {
                            hideSplash("video play failed");
                        });
                });
        }
    }

    // ============================================
    // تحميل الفيديو
    // ============================================

    introVideo.addEventListener("loadeddata", startVideo);

    // ============================================
    // انتهاء الفيديو
    // ============================================

    introVideo.addEventListener("ended", () => {
        hideSplash("video ended");
    });

    // ============================================
    // خطأ الفيديو
    // ============================================

    introVideo.addEventListener("error", () => {
        console.error(
            "❌ Video failed to load:",
            introVideo.error
        );

        hideSplash("video error");
    });

    // ============================================
    // إذا كان جاهزًا مسبقًا
    // ============================================

    if (introVideo.readyState >= 2) {
        startVideo();
    }
});
