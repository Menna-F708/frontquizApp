async function fetchData(url) {
    const response = await fetch(url);
    if (!response.ok)
        throw new Error(`Failed to load ${url}: ${response.status}`);
    const data = (await response.json());
    return data;
}
let cardGrid = document.getElementById("grid");
let topicHide = document.getElementById("topics");
let homeHide = document.getElementById("home");
let quizSection = document.getElementById("quiz");
let quizTitle = document.getElementById("qt");
let quizCount = document.getElementById("qn");
let listAnswer = document.getElementById("qo");
let titleQuestion = document.getElementById("qq");
let questionTag = document.getElementById("qtag");
let nextBtn = document.getElementById("next");
let resultSection = document.getElementById("result");
let resultScore = document.getElementById("rs");
let tryAgain = document.getElementById("again");
let allTopicsBtn = document.getElementById("allTopics");
let progress = document.getElementById("qb");
let progressSection = document.getElementById("progress");
let pgridEl = document.getElementById("pgrid");
let statTopics = document.getElementById("nT");
let statQuestions = document.getElementById("nQ");
let statDone = document.getElementById("nD");
const navBtns = document.querySelectorAll(".nav");
let allTopics = [];
let currentTopic = null;
let currentIndex = 0;
let score = 0;
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
async function init() {
    const result = await fetchData("questions.json");
    allTopics = result;
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
    if (cardGrid) {
        cardGrid.innerHTML = cards.join("");
    }
    updateStats();
}
function showQuestion() {
    if (!currentTopic)
        return;
    if (nextBtn) {
        nextBtn.disabled = true;
    }
    const q = currentTopic.questions[currentIndex];
    if (!q)
        return;
    if (quizCount) {
        quizCount.textContent = `Question ${currentIndex + 1} of ${currentTopic.questions.length}`;
    }
    if (questionTag) {
        questionTag.textContent = `Question ${currentIndex + 1}`;
    }
    if (titleQuestion) {
        titleQuestion.textContent = q.question;
    }
    if (progress) {
        const percent = (currentIndex / currentTopic.questions.length) * 100;
        progress.style.width = `${percent}%`;
    }
    if (listAnswer) {
        const list = listAnswer;
        list.innerHTML = "";
        q.options.forEach((option, index) => {
            const btn = document.createElement("button");
            btn.className = "opt";
            const dot = document.createElement("span");
            dot.className = "r";
            btn.append(dot, option);
            list.appendChild(btn);
            btn.addEventListener("click", () => {
                const allButtons = list.querySelectorAll(".opt");
                if (q.answer === index) {
                    btn.classList.add("ok");
                    score++;
                }
                else {
                    btn.classList.add("no");
                    allButtons[q.answer]?.classList.add("ok");
                }
                allButtons.forEach((b) => (b.disabled = true));
                if (progress && currentTopic) {
                    const done = ((currentIndex + 1) / currentTopic.questions.length) * 100;
                    progress.style.width = `${done}%`;
                }
                if (nextBtn) {
                    nextBtn.disabled = false;
                }
            });
        });
    }
}
function onCardClick(eo) {
    const card = eo.target.closest(".card");
    if (!card)
        return;
    const topic = allTopics.find((t) => t.id === card.dataset.id);
    if (!topic)
        return;
    currentTopic = topic;
    currentIndex = 0;
    score = 0;
    if (quizTitle) {
        quizTitle.textContent = topic.name;
    }
    showView("quiz");
    showQuestion();
}
cardGrid?.addEventListener("click", onCardClick);
pgridEl?.addEventListener("click", onCardClick);
function showResult() {
    if (!currentTopic)
        return;
    saveBest(currentTopic.id, score);
    updateStats();
    showView("result");
    if (resultScore) {
        resultScore.textContent = `${score}/${currentTopic.questions.length}`;
    }
}
nextBtn?.addEventListener("click", () => {
    if (!currentTopic)
        return;
    currentIndex++;
    if (currentIndex < currentTopic.questions.length) {
        showQuestion();
    }
    else {
        showResult();
    }
});
tryAgain?.addEventListener("click", () => {
    score = 0;
    currentIndex = 0;
    showQuestion();
    showView("quiz");
});
allTopicsBtn?.addEventListener("click", () => {
    showView("topics");
});
function showView(view) {
    [homeHide, topicHide, progressSection, quizSection, resultSection].forEach((el) => el?.classList.add("hide"));
    if (view === "home" || view === "topics") {
        homeHide?.classList.remove("hide");
        topicHide?.classList.remove("hide");
    }
    if (view === "progress") {
        renderProgress();
        progressSection?.classList.remove("hide");
    }
    if (view === "quiz")
        quizSection?.classList.remove("hide");
    if (view === "result")
        resultSection?.classList.remove("hide");
    const active = view === "home" || view === "progress" ? view : "topics";
    navBtns.forEach((b) => b.classList.toggle("on", b.dataset.go === active));
    if (view === "topics") {
        topicHide?.scrollIntoView({ behavior: "smooth" });
    }
    else {
        window.scrollTo({ top: 0 });
    }
}
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
function updateStats() {
    if (statTopics)
        statTopics.textContent = String(allTopics.length);
    if (statQuestions) {
        statQuestions.textContent = String(allTopics.reduce((sum, t) => sum + t.questions.length, 0));
    }
    if (statDone)
        statDone.textContent = String(Object.keys(loadBest()).length);
}
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
let themeBtn = document.getElementById("theme");
const root = document.documentElement;
const moonIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>`;
const sunIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>`;
function applyTheme(theme) {
    root.dataset.theme = theme;
    try {
        localStorage.setItem("theme", theme);
    }
    catch (e) {
    }
    if (themeBtn) {
        themeBtn.innerHTML = theme === "dark" ? sunIcon : moonIcon;
    }
}
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
themeBtn?.addEventListener("click", () => {
    applyTheme(root.dataset.theme === "dark" ? "light" : "dark");
});
const appEl = document.querySelector(".app");
const menuBtn = document.getElementById("menuBtn");
const overlay = document.getElementById("overlay");
const logo = document.getElementById("logo");
function toggleMenu(open) {
    appEl?.classList.toggle("menu-open", open);
}
menuBtn?.addEventListener("click", () => toggleMenu());
logo?.addEventListener("click", () => toggleMenu());
overlay?.addEventListener("click", () => toggleMenu(false));
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape")
        toggleMenu(false);
});
document.querySelectorAll(".nav").forEach((n) => {
    n.addEventListener("click", () => toggleMenu(false));
});
init();
export {};
