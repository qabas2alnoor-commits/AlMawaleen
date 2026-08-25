// ============================================
// dhu-al-hijjah-fix.js
// تصحيح عدد أيام شهر ذي الحجة فقط
// مواقيت الموالين
// ============================================

function isDhuAlHijjah(hijriMonth) {
    return Number(hijriMonth) === 12;
}

function fixDhuAlHijjahMonth(monthData) {

    if (!Array.isArray(monthData)) {
        return monthData;
    }

    // نطبق التصحيح على ذي الحجة فقط
    const dhuAlHijjahDays =
        monthData.filter(item =>
            Number(item.hijriMonth) === 12
        );

    if (!dhuAlHijjahDays.length) {
        return monthData;
    }

    // ذي الحجة = 29 يومًا
    return monthData.filter(item => {

        if (Number(item.hijriMonth) !== 12) {
            return true;
        }

        return Number(item.hijriDay) <= 29;
    });
}

window.isDhuAlHijjah =
    isDhuAlHijjah;

window.fixDhuAlHijjahMonth =
    fixDhuAlHijjahMonth;