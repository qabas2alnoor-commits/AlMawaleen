// ============================================
// splash.js
// شاشة البداية - تطبيق الموالين
// يدعم Online + Offline
// ============================================

document.addEventListener("DOMContentLoaded", () => {

    const splashScreen =
        document.getElementById("splash-screen");

    const introVideo =
        document.getElementById("intro-video");


    // ============================================
    // التأكد من وجود عناصر Splash
    // ============================================

    if (!splashScreen || !introVideo) {

        console.error(
            "❌ Splash elements not found"
        );

        return;
    }


    // ============================================
    // حالة شاشة البداية
    // ============================================

    let splashFinished = false;
    let soundEnabled = false;


    // ============================================
    // إخفاء شاشة البداية
    // ============================================

    function hideSplash(reason) {

        if (splashFinished) {
            return;
        }

        splashFinished = true;


        // إلغاء مؤقت Offline
        clearTimeout(
            splashFallbackTimer
        );


        console.log(
            "Splash finished:",
            reason
        );


        splashScreen.classList.add(
            "hide"
        );


        setTimeout(() => {

            if (splashScreen) {

                splashScreen.remove();

            }

        }, 700);

    }


    // ============================================
    // Offline Fallback
    //
    // إذا لم يتوفر intro.mp4 أثناء Offline
    // لا تسمح شاشة البداية بمنع التطبيق
    // ============================================

    const splashFallbackTimer =
        setTimeout(() => {

            if (!splashFinished) {

                console.warn(
                    "⚠️ Splash fallback: متابعة التطبيق بدون فيديو المقدمة"
                );


                hideSplash(
                    "offline fallback"
                );

            }

        }, 20000);


    // ============================================
    // تشغيل الفيديو
    // ============================================

    function startVideo() {

        if (splashFinished) {
            return;
        }


        introVideo.muted = false;
        introVideo.volume = 1;


        introVideo.play()

            .then(() => {

                soundEnabled = true;


                console.log(
                    "🔊 Intro playing with sound"
                );

            })

            .catch((error) => {

                console.warn(
                    "⚠️ Autoplay with sound blocked:",
                    error
                );


                // --------------------------------
                // محاولة تشغيل الفيديو بصمت
                // --------------------------------

                introVideo.muted = true;


                introVideo.play()

                    .then(() => {

                        console.log(
                            "🔇 Intro playing muted"
                        );

                    })

                    .catch(() => {

                        hideSplash(
                            "video play failed"
                        );

                    });

            });

    }


    // ============================================
    // تفعيل الصوت بعد أول تفاعل من المستخدم
    // ============================================

    function enableVideoSound() {

        if (
            splashFinished ||
            soundEnabled
        ) {

            return;
        }


        introVideo.muted = false;
        introVideo.volume = 1;


        introVideo.play()

            .then(() => {

                soundEnabled = true;


                console.log(
                    "🔊 Intro sound enabled after user interaction"
                );

            })

            .catch((error) => {

                console.warn(
                    "⚠️ Could not enable intro sound:",
                    error
                );

            });

    }


    // ============================================
    // أول نقرة
    // ============================================

    document.addEventListener(
        "click",
        enableVideoSound,
        { once: true }
    );


    // ============================================
    // أول لمسة على الهاتف
    // ============================================

    document.addEventListener(
        "touchstart",
        enableVideoSound,
        { once: true }
    );


    // ============================================
    // تحميل الفيديو
    // ============================================

    introVideo.addEventListener(
        "loadeddata",
        startVideo
    );


    // ============================================
    // انتهاء الفيديو
    // ============================================

    introVideo.addEventListener(
        "ended",
        () => {

            hideSplash(
                "video ended"
            );

        }
    );


    // ============================================
    // خطأ الفيديو
    // ============================================

    introVideo.addEventListener(
        "error",
        () => {

            console.error(
                "❌ Video failed to load:",
                introVideo.error
            );


            hideSplash(
                "video error"
            );

        }
    );


    // ============================================
    // إذا كان الفيديو جاهزًا مسبقًا
    // ============================================

    if (
        introVideo.readyState >= 2
    ) {

        startVideo();

    }

});