// ============================================
// calendar.js
// التقويم الهجري + التاريخ الميلادي + المناسبات
// ============================================

// ============================================
// أسماء الأشهر الميلادية
// ============================================

const monthNames = [
    "يناير",
    "فبراير",
    "مارس",
    "أبريل",
    "مايو",
    "يونيو",
    "يوليو",
    "أغسطس",
    "سبتمبر",
    "أكتوبر",
    "نوفمبر",
    "ديسمبر"
];

// ============================================
// أسماء أيام الأسبوع
// يبدأ من الأحد
// ============================================

const dayNames = [
    "الأحد",
    "الإثنين",
    "الثلاثاء",
    "الأربعاء",
    "الخميس",
    "الجمعة",
    "السبت"
];

// ============================================
// التاريخ الحالي
// ============================================

let currentDate = new Date();

let currentMonth =
    currentDate.getMonth();

let currentYear =
    currentDate.getFullYear();

// ============================================
// الشهر الهجري الحالي
// API:
// محرم = 1
// صفر = 2
// ...
// ذو الحجة = 12
// ============================================

let currentHijriMonth = null;
let currentHijriYear = null;

// ============================================
// التاريخ الميلادي المرجعي للشهر الهجري
// ============================================

let hijriAnchorDate =
    new Date(currentDate);

// ============================================
// Cache للتقويم الهجري
// مفتاحه: السنة-الشهر الميلادي-offset
// ============================================

const hijriCalendarCache = new Map();

// ============================================
// تشغيل التطبيق
// ============================================


document.addEventListener(
    "DOMContentLoaded",
    async () => {

        try {

            // ----------------------------------------
            // تحميل المناسبات الإمامية
            // ----------------------------------------

            if (
                typeof loadImamEvents === "function"
            ) {

                await loadImamEvents();

            }

            // ----------------------------------------
            // تحميل المناسبات الجانبية
            // ----------------------------------------

            if (
                typeof loadSidebarEvents === "function"
            ) {

                loadSidebarEvents();

            }

            // ----------------------------------------
            // تحميل أحداث المستخدم
            // ----------------------------------------

            if (
                typeof loadUserEvents === "function"
            ) {

                loadUserEvents();

            }

            // ----------------------------------------
            // رسم التقويم
            // ----------------------------------------

            await renderCalendar();

            // ----------------------------------------
            // الوضع الليلي
            // ----------------------------------------

            setupDarkMode();

            // ----------------------------------------
            // حول التطبيق
            // ----------------------------------------

            setupAboutApp();

            // ----------------------------------------
            // إغلاق نافذة تفاصيل اليوم
            // ----------------------------------------

            setupDetailsModal();

        }

        catch (error) {

            console.error(
                "خطأ أثناء تشغيل التقويم:",
                error
            );

        }

    }
);
// ============================================
// الحصول على عدد أيام الشهر الهجري
// من البيانات الموجودة في Cache
// ============================================

function getHijriMonthLength(
    monthData,
    hijriMonth,
    hijriYear
) {

    if (!Array.isArray(monthData)) {
        return 30;
    }

    const days =
        monthData
            .filter(item => {

                return (
                    Number(item.hijriMonth) ===
                        Number(hijriMonth) &&

                    Number(item.hijriYear) ===
                        Number(hijriYear)
                );

            })
            .map(item =>
                Number(item.hijriDay)
            )
            .filter(day =>
                Number.isFinite(day)
            );

    if (days.length === 0) {
        return 30;
    }

    return Math.max(...days);
}

// ============================================
// جلب التقويم الهجري لشهر ميلادي كامل
// طلب API واحد فقط
// ============================================

