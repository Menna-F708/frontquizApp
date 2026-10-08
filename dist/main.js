/* ============================================================
   1) الأنواع (Types)
   بنقول لـ TypeScript شكل الداتا اللي جاية من questions.json
   ============================================================ */
/* ============================================================
   2) دالة تحميل الداتا
   بتعمل fetch للملف وترجّع الداتا بالنوع اللي هنحدده وقت الاستدعاء
   ============================================================ */
async function fetchData(url) {
    const response = await fetch(url); // بنطلب الملف
    const data = (await response.json()); // بنطلّع الداتا اللي جواه
    return data;
}
/* ============================================================
   3) اختيار عناصر الصفحة (DOM)
   كل متغير بيمسك عنصر من index.html عن طريق الـ id بتاعه
   ============================================================ */
let cardGrid = document.getElementById("grid"); // حاوية كروت المواضيع
let topicHide = document.getElementById("topics"); // قسم "Choose a topic"
let homeHide = document.getElementById("home"); // قسم الـ Hero
let quizSection = document.getElementById("quiz"); // صفحة الكويز
let quizTitle = document.getElementById("qt"); // عنوان الكويز (اسم الموضوع)
let quizCount = document.getElementById("qn"); // "Question 1 of 15"
let listAnswer = document.getElementById("qo"); // مكان أزرار الاختيارات
let titleQuestion = document.getElementById("qq"); // نص السؤال
let questionTag = document.getElementById("qtag"); // شارة "Question 1"
let nextBtn = document.getElementById("next"); // زرار Next
let resultSection = document.getElementById("result"); // صفحة النتيجة
let resultScore = document.getElementById("rs"); // الرقم الكبير (السكور)
let tryAgain = document.getElementById("again"); // زرار Try again
let allTopicsBtn = document.getElementById("allTopics"); // زرار All topics
let progress = document.getElementById("qb"); // شريط التقدم
let progressSection = document.getElementById("progress"); // صفحة Progress
let pgridEl = document.getElementById("pgrid"); // كروت صفحة Progress
let statTopics = document.getElementById("nT"); // رقم عدد المواضيع
let statQuestions = document.getElementById("nQ"); // رقم عدد الأسئلة
let statDone = document.getElementById("nD"); // رقم المواضيع المكتملة
const navBtns = document.querySelectorAll(".nav"); // أزرار السايدبار
/* ============================================================
   4) المتغيرات اللي بتفتكر حالة البرنامج (State)
   ============================================================ */
let allTopics = []; // كل المواضيع بعد التحميل
let currentTopic = null; // الموضوع اللي المستخدم فاتحه دلوقتي
let currentIndex = 0; // رقم السؤال الحالي (بيبدأ من 0)
let score = 0; // عدد الإجابات الصح
/* ============================================================
   5) الأيقونات
   svg() بتلف أي رسمة جوه وسم svg بنفس الإعدادات،
   وobject icons فيه رسمة لكل موضوع حسب الـ id بتاعه
   ============================================================ */
const svg = (inner) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;
const icons = {
    html: svg(`<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>`),
    css: svg(`<path d="M12 3a9 9 0 1 0 0 18c1.1 0 2-.9 2-2 0-.5-.2-1-.5-1.3-.3-.4-.5-.8-.5-1.3 0-1.1.9-2 2-2h2.4A3.6 3.6 0 0 0 21 11.8C21 7 17 3 12 3z"/><circle cx="7.5" cy="11" r="1"/><circle cx="10" cy="7" r="1"/><circle cx="15" cy="7" r="1"/>`),
    flex: svg(`<rect x="3" y="5" width="5" height="14" rx="1"/><rect x="10" y="5" width="5" height="9" rx="1"/><rect x="17" y="5" width="4" height="12" rx="1"/>`),
    grid: svg(`<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>`),
    js: svg(`<path d="M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 1-2 2 2 2 0 0 1 2 2v5c0 1.1.9 2 2 2h1"/><path d="M16 21h1a2 2 0 0 0 2-2v-5c0-1.1.9-2 2-2a2 2 0 0 1-2-2V5a2 2 0 0 0-2-2h-1"/>`),
    ts: svg(`<rect x="3" y="3" width="18" height="18" rx="4"/><text x="12" y="16" text-anchor="middle" font-size="9.5" font-weight="800" font-family="DM Sans, sans-serif" fill="currentColor" stroke="none">TS</text>`),
    react: svg(`<circle cx="12" cy="12" r="1.5"/><ellipse cx="12" cy="12" rx="10" ry="4"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)"/>`),
    dom: svg(`<path d="M5 3l14 7-6 2-2 6z"/>`),
    a11y: svg(`<circle cx="12" cy="4.5" r="2"/><path d="M5 8h14M12 8v5m0 0-3 7m3-7 3 7"/>`),
    api: svg(`<path d="M17 4l3 3-3 3"/><path d="M20 7H8"/><path d="M7 20l-3-3 3-3"/><path d="M4 17h12"/>`),
};
/* ============================================================
   6) init: بتشتغل أول ما الصفحة تفتح
   بتحمّل الأسئلة وترسم كارت لكل موضوع
   ============================================================ */
async function init() {
    const result = await fetchData("questions.json");
    allTopics = result; // نخزّن المواضيع عشان باقي الدوال تشوفها
    // نحوّل كل موضوع لنص HTML بتاع كارت
    const cards = result.map((topic) => {
        return `
      <button
        class="card"
        data-id="${topic.id}"
        style="--c: ${topic.color}"
      >
        <span class="tile">${icons[topic.id] ?? topic.icon}</span>

        <span class="info">
          <b>${topic.name}</b>
          <small>${topic.questions.length} questions</small>
        </span>

        <span class="go">→</span>
      </button>
    `;
    });
    // نحط الكروت كلها جوه الحاوية
    if (cardGrid) {
        cardGrid.innerHTML = cards.join("");
    }
    updateStats(); // نكتب الأرقام في الصفحة الرئيسية
}
/* ============================================================
   7) showQuestion: بترسم السؤال الحالي (حسب currentIndex)
   بنناديها أول سؤال، وبعد كل Next، وبعد Try again
   ============================================================ */
function showQuestion() {
    if (!currentTopic)
        return; // لو مفيش موضوع مختار، اخرجي
    // زرار Next يتقفل مع كل سؤال جديد لحد ما المستخدم يجاوب
    if (nextBtn) {
        nextBtn.disabled = true;
    }
    const q = currentTopic.questions[currentIndex]; // السؤال الحالي
    if (!q)
        return;
    // اكتبي "Question 3 of 15" وشارة "Question 3" ونص السؤال
    if (quizCount) {
        quizCount.textContent = `Question ${currentIndex + 1} of ${currentTopic.questions.length}`;
    }
    if (questionTag) {
        questionTag.textContent = `Question ${currentIndex + 1}`;
    }
    if (titleQuestion) {
        titleQuestion.textContent = q.question;
    }
    // شريط التقدم: يمثّل الأسئلة اللي اتجاوبت قبل السؤال ده
    // (أول سؤال = 0% يعني فاضي)
    if (progress) {
        const percent = (currentIndex / currentTopic.questions.length) * 100;
        progress.style.width = `${percent}%`;
    }
    // رسم أزرار الاختيارات
    if (listAnswer) {
        const list = listAnswer; // نسخة مضمونة إنها مش null جوه الدوال اللي تحت
        list.innerHTML = ""; // نمسح اختيارات السؤال اللي فات
        q.options.forEach((option, index) => {
            // نعمل زرار لكل اختيار، فيه دايرة صغيرة ونص الاختيار
            const btn = document.createElement("button");
            btn.className = "opt";
            const dot = document.createElement("span");
            dot.className = "r";
            btn.append(dot, option); // append بتحط النص كنص عادي (آمنة مع <nav>)
            list.appendChild(btn);
            // لما المستخدم يدوس على اختيار
            btn.addEventListener("click", () => {
                const allButtons = list.querySelectorAll(".opt");
                if (q.answer === index) {
                    // إجابة صح: أخضر + نزوّد السكور
                    btn.classList.add("ok");
                    score++;
                }
                else {
                    // إجابة غلط: أحمر + نوضّح الإجابة الصح بالأخضر
                    btn.classList.add("no");
                    allButtons[q.answer]?.classList.add("ok");
                }
                // نقفل كل الأزرار عشان ما يجاوبش تاني
                allButtons.forEach((b) => (b.disabled = true));
                // الشريط يتحرك بعد الإجابة (السؤال ده بقى متجاوب)
                if (progress && currentTopic) {
                    const done = ((currentIndex + 1) / currentTopic.questions.length) * 100;
                    progress.style.width = `${done}%`;
                }
                // نفتح Next
                if (nextBtn) {
                    nextBtn.disabled = false;
                }
            });
        });
    }
}
/* ============================================================
   8) الضغط على كارت موضوع
   بنستخدم مستمع واحد على الحاوية (event delegation)
   ============================================================ */
function onCardClick(eo) {
    // أقرب كارت للعنصر اللي اتضغط (ممكن يكون الأيقونة أو النص)
    const card = eo.target.closest(".card");
    if (!card)
        return; // لو الدوسة مش على كارت، اخرجي
    // ندوّر على الموضوع بالـ id اللي على الكارت
    const topic = allTopics.find((t) => t.id === card.dataset.id);
    if (!topic)
        return;
    // نبدّل الصفحات: نخفي الـ Home والكروت، ونظهر الكويز
    // نبدأ كويز جديد من الصفر
    currentTopic = topic;
    currentIndex = 0;
    score = 0;
    if (quizTitle) {
        quizTitle.textContent = topic.name;
    }
    showView("quiz"); // نظهر صفحة الكويز
    showQuestion(); // نرسم أول سؤال
}
// الكروت في صفحة Topics وصفحة Progress الاتنين بيبدأوا الكويز
cardGrid?.addEventListener("click", onCardClick);
pgridEl?.addEventListener("click", onCardClick);
/* ============================================================
   9) showResult: بتعرض صفحة النتيجة
   ============================================================ */
function showResult() {
    if (!currentTopic)
        return;
    saveBest(currentTopic.id, score); // نحفظ النتيجة لو هي الأعلى
    updateStats(); // نحدّث رقم Completed
    showView("result"); // نعرض صفحة النتيجة
    // نكتب السكور مثلاً 12/15
    if (resultScore) {
        resultScore.textContent = `${score}/${currentTopic.questions.length}`;
    }
}
/* ============================================================
   10) زرار Next
   ============================================================ */
nextBtn?.addEventListener("click", () => {
    if (!currentTopic)
        return;
    currentIndex++; // نروح للسؤال اللي بعده
    if (currentIndex < currentTopic.questions.length) {
        showQuestion(); // لسه فيه أسئلة
    }
    else {
        showResult(); // الأسئلة خلصت
    }
});
/* ============================================================
   11) زرار Try again: نعيد نفس الموضوع من الأول
   ============================================================ */
tryAgain?.addEventListener("click", () => {
    score = 0;
    currentIndex = 0;
    showQuestion();
    showView("quiz"); // نرجع لصفحة الكويز
});
/* ============================================================
   12) زرار All topics: نرجع للصفحة الرئيسية
   ============================================================ */
allTopicsBtn?.addEventListener("click", () => {
    showView("topics");
});
// showView: الدالة الوحيدة اللي بتبدّل الصفحات (بتخفي الكل وتظهر المطلوبة)
function showView(view) {
    [homeHide, topicHide, progressSection, quizSection, resultSection].forEach((el) => el?.classList.add("hide"));
    // Home و Topics بيظهروا مع بعض (الـ Hero وتحته الكروت)
    if (view === "home" || view === "topics") {
        homeHide?.classList.remove("hide");
        topicHide?.classList.remove("hide");
    }
    if (view === "progress") {
        renderProgress(); // نرسم الكروت بأحدث النتائج
        progressSection?.classList.remove("hide");
    }
    if (view === "quiz")
        quizSection?.classList.remove("hide");
    if (view === "result")
        resultSection?.classList.remove("hide");
    // نلوّن زرار السايدبار المناسب (الكويز والنتيجة يتحسبوا على Topics)
    const active = view === "home" || view === "progress" ? view : "topics";
    navBtns.forEach((b) => b.classList.toggle("on", b.dataset.go === active));
    // Topics بينزل على الكروت، وغيره بيطلع فوق
    if (view === "topics") {
        topicHide?.scrollIntoView({ behavior: "smooth" });
    }
    else {
        window.scrollTo({ top: 0 });
    }
}
// أي عنصر عليه data-go (السايدبار وأزرار الـ Hero) بياخدك لصفحته
document.addEventListener("click", (e) => {
    const el = e.target.closest("[data-go]");
    if (!el)
        return;
    showView(el.dataset.go);
});
function loadBest() {
    try {
        return JSON.parse(localStorage.getItem("best") ?? "{}");
    }
    catch (e) {
        return {};
    }
}
// نحفظ النتيجة بس لو أعلى من القديمة
function saveBest(topicId, s) {
    const best = loadBest();
    if ((best[topicId] ?? -1) < s) {
        best[topicId] = s;
        try {
            localStorage.setItem("best", JSON.stringify(best));
        }
        catch (e) { }
    }
}
// أرقام الصفحة الرئيسية: المواضيع، الأسئلة، المكتمل
function updateStats() {
    if (statTopics)
        statTopics.textContent = String(allTopics.length);
    if (statQuestions) {
        statQuestions.textContent = String(allTopics.reduce((sum, t) => sum + t.questions.length, 0));
    }
    if (statDone)
        statDone.textContent = String(Object.keys(loadBest()).length);
}
// نرسم كروت صفحة Progress: أعلى نتيجة وشريط لكل موضوع
function renderProgress() {
    if (!pgridEl)
        return;
    const best = loadBest();
    pgridEl.innerHTML = allTopics
        .map((topic) => {
        const total = topic.questions.length;
        const b = best[topic.id];
        const pct = b === undefined ? 0 : Math.round((b / total) * 100);
        const label = b === undefined ? "Not started yet" : `Best: ${b}/${total} (${pct}%)`;
        return `
      <button class="card" data-id="${topic.id}" style="--c: ${topic.color}">
        <span class="tile">${icons[topic.id] ?? topic.icon}</span>
        <span class="info">
          <b>${topic.name}</b>
          <small>${label}</small>
          <span class="bar"><i style="width:${pct}%"></i></span>
        </span>
        <span class="go">→</span>
      </button>`;
    })
        .join("");
}
/* ============================================================
   14) الدارك مود (Dark mode)
   بنغيّر data-theme على <html> والـ CSS بيبدّل الألوان لوحده،
   وبنحفظ الاختيار في localStorage عشان يفضل بعد الـ Refresh
   ============================================================ */
let themeBtn = document.getElementById("theme");
const root = document.documentElement;
// أيقونة القمر (للوضع الفاتح) وأيقونة الشمس (للوضع الغامق)
const moonIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>`;
const sunIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>`;
// نطبّق الثيم: نكتبه على <html>، نحفظه، ونبدّل أيقونة الزرار
function applyTheme(theme) {
    root.dataset.theme = theme;
    try {
        localStorage.setItem("theme", theme);
    }
    catch (e) {
        // لو المتصفح مانع التخزين، نكمّل عادي من غير حفظ
    }
    if (themeBtn) {
        themeBtn.innerHTML = theme === "dark" ? sunIcon : moonIcon;
    }
}
// الثيم المبدئي: المحفوظ لو موجود، وإلا حسب إعدادات الجهاز
let savedTheme = null;
try {
    savedTheme = localStorage.getItem("theme");
}
catch (e) { }
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
applyTheme(savedTheme === "dark" || savedTheme === "light"
    ? savedTheme
    : prefersDark
        ? "dark"
        : "light");
// الضغط على الزرار يبدّل بين الاتنين
themeBtn?.addEventListener("click", () => {
    applyTheme(root.dataset.theme === "dark" ? "light" : "dark");
});
/* ============================================================
   15) قايمة الموبايل (السايدبار)
   على الموبايل السايدبار مخفي، وبيظهر بالضغط على الهامبرجر أو اللوجو
   ============================================================ */
const appEl = document.querySelector(".app");
const menuBtn = document.getElementById("menuBtn");
const overlay = document.getElementById("overlay");
const logo = document.getElementById("logo");
// فتح/قفل القايمة (بنضيف أو نشيل كلاس menu-open على .app)
function toggleMenu(open) {
    appEl?.classList.toggle("menu-open", open);
}
menuBtn?.addEventListener("click", () => toggleMenu());
logo?.addEventListener("click", () => toggleMenu());
overlay?.addEventListener("click", () => toggleMenu(false)); // الضغط بره القايمة يقفلها
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape")
        toggleMenu(false); // زرار Esc يقفلها
});
document.querySelectorAll(".nav").forEach((n) => {
    n.addEventListener("click", () => toggleMenu(false)); // اختيار عنصر يقفلها
});
/* ============================================================
   16) نشغّل init أول ما الملف يتحمّل
   ============================================================ */
init();
export {};
//# sourceMappingURL=main.js.map