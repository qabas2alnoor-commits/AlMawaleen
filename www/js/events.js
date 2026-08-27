// ============================================
// events.js
// إدارة أحداث المستخدم
// مواقيت الموالين
// ============================================

let userEvents = [];


// ============================================
// تحميل أحداث المستخدم
// ============================================

function loadUserEvents() {

    const saved =
        localStorage.getItem("calendarEvents");

    if (!saved) {

        userEvents = [];

        return;

    }

    try {

        const parsed =
            JSON.parse(saved);

        userEvents =
            Array.isArray(parsed)
                ? parsed
                : [];

    } catch (error) {

        console.error(
            "خطأ في قراءة أحداث المستخدم:",
            error
        );

        userEvents = [];

    }

}


// ============================================
// تهيئة أحداث المستخدم
// ============================================

function initializeUserEvents() {

    loadUserEvents();

    if (
        typeof renderUserEvents === "function"
    ) {

        renderUserEvents();

    }

}


// ============================================
// حفظ أحداث المستخدم
// ============================================

function saveUserEvents() {

    localStorage.setItem(
        "calendarEvents",
        JSON.stringify(userEvents)
    );

}


// ============================================
// حذف حدث مستخدم
// ============================================

function deleteEvent(id) {

    const eventId =
        Number(id);

    userEvents =
        userEvents.filter(
            event =>
                Number(event.id) !== eventId
        );

    saveUserEvents();

    if (
        typeof renderUserEvents === "function"
    ) {

        renderUserEvents();

    }

    if (
        typeof renderCalendar === "function"
    ) {

        renderCalendar();

    }

}


// ============================================
// التشغيل
// ============================================

document.addEventListener(
    "DOMContentLoaded",
    initializeUserEvents
);


// ============================================
// الدوال العامة
// ============================================

window.loadUserEvents =
    loadUserEvents;

window.initializeUserEvents =
    initializeUserEvents;

window.saveUserEvents =
    saveUserEvents;

window.deleteEvent =
    deleteEvent;