async function getHijriCalendarMonth(
    month,
    year
) {

    // ========================================
    // قراءة التصحيح الإمامي
    // ========================================

    let adjustment = 0;

    if (
        typeof IMAMI_HIJRI_OFFSET !== "undefined"
    ) {

        adjustment =
            Number(IMAMI_HIJRI_OFFSET);

        if (!Number.isFinite(adjustment)) {
            adjustment = 0;
        }

    }

    // ========================================
    // Cache Key
    // ========================================

    const cacheKey =
        `${year}-${String(month + 1).padStart(2, "0")}-offset-${adjustment}`;

    // ========================================
    // استخدام Cache
    // ========================================

    if (
    hijriCalendarCache.has(cacheKey)
) {

    

    return hijriCalendarCache.get(
        cacheKey
    );

}

try {

        // ====================================
        // رقم الشهر الميلادي للـ API
        // ====================================

        const apiMonth =
            month + 1;

        // ====================================
        // رابط API
        // ====================================

        const url =
            "https://api.aladhan.com/v1/gToHCalendar/" +
            apiMonth +
            "/" +
            year +
            "?adjustment=0";

        

        // ====================================
        // طلب API
        // ====================================

        const response =
            await fetch(url);

        if (!response.ok) {

            throw new Error(
                `HTTP ${response.status}`
            );

        }

        // ====================================
        // JSON
        // ====================================

        const result =
            await response.json();

        if (
            !result.data ||
            !Array.isArray(result.data)
        ) {

            throw new Error(
                "بيانات التقويم الهجري غير متوفرة"
            );

        }

        // ====================================
        // تحويل البيانات
        // ====================================

        const monthData =
            result.data.map(item => {

                const h =
                    item.hijri;

                const g =
                    item.gregorian;

                return {

                    gregorianDay:
                        Number(g.day),

                    gregorianMonth:
                        Number(g.month.number),

                    gregorianYear:
                        Number(g.year),

                    hijriDay:
                        Number(h.day),

                    hijriMonth:
                        Number(h.month.number),

                    hijriMonthName:
                        h.month.ar,

                    hijriYear:
                        Number(h.year)

                };

            });

        // ====================================
        // التصحيح الإمامي
        // ====================================

        if (adjustment !== 0) {

            monthData.forEach(item => {

                item.hijriDay =
                    Number(item.hijriDay) +
                    adjustment;

                // ----------------------------------
                // إنقاص يوم
                // ----------------------------------

                if (
                    item.hijriDay < 1
                ) {

                    item.hijriMonth--;

                    if (
                        item.hijriMonth < 1
                    ) {

                        item.hijriMonth = 12;
                        item.hijriYear--;

                    }

                    item.hijriDay = 30;

                }

                // ----------------------------------
                // إضافة يوم
                // ----------------------------------

                else if (
                    item.hijriDay > 30
                ) {

                    item.hijriDay = 1;

                    item.hijriMonth++;

                    if (
                        item.hijriMonth > 12
                    ) {

                        item.hijriMonth = 1;
                        item.hijriYear++;

                    }

                }

                // ----------------------------------
                // تحديث اسم الشهر
                // ----------------------------------

                item.hijriMonthName =
                    getHijriMonthName(
                        item.hijriMonth
                    );

            });

        }

        // ====================================
        // حفظ الشهر في Cache
        // ====================================

        hijriCalendarCache.set(
            cacheKey,
            monthData
        );

       

       

        return monthData;

    }

    catch (error) {

        console.error(
            "خطأ تحميل التقويم الهجري للشهر:",
            error
        );

        return [];

    }
}

// ============================================
// جلب بيانات الشهر الهجري المطلوب
// ============================================
//
// يتم جلب الشهر الميلادي الحالي + السابق + التالي
// لأن الشهر الهجري قد يكون موزعًا بين شهرين ميلاديين.
// والـ Cache يمنع إعادة الطلب.
// ============================================

