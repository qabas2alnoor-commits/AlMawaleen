// =====================================
// hijri.js
// Hijri Date - API Helper
// مواقيت الموالين
// Online + Offline
// =====================================


// =====================================
// مفتاح التخزين المحلي
// =====================================

const HIJRI_DATE_CACHE_KEY =
    "mawaqit_al_mowaleen_hijri_dates";


// =====================================
// قراءة Cache التاريخ الهجري
// =====================================

function getHijriDateCache() {

    try {

        const stored =
            localStorage.getItem(
                HIJRI_DATE_CACHE_KEY
            );

        if (!stored) {

            return {};

        }

        const parsed =
            JSON.parse(stored);

        if (
            parsed &&
            typeof parsed === "object" &&
            !Array.isArray(parsed)
        ) {

            return parsed;

        }

    }

    catch (error) {

        console.warn(
            "تعذر قراءة Cache التاريخ الهجري:",
            error
        );

    }

    return {};

}


// =====================================
// حفظ Cache التاريخ الهجري
// =====================================

function saveHijriDateCache(cache) {

    try {

        localStorage.setItem(
            HIJRI_DATE_CACHE_KEY,
            JSON.stringify(cache)
        );

    }

    catch (error) {

        console.warn(
            "تعذر حفظ Cache التاريخ الهجري:",
            error
        );

    }

}


// =====================================
// إنشاء مفتاح التاريخ
// =====================================

function createHijriDateCacheKey(
    year,
    month,
    day
) {

    return (
        `${year}-` +
        `${String(month + 1).padStart(2, "0")}-` +
        `${String(day).padStart(2, "0")}`
    );

}


// =====================================
// التحقق من التاريخ المخزن
// =====================================

function normalizeCachedHijriDate(
    value
) {

    if (!value) {

        return "";

    }

    const day =
        Number(value.day);

    const month =
        Number(value.month);

    const year =
        Number(value.year);

    if (
        !Number.isInteger(day) ||
        !Number.isInteger(month) ||
        !Number.isInteger(year)
    ) {

        return "";

    }

    return {

        day:
            day,

        month:
            month,

        year:
            year,

        monthName:
            value.monthName || "",

        text:
            value.text ||
            `${day} ${value.monthName || ""} ${year}`

    };

}


// =====================================
// الحصول على التاريخ الهجري
// لتاريخ ميلادي محدد
//
// Online:
// Aladhan API
//
// Offline:
// LocalStorage
//
// ملاحظة:
// لا يتم تطبيق hijri_offset هنا.
//
// التصحيح يتم في calendar.js
// =====================================

async function getHijriDate(
    year,
    month,
    day
) {

    // -------------------------------------
    // JavaScript month = 0 - 11
    // -------------------------------------

    const date =
        new Date(
            year,
            month,
            day
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "";

    }


    const d =
        String(
            date.getDate()
        ).padStart(2, "0");


    const m =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");


    const y =
        date.getFullYear();


    // =====================================
    // Cache Key
    // =====================================

    const cacheKey =
        createHijriDateCacheKey(
            y,
            date.getMonth(),
            date.getDate()
        );


    // =====================================
    // قراءة النسخة المحلية
    // =====================================

    const cache =
        getHijriDateCache();


    const cachedDate =
        normalizeCachedHijriDate(
            cache[cacheKey]
        );


    // =====================================
    // إذا Offline
    // استخدم النسخة المحلية مباشرة
    // =====================================

    if (
        typeof navigator !== "undefined" &&
        navigator.onLine === false
    ) {

        if (cachedDate) {

            console.log(
                "Offline: استخدام التاريخ الهجري المحلي:",
                cacheKey
            );

            return cachedDate;

        }

        console.warn(
            "Offline: لا توجد نسخة محلية للتاريخ:",
            cacheKey
        );

        return "";

    }


    // =====================================
    // محاولة الاتصال بالـ API
    // =====================================

    try {

        const response =
            await fetch(
                `https://api.aladhan.com/v1/gToH?date=${d}-${m}-${y}&adjustment=0`
            );


        if (
            !response.ok
        ) {

            throw new Error(
                `HTTP ${response.status}`
            );

        }


        const result =
            await response.json();


        if (
            result.code !== 200 ||
            !result.data ||
            !result.data.hijri
        ) {

            throw new Error(
                "بيانات التاريخ الهجري غير صالحة"
            );

        }


        const hijri =
            result.data.hijri;


        const hijriDate = {

            day:
                Number(hijri.day),

            month:
                Number(hijri.month.number),

            year:
                Number(hijri.year),

            monthName:
                hijri.month.ar || "",

            text:
                `${hijri.day} ${hijri.month.ar} ${hijri.year}`

        };


        // =====================================
        // حفظ آخر نتيجة ناجحة
        // =====================================

        cache[cacheKey] =
            hijriDate;


        saveHijriDateCache(
            cache
        );


        console.log(
            "تم تحديث التاريخ الهجري محليًا:",
            cacheKey
        );


        return hijriDate;

    }

    catch (error) {

        console.warn(
            "Hijri API Error:",
            error
        );


        // =====================================
        // Fallback Offline
        // =====================================

        if (cachedDate) {

            console.log(
                "استخدام آخر تاريخ هجري محفوظ:",
                cacheKey
            );

            return cachedDate;

        }


        return "";

    }

}


// =====================================
// تنظيف Cache اختياري
// لا يتم تشغيله تلقائيًا
// =====================================

function clearHijriDateCache() {

    try {

        localStorage.removeItem(
            HIJRI_DATE_CACHE_KEY
        );

        console.log(
            "تم حذف Cache التاريخ الهجري."
        );

    }

    catch (error) {

        console.warn(
            "تعذر حذف Cache التاريخ الهجري:",
            error
        );

    }

}


// =====================================
// الدوال العامة
// =====================================

window.getHijriDate =
    getHijriDate;


window.clearHijriDateCache =
    clearHijriDateCache;


// =====================================
// نهاية hijri.js
// =====================================