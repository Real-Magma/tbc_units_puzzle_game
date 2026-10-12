const root = document.documentElement;
const themeButton = document.querySelector("#theme-button");
const soundButton = document.querySelector("#sound-button");
const effectsButton = document.querySelector("#effects-button");
const themeIcon = themeButton.querySelector("i");
const soundIcon = soundButton.querySelector("i");
const effectsIcon = effectsButton.querySelector("i");
const themeTooltip = document.querySelector("#theme-tooltip");
const soundTooltip = document.querySelector("#sound-tooltip");
const effectsTooltip = document.querySelector("#effects-tooltip");
const backgroundMusic = document.querySelector("#background-music");
const bowlingSound = document.querySelector("#bowling-sound");
const popSound = document.querySelector("#pop-sound");
const secretAreaSound = document.querySelector("#secret-area-sound");
const buttonSound = document.querySelector("#button-sound");
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
const layersPanel = document.querySelector("#layers-panel");
const layerContextMenu = document.querySelector("#layer-context-menu");
const mergeLayersButton = document.querySelector("#merge-layers-button");
const ungroupLayersButton = document.querySelector("#ungroup-layers-button");
const flipHorizontalButton = document.querySelector("#flip-horizontal-button");
const lockLayerButton = document.querySelector("#lock-layer-button");
const hideLayersButton = document.querySelector("#hide-layers-button");
const showLayersButton = document.querySelector("#show-layers-button");
const importProjectButton = document.querySelector("#import-project-button");
const importProjectInput = document.querySelector("#import-project-input");
const saveProjectButton = document.querySelector("#save-project-button");
const trashZone = document.querySelector("#trash-zone");
const unitSelect = document.querySelector("#unit-select");
const unitSearch = document.querySelector("#unit-search");
const unitResults = document.querySelector("#unit-results");
const rankSelect = document.querySelector("#rank-select");
const unitStatus = document.querySelector("#unit-status");
const partsList = document.querySelector("#parts-list");
let unitCatalog = {};
let unitIndex = globalThis.UNIT_INDEX ?? {};
const loadingUnits = new Map();
const history = [];
let activeParts = new Map();
let selectedPart = null;
const selectedParts = new Set();
const collapsedGroupIds = new Set();
let copiedParts = [];
let contextLayerPart = null;
let matchingUnitIds = [];
let activeUnitResultIndex = -1;
let viewScale = 1;
let viewX = 0;
let viewY = 0;

const savedTheme = localStorage.getItem("theme");
const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
const initialTheme = savedTheme ?? (systemPrefersDark ? "dark" : "light");
const initialMuted = localStorage.getItem("muted") === "true";
const initialEffectsMuted = localStorage.getItem("effects-muted") === "true";
const savedVolume = Number.parseFloat(localStorage.getItem("music-volume") ?? "0.5");
const initialVolume = Number.isFinite(savedVolume) ? clamp(savedVolume, 0, 1) : 0.5;
const effectsVolume = Object.freeze({
    pop: 0.38,
    bowling: 0.48,
    secretArea: 0.32,
    button: 0.3,
});

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
    const label = muted ? "開音樂" : "關音樂";
    soundButton.setAttribute("aria-label", label);
    soundTooltip.textContent = label;
}

function setEffectsMuted(muted) {
    [bowlingSound, popSound, secretAreaSound, buttonSound].forEach((sound) => { sound.muted = muted; });
    effectsIcon.className = muted ? "fa-solid fa-music" : "fa-solid fa-music";
    effectsButton.setAttribute("aria-pressed", String(muted));
    const label = muted ? "開音效" : "關音效";
    effectsButton.setAttribute("aria-label", label);
    effectsTooltip.textContent = label;
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

function playBowlingSound() {
    bowlingSound.volume = effectsVolume.bowling;
    bowlingSound.currentTime = 0;
    bowlingSound.play().catch(() => {});
}

function playPopSound() {
    popSound.volume = effectsVolume.pop;
    popSound.currentTime = 0;
    popSound.play().catch(() => {});
}

function playSecretAreaSound() {
    secretAreaSound.volume = effectsVolume.secretArea;
    secretAreaSound.currentTime = 0;
    secretAreaSound.play().catch(() => {});
}

function playButtonSound() {
    buttonSound.volume = effectsVolume.button;
    buttonSound.currentTime = 0;
    buttonSound.play().catch(() => {});
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
        flipX: image.dataset.flipX ?? "1",
    };
}

function setPartScale(image, scale, { minScale = 0.5, maxScale = 8 } = {}) {
    const nextScale = clamp(Number.parseFloat(scale), minScale, maxScale);
    image.style.setProperty("--scale", nextScale.toFixed(2));
    image.style.setProperty("--handle-scale", (1 / nextScale).toFixed(4));
    image.style.setProperty("--handle-offset", `${(-42 / nextScale).toFixed(3)}px`);
}

function setPartFlip(image, flipX) {
    const value = String(flipX);
    image.dataset.flipX = value;
    image.style.setProperty("--flip-x", value);
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
    if (!selectedPart?.isConnected) {
        layerBackButton.disabled = true;
        layerFrontButton.disabled = true;
        return;
    }

    const groupId = selectedPart.dataset.groupId;
    const movesWithinGroup = groupId && !isWholeGroupSelected(selectedPart);
    const parts = movesWithinGroup
        ? orderedParts().filter((part) => part.dataset.groupId === groupId)
        : groupId
            ? layerBlocks()
            : orderedParts();
    const current = movesWithinGroup ? selectedPart : groupId ? layerBlockForPart(selectedPart, parts) : selectedPart;
    const index = parts.indexOf(current);
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

    const largestPartScale = Math.max(...parts.map((part) => Number.parseFloat(positionOf(part).scale)));
    const selectionUiScale = clamp(largestPartScale / 1.6, 0.5, 5);
    selectionFrame.style.setProperty("--selection-ui-scale", selectionUiScale.toFixed(3));

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

function setSelectedParts(parts, primary = parts.at(-1) ?? null, { expandGroups = true } = {}) {
    canvasWorld.querySelectorAll(".placed-part.is-selected, .placed-part.is-primary").forEach((part) => {
        part.classList.remove("is-selected", "is-primary");
    });
    selectedParts.clear();
    const groupedParts = expandGroups
        ? expandGroupedParts(parts)
        : parts.filter((part) => part.isConnected && !part.classList.contains("is-layer-locked"));
    groupedParts.forEach((part) => {
        selectedParts.add(part);
        part.classList.add("is-selected");
    });
    selectedPart = selectedParts.has(primary) ? primary : [...selectedParts].at(-1) ?? null;
    selectedPart?.classList.add("is-primary");
    updateLayerButtons();
    updateSelectionFrame();
    renderLayersPanel();
}

function expandGroupedParts(parts) {
    const available = parts.filter((part) => part.isConnected && !part.classList.contains("is-layer-locked"));
    const groupIds = new Set(available.map((part) => part.dataset.groupId).filter(Boolean));
    if (!groupIds.size) return available;
    return orderedParts().filter((part) => available.includes(part)
        || (groupIds.has(part.dataset.groupId) && !part.classList.contains("is-layer-locked")));
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

function draggedLayerParts() {
    const parts = orderedParts();
    const groupId = layersPanel.dataset.draggingGroupId;
    if (groupId) return parts.filter((part) => part.dataset.groupId === groupId);
    const index = Number.parseInt(layersPanel.dataset.draggingLayer, 10);
    return Number.isInteger(index) && parts[index] ? [parts[index]] : [];
}

function clearLayerDragState() {
    delete layersPanel.dataset.draggingLayer;
    delete layersPanel.dataset.draggingGroupId;
    layersPanel.querySelectorAll(".layer-row, .layer-group").forEach((item) => item.classList.remove("is-dragging", "is-drop-target"));
}

function setGroupDragImage(event, groupContainer) {
    const bounds = groupContainer.getBoundingClientRect();
    const preview = groupContainer.cloneNode(true);
    preview.classList.remove("is-dragging", "is-drop-target");
    preview.classList.add("layer-group-drag-preview");
    preview.style.width = `${bounds.width}px`;
    document.body.append(preview);
    event.dataTransfer.setDragImage(preview, Math.min(bounds.width / 2, 70), 20);
    requestAnimationFrame(() => preview.remove());
}

function moveLayerBlock(sourceParts, targetParts, insertAbove) {
    const before = orderedParts();
    const sourceSet = new Set(sourceParts);
    if (!sourceParts.length || targetParts.some((part) => sourceSet.has(part))) return;
    const after = before.filter((part) => !sourceSet.has(part));
    const targetIndexes = targetParts.map((part) => after.indexOf(part)).filter((index) => index !== -1);
    if (!targetIndexes.length) return;
    const targetIndex = insertAbove ? Math.max(...targetIndexes) + 1 : Math.min(...targetIndexes);
    after.splice(targetIndex, 0, ...sourceParts);
    setLayerOrder(after);
    remember({ type: "layers", order: before });
    renderLayersPanel();
}

function layerBlocks(parts = orderedParts()) {
    const blocks = [];
    const seenGroups = new Set();
    parts.forEach((part) => {
        const groupId = part.dataset.groupId;
        if (!groupId) {
            blocks.push(part);
            return;
        }
        if (seenGroups.has(groupId)) return;
        seenGroups.add(groupId);
        blocks.push(parts.filter((item) => item.dataset.groupId === groupId));
    });
    return blocks;
}

function layerBlockForPart(part, blocks = layerBlocks()) {
    return blocks.find((block) => Array.isArray(block) && block.includes(part)) ?? part;
}

function isWholeGroupSelected(part = selectedPart) {
    const groupId = part?.dataset.groupId;
    if (!groupId) return false;
    const members = orderedParts().filter((item) => item.dataset.groupId === groupId);
    return members.length > 0 && members.every((item) => selectedParts.has(item));
}

function movePartWithinGroup(part, direction, toEdge = false) {
    const groupId = part?.dataset.groupId;
    if (!groupId) return false;
    const before = orderedParts();
    const members = before.filter((item) => item.dataset.groupId === groupId);
    const index = members.indexOf(part);
    const targetIndex = toEdge
        ? (direction > 0 ? members.length - 1 : 0)
        : clamp(index + direction, 0, members.length - 1);
    if (index === -1 || index === targetIndex) return false;

    const orderedMembers = [...members];
    orderedMembers.splice(index, 1);
    orderedMembers.splice(targetIndex, 0, part);
    const memberSlots = before
        .map((item, itemIndex) => item.dataset.groupId === groupId ? itemIndex : -1)
        .filter((itemIndex) => itemIndex !== -1);
    const after = [...before];
    memberSlots.forEach((slot, memberIndex) => {
        after[slot] = orderedMembers[memberIndex];
    });
    setLayerOrder(after);
    remember({ type: "layers", order: before });
    updateLayerButtons();
    renderLayersPanel();
    return true;
}

function placePartWithinGroup(part, targetPart, insertAbove) {
    const groupId = part?.dataset.groupId;
    if (!groupId || targetPart?.dataset.groupId !== groupId || part === targetPart) return false;
    const before = orderedParts();
    const members = before.filter((item) => item.dataset.groupId === groupId);
    const sourceIndex = members.indexOf(part);
    const targetIndex = members.indexOf(targetPart);
    if (sourceIndex === -1 || targetIndex === -1) return false;

    const orderedMembers = [...members];
    orderedMembers.splice(sourceIndex, 1);
    const targetAfterRemovalIndex = targetIndex - (sourceIndex < targetIndex ? 1 : 0);
    const insertionIndex = targetAfterRemovalIndex + (insertAbove ? 1 : 0);
    orderedMembers.splice(insertionIndex, 0, part);
    const memberSlots = before
        .map((item, itemIndex) => item.dataset.groupId === groupId ? itemIndex : -1)
        .filter((itemIndex) => itemIndex !== -1);
    const after = [...before];
    memberSlots.forEach((slot, memberIndex) => {
        after[slot] = orderedMembers[memberIndex];
    });
    setLayerOrder(after);
    remember({ type: "layers", order: before });
    updateLayerButtons();
    renderLayersPanel();
    return true;
}

function moveGroupLayer(part, direction, toEdge = false) {
    const before = orderedParts();
    const blocks = layerBlocks(before);
    const block = layerBlockForPart(part, blocks);
    const index = blocks.indexOf(block);
    const targetIndex = toEdge
        ? (direction > 0 ? blocks.length - 1 : 0)
        : clamp(index + direction, 0, blocks.length - 1);
    if (index === -1 || index === targetIndex) return false;

    const afterBlocks = [...blocks];
    afterBlocks.splice(index, 1);
    afterBlocks.splice(targetIndex, 0, block);
    setLayerOrder(afterBlocks.flatMap((item) => Array.isArray(item) ? item : [item]));
    remember({ type: "layers", order: before });
    updateLayerButtons();
    renderLayersPanel();
    return true;
}

function closeLayerContextMenu() {
    contextLayerPart = null;
    layerContextMenu.hidden = true;
}

function contextMenuParts() {
    if (!contextLayerPart?.isConnected) return [];
    if (!selectedParts.has(contextLayerPart)) {
        return contextLayerPart.dataset.groupId
            ? orderedParts().filter((part) => part.dataset.groupId === contextLayerPart.dataset.groupId)
            : [contextLayerPart];
    }

    const selected = [...selectedParts].filter((part) => part.isConnected);
    const selectedGroupIds = new Set(selected.map((part) => part.dataset.groupId).filter(Boolean));
    return orderedParts().filter((part) => selected.includes(part) || selectedGroupIds.has(part.dataset.groupId));
}

function showLayerContextMenu(event, part, { fromLayersPanel = false } = {}) {
    event.preventDefault();
    event.stopPropagation();
    if (part.dataset.groupId) {
        const groupParts = orderedParts().filter((item) => item.dataset.groupId === part.dataset.groupId);
        if (!groupParts.every((item) => selectedParts.has(item))) setSelectedParts(groupParts, part);
    } else if (!selectedParts.has(part)) {
        selectPlacedPart(part);
    }
    contextLayerPart = part;
    const contextParts = contextMenuParts();
    const hasLockedPart = contextParts.some((item) => item.classList.contains("is-layer-locked"));
    const groupIds = new Set(contextParts.map((item) => item.dataset.groupId).filter(Boolean));
    const canGroup = contextParts.length > 1 && !(groupIds.size === 1 && contextParts.every((item) => item.dataset.groupId));
    const isSingleGroup = Boolean(part.dataset.groupId)
        && contextParts.length > 0
        && contextParts.every((item) => item.dataset.groupId === part.dataset.groupId);
    mergeLayersButton.hidden = !canGroup;
    ungroupLayersButton.hidden = groupIds.size === 0;
    flipHorizontalButton.disabled = contextParts.some((item) => item.classList.contains("is-layer-locked"));
    lockLayerButton.hidden = isSingleGroup;
    lockLayerButton.querySelector("i").className = `fa-solid ${hasLockedPart ? "fa-lock-open" : "fa-lock"}`;
    lockLayerButton.querySelector("span").textContent = hasLockedPart ? "解除鎖定" : "鎖定";
    const canToggleSelectedVisibility = fromLayersPanel && contextParts.length > 1 && !isSingleGroup;
    hideLayersButton.hidden = isSingleGroup;
    showLayersButton.hidden = !canToggleSelectedVisibility;
    layerContextMenu.hidden = false;
    const margin = 8;
    const menuWidth = layerContextMenu.offsetWidth;
    const menuHeight = layerContextMenu.offsetHeight;
    layerContextMenu.style.left = `${Math.min(event.clientX, window.innerWidth - menuWidth - margin)}px`;
    layerContextMenu.style.top = `${Math.min(event.clientY, window.innerHeight - menuHeight - margin)}px`;
}

function setLayerVisibility(parts, hidden) {
    const targetParts = parts.filter((part) => part?.isConnected);
    if (!targetParts.length) return;
    targetParts.forEach((part) => part.classList.toggle("is-layer-hidden", hidden));
    const remaining = [...selectedParts].filter((part) => part.isConnected && !part.classList.contains("is-layer-hidden"));
    setSelectedParts(remaining, remaining.includes(selectedPart) ? selectedPart : remaining.at(-1));
}

function flipPartHorizontally(part) {
    if (!part?.isConnected) return;
    const from = positionOf(part);
    setPartFlip(part, from.flipX === "-1" ? "1" : "-1");
    remember({ type: "flip", image: part, from, to: positionOf(part) });
    updateSelectionFrame();
    renderLayersPanel();
}

function flipSelectedParts() {
    const parts = contextMenuParts();
    const changes = parts.filter((part) => part?.isConnected && !part.classList.contains("is-layer-locked"))
        .map((part) => ({ image: part, from: positionOf(part) }));
    if (!changes.length) return;
    if (changes.length === 1) {
        const [{ image, from }] = changes;
        setPartFlip(image, from.flipX === "-1" ? "1" : "-1");
    } else {
        const bounds = changes.map(({ image }) => image.getBoundingClientRect());
        const left = Math.min(...bounds.map((bound) => clientToWorld(bound.left, bound.top).x));
        const right = Math.max(...bounds.map((bound) => clientToWorld(bound.right, bound.top).x));
        const centerX = (left + right) / 2;
        changes.forEach(({ image, from }) => {
            image.style.left = `${2 * centerX - Number.parseFloat(from.left)}px`;
            image.style.setProperty("--rotation", `${-Number.parseFloat(from.rotation)}deg`);
            setPartFlip(image, from.flipX === "-1" ? "1" : "-1");
        });
    }
    remember({ type: "flip-group", changes });
    updateSelectionFrame();
    renderLayersPanel();
}

function mergeSelectedParts() {
    const beforeOrder = orderedParts();
    const parts = beforeOrder.filter((part) => selectedParts.has(part) && part.isConnected);
    if (parts.length < 2) return;
    const previousGroups = parts.map((part) => ({ image: part, groupId: part.dataset.groupId ?? "", groupColor: part.dataset.groupColor ?? "" }));
    const groupId = globalThis.crypto?.randomUUID?.() ?? `group-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const groupColor = `hsl(${Math.floor(Math.random() * 360)} 70% 52% / 0.18)`;
    parts.forEach((part) => {
        part.dataset.groupId = groupId;
        part.dataset.groupColor = groupColor;
    });
    const firstGroupIndex = beforeOrder.findIndex((part) => parts.includes(part));
    const afterOrder = beforeOrder.filter((part) => !parts.includes(part));
    afterOrder.splice(firstGroupIndex, 0, ...parts);
    setLayerOrder(afterOrder);
    setSelectedParts(parts, parts.at(-1));
    remember({ type: "group", parts: previousGroups, order: beforeOrder });
}

function ungroupContextParts() {
    const contextParts = contextMenuParts();
    const groupIds = new Set(contextParts.map((part) => part?.dataset.groupId).filter(Boolean));
    if (!groupIds.size) return;
    const parts = orderedParts().filter((part) => groupIds.has(part.dataset.groupId));
    const previousGroups = parts.map((part) => ({ image: part, groupId: part.dataset.groupId, groupColor: part.dataset.groupColor ?? "" }));
    parts.forEach((part) => {
        delete part.dataset.groupId;
        delete part.dataset.groupColor;
    });
    groupIds.forEach((groupId) => collapsedGroupIds.delete(groupId));
    setSelectedParts(parts, contextLayerPart);
    remember({ type: "ungroup", parts: previousGroups });
}

function setSelectedPartsLocked(locked) {
    const parts = contextMenuParts();
    const targetParts = parts.filter((part) => part?.isConnected);
    if (!targetParts.length) return;
    setPartsLocked(targetParts, locked);
    if (!locked) setSelectedParts(targetParts, targetParts.at(-1));
}

function setPartsLocked(parts, locked) {
    const targetParts = parts.filter((part) => part?.isConnected);
    if (!targetParts.length) return;
    targetParts.forEach((part) => {
        if (locked) updateLockStripeOverlay(part);
        part.classList.toggle("is-layer-locked", locked);
    });
    if (locked) {
        const remaining = [...selectedParts].filter((part) => part.isConnected && !targetParts.includes(part));
        setSelectedParts(remaining, remaining.includes(selectedPart) ? selectedPart : remaining.at(-1));
    } else {
        updateLayerButtons();
        updateSelectionFrame();
        renderLayersPanel();
    }
}

function setPartLocked(part, locked) {
    if (!part?.isConnected) return;
    if (locked) updateLockStripeOverlay(part);
    part.classList.toggle("is-layer-locked", locked);
    if (locked && selectedParts.has(part)) {
        setSelectedParts([...selectedParts].filter((selected) => selected !== part));
        return;
    }
    renderLayersPanel();
}

function updateLockStripeOverlay(part) {
    const image = part.querySelector("img");
    const overlay = part.querySelector(".lock-stripe-overlay");
    if (!image?.naturalWidth || !image.naturalHeight || !overlay) return;

    overlay.width = image.naturalWidth;
    overlay.height = image.naturalHeight;
    const context = overlay.getContext("2d");
    context.clearRect(0, 0, overlay.width, overlay.height);
    context.strokeStyle = "rgba(220, 38, 38, 0.25)";
    context.lineWidth = Math.max(2, Math.round(Math.min(overlay.width, overlay.height) / 24));
    const spacing = Math.max(7, Math.round(Math.min(overlay.width, overlay.height) / 9));

    for (let offset = -overlay.height; offset < overlay.width + overlay.height; offset += spacing) {
        context.beginPath();
        context.moveTo(offset, overlay.height);
        context.lineTo(offset + overlay.height, 0);
        context.stroke();
    }

    context.globalCompositeOperation = "destination-in";
    context.drawImage(image, 0, 0, overlay.width, overlay.height);
    context.globalCompositeOperation = "source-over";
}

function unlockAllLayers() {
    const lockedParts = orderedParts().filter((part) => part.classList.contains("is-layer-locked"));
    if (!lockedParts.length) return;
    lockedParts.forEach((part) => part.classList.remove("is-layer-locked"));
    renderLayersPanel();
}

function timestampedFileName(extension) {
    const timestamp = new Date().toISOString().replace(/\D/g, "").slice(0, 14);
    return `tbc-${timestamp}.${extension}`;
}

function downloadBlob(blob, fileName) {
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = fileName;
    link.style.display = "none";
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function createPngExport() {
    const scale = Math.max(1, window.devicePixelRatio || 1);
    const output = document.createElement("canvas");
    output.width = Math.round(canvas.clientWidth * scale);
    output.height = Math.round(canvas.clientHeight * scale);
    const context = output.getContext("2d");
    if (!context) throw new Error("無法建立 PNG 繪圖區");
    context.scale(scale, scale);

    orderedParts().filter((part) => !part.classList.contains("is-layer-hidden")).forEach((part) => {
        const image = part.querySelector("img");
        if (!image.complete || !image.naturalWidth || !image.naturalHeight) return;
        const state = positionOf(part);
        const partScale = Number.parseFloat(state.scale);
        const angle = Number.parseFloat(state.rotation) * Math.PI / 180;
        context.save();
        context.translate(viewX + Number.parseFloat(state.left) * viewScale, viewY + Number.parseFloat(state.top) * viewScale);
        context.scale(partScale * viewScale, partScale * viewScale);
        context.rotate(angle);
        context.scale(Number.parseFloat(state.flipX), 1);
        context.drawImage(image, -image.naturalWidth / 2, -image.naturalHeight / 2);
        context.restore();
    });

    const dataUrl = output.toDataURL("image/png");
    const encodedData = dataUrl.slice(dataUrl.indexOf(",") + 1);
    const binaryData = atob(encodedData);
    const bytes = Uint8Array.from(binaryData, (character) => character.charCodeAt(0));
    return { dataUrl, blob: new Blob([bytes], { type: "image/png" }) };
}

async function exportTransparentPng() {
    let png;
    try {
        png = createPngExport();
    } catch (error) {
        console.error("PNG 匯出失敗", error);
        window.alert("PNG 圖片建立失敗，請確認所有角色圖片都已載入完成後再試一次。");
        return;
    }

    const fileName = timestampedFileName("png");
    try {
        if ("showSaveFilePicker" in window) {
            try {
                const handle = await window.showSaveFilePicker({
                    suggestedName: fileName,
                    types: [{ description: "PNG 圖片", accept: { "image/png": [".png"] } }],
                });
                const writable = await handle.createWritable();
                await writable.write(png.blob);
                await writable.close();
                return;
            } catch (error) {
                if (error?.name === "AbortError") return;
                console.warn("系統另存視窗失敗，改用瀏覽器下載", error);
            }
        }

        const link = document.createElement("a");
        link.href = png.dataUrl;
        link.download = fileName;
        link.style.display = "none";
        document.body.append(link);
        link.click();
        link.remove();
    } catch (error) {
        console.error("PNG 匯出失敗", error);
        window.alert("PNG 匯出失敗，請確認所有角色圖片都已載入完成後再試一次。");
    }
}

async function copyPngToClipboard() {
    try {
        if (!navigator.clipboard?.write || !window.ClipboardItem) throw new Error("瀏覽器不支援圖片剪貼簿");
        const png = createPngExport();
        await navigator.clipboard.write([new ClipboardItem({ "image/png": png.blob })]);
        const tooltip = copyPngButton.querySelector(".icon-tooltip");
        copyPngButton.classList.add("is-copied");
        tooltip.textContent = "已複製！";
        window.setTimeout(() => {
            copyPngButton.classList.remove("is-copied");
            tooltip.textContent = "複製 PNG";
        }, 1400);
    } catch (error) {
        console.error("複製 PNG 失敗", error);
        window.alert("無法複製 PNG。請使用 Chrome 或 Edge，並允許網站存取剪貼簿。");
    }
}

async function saveLayerProject() {
    const project = {
        format: "tbc-units-puzzle",
        version: 1,
        savedAt: new Date().toISOString(),
        view: { scale: viewScale, x: viewX, y: viewY },
        layers: orderedParts().map((part) => ({
            src: part.dataset.src,
            name: part.dataset.name,
            zIndex: Number(part.style.zIndex),
            hidden: part.classList.contains("is-layer-hidden"),
            locked: part.classList.contains("is-layer-locked"),
            groupId: part.dataset.groupId ?? "",
            groupColor: part.dataset.groupColor ?? "",
            ...positionOf(part),
        })),
    };
    const blob = new Blob([JSON.stringify(project, null, 2)], { type: "application/json" });
    const fileName = timestampedFileName("tbc-puzzle");
    if ("showSaveFilePicker" in window) {
        try {
            const handle = await window.showSaveFilePicker({
                suggestedName: fileName,
                types: [{ description: "TBC Puzzle 圖層專案", accept: { "application/json": [".tbc-puzzle"] } }],
            });
            const writable = await handle.createWritable();
            await writable.write(blob);
            await writable.close();
            return;
        } catch (error) {
            if (error?.name === "AbortError") return;
        }
    }
    downloadBlob(blob, fileName);
}

async function importLayerProject(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    try {
        const project = JSON.parse(await file.text());
        if (project?.format !== "tbc-units-puzzle" || !Array.isArray(project.layers)) throw new Error("檔案格式不正確");
        const layers = project.layers.filter((layer) => typeof layer?.src === "string" && layer.src.length > 0);

        orderedParts().forEach((part) => part.remove());
        history.length = 0;

        const importedParts = layers.map((layer, index) => {
            const left = Number.parseFloat(layer.left);
            const top = Number.parseFloat(layer.top);
            const part = addPartToCanvas({ src: layer.src, name: layer.name || `圖層 ${index + 1}` }, 0, 0, {
                worldPoint: { x: Number.isFinite(left) ? left : 0, y: Number.isFinite(top) ? top : 0 },
                rotation: layer.rotation,
                scale: layer.scale,
                flipX: layer.flipX,
            });
            const zIndex = Number(layer.zIndex);
            part.style.zIndex = String(Number.isFinite(zIndex) ? zIndex : index + 1);
            part.classList.toggle("is-layer-hidden", Boolean(layer.hidden));
            part.classList.toggle("is-layer-locked", Boolean(layer.locked));
            if (typeof layer.groupId === "string" && layer.groupId) part.dataset.groupId = layer.groupId;
            if (typeof layer.groupColor === "string" && layer.groupColor) part.dataset.groupColor = layer.groupColor;
            return part;
        });

        history.length = 0;
        viewScale = clamp(Number(project.view?.scale) || 1, 0.5, 2.5);
        viewX = Number.isFinite(Number(project.view?.x)) ? Number(project.view.x) : canvas.clientWidth / 2;
        viewY = Number.isFinite(Number(project.view?.y)) ? Number(project.view.y) : canvas.clientHeight / 2;
        updateViewTransform();
        setSelectedParts([], null);
        updateUndoButton();
        renderLayersPanel();
        updateSelectionFrame();
        importedParts.forEach((part) => part.querySelector("img")?.addEventListener("error", () => renderLayersPanel(), { once: true }));
    } catch (error) {
        console.error("匯入圖層專案失敗", error);
        window.alert("無法匯入此檔案。請選擇由本遊戲儲存的 .tbc-puzzle 檔案。");
    }
}

function renderLayersPanel() {
    const parts = orderedParts();
    layersPanel.hidden = parts.length === 0;
    layersPanel.replaceChildren();
    if (!parts.length) return;

    const title = document.createElement("p");
    title.className = "layers-panel-title";
    title.textContent = "";
    layersPanel.append(title);
    const groupContainers = new Map();

    [...parts].reverse().forEach((part) => {
        const row = document.createElement("div");
        const thumbnail = document.createElement("img");
        const visibility = document.createElement("button");
        const lock = document.createElement("button");
        row.className = "layer-row";
        row.draggable = !part.classList.contains("is-layer-locked");
        row.title = part.dataset.name;
        row.tabIndex = 0;
        row.setAttribute("role", "button");
        row.setAttribute("aria-label", `選取圖層：${part.dataset.name}`);
        row.classList.toggle("is-selected", selectedParts.has(part));
        row.classList.toggle("is-hidden", part.classList.contains("is-layer-hidden"));
        row.classList.toggle("is-locked", part.classList.contains("is-layer-locked"));
        row.classList.toggle("is-flipped", part.dataset.flipX === "-1");

        thumbnail.src = part.dataset.src;
        thumbnail.alt = "";
        thumbnail.draggable = false;
        visibility.className = "layer-visibility";
        visibility.type = "button";
        visibility.setAttribute("aria-label", part.classList.contains("is-layer-hidden") ? `顯示 ${part.dataset.name}` : `隱藏 ${part.dataset.name}`);
        visibility.innerHTML = `<i class="fa-solid ${part.classList.contains("is-layer-hidden") ? "fa-eye-slash" : "fa-eye"}" aria-hidden="true"></i>`;
        lock.className = "layer-lock";
        lock.type = "button";
        lock.setAttribute("aria-label", part.classList.contains("is-layer-locked") ? `解除鎖定 ${part.dataset.name}` : `鎖定 ${part.dataset.name}`);
        lock.innerHTML = `<i class="fa-solid ${part.classList.contains("is-layer-locked") ? "fa-lock" : "fa-lock-open"}" aria-hidden="true"></i>`;

        row.addEventListener("click", (event) => {
            if (!event.ctrlKey && !event.metaKey) {
                setSelectedParts([part], part, { expandGroups: false });
                return;
            }
            const nextSelection = new Set(selectedParts);
            if (nextSelection.has(part)) nextSelection.delete(part);
            else nextSelection.add(part);
            const nextParts = [...nextSelection];
            setSelectedParts(nextParts, nextSelection.has(part) ? part : nextParts.at(-1), { expandGroups: false });
        });
        row.addEventListener("contextmenu", (event) => showLayerContextMenu(event, part, { fromLayersPanel: true }));
        row.addEventListener("keydown", (event) => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                selectPlacedPart(part);
            }
        });
        visibility.addEventListener("click", (event) => {
            event.stopPropagation();
            const hidden = part.classList.toggle("is-layer-hidden");
            if (hidden && selectedParts.has(part)) {
                const remaining = [...selectedParts].filter((selected) => selected !== part && selected.isConnected);
                setSelectedParts(remaining, selectedPart === part ? remaining.at(-1) : selectedPart);
            } else {
                renderLayersPanel();
            }
        });
        lock.addEventListener("click", (event) => {
            event.stopPropagation();
            setPartLocked(part, !part.classList.contains("is-layer-locked"));
        });
        row.addEventListener("dragstart", (event) => {
            event.stopPropagation();
            if (part.classList.contains("is-layer-locked")) {
                event.preventDefault();
                return;
            }
            row.classList.add("is-dragging");
            event.dataTransfer.effectAllowed = "move";
            event.dataTransfer.setData("text/plain", "layer");
            layersPanel.dataset.draggingLayer = String(parts.indexOf(part));
        });
        row.addEventListener("dragend", () => {
            clearLayerDragState();
        });
        row.addEventListener("dragover", (event) => {
            const [source] = draggedLayerParts();
            const canReorderInsideGroup = source?.dataset.groupId && source.dataset.groupId === part.dataset.groupId && source !== part;
            const canReorderUngrouped = !source?.dataset.groupId && !part.dataset.groupId && source !== part;
            const canPlaceGroup = source?.dataset.groupId && !part.dataset.groupId;
            if (!canReorderInsideGroup && !canReorderUngrouped && !canPlaceGroup) return;
            event.preventDefault();
            row.classList.add("is-drop-target");
        });
        row.addEventListener("dragleave", () => row.classList.remove("is-drop-target"));
        row.addEventListener("drop", (event) => {
            event.preventDefault();
            const [source] = draggedLayerParts();
            if (!source || source === part || (source.dataset.groupId !== part.dataset.groupId && part.dataset.groupId)) {
                clearLayerDragState();
                return;
            }
            const bounds = row.getBoundingClientRect();
            const insertAbove = event.clientY <= bounds.top + bounds.height / 2;
            if (part.dataset.groupId) {
                placePartWithinGroup(source, part, insertAbove);
            } else {
                moveLayerBlock(draggedLayerParts(), [part], insertAbove);
            }
            clearLayerDragState();
        });

        row.append(thumbnail, visibility, lock);
        if (!part.dataset.groupId) {
            layersPanel.append(row);
            return;
        }

        let groupContainer = groupContainers.get(part.dataset.groupId);
        if (!groupContainer) {
            groupContainer = document.createElement("section");
            groupContainer.className = "layer-group";
            const groupParts = orderedParts().filter((item) => item.dataset.groupId === part.dataset.groupId);
            groupContainer.classList.toggle("is-collapsed", collapsedGroupIds.has(part.dataset.groupId));
            groupContainer.classList.toggle("is-selected", groupParts.length > 0 && groupParts.every((item) => selectedParts.has(item)));
            groupContainer.draggable = !orderedParts().some((item) => item.dataset.groupId === part.dataset.groupId && item.classList.contains("is-layer-locked"));
            groupContainer.style.setProperty("--group-color", part.dataset.groupColor || "color-mix(in srgb, var(--button-hover-bg) 65%, transparent)");
            const header = document.createElement("div");
            header.className = "layer-group-header";
            const label = document.createElement("button");
            label.className = "layer-group-collapse";
            label.type = "button";
            label.setAttribute("aria-label", collapsedGroupIds.has(part.dataset.groupId) ? "展開群組" : "收合群組");
            label.setAttribute("aria-expanded", String(!collapsedGroupIds.has(part.dataset.groupId)));
            label.innerHTML = '<i class="fa-solid fa-object-group" aria-hidden="true"></i>';
            const controls = document.createElement("div");
            controls.className = "layer-group-controls";
            const visibilityToggle = document.createElement("button");
            const lockToggle = document.createElement("button");
            const allHidden = groupParts.every((item) => item.classList.contains("is-layer-hidden"));
            const allLocked = groupParts.every((item) => item.classList.contains("is-layer-locked"));
            visibilityToggle.className = "layer-group-control";
            visibilityToggle.type = "button";
            visibilityToggle.setAttribute("aria-label", allHidden ? "群組全部出現" : "群組全部消失");
            visibilityToggle.innerHTML = `<i class="fa-solid ${allHidden ? "fa-eye" : "fa-eye-slash"}" aria-hidden="true"></i>`;
            lockToggle.className = "layer-group-control";
            lockToggle.type = "button";
            lockToggle.setAttribute("aria-label", allLocked ? "群組全部解鎖" : "群組全部鎖定");
            lockToggle.innerHTML = `<i class="fa-solid ${allLocked ? "fa-lock-open" : "fa-lock"}" aria-hidden="true"></i>`;
            visibilityToggle.addEventListener("click", (event) => {
                event.stopPropagation();
                setLayerVisibility(groupParts, !allHidden);
            });
            lockToggle.addEventListener("click", (event) => {
                event.stopPropagation();
                setPartsLocked(groupParts, !allLocked);
            });
            label.addEventListener("click", (event) => {
                event.stopPropagation();
                const groupId = part.dataset.groupId;
                if (collapsedGroupIds.has(groupId)) collapsedGroupIds.delete(groupId);
                else collapsedGroupIds.add(groupId);
                renderLayersPanel();
            });
            controls.append(visibilityToggle, lockToggle);
            header.append(label, controls);
            groupContainer.append(header);
            groupContainer.addEventListener("pointerdown", (event) => {
                if (event.button !== 0 || event.target.closest(".layer-row, button")) return;
                if (event.ctrlKey || event.metaKey) {
                    const nextSelection = new Set(selectedParts);
                    const isGroupSelected = groupParts.every((item) => nextSelection.has(item));
                    groupParts.forEach((item) => {
                        if (isGroupSelected) nextSelection.delete(item);
                        else nextSelection.add(item);
                    });
                    const nextParts = [...nextSelection];
                    setSelectedParts(nextParts, nextSelection.has(groupParts.at(-1)) ? groupParts.at(-1) : nextParts.at(-1));
                    return;
                }
                setSelectedParts(groupParts, groupParts.at(-1));
            });
            groupContainer.addEventListener("contextmenu", (event) => {
                if (event.target.closest(".layer-row, button")) return;
                const currentGroupParts = orderedParts().filter((item) => item.dataset.groupId === part.dataset.groupId);
                showLayerContextMenu(event, currentGroupParts.at(-1), { fromLayersPanel: true });
            });
            groupContainer.addEventListener("dragstart", (event) => {
                if (event.target.closest("button, .layer-row")) {
                    event.preventDefault();
                    return;
                }
                groupContainer.classList.add("is-dragging");
                event.dataTransfer.effectAllowed = "move";
                event.dataTransfer.setData("text/plain", "layer-group");
                layersPanel.dataset.draggingGroupId = part.dataset.groupId;
                setGroupDragImage(event, groupContainer);
            });
            groupContainer.addEventListener("dragend", clearLayerDragState);
            groupContainer.addEventListener("dragover", (event) => {
                const sourceParts = draggedLayerParts();
                if (!sourceParts.length || sourceParts.every((item) => item.dataset.groupId === part.dataset.groupId)) return;
                event.preventDefault();
                groupContainer.classList.add("is-drop-target");
            });
            groupContainer.addEventListener("dragleave", () => groupContainer.classList.remove("is-drop-target"));
            groupContainer.addEventListener("drop", (event) => {
                event.preventDefault();
                const targetParts = orderedParts().filter((item) => item.dataset.groupId === part.dataset.groupId);
                const bounds = groupContainer.getBoundingClientRect();
                moveLayerBlock(draggedLayerParts(), targetParts, event.clientY <= bounds.top + bounds.height / 2);
                clearLayerDragState();
            });
            groupContainers.set(part.dataset.groupId, groupContainer);
            layersPanel.append(groupContainer);
        }
        groupContainer.append(row);
    });

    const unlockAll = document.createElement("button");
    unlockAll.className = "unlock-all-layers";
    unlockAll.type = "button";
    unlockAll.disabled = !parts.some((part) => part.classList.contains("is-layer-locked"));
    unlockAll.innerHTML = '<i class="fa-solid fa-lock-open" aria-hidden="true"></i><span>全部解鎖</span>';
    unlockAll.addEventListener("click", unlockAllLayers);
    layersPanel.append(unlockAll);
}

function flashLayerButton(button) {
    button.classList.remove("is-layer-jump");
    void button.offsetWidth;
    button.classList.add("is-layer-jump");
}

function moveSelectedLayer(direction, toEdge = false) {
    if (!selectedPart) return;

    if (selectedPart.dataset.groupId && !isWholeGroupSelected(selectedPart)) {
        if (movePartWithinGroup(selectedPart, direction, toEdge) && toEdge) {
            flashLayerButton(direction > 0 ? layerFrontButton : layerBackButton);
        }
        return;
    }

    if (selectedPart.dataset.groupId && isWholeGroupSelected(selectedPart)) {
        if (moveGroupLayer(selectedPart, direction, toEdge) && toEdge) {
            flashLayerButton(direction > 0 ? layerFrontButton : layerBackButton);
        }
        return;
    }

    const before = orderedParts();
    const index = before.indexOf(selectedPart);
    const targetIndex = toEdge ? (direction > 0 ? before.length - 1 : 0) : clamp(index + direction, 0, before.length - 1);
    if (index === -1 || index === targetIndex) return;

    const after = [...before];
    after.splice(index, 1);
    after.splice(targetIndex, 0, selectedPart);
    setLayerOrder(after);
    remember({ type: "layers", order: before });
    updateLayerButtons();
    renderLayersPanel();
    if (toEdge) flashLayerButton(direction > 0 ? layerFrontButton : layerBackButton);
}

function resetCanvasView() {
    viewScale = 1;
    viewX = canvas.clientWidth / 2;
    viewY = canvas.clientHeight / 2;
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
    setPartFlip(image, position.flipX ?? "1");
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
    if (action.type === "flip") restoreImage(action.image, action.from);
    if (action.type === "remove") restoreImage(action.image, action.position);
    if (action.type === "remove-group") action.parts.forEach(({ image, position }) => restoreImage(image, position));
    if (action.type === "flip-group") action.changes.forEach(({ image, from }) => restoreImage(image, from));
    if (action.type === "group") action.parts.forEach(({ image, groupId, groupColor }) => {
        if (groupId) image.dataset.groupId = groupId;
        else delete image.dataset.groupId;
        if (groupColor) image.dataset.groupColor = groupColor;
        else delete image.dataset.groupColor;
    });
    if (action.type === "group" && action.order) setLayerOrder(action.order);
    if (action.type === "ungroup") action.parts.forEach(({ image, groupId, groupColor }) => {
        image.dataset.groupId = groupId;
        if (groupColor) image.dataset.groupColor = groupColor;
    });
    if (action.type === "layers") setLayerOrder(action.order);
    if (action.type === "layer") action.image.style.zIndex = action.from;
    if (action.type === "clear") {
        action.parts.forEach(({ image, position }) => restoreImage(image, position));
        setLayerOrder(action.parts.map(({ image }) => image));
    }
    if (selectedPart && !selectedPart.isConnected) selectPlacedPart(null);
    updateUndoButton();
    updateLayerButtons();
    updateSelectionFrame();
    renderLayersPanel();
}

function isOverTrash(clientX, clientY) {
    const bounds = trashZone.getBoundingClientRect();
    const hitPadding = 40;
    return clientX >= bounds.left - hitPadding
        && clientX <= bounds.right + hitPadding
        && clientY >= bounds.top - hitPadding
        && clientY <= bounds.bottom + hitPadding;
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
    const parts = [...selectedParts].filter((part) => part.isConnected);
    if (!parts.length && selectedPart?.isConnected) parts.push(selectedPart);
    removePlacedGroup(parts);
}

function removePlacedGroup(parts, snapshot = null) {
    const connectedParts = parts.filter((part) => part.isConnected);
    if (!connectedParts.length) return;
    const partsSnapshot = snapshot ?? connectedParts.map((image) => ({ image, position: positionOf(image) }));
    connectedParts.forEach((part) => part.remove());
    selectPlacedPart(null);
    remember({ type: "remove-group", parts: partsSnapshot });
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

function playTrashClearAnimation() {
    trashZone.classList.remove("is-cleared");
    void trashZone.offsetWidth;
    trashZone.classList.add("is-cleared");
    trashZone.addEventListener("animationend", () => trashZone.classList.remove("is-cleared"), { once: true });
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
                playBowlingSound();
                playTrashClearAnimation();
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
    image.addEventListener("contextmenu", (event) => showLayerContextMenu(event, image));
    image.addEventListener("pointerdown", (event) => {
        if (event.button !== 0) return;
        if (image.classList.contains("is-layer-locked")) return;
        if (event.target.closest(".rotate-handle")) return;
        if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            const nextSelection = new Set(selectedParts);
            const members = image.dataset.groupId
                ? orderedParts().filter((part) => part.dataset.groupId === image.dataset.groupId)
                : [image];
            const isGroupSelected = members.every((member) => nextSelection.has(member));
            members.forEach((member) => {
                if (isGroupSelected) nextSelection.delete(member);
                else nextSelection.add(member);
            });
            const selected = [...nextSelection];
            setSelectedParts(selected, nextSelection.has(image) ? image : selected.at(-1));
            return;
        }
        event.preventDefault();
        const groupedParts = image.dataset.groupId
            ? orderedParts().filter((part) => part.dataset.groupId === image.dataset.groupId && !part.classList.contains("is-layer-locked"))
            : [];
        const dragParts = groupedParts.length > 1
            ? groupedParts
            : (selectedParts.has(image) && selectedParts.size > 1
                ? [...selectedParts].filter((part) => part.isConnected)
                : [image]);
        if (groupedParts.length > 1) setSelectedParts(groupedParts, image);
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
                from.forEach(({ image: part, position }) => {
                    part.style.left = position.left;
                    part.style.top = position.top;
                });
                removePlacedGroup(dragParts, from);
                if (dragParts.length > 1) {
                    playBowlingSound();
                    playTrashClearAnimation();
                }
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
    if (event.button !== 0 || (event.target !== canvasWorld && event.target !== canvas)) return;
    event.preventDefault();
    selectPlacedPart(null);

    const canvasBounds = canvas.getBoundingClientRect();
    const start = {
        x: clamp(event.clientX - canvasBounds.left, 0, canvasBounds.width),
        y: clamp(event.clientY - canvasBounds.top, 0, canvasBounds.height),
    };
    let hasDragged = false;
    canvas.setPointerCapture(event.pointerId);

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
        if (width > 4 || height > 4) {
            hasDragged = true;
            marqueeSelection.classList.add("is-visible");
        }
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
    if (event.target.closest("button, input, select, .layers-panel")) return;
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
        if (image.classList.contains("is-layer-locked")) return;
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
        if (!parts.length) return;
        event.preventDefault();
        event.stopPropagation();
        const frameBounds = selectionFrame.getBoundingClientRect();
        const center = clientToWorld(frameBounds.left + frameBounds.width / 2, frameBounds.top + frameBounds.height / 2);
        const startAngle = Math.atan2(event.clientY - (frameBounds.top + frameBounds.height / 2), event.clientX - (frameBounds.left + frameBounds.width / 2)) * 180 / Math.PI;
        const from = parts.map((image) => ({ image, position: positionOf(image) }));
        selectionRotateHandle.setPointerCapture(event.pointerId);

        const rotate = (pointerEvent) => {
            const currentAngle = Math.atan2(pointerEvent.clientY - (frameBounds.top + frameBounds.height / 2), pointerEvent.clientX - (frameBounds.left + frameBounds.width / 2)) * 180 / Math.PI;
            const rawDelta = currentAngle - startAngle;
            const primaryStartAngle = Number.parseFloat(from[0].position.rotation);
            const delta = snapAngle(primaryStartAngle + rawDelta) - primaryStartAngle;
            const radians = delta * Math.PI / 180;
            const cosine = Math.cos(radians);
            const sine = Math.sin(radians);
            from.forEach(({ image, position }) => {
                if (parts.length > 1) {
                    const x = Number.parseFloat(position.left) - center.x;
                    const y = Number.parseFloat(position.top) - center.y;
                    image.style.left = `${center.x + x * cosine - y * sine}px`;
                    image.style.top = `${center.y + x * sine + y * cosine}px`;
                }
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
            const startVectorX = event.clientX - centerClientX;
            const startVectorY = event.clientY - centerClientY;
            const startLengthSquared = Math.max(1, startVectorX ** 2 + startVectorY ** 2);
            const from = parts.map((image) => ({ image, position: positionOf(image) }));
            const groupMinimumFactor = parts.length > 1
                ? Math.max(...from.map(({ position }) => 0.5 / Number.parseFloat(position.scale)))
                : 0.04;
            corner.setPointerCapture(event.pointerId);

            const scale = (pointerEvent) => {
                const currentVectorX = pointerEvent.clientX - centerClientX;
                const currentVectorY = pointerEvent.clientY - centerClientY;
                // Projection prevents a corner from crossing the centre and growing again.
                const projection = (currentVectorX * startVectorX + currentVectorY * startVectorY) / startLengthSquared;
                const factor = clamp(projection, groupMinimumFactor, parts.length > 1 ? 24 : 12);
                from.forEach(({ image, position }) => {
                    if (parts.length > 1) {
                        image.style.left = `${center.x + (Number.parseFloat(position.left) - center.x) * factor}px`;
                        image.style.top = `${center.y + (Number.parseFloat(position.top) - center.y) * factor}px`;
                        setPartScale(image, Number.parseFloat(position.scale) * factor, { minScale: 0.5, maxScale: 192 });
                        return;
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
    const point = options.worldPoint ?? clientToWorld(clientX, clientY);
    const placedPart = document.createElement("div");
    const image = document.createElement("img");
    const lockStripeOverlay = document.createElement("canvas");
    const rotateHandle = document.createElement("button");
    placedPart.className = "placed-part";
    placedPart.dataset.src = part.src;
    placedPart.dataset.name = part.name;
    image.src = part.src;
    image.alt = part.name;
    lockStripeOverlay.className = "lock-stripe-overlay";
    lockStripeOverlay.setAttribute("aria-hidden", "true");
    image.addEventListener("load", () => {
        updateLockStripeOverlay(placedPart);
        updateSelectionFrame();
    });
    rotateHandle.className = "rotate-handle";
    rotateHandle.type = "button";
    rotateHandle.setAttribute("aria-label", "拖曳旋轉物件");
    const highestLayer = Math.max(0, ...orderedParts().map((placedPart) => Number(placedPart.style.zIndex)));
    placedPart.style.zIndex = String(highestLayer + 1);
    placedPart.style.left = `${point.x}px`;
    placedPart.style.top = `${point.y}px`;
    placedPart.style.setProperty("--rotation", options.rotation ?? "0deg");
    setPartScale(placedPart, options.scale ?? "1.6");
    setPartFlip(placedPart, options.flipX ?? "1");
    placedPart.append(image, lockStripeOverlay, rotateHandle);
    makePlacedPartDraggable(placedPart);
    makePlacedPartRotatable(placedPart);
    canvasWorld.append(placedPart);
    selectPlacedPart(placedPart);
    if (options.remember !== false) remember({ type: "add", image: placedPart });
    return placedPart;
}

function copySelectedParts() {
    copiedParts = [...selectedParts]
        .filter((part) => part.isConnected)
        .map((part) => ({
            src: part.dataset.src,
            name: part.dataset.name,
            ...positionOf(part),
        }));
}

function pasteCopiedParts() {
    if (!copiedParts.length) return;
    const pasteOffset = 24;
    const pastedParts = copiedParts.map((part) => addPartToCanvas(part, 0, 0, {
        worldPoint: {
            x: Number.parseFloat(part.left) + pasteOffset,
            y: Number.parseFloat(part.top) + pasteOffset,
        },
        rotation: part.rotation,
        scale: part.scale,
    }));
    setSelectedParts(pastedParts, pastedParts.at(-1));
}

function renderParts() {
    const unit = unitCatalog[unitSelect.value];
    if (!unit) {
        activeParts = new Map();
        partsList.replaceChildren();
        unitStatus.textContent = "正在載入角色部件…";
        return;
    }
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
            const spread = 180;
            addPartToCanvas(part, 0, 0, {
                worldPoint: {
                    x: (Math.random() - 0.5) * spread,
                    y: (Math.random() - 0.5) * spread,
                },
            });
            playPopSound();
        });
        card.append(image);
        partsList.append(card);
    }
}

function updateRankOptions() {
    const unit = unitCatalog[unitSelect.value];
    if (!unit) return;
    const forms = new Set(unit.parts.map((part) => part.form));
    for (const option of rankSelect.options) option.disabled = !forms.has(option.value);
    if (!forms.has(rankSelect.value)) rankSelect.value = [...forms][0] ?? "f";
}

function unitLabel(unitId) {
    const name = unitIndex[unitId]?.name ?? unitCatalog[unitId]?.name;
    return name && name !== unitId ? `${unitId} ${name}` : unitId;
}

function ensureUnitLoaded(unitId) {
    if (unitCatalog[unitId]) return Promise.resolve(unitCatalog[unitId]);
    if (loadingUnits.has(unitId)) return loadingUnits.get(unitId);

    const request = new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.async = true;
        script.src = `assets/units/manifests/${encodeURIComponent(unitId)}.js`;
        script.onload = () => {
            const unit = globalThis.UNIT_MANIFESTS?.[unitId];
            script.remove();
            if (!unit) {
                reject(new Error(`角色 ${unitId} 的資料格式無效`));
                return;
            }
            unitCatalog[unitId] = unit;
            resolve(unit);
        };
        script.onerror = () => {
            script.remove();
            reject(new Error(`無法載入角色 ${unitId}`));
        };
        document.head.append(script);
    }).finally(() => loadingUnits.delete(unitId));

    loadingUnits.set(unitId, request);
    return request;
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

async function chooseUnit(unitId) {
    if (!unitIndex[unitId]) return;
    unitSelect.value = unitId;
    unitSearch.value = unitLabel(unitId);
    closeUnitResults();
    unitStatus.textContent = "正在載入角色部件…";
    partsList.replaceChildren();

    try {
        await ensureUnitLoaded(unitId);
    } catch (error) {
        console.error(error);
        if (unitSelect.value === unitId) unitStatus.textContent = "角色部件載入失敗，請再試一次。";
        return;
    }

    if (unitSelect.value !== unitId) return;
    updateRankOptions();
    renderParts();
}

function renderUnitResults() {
    const query = unitSearch.value.trim().toLocaleLowerCase();
    const allUnitIds = Object.keys(unitIndex).sort();
    const suggestedUnitIds = query
        ? allUnitIds.filter((unitId) => unitLabel(unitId).toLocaleLowerCase().includes(query))
        : allUnitIds;
    const remainingUnitIds = query
        ? allUnitIds.filter((unitId) => !suggestedUnitIds.includes(unitId))
        : [];
    matchingUnitIds = [...suggestedUnitIds, ...remainingUnitIds];
    activeUnitResultIndex = -1;
    unitResults.replaceChildren();
    unitResults.scrollTop = 0;

    const addSectionTitle = (text) => {
        const title = document.createElement("p");
        title.className = "unit-result-section";
        title.textContent = text;
        unitResults.append(title);
    };
    const addResult = (unitId) => {
        const result = document.createElement("button");
        const id = document.createElement("span");
        const name = document.createElement("span");
        result.className = "unit-result";
        result.type = "button";
        result.setAttribute("role", "option");
        id.className = "unit-result-id";
        name.className = "unit-result-name";
        id.textContent = unitId;
        name.textContent = unitIndex[unitId].name ?? "";
        result.append(id, name);
        result.addEventListener("click", () => chooseUnit(unitId));
        unitResults.append(result);
    };

    if (!suggestedUnitIds.length) {
        const empty = document.createElement("p");
        empty.className = "unit-result-empty";
        empty.textContent = "找不到相符角色，仍可從完整清單選擇。";
        unitResults.append(empty);
    }

    if (query && suggestedUnitIds.length) addSectionTitle("建議角色");
    suggestedUnitIds.forEach(addResult);
    if (query) addSectionTitle("全部角色");
    remainingUnitIds.forEach(addResult);

    unitResults.classList.add("is-open");
    unitSearch.setAttribute("aria-expanded", "true");
}

function populateUnitSelect() {
    for (const unitId of Object.keys(unitIndex).sort()) {
        const option = document.createElement("option");
        option.value = unitId;
        option.textContent = unitLabel(unitId);
        unitSelect.append(option);
    }
    unitSearch.value = "";
}

function initializeUnitIndex() {
    unitIndex = globalThis.UNIT_INDEX ?? {};
    if (!Object.keys(unitIndex).length || unitSelect.options.length) return;
    populateUnitSelect();
    const initialUnitId = unitSelect.value;
    unitStatus.textContent = "正在載入角色部件…";
    ensureUnitLoaded(initialUnitId)
        .then(() => {
            if (unitSelect.value !== initialUnitId) return;
            updateRankOptions();
            renderParts();
        })
        .catch((error) => {
            console.error(error);
            unitStatus.textContent = "角色部件載入失敗，請重新選擇角色。";
        });
}

setTheme(initialTheme);
setVolume(initialVolume);
setMuted(initialMuted);
setEffectsMuted(initialEffectsMuted);
initializeUnitIndex();
window.addEventListener("unitindexready", initializeUnitIndex);
resetCanvasView();
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
effectsButton.addEventListener("click", () => {
    const nextMuted = effectsButton.getAttribute("aria-pressed") !== "true";
    localStorage.setItem("effects-muted", String(nextMuted));
    setEffectsMuted(nextMuted);
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
document.addEventListener("click", (event) => {
    if (!(event.target instanceof Element)) return;
    const button = event.target.closest("button");
    const isExcluded = event.target.closest("#trash-zone, #help-button, .part-card, .unit-result");
    if (button && !button.disabled && !isExcluded) playButtonSound();
});
helpButton.addEventListener("click", () => {
    playSecretAreaSound();
    helpDialog.showModal();
});
closeHelpButton.addEventListener("click", () => helpDialog.close());
undoButton.addEventListener("click", undo);
viewHomeButton.addEventListener("click", resetCanvasView);
layerBackButton.addEventListener("click", (event) => moveSelectedLayer(-1, event.shiftKey));
layerFrontButton.addEventListener("click", (event) => moveSelectedLayer(1, event.shiftKey));
trashZone.addEventListener("pointerdown", startClearHold);
unitSearch.closest(".unit-search")?.addEventListener("pointerdown", (event) => {
    if (event.target.closest(".unit-results")) return;
    // Restore focus before document-level canvas interactions can close the picker.
    requestAnimationFrame(() => {
        unitSearch.focus({ preventScroll: true });
        renderUnitResults();
    });
});
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
    if (!event.target.closest("#layer-context-menu")) closeLayerContextMenu();
});
mergeLayersButton.addEventListener("click", () => {
    mergeSelectedParts();
    closeLayerContextMenu();
});
ungroupLayersButton.addEventListener("click", () => {
    ungroupContextParts();
    closeLayerContextMenu();
});
flipHorizontalButton.addEventListener("click", () => {
    flipSelectedParts();
    closeLayerContextMenu();
});
lockLayerButton.addEventListener("click", () => {
    const parts = contextMenuParts();
    setSelectedPartsLocked(parts.some((part) => part.classList.contains("is-layer-locked")) ? false : true);
    closeLayerContextMenu();
});
hideLayersButton.addEventListener("click", () => {
    setLayerVisibility(contextMenuParts(), true);
    closeLayerContextMenu();
});
showLayersButton.addEventListener("click", () => {
    setLayerVisibility(contextMenuParts(), false);
    closeLayerContextMenu();
});
importProjectButton.addEventListener("click", () => importProjectInput.click());
importProjectInput.addEventListener("change", importLayerProject);
saveProjectButton.addEventListener("click", saveLayerProject);
rankSelect.addEventListener("change", renderParts);
canvas.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;
    const target = event.target;
    if (target.closest(".placed-part, .selection-corner, .layer-controls, .trash-zone")) return;
    if (target === canvas || target === canvasWorld) selectPlacedPart(null);
}, true);
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
document.addEventListener("keydown", (event) => {
    const target = event.target;
    const isTyping = target instanceof HTMLInputElement || target instanceof HTMLSelectElement || target instanceof HTMLTextAreaElement || target?.isContentEditable;
    const isDeleteKey = event.key === "Delete" || event.key === "Del" || event.key === "Backspace" || event.code === "Delete" || event.code === "Backspace";
    if (!isDeleteKey || isTyping || helpDialog.open || (!selectedParts.size && !selectedPart?.isConnected)) return;
    event.preventDefault();
    event.stopPropagation();
    removeSelectedParts();
}, true);
window.addEventListener("keydown", (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z") {
        event.preventDefault();
        undo();
        return;
    }

    const target = event.target;
    const isTyping = target instanceof HTMLInputElement || target instanceof HTMLSelectElement || target instanceof HTMLTextAreaElement || target?.isContentEditable;
    if (isTyping || helpDialog.open) return;

    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "a") {
        event.preventDefault();
        setSelectedParts(orderedParts());
        return;
    }

    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "c" && selectedPart) {
        event.preventDefault();
        copySelectedParts();
        return;
    }

    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "v" && copiedParts.length) {
        event.preventDefault();
        pasteCopiedParts();
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
