
// ============================================
// Supabase Client
// مواقيت الولاء
// ============================================
const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);


// ============================================
// المناسبات القادمة من Supabase
// ============================================

let supabaseHijriEvents = [];


// ============================================
// جلب المناسبات من Supabase
// ============================================

async function loadSupabaseEvents() {

    try {

        const { data, error } = await supabaseClient
            .from("events")
            .select("*")
            .eq("is_active", true)
            .order("hijri_month", { ascending: true })
            .order("hijri_day", { ascending: true });


        // ========================================
        // معالجة الخطأ
        // ========================================

        if (error) {

            console.error(
                "خطأ في قراءة المناسبات من Supabase:",
                error
            );

            supabaseHijriEvents = [];

            return [];

        }


        // ========================================
        // تحويل أعمدة Supabase إلى الشكل
        // الذي يستخدمه التطبيق حاليًا
        // ========================================

        supabaseHijriEvents = (data || []).map(event => ({

            id:
                event.source_id ||
                String(event.id),


            month:
                Number(event.hijri_month),


            day:
                Number(event.hijri_day),


            title:
                event.name,


            type:
                event.event_type,


            description:
                event.description || "",


            importance:
                Number(event.importance || 3),


            color:
                event.color || "#777",


            // ========================================
            // حالة تفعيل المناسبة
            // ========================================

            is_active:
                event.is_active,


            // ========================================
            // العطلة الرسمية
            // نحتفظ بالاسمين للتوافق مع
            // جميع أجزاء التطبيق
            // ========================================

            isHoliday:
                event.is_holiday,


            is_holiday:
                event.is_holiday

        }));


        // ========================================
        // سجل عدد المناسبات المحملة
        // ========================================

      


        // ========================================
        // إرجاع المناسبات
        // ========================================

        return supabaseHijriEvents;

    }


    catch (error) {

        console.error(
            "خطأ غير متوقع في تحميل المناسبات من Supabase:",
            error
        );

        supabaseHijriEvents = [];

        return [];

    }

}
