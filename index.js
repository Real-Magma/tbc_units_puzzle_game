const root = document.documentElement;
const themeButton = document.querySelector("#theme-button");
const soundButton = document.querySelector("#sound-button");
const themeIcon = themeButton.querySelector("i");
const soundIcon = soundButton.querySelector("i");
const themeTooltip = document.querySelector("#theme-tooltip");
const soundTooltip = document.querySelector("#sound-tooltip");
const helpButton = document.querySelector("#help-button");
const helpDialog = document.querySelector("#help-dialog");
const closeHelpButton = document.querySelector("#close-help-button");
const canvas = document.querySelector("#canvas");
const unitInput = document.querySelector("#unit-input");
const loadUnitButton = document.querySelector("#load-unit-button");
const unitStatus = document.querySelector("#unit-status");
const partsList = document.querySelector("#parts-list");
let unitCatalog = {};
let activeParts = new Map();

const savedTheme = localStorage.getItem("theme");
const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
const initialTheme = savedTheme ?? (systemPrefersDark ? "dark" : "light");
const initialMuted = localStorage.getItem("muted") === "true";

function setTheme(theme) {
    const isDark = theme === "dark";

    root.dataset.theme = theme;
    themeIcon.className = isDark ? "fa-regular fa-moon" : "fa-regular fa-sun";
    const label = isDark ? "開燈" : "關燈";
    themeButton.setAttribute("aria-label", label);
    themeTooltip.textContent = label;
}

function setMuted(muted) {
    soundIcon.className = muted ? "fa-solid fa-volume-xmark" : "fa-solid fa-volume-high";
    soundButton.setAttribute("aria-pressed", String(muted));
    const label = muted ? "開聲音" : "關聲音";
    soundButton.setAttribute("aria-label", label);
    soundTooltip.textContent = label;
}

setTheme(initialTheme);
setMuted(initialMuted);

themeButton.addEventListener("click", () => {
    const nextTheme = root.dataset.theme === "dark" ? "light" : "dark";
    localStorage.setItem("theme", nextTheme);
    setTheme(nextTheme);
});

soundButton.addEventListener("click", () => {
    const nextMuted = soundButton.getAttribute("aria-pressed") !== "true";
    localStorage.setItem("muted", String(nextMuted));
    setMuted(nextMuted);
});

helpButton.addEventListener("click", () => helpDialog.showModal());
closeHelpButton.addEventListener("click", () => helpDialog.close());

function normaliseUnitId(value) {
    const digits = value.replace(/\D/g, "").slice(-3);
    return digits ? digits.padStart(3, "0") : "";
}

function addPartToCanvas(part, clientX, clientY) {
    const bounds = canvas.getBoundingClientRect();
    const image = document.createElement("img");
    image.className = "placed-part";
    image.src = part.src;
    image.alt = part.name;
    image.draggable = false;
    image.title = "按兩下可移除";
    image.style.left = `${clientX - bounds.left}px`;
    image.style.top = `${clientY - bounds.top}px`;
    image.addEventListener("dblclick", () => image.remove());
    canvas.append(image);
}

function renderParts(unit) {
    activeParts = new Map(unit.parts.map((part) => [part.id, part]));
    partsList.replaceChildren();

    for (const part of unit.parts) {
        const card = document.createElement("button");
        const image = document.createElement("img");
        const label = document.createElement("span");

        card.className = "part-card";
        card.type = "button";
        card.draggable = true;
        card.setAttribute("aria-label", `拖曳 ${part.form}：${part.name}`);
        image.src = part.src;
        image.alt = "";
        label.textContent = `${part.form} · ${part.name}`;

        card.addEventListener("dragstart", (event) => {
            event.dataTransfer.effectAllowed = "copy";
            event.dataTransfer.setData("text/plain", part.id);
        });
        card.addEventListener("click", () => {
            const bounds = canvas.getBoundingClientRect();
            addPartToCanvas(part, bounds.left + bounds.width / 2, bounds.top + bounds.height / 2);
        });

        card.append(image, label);
        partsList.append(card);
    }
}

function loadUnit() {
    const unitId = normaliseUnitId(unitInput.value);
    unitInput.value = unitId;
    const unit = unitCatalog[unitId];

    if (!unit) {
        activeParts = new Map();
        partsList.replaceChildren();
        unitStatus.textContent = unitId
            ? `角色 ${unitId} 尚未裁切進網頁資產。`
            : "請輸入三位數角色編號。";
        return;
    }

    unitStatus.textContent = `角色 ${unitId}：${unit.parts.length} 個可拖曳部件`;
    renderParts(unit);
}

canvas.addEventListener("dragover", (event) => event.preventDefault());
canvas.addEventListener("drop", (event) => {
    event.preventDefault();
    const part = activeParts.get(event.dataTransfer.getData("text/plain"));
    if (part) addPartToCanvas(part, event.clientX, event.clientY);
});

loadUnitButton.addEventListener("click", loadUnit);
unitInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") loadUnit();
});

fetch("assets/units/catalog.json")
    .then((response) => {
        if (!response.ok) throw new Error("無法讀取角色目錄");
        return response.json();
    })
    .then((catalog) => {
        unitCatalog = catalog;
        loadUnit();
    })
    .catch(() => {
        unitStatus.textContent = "角色目錄載入失敗。";
    });
