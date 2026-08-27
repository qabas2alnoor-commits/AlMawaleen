// ============================================
// hijri-settings.js
// إعدادات التقويم الهجري الإمامي
// تطبيق الموالين
// ============================================
//
// Online:
// Supabase → app_settings → hijri_offset
//
// Offline:
// آخر قيمة صحيحة محفوظة على الجهاز
//
// القيم المسموحة:
// -1 = أخذ التاريخ الهجري لليوم الميلادي السابق
//  0 = بدون تعديل
// +1 = أخذ التاريخ الهجري لليوم الميلادي التالي
//
// مهم جدًا:
// لا يتم تعديل رقم اليوم الهجري مباشرة.
// لا يتم تغيير طول الشهر الهجري.
// لا يتم افتراض أن الشهر 29 أو 30 يومًا.
//
// calendar.js هو المسؤول عن تطبيق التصحيح.
// ============================================


// ============================================
// إعدادات التخزين المحلي
// ============================================

const HIJRI_OFFSET_STORAGE_KEY =
    "mawaqit_al_mowaleen_hijri_offset";


// ============================================
// قيمة التصحيح الحالية
// ============================================

let hijriOffset = 0;


// ============================================
// التحقق من قيمة التصحيح
// ============================================

function isValidHijriOffset(value) {

    return (
        value === -1 ||
        value === 0 ||
        value === 1
    );

}


// ============================================
// قراءة آخر قيمة محفوظة محليًا
// ============================================

function getStoredHijriOffset() {

    try {

        const storedValue =
            localStorage.getItem(
                HIJRI_OFFSET_STORAGE_KEY
            );

        if (storedValue === null) {

            return null;

        }

        const value =
            Number(storedValue);

        if (isValidHijriOffset(value)) {

            return value;

        }

    }

    catch (error) {

        console.warn(
            "تعذر قراءة hijri_offset من التخزين المحلي:",
            error
        );

    }

    return null;

}


// ============================================
// حفظ قيمة التصحيح محليًا
// ============================================

function saveHijriOffset(value) {

    if (!isValidHijriOffset(value)) {

        return;

    }

    try {

        localStorage.setItem(
            HIJRI_OFFSET_STORAGE_KEY,
            String(value)
        );

    }

    catch (error) {

        console.warn(
            "تعذر حفظ hijri_offset محليًا:",
            error
        );

    }

}


// ============================================
// تحميل إعداد التصحيح
// ============================================

async function loadHijriOffset() {

    // ----------------------------------------
    // محاولة استخدام آخر قيمة محفوظة
    // ----------------------------------------

    const storedValue =
        getStoredHijriOffset();

    if (storedValue !== null) {

        hijriOffset = storedValue;

        console.log(
            `تم تحميل hijri_offset من التخزين المحلي: ${hijriOffset}`
        );

    }

    else {

        // القيمة الافتراضية الآمنة
        hijriOffset = 0;

    }


    // ----------------------------------------
    // إذا كان التطبيق Offline
    // نستخدم القيمة المحلية مباشرة
    // ولا نحاول الاتصال بـ Supabase
    // ----------------------------------------

    if (!navigator.onLine) {

        console.log(
            `🔴 Offline: استخدام hijri_offset المحلي: ${hijriOffset}`
        );

        return hijriOffset;

    }


    // ----------------------------------------
    // Online → محاولة تحديث القيمة من Supabase
    // ----------------------------------------

    try {

        // ----------------------------------------
        // التأكد من توفر Supabase
        // ----------------------------------------

        if (
            typeof supabaseClient === "undefined"
        ) {

            console.warn(
                "Supabase غير متوفر، سيتم استخدام القيمة المحلية."
            );

            return hijriOffset;

        }


        // ----------------------------------------
        // قراءة إعداد hijri_offset
        // ----------------------------------------

        const {
            data,
            error
        } = await supabaseClient
            .from("app_settings")
            .select("setting_value")
            .eq(
                "setting_key",
                "hijri_offset"
            )
            .maybeSingle();


        // ----------------------------------------
        // معالجة الخطأ
        // ----------------------------------------

        if (error) {

            console.warn(
                "تعذر قراءة hijri_offset من Supabase، سيتم استخدام القيمة المحلية:",
                error
            );

            return hijriOffset;

        }


        // ----------------------------------------
        // عدم وجود الإعداد
        // ----------------------------------------

        if (!data) {

            console.warn(
                "لم يتم العثور على hijri_offset في Supabase، سيتم استخدام القيمة المحلية."
            );

            return hijriOffset;

        }


        // ----------------------------------------
        // تحويل القيمة إلى رقم
        // ----------------------------------------

        const value =
            Number(
                data.setting_value
            );


        // ----------------------------------------
        // التحقق من القيمة
        // ----------------------------------------

        if (
            isValidHijriOffset(value)
        ) {

            hijriOffset = value;

            // حفظ آخر قيمة صحيحة
            saveHijriOffset(
                hijriOffset
            );

            console.log(
                `تم تحديث hijri_offset من Supabase: ${hijriOffset}`
            );

        }

        else {

            console.warn(
                `قيمة hijri_offset غير صحيحة: ${data.setting_value} — سيتم استخدام القيمة المحلية.`
            );

        }

    }

    catch (error) {

        console.warn(
            "تعذر الاتصال بـ Supabase، سيتم استخدام آخر قيمة محفوظة محليًا:",
            error
        );

    }


    return hijriOffset;

}


// ============================================
// الحصول على قيمة التصحيح الحالية
// ============================================

function getHijriOffset() {

    if (
        isValidHijriOffset(hijriOffset)
    ) {

        return hijriOffset;

    }

    return 0;

}


// ============================================
// إتاحة الدوال عالميًا
// ============================================

window.loadHijriOffset =
    loadHijriOffset;

window.getHijriOffset =
    getHijriOffset;