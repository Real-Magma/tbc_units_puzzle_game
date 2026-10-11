const root = document.documentElement;
const themeButton = document.querySelector("#theme-button");
const soundButton = document.querySelector("#sound-button");
const themeIcon = themeButton.querySelector("i");
const soundIcon = soundButton.querySelector("i");
const themeTooltip = document.querySelector("#theme-tooltip");
const soundTooltip = document.querySelector("#sound-tooltip");
const backgroundMusic = document.querySelector("#background-music");
const volumeSlider = document.querySelector("#volume-slider");
const helpButton = document.querySelector("#help-button");
const helpDialog = document.querySelector("#help-dialog");
const closeHelpButton = document.querySelector("#close-help-button");
const undoButton = document.querySelector("#undo-button");
const layerBackButton = document.querySelector("#layer-back-button");
const layerFrontButton = document.querySelector("#layer-front-button");
const canvas = document.querySelector("#canvas");
const selectionFrame = document.querySelector("#selection-frame");
const trashZone = document.querySelector("#trash-zone");
const unitSelect = document.querySelector("#unit-select");
const rankSelect = document.querySelector("#rank-select");
const unitStatus = document.querySelector("#unit-status");
const partsList = document.querySelector("#parts-list");
const unitCatalog = globalThis.UNIT_CATALOG ?? {};
const history = [];
let activeParts = new Map();
let selectedPart = null;
let copiedPart = null;

const savedTheme = localStorage.getItem("theme");
const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
const initialTheme = savedTheme ?? (systemPrefersDark ? "dark" : "light");
const initialMuted = localStorage.getItem("muted") === "true";
const savedVolume = Number.parseFloat(localStorage.getItem("music-volume") ?? "0.5");
const initialVolume = Number.isFinite(savedVolume) ? clamp(savedVolume, 0, 1) : 0.5;

function setTheme(theme) {
    const isDark = theme === "dark";
    root.dataset.theme = theme;
    themeIcon.className = isDark ? "fa-regular fa-moon" : "fa-regular fa-sun";
    const label = isDark ? "開燈" : "關燈";
    themeButton.setAttribute("aria-label", label);
    themeTooltip.textContent = label;
}

function setMuted(muted) {
    backgroundMusic.muted = muted;
    soundIcon.className = muted ? "fa-solid fa-volume-xmark" : "fa-solid fa-volume-high";
    soundButton.setAttribute("aria-pressed", String(muted));
    const label = muted ? "開聲音" : "關聲音";
    soundButton.setAttribute("aria-label", label);
    soundTooltip.textContent = label;
}

function setVolume(volume) {
    const nextVolume = clamp(volume, 0, 1);
    backgroundMusic.volume = nextVolume;
    volumeSlider.value = String(nextVolume);
    localStorage.setItem("music-volume", String(nextVolume));
}

function tryPlayMusic() {
    if (!backgroundMusic.muted) backgroundMusic.play().catch(() => {});
}

function clamp(value, minimum, maximum) {
    return Math.min(Math.max(value, minimum), maximum);
}

function positionOf(image) {
    return {
        left: image.style.left,
        top: image.style.top,
        rotation: image.style.getPropertyValue("--rotation") || "0deg",
        scale: image.style.getPropertyValue("--scale") || "1.6",
    };
}

function setPartScale(image, scale) {
    const nextScale = clamp(Number.parseFloat(scale), 0.4, 3.5);
    image.style.setProperty("--scale", nextScale.toFixed(2));
    image.style.setProperty("--handle-scale", (1 / nextScale).toFixed(4));
}

function updateUndoButton() {
    undoButton.disabled = history.length === 0;
}

function updateLayerButtons() {
    const parts = orderedParts();
    const index = parts.indexOf(selectedPart);
    layerBackButton.disabled = index <= 0;
    layerFrontButton.disabled = index === -1 || index === parts.length - 1;
}

function updateSelectionFrame() {
    if (!selectedPart?.isConnected) {
        selectionFrame.classList.remove("is-visible");
        return;
    }

    const image = selectedPart.querySelector("img");
    const state = positionOf(selectedPart);
    const scale = Number.parseFloat(state.scale);
    const padding = 14;
    selectionFrame.style.left = state.left;
    selectionFrame.style.top = state.top;
    selectionFrame.style.width = `${image.offsetWidth * scale + padding}px`;
    selectionFrame.style.height = `${image.offsetHeight * scale + padding}px`;
    selectionFrame.style.setProperty("--rotation", state.rotation);
    selectionFrame.classList.add("is-visible");
}

function selectPlacedPart(image) {
    canvas.querySelectorAll(".placed-part.is-selected").forEach((part) => part.classList.remove("is-selected"));
    selectedPart = image;
    if (image) image.classList.add("is-selected");
    updateLayerButtons();
    updateSelectionFrame();
}

function orderedParts() {
    return [...canvas.querySelectorAll(".placed-part")]
        .sort((first, second) => Number(first.style.zIndex) - Number(second.style.zIndex));
}

function setLayerOrder(parts) {
    parts.forEach((part, index) => {
        part.style.zIndex = String(index + 1);
    });
}

function moveSelectedLayer(direction) {
    if (!selectedPart) return;
    const before = orderedParts();
    const index = before.indexOf(selectedPart);
    const targetIndex = clamp(index + direction, 0, before.length - 1);
    if (index === -1 || index === targetIndex) return;

    const after = [...before];
    [after[index], after[targetIndex]] = [after[targetIndex], after[index]];
    setLayerOrder(after);
    remember({ type: "layers", order: before });
    updateLayerButtons();
}

function remember(action) {
    history.push(action);
    updateUndoButton();
}

function restoreImage(image, position) {
    image.style.left = position.left;
    image.style.top = position.top;
    image.style.setProperty("--rotation", position.rotation ?? "0deg");
    setPartScale(image, position.scale ?? "1.6");
    canvas.append(image);
}

function undo() {
    const action = history.pop();
    if (!action) return;

    if (action.type === "add") action.image.remove();
    if (action.type === "move") restoreImage(action.image, action.from);
    if (action.type === "rotate") restoreImage(action.image, action.from);
    if (action.type === "scale") restoreImage(action.image, action.from);
    if (action.type === "remove") restoreImage(action.image, action.position);
    if (action.type === "layers") setLayerOrder(action.order);
    if (action.type === "clear") {
        action.parts.forEach(({ image, position }) => restoreImage(image, position));
        setLayerOrder(action.parts.map(({ image }) => image));
    }
    if (selectedPart && !selectedPart.isConnected) selectPlacedPart(null);
    updateUndoButton();
    updateLayerButtons();
    updateSelectionFrame();
}

function isOverTrash(clientX, clientY) {
    const bounds = trashZone.getBoundingClientRect();
    return clientX >= bounds.left && clientX <= bounds.right && clientY >= bounds.top && clientY <= bounds.bottom;
}

function removePlacedPart(image) {
    if (!image.isConnected) return;
    remember({ type: "remove", image, position: positionOf(image) });
    image.remove();
    if (selectedPart === image) selectPlacedPart(null);
}

function clearCanvas() {
    const parts = orderedParts();
    if (!parts.length) return;
    const snapshot = parts.map((image) => ({ image, position: positionOf(image) }));
    parts.forEach((image) => image.remove());
    selectPlacedPart(null);
    remember({ type: "clear", parts: snapshot });
}

function startClearHold(event) {
    event.preventDefault();
    const holdDuration = 800;
    const startedAt = performance.now();
    let frameId = null;
    trashZone.setPointerCapture(event.pointerId);
    trashZone.classList.add("is-clearing");

    const stop = () => {
        if (frameId !== null) cancelAnimationFrame(frameId);
        trashZone.classList.remove("is-clearing");
        trashZone.style.setProperty("--clear-progress", "0%");
        trashZone.removeEventListener("pointerup", stop);
        trashZone.removeEventListener("pointercancel", stop);
        trashZone.removeEventListener("lostpointercapture", stop);
    };

    const advance = (now) => {
        const progress = Math.min((now - startedAt) / holdDuration, 1);
        trashZone.style.setProperty("--clear-progress", `${progress * 100}%`);
        if (progress >= 1) {
            clearCanvas();
            stop();
            return;
        }
        frameId = requestAnimationFrame(advance);
    };

    trashZone.addEventListener("pointerup", stop);
    trashZone.addEventListener("pointercancel", stop);
    trashZone.addEventListener("lostpointercapture", stop);
    frameId = requestAnimationFrame(advance);
}

function makePlacedPartDraggable(image) {
    image.addEventListener("pointerdown", (event) => {
        if (event.target.closest(".rotate-handle")) return;
        event.preventDefault();
        selectPlacedPart(image);
        const from = positionOf(image);
        const startBounds = canvas.getBoundingClientRect();
        const grabOffsetX = event.clientX - (startBounds.left + Number.parseFloat(image.style.left));
        const grabOffsetY = event.clientY - (startBounds.top + Number.parseFloat(image.style.top));
        let moved = false;
        let overTrash = false;
        image.setPointerCapture(event.pointerId);

        const move = (pointerEvent) => {
            const bounds = canvas.getBoundingClientRect();
            image.style.left = `${clamp(pointerEvent.clientX - bounds.left - grabOffsetX, 0, bounds.width)}px`;
            image.style.top = `${clamp(pointerEvent.clientY - bounds.top - grabOffsetY, 0, bounds.height)}px`;
            updateSelectionFrame();
            overTrash = isOverTrash(pointerEvent.clientX, pointerEvent.clientY);
            trashZone.classList.toggle("is-ready", overTrash);
            moved = true;
        };
        const stop = () => {
            image.removeEventListener("pointermove", move);
            image.removeEventListener("pointerup", stop);
            image.removeEventListener("pointercancel", stop);
            trashZone.classList.remove("is-ready");

            if (overTrash) {
                image.style.left = from.left;
                image.style.top = from.top;
                removePlacedPart(image);
            } else if (moved && (image.style.left !== from.left || image.style.top !== from.top)) {
                remember({ type: "move", image, from, to: positionOf(image) });
            }
        };

        image.addEventListener("pointermove", move);
        image.addEventListener("pointerup", stop);
        image.addEventListener("pointercancel", stop);
    });
}

function makePlacedPartRotatable(image) {
    const handle = image.querySelector(".rotate-handle");
    handle.addEventListener("pointerdown", (event) => {
        event.preventDefault();
        event.stopPropagation();
        selectPlacedPart(image);
        const from = positionOf(image);
        handle.setPointerCapture(event.pointerId);

        const rotate = (pointerEvent) => {
            const bounds = image.getBoundingClientRect();
            const angle = Math.atan2(pointerEvent.clientY - (bounds.top + bounds.height / 2), pointerEvent.clientX - (bounds.left + bounds.width / 2)) * 180 / Math.PI + 90;
            image.style.setProperty("--rotation", `${Math.round(angle)}deg`);
            updateSelectionFrame();
        };
        const stop = () => {
            handle.removeEventListener("pointermove", rotate);
            handle.removeEventListener("pointerup", stop);
            handle.removeEventListener("pointercancel", stop);
            if (positionOf(image).rotation !== from.rotation) {
                remember({ type: "rotate", image, from, to: positionOf(image) });
            }
        };

        handle.addEventListener("pointermove", rotate);
        handle.addEventListener("pointerup", stop);
        handle.addEventListener("pointercancel", stop);
    });
}

function makePlacedPartScalable(image) {
    image.addEventListener("wheel", (event) => {
        event.preventDefault();
        selectPlacedPart(image);
        const from = positionOf(image);
        const currentScale = Number.parseFloat(from.scale);
        const nextScale = clamp(currentScale + (event.deltaY < 0 ? 0.1 : -0.1), 0.4, 3.5);
        setPartScale(image, nextScale);
        updateSelectionFrame();
        remember({ type: "scale", image, from, to: positionOf(image) });
    }, { passive: false });
}

function addPartToCanvas(part, clientX, clientY, options = {}) {
    const bounds = canvas.getBoundingClientRect();
    const placedPart = document.createElement("div");
    const image = document.createElement("img");
    const rotateHandle = document.createElement("button");
    placedPart.className = "placed-part";
    placedPart.dataset.src = part.src;
    placedPart.dataset.name = part.name;
    image.src = part.src;
    image.alt = part.name;
    image.addEventListener("load", updateSelectionFrame);
    rotateHandle.className = "rotate-handle";
    rotateHandle.type = "button";
    rotateHandle.setAttribute("aria-label", "拖曳旋轉物件");
    placedPart.style.zIndex = String(orderedParts().length + 1);
    placedPart.style.left = `${clamp(clientX - bounds.left, 0, bounds.width)}px`;
    placedPart.style.top = `${clamp(clientY - bounds.top, 0, bounds.height)}px`;
    placedPart.style.setProperty("--rotation", options.rotation ?? "0deg");
    setPartScale(placedPart, options.scale ?? "1.6");
    placedPart.addEventListener("dblclick", () => removePlacedPart(placedPart));
    placedPart.append(image, rotateHandle);
    makePlacedPartDraggable(placedPart);
    makePlacedPartRotatable(placedPart);
    makePlacedPartScalable(placedPart);
    canvas.append(placedPart);
    selectPlacedPart(placedPart);
    remember({ type: "add", image: placedPart });
}

function copySelectedPart() {
    if (!selectedPart) return;
    copiedPart = {
        src: selectedPart.dataset.src,
        name: selectedPart.dataset.name,
        rotation: positionOf(selectedPart).rotation,
        scale: positionOf(selectedPart).scale,
    };
}

function pasteCopiedPart() {
    if (!copiedPart) return;
    const bounds = canvas.getBoundingClientRect();
    const selectedPosition = selectedPart ? positionOf(selectedPart) : null;
    const offsetX = selectedPosition ? Number.parseFloat(selectedPosition.left) + 24 : bounds.width / 2;
    const offsetY = selectedPosition ? Number.parseFloat(selectedPosition.top) + 24 : bounds.height / 2;
    addPartToCanvas(copiedPart, bounds.left + offsetX, bounds.top + offsetY, { rotation: copiedPart.rotation, scale: copiedPart.scale });
}

function renderParts() {
    const unit = unitCatalog[unitSelect.value];
    const parts = unit?.parts.filter((part) => part.form === rankSelect.value) ?? [];
    activeParts = new Map(parts.map((part) => [part.id, part]));
    partsList.replaceChildren();
    unitStatus.textContent = parts.length ? `${parts.length} 個可拖曳部件` : "此階級沒有可用部件。";

    for (const part of parts) {
        const card = document.createElement("button");
        const image = document.createElement("img");
        card.className = "part-card";
        card.type = "button";
        card.draggable = true;
        card.setAttribute("aria-label", `拖曳 ${part.form} 階級部件：${part.name}`);
        image.src = part.src;
        image.alt = "";
        card.addEventListener("dragstart", (event) => {
            event.dataTransfer.effectAllowed = "copy";
            event.dataTransfer.setData("text/plain", part.id);
        });
        card.addEventListener("click", () => {
            const bounds = canvas.getBoundingClientRect();
            addPartToCanvas(part, bounds.left + bounds.width / 2, bounds.top + bounds.height / 2);
        });
        card.append(image);
        partsList.append(card);
    }
}

function updateRankOptions() {
    const forms = new Set(unitCatalog[unitSelect.value]?.parts.map((part) => part.form));
    for (const option of rankSelect.options) option.disabled = !forms.has(option.value);
    if (!forms.has(rankSelect.value)) rankSelect.value = [...forms][0] ?? "f";
}

function populateUnitSelect() {
    for (const unitId of Object.keys(unitCatalog).sort()) {
        const option = document.createElement("option");
        option.value = unitId;
        option.textContent = unitId;
        unitSelect.append(option);
    }
    updateRankOptions();
}

setTheme(initialTheme);
setVolume(initialVolume);
setMuted(initialMuted);
populateUnitSelect();
renderParts();
updateUndoButton();

themeButton.addEventListener("click", () => {
    const nextTheme = root.dataset.theme === "dark" ? "light" : "dark";
    localStorage.setItem("theme", nextTheme);
    setTheme(nextTheme);
});
soundButton.addEventListener("click", () => {
    const nextMuted = soundButton.getAttribute("aria-pressed") !== "true";
    localStorage.setItem("muted", String(nextMuted));
    setMuted(nextMuted);
    tryPlayMusic();
});
volumeSlider.addEventListener("input", () => {
    const volume = Number.parseFloat(volumeSlider.value);
    const muted = volume === 0;
    setVolume(volume);
    localStorage.setItem("muted", String(muted));
    setMuted(muted);
    tryPlayMusic();
});
document.addEventListener("pointerdown", tryPlayMusic, { once: true });
helpButton.addEventListener("click", () => helpDialog.showModal());
closeHelpButton.addEventListener("click", () => helpDialog.close());
undoButton.addEventListener("click", undo);
layerBackButton.addEventListener("click", () => moveSelectedLayer(-1));
layerFrontButton.addEventListener("click", () => moveSelectedLayer(1));
trashZone.addEventListener("pointerdown", startClearHold);
unitSelect.addEventListener("change", () => {
    updateRankOptions();
    renderParts();
});
rankSelect.addEventListener("change", renderParts);
canvas.addEventListener("dragover", (event) => event.preventDefault());
canvas.addEventListener("drop", (event) => {
    event.preventDefault();
    const part = activeParts.get(event.dataTransfer.getData("text/plain"));
    if (part) addPartToCanvas(part, event.clientX, event.clientY);
});
window.addEventListener("keydown", (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z") {
        event.preventDefault();
        undo();
        return;
    }

    const target = event.target;
    const isTyping = target instanceof HTMLInputElement || target instanceof HTMLSelectElement || target instanceof HTMLTextAreaElement || target?.isContentEditable;
    if (isTyping || helpDialog.open) return;

    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "c" && selectedPart) {
        event.preventDefault();
        copySelectedPart();
        return;
    }

    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "v" && copiedPart) {
        event.preventDefault();
        pasteCopiedPart();
        return;
    }

    if (!selectedPart) return;

    if (event.key === "Delete" || event.key === "Backspace") {
        event.preventDefault();
        removePlacedPart(selectedPart);
        return;
    }

    if (event.key === "ArrowUp") {
        event.preventDefault();
        moveSelectedLayer(1);
    }

    if (event.key === "ArrowDown") {
        event.preventDefault();
        moveSelectedLayer(-1);
    }
});
