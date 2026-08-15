// ============================================
// sidebar.js
// قائمة المناسبات الجانبية
// ============================================


// ============================================
// أسماء الأشهر الهجرية
// النظام الداخلي: 0 - 11
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
// متغير لحفظ آخر شهر تم عرضه
// ============================================

let lastSidebarHijriMonth = null;

let lastSidebarHijriYear = null;


// ============================================
// الحصول على الشهر الهجري الحالي
// ============================================

function getSidebarCurrentHijriMonth() {

    // ----------------------------------------
    // الطريقة الأولى
    // currentHijriMonth
    // ----------------------------------------

    if (
        typeof currentHijriMonth !== "undefined" &&
        currentHijriMonth !== null
    ) {

        const value =
            Number(currentHijriMonth);


        if (
            Number.isFinite(value)
        ) {

            // API:
            // 1 = محرم
            // 12 = ذو الحجة

            if (
                value >= 1 &&
                value <= 12
            ) {

                return value - 1;

            }

            // النظام الداخلي:
            // 0 = محرم
            // 11 = ذو الحجة

            if (
                value >= 0 &&
                value <= 11
            ) {

                return value;

            }

        }

    }


    // ----------------------------------------
    // الطريقة الثانية
    // currentHijriDate
    // ----------------------------------------

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

            // API 1 - 12

            if (
                value >= 1 &&
                value <= 12
            ) {

                return value - 1;

            }

            // داخلي 0 - 11

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


    // ========================================
    // مهم:
    //
    // loadedHijriEvents القادمة من
    // hijri-events.js أصبحت بالفعل
    // بنظام 0 - 11.
    //
    // لذلك لا نقوم بتحويلها مرة أخرى.
    // ========================================

    if (
        value >= 0 &&
        value <= 11
    ) {

        return value;

    }


    // احتياط إذا وصلت بيانات API مباشرة

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
            value
                .trim()
                .toLowerCase();


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
        document.getElementById(
            "month-events-list"
        );


    // ----------------------------------------
    // التأكد من وجود القائمة
    // ----------------------------------------

    if (!eventsList) {

        console.warn(
            "Sidebar: لم يتم العثور على #month-events-list"
        );

        return;

    }


    // ----------------------------------------
    // الحصول على المناسبات
    // ----------------------------------------

    const allEvents =
        typeof loadedHijriEvents !== "undefined"
            ? loadedHijriEvents
            : [];


    // ----------------------------------------
    // لا توجد بيانات بعد
    // ----------------------------------------

    if (
        !Array.isArray(allEvents) ||
        allEvents.length === 0
    ) {

        eventsList.innerHTML = `

            <p class="no-sidebar-events">
                لا توجد مناسبات
            </p>

        `;

        return;

    }


    // ----------------------------------------
    // الحصول على الشهر الهجري
    // ----------------------------------------

    const currentMonth =
        getSidebarCurrentHijriMonth();


    const currentYear =
        getSidebarCurrentHijriYear();


    // ----------------------------------------
    // إذا لم نعرف الشهر بعد
    // ----------------------------------------

    if (
        currentMonth === null
    ) {

      

        eventsList.innerHTML = `

            <p class="no-sidebar-events">
                جاري تحميل المناسبات...
            </p>

        `;

        return;

    }


    // ----------------------------------------
    // فلترة المناسبات
    // ----------------------------------------

    const sidebarEvents =
        allEvents
            .filter(
                event => {

                    const eventMonth =
                        getSidebarEventMonth(
                            event
                        );


                    return (

                        eventMonth !== null &&

                        Number(eventMonth) ===
                        Number(currentMonth)

                    );

                }
            )
            .sort(
                (a, b) => {

                    return (
                        getSidebarEventDay(a) -
                        getSidebarEventDay(b)
                    );

                }
            );


    // ----------------------------------------
    // تنظيف القائمة
    // ----------------------------------------

    eventsList.innerHTML = "";


    // ----------------------------------------
    // لا توجد مناسبات في الشهر الحالي
    // ----------------------------------------

    if (
        sidebarEvents.length === 0
    ) {

        const monthName =
            sidebarHijriMonths[
                currentMonth
            ] || "";


        eventsList.innerHTML = `

            <p class="no-sidebar-events">

                لا توجد مناسبات
                ${
                    monthName
                        ? `في شهر ${monthName}`
                        : ""
                }

            </p>

        `;

        return;

    }


    // ----------------------------------------
    // عرض عدد المناسبات في Console
    // ----------------------------------------

    //console.log(
     //   "Sidebar: الشهر الهجري:",
    //    sidebarHijriMonths[currentMonth],
//currentYear ?? "",
     //   "| عدد المناسبات:",
       // sidebarEvents.length
    //);


    // ----------------------------------------
    // إنشاء عناصر المناسبات
    // ----------------------------------------

    sidebarEvents.forEach(
        event => {


            const div =
                document.createElement(
                    "div"
                );


            div.className =
                "event";


            // =================================
            // نوع المناسبة
            // =================================

            const eventType =
                getSidebarEventType(
                    event
                );


            if (
                eventType === "birth"
            ) {

                div.classList.add(
                    "birth"
                );

            }

            else if (
                eventType === "marriage"
            ) {

                div.classList.add(
                    "marriage"
                );

            }

            else if (
                eventType === "death"
            ) {

                div.classList.add(
                    "death"
                );

            }

            else if (
                eventType === "martyr" ||
                eventType === "martyrdom"
            ) {

                div.classList.add(
                    "martyr"
                );

            }


            // =================================
            // بيانات المناسبة
            // =================================

            const title =
                event.title ??
                event.name ??
                "مناسبة";


            const day =
                getSidebarEventDay(
                    event
                );


            const month =
                getSidebarEventMonth(
                    event
                );


            // =================================
            // العطلة الرسمية
            // =================================

            const isHoliday =
                isSidebarHoliday(
                    event
                );


            // =================================
            // شارة العطلة
            // =================================

            const holidayBadge =
                isHoliday
                    ? `

                        <span class="sidebar-holiday">

                            🔴 عطلة رسمية

                        </span>

                      `
                    : "";


            // =================================
            // Class العطلة
            // =================================

            if (
                isHoliday
            ) {

                div.classList.add(
                    "official-holiday"
                );

            }


            // =================================
            // محتوى المناسبة
            // =================================

            div.innerHTML = `

                <div class="sidebar-event-row">

                    <span class="sidebar-event-day">

                        ${day}

                    </span>


                    <div class="sidebar-event-info">

                        <strong
                            class="sidebar-event-title"
                        >

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


            // =================================
            // إضافة إلى القائمة
            // =================================

            eventsList.appendChild(
                div
            );

        }
    );

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
//
// هذا الجزء مهم جدًا.
//
// عندما ينتقل المستخدم إلى شهر ميلادي
// جديد، calendar.js يغيّر currentHijriMonth.
//
// نحن نراقب هذا التغيير ونحدّث القائمة
// تلقائيًا بدون الحاجة لتعديل calendar.js.
// ============================================

function startSidebarHijriWatcher() {

    setInterval(
        function () {

            const currentMonth =
                getSidebarCurrentHijriMonth();


            const currentYear =
                getSidebarCurrentHijriYear();


            // --------------------------------
            // لم يتغير شيء
            // --------------------------------

            if (
                currentMonth ===
                lastSidebarHijriMonth &&

                currentYear ===
                lastSidebarHijriYear
            ) {

                return;

            }


            // --------------------------------
            // حفظ القيمة الجديدة
            // --------------------------------

            lastSidebarHijriMonth =
                currentMonth;


            lastSidebarHijriYear =
                currentYear;


            // --------------------------------
            // تحديث القائمة
            // --------------------------------

            if (
                currentMonth !== null
            ) {

                loadSidebarEvents();

            }

        },

        300

    );

}


// ============================================
// انتظار تحميل الصفحة
// ============================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        // محاولة أولى
        setTimeout(
            function () {

                loadSidebarEvents();

            },
            500
        );


        // بدء مراقبة تغير الشهر
        startSidebarHijriWatcher();

    }
);


// ============================================
// إتاحة الدوال عالميًا
// ============================================

window.loadSidebarEvents =
    loadSidebarEvents;


window.refreshSidebarEvents =
    refreshSidebarEvents;


window.isSidebarHoliday =
    isSidebarHoliday;


window.getSidebarCurrentHijriMonth =
    getSidebarCurrentHijriMonth;