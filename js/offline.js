// ============================================
// offline.js
// تطبيق الموالين
// مراقبة حالة الاتصال بالإنترنت
// Online / Offline
// ============================================

(function () {

    "use strict";


    // ============================================
    // الحالة الحالية
    // ============================================

    let isOnline =
        navigator.onLine;


    // ============================================
    // تحديث حالة الاتصال
    // ============================================

    function updateConnectionStatus() {

        isOnline =
            navigator.onLine;


        if (isOnline) {

            console.log(
                "🟢 التطبيق يعمل Online"
            );

        } else {

            console.log(
                "🔴 التطبيق يعمل Offline"
            );

        }


        // ========================================
        // إرسال حدث للتطبيق
        // ========================================

        window.dispatchEvent(

            new CustomEvent(
                "app-connection-change",
                {
                    detail: {
                        online: isOnline
                    }
                }
            )

        );


        // ========================================
        // تحديث عنصر حالة الاتصال إن وجد
        // ========================================

        updateStatusElement();

    }


    // ============================================
    // تحديث واجهة حالة الاتصال
    // ============================================

    function updateStatusElement() {

        const statusElement =
            document.getElementById(
                "offline-status"
            );


        if (!statusElement) {

            return;

        }


        if (isOnline) {

            statusElement.textContent =
                "متصل بالإنترنت";

            statusElement.classList.remove(
                "offline"
            );

            statusElement.classList.add(
                "online"
            );

        } else {

            statusElement.textContent =
                "يعمل بدون إنترنت";

            statusElement.classList.remove(
                "online"
            );

            statusElement.classList.add(
                "offline"
            );

        }

    }


    // ============================================
    // عند عودة الإنترنت
    // ============================================

    function handleOnline() {

        console.log(
            "🟢 عاد الاتصال بالإنترنت"
        );


        updateConnectionStatus();


        // ========================================
        // إرسال حدث خاص بعودة الإنترنت
        // ========================================

        window.dispatchEvent(

            new CustomEvent(
                "app-online",
                {
                    detail: {
                        online: true
                    }
                }
            )

        );

    }


    // ============================================
    // عند انقطاع الإنترنت
    // ============================================

    function handleOffline() {

        console.log(
            "🔴 انقطع الاتصال بالإنترنت"
        );


        updateConnectionStatus();


        // ========================================
        // إرسال حدث خاص بانقطاع الإنترنت
        // ========================================

        window.dispatchEvent(

            new CustomEvent(
                "app-offline",
                {
                    detail: {
                        online: false
                    }
                }
            )

        );

    }


    // ============================================
    // الاستماع لحالة الشبكة
    // ============================================

    window.addEventListener(
        "online",
        handleOnline
    );


    window.addEventListener(
        "offline",
        handleOffline
    );


    // ============================================
    // فحص أولي
    // ============================================

    updateConnectionStatus();


    // ============================================
    // API بسيطة للتطبيق
    // ============================================

    window.AppOffline = {

        isOnline: function () {

            return navigator.onLine;

        },


        isOffline: function () {

            return !navigator.onLine;

        },


        refresh: function () {

            updateConnectionStatus();

        }

    };


    // ============================================
    // حماية من الأخطاء
    // ============================================

    window.addEventListener(
        "error",
        function (event) {

            // لا نتدخل في أخطاء التطبيق
            // فقط نسجلها عند الحاجة

            if (
                !navigator.onLine
            ) {

                console.log(
                    "ℹ️ الخطأ حدث أثناء Offline:",
                    event.message
                );

            }

        }
    );


    // ============================================
    // حماية من أخطاء Promise
    // ============================================

    window.addEventListener(
        "unhandledrejection",
        function (event) {

            if (
                !navigator.onLine
            ) {

                console.log(
                    "ℹ️ Promise رفض أثناء Offline"
                );

            }

        }
    );


})();