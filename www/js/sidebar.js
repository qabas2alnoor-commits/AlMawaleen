// ============================================
// sidebar.js
// قائمة المناسبات الجانبية
// مواقيت الموالين
// ============================================


// ============================================
// أسماء الأشهر الهجرية
// النظام الداخلي للقائمة: 0 - 11
// ============================================

const sidebarHijriMonths = [

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


// ============================================
// آخر شهر تم عرضه
// ============================================

let lastSidebarHijriMonth = null;
let lastSidebarHijriYear = null;


// ============================================
// الحصول على الشهر الهجري الحالي
//
// calendar.js:
// 1 = محرم
// 2 = صفر
// ...
// 12 = ذو الحجة
//
// Sidebar:
// 0 = محرم
// 1 = صفر
// ...
// 11 = ذو الحجة
// ============================================

function getSidebarCurrentHijriMonth() {

    if (
        typeof currentHijriMonth !== "undefined" &&
        currentHijriMonth !== null
    ) {

        const value =
            Number(currentHijriMonth);

        if (
            Number.isFinite(value)
        ) {

            if (
                value >= 1 &&
                value <= 12
            ) {

                return value - 1;

            }

            if (
                value >= 0 &&
                value <= 11
            ) {

                return value;

            }

        }

    }


    if (
        typeof currentHijriDate !== "undefined" &&
        currentHijriDate
    ) {

        const value =
            Number(
                currentHijriDate.month ??
                currentHijriDate.hijriMonth ??
                currentHijriDate.hijri_month
            );

        if (
            Number.isFinite(value)
        ) {

            if (
                value >= 1 &&
                value <= 12
            ) {

                return value - 1;

            }

            if (
                value >= 0 &&
                value <= 11
            ) {

                return value;

            }

        }

    }

    return null;

}


// ============================================
// الحصول على السنة الهجرية الحالية
// ============================================

function getSidebarCurrentHijriYear() {

    if (
        typeof currentHijriYear !== "undefined" &&
        currentHijriYear !== null
    ) {

        const value =
            Number(currentHijriYear);

        if (
            Number.isFinite(value)
        ) {

            return value;

        }

    }


    if (
        typeof currentHijriDate !== "undefined" &&
        currentHijriDate
    ) {

        const value =
            Number(
                currentHijriDate.year ??
                currentHijriDate.hijriYear ??
                currentHijriDate.hijri_year
            );

        if (
            Number.isFinite(value)
        ) {

            return value;

        }

    }

    return null;

}


// ============================================
// الحصول على يوم المناسبة
// ============================================

function getSidebarEventDay(event) {

    if (!event) {
        return 0;
    }

    const day =
        Number(
            event.day ??
            event.hijri_day ??
            0
        );

    return Number.isFinite(day)
        ? day
        : 0;

}


// ============================================
// الحصول على شهر المناسبة
//
// Supabase:
// 0 = محرم
// ...
// 11 = ذو الحجة
// ============================================

function getSidebarEventMonth(event) {

    if (!event) {
        return null;
    }

    const value =
        Number(
            event.month ??
            event.hijri_month
        );

    if (
        !Number.isFinite(value)
    ) {

        return null;

    }

    // نظام قاعدة البيانات
    if (
        value >= 0 &&
        value <= 11
    ) {

        return value;

    }

    // احتياط للبيانات التي تستخدم 1 - 12
    if (
        value >= 1 &&
        value <= 12
    ) {

        return value - 1;

    }

    return null;

}


// ============================================
// التحقق من العطلة الرسمية
// ============================================

function isSidebarHoliday(event) {

    if (!event) {
        return false;
    }

    const value =
        event.is_holiday ??
        event.isHoliday;

    if (
        value === true ||
        value === 1
    ) {

        return true;

    }

    if (
        typeof value === "string"
    ) {

        const normalized =
            value.trim().toLowerCase();

        return (
            normalized === "true" ||
            normalized === "1" ||
            normalized === "yes"
        );

    }

    return false;

}


// ============================================
// الحصول على نوع المناسبة
// ============================================

function getSidebarEventType(event) {

    if (!event) {
        return "";
    }

    return (
        event.type ??
        event.event_type ??
        ""
    );

}


// ============================================
// تحميل المناسبات الجانبية
// ============================================

function loadSidebarEvents() {

    const eventsList =
        document.getElementById("month-events-list");

    if (!eventsList) {

        console.warn(
            "Sidebar: لم يتم العثور على #month-events-list"
        );

        return;

    }

    const allEvents =
        typeof loadedHijriEvents !== "undefined" &&
        Array.isArray(loadedHijriEvents)
            ? loadedHijriEvents
            : [];

    if (!allEvents.length) {

        eventsList.innerHTML = `
            <p class="no-sidebar-events">
                لا توجد مناسبات
            </p>
        `;

        return;

    }

    const currentMonth =
        getSidebarCurrentHijriMonth();

    if (currentMonth === null) {

        eventsList.innerHTML = `
            <p class="no-sidebar-events">
                جاري تحميل المناسبات...
            </p>
        `;

        return;

    }

    const sidebarEvents =
        allEvents
            .filter(event => {

                const eventMonth =
                    getSidebarEventMonth(event);

                return (
                    eventMonth !== null &&
                    Number(eventMonth) ===
                    Number(currentMonth)
                );

            })
            .sort((a, b) => {

                return (
                    getSidebarEventDay(a) -
                    getSidebarEventDay(b)
                );

            });

    eventsList.innerHTML = "";

    if (!sidebarEvents.length) {

        const monthName =
            sidebarHijriMonths[currentMonth] || "";

        eventsList.innerHTML = `
            <p class="no-sidebar-events">
                لا توجد مناسبات
                ${monthName ? `في شهر ${monthName}` : ""}
            </p>
        `;

        return;

    }

    sidebarEvents.forEach(event => {

        const div =
            document.createElement("div");

        div.className = "event";


        // ====================================
        // نوع المناسبة
        // ====================================

        const eventType =
            getSidebarEventType(event);

        if (eventType === "birth") {

            div.classList.add("birth");

        }
        else if (eventType === "marriage") {

            div.classList.add("marriage");

        }
        else if (eventType === "death") {

            div.classList.add("death");

        }
        else if (
            eventType === "martyr" ||
            eventType === "martyrdom"
        ) {

            div.classList.add("martyr");

        }


        // ====================================
        // بيانات المناسبة
        // ====================================

        const title =
            event.title ??
            event.name ??
            "مناسبة";

        const day =
            getSidebarEventDay(event);

        const month =
            getSidebarEventMonth(event);


        // ====================================
        // العطلة الرسمية
        // ====================================

        const isHoliday =
            isSidebarHoliday(event);

        if (isHoliday) {

            div.classList.add(
                "official-holiday"
            );

        }

        const holidayBadge =
            isHoliday
                ? `
                    <span class="sidebar-holiday">
                        🔴 عطلة رسمية
                    </span>
                  `
                : "";


        // ====================================
        // إنشاء المحتوى
        // ====================================

        div.innerHTML = `

            <div class="sidebar-event-row">

                <span class="sidebar-event-day">
                    ${day}
                </span>

                <div class="sidebar-event-info">

                    <strong class="sidebar-event-title">
                        ${title}
                    </strong>

                    ${holidayBadge}

                </div>

            </div>

            <small class="sidebar-event-date">

                ${day}

                ${
                    month !== null &&
                    sidebarHijriMonths[month]
                        ? ` ${sidebarHijriMonths[month]}`
                        : ""
                }

            </small>

        `;

        eventsList.appendChild(div);

    });

}


// ============================================
// تحديث القائمة
// ============================================

function refreshSidebarEvents() {

    loadSidebarEvents();

}


// ============================================
// مراقبة تغير الشهر الهجري
// ============================================

function startSidebarHijriWatcher() {

    setInterval(() => {

        const currentMonth =
            getSidebarCurrentHijriMonth();

        const currentYear =
            getSidebarCurrentHijriYear();

        if (
            currentMonth === lastSidebarHijriMonth &&
            currentYear === lastSidebarHijriYear
        ) {

            return;

        }

        lastSidebarHijriMonth =
            currentMonth;

        lastSidebarHijriYear =
            currentYear;

        if (
            currentMonth !== null
        ) {

            loadSidebarEvents();

        }

    }, 300);

}


// ============================================
// تشغيل القائمة
// ============================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        setTimeout(
            loadSidebarEvents,
            500
        );

        startSidebarHijriWatcher();

    }
);


// ============================================
// الدوال العامة
// ============================================

window.loadSidebarEvents =
    loadSidebarEvents;

window.refreshSidebarEvents =
    refreshSidebarEvents;

window.isSidebarHoliday =
    isSidebarHoliday;

window.getSidebarCurrentHijriMonth =
    getSidebarCurrentHijriMonth;