// ============================================
// hijri-events.js
// المناسبات الهجرية
// Online + Offline
// مواقيت الموالين
// ============================================
//
// Online:
// المصدر الأساسي: Supabase
//
// Offline:
// آخر نسخة ناجحة محفوظة في localStorage
//
// نظام الأشهر:
//
// calendar.js:
// محرم = 1
// صفر = 2
// ...
// ذو الحجة = 12
//
// Supabase:
// محرم = 0
// صفر = 1
// ...
// ذو الحجة = 11
//
// هذا الملف مسؤول عن:
// 1. تحميل المناسبات من Supabase.
// 2. حفظ آخر نسخة ناجحة محليًا.
// 3. تحميل آخر نسخة محلية عند Offline.
// 4. تحويل نظام الأشهر.
// 5. توفير المناسبات لـ calendar.js.
//
// لا يغير التاريخ الهجري.
// لا يغير طول الأشهر.
// لا يطبق hijri_offset.
// ============================================


// ============================================
// البيانات الحالية للمناسبات
// ============================================

let loadedHijriEvents = [];


// ============================================
// مفتاح التخزين المحلي
// ============================================

const HIJRI_EVENTS_STORAGE_KEY =
    "mawaqit_al_mowaleen_hijri_events";


// ============================================
// التحقق من شهر Supabase
// 0 - 11
// ============================================

function normalizeHijriMonth(month) {

    const value =
        Number(month);

    if (
        !Number.isInteger(value) ||
        value < 0 ||
        value > 11
    ) {

        return null;

    }

    return value;

}


// ============================================
// تحويل شهر التقويم
// 1 - 12
// إلى نظام Supabase
// 0 - 11
// ============================================

function calendarHijriMonthToInternal(month) {

    const value =
        Number(month);

    if (
        !Number.isInteger(value) ||
        value < 1 ||
        value > 12
    ) {

        return null;

    }

    return value - 1;

}


// ============================================
// تحويل مناسبة Supabase
// إلى الشكل الداخلي
// ============================================

function normalizeSupabaseEvent(event) {

    if (!event) {

        return null;

    }

    const day =
        Number(event.hijri_day);

    const month =
        normalizeHijriMonth(
            event.hijri_month
        );

    if (
        !Number.isInteger(day) ||
        day < 1 ||
        month === null
    ) {

        return null;

    }

    const isHoliday =
        event.is_holiday === true ||
        event.is_holiday === "true" ||
        event.is_holiday === 1 ||
        event.is_holiday === "1";

    return {

        id:
            event.id,

        day:
            day,

        month:
            month,

        title:
            event.name ||
            "مناسبة",

        type:
            event.event_type ||
            "other",

        description:
            event.description ||
            "",

        importance:
            Number(event.importance) || 0,

        color:
            event.color ||
            "#777777",

        is_holiday:
            isHoliday,

        isHoliday:
            isHoliday,

        source_id:
            event.source_id ||
            null,

        is_active:
            event.is_active !== false

    };

}


// ============================================
// حفظ المناسبات محليًا
// ============================================

function saveHijriEventsToLocalStorage(events) {

    if (
        !Array.isArray(events) ||
        events.length === 0
    ) {

        console.warn(
            "لن يتم حفظ قائمة مناسبات فارغة."
        );

        return false;

    }

    try {

        localStorage.setItem(
            HIJRI_EVENTS_STORAGE_KEY,
            JSON.stringify(events)
        );

        console.log(
            `تم حفظ ${events.length} مناسبة محليًا.`
        );

        return true;

    }

    catch (error) {

        console.warn(
            "تعذر حفظ المناسبات محليًا:",
            error
        );

        return false;

    }

}


// ============================================
// تحميل المناسبات من التخزين المحلي
// ============================================

function loadHijriEventsFromLocalStorage() {

    try {

        const storedData =
            localStorage.getItem(
                HIJRI_EVENTS_STORAGE_KEY
            );


        // ----------------------------------------
        // لا توجد نسخة محلية
        // ----------------------------------------

        if (
            !storedData
        ) {

            console.warn(
                "لا توجد نسخة محلية من المناسبات."
            );

            return [];

        }


        // ----------------------------------------
        // تحويل JSON
        // ----------------------------------------

        const parsedData =
            JSON.parse(
                storedData
            );


        if (
            !Array.isArray(parsedData)
        ) {

            console.warn(
                "النسخة المحلية من المناسبات غير صالحة."
            );

            return [];

        }


        // ----------------------------------------
        // إعادة تطبيق التطبيع
        // ----------------------------------------

        const normalizedEvents =
            parsedData
                .map(
                    normalizeSupabaseEvent
                )
                .filter(Boolean);


        console.log(
            `تم تحميل ${normalizedEvents.length} مناسبة من التخزين المحلي.`
        );


        return normalizedEvents;

    }

    catch (error) {

        console.error(
            "خطأ قراءة المناسبات من التخزين المحلي:",
            error
        );

        return [];

    }

}


// ============================================
// تحميل المناسبات من Supabase
// ============================================

async function loadSupabaseEvents() {

    // ----------------------------------------
    // التأكد من وجود Supabase Client
    // ----------------------------------------

    if (
        !window.supabaseClient
    ) {

        console.warn(
            "Supabase Client غير متوفر، سيتم استخدام النسخة المحلية."
        );

        return loadHijriEventsFromLocalStorage();

    }


    try {

        const {
            data,
            error
        } =
            await window.supabaseClient
                .from("events")
                .select("*")
                .eq(
                    "is_active",
                    true
                )
                .order(
                    "hijri_month",
                    {
                        ascending: true
                    }
                )
                .order(
                    "hijri_day",
                    {
                        ascending: true
                    }
                );


        // ----------------------------------------
        // معالجة خطأ Supabase
        // ----------------------------------------

        if (
            error
        ) {

            console.warn(
                "تعذر تحميل المناسبات من Supabase:",
                error
            );

            console.log(
                "سيتم استخدام آخر نسخة محلية."
            );

            return loadHijriEventsFromLocalStorage();

        }


        // ----------------------------------------
        // التأكد من البيانات
        // ----------------------------------------

        if (
            !Array.isArray(data)
        ) {

            console.warn(
                "بيانات المناسبات القادمة من Supabase غير صالحة."
            );

            return loadHijriEventsFromLocalStorage();

        }


        // ----------------------------------------
        // حماية من استبدال نسخة جيدة بقائمة فارغة
        // ----------------------------------------

        if (
            data.length === 0
        ) {

            console.warn(
                "Supabase أعاد 0 مناسبة، سيتم استخدام النسخة المحلية إن وجدت."
            );

            const localEvents =
                loadHijriEventsFromLocalStorage();

            if (
                localEvents.length
            ) {

                return localEvents;

            }

        }


        // ----------------------------------------
        // نجاح التحميل
        // ----------------------------------------

        console.log(
            `تم جلب ${data.length} مناسبة من Supabase.`
        );


        // ----------------------------------------
        // حفظ النسخة الناجحة محليًا
        // ----------------------------------------

        if (
            data.length > 0
        ) {

            saveHijriEventsToLocalStorage(
                data
            );

        }


        return data;

    }

    catch (error) {

        console.warn(
            "تعذر الاتصال بـ Supabase، سيتم استخدام النسخة المحلية:",
            error
        );

        return loadHijriEventsFromLocalStorage();

    }

}


// ============================================
// تحميل المناسبات الإمامية
// ============================================

async function loadImamEvents() {

    try {

        const events =
            await loadSupabaseEvents();


        // ----------------------------------------
        // التأكد من البيانات
        // ----------------------------------------

        if (
            !Array.isArray(events)
        ) {

            loadedHijriEvents = [];

            return [];

        }


        // ----------------------------------------
        // تحويل البيانات إلى الشكل الداخلي
        // ----------------------------------------

        loadedHijriEvents =
            events
                .map(
                    normalizeSupabaseEvent
                )
                .filter(Boolean);


        console.log(
            `تم تحميل ${loadedHijriEvents.length} مناسبة هجرية.`
        );


        return loadedHijriEvents;

    }

    catch (error) {

        console.warn(
            "خطأ تحميل المناسبات الهجرية:",
            error
        );


        // ----------------------------------------
        // محاولة أخيرة من Local Storage
        // ----------------------------------------

        loadedHijriEvents =
            loadHijriEventsFromLocalStorage();


        return loadedHijriEvents;

    }

}


// ============================================
// الحصول على مناسبات يوم هجري
// ============================================

function getHijriEvents(
    hijriDay,
    hijriMonth
) {

    const day =
        Number(hijriDay);


    const month =
        calendarHijriMonthToInternal(
            hijriMonth
        );


    if (
        !Number.isInteger(day) ||
        day < 1 ||
        month === null
    ) {

        return [];

    }


    return loadedHijriEvents.filter(
        event =>

            Number(event.day) === day &&

            Number(event.month) === month

    );

}


// ============================================
// إضافة مؤشر المناسبة إلى اليوم
// ============================================

function attachHijriEvents(
    dayElement,
    hijriDay,
    hijriMonth
) {

    if (
        !dayElement
    ) {

        return;

    }


    const events =
        getHijriEvents(
            hijriDay,
            hijriMonth
        );


    if (
        !events.length
    ) {

        return;

    }


    dayElement.classList.add(
        "has-event"
    );


    dayElement.dataset.events =
        JSON.stringify(events);


    const firstEvent =
        events[0];


    const color =
        firstEvent.color ||
        "#777777";


    dayElement.style.borderColor =
        color;


    dayElement.style.background =
        `${color}22`;


    // ----------------------------------------
    // منع إضافة المؤشر أكثر من مرة
    // ----------------------------------------

    if (
        dayElement.querySelector(
            ".event-dot"
        )
    ) {

        return;

    }


    const dot =
        document.createElement(
            "span"
        );


    dot.className =
        "event-dot";


    dot.style.background =
        color;


    dayElement.appendChild(
        dot
    );

}


// ============================================
// عرض تفاصيل المناسبات
// ============================================

function showHijriEvents(events) {

    if (
        !Array.isArray(events) ||
        !events.length
    ) {

        return "";

    }


    return events
        .map(event => {

            const color =
                event.color ||
                "#777777";


            const holiday =
                event.is_holiday === true
                    ? `
                        <p class="event-holiday">
                            🟠 عطلة رسمية
                        </p>
                      `
                    : "";


            const description =
                event.description
                    ? `
                        <p>
                            ${event.description}
                        </p>
                      `
                    : "";


            return `
                <div
                    class="event-item"
                    style="border-right: 4px solid ${color};"
                >

                    <h4>
                        ${event.title || "مناسبة"}
                    </h4>

                    ${description}

                    ${holiday}

                </div>
            `;

        })
        .join("");

}


// ============================================
// اسم الشهر الهجري
// للنظام الداخلي 0 - 11
// ============================================

function getInternalHijriMonthName(month) {

    const months = [

        "محرم",
        "صفر",
        "ربيع الأول",
        "ربيع الآخر",
        "جمادى الأولى",
        "جمادى الآخرة",
        "رجب",
        "شعبان",
        "رمضان",
        "شوال",
        "ذو القعدة",
        "ذو الحجة"

    ];


    return (
        months[Number(month)] ||
        ""
    );

}


// ============================================
// الدوال العامة
// ============================================

window.loadSupabaseEvents =
    loadSupabaseEvents;


window.loadImamEvents =
    loadImamEvents;


window.getHijriEvents =
    getHijriEvents;


window.attachHijriEvents =
    attachHijriEvents;


window.showHijriEvents =
    showHijriEvents;


window.normalizeHijriMonth =
    normalizeHijriMonth;


window.calendarHijriMonthToInternal =
    calendarHijriMonthToInternal;


window.getInternalHijriMonthName =
    getInternalHijriMonthName;


// ============================================
// دوال Offline للاختبار والتشخيص
// ============================================

window.saveHijriEventsToLocalStorage =
    saveHijriEventsToLocalStorage;


window.loadHijriEventsFromLocalStorage =
    loadHijriEventsFromLocalStorage;


// ============================================
// نهاية hijri-events.js
// ============================================