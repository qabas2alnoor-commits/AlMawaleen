// =====================================
// hijri.js
// Hijri Date - API Helper
// مواقيت الولاء
// =====================================


// =====================================
// الحصول على التاريخ الهجري
// لتاريخ ميلادي محدد
//
// ملاحظة:
// لا يتم تطبيق hijri_offset هنا.
//
// التصحيح يتم في calendar.js
// اعتمادًا على إعداد Supabase.
// =====================================

async function getHijriDate(
    year,
    month,
    day
) {

    try {

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


        // -------------------------------------
        // API
        // -------------------------------------

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

            return "";

        }


        const hijri =
            result.data.hijri;


        return {

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

    }

    catch (error) {

        console.error(
            "Hijri Error:",
            error
        );

        return "";

    }

}


// =====================================
// الدالة العامة
// =====================================

window.getHijriDate =
    getHijriDate;