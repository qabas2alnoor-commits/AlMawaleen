// ============================================
// hijri-events.js
// ربط المناسبات الهجرية بالتقويم
// ============================================

let loadedHijriEvents = [];


// ============================================
// تحويل رقم شهر API إلى رقم شهر المناسبات
// ============================================
//
// API:
// محرم = 1
// صفر = 2
// ربيع الأول = 3
// ...
// ذو الحجة = 12
//
// داخل التطبيق / Supabase:
// محرم = 0
// صفر = 1
// ربيع الأول = 2
// ...
// ذو الحجة = 11
// ============================================

function normalizeHijriMonth(month) {

    const value = Number(month);

    if (!Number.isFinite(value)) {
        return null;
    }

    // API = 1 - 12
    if (value >= 1 && value <= 12) {
        return value - 1;
    }

    // التطبيق = 0 - 11
    if (value >= 0 && value <= 11) {
        return value;
    }

    return null;
}


// ============================================
// توحيد بيانات المناسبة القادمة من Supabase
// ============================================

function normalizeSupabaseEvent(event) {

    if (!event) {
        return null;
    }


    // ========================================
    // اليوم
    // ========================================

    const day = Number(
        event.day ??
        event.hijri_day ??
        0
    );


    if (
        !Number.isFinite(day) ||
        day <= 0
    ) {
        return null;
    }


    // ========================================
    // الشهر
    // ========================================

    let month = null;


    // Supabase
    // hijri_month = 0 - 11

    if (
        event.hijri_month !== undefined &&
        event.hijri_month !== null
    ) {

        const value =
            Number(event.hijri_month);

        if (
            Number.isFinite(value) &&
            value >= 0 &&
            value <= 11
        ) {

            month = value;
        }
    }


    // ========================================
    // fallback إلى month
    // ========================================

    if (
        month === null &&
        event.month !== undefined &&
        event.month !== null
    ) {

        const value =
            Number(event.month);

        if (
            Number.isFinite(value)
        ) {

            // داخلي
            if (
                value >= 0 &&
                value <= 11
            ) {

                month = value;
            }

            // API
            else if (
                value >= 1 &&
                value <= 12
            ) {

                month = value - 1;
            }
        }
    }


    if (month === null) {
        return null;
    }


    // ========================================
    // نوع المناسبة
    // ========================================

    const type =
        event.type ??
        event.event_type ??
        "";


    // ========================================
    // اسم المناسبة
    // ========================================

    const title =
        event.title ??
        event.name ??
        "مناسبة";


    // ========================================
    // العطلة الرسمية
    // ========================================

    let isHoliday =
        event.is_holiday ??
        event.isHoliday ??
        false;


    if (
        typeof isHoliday === "string"
    ) {

        const normalized =
            isHoliday
                .trim()
                .toLowerCase();

        isHoliday =
            normalized === "true" ||
            normalized === "1" ||
            normalized === "yes";

    }

    else if (
        isHoliday === 1
    ) {

        isHoliday = true;

    }

    else {

        isHoliday =
            isHoliday === true;

    }


    // ========================================
    // إنشاء نسخة موحدة
    // ========================================

    return {

        ...event,

        id:
            event.id,

        day:
            day,

        month:
            month,

        title:
            title,

        type:
            type,

        is_holiday:
            isHoliday,

        isHoliday:
            isHoliday

    };

}


// ============================================
// تحميل المناسبات من Supabase
// ============================================

async function loadImamEvents() {

    try {

        // ------------------------------------
        // التأكد من وجود دالة Supabase
        // ------------------------------------

        if (
            typeof loadSupabaseEvents !==
            "function"
        ) {

            console.error(
                "loadSupabaseEvents غير موجودة"
            );

            loadedHijriEvents = [];

            return [];

        }


        // ------------------------------------
        // تحميل البيانات
        // ------------------------------------

        const supabaseEvents =
            await loadSupabaseEvents();


        // ------------------------------------
        // توحيد البيانات
        // ------------------------------------

        if (
            !Array.isArray(
                supabaseEvents
            )
        ) {

            loadedHijriEvents = [];

        }

        else {

            loadedHijriEvents =
                supabaseEvents
                    .map(
                        normalizeSupabaseEvent
                    )
                    .filter(
                        event =>
                            event !== null
                    );
        }


        // ------------------------------------
        // Console
        // ------------------------------------

      


        // ------------------------------------
        // فحص العطلات
        // ------------------------------------

        const holidays =
            loadedHijriEvents.filter(
                event =>
                    event.is_holiday === true
            );


        

        // ------------------------------------
        // تحديث القائمة الجانبية
        // ------------------------------------

        if (
            typeof loadSidebarEvents ===
            "function"
        ) {

            loadSidebarEvents();
        }


        return loadedHijriEvents;

    }

    catch (error) {

        console.error(
            "خطأ تحميل المناسبات من Supabase:",
            error
        );

        loadedHijriEvents = [];

        return [];

    }

}


// ============================================
// جلب مناسبات يوم هجري معين
// ============================================

function getHijriEvents(
    hijriDay,
    hijriMonth
) {

    const normalizedMonth =
        normalizeHijriMonth(
            hijriMonth
        );


    if (
        normalizedMonth === null
    ) {

        return [];

    }


    return loadedHijriEvents.filter(
        event => {

            return (

                Number(event.day) ===
                Number(hijriDay)

                &&

                Number(event.month) ===
                Number(normalizedMonth)

            );

        }
    );

}


// ============================================
// إضافة المناسبات إلى اليوم في التقويم
// ============================================

function attachHijriEvents(
    dayElement,
    hijriDay,
    hijriMonth
) {

    if (!dayElement) {
        return;
    }


    const events =
        getHijriEvents(
            hijriDay,
            hijriMonth
        );


    if (
        events.length === 0
    ) {

        return;
    }


    // ========================================
    // إضافة class
    // ========================================

    dayElement.classList.add(
        "has-event"
    );


    // ========================================
    // حفظ البيانات
    // ========================================

    dayElement.dataset.events =
        JSON.stringify(events);


    // ========================================
    // لون المناسبة
    // ========================================

    const event =
        events[0];


    if (
        event.color
    ) {

        dayElement.style.borderColor =
            event.color;

        dayElement.style.background =
            event.color + "22";
    }


    // ========================================
    // منع إضافة أكثر من نقطة
    // ========================================

    if (
        dayElement.querySelector(
            ".event-dot"
        )
    ) {

        return;
    }


    // ========================================
    // إضافة نقطة المناسبة
    // ========================================

    const icon =
        document.createElement(
            "span"
        );


    icon.className =
        "event-dot";


    icon.style.background =
        event.color ||
        "#777";


    dayElement.appendChild(
        icon
    );

}


// ============================================
// عرض تفاصيل المناسبة
// ============================================

function showHijriEvents(
    events
) {

    if (
        !events ||
        events.length === 0
    ) {

        return "";

    }


    let text = "";


    events.forEach(
        event => {

            const isHoliday =
                event.is_holiday === true ||
                event.isHoliday === true;


            const holidayText =
                isHoliday
                    ? `
                        <p class="event-holiday">
                            🟠 عطلة رسمية
                        </p>
                      `
                    : "";


            text += `

                <div class="event-item">

                    <h4>
                        ${
                            event.title ??
                            event.name ??
                            "مناسبة"
                        }
                    </h4>

                    <p>
                        النوع:
                        ${
                            event.type ??
                            event.event_type ??
                            ""
                        }
                    </p>

                    ${holidayText}

                </div>

            `;

        }
    );


    return text;

}


// ============================================
// إتاحة الدوال عالميًا
// ============================================

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