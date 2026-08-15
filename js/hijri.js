// =====================================
// Hijri Date - Imami Adjustment
// =====================================

// -1 = إنقاص يوم
//  0 = بدون تعديل
// +1 = إضافة يوم


async function getHijriDate(year, month, day) {

    try {

        // =====================================
        // إنشاء التاريخ الميلادي
        // =====================================

        let date = new Date(
            year,
            month,
            day
        );


        // =====================================
        // تطبيق التصحيح الإمامي
        // =====================================

        const offset =
            typeof IMAMI_HIJRI_OFFSET !== "undefined"
                ? Number(IMAMI_HIJRI_OFFSET)
                : 0;


        if (
            Number.isFinite(offset) &&
            offset !== 0
        ) {

            date.setDate(
                date.getDate() + offset
            );

        }


        // =====================================
        // تجهيز التاريخ لإرساله إلى API
        // =====================================

        let d =
            String(
                date.getDate()
            ).padStart(
                2,
                "0"
            );


        let m =
            String(
                date.getMonth() + 1
            ).padStart(
                2,
                "0"
            );


        let y =
            date.getFullYear();


        // =====================================
        // طلب التاريخ الهجري
        // =====================================

        let response =
            await fetch(
                `https://api.aladhan.com/v1/gToH?date=${d}-${m}-${y}`
            );


        if (
            !response.ok
        ) {

            throw new Error(
                `HTTP ${response.status}`
            );

        }


        let result =
            await response.json();


        if (
            result.code !== 200
        ) {

            return "";

        }


        // =====================================
        // استخراج التاريخ الهجري
        // =====================================

        let hijri =
            result.data.hijri;


        return {

            day:
                Number(
                    hijri.day
                ),

            month:
                Number(
                    hijri.month.number
                ),

            year:
                Number(
                    hijri.year
                ),

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