async function getHijriMonthData(
    hijriMonth,
    hijriYear,
    anchorDate
) {

    const datesToLoad = [];

    const anchor =
        new Date(anchorDate);

    // الشهر الحالي
    datesToLoad.push(
        new Date(
            anchor.getFullYear(),
            anchor.getMonth(),
            1
        )
    );

    // الشهر السابق
    datesToLoad.push(
        new Date(
            anchor.getFullYear(),
            anchor.getMonth() - 1,
            1
        )
    );

    // الشهر التالي
    datesToLoad.push(
        new Date(
            anchor.getFullYear(),
            anchor.getMonth() + 1,
            1
        )
    );

    let allData = [];

    for (
        const date of datesToLoad
    ) {

        const data =
            await getHijriCalendarMonth(
                date.getMonth(),
                date.getFullYear()
            );

        if (
            Array.isArray(data)
        ) {

            allData.push(
                ...data
            );

        }

    }

    // ========================================
    // حذف التكرار
    // ========================================

    const uniqueData = [];

    allData.forEach(item => {

        const exists =
            uniqueData.some(existing => {

                return (
                    Number(existing.gregorianDay) ===
                        Number(item.gregorianDay) &&

                    Number(existing.gregorianMonth) ===
                        Number(item.gregorianMonth) &&

                    Number(existing.gregorianYear) ===
                        Number(item.gregorianYear)
                );

            });

        if (!exists) {

            uniqueData.push(item);

        }

    });

    // ========================================
    // اختيار الشهر الهجري المطلوب فقط
    // ========================================

    const result =
        uniqueData.filter(item => {

            return (
                Number(item.hijriMonth) ===
                    Number(hijriMonth) &&

                Number(item.hijriYear) ===
                    Number(hijriYear)
            );

        });

    // ========================================
    // ترتيب الأيام هجريًا
    // ========================================

    result.sort(
        (a, b) =>
            Number(a.hijriDay) -
            Number(b.hijriDay)
    );

    return result;
}

// ============================================
// البحث عن التاريخ الهجري ليوم ميلادي
// ============================================

function getHijriForGregorianDay(
    monthData,
    day
) {

    if (
        !Array.isArray(monthData)
    ) {

        return null;
    }

    return (
        monthData.find(
            item =>
                Number(item.gregorianDay) ===
                Number(day)
        ) || null
    );
}

// ============================================
// الحصول على تاريخ ميلادي من بيانات هجري
// ============================================

function getGregorianDateFromHijri(
    hijri
) {

    if (!hijri) {
        return null;
    }

    return new Date(
        Number(hijri.gregorianYear),
        Number(hijri.gregorianMonth) - 1,
        Number(hijri.gregorianDay)
    );
}

// ============================================
// تحديد الشهر الهجري الحالي عند البداية
// ============================================

async function initializeHijriMonth() {

    if (
        currentHijriMonth !== null &&
        currentHijriYear !== null
    ) {

        return;

    }

    const monthData =
        await getHijriCalendarMonth(
            currentDate.getMonth(),
            currentDate.getFullYear()
        );

    const todayHijri =
        monthData.find(item => {

            return (

                Number(item.gregorianDay) ===
                    currentDate.getDate() &&

                Number(item.gregorianMonth) ===
                    currentDate.getMonth() + 1 &&

                Number(item.gregorianYear) ===
                    currentDate.getFullYear()

            );

        });

    if (todayHijri) {

        currentHijriMonth =
            Number(todayHijri.hijriMonth);

        currentHijriYear =
            Number(todayHijri.hijriYear);

        hijriAnchorDate =
            new Date(currentDate);

    }

}

// ============================================
// رسم التقويم الهجري
// ============================================

async function renderCalendar() {

    const calendar =
        document.getElementById(
            "calendar"
        );

    if (!calendar) {

        console.error(
            "لم يتم العثور على عنصر #calendar"
        );

        return;

    }

    // ========================================
    // تحديد الشهر الهجري عند التشغيل الأول
    // ========================================

    await initializeHijriMonth();

    if (
        currentHijriMonth === null ||
        currentHijriYear === null
    ) {

        console.error(
            "لم يتم تحديد الشهر الهجري الحالي"
        );

        return;

    }

    // ========================================
    // تنظيف التقويم القديم
    // ========================================

    calendar.innerHTML = "";

    // ========================================
    // عنوان الشهر الهجري
    // ========================================

    const monthYear =
        document.getElementById(
            "monthYear"
        );

    if (monthYear) {

        monthYear.textContent =
            `${getHijriMonthName(currentHijriMonth)} ${currentHijriYear} هـ`;

    }

    // ========================================
    // تاريخ اليوم الميلادي
    // ========================================

    const today =
        new Date();

    const todayGregorian =
        document.getElementById(
            "todayGregorian"
        );

    if (todayGregorian) {

        todayGregorian.textContent =
            today.toLocaleDateString(
                "ar-IQ",
                {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric"
                }
            );

    }

    // ========================================
    // تحميل بيانات الشهر الهجري
    // ========================================

    let monthData =
        await getHijriMonthData(
            currentHijriMonth,
            currentHijriYear,
            hijriAnchorDate
        );

    // ========================================
    // إذا لم نجد البيانات باستخدام المرجع
    // نعيد المحاولة باستخدام التاريخ الحالي
    // ========================================

    if (
        !monthData.length
    ) {

        monthData =
            await getHijriMonthData(
                currentHijriMonth,
                currentHijriYear,
                new Date()
            );

    }

    if (
        !monthData ||
        !monthData.length
    ) {

        console.error(
            "لم يتم العثور على أيام الشهر الهجري"
        );

        return;

    }

    // ========================================
    // تحديث المرجع الميلادي
    // ========================================

    const firstHijriDay =
        monthData[0];

    const firstGregorianDate =
        getGregorianDateFromHijri(
            firstHijriDay
        );

    if (firstGregorianDate) {

        hijriAnchorDate =
            new Date(firstGregorianDate);

        currentMonth =
            firstGregorianDate.getMonth();

        currentYear =
            firstGregorianDate.getFullYear();

    }

    // ========================================
    // تحديث التاريخ الهجري لليوم الحالي
    // ========================================

    const todayMonthData =
        await getHijriCalendarMonth(
            today.getMonth(),
            today.getFullYear()
        );

    const todayHijri =
        todayMonthData.find(item => {

            return (

                Number(item.gregorianDay) ===
                    today.getDate() &&

                Number(item.gregorianMonth) ===
                    today.getMonth() + 1 &&

                Number(item.gregorianYear) ===
                    today.getFullYear()

            );

        });

    const todayHijriElement =
        document.getElementById(
            "todayHijri"
        );

    if (
        todayHijriElement &&
        todayHijri
    ) {

        todayHijriElement.textContent =
            `${todayHijri.hijriDay} ${todayHijri.hijriMonthName} ${todayHijri.hijriYear} هـ`;

    }

    // ========================================
    // أسماء الأيام
    // ========================================

    dayNames.forEach(day => {

        const header =
            document.createElement(
                "div"
            );

        header.className =
            "day-name";

        header.textContent =
            day;

        calendar.appendChild(
            header
        );

    });

    // ========================================
    // أول يوم في الشهر الهجري
    // نعتمد على موقعه الميلادي لمعرفة يوم الأسبوع
    // ========================================

    const firstDayDate =
        getGregorianDateFromHijri(
            monthData[0]
        );

    const firstDay =
        firstDayDate
            ? firstDayDate.getDay()
            : 0;

    // ========================================
    // الخانات الفارغة
    // ========================================

    for (
        let i = 0;
        i < firstDay;
        i++
    ) {

        const empty =
            document.createElement(
                "div"
            );

        empty.className =
            "empty";

        calendar.appendChild(
            empty
        );

    }

    // ========================================
    // إنشاء أيام الشهر الهجري
    // ========================================

    monthData.forEach(
        hijriDayData => {

            createDay(
                hijriDayData,
                calendar
            );

        }
    );

    // ========================================
    // تحديث قسم المناسبات
    // ========================================

    if (
        typeof showMonthEvents === "function"
    ) {

        showMonthEvents(
            [
                {
                    month:
                        currentHijriMonth,

                    year:
                        currentHijriYear
                }
            ]
        );

    }

}

// ============================================
// إنشاء يوم
// ============================================

function createDay(
    hijri,
    container
) {

    const div =
        document.createElement(
            "div"
        );

    div.className =
        "calendar-day";

    // ========================================
    // التاريخ الميلادي لهذا اليوم
    // ========================================

    const date =
        getGregorianDateFromHijri(
            hijri
        );

    // ========================================
    // حماية
    // ========================================

    if (!date) {
        return;
    }

    // ========================================
    // المناسبات الإمامية
    // ========================================

    let imamEvents = [];

    if (
        typeof getHijriEvents === "function" &&
        hijri.hijriDay &&
        hijri.hijriMonth
    ) {

        imamEvents =
            getHijriEvents(
                Number(hijri.hijriDay),
                Number(hijri.hijriMonth)
            ) || [];

    }

    // ========================================
    // مناسبات المستخدم
    // تعتمد على التاريخ الميلادي
    // ========================================

    let personalEvents = [];

    if (
        typeof userEvents !== "undefined" &&
        Array.isArray(userEvents)
    ) {

        personalEvents =
            userEvents.filter(
                event =>

                    Number(event.day) ===
                        date.getDate() &&

                    Number(event.month) ===
                        date.getMonth() + 1 &&

                    Number(event.year) ===
                        date.getFullYear()
            );

    }

    // ========================================
    // جميع المناسبات
    // ========================================

    const allEvents = [

        ...imamEvents,

        ...personalEvents

    ];

    // ========================================
    // محتوى اليوم
    // ========================================
    //
    // الرقم الكبير = هجري
    // الرقم الصغير = ميلادي
    // ========================================

    div.innerHTML = `

        <div class="gregorian-day">
            ${hijri.hijriDay}
        </div>

        <div class="hijri-day">
            ${hijri.gregorianDay}/${hijri.gregorianMonth}
        </div>

        <div class="day-events"></div>

    `;

    // ========================================
    // المناسبات داخل اليوم
    // ========================================

    const eventsBox =
        div.querySelector(
            ".day-events"
        );

    if (
        eventsBox &&
        allEvents.length
    ) {

        allEvents
            .slice(0, 2)
            .forEach(event => {

                const item =
                    document.createElement(
                        "div"
                    );

                item.className =
                    "mini-event";

                if (
                    Number(event.importance) >= 5
                ) {

                    item.textContent =
                        `⭐ ${event.title}`;

                }

                else {

                    item.textContent =
                        `• ${event.title}`;

                }

                if (
                    event.color
                ) {

                    item.style.color =
                        event.color;

                }

                eventsBox.appendChild(
                    item
                );

            });

    }

    // ========================================
    // تلوين اليوم إذا كان فيه مناسبة
    // ========================================

    if (
        allEvents.length
    ) {

        div.classList.add(
            "has-event"
        );

        const type =
            allEvents[0].type;

        if (

            type === "death" ||

            type === "martyrdom" ||

            type === "martyr"

        ) {

            div.classList.add(
                "death-event"
            );

        }

        else if (

            type === "birth" ||

            type === "marriage"

        ) {

            div.classList.add(
                "happy-event"
            );

        }

    }

    // ========================================
    // اليوم الحالي
    // ========================================

    const today =
        new Date();

    if (

        date.getDate() ===
            today.getDate() &&

        date.getMonth() ===
            today.getMonth() &&

        date.getFullYear() ===
            today.getFullYear()

    ) {

        div.classList.add(
            "today"
        );

    }

    // ========================================
    // الضغط على اليوم
    // ========================================

    div.onclick = () => {

        openDayDetails(
            date,
            hijri,
            allEvents
        );

    };

    // ========================================
    // إضافة اليوم
    // ========================================

    container.appendChild(
        div
    );

}

// ============================================
// التاريخ الهجري الإمامي
// ============================================
//
// يستخدم نفس Cache.
// لا يقوم بطلب API جديد إذا كان موجودًا.
// ============================================

async function getShiaCompatibleHijriDate(
    date
) {

    try {

        const monthData =
            await getHijriCalendarMonth(
                date.getMonth(),
                date.getFullYear()
            );

        const result =
            getHijriForGregorianDay(
                monthData,
                date.getDate()
            );

        if (!result) {

            return {

                day: "",
                month: "",
                monthName: "",
                year: ""

            };

        }

        return {

            day:
                result.hijriDay,

            month:
                result.hijriMonth,

            monthName:
                result.hijriMonthName,

            year:
                result.hijriYear

        };

    }

    catch (error) {

        console.error(
            "خطأ التاريخ الهجري:",
            error
        );

        return {

            day: "",
            month: "",
            monthName: "",
            year: ""

        };

    }

}

// ============================================
// تفاصيل اليوم
// ============================================



function openDayDetails(
    date,
    hijri,
    events
) {

    let html = `

        <h3>التاريخ الميلادي</h3>

        <p>
            ${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}
        </p>


        <h3>التاريخ الهجري</h3>

        <p>
            ${hijri.hijriDay || ""}
            ${hijri.hijriMonthName || ""}
            ${hijri.hijriYear || ""}
        </p>


        <h3>المناسبات</h3>

    `;


    // ========================================
    // لا توجد مناسبات
    // ========================================

    if (
        !events ||
        !events.length
    ) {

        html += `

            <p class="no-events">
                لا توجد مناسبات
            </p>

        `;

    }


    // ========================================
    // عرض المناسبات
    // ========================================

    else {

        events.forEach(
            event => {

                // --------------------------------
                // التحقق هل المناسبة من أحداث المستخدم
                // --------------------------------

                const isUserEvent =

                    typeof userEvents !==
                        "undefined"

                    &&

                    Array.isArray(
                        userEvents
                    )

                    &&

                    userEvents.some(
                        userEvent =>

                            Number(
                                userEvent.id
                            )

                            ===

                            Number(
                                event.id
                            )
                    );


                // ====================================
                // بداية بطاقة المناسبة
                // ====================================

                html += `

                    <div class="detail-event">

                        <span>
                            ${event.title}
                        </span>

                `;


                // ====================================
                // عطلة رسمية
                // ====================================
                //
                // القيمة القادمة من Supabase:
                // is_holiday = true
                //
                // ====================================

               if (
    event.is_holiday === true ||
    event.is_holiday === "true" ||
    event.isHoliday === true ||
    event.isHoliday === "true"
) {

    html += `

        <div
            class="official-holiday"
            style="
                display: block;
                margin-top: 8px;
                padding: 6px 10px;
                font-weight: bold;
                color: #C62828;
            "
        >
            🟠 عطلة رسمية
        </div>

    `;

}


                // ====================================
                // زر حذف مناسبة المستخدم
                // ====================================

                if (
                    isUserEvent
                ) {

                    html += `

                        <button
                            type="button"
                            class="delete-event-btn"
                            onclick="deleteEventFromDetails(${event.id})"
                        >
                            حذف
                        </button>

                    `;

                }


                // ====================================
                // إغلاق بطاقة المناسبة
                // ====================================

                html += `

                    </div>

                `;

            }
        );

    }


    // ========================================
    // عرض المحتوى داخل نافذة التفاصيل
    // ========================================

    const detailsContent =
        document.getElementById(
            "detailsContent"
        );


    const detailsModal =
        document.getElementById(
            "detailsModal"
        );


    if (
        detailsContent
    ) {

        detailsContent.innerHTML =
            html;

    }


    if (
        detailsModal
    ) {

        detailsModal.style.display =
            "flex";

    }

}

// ============================================
// حذف حدث المستخدم من نافذة التفاصيل
// ============================================

function deleteEventFromDetails(
    id
) {

    if (
        typeof deleteEvent !== "function"
    ) {

        console.error(
            "دالة deleteEvent غير موجودة"
        );

        return;

    }

    deleteEvent(id);

    const modal =
        document.getElementById(
            "detailsModal"
        );

    if (modal) {

        modal.style.display =
            "none";

    }

    // إعادة رسم التقويم بعد الحذف

    renderCalendar();

}

// ============================================
// إنشاء نجوم الأهمية
// ============================================

function createImportanceStars(
    level
) {

    if (
        !level ||
        level <= 0
    ) {

        return "";

    }

    let stars = "";

    for (
        let i = 0;
        i < level;
        i++
    ) {

        stars += "⭐";

    }

    return `

        <div class="event-importance">
            ${stars}
        </div>

    `;

}

// ============================================
// الشهر الهجري التالي
// ============================================

async function nextMonth() {

    if (
        currentHijriMonth === null ||
        currentHijriYear === null
    ) {

        await initializeHijriMonth();

    }

    // ========================================
    // حفظ آخر يوم من الشهر الحالي
    // ========================================

    const currentData =
        await getHijriMonthData(
            currentHijriMonth,
            currentHijriYear,
            hijriAnchorDate
        );

    if (
        currentData.length
    ) {

        const lastDay =
            currentData[
                currentData.length - 1
            ];

        const lastDate =
            getGregorianDateFromHijri(
                lastDay
            );

        if (lastDate) {

            hijriAnchorDate =
                new Date(lastDate);

            hijriAnchorDate.setDate(
                hijriAnchorDate.getDate() + 5
            );

        }

    }

    // ========================================
    // الانتقال للشهر الهجري التالي
    // ========================================

    currentHijriMonth++;

    if (
        currentHijriMonth > 12
    ) {

        currentHijriMonth = 1;

        currentHijriYear++;

    }

    await renderCalendar();

}

// ============================================
// الشهر الهجري السابق
// ============================================

async function previousMonth() {

    if (
        currentHijriMonth === null ||
        currentHijriYear === null
    ) {

        await initializeHijriMonth();

    }

    // ========================================
    // بيانات الشهر الحالي
    // ========================================

    const currentData =
        await getHijriMonthData(
            currentHijriMonth,
            currentHijriYear,
            hijriAnchorDate
        );

    if (
        currentData.length
    ) {

        const firstDay =
            currentData[0];

        const firstDate =
            getGregorianDateFromHijri(
                firstDay
            );

        if (firstDate) {

            hijriAnchorDate =
                new Date(firstDate);

            hijriAnchorDate.setDate(
                hijriAnchorDate.getDate() - 5
            );

        }

    }

    // ========================================
    // الانتقال للشهر الهجري السابق
    // ========================================

    currentHijriMonth--;

    if (
        currentHijriMonth < 1
    ) {

        currentHijriMonth = 12;

        currentHijriYear--;

    }

    await renderCalendar();

}

// ============================================
// الوضع الليلي
// ============================================

function setupDarkMode() {

    const darkModeBtn =
        document.getElementById(
            "darkModeBtn"
        );

    // ----------------------------------------
    // استعادة الوضع المحفوظ
    // ----------------------------------------

    if (
        localStorage.getItem("theme") ===
        "dark"
    ) {

        document.body.classList.add(
            "dark-mode"
        );

    }

    if (
        !darkModeBtn
    ) {

        return;

    }

    // منع تكرار الربط

    if (
        darkModeBtn.dataset.ready ===
        "true"
    ) {

        return;

    }

    darkModeBtn.dataset.ready =
        "true";

    darkModeBtn.addEventListener(
        "click",
        () => {

            document.body.classList.toggle(
                "dark-mode"
            );

            if (
                document.body.classList.contains(
                    "dark-mode"
                )
            ) {

                localStorage.setItem(
                    "theme",
                    "dark"
                );

            }

            else {

                localStorage.setItem(
                    "theme",
                    "light"
                );

            }

        }
    );

}

// ============================================
// اسم الشهر الهجري بالعربي
// ============================================

function getHijriMonthName(
    month
) {

    const hijriMonths = [

        "",

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
        hijriMonths[month] || ""
    );

}

// ============================================
// حول التطبيق
// ============================================

function setupAboutApp() {

    // ----------------------------------------
    // البحث عن زر حول التطبيق
    // ----------------------------------------

    let aboutButton =
        document.getElementById(
            "aboutBtn"
        );

    if (!aboutButton) {

        aboutButton =
            document.getElementById(
                "aboutAppBtn"
            );

    }

    if (!aboutButton) {

        return;

    }

    // ----------------------------------------
    // منع تكرار الربط
    // ----------------------------------------

    if (
        aboutButton.dataset.aboutReady ===
        "true"
    ) {

        return;

    }

    aboutButton.dataset.aboutReady =
        "true";

    // ----------------------------------------
    // النقر على زر حول التطبيق
    // ----------------------------------------

    aboutButton.addEventListener(
        "click",
        openAboutApp
    );

    // ----------------------------------------
    // إذا كانت نافذة About موجودة في HTML
    // ----------------------------------------

    const aboutModal =
        document.getElementById(
            "aboutAppModal"
        );

    if (aboutModal) {

        const closeAbout =
            document.getElementById(
                "closeAbout"
            );

        const closeAboutApp =
            document.getElementById(
                "closeAboutApp"
            );

        if (closeAbout) {

            closeAbout.addEventListener(
                "click",
                () => {

                    aboutModal.style.display =
                        "none";

                }
            );

        }

        if (closeAboutApp) {

            closeAboutApp.addEventListener(
                "click",
                () => {

                    aboutModal.style.display =
                        "none";

                }
            );

        }

        // ------------------------------------
        // الضغط خارج النافذة
        // ------------------------------------

        aboutModal.addEventListener(
            "click",
            event => {

                if (
                    event.target === aboutModal
                ) {

                    aboutModal.style.display =
                        "none";

                }

            }
        );

    }

}

// ============================================
// فتح نافذة حول التطبيق
// ============================================

function openAboutApp() {

    let modal =
        document.getElementById(
            "aboutAppModal"
        );

    // ========================================
    // إذا كانت النافذة موجودة في HTML
    // ========================================

    if (modal) {

        modal.style.display =
            "flex";

        return;

    }

    // ========================================
    // إنشاء نافذة About إذا لم تكن موجودة
    // ========================================

    modal =
        document.createElement(
            "div"
        );

    modal.id =
        "aboutAppModal";

    modal.className =
        "about-app-modal";

    


    document.body.appendChild(
        modal
    );

    // ========================================
    // إظهار النافذة
    // ========================================

    modal.style.display =
        "flex";

    // ========================================
    // زر الإغلاق
    // ========================================

    const closeButton =
        document.getElementById(
            "closeAboutApp"
        );

    if (closeButton) {

        closeButton.addEventListener(
            "click",
            () => {

                modal.style.display =
                    "none";

            }
        );

    }

    // ========================================
    // الضغط خارج النافذة
    // ========================================

    modal.addEventListener(
        "click",
        event => {

            if (
                event.target === modal
            ) {

                modal.style.display =
                    "none";

            }

        }
    );

}

// ============================================
// إعداد نافذة تفاصيل اليوم
// ============================================

function setupDetailsModal() {

    const detailsModal =
        document.getElementById(
            "detailsModal"
        );

    const closeDetails =
        document.getElementById(
            "closeDetails"
        );

    if (
        closeDetails &&
        detailsModal
    ) {

        if (
            closeDetails.dataset.ready ===
            "true"
        ) {

            return;

        }

        closeDetails.dataset.ready =
            "true";

        closeDetails.addEventListener(
            "click",
            () => {

                detailsModal.style.display =
                    "none";

            }
        );

        detailsModal.addEventListener(
            "click",
            event => {

                if (
                    event.target === detailsModal
                ) {

                    detailsModal.style.display =
                        "none";

                }

            }
        );

    }

}

// ============================================
// إتاحة الدوال العامة للـ HTML
// ============================================

window.nextMonth =
    nextMonth;

window.previousMonth =
    previousMonth;

window.openDayDetails =
    openDayDetails;

window.deleteEventFromDetails =
    deleteEventFromDetails;

window.getShiaCompatibleHijriDate =
    getShiaCompatibleHijriDate;

window.renderCalendar =
    renderCalendar;

window.openAboutApp =
    openAboutApp;