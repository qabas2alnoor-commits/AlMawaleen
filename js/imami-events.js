// ============================================
// المناسبات الإسلامية - الشيعة الإمامية
// يعتمد على التاريخ الهجري
//
// month يبدأ من 0
// محرم = 0
// صفر = 1
// ربيع الأول = 2
// ربيع الثاني = 3
// جمادى الأولى = 4
// جمادى الآخرة = 5
// رجب = 6
// شعبان = 7
// رمضان = 8
// شوال = 9
// ذو القعدة = 10
// ذو الحجة = 11
// ============================================

const islamicEvents = [

    // =========================
    // محرم
    // =========================

    {
        day: 1,
        month: 0,
        title: "بداية السنة الهجرية",
        type: "other",
        importance: 4,
        color: "#1565C0",
        hijri: true
    },

    {
        day: 10,
        month: 0,
        title: "عاشوراء - استشهاد الإمام الحسين (ع)",
        type: "martyr",
        importance: 5,
        color: "#C62828",
        hijri: true
    },

    {
        day: 11,
        month: 0,
        title: "اليوم الحادي عشر من محرم",
        type: "other",
        importance: 3,
        color: "#C62828",
        hijri: true
    },

    {
        day: 25,
        month: 0,
        title: "استشهاد الإمام زين العابدين (ع)",
        type: "martyr",
        importance: 4,
        color: "#C62828",
        hijri: true
    },


    // =========================
    // صفر
    // =========================

    {
        day: 7,
        month: 1,
        title: "استشهاد الإمام الحسن المجتبى (ع)",
        type: "martyr",
        importance: 5,
        color: "#C62828",
        hijri: true
    },

    {
        day: 20,
        month: 1,
        title: "زيارة الأربعين للإمام الحسين (ع)",
        type: "other",
        importance: 5,
        color: "#1565C0",
        hijri: true
    },

    {
        day: 28,
        month: 1,
        title: "وفاة الرسول محمد ﷺ",
        type: "death",
        importance: 5,
        color: "#C62828",
        hijri: true
    },

    {
        day: 30,
        month: 1,
        title: "استشهاد الإمام علي بن موسى الرضا (ع)",
        type: "martyr",
        importance: 5,
        color: "#C62828",
        hijri: true
    },


    // =========================
    // ربيع الأول
    // =========================

    {
        day: 8,
        month: 2,
        title: "استشهاد الإمام الحسن العسكري (ع)",
        type: "martyr",
        importance: 5,
        color: "#C62828",
        hijri: true
    },

    {
        day: 9,
        month: 2,
        title: "بدء إمامة الإمام المهدي (عج)",
        type: "other",
        importance: 5,
        color: "#1565C0",
        hijri: true
    },

    {
        day: 17,
        month: 2,
        title: "مولد الرسول محمد ﷺ",
        type: "birth",
        importance: 5,
        color: "#2E7D32",
        hijri: true
    },

    {
        day: 17,
        month: 2,
        title: "ولادة الإمام جعفر الصادق (ع)",
        type: "birth",
        importance: 5,
        color: "#2E7D32",
        hijri: true
    },


    // =========================
    // ربيع الثاني
    // =========================

    // لا توجد مناسبة جديدة من قائمتك هنا


    // =========================
    // جمادى الأولى
    // =========================

    {
        day: 5,
        month: 4,
        title: "ولادة السيدة زينب (ع)",
        type: "birth",
        importance: 5,
        color: "#2E7D32",
        hijri: true
    },


    // =========================
    // جمادى الآخرة
    // =========================

    {
        day: 3,
        month: 5,
        title: "استشهاد السيدة فاطمة الزهراء (ع)",
        type: "martyr",
        importance: 5,
        color: "#C62828",
        hijri: true
    },

    {
        day: 20,
        month: 5,
        title: "ولادة السيدة فاطمة الزهراء (ع)",
        type: "birth",
        importance: 5,
        color: "#2E7D32",
        hijri: true
    },


    // =========================
    // رجب
    // =========================

    {
        day: 1,
        month: 6,
        title: "ولادة الإمام محمد الباقر (ع)",
        type: "birth",
        importance: 4,
        color: "#2E7D32",
        hijri: true
    },

    {
        day: 10,
        month: 6,
        title: "ولادة الإمام محمد الجواد (ع)",
        type: "birth",
        importance: 4,
        color: "#2E7D32",
        hijri: true
    },

    {
        day: 13,
        month: 6,
        title: "ولادة الإمام علي بن أبي طالب (ع)",
        type: "birth",
        importance: 5,
        color: "#2E7D32",
        hijri: true
    },

    {
        day: 27,
        month: 6,
        title: "المبعث النبوي الشريف",
        type: "other",
        importance: 5,
        color: "#1565C0",
        hijri: true
    },


    // =========================
    // شعبان
    // =========================

    {
        day: 3,
        month: 7,
        title: "ولادة الإمام الحسين (ع)",
        type: "birth",
        importance: 5,
        color: "#2E7D32",
        hijri: true
    },

    {
        day: 4,
        month: 7,
        title: "ولادة أبي الفضل العباس (ع)",
        type: "birth",
        importance: 5,
        color: "#2E7D32",
        hijri: true
    },

    {
        day: 5,
        month: 7,
        title: "ولادة الإمام زين العابدين (ع)",
        type: "birth",
        importance: 4,
        color: "#2E7D32",
        hijri: true
    },

    {
        day: 11,
        month: 7,
        title: "ولادة علي الأكبر (ع)",
        type: "birth",
        importance: 4,
        color: "#2E7D32",
        hijri: true
    },

    {
        day: 15,
        month: 7,
        title: "ولادة الإمام المهدي (عج)",
        type: "birth",
        importance: 5,
        color: "#2E7D32",
        hijri: true
    },


    // =========================
    // رمضان
    // =========================

    {
        day: 15,
        month: 8,
        title: "ولادة الإمام الحسن المجتبى (ع)",
        type: "birth",
        importance: 5,
        color: "#2E7D32",
        hijri: true
    },

    {
        day: 19,
        month: 8,
        title: "ضربة الإمام علي (ع)",
        type: "martyr",
        importance: 5,
        color: "#C62828",
        hijri: true
    },

    {
        day: 21,
        month: 8,
        title: "استشهاد الإمام علي (ع)",
        type: "martyr",
        importance: 5,
        color: "#C62828",
        hijri: true
    },

    {
        day: 23,
        month: 8,
        title: "ليلة القدر",
        type: "other",
        importance: 5,
        color: "#1565C0",
        hijri: true
    },


    // =========================
    // شوال
    // =========================

    {
        day: 1,
        month: 9,
        title: "عيد الفطر",
        type: "other",
        importance: 5,
        color: "#1565C0",
        hijri: true
    },

    {
        day: 25,
        month: 9,
        title: "استشهاد الإمام جعفر الصادق (ع)",
        type: "martyr",
        importance: 5,
        color: "#C62828",
        hijri: true
    },


    // =========================
    // ذو القعدة
    // =========================

    {
        day: 1,
        month: 10,
        title: "ولادة السيدة فاطمة المعصومة (ع)",
        type: "birth",
        importance: 4,
        color: "#2E7D32",
        hijri: true
    },

    {
        day: 10,
        month: 10,
        title: "ولادة الإمام محمد الجواد (ع)",
        type: "birth",
        importance: 4,
        color: "#2E7D32",
        hijri: true
    },

    {
        day: 11,
        month: 10,
        title: "ولادة الإمام علي الرضا (ع)",
        type: "birth",
        importance: 5,
        color: "#2E7D32",
        hijri: true
    },

    {
        day: 25,
        month: 10,
        title: "دحو الأرض",
        type: "other",
        importance: 4,
        color: "#1565C0",
        hijri: true
    },

    {
        day: 25,
        month: 10,
        title: "استشهاد الإمام موسى الكاظم (ع)",
        type: "martyr",
        importance: 5,
        color: "#C62828",
        hijri: true
    },


    // =========================
    // ذو الحجة
    // =========================

    {
        day: 9,
        month: 11,
        title: "يوم عرفة",
        type: "other",
        importance: 5,
        color: "#1565C0",
        hijri: true
    },

    {
        day: 10,
        month: 11,
        title: "عيد الأضحى",
        type: "other",
        importance: 5,
        color: "#1565C0",
        hijri: true
    },

    {
        day: 15,
        month: 11,
        title: "ولادة الإمام علي الهادي (ع)",
        type: "birth",
        importance: 4,
        color: "#2E7D32",
        hijri: true
    },

    {
        day: 18,
        month: 11,
        title: "عيد الغدير الأغر",
        type: "other",
        importance: 5,
        color: "#1565C0",
        hijri: true
    },

    {
        day: 24,
        month: 11,
        title: "يوم المباهلة",
        type: "other",
        importance: 4,
        color: "#1565C0",
        hijri: true
    },

    {
        day: 29,
        month: 11,
        title: "استشهاد الإمام محمد الجواد (ع)",
        type: "martyr",
        importance: 4,
        color: "#C62828",
        hijri: true
    }

];