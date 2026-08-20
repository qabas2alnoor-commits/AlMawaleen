// ============================================
// calendar.js
// التقويم الهجري + الميلادي + المناسبات
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
// حالة التقويم
// ============================================

let currentDate = new Date();

let currentMonth = currentDate.getMonth();
let currentYear = currentDate.getFullYear();

let currentHijriMonth = null;
let currentHijriYear = null;

let hijriAnchorDate = new Date(currentDate);

// ============================================
// Cache
// ============================================

const hijriCalendarCache = new Map();

// ============================================
// تشغيل التطبيق
// ============================================

document.addEventListener("DOMContentLoaded", async () => {
    try {
        // تحميل إعداد تصحيح التاريخ الهجري
        if (typeof loadHijriOffset === "function") {
            await loadHijriOffset();
        }

        // تحميل المناسبات الإمامية
        if (typeof loadImamEvents === "function") {
            await loadImamEvents();
        }

        // تحميل المناسبات الجانبية
        if (typeof loadSidebarEvents === "function") {
            loadSidebarEvents();
        }

        // تحميل مناسبات المستخدم
        if (typeof loadUserEvents === "function") {
            loadUserEvents();
        }

        // رسم التقويم
        await renderCalendar();

        // إعداد الوضع الليلي
        setupDarkMode();

        // إعداد نافذة حول التطبيق
        setupAboutApp();

        // إعداد نافذة تفاصيل اليوم
        setupDetailsModal();

    } catch (error) {
        console.error("خطأ أثناء تشغيل التقويم:", error);
    }
});

// ============================================
// عدد أيام الشهر الهجري الحقيقي
// ============================================

function getHijriMonthLength(monthData, hijriMonth, hijriYear) {
    if (!Array.isArray(monthData)) {
        return 0;
    }

    const days = monthData
        .filter(item =>
            Number(item.hijriMonth) === Number(hijriMonth) &&
            Number(item.hijriYear) === Number(hijriYear)
        )
        .map(item => Number(item.hijriDay))
        .filter(Number.isFinite);

    return days.length ? Math.max(...days) : 0;
}

// ============================================
// جلب بيانات الشهر الميلادي من API
//
// adjustment=0 دائمًا.
// التصحيح يطبق محليًا من Supabase.
// ============================================

async function getHijriCalendarMonthRaw(month, year) {
    const cacheKey =
        `raw-${year}-${String(month + 1).padStart(2, "0")}`;

    if (hijriCalendarCache.has(cacheKey)) {
        return hijriCalendarCache.get(cacheKey);
    }

    try {
        const apiMonth = month + 1;

        const url =
            `https://api.aladhan.com/v1/gToHCalendar/${apiMonth}/${year}?adjustment=0`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const result = await response.json();

        if (!result.data || !Array.isArray(result.data)) {
            throw new Error("بيانات التقويم الهجري غير متوفرة");
        }

        const monthData = result.data.map(item => {
            const h = item.hijri;
            const g = item.gregorian;

            return {
                gregorianDay: Number(g.day),
                gregorianMonth: Number(g.month.number),
                gregorianYear: Number(g.year),

                hijriDay: Number(h.day),
                hijriMonth: Number(h.month.number),

                hijriMonthName:
                    h.month.ar ||
                    getHijriMonthName(Number(h.month.number)),

                hijriYear: Number(h.year)
            };
        });

        hijriCalendarCache.set(cacheKey, monthData);

        return monthData;

    } catch (error) {
        console.error("خطأ تحميل بيانات API الهجرية:", error);
        return [];
    }
}

// ============================================
// تطبيق تصحيح التاريخ الهجري
//
// -1 = تاريخ اليوم الهجري لليوم الميلادي السابق
//  0 = بدون تعديل
// +1 = تاريخ اليوم الهجري لليوم الميلادي التالي
//
// لا يتم تعديل رقم اليوم يدويًا.
// يتم أخذ التاريخ الهجري الحقيقي من اليوم
// الميلادي المقابل.
// ============================================

async function applyHijriOffsetToMonth(monthData, month, year) {
    const offset =
        typeof getHijriOffset === "function"
            ? Number(getHijriOffset())
            : 0;

    const validOffset =
        [-1, 0, 1].includes(offset)
            ? offset
            : 0;

    if (
        validOffset === 0 ||
        !Array.isArray(monthData) ||
        !monthData.length
    ) {
        return monthData;
    }

    let adjacentMonthData = [];

    if (validOffset === -1) {
        const previousDate = new Date(year, month - 1, 1);

        adjacentMonthData =
            await getHijriCalendarMonthRaw(
                previousDate.getMonth(),
                previousDate.getFullYear()
            );
    }

    if (validOffset === 1) {
        const nextDate = new Date(year, month + 1, 1);

        adjacentMonthData =
            await getHijriCalendarMonthRaw(
                nextDate.getMonth(),
                nextDate.getFullYear()
            );
    }

    return monthData.map(item => {
        const originalDate = new Date(
            item.gregorianYear,
            item.gregorianMonth - 1,
            item.gregorianDay
        );

        const shiftedDate = new Date(originalDate);

        shiftedDate.setDate(
            shiftedDate.getDate() + validOffset
        );

        let sourceData = monthData;

        const crossedMonth =
            shiftedDate.getMonth() !== originalDate.getMonth() ||
            shiftedDate.getFullYear() !== originalDate.getFullYear();

        if (crossedMonth) {
            sourceData = adjacentMonthData;
        }

        const corrected = sourceData.find(source =>
            Number(source.gregorianYear) === shiftedDate.getFullYear() &&
            Number(source.gregorianMonth) === shiftedDate.getMonth() + 1 &&
            Number(source.gregorianDay) === shiftedDate.getDate()
        );

        if (!corrected) {
            return item;
        }

        return {
            ...item,

            // التاريخ الميلادي يبقى كما هو
            gregorianDay: item.gregorianDay,
            gregorianMonth: item.gregorianMonth,
            gregorianYear: item.gregorianYear,

            // التعديل يطبق على الهجري فقط
            hijriDay: corrected.hijriDay,
            hijriMonth: corrected.hijriMonth,
            hijriMonthName: corrected.hijriMonthName,
            hijriYear: corrected.hijriYear
        };
    });
}

// ============================================
// جلب التقويم الهجري لشهر ميلادي كامل
// ============================================

async function getHijriCalendarMonth(month, year) {
    const offset =
        typeof getHijriOffset === "function"
            ? Number(getHijriOffset())
            : 0;

    const validOffset =
        [-1, 0, 1].includes(offset)
            ? offset
            : 0;

    const cacheKey =
        `${year}-${String(month + 1).padStart(2, "0")}-offset-${validOffset}`;

    if (hijriCalendarCache.has(cacheKey)) {
        return hijriCalendarCache.get(cacheKey);
    }

    const rawData =
        await getHijriCalendarMonthRaw(month, year);

    if (!rawData.length) {
        return [];
    }

    const correctedData =
        await applyHijriOffsetToMonth(
            rawData,
            month,
            year
        );

    hijriCalendarCache.set(
        cacheKey,
        correctedData
    );

    return correctedData;
}

// ============================================
// جلب بيانات شهر هجري كامل
//
// الشهر الهجري قد يبدأ في نهاية شهر ميلادي
// وينتهي في الشهر الميلادي التالي.
// ============================================

async function getHijriMonthData(
    hijriMonth,
    hijriYear,
    anchorDate
) {
    const anchor = new Date(anchorDate);

    const datesToLoad = [];

    for (let offset = -3; offset <= 3; offset++) {
        datesToLoad.push(
            new Date(
                anchor.getFullYear(),
                anchor.getMonth() + offset,
                1
            )
        );
    }

    // تحميل الأشهر بالتوازي بدلًا من الانتظار
    // لكل طلب API بشكل منفصل.
    const monthResults =
        await Promise.all(
            datesToLoad.map(date =>
                getHijriCalendarMonth(
                    date.getMonth(),
                    date.getFullYear()
                )
            )
        );

    const allData =
        monthResults.flat();

    // إزالة التكرار
    const seenDates = new Set();

    const uniqueData =
        allData.filter(item => {
            const key =
                `${item.gregorianYear}-${item.gregorianMonth}-${item.gregorianDay}`;

            if (seenDates.has(key)) {
                return false;
            }

            seenDates.add(key);
            return true;
        });

    // اختيار الشهر الهجري المطلوب
    const result =
        uniqueData.filter(item =>
            Number(item.hijriMonth) === Number(hijriMonth) &&
            Number(item.hijriYear) === Number(hijriYear)
        );

        // تصحيح ذي الحجة فقط
const fixedResult =
    Number(hijriMonth) === 12 &&
    typeof fixDhuAlHijjahMonth === "function"
        ? fixDhuAlHijjahMonth(result)
        : result;
    // ترتيب الأيام هجريًا
    result.sort(
        (a, b) =>
            Number(a.hijriDay) -
            Number(b.hijriDay)
    );

   return fixedResult;
}

// ============================================
// البحث عن التاريخ الهجري ليوم ميلادي
// ============================================

function getHijriForGregorianDay(monthData, day) {
    if (!Array.isArray(monthData)) {
        return null;
    }

    return (
        monthData.find(
            item =>
                Number(item.gregorianDay) === Number(day)
        ) || null
    );
}

// ============================================
// الحصول على تاريخ ميلادي من بيانات هجري
// ============================================

function getGregorianDateFromHijri(hijri) {
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
// تحديد الشهر الهجري الحالي
// ============================================

async function initializeHijriMonth() {
    if (
        currentHijriMonth !== null &&
        currentHijriYear !== null
    ) {
        return;
    }

    const currentGregorianData =
        await getHijriCalendarMonth(
            currentDate.getMonth(),
            currentDate.getFullYear()
        );

    const todayHijri =
        currentGregorianData.find(item =>
            Number(item.gregorianDay) === currentDate.getDate() &&
            Number(item.gregorianMonth) === currentDate.getMonth() + 1 &&
            Number(item.gregorianYear) === currentDate.getFullYear()
        );

    if (todayHijri) {
        currentHijriMonth =
            Number(todayHijri.hijriMonth);

        currentHijriYear =
            Number(todayHijri.hijriYear);

        hijriAnchorDate =
            new Date(currentDate);

        return;
    }

    // احتياط
    const nearbyData =
        await getHijriMonthData(
            1,
            1,
            currentDate
        );

    const fallback =
        nearbyData.find(item =>
            Number(item.gregorianDay) === currentDate.getDate() &&
            Number(item.gregorianMonth) === currentDate.getMonth() + 1 &&
            Number(item.gregorianYear) === currentDate.getFullYear()
        );

    if (fallback) {
        currentHijriMonth =
            Number(fallback.hijriMonth);

        currentHijriYear =
            Number(fallback.hijriYear);

        hijriAnchorDate =
            new Date(currentDate);
    }
}

// ============================================
// رسم التقويم
// ============================================

async function renderCalendar() {
    const calendar =
        document.getElementById("calendar");

    if (!calendar) {
        console.error("لم يتم العثور على عنصر #calendar");
        return;
    }

    await initializeHijriMonth();

    if (
        currentHijriMonth === null ||
        currentHijriYear === null
    ) {
        console.error("لم يتم تحديد الشهر الهجري الحالي");
        return;
    }

    calendar.innerHTML = "";

    // عنوان الشهر
    const monthYear =
        document.getElementById("monthYear");

    if (monthYear) {
        monthYear.textContent =
            `${getHijriMonthName(currentHijriMonth)} ${currentHijriYear} هـ`;
    }

    // التاريخ الميلادي الحالي
    const today = new Date();

    const todayGregorian =
        document.getElementById("todayGregorian");

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

    // بيانات الشهر الهجري
    let monthData =
        await getHijriMonthData(
            currentHijriMonth,
            currentHijriYear,
            hijriAnchorDate
        );

    if (!monthData.length) {
        monthData =
            await getHijriMonthData(
                currentHijriMonth,
                currentHijriYear,
                new Date()
            );
    }

    if (!monthData.length) {
        console.error(
            "لم يتم العثور على أيام الشهر الهجري"
        );
        return;
    }

    // تحديث المرجع الميلادي
    const firstHijriDay = monthData[0];

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

    // التاريخ الهجري لليوم الحالي
    const todayMonthData =
        await getHijriCalendarMonth(
            today.getMonth(),
            today.getFullYear()
        );

    const todayHijri =
        todayMonthData.find(item =>
            Number(item.gregorianDay) === today.getDate() &&
            Number(item.gregorianMonth) === today.getMonth() + 1 &&
            Number(item.gregorianYear) === today.getFullYear()
        );

    const todayHijriElement =
        document.getElementById("todayHijri");

    if (todayHijriElement && todayHijri) {
        todayHijriElement.textContent =
            `${todayHijri.hijriDay} ${todayHijri.hijriMonthName} ${todayHijri.hijriYear} هـ`;
    }

    // أسماء أيام الأسبوع
    dayNames.forEach(day => {
        const header =
            document.createElement("div");

        header.className = "day-name";
        header.textContent = day;

        calendar.appendChild(header);
    });

    // تحديد مكان أول يوم
    const firstDayDate =
        getGregorianDateFromHijri(
            monthData[0]
        );

    const firstDay =
        firstDayDate
            ? firstDayDate.getDay()
            : 0;

    // الخانات الفارغة
    for (let i = 0; i < firstDay; i++) {
        const empty =
            document.createElement("div");

        empty.className = "empty";

        calendar.appendChild(empty);
    }

    // إنشاء أيام الشهر
monthData.forEach(hijriDayData => {
        createDay(
            hijriDayData,
            calendar
        );
    });
// تحديث المناسبات الجانبية
    // بعد اكتمال رسم التقويم
    if (typeof showMonthEvents === "function") {
        await showMonthEvents([
            {
                month: currentHijriMonth,
                year: currentHijriYear
            }
        ]);
    }
}
// ============================================
// إنشاء يوم
// ============================================

function createDay(hijri, container) {
    const div =
        document.createElement("div");

    div.className = "calendar-day";

    const date =
        getGregorianDateFromHijri(hijri);

    if (!date) {
        return;
    }

    // المناسبات الإمامية
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

    // مناسبات المستخدم
    let personalEvents = [];

    if (
        typeof userEvents !== "undefined" &&
        Array.isArray(userEvents)
    ) {
        personalEvents =
            userEvents.filter(event =>
                Number(event.day) === date.getDate() &&
                Number(event.month) === date.getMonth() + 1 &&
                Number(event.year) === date.getFullYear()
            );
    }

    const allEvents = [
        ...imamEvents,
        ...personalEvents
    ];

    // محتوى اليوم
    div.innerHTML = `
        <div class="gregorian-day">
            ${hijri.hijriDay}
        </div>

        <div class="hijri-day">
            ${hijri.gregorianDay}/${hijri.gregorianMonth}
        </div>

        <div class="day-events"></div>
    `;

    // عرض المناسبات
    const eventsBox =
        div.querySelector(".day-events");

    if (
        eventsBox &&
        allEvents.length
    ) {
        allEvents
            .slice(0, 2)
            .forEach(event => {
                const item =
                    document.createElement("div");

                item.className = "mini-event";

                item.textContent =
                    Number(event.importance) >= 5
                        ? `⭐ ${event.title}`
                        : `• ${event.title}`;

                if (event.color) {
                    item.style.color =
                        event.color;
                }

                eventsBox.appendChild(item);
            });
    }

    // تلوين اليوم حسب نوع المناسبة
    if (allEvents.length) {
        div.classList.add("has-event");

        const type =
            allEvents[0].type;

        if (
            type === "death" ||
            type === "martyrdom" ||
            type === "martyr"
        ) {
            div.classList.add("death-event");
        } else if (
            type === "birth" ||
            type === "marriage"
        ) {
            div.classList.add("happy-event");
        }
    }

    // اليوم الحالي
    const today = new Date();

    if (
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
    ) {
        div.classList.add("today");
    }

    // الضغط على اليوم
    div.addEventListener("click", () => {
        openDayDetails(
            date,
            hijri,
            allEvents
        );
    });

    container.appendChild(div);
}

// ============================================
// التاريخ الهجري الإمامي
// ============================================

async function getShiaCompatibleHijriDate(date) {
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
            day: result.hijriDay,
            month: result.hijriMonth,
            monthName: result.hijriMonthName,
            year: result.hijriYear
        };

    } catch (error) {
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

function openDayDetails(date, hijri, events) {
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

    if (!events || !events.length) {
        html += `
            <p class="no-events">
                لا توجد مناسبات
            </p>
        `;
    } else {
        events.forEach(event => {
            const isUserEvent =
                typeof userEvents !== "undefined" &&
                Array.isArray(userEvents) &&
                userEvents.some(
                    userEvent =>
                        Number(userEvent.id) ===
                        Number(event.id)
                );

            html += `
                <div class="detail-event">

                    <span>
                        ${event.title}
                    </span>
            `;

            // عطلة رسمية
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

            // حذف مناسبة المستخدم
            if (isUserEvent) {
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

            html += `
                </div>
            `;
        });
    }

    const detailsContent =
        document.getElementById(
            "detailsContent"
        );

    const detailsModal =
        document.getElementById(
            "detailsModal"
        );

    if (detailsContent) {
        detailsContent.innerHTML = html;
    }

    if (detailsModal) {
        detailsModal.style.display = "flex";
    }
}

// ============================================
// حذف مناسبة المستخدم
// ============================================

function deleteEventFromDetails(id) {
    if (typeof deleteEvent !== "function") {
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
        modal.style.display = "none";
    }

    renderCalendar();
}

// ============================================
// نجوم الأهمية
// ============================================

function createImportanceStars(level) {
    if (!level || level <= 0) {
        return "";
    }

    const stars =
        "⭐".repeat(Number(level));

    return `
        <div class="event-importance">
            ${stars}
        </div>
    `;
}

// ============================================
// الشهر الهجري التالي
// ============================================
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

    // الانتقال مباشرة إلى الشهر التالي
    currentHijriMonth++;

    if (currentHijriMonth > 12) {
        currentHijriMonth = 1;
        currentHijriYear++;
    }

    // إعادة رسم التقويم
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

    // الانتقال مباشرة إلى الشهر السابق
    currentHijriMonth--;

    if (currentHijriMonth < 1) {
        currentHijriMonth = 12;
        currentHijriYear--;
    }

    // إعادة رسم التقويم
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

    // استعادة الوضع المحفوظ
    if (
        localStorage.getItem("theme") === "dark"
    ) {
        document.body.classList.add(
            "dark-mode"
        );
    }

    if (!darkModeBtn) {
        return;
    }

    if (
        darkModeBtn.dataset.ready === "true"
    ) {
        return;
    }

    darkModeBtn.dataset.ready = "true";

    darkModeBtn.addEventListener(
        "click",
        () => {
            const isDark =
                document.body.classList.toggle(
                    "dark-mode"
                );

            localStorage.setItem(
                "theme",
                isDark ? "dark" : "light"
            );
        }
    );
}

// ============================================
// أسماء الأشهر الهجرية
// ============================================

function getHijriMonthName(month) {
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

    return hijriMonths[Number(month)] || "";
}

// ============================================
// حول التطبيق
// ============================================

function setupAboutApp() {
    const aboutButton =
        document.getElementById("aboutBtn");

    const aboutModal =
        document.getElementById("aboutModal");

    if (!aboutButton || !aboutModal) {
        return;
    }

    if (
        aboutButton.dataset.aboutReady === "true"
    ) {
        return;
    }

    aboutButton.dataset.aboutReady = "true";

    aboutButton.addEventListener(
        "click",
        openAboutApp
    );

    const closeAbout =
        document.getElementById("closeAbout");

    if (closeAbout) {
        closeAbout.addEventListener(
            "click",
            closeAboutApp
        );
    }

    aboutModal.addEventListener(
        "click",
        event => {
            if (event.target === aboutModal) {
                closeAboutApp();
            }
        }
    );
}

// ============================================
// فتح حول التطبيق
// ============================================

function openAboutApp() {
    const aboutModal =
        document.getElementById(
            "aboutModal"
        );

    if (aboutModal) {
        aboutModal.style.display = "flex";
    }
}

// ============================================
// إغلاق حول التطبيق
// ============================================

function closeAboutApp() {
    const aboutModal =
        document.getElementById(
            "aboutModal"
        );

    if (aboutModal) {
        aboutModal.style.display = "none";
    }
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

    if (!detailsModal || !closeDetails) {
        return;
    }

    if (
        closeDetails.dataset.ready === "true"
    ) {
        return;
    }

    closeDetails.dataset.ready = "true";

    closeDetails.addEventListener(
        "click",
        () => {
            detailsModal.style.display = "none";
        }
    );

    detailsModal.addEventListener(
        "click",
        event => {
            if (event.target === detailsModal) {
                detailsModal.style.display = "none";
            }
        }
    );
}

// ============================================
// الدوال العامة
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

window.closeAboutApp =
    closeAboutApp;