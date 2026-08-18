// ============================================
// supabase-client.js
// اتصال Supabase
// مواقيت الولاء
// ============================================


// ============================================
// التحقق من إعدادات Supabase
// ============================================

if (
    typeof SUPABASE_URL === "undefined" ||
    typeof SUPABASE_ANON_KEY === "undefined"
) {

    console.error(
        "خطأ: إعدادات Supabase غير موجودة."
    );

} else if (
    typeof window.supabase === "undefined"
) {

    console.error(
        "خطأ: مكتبة Supabase لم يتم تحميلها."
    );

} else {

    // ========================================
    // إنشاء عميل Supabase
    // ========================================

    const supabaseClient =
        window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_ANON_KEY
        );


    // ========================================
    // إتاحة العميل لجميع الملفات
    // ========================================

    window.supabaseClient =
        supabaseClient;


    console.log(
        "Supabase Client تم تهيئته بنجاح."
    );


    // ========================================
    // تحميل المناسبات من Supabase
    // ========================================

    async function loadSupabaseEvents() {

        try {

            const {
                data,
                error
            } =
                await supabaseClient
                    .from("events")
                    .select("*")
                    .eq("is_active", true)
                    .order(
                        "hijri_month",
                        {
                            ascending: true
                        }
                    )
                    .order(
                        "hijri_day",
                        {
                            ascending: true
                        }
                    );

            if (error) {

                console.error(
                    "خطأ تحميل المناسبات من Supabase:",
                    error
                );

                return [];

            }

            return Array.isArray(data)
                ? data
                : [];

        } catch (error) {

            console.error(
                "خطأ في الاتصال بـ Supabase:",
                error
            );

            return [];

        }

    }


    // ========================================
    // جعل الدالة متاحة عالمياً
    // ========================================

    window.loadSupabaseEvents =
        loadSupabaseEvents;

}