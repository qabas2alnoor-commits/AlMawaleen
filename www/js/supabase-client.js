// ============================================
// supabase-client.js
// اتصال Supabase
// تطبيق الموالين
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
    // إتاحة العميل عالميًا
    // ========================================

    window.supabaseClient =
        supabaseClient;


    console.log(
        "Supabase Client تم تهيئته بنجاح."
    );

}