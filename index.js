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
const viewHomeButton = document.querySelector("#view-home-button");
const canvas = document.querySelector("#canvas");
const canvasWorld = document.querySelector("#canvas-world");
const selectionFrame = document.querySelector("#selection-frame");
const selectionRotateHandle = document.querySelector("#selection-rotate-handle");
const marqueeSelection = document.querySelector("#marquee-selection");
const trashZone = document.querySelector("#trash-zone");
const unitSelect = document.querySelector("#unit-select");
const unitSearch = document.querySelector("#unit-search");
const unitResults = document.querySelector("#unit-results");
const rankSelect = document.querySelector("#rank-select");
const unitStatus = document.querySelector("#unit-status");
const partsList = document.querySelector("#parts-list");
const unitCatalog = globalThis.UNIT_CATALOG ?? {};
const history = [];
let activeParts = new Map();
let selectedPart = null;
const selectedParts = new Set();
let copiedPart = null;
let matchingUnitIds = [];
let activeUnitResultIndex = -1;
let viewScale = 1;
let viewX = 0;
let viewY = 0;

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

function worldSize() {
    return { width: canvas.clientWidth, height: canvas.clientHeight };
}

function clientToWorld(clientX, clientY) {
    const bounds = canvas.getBoundingClientRect();
    return {
        x: (clientX - bounds.left - viewX) / viewScale,
        y: (clientY - bounds.top - viewY) / viewScale,
    };
}

function updateViewTransform() {
    canvasWorld.style.setProperty("--view-scale", String(viewScale));
    canvasWorld.style.setProperty("--view-x", `${viewX}px`);
    canvasWorld.style.setProperty("--view-y", `${viewY}px`);
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

function snapAngle(angle) {
    const normalized = ((angle % 360) + 360) % 360;
    const nearest = Math.round(normalized / 90) * 90;
    const distance = Math.abs(normalized - nearest);
    return distance <= 6 ? nearest % 360 : angle;
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
    const parts = [...selectedParts].filter((part) => part.isConnected);
    if (!parts.length) {
        selectionFrame.classList.remove("is-visible");
        selectionFrame.classList.remove("is-group-selection");
        canvasWorld.classList.remove("has-group-selection");
        return;
    }

    if (parts.length > 1) {
        const bounds = parts.map((part) => part.getBoundingClientRect());
        const left = Math.min(...bounds.map((bound) => bound.left));
        const top = Math.min(...bounds.map((bound) => bound.top));
        const right = Math.max(...bounds.map((bound) => bound.right));
        const bottom = Math.max(...bounds.map((bound) => bound.bottom));
        const padding = 10;
        const center = clientToWorld((left + right) / 2, (top + bottom) / 2);
        selectionFrame.style.left = `${center.x}px`;
        selectionFrame.style.top = `${center.y}px`;
        selectionFrame.style.width = `${(right - left) / viewScale + padding}px`;
        selectionFrame.style.height = `${(bottom - top) / viewScale + padding}px`;
        selectionFrame.style.setProperty("--rotation", "0deg");
        selectionFrame.classList.add("is-group-selection");
        canvasWorld.classList.add("has-group-selection");
        selectionFrame.classList.add("is-visible");
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
    selectionFrame.classList.remove("is-group-selection");
    canvasWorld.classList.remove("has-group-selection");
    selectionFrame.classList.add("is-visible");
}

function setSelectedParts(parts, primary = parts.at(-1) ?? null) {
    canvasWorld.querySelectorAll(".placed-part.is-selected, .placed-part.is-primary").forEach((part) => {
        part.classList.remove("is-selected", "is-primary");
    });
    selectedParts.clear();
    parts.filter((part) => part.isConnected).forEach((part) => {
        selectedParts.add(part);
        part.classList.add("is-selected");
    });
    selectedPart = selectedParts.has(primary) ? primary : [...selectedParts].at(-1) ?? null;
    selectedPart?.classList.add("is-primary");
    updateLayerButtons();
    updateSelectionFrame();
}

function selectPlacedPart(image) {
    setSelectedParts(image ? [image] : [], image);
}

function orderedParts() {
    return [...canvasWorld.querySelectorAll(".placed-part")]
        .sort((first, second) => Number(first.style.zIndex) - Number(second.style.zIndex));
}

function setLayerOrder(parts) {
    parts.forEach((part, index) => {
        part.style.zIndex = String(index + 1);
    });
}

function flashLayerButton(button) {
    button.classList.remove("is-layer-jump");
    void button.offsetWidth;
    button.classList.add("is-layer-jump");
}

function moveSelectedLayer(direction, toEdge = false) {
    if (!selectedPart) return;
    const before = orderedParts();
    const index = before.indexOf(selectedPart);
    const targetIndex = toEdge ? (direction > 0 ? before.length - 1 : 0) : clamp(index + direction, 0, before.length - 1);
    if (index === -1 || index === targetIndex) return;

    const after = [...before];
    [after[index], after[targetIndex]] = [after[targetIndex], after[index]];
    setLayerOrder(after);
    remember({ type: "layers", order: before });
    updateLayerButtons();
    if (toEdge) flashLayerButton(direction > 0 ? layerFrontButton : layerBackButton);
}

function resetCanvasView() {
    viewScale = 1;
    viewX = 0;
    viewY = 0;
    updateViewTransform();
    updateSelectionFrame();
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
    canvasWorld.append(image);
}

function undo() {
    const action = history.pop();
    if (!action) return;

    if (action.type === "add") action.image.remove();
    if (action.type === "move") restoreImage(action.image, action.from);
    if (action.type === "move-group") action.changes.forEach(({ image, from }) => restoreImage(image, from));
    if (action.type === "rotate") restoreImage(action.image, action.from);
    if (action.type === "rotate-group") action.changes.forEach(({ image, from }) => restoreImage(image, from));
    if (action.type === "scale") restoreImage(action.image, action.from);
    if (action.type === "scale-group") action.changes.forEach(({ image, from }) => restoreImage(image, from));
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
    const wasSelected = selectedParts.has(image);
    const remainingParts = [...selectedParts].filter((part) => part !== image && part.isConnected);
    image.remove();
    if (wasSelected) {
        setSelectedParts(remainingParts, selectedPart === image ? remainingParts.at(-1) : selectedPart);
    }
}

function removeSelectedParts() {
    [...selectedParts].filter((part) => part.isConnected).forEach(removePlacedPart);
}

function clearCanvas() {
    const parts = orderedParts();
    if (!parts.length) return false;
    const snapshot = parts.map((image) => ({ image, position: positionOf(image) }));
    parts.forEach((image) => image.remove());
    selectPlacedPart(null);
    remember({ type: "clear", parts: snapshot });
    return true;
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
            if (clearCanvas()) {
                trashZone.classList.remove("is-cleared");
                void trashZone.offsetWidth;
                trashZone.classList.add("is-cleared");
                trashZone.addEventListener("animationend", () => trashZone.classList.remove("is-cleared"), { once: true });
            }
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
        if (event.button !== 0) return;
        if (event.target.closest(".rotate-handle")) return;
        event.preventDefault();
        const dragParts = selectedParts.has(image) && selectedParts.size > 1
            ? [...selectedParts].filter((part) => part.isConnected)
            : [image];
        if (dragParts.length === 1) selectPlacedPart(image);

        const from = dragParts.map((part) => ({ image: part, position: positionOf(part) }));
        const startPoint = clientToWorld(event.clientX, event.clientY);
        const imagePosition = positionOf(image);
        const grabOffsetX = startPoint.x - Number.parseFloat(imagePosition.left);
        const grabOffsetY = startPoint.y - Number.parseFloat(imagePosition.top);
        let moved = false;
        let overTrash = false;
        image.setPointerCapture(event.pointerId);

        const move = (pointerEvent) => {
            const point = clientToWorld(pointerEvent.clientX, pointerEvent.clientY);
            if (dragParts.length > 1) {
                const deltaX = point.x - startPoint.x;
                const deltaY = point.y - startPoint.y;
                from.forEach(({ image: part, position }) => {
                    part.style.left = `${Number.parseFloat(position.left) + deltaX}px`;
                    part.style.top = `${Number.parseFloat(position.top) + deltaY}px`;
                });
            } else {
                image.style.left = `${point.x - grabOffsetX}px`;
                image.style.top = `${point.y - grabOffsetY}px`;
            }
            updateSelectionFrame();
            overTrash = dragParts.length === 1 && isOverTrash(pointerEvent.clientX, pointerEvent.clientY);
            trashZone.classList.toggle("is-ready", overTrash);
            moved = true;
        };
        const stop = () => {
            image.removeEventListener("pointermove", move);
            image.removeEventListener("pointerup", stop);
            image.removeEventListener("pointercancel", stop);
            trashZone.classList.remove("is-ready");

            if (overTrash) {
                image.style.left = from[0].position.left;
                image.style.top = from[0].position.top;
                removePlacedPart(image);
            } else if (moved && dragParts.length === 1 && (image.style.left !== from[0].position.left || image.style.top !== from[0].position.top)) {
                remember({ type: "move", image, from: from[0].position, to: positionOf(image) });
            } else if (moved && dragParts.length > 1) {
                const changes = from.map(({ image: part, position }) => ({ image: part, from: position, to: positionOf(part) }))
                    .filter(({ from: before, to }) => before.left !== to.left || before.top !== to.top);
                if (changes.length) remember({ type: "move-group", changes });
            }
        };

        image.addEventListener("pointermove", move);
        image.addEventListener("pointerup", stop);
        image.addEventListener("pointercancel", stop);
    });
}

function startMarqueeSelection(event) {
    if (event.button !== 0 || event.target !== canvasWorld) return;
    event.preventDefault();
    selectionFrame.classList.remove("is-visible");

    const canvasBounds = canvas.getBoundingClientRect();
    const start = {
        x: clamp(event.clientX - canvasBounds.left, 0, canvasBounds.width),
        y: clamp(event.clientY - canvasBounds.top, 0, canvasBounds.height),
    };
    let hasDragged = false;
    canvas.setPointerCapture(event.pointerId);
    marqueeSelection.classList.add("is-visible");

    const drawMarquee = (pointerEvent) => {
        const endX = clamp(pointerEvent.clientX - canvasBounds.left, 0, canvasBounds.width);
        const endY = clamp(pointerEvent.clientY - canvasBounds.top, 0, canvasBounds.height);
        const left = Math.min(start.x, endX);
        const top = Math.min(start.y, endY);
        const width = Math.abs(endX - start.x);
        const height = Math.abs(endY - start.y);
        marqueeSelection.style.left = `${left}px`;
        marqueeSelection.style.top = `${top}px`;
        marqueeSelection.style.width = `${width}px`;
        marqueeSelection.style.height = `${height}px`;
        hasDragged ||= width > 4 || height > 4;
    };

    const finish = (pointerEvent) => {
        canvas.removeEventListener("pointermove", drawMarquee);
        canvas.removeEventListener("pointerup", finish);
        canvas.removeEventListener("pointercancel", cancel);
        marqueeSelection.classList.remove("is-visible");
        if (!hasDragged) {
            selectPlacedPart(null);
            return;
        }

        const endX = clamp(pointerEvent.clientX, canvasBounds.left, canvasBounds.right);
        const endY = clamp(pointerEvent.clientY, canvasBounds.top, canvasBounds.bottom);
        const left = Math.min(event.clientX, endX);
        const right = Math.max(event.clientX, endX);
        const top = Math.min(event.clientY, endY);
        const bottom = Math.max(event.clientY, endY);
        const partsInRange = orderedParts().filter((part) => {
            const bounds = part.getBoundingClientRect();
            return bounds.left < right && bounds.right > left && bounds.top < bottom && bounds.bottom > top;
        });
        setSelectedParts(partsInRange);
    };

    const cancel = () => {
        canvas.removeEventListener("pointermove", drawMarquee);
        canvas.removeEventListener("pointerup", finish);
        canvas.removeEventListener("pointercancel", cancel);
        marqueeSelection.classList.remove("is-visible");
    };

    canvas.addEventListener("pointermove", drawMarquee);
    canvas.addEventListener("pointerup", finish);
    canvas.addEventListener("pointercancel", cancel);
}

function zoomCanvas(event) {
    if (event.target.closest("button, input, select")) return;
    event.preventDefault();
    const bounds = canvas.getBoundingClientRect();
    const worldPoint = clientToWorld(event.clientX, event.clientY);
    const nextScale = clamp(viewScale * Math.exp(-event.deltaY * 0.0015), 0.5, 2.5);
    viewX = event.clientX - bounds.left - worldPoint.x * nextScale;
    viewY = event.clientY - bounds.top - worldPoint.y * nextScale;
    viewScale = nextScale;
    updateViewTransform();
    updateSelectionFrame();
}

function startCanvasPan(event) {
    if (event.button !== 1 && event.button !== 2) return;
    event.preventDefault();
    const startX = event.clientX;
    const startY = event.clientY;
    const originX = viewX;
    const originY = viewY;
    canvas.setPointerCapture(event.pointerId);
    canvas.classList.add("is-panning");

    const move = (pointerEvent) => {
        viewX = originX + pointerEvent.clientX - startX;
        viewY = originY + pointerEvent.clientY - startY;
        updateViewTransform();
        updateSelectionFrame();
    };
    const stop = () => {
        canvas.removeEventListener("pointermove", move);
        canvas.removeEventListener("pointerup", stop);
        canvas.removeEventListener("pointercancel", stop);
        canvas.classList.remove("is-panning");
    };

    canvas.addEventListener("pointermove", move);
    canvas.addEventListener("pointerup", stop);
    canvas.addEventListener("pointercancel", stop);
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
            image.style.setProperty("--rotation", `${Math.round(snapAngle(angle))}deg`);
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

function makeSelectedGroupRotatable() {
    selectionRotateHandle.addEventListener("pointerdown", (event) => {
        const parts = [...selectedParts].filter((part) => part.isConnected);
        if (parts.length < 2) return;
        event.preventDefault();
        event.stopPropagation();
        const frameBounds = selectionFrame.getBoundingClientRect();
        const center = clientToWorld(frameBounds.left + frameBounds.width / 2, frameBounds.top + frameBounds.height / 2);
        const startAngle = Math.atan2(event.clientY - (frameBounds.top + frameBounds.height / 2), event.clientX - (frameBounds.left + frameBounds.width / 2)) * 180 / Math.PI;
        const from = parts.map((image) => ({ image, position: positionOf(image) }));
        selectionRotateHandle.setPointerCapture(event.pointerId);

        const rotate = (pointerEvent) => {
            const currentAngle = Math.atan2(pointerEvent.clientY - (frameBounds.top + frameBounds.height / 2), pointerEvent.clientX - (frameBounds.left + frameBounds.width / 2)) * 180 / Math.PI;
            const delta = snapAngle(currentAngle - startAngle);
            const radians = delta * Math.PI / 180;
            const cosine = Math.cos(radians);
            const sine = Math.sin(radians);
            from.forEach(({ image, position }) => {
                const x = Number.parseFloat(position.left) - center.x;
                const y = Number.parseFloat(position.top) - center.y;
                image.style.left = `${center.x + x * cosine - y * sine}px`;
                image.style.top = `${center.y + x * sine + y * cosine}px`;
                const rotation = Number.parseFloat(position.rotation) + delta;
                image.style.setProperty("--rotation", `${rotation}deg`);
            });
            updateSelectionFrame();
        };
        const stop = () => {
            selectionRotateHandle.removeEventListener("pointermove", rotate);
            selectionRotateHandle.removeEventListener("pointerup", stop);
            selectionRotateHandle.removeEventListener("pointercancel", stop);
            const changes = from.map(({ image, position }) => ({ image, from: position, to: positionOf(image) }))
                .filter(({ from: before, to }) => before.left !== to.left || before.top !== to.top || before.rotation !== to.rotation);
            if (changes.length) remember({ type: "rotate-group", changes });
        };

        selectionRotateHandle.addEventListener("pointermove", rotate);
        selectionRotateHandle.addEventListener("pointerup", stop);
        selectionRotateHandle.addEventListener("pointercancel", stop);
    });
}

function makeSelectionScalable() {
    selectionFrame.querySelectorAll(".selection-corner").forEach((corner) => {
        corner.addEventListener("pointerdown", (event) => {
            const parts = [...selectedParts].filter((part) => part.isConnected);
            if (!parts.length) return;
            event.preventDefault();
            event.stopPropagation();
            const bounds = selectionFrame.getBoundingClientRect();
            const centerClientX = bounds.left + bounds.width / 2;
            const centerClientY = bounds.top + bounds.height / 2;
            const center = clientToWorld(centerClientX, centerClientY);
            const startDistance = Math.max(1, Math.hypot(event.clientX - centerClientX, event.clientY - centerClientY));
            const from = parts.map((image) => ({ image, position: positionOf(image) }));
            corner.setPointerCapture(event.pointerId);

            const scale = (pointerEvent) => {
                const distance = Math.hypot(pointerEvent.clientX - centerClientX, pointerEvent.clientY - centerClientY);
                const factor = clamp(distance / startDistance, 0.2, 5);
                from.forEach(({ image, position }) => {
                    if (parts.length > 1) {
                        image.style.left = `${center.x + (Number.parseFloat(position.left) - center.x) * factor}px`;
                        image.style.top = `${center.y + (Number.parseFloat(position.top) - center.y) * factor}px`;
                    }
                    setPartScale(image, Number.parseFloat(position.scale) * factor);
                });
                updateSelectionFrame();
            };
            const stop = () => {
                corner.removeEventListener("pointermove", scale);
                corner.removeEventListener("pointerup", stop);
                corner.removeEventListener("pointercancel", stop);
                const changes = from.map(({ image, position }) => ({ image, from: position, to: positionOf(image) }))
                    .filter(({ from: before, to }) => before.left !== to.left || before.top !== to.top || before.scale !== to.scale);
                if (!changes.length) return;
                if (changes.length === 1) remember({ type: "scale", image: changes[0].image, from: changes[0].from, to: changes[0].to });
                else remember({ type: "scale-group", changes });
            };

            corner.addEventListener("pointermove", scale);
            corner.addEventListener("pointerup", stop);
            corner.addEventListener("pointercancel", stop);
        });
    });
}

function addPartToCanvas(part, clientX, clientY, options = {}) {
    const point = clientToWorld(clientX, clientY);
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
    placedPart.style.left = `${point.x}px`;
    placedPart.style.top = `${point.y}px`;
    placedPart.style.setProperty("--rotation", options.rotation ?? "0deg");
    setPartScale(placedPart, options.scale ?? "1.6");
    placedPart.append(image, rotateHandle);
    makePlacedPartDraggable(placedPart);
    makePlacedPartRotatable(placedPart);
    canvasWorld.append(placedPart);
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
    const size = worldSize();
    const selectedPosition = selectedPart ? positionOf(selectedPart) : null;
    const offsetX = selectedPosition ? Number.parseFloat(selectedPosition.left) + 24 : size.width / 2;
    const offsetY = selectedPosition ? Number.parseFloat(selectedPosition.top) + 24 : size.height / 2;
    addPartToCanvas(copiedPart, bounds.left + viewX + offsetX * viewScale, bounds.top + viewY + offsetY * viewScale, { rotation: copiedPart.rotation, scale: copiedPart.scale });
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
        image.loading = "lazy";
        image.decoding = "async";
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

function unitLabel(unitId) {
    const name = unitCatalog[unitId]?.name;
    return name && name !== unitId ? `${unitId} ${name}` : unitId;
}

function closeUnitResults() {
    unitResults.classList.remove("is-open");
    unitSearch.setAttribute("aria-expanded", "false");
    activeUnitResultIndex = -1;
}

function updateActiveUnitResult() {
    unitResults.querySelectorAll(".unit-result").forEach((result, index) => {
        const isActive = index === activeUnitResultIndex;
        result.classList.toggle("is-active", isActive);
        result.setAttribute("aria-selected", String(isActive));
        if (isActive) result.scrollIntoView({ block: "nearest" });
    });
}

function chooseUnit(unitId) {
    if (!unitCatalog[unitId]) return;
    unitSelect.value = unitId;
    unitSearch.value = unitLabel(unitId);
    closeUnitResults();
    updateRankOptions();
    renderParts();
}

function renderUnitResults() {
    const query = unitSearch.value.trim().toLocaleLowerCase();
    matchingUnitIds = Object.keys(unitCatalog)
        .sort()
        .filter((unitId) => unitLabel(unitId).toLocaleLowerCase().includes(query));
    activeUnitResultIndex = -1;
    unitResults.replaceChildren();

    if (!matchingUnitIds.length) {
        const empty = document.createElement("p");
        empty.className = "unit-result-empty";
        empty.textContent = "找不到角色";
        unitResults.append(empty);
    } else {
        for (const unitId of matchingUnitIds) {
            const result = document.createElement("button");
            const id = document.createElement("span");
            const name = document.createElement("span");
            result.className = "unit-result";
            result.type = "button";
            result.setAttribute("role", "option");
            id.className = "unit-result-id";
            name.className = "unit-result-name";
            id.textContent = unitId;
            name.textContent = unitCatalog[unitId].name ?? "";
            result.append(id, name);
            result.addEventListener("click", () => chooseUnit(unitId));
            unitResults.append(result);
        }
    }

    unitResults.classList.add("is-open");
    unitSearch.setAttribute("aria-expanded", "true");
}

function populateUnitSelect() {
    for (const unitId of Object.keys(unitCatalog).sort()) {
        const option = document.createElement("option");
        option.value = unitId;
        option.textContent = unitLabel(unitId);
        unitSelect.append(option);
    }
    unitSearch.value = "";
    updateRankOptions();
}

setTheme(initialTheme);
setVolume(initialVolume);
setMuted(initialMuted);
populateUnitSelect();
renderParts();
updateUndoButton();
makeSelectedGroupRotatable();
makeSelectionScalable();

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
viewHomeButton.addEventListener("click", resetCanvasView);
layerBackButton.addEventListener("click", (event) => moveSelectedLayer(-1, event.shiftKey));
layerFrontButton.addEventListener("click", (event) => moveSelectedLayer(1, event.shiftKey));
trashZone.addEventListener("pointerdown", startClearHold);
unitSearch.addEventListener("focus", renderUnitResults);
unitSearch.addEventListener("input", renderUnitResults);
unitSearch.addEventListener("keydown", (event) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        if (!unitResults.classList.contains("is-open")) renderUnitResults();
        if (!matchingUnitIds.length) return;
        const direction = event.key === "ArrowDown" ? 1 : -1;
        activeUnitResultIndex = (activeUnitResultIndex + direction + matchingUnitIds.length) % matchingUnitIds.length;
        updateActiveUnitResult();
    }
    if (event.key === "Enter") {
        event.preventDefault();
        chooseUnit(matchingUnitIds[activeUnitResultIndex] ?? matchingUnitIds[0]);
    }
    if (event.key === "Escape") {
        unitSearch.value = unitLabel(unitSelect.value);
        closeUnitResults();
        unitSearch.blur();
    }
});
document.addEventListener("pointerdown", (event) => {
    if (!event.target.closest(".unit-search")) closeUnitResults();
});
rankSelect.addEventListener("change", renderParts);
canvas.addEventListener("pointerdown", startMarqueeSelection);
canvas.addEventListener("pointerdown", startCanvasPan);
canvas.addEventListener("wheel", zoomCanvas, { passive: false });
canvas.addEventListener("contextmenu", (event) => event.preventDefault());
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

    if (event.key === "Delete" || event.key === "Backspace") {
        if (!selectedParts.size) return;
        event.preventDefault();
        removeSelectedParts();
        return;
    }

    if (!selectedPart) return;

    if (event.key === "ArrowUp" || event.key.toLowerCase() === "w") {
        event.preventDefault();
        moveSelectedLayer(1, event.shiftKey);
    }

    if (event.key === "ArrowDown" || event.key.toLowerCase() === "s") {
        event.preventDefault();
        moveSelectedLayer(-1, event.shiftKey);
    }
});
