// ============================================
// events.js
// إدارة أحداث المستخدم
// ============================================


// ============================================
// بيانات أحداث المستخدم
// ============================================

let userEvents = [];


// ============================================
// تحميل الأحداث من LocalStorage
// ============================================

function loadUserEvents() {

    const saved = localStorage.getItem("calendarEvents");

    if (saved) {

        try {

            userEvents = JSON.parse(saved);

            // التأكد من أن البيانات مصفوفة
            if (!Array.isArray(userEvents)) {
                userEvents = [];
            }

        } catch (error) {

            console.error(
                "خطأ في قراءة أحداث المستخدم:",
                error
            );

            userEvents = [];
        }

    } else {

        userEvents = [];

    }

}


// ============================================
// حفظ الأحداث في LocalStorage
// ============================================

function saveUserEvents() {

    localStorage.setItem(
        "calendarEvents",
        JSON.stringify(userEvents)
    );

}


// ============================================
// عرض أحداث المستخدم في القائمة
// ============================================

function renderUserEvents() {

    const list = document.getElementById("eventsList");

    if (!list) {
        return;
    }

    list.innerHTML = "";


    // لا توجد أحداث
    if (userEvents.length === 0) {

        list.innerHTML = `
            <div class="no-events">
                لا توجد أحداث مضافة
            </div>
        `;

        return;
    }


    // عرض الأحداث
    userEvents.forEach(event => {

        const div = document.createElement("div");

        div.className = "event " + (event.type || "");


        div.innerHTML = `
            <span>
                ${event.title || "حدث"}
            </span>

            <button
                type="button"
                onclick="deleteEvent(${event.id})"
                title="حذف الحدث"
            >
                ×
            </button>
        `;


        list.appendChild(div);

    });

}


// ============================================
// حذف حدث المستخدم
// ============================================

function deleteEvent(id) {

    // تحويل id إلى رقم للمقارنة بشكل صحيح
    id = Number(id);


    // حذف الحدث
    userEvents = userEvents.filter(
        event => Number(event.id) !== id
    );


    // حفظ القائمة الجديدة
    saveUserEvents();


    // إعادة عرض القائمة
    renderUserEvents();


    // إعادة رسم التقويم
    if (typeof renderCalendar === "function") {

        renderCalendar();

    }

}


// ============================================
// تشغيل أحداث المستخدم عند تحميل الصفحة
// ============================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadUserEvents();

        renderUserEvents();

    }
);