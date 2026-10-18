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
const scoreMusic = document.querySelector("#score-music");
const bowlingSound = document.querySelector("#bowling-sound");
const popSound = document.querySelector("#pop-sound");
const secretAreaSound = document.querySelector("#secret-area-sound");
const buttonSound = document.querySelector("#button-sound");
const scoreRevealSound = document.querySelector("#score-reveal-sound");
const scoreFinalSound = document.querySelector("#score-final-sound");
const scoreDojoWinSound = document.querySelector("#score-dojo-win-sound");
const volumeSlider = document.querySelector("#volume-slider");
const helpButton = document.querySelector("#help-button");
const helpDialog = document.querySelector("#help-dialog");
const closeHelpButton = document.querySelector("#close-help-button");
const newsButton = document.querySelector("#news-button");
const newsDialog = document.querySelector("#news-dialog");
const closeNewsButton = document.querySelector("#close-news-button");
const undoButton = document.querySelector("#undo-button");
const layerBackButton = document.querySelector("#layer-back-button");
const layerFrontButton = document.querySelector("#layer-front-button");
const viewHomeButton = document.querySelector("#view-home-button");
const canvas = document.querySelector("#canvas");
const canvasWorld = document.querySelector("#canvas-world");
const scoreStartFlash = document.querySelector("#score-start-flash");
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
const focusLayerButton = document.querySelector("#focus-layer-button");
const importProjectButton = document.querySelector("#import-project-button");
const importProjectInput = document.querySelector("#import-project-input");
const saveProjectButton = document.querySelector("#save-project-button");
const exportPngButton = document.querySelector("#export-png-button");
const copyCanvasImageButton = document.querySelector("#copy-canvas-image-button");
const shareCanvasImageButton = document.querySelector("#share-canvas-image-button");
const pngExportEnabled = window.TBC_PUZZLE_CONFIG?.showPngExport === true;
const PART_DRAG_TYPE = "application/x-tbc-part";
const trashZone = document.querySelector("#trash-zone");
const unitSelect = document.querySelector("#unit-select");
const unitSearch = document.querySelector("#unit-search");
const unitResults = document.querySelector("#unit-results");
const randomUnitButton = document.querySelector("#random-unit-button");
const rankSelect = document.querySelector("#rank-select");
const unitStatus = document.querySelector("#unit-status");
const partsList = document.querySelector("#parts-list");
const normalModeTab = document.querySelector("#normal-mode-tab");
const scoreModeTab = document.querySelector("#score-mode-tab");
const normalModePanel = document.querySelector("#normal-mode-panel");
const scoreModePanel = document.querySelector("#score-mode-panel");
const scoreSetup = document.querySelector("#score-setup");
const sidePanel = document.querySelector(".side-panel");
const scoreSetupScroll = document.querySelector(".score-setup-scroll");
const scoreRunning = document.querySelector("#score-running");
const scoreRoundScroll = document.querySelector(".score-round-scroll");
const scoreResultPanel = document.querySelector("#score-result-panel");
const scoreTimeButtons = [...document.querySelectorAll(".score-time-button")];
const scoreQuestionModeButtons = [...document.querySelectorAll(".score-question-mode")];
const scoreFixedPicker = document.querySelector("#score-fixed-picker");
const scoreFixedRankButtons = [...document.querySelectorAll(".score-fixed-rank")];
const rankButtons = [...document.querySelectorAll(".rank-option")];
const scoreUnitSearch = document.querySelector("#score-unit-search");
const scoreUnitResults = document.querySelector("#score-unit-results");
const scoreModeStatus = document.querySelector("#score-mode-status");
const scoreStartButton = document.querySelector("#score-start-button");
const scoreCancelButton = document.querySelector("#score-cancel-button");
const scoreGradeButton = document.querySelector("#score-grade-button");
const scoreCountdown = document.querySelector("#score-countdown");
const scoreActiveUnit = document.querySelector("#score-active-unit");
const scoreActiveRank = document.querySelector("#score-active-rank");
const scorePartsList = document.querySelector("#score-parts-list");
const scoreResultOverlay = document.querySelector("#score-result-overlay");
const scoreResultCard = document.querySelector("#score-result-card");
const scoreResultPreview = document.querySelector("#score-result-preview");
const scoreResultAnswer = document.querySelector("#score-result-answer");
const scoreResultOverlayStats = document.querySelector("#score-result-overlay-stats");
const scoreResultOverlayBreakdown = document.querySelector("#score-result-overlay-breakdown");
const scoreResultOverlayScore = document.querySelector("#score-result-overlay-score");
const scoreImageOverlapButton = document.querySelector("#score-image-overlap-button");
const scoreCopyCompositionButton = document.querySelector("#score-copy-composition-button");
const scoreCopyResultButton = document.querySelector("#score-copy-result-button");
const scoreFinalScore = document.querySelector("#score-final-score");
const scoreResultMessage = document.querySelector("#score-result-message");
const scoreResultBreakdown = document.querySelector("#score-result-breakdown");
const scoreResultHistoryButton = document.querySelector("#score-result-history-button");
const scoreResultHistoryPreview = document.querySelector("#score-result-history-preview");
const scoreRetryButton = document.querySelector("#score-retry-button");

if (exportPngButton) exportPngButton.hidden = !pngExportEnabled;

let unitCatalog = {};
let unitIndex = globalThis.UNIT_INDEX ?? {};
const loadingUnits = new Map();
const loadingPartSources = new Map();
const loadedPartImages = new Map();
const opaqueHitMasks = new Map();
const spriteVisibilityCache = new Map();
const history = [];
const redoHistory = [];
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
let partsRenderVersion = 0;
let palettePartDrag = null;
let palettePointerGrab = null;
let layerGroupPointerGrab = null;
let selectedScoreDuration = 60;
let scoreRoundStartedAt = 0;
let scoreTimerId = null;
let scoreRoundFinished = false;
let scoreQuestionMode = "fixed";
let scoreFixedUnitId = "";
let scoreFixedRank = "f";
let scoreRandomTarget = null;
let scoreRandomPreparation = null;
let scoreRoundTarget = null;
let scoreRoundTemplate = null;
let isScoreRoundCanvasActive = false;
let scoreRoundInputLocked = false;
let scoreResultCloseTimer = null;
let scoreResultOpenedAt = 0;
let scoreResultRevealVersion = 0;
let scoreAnswerRenderVersion = 0;
let scoreHistoryStart = null;
let latestScoreResultView = null;
let scoreImageOverlayVisible = false;
let scoreImageExportVersion = 0;
let scoreCompositionPngBlob = null;
let scoreResultPngBlob = null;
let scoreCompositionPngPromise = null;
let scoreResultPngPromise = null;
const scoreTemplateCache = new Map();

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
    scoreReveal: 0.36,
    scoreFinal: 0.1,
});
const musicTracks = [backgroundMusic, scoreMusic];
const PLACEHOLDER_PART_MARKERS = [
    "dummy", "dmy", "ダミー", "空っぽ", "空データ", "空資料", "空数据",
    "placeholder", "blank", "empty", "empty data", "no data",
];
const SCORE_EFFECT_PART_MARKERS = [
    "エフェクト", "effect", "攻撃", "attack", "煙", "smoke", "flash", "spark",
    "beam", "laser", "bullet", "shot", "explosion", "爆発", "fire", "flame",
];
const SCORE_FINAL_INPUT_LOCK_MS = 1000;
const SCORE_RESULT_CLOSE_GUARD_MS = 850;

function setTheme(theme) {
    const isDark = theme === "dark";
    root.dataset.theme = theme;
    themeIcon.className = isDark ? "fa-regular fa-moon" : "fa-regular fa-sun";
    const label = isDark ? "開燈" : "關燈";
    themeButton.setAttribute("aria-label", label);
    themeTooltip.textContent = label;
}

function setMuted(muted) {
    musicTracks.forEach((music) => { music.muted = muted; });
    soundIcon.className = muted ? "fa-solid fa-volume-xmark" : "fa-solid fa-volume-high";
    soundButton.setAttribute("aria-pressed", String(muted));
    const label = muted ? "開音樂" : "關音樂";
    soundButton.setAttribute("aria-label", label);
    soundTooltip.textContent = label;
}

function setEffectsMuted(muted) {
    [bowlingSound, popSound, secretAreaSound, buttonSound, scoreRevealSound, scoreFinalSound, scoreDojoWinSound].forEach((sound) => { sound.muted = muted; });
    effectsIcon.className = muted ? "fa-solid fa-music" : "fa-solid fa-music";
    effectsButton.setAttribute("aria-pressed", String(muted));
    const label = muted ? "開音效" : "關音效";
    effectsButton.setAttribute("aria-label", label);
    effectsTooltip.textContent = label;
}

function setVolume(volume) {
    const nextVolume = clamp(volume, 0, 1);
    musicTracks.forEach((music) => { music.volume = nextVolume; });
    volumeSlider.value = String(nextVolume);
    localStorage.setItem("music-volume", String(nextVolume));
}

function tryPlayMusic() {
    if (!scoreResultOverlay.hidden) {
        musicTracks.forEach((music) => music.pause());
        return;
    }
    const activeMusic = isScoreRoundCanvasActive && !scoreRoundFinished ? scoreMusic : backgroundMusic;
    musicTracks.forEach((music) => {
        if (music !== activeMusic) music.pause();
    });
    if (!activeMusic.muted) activeMusic.play().catch(() => {});
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

function playScoreRevealSound() {
    scoreRevealSound.volume = effectsVolume.scoreReveal;
    scoreRevealSound.currentTime = 0;
    scoreRevealSound.play().catch(() => {});
}

function playScoreFinalSound() {
    scoreFinalSound.volume = effectsVolume.scoreFinal;
    scoreFinalSound.currentTime = 0;
    scoreFinalSound.play().catch(() => {});
}

function playScoreDojoWinSound() {
    scoreDojoWinSound.volume = 0.03;
    scoreDojoWinSound.currentTime = 0;
    scoreDojoWinSound.play().catch(() => {});
}

function clamp(value, minimum, maximum) {
    return Math.min(Math.max(value, minimum), maximum);
}

function setScoreRoundInputLocked(locked) {
    scoreRoundInputLocked = locked;
    root.classList.toggle("is-score-input-locked", locked);
}

function setActiveMode(mode) {
    const isScoreMode = mode === "score";
    if (!isScoreMode && scoreRoundStartedAt && !scoreRoundFinished) return;
    normalModeTab.classList.toggle("is-active", !isScoreMode);
    normalModeTab.setAttribute("aria-selected", String(!isScoreMode));
    scoreModeTab.classList.toggle("is-active", isScoreMode);
    scoreModeTab.setAttribute("aria-selected", String(isScoreMode));
    normalModePanel.hidden = isScoreMode;
    scoreModePanel.hidden = !isScoreMode;
    if (!isScoreMode) {
        promoteScoreRoundPartsToNormalGroup();
        scoreRoundTarget = null;
        scoreRoundTemplate = null;
        scoreRoundFinished = false;
        setScoreRoundCanvasState(false);
    }
    if (isScoreMode) updateScoreRound();
}

function setScoreRoundCanvasState(isActive) {
    isScoreRoundCanvasActive = isActive;
    root.classList.toggle("is-score-round-active", isActive);
    canvas.classList.toggle("is-score-round", isActive);
    importProjectButton.hidden = isActive;
    saveProjectButton.hidden = isActive;
    layerContextMenu.hidden = true;

    if (isActive) {
        canvasWorld.querySelectorAll(".placed-part").forEach((part) => {
            part.classList.add("score-preexisting-part");
        });
        setSelectedParts([], null);
    } else {
        canvasWorld.querySelectorAll(".score-preexisting-part").forEach((part) => {
            part.classList.remove("score-preexisting-part");
        });
    }

    renderLayersPanel();
    updateSelectionFrame();
}

function playScoreStartFlash() {
    scoreStartFlash.classList.remove("is-playing");
    void scoreStartFlash.offsetWidth;
    scoreStartFlash.classList.add("is-playing");
    window.setTimeout(() => scoreStartFlash.classList.remove("is-playing"), 560);
}

function createScoreResultHistoryPane(content, width, height, contentClass) {
    const pane = document.createElement("span");
    const stage = document.createElement("span");
    stage.className = "score-result-history-stage";
    stage.style.width = `${width}px`;
    stage.style.height = `${height}px`;
    content.classList.add(contentClass);
    content.style.setProperty("width", `${width}px`, "important");
    content.style.setProperty("height", `${height}px`, "important");
    stage.append(content);
    pane.className = "score-result-history-pane";
    pane.append(stage);
    return { pane, stage, width, height };
}

function renderScoreResultHistory(snapshot, layout) {
    const historySnapshot = snapshot.cloneNode(true);
    historySnapshot.classList.remove("score-result-canvas");
    const historyAnswer = scoreResultAnswer.cloneNode(true);
    historyAnswer.removeAttribute("id");
    const comparison = document.createElement("span");
    const player = createScoreResultHistoryPane(historySnapshot, layout.sceneWidth, layout.previewHeight, "score-result-history-canvas");
    const answer = createScoreResultHistoryPane(historyAnswer, layout.answerWidth, layout.answerHeight, "score-result-history-answer");
    comparison.className = "score-result-history-compare";
    comparison.append(player.pane, answer.pane);
    scoreResultHistoryPreview.replaceChildren(comparison);
    scoreResultHistoryButton.hidden = false;

    requestAnimationFrame(() => {
        [player, answer].forEach(({ pane, stage, width, height }) => {
            const bounds = pane.getBoundingClientRect();
            const scale = Math.max(bounds.width / width, bounds.height / height, 0.01);
            const offsetX = (bounds.width - width * scale) / 2;
            const offsetY = (bounds.height - height * scale) / 2;
            stage.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;
        });
    });
}

function clearScoreImageOverlay() {
    scoreResultPreview.querySelector(".score-result-image-overlay")?.remove();
    scoreImageOverlayVisible = false;
    scoreImageOverlapButton.hidden = true;
    scoreImageOverlapButton.setAttribute("aria-pressed", "false");
    scoreImageOverlapButton.setAttribute("aria-label", "影像重疊：關");
    scoreImageOverlapButton.title = "影像";
}

function renderScoreImageOverlay() {
    scoreResultPreview.querySelector(".score-result-image-overlay")?.remove();
    const answerWorld = scoreResultAnswer.querySelector(".score-answer-world");
    if (!answerWorld) {
        scoreImageOverlapButton.hidden = true;
        return;
    }

    const overlay = document.createElement("span");
    overlay.className = "score-result-image-overlay";
    overlay.hidden = !scoreImageOverlayVisible;
    const overlapWorld = answerWorld.cloneNode(true);
    // The preview and answer panes each have a 3px border.  Their content
    // origins differ by that border width, so compensate only the red clone.
    overlapWorld.style.transform = `translate(-3px, -3px) ${overlapWorld.style.transform}`;
    overlay.append(overlapWorld);
    scoreResultPreview.append(overlay);
    scoreImageOverlapButton.hidden = false;
    scoreImageOverlapButton.setAttribute("aria-pressed", String(scoreImageOverlayVisible));
    const overlapLabel = scoreImageOverlayVisible ? "影像重疊：開" : "影像重疊：關";
    scoreImageOverlapButton.setAttribute("aria-label", overlapLabel);
    scoreImageOverlapButton.title = "影像";
}

function openScoreResultOverlay({ result, snapshot, layout, replayScores = false, playIntro = false }) {
    scoreResultCard.style.width = `${layout.cardWidth}px`;
    scoreResultOverlayStats.style.width = `${layout.statsWidth}px`;
    scoreResultPreview.style.width = `${layout.sceneWidth}px`;
    scoreResultPreview.style.height = `${layout.previewHeight}px`;
    scoreResultAnswer.style.width = `${layout.answerWidth}px`;
    scoreResultAnswer.style.height = `${layout.answerHeight}px`;
    scoreResultPreview.replaceChildren(snapshot);
    renderScoreImageOverlay();
    window.clearTimeout(scoreResultCloseTimer);
    root.classList.add("is-score-result-open");
    scoreResultOverlay.hidden = false;
    scoreResultOpenedAt = performance.now();
    scoreResultOverlay.classList.remove("is-open");
    tryPlayMusic();
    if (playIntro) playScoreDojoWinSound();
    requestAnimationFrame(() => {
        scoreResultOverlay.classList.add("is-open");
        if (replayScores) revealScoreResult(result);
    });
}

function showScoreResultOverlay(result) {
    scoreAnswerRenderVersion += 1;
    clearScoreImageOverlay();
    scoreResultAnswer.replaceChildren();
    const snapshot = canvas.cloneNode(true);
    const snapshotWorld = snapshot.querySelector(".canvas-world");
    const canvasBounds = canvas.getBoundingClientRect();
    const aspectRatio = canvasBounds.width / Math.max(canvasBounds.height, 1);
    const narrowLayout = window.innerWidth < 720;
    const maximumSceneHeight = Math.max(106, window.innerHeight * (narrowLayout ? 0.29 : 0.34));
    const narrowSceneWidth = (window.innerWidth * 0.88 - 10) / 2;
    const sceneWidth = Math.max(1, Math.min(
        narrowLayout ? narrowSceneWidth : window.innerWidth * 0.66,
        narrowLayout ? 410 : 820,
        maximumSceneHeight * aspectRatio,
    ));
    const previewHeight = sceneWidth / aspectRatio;
    const statsWidth = narrowLayout
        ? Math.min(window.innerWidth * 0.94, sceneWidth * 2 + 26)
        : clamp(sceneWidth * 0.32, 156, 230);
    const layout = {
        sceneWidth,
        previewHeight,
        answerWidth: sceneWidth,
        answerHeight: previewHeight,
        statsWidth,
        cardWidth: narrowLayout ? statsWidth : sceneWidth + statsWidth + 112,
    };

    snapshot.removeAttribute("id");
    snapshot.classList.add("score-result-canvas");
    snapshot.querySelectorAll(".selection-frame, .marquee-selection, .layer-controls, .layers-panel, .layer-context-menu").forEach((element) => element.remove());
    snapshot.querySelectorAll("[id]").forEach((element) => element.removeAttribute("id"));
    snapshot.querySelectorAll("button").forEach((button) => button.remove());
    if (snapshotWorld) {
        const parts = currentScoreRoundParts();
        const bounds = parts.reduce((total, part) => {
            const rect = part.getBoundingClientRect();
            const left = (rect.left - canvasBounds.left - viewX) / viewScale;
            const top = (rect.top - canvasBounds.top - viewY) / viewScale;
            const right = (rect.right - canvasBounds.left - viewX) / viewScale;
            const bottom = (rect.bottom - canvasBounds.top - viewY) / viewScale;
            return {
                left: Math.min(total.left, left),
                top: Math.min(total.top, top),
                right: Math.max(total.right, right),
                bottom: Math.max(total.bottom, bottom),
            };
        }, { left: Infinity, top: Infinity, right: -Infinity, bottom: -Infinity });

        if (Number.isFinite(bounds.left)) {
            const centerX = (bounds.left + bounds.right) / 2;
            const centerY = (bounds.top + bounds.bottom) / 2;
            const width = Math.max(bounds.right - bounds.left, 1);
            const height = Math.max(bounds.bottom - bounds.top, 1);
            const fitScale = Math.min(sceneWidth * 0.86 / width, previewHeight * 0.86 / height);
            snapshotWorld.style.transform = `translate(${sceneWidth / 2 - centerX * fitScale}px, ${previewHeight / 2 - centerY * fitScale}px) scale(${fitScale})`;
        } else {
            snapshotWorld.style.transform = "none";
        }
        snapshotWorld.style.transformOrigin = "0 0";
    }

    latestScoreResultView = { result, snapshot: snapshot.cloneNode(true), layout };
    renderScoreResultHistory(snapshot, layout);
    openScoreResultOverlay({ result, snapshot, layout, replayScores: true, playIntro: true });
    void renderScoreAnswer(scoreRoundTarget, scoreRoundTemplate, layout);
}

function reopenLatestScoreResultOverlay() {
    if (!latestScoreResultView) return;
    const { result, snapshot, layout } = latestScoreResultView;
    openScoreResultOverlay({ result, snapshot: snapshot.cloneNode(true), layout });
    precomputeAndroidScoreShares();
}

function closeScoreResultOverlay() {
    scoreResultRevealVersion += 1;
    setScoreRoundInputLocked(false);
    if (scoreResultOverlay.hidden) {
        root.classList.remove("is-score-result-open");
        return;
    }
    scoreResultOverlay.classList.remove("is-open");
    window.clearTimeout(scoreResultCloseTimer);
    scoreResultCloseTimer = window.setTimeout(() => {
        scoreResultOverlay.hidden = true;
        scoreResultPreview.replaceChildren();
        scoreResultPanel.classList.remove("is-summary-pending");
        root.classList.remove("is-score-result-open");
        tryPlayMusic();
    }, 180);
}

function startScoreScramble(element, suffix, version) {
    let active = true;
    let animationFrame = null;
    element.classList.add("is-scrambling");
    const tick = () => {
        if (!active || version !== scoreResultRevealVersion) {
            element.classList.remove("is-scrambling");
            return;
        }
        element.textContent = `${Math.floor(Math.random() * 101)}${suffix}`;
        animationFrame = requestAnimationFrame(tick);
    };
    tick();
    return () => {
        active = false;
        if (animationFrame !== null) cancelAnimationFrame(animationFrame);
        element.classList.remove("is-scrambling");
    };
}

function flashRevealedScore(element) {
    element.classList.remove("is-revealed");
    void element.offsetWidth;
    element.classList.add("is-revealed");
    window.setTimeout(() => element.classList.remove("is-revealed"), 280);
}

function waitForScoreReveal(milliseconds) {
    return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
}

async function revealScoreResult(result) {
    if (!result) return;
    const version = ++scoreResultRevealVersion;
    const metrics = [
        ["物件", Math.round(result.coverage * 100)],
        ["位置", Math.round(result.layout * 100)],
        ["角度", Math.round(result.transform * 100)],
        ["圖層", Math.round(result.order * 100)],
        ["影像", Math.round(result.image * 100)],
    ];
    const values = metrics.map(([label]) => {
        const row = document.createElement("div");
        const title = document.createElement("span");
        const value = document.createElement("strong");
        title.textContent = label;
        value.className = "score-reveal-value";
        value.textContent = "--%";
        row.append(title, value);
        return { row, value };
    });
    scoreResultOverlayBreakdown.replaceChildren(...values.map(({ row }) => row));
    scoreResultOverlayScore.innerHTML = '<span class="score-reveal-value">--</span><span>分</span>';
    const finalValue = scoreResultOverlayScore.querySelector(".score-reveal-value");

    const stopMetricScrambles = values.map(({ value }) => startScoreScramble(value, "%", version));
    await waitForScoreReveal(320);
    for (let index = 0; index < metrics.length; index += 1) {
        if (version !== scoreResultRevealVersion) return;
        stopMetricScrambles[index]();
        values[index].value.textContent = `${metrics[index][1]}%`;
        flashRevealedScore(values[index].value);
        if (index === 0) playScoreRevealSound();
        await waitForScoreReveal(190);
    }
    if (version !== scoreResultRevealVersion) return;
    const stopFinalScramble = startScoreScramble(finalValue, "", version);
    await waitForScoreReveal(1820);
    if (version !== scoreResultRevealVersion) return;
    stopFinalScramble();
    finalValue.textContent = `${result.total}`;
    flashRevealedScore(finalValue);
    playScoreFinalSound();
}

function formatScoreTime(milliseconds) {
    const seconds = Math.max(0, Math.ceil(milliseconds / 1000));
    return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

function updateScoreRound() {
    if (!scoreRoundStartedAt || scoreRoundFinished) return;
    if (selectedScoreDuration === 0) {
        scoreCountdown.textContent = "∞";
        return;
    }
    const remaining = selectedScoreDuration * 1000 - (Date.now() - scoreRoundStartedAt);
    if (remaining <= SCORE_FINAL_INPUT_LOCK_MS) setScoreRoundInputLocked(true);
    if (remaining <= 0) {
        finishScoreRound(true);
        return;
    }
    scoreCountdown.textContent = formatScoreTime(remaining);
}

async function prepareRandomScoreTarget() {
    const unitIds = Object.keys(unitIndex);
    if (!unitIds.length) return null;
    const unitId = unitIds[Math.floor(Math.random() * unitIds.length)];
    const unit = await ensureUnitLoaded(unitId);
    const ranks = availableRanksForUnit(unit);
    if (!ranks.length) return null;
    return { unitId, rank: ranks[Math.floor(Math.random() * ranks.length)] };
}

function showScorePartsLoading() {
    scorePartsList.replaceChildren();
    const loading = document.createElement("p");
    loading.className = "parts-loading";
    loading.setAttribute("role", "status");
    loading.innerHTML = '<span>載入中</span><span class="parts-loading-dots" aria-hidden="true"></span>';
    scorePartsList.append(loading);
}

async function renderScoreParts(target, template) {
    const renderVersion = ++partsRenderVersion;
    const unit = unitCatalog[target.unitId] ?? await ensureUnitLoaded(target.unitId);
    const requiredCropIndexes = new Set((template?.parts ?? []).map((part) => part.cropIndex));
    const candidateParts = availablePartsForRank(unit, target.rank)
        .filter((part) => requiredCropIndexes.has(cropIndexFromPartId(part.id)));
    showScorePartsLoading();
    try {
        await Promise.all([...new Set(candidateParts.map((part) => part.src))].map(ensurePartSourceLoaded));
    } catch (error) {
        console.error(error);
        if (renderVersion === partsRenderVersion) {
            scorePartsList.replaceChildren();
            scoreModeStatus.textContent = "角色圖片載入失敗，請取消後再試一次。";
        }
        return false;
    }
    if (renderVersion !== partsRenderVersion) return false;
    const parts = withoutTransparentParts(candidateParts);
    const scoreParts = parts.map((part) => ({ ...part, scoreRound: true }));
    activeParts = new Map(scoreParts.map((part) => [part.id, part]));
    scorePartsList.replaceChildren(...scoreParts.map(createPartCard));
    return true;
}

function createScoreAnswerPart(asset, targetPart) {
    const sprite = normalizeSprite(asset.sprite);
    if (!sprite) return null;

    const answerPart = document.createElement("span");
    const crop = document.createElement("span");
    const image = document.createElement("img");
    const scaleX = Math.abs(Number(targetPart.scaleX) || 1);
    const scaleY = Math.abs(Number(targetPart.scaleY) || 1);
    const flipX = Number(targetPart.flipX) === -1 ? -1 : 1;
    const flipY = Number(targetPart.flipY) === -1 ? -1 : 1;
    const angle = Number(targetPart.angle) || 0;
    const opacity = Number(targetPart.opacity);

    answerPart.className = "score-answer-part";
    answerPart.style.left = `${targetPart.x}px`;
    answerPart.style.top = `${targetPart.y}px`;
    answerPart.style.zIndex = String(Number(targetPart.z) || 0);
    answerPart.style.opacity = String(clamp(Number.isFinite(opacity) ? opacity : 1, 0, 1));
    answerPart.style.transform = `translate(-50%, -50%) rotate(${angle}deg) scale(${scaleX * flipX}, ${scaleY * flipY})`;

    crop.className = "placed-sprite-crop";
    crop.style.width = `${sprite.width}px`;
    crop.style.height = `${sprite.height}px`;
    image.className = "sprite-sheet-image";
    image.src = asset.src;
    image.alt = "";
    image.draggable = false;
    image.style.width = `${sprite.sheetWidth}px`;
    image.style.height = `${sprite.sheetHeight}px`;
    image.style.left = `${-sprite.x}px`;
    image.style.top = `${-sprite.y}px`;
    crop.append(image);
    answerPart.append(crop);
    return answerPart;
}

function scoreAnswerBounds(parts) {
    return parts.reduce((bounds, { asset, targetPart }) => {
        const sprite = normalizeSprite(asset.sprite);
        const scaleX = Math.abs(Number(targetPart.scaleX) || 1);
        const scaleY = Math.abs(Number(targetPart.scaleY) || 1);
        const radians = (Number(targetPart.angle) || 0) * (Math.PI / 180);
        const width = sprite.width * scaleX;
        const height = sprite.height * scaleY;
        const rotatedWidth = Math.abs(Math.cos(radians)) * width + Math.abs(Math.sin(radians)) * height;
        const rotatedHeight = Math.abs(Math.sin(radians)) * width + Math.abs(Math.cos(radians)) * height;
        return {
            left: Math.min(bounds.left, targetPart.x - rotatedWidth / 2),
            top: Math.min(bounds.top, targetPart.y - rotatedHeight / 2),
            right: Math.max(bounds.right, targetPart.x + rotatedWidth / 2),
            bottom: Math.max(bounds.bottom, targetPart.y + rotatedHeight / 2),
        };
    }, { left: Infinity, top: Infinity, right: -Infinity, bottom: -Infinity });
}

async function renderScoreAnswer(target, template, layout) {
    const renderVersion = ++scoreAnswerRenderVersion;
    clearScoreImageOverlay();
    scoreResultAnswer.replaceChildren();
    const loading = document.createElement("span");
    loading.className = "score-answer-loading";
    loading.textContent = "正解載入中…";
    scoreResultAnswer.append(loading);
    if (!target || !template?.parts?.length) return;

    try {
        const unit = unitCatalog[target.unitId] ?? await ensureUnitLoaded(target.unitId);
        const assetsByCrop = new Map(availablePartsForRank(unit, target.rank)
            .map((part) => [cropIndexFromPartId(part.id), part])
            .filter(([cropIndex]) => cropIndex !== null));
        const parts = template.parts
            .map((targetPart) => ({ targetPart, asset: assetsByCrop.get(targetPart.cropIndex) }))
            .filter(({ asset }) => asset && normalizeSprite(asset.sprite));
        await Promise.all([...new Set(parts.map(({ asset }) => asset.src))].map(ensurePartSourceLoaded));
        if (renderVersion !== scoreAnswerRenderVersion) return;

        const bounds = scoreAnswerBounds(parts);
        if (!Number.isFinite(bounds.left)) throw new Error("正解沒有可用部件");
        const contentWidth = Math.max(1, bounds.right - bounds.left);
        const contentHeight = Math.max(1, bounds.bottom - bounds.top);
        const fitScale = Math.min(
            (layout.answerWidth * 0.86) / contentWidth,
            (layout.answerHeight * 0.86) / contentHeight,
        );
        const world = document.createElement("span");
        world.className = "score-answer-world";
        world.style.width = `${contentWidth}px`;
        world.style.height = `${contentHeight}px`;
        world.style.left = `${layout.answerWidth / 2 - ((bounds.left + bounds.right) / 2) * fitScale}px`;
        world.style.top = `${layout.answerHeight / 2 - ((bounds.top + bounds.bottom) / 2) * fitScale}px`;
        world.style.transform = `scale(${fitScale})`;
        parts.forEach(({ asset, targetPart }) => {
            const answerPart = createScoreAnswerPart(asset, targetPart);
            if (answerPart) world.append(answerPart);
        });
        scoreResultAnswer.replaceChildren(world);
        renderScoreImageOverlay();
        if (latestScoreResultView) renderScoreResultHistory(latestScoreResultView.snapshot, layout);
        precomputeAndroidScoreShares();
    } catch (error) {
        console.error(error);
        if (renderVersion !== scoreAnswerRenderVersion) return;
        loading.textContent = "正解載入失敗";
        scoreResultAnswer.replaceChildren(loading);
        clearScoreImageOverlay();
        if (latestScoreResultView) renderScoreResultHistory(latestScoreResultView.snapshot, layout);
        precomputeAndroidScoreShares();
    }
}

function scoreTemplateKey(target) {
    return `${target.unitId}/${target.rank}`;
}

async function ensureScoreTemplateLoaded(target) {
    const key = scoreTemplateKey(target);
    if (scoreTemplateCache.has(key)) return scoreTemplateCache.get(key);
    const template = await new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.async = true;
        script.src = `assets/unit_scoring/templates/${encodeURIComponent(target.unitId)}/${encodeURIComponent(target.rank)}.js`;
        script.onload = () => {
            const loaded = globalThis.SCORE_TEMPLATES?.[key];
            script.remove();
            if (!loaded) {
                reject(new Error(`正確答案資料格式無效：${key}`));
                return;
            }
            resolve(loaded);
        };
        script.onerror = () => {
            script.remove();
            reject(new Error(`無法載入正確答案：${key}`));
        };
        document.head.append(script);
    });
    if (!Array.isArray(template.parts) || !template.parts.length) throw new Error(`正確答案資料格式無效：${key}`);
    scoreTemplateCache.set(key, template);
    return template;
}

function cropIndexFromPartId(id) {
    const match = (id ?? "").match(/^[fcsu]-(\d+)$/i);
    return match ? Number.parseInt(match[1], 10) : null;
}

function cropIndexFromPlacedPart(part) {
    return cropIndexFromPartId(part.dataset.partId);
}

function isPlaceholderPart(part) {
    const name = String(part?.name ?? "").trim().toLocaleLowerCase();
    const sprite = normalizeSprite(part?.sprite);
    const width = Number(sprite?.width ?? part?.width);
    const height = Number(sprite?.height ?? part?.height);
    return (width === 1 && height === 1)
        || PLACEHOLDER_PART_MARKERS.some((marker) => name.includes(marker));
}

function isScoreEffectPart(part) {
    const name = String(part?.name ?? "").trim().toLocaleLowerCase();
    return SCORE_EFFECT_PART_MARKERS.some((marker) => name.includes(marker));
}

function isScoreEligiblePart(part) {
    return !isPlaceholderPart(part) && !isScoreEffectPart(part);
}

function hasVisibleSpritePixels(part) {
    const sprite = normalizeSprite(part?.sprite);
    const source = part?.src;
    if (!sprite || !source) return true;

    const key = `${source}|${sprite.x},${sprite.y},${sprite.width},${sprite.height}`;
    if (spriteVisibilityCache.has(key)) return spriteVisibilityCache.get(key);

    const image = loadedPartImages.get(source);
    if (!image?.complete || !image.naturalWidth) return true;
    try {
        const raster = document.createElement("canvas");
        raster.width = sprite.width;
        raster.height = sprite.height;
        const context = raster.getContext("2d", { willReadFrequently: true });
        context.drawImage(image, sprite.x, sprite.y, sprite.width, sprite.height, 0, 0, sprite.width, sprite.height);
        const pixels = context.getImageData(0, 0, sprite.width, sprite.height).data;
        let hasVisiblePixel = false;
        for (let index = 3; index < pixels.length; index += 4) {
            if (pixels[index] > 8) {
                hasVisiblePixel = true;
                break;
            }
        }
        spriteVisibilityCache.set(key, hasVisiblePixel);
        return hasVisiblePixel;
    } catch (error) {
        // Local pages can occasionally block Canvas readback. Keeping the part
        // is safer than accidentally hiding a real sprite in that environment.
        console.warn("無法判斷部件透明像素，保留該部件。", error);
        spriteVisibilityCache.set(key, true);
        return true;
    }
}

function withoutTransparentParts(parts) {
    return parts.filter(hasVisibleSpritePixels);
}

function availablePartsForRank(unit, rank) {
    return (unit?.parts ?? []).filter((part) => part.form === rank && !isPlaceholderPart(part));
}

function withoutPlaceholderScoreParts(template, unit, rank) {
    const allowedCropIndexes = new Set(availablePartsForRank(unit, rank)
        .filter(hasVisibleSpritePixels)
        .map((part) => cropIndexFromPartId(part.id))
        .filter((index) => index !== null));
    return {
        ...template,
        // maanim can keep a part in the data while hiding it for this idle
        // frame. Hidden sprites should not appear in the palette or affect any
        // of the scoring metrics.
        parts: template.parts.filter((part) => {
            const opacity = Number(part.opacity);
            return allowedCropIndexes.has(part.cropIndex)
                && (!Number.isFinite(opacity) || opacity > 0.01);
        }),
    };
}

function normalizeAngle(angle) {
    return ((angle + 180) % 360 + 360) % 360 - 180;
}

function currentScoreRoundParts() {
    return [...canvasWorld.querySelectorAll('.placed-part[data-score-round-part="true"]')]
        .filter((part) => part.isConnected && !part.classList.contains("is-layer-hidden"));
}

function matchScoreParts(templateParts, placedParts) {
    const targetsByCrop = new Map();
    const playersByCrop = new Map();
    templateParts.forEach((part) => {
        const list = targetsByCrop.get(part.cropIndex) ?? [];
        list.push(part);
        targetsByCrop.set(part.cropIndex, list);
    });
    placedParts.forEach((part) => {
        const cropIndex = cropIndexFromPlacedPart(part);
        if (cropIndex === null) return;
        const list = playersByCrop.get(cropIndex) ?? [];
        list.push(part);
        playersByCrop.set(cropIndex, list);
    });

    const pairs = [];
    let extras = 0;
    playersByCrop.forEach((players, cropIndex) => {
        const targets = [...(targetsByCrop.get(cropIndex) ?? [])]
            .sort((left, right) => left.x - right.x || left.y - right.y || left.modelIndex - right.modelIndex);
        const orderedPlayers = [...players]
            .sort((left, right) => Number.parseFloat(left.style.left) - Number.parseFloat(right.style.left)
                || Number.parseFloat(left.style.top) - Number.parseFloat(right.style.top));
        const amount = Math.min(targets.length, orderedPlayers.length);
        for (let index = 0; index < amount; index += 1) {
            pairs.push({ target: targets[index], player: orderedPlayers[index] });
        }
        extras += Math.max(0, orderedPlayers.length - targets.length);
    });
    return { pairs, extras };
}

function fitScoreLayout(pairs) {
    // A single part has no relative layout, so using the correct one is enough.
    if (pairs.length < 2) return { scale: 1, angle: 0, positionQuality: pairs.length ? 1 : 0 };
    const targetCenter = pairs.reduce((total, pair) => ({ x: total.x + pair.target.x, y: total.y + pair.target.y }), { x: 0, y: 0 });
    const playerCenter = pairs.reduce((total, pair) => {
        const position = positionOf(pair.player);
        return { x: total.x + Number.parseFloat(position.left), y: total.y + Number.parseFloat(position.top) };
    }, { x: 0, y: 0 });
    targetCenter.x /= pairs.length;
    targetCenter.y /= pairs.length;
    playerCenter.x /= pairs.length;
    playerCenter.y /= pairs.length;

    let targetEnergy = 0;
    const points = pairs.map((pair) => {
        const position = positionOf(pair.player);
        const target = { x: pair.target.x - targetCenter.x, y: pair.target.y - targetCenter.y };
        const player = { x: Number.parseFloat(position.left) - playerCenter.x, y: Number.parseFloat(position.top) - playerCenter.y };
        targetEnergy += target.x ** 2 + target.y ** 2;
        return { pair, target, player };
    });
    if (targetEnergy < 0.001) return { scale: 1, angle: 0, positionQuality: 0.5 };
    const rms = Math.sqrt(targetEnergy / pairs.length);
    const error = Math.sqrt(points.reduce((sum, point) => {
        return sum + (point.player.x - point.target.x) ** 2 + (point.player.y - point.target.y) ** 2;
    }, 0) / pairs.length) / Math.max(rms, 1);
    const layoutTolerance = 0.7 + clamp(Math.log2(pairs.length) * 0.11, 0, 0.45);
    return { scale: 1, angle: 0, positionQuality: clamp(1 - error / layoutTolerance, 0, 1) };
}

function scoreEntryBounds(entry) {
    const radians = entry.angle * (Math.PI / 180);
    const width = entry.sprite.width * Math.abs(entry.scaleX);
    const height = entry.sprite.height * Math.abs(entry.scaleY);
    const rotatedWidth = Math.abs(Math.cos(radians)) * width + Math.abs(Math.sin(radians)) * height;
    const rotatedHeight = Math.abs(Math.sin(radians)) * width + Math.abs(Math.cos(radians)) * height;
    return {
        left: entry.x - rotatedWidth / 2,
        top: entry.y - rotatedHeight / 2,
        right: entry.x + rotatedWidth / 2,
        bottom: entry.y + rotatedHeight / 2,
    };
}

function scoreImageBounds(entries) {
    return entries.reduce((bounds, entry) => {
        const entryBounds = scoreEntryBounds(entry);
        return {
            left: Math.min(bounds.left, entryBounds.left),
            top: Math.min(bounds.top, entryBounds.top),
            right: Math.max(bounds.right, entryBounds.right),
            bottom: Math.max(bounds.bottom, entryBounds.bottom),
        };
    }, { left: Infinity, top: Infinity, right: -Infinity, bottom: -Infinity });
}

function scoreRectangleOverlap(first, second) {
    const firstBounds = scoreEntryBounds(first);
    const secondBounds = scoreEntryBounds(second);
    const overlapWidth = Math.max(0, Math.min(firstBounds.right, secondBounds.right) - Math.max(firstBounds.left, secondBounds.left));
    const overlapHeight = Math.max(0, Math.min(firstBounds.bottom, secondBounds.bottom) - Math.max(firstBounds.top, secondBounds.top));
    const overlap = overlapWidth * overlapHeight;
    const firstArea = Math.max(0, firstBounds.right - firstBounds.left) * Math.max(0, firstBounds.bottom - firstBounds.top);
    const secondArea = Math.max(0, secondBounds.right - secondBounds.left) * Math.max(0, secondBounds.bottom - secondBounds.top);
    const union = firstArea + secondArea - overlap;
    return union ? overlap / union : 0;
}

function scoreImageFallback(targetEntries, playerEntries, pairs, targetCount) {
    const targetsByPart = new Map(targetEntries.map((entry) => [entry.targetPart, entry]));
    const playersByPart = new Map(playerEntries.map((entry) => [entry.part, entry]));
    const overlaps = pairs.map((pair) => {
        const target = targetsByPart.get(pair.target);
        const player = playersByPart.get(pair.player);
        return target && player ? scoreRectangleOverlap(target, player) : 0;
    });
    if (!overlaps.length) return 0;
    const average = overlaps.reduce((total, value) => total + value, 0) / overlaps.length;
    // Extra player sprites still lower the fallback score, matching the alpha
    // mask comparison used when the browser allows canvas pixel readback.
    return average * clamp(overlaps.length / Math.max(targetCount, playerEntries.length, 1), 0, 1);
}

function scoreImageAlignment(pairs) {
    if (!pairs.length) return { scale: 1, offsetX: 0, offsetY: 0 };
    const targetCenter = pairs.reduce((total, pair) => ({ x: total.x + pair.target.x, y: total.y + pair.target.y }), { x: 0, y: 0 });
    const playerCenter = pairs.reduce((total, pair) => {
        const position = positionOf(pair.player);
        return { x: total.x + Number.parseFloat(position.left), y: total.y + Number.parseFloat(position.top) };
    }, { x: 0, y: 0 });
    targetCenter.x /= pairs.length;
    targetCenter.y /= pairs.length;
    playerCenter.x /= pairs.length;
    playerCenter.y /= pairs.length;

    let scale = 1;
    if (pairs.length >= 2) {
        let numerator = 0;
        let denominator = 0;
        pairs.forEach((pair) => {
            const position = positionOf(pair.player);
            const playerX = Number.parseFloat(position.left) - playerCenter.x;
            const playerY = Number.parseFloat(position.top) - playerCenter.y;
            const targetX = pair.target.x - targetCenter.x;
            const targetY = pair.target.y - targetCenter.y;
            numerator += playerX * targetX + playerY * targetY;
            denominator += playerX ** 2 + playerY ** 2;
        });
        if (denominator > 0 && numerator > 0) scale = numerator / denominator;
    } else {
        const pair = pairs[0];
        const playerScale = Math.abs(Number.parseFloat(positionOf(pair.player).scale));
        const targetScale = (Math.abs(Number(pair.target.scaleX) || 1) + Math.abs(Number(pair.target.scaleY) || 1)) / 2;
        if (playerScale > 0) scale = targetScale / playerScale;
    }
    scale = clamp(scale, 0.25, 4);
    return {
        scale,
        offsetX: targetCenter.x - playerCenter.x * scale,
        offsetY: targetCenter.y - playerCenter.y * scale,
    };
}

function rasterizeScoreEntries(entries, bounds, scale, canvasSize, padding) {
    const raster = document.createElement("canvas");
    raster.width = canvasSize;
    raster.height = canvasSize;
    const context = raster.getContext("2d", { willReadFrequently: true });
    context.imageSmoothingEnabled = false;
    [...entries]
        .sort((left, right) => left.z - right.z)
        .forEach((entry) => {
            const image = loadedPartImages.get(entry.source);
            if (!image) return;
            context.save();
            context.globalAlpha = entry.opacity;
            context.translate(
                padding + (entry.x - bounds.left) * scale,
                padding + (entry.y - bounds.top) * scale,
            );
            context.rotate(entry.angle * (Math.PI / 180));
            context.scale(entry.scaleX * scale, entry.scaleY * scale);
            context.drawImage(
                image,
                entry.sprite.x,
                entry.sprite.y,
                entry.sprite.width,
                entry.sprite.height,
                -entry.sprite.width / 2,
                -entry.sprite.height / 2,
                entry.sprite.width,
                entry.sprite.height,
            );
            context.restore();
        });
    return context.getImageData(0, 0, canvasSize, canvasSize).data;
}

async function scoreImageSimilarity(templateParts, placedParts, pairs) {
    if (!scoreRoundTarget || !templateParts.length || !pairs.length) return 0;

    const unit = unitCatalog[scoreRoundTarget.unitId] ?? await ensureUnitLoaded(scoreRoundTarget.unitId);
    const assetsByCrop = new Map(availablePartsForRank(unit, scoreRoundTarget.rank)
        .map((part) => [cropIndexFromPartId(part.id), part])
        .filter(([cropIndex]) => cropIndex !== null));
    const targetEntries = templateParts.map((targetPart) => {
        const asset = assetsByCrop.get(targetPart.cropIndex);
        const sprite = normalizeSprite(asset?.sprite);
        if (!asset?.src || !sprite) return null;
        return {
            targetPart,
            source: asset.src,
            sprite,
            x: Number(targetPart.x),
            y: Number(targetPart.y),
            angle: Number(targetPart.angle) || 0,
            scaleX: Math.abs(Number(targetPart.scaleX) || 1) * (Number(targetPart.flipX) === -1 ? -1 : 1),
            scaleY: Math.abs(Number(targetPart.scaleY) || 1) * (Number(targetPart.flipY) === -1 ? -1 : 1),
            z: Number(targetPart.z) || 0,
            opacity: clamp(Number.isFinite(Number(targetPart.opacity)) ? Number(targetPart.opacity) : 1, 0, 1),
        };
    }).filter(Boolean)
        .filter((entry) => Number.isFinite(entry.x) && Number.isFinite(entry.y));
    if (!targetEntries.length) return 0;

    const alignment = scoreImageAlignment(pairs);

    const playerEntries = placedParts.map((part) => {
        const asset = assetFromElement(part);
        const sprite = normalizeSprite(asset.sprite);
        const position = positionOf(part);
        const x = Number.parseFloat(position.left);
        const y = Number.parseFloat(position.top);
        const scale = Number.parseFloat(position.scale);
        const flipX = Number.parseFloat(position.flipX);
        if (!asset.src || !sprite || !Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(scale)) return null;
        return {
            part,
            source: asset.src,
            sprite,
            x: x * alignment.scale + alignment.offsetX,
            y: y * alignment.scale + alignment.offsetY,
            angle: Number.parseFloat(position.rotation) || 0,
            scaleX: scale * (Number.isFinite(flipX) ? flipX : 1) * alignment.scale,
            scaleY: scale * alignment.scale,
            z: Number(part.style.zIndex) || 0,
            opacity: 1,
        };
    }).filter(Boolean);
    if (!playerEntries.length) return 0;

    await Promise.all([...new Set([...targetEntries, ...playerEntries].map((entry) => entry.source))]
        .map(ensurePartSourceLoaded));

    const bounds = scoreImageBounds([...targetEntries, ...playerEntries]);
    if (!Number.isFinite(bounds.left)) return 0;
    const padding = 6;
    const canvasSize = 192;
    const width = Math.max(1, bounds.right - bounds.left);
    const height = Math.max(1, bounds.bottom - bounds.top);
    const scale = Math.min((canvasSize - padding * 2) / width, (canvasSize - padding * 2) / height);
    try {
        const targetPixels = rasterizeScoreEntries(targetEntries, bounds, scale, canvasSize, padding);
        const playerPixels = rasterizeScoreEntries(playerEntries, bounds, scale, canvasSize, padding);
        let overlap = 0;
        let union = 0;
        for (let index = 3; index < targetPixels.length; index += 4) {
            const targetVisible = targetPixels[index] > 32;
            const playerVisible = playerPixels[index] > 32;
            if (targetVisible || playerVisible) union += 1;
            if (targetVisible && playerVisible) overlap += 1;
        }
        if (overlap > 0 && union) return overlap / union;
    } catch (error) {
        // Local file pages can display sprites but still block Canvas pixel
        // readback. The fallback keeps local scoring useful in that browser mode.
        console.warn("無法讀取 Sprite Sheet 像素，改用圖形外框比對。", error);
    }
    return scoreImageFallback(targetEntries, playerEntries, pairs, templateParts.length);
}

async function gradeScoreRound() {
    const templateParts = scoreRoundTemplate?.parts ?? [];
    const placedParts = currentScoreRoundParts();
    const { pairs, extras } = matchScoreParts(templateParts, placedParts);
    const rawCoverage = templateParts.length
        ? clamp(pairs.length / (templateParts.length + extras * 1.25), 0, 1)
        : 0;
    // Large characters contain many tiny independent sprites. Missing a few of
    // them should be less punishing, while a sparse random arrangement stays low.
    const coverageExponent = 1 - clamp((templateParts.length - 8) / 72, 0, 0.28);
    const coverage = rawCoverage ** coverageExponent;
    const layout = fitScoreLayout(pairs);

    const transformQuality = pairs.length === 1 ? 1 : pairs.length ? pairs.reduce((sum, pair) => {
        const position = positionOf(pair.player);
        const playerScale = Number.parseFloat(position.scale);
        const expectedScale = (pair.target.scaleX + pair.target.scaleY) / 2 * Math.max(layout.scale, 0.01);
        const scaleError = Math.abs(Math.log(Math.max(playerScale, 0.01) / Math.max(expectedScale, 0.01)));
        const expectedAngle = pair.target.angle + layout.angle;
        const angleError = Math.abs(normalizeAngle(Number.parseFloat(position.rotation) - expectedAngle));
        const scaleQuality = clamp(1 - scaleError / 1.15, 0, 1);
        const rotationQuality = clamp(1 - angleError / 135, 0, 1);
        return sum + (scaleQuality + rotationQuality) / 2;
    }, 0) / pairs.length : 0;

    let orderQuality = pairs.length < 2 ? (pairs.length ? 1 : 0) : 0;
    if (pairs.length >= 2) {
        let comparisons = 0;
        let correct = 0;
        for (let first = 0; first < pairs.length; first += 1) {
            for (let second = first + 1; second < pairs.length; second += 1) {
                const targetOrder = pairs[first].target.z - pairs[second].target.z;
                const playerOrder = Number(pairs[first].player.style.zIndex) - Number(pairs[second].player.style.zIndex);
                if (!targetOrder || !playerOrder) continue;
                comparisons += 1;
                if (Math.sign(targetOrder) === Math.sign(playerOrder)) correct += 1;
            }
        }
        orderQuality = comparisons ? correct / comparisons : 1;
    }

    let image = 0;
    try {
        image = await scoreImageSimilarity(templateParts, placedParts, pairs);
    } catch (error) {
        console.warn("影像比對失敗，略過本項分數。", error);
    }

    // Identifying the right sprites alone earns only a small base score. The
    // remaining points need a coherent arrangement, so scattered or duplicated
    // colour blocks cannot score well merely by matching a crop id.
    // Position scores the arrangement only. Do not apply it again as a harsh
    // multiplier to angle and layer order; that made one layout mistake count
    // several times and punished visually close answers too heavily.
    const arrangementGate = coverage * layout.positionQuality;
    const coreScore = coverage * 20
        + arrangementGate * 35
        + coverage * transformQuality * 30
        + coverage * orderQuality * 15;
    // This is a bonus after the structural score. It first aligns both
    // compositions as a whole, so arbitrary canvas placement does not punish
    // an otherwise correct arrangement. Simple characters should not gain as
    // much from image similarity: each required part raises the cap by 3,
    // from +3 for one part to the existing maximum of +60.
    const imageBonusCap = clamp(templateParts.length * 3, 3, 60);
    const imageBonus = image * imageBonusCap;
    const total = Math.round(Math.min(100, coreScore + imageBonus));
    return {
        total,
        matched: pairs.length,
        targetCount: templateParts.length,
        extras,
        coverage,
        layout: layout.positionQuality,
        transform: transformQuality,
        order: orderQuality,
        image,
        imageBonus,
    };
}

function renderScoreResult(result) {
    scoreFinalScore.firstChild.nodeValue = `${result.total}`;
    scoreResultMessage.textContent = result.total == 67 ? "🫲🤪🫱" : result.total >= 90 ? "你是記憶拼圖大師吧！" : result.total >= 70 ? "很強了！" : result.total >= 45 ? "還行啦~" : "你是如何走到這地步的?";
    const details = [
        ["物件", `${result.matched} / ${result.targetCount}`],
        ["位置", `${Math.round(result.layout * 100)}%`],
        ["角度", `${Math.round(result.transform * 100)}%`],
        ["圖層", `${Math.round(result.order * 100)}%`],
        ["影像", `+${Math.round(result.imageBonus)}分`],
    ];
    scoreResultBreakdown.replaceChildren(...details.map(([label, value]) => {
        const row = document.createElement("div");
        const text = document.createElement("span");
        const score = document.createElement("strong");
        text.textContent = label;
        score.textContent = value;
        row.append(text, score);
        return row;
    }));
}

function clearScoreRoundParts() {
    canvasWorld.querySelectorAll('.placed-part[data-score-round-part="true"]').forEach((part) => part.remove());
    if (scoreHistoryStart !== null) {
        history.length = scoreHistoryStart;
        redoHistory.length = 0;
        scoreHistoryStart = null;
        updateUndoButton();
    }
    selectedParts.clear();
    selectedPart = null;
    updateSelectionFrame();
}

function resetScorePanelScrollPositions() {
    sidePanel.scrollTop = 0;
    scoreSetupScroll.scrollTop = 0;
    scoreRoundScroll.scrollTop = 0;
}

async function startScoreRound() {
    let target = null;
    scoreStartButton.disabled = true;
    resetScoreImageExports();
    setScoreRoundInputLocked(false);
    scoreModeStatus.textContent = "正在準備題目…";
    try {
        if (scoreQuestionMode === "fixed") {
            if (!scoreFixedUnitId) {
                scoreUnitSearch.value = "";
                scoreUnitSearch.placeholder = "請先選擇一隻角色";
                scoreUnitSearch.focus();
                scoreModeStatus.textContent = "請先選擇一隻角色。";
                return;
            }
            const unit = await ensureUnitLoaded(scoreFixedUnitId);
            const ranks = availableRanksForUnit(unit);
            if (!ranks.includes(scoreFixedRank)) {
                scoreModeStatus.textContent = "這隻角色沒有選擇的階級，請改選其他階級。";
                return;
            }
            target = { unitId: scoreFixedUnitId, rank: scoreFixedRank };
        } else {
            target = scoreRandomTarget ?? await (scoreRandomPreparation ?? prepareRandomScoreTarget());
            if (!target) throw new Error("無法準備隨機題目");
            scoreRandomTarget = null;
            scoreRandomPreparation = null;
        }

        scoreModeStatus.textContent = "正在讀取正確答案…";
        const template = await ensureScoreTemplateLoaded(target);
        const unit = unitCatalog[target.unitId] ?? await ensureUnitLoaded(target.unitId);
        const rankParts = availablePartsForRank(unit, target.rank);
        await Promise.all([...new Set(rankParts.map((part) => part.src))].map(ensurePartSourceLoaded));
        const usableTemplate = withoutPlaceholderScoreParts(template, unit, target.rank);
        if (!usableTemplate.parts.length) throw new Error("此題沒有可用的角色部件");
        clearScoreRoundParts();
        scoreHistoryStart = history.length;
        scoreRoundTarget = target;
        scoreRoundTemplate = usableTemplate;
        scoreResultPanel.hidden = true;
        scoreResultPanel.classList.remove("is-summary-pending");
        setScoreRoundCanvasState(true);
        playScoreStartFlash();
        scoreActiveUnit.value = unitLabel(target.unitId);
        scoreActiveRank.value = target.rank;
        scoreSetup.hidden = true;
        scoreRunning.hidden = false;
        resetScorePanelScrollPositions();
        requestAnimationFrame(resetScorePanelScrollPositions);
        normalModeTab.disabled = true;
        const rendered = await renderScoreParts(target, usableTemplate);
        if (scoreRoundTarget !== target) return;
        if (!rendered) throw new Error("無法載入評分部件");
        scoreRoundStartedAt = Date.now();
        scoreRoundFinished = false;
        scoreMusic.currentTime = 0;
        tryPlayMusic();
        window.clearInterval(scoreTimerId);
        updateScoreRound();
        scoreTimerId = window.setInterval(updateScoreRound, 250);
    } catch (error) {
        console.error(error);
        clearScoreRoundParts();
        scoreRoundTemplate = null;
        setScoreRoundCanvasState(false);
        tryPlayMusic();
        scoreModeStatus.textContent = "題目準備失敗，請再試一次。";
        scoreRunning.hidden = true;
        scoreSetup.hidden = false;
        normalModeTab.disabled = false;
    } finally {
        scoreStartButton.disabled = false;
    }
}

async function finishScoreRound(finished = false, { clearCanvas = true } = {}) {
    window.clearInterval(scoreTimerId);
    scoreTimerId = null;
    scoreRoundFinished = finished;
    if (finished) {
        scoreGradeButton.disabled = true;
        scoreCancelButton.disabled = true;
        const result = await gradeScoreRound();
        renderScoreResult(result);
        scoreCountdown.textContent = "完成";
        scoreGradeButton.disabled = true;
        scoreRoundStartedAt = 0;
        scoreRunning.hidden = true;
        scoreSetup.hidden = true;
        scoreResultPanel.hidden = false;
        scoreResultPanel.classList.add("is-summary-pending");
        normalModeTab.disabled = false;
        showScoreResultOverlay(result);
        return;
    }
    setScoreRoundInputLocked(false);
    scoreRoundStartedAt = 0;
    scoreRoundTarget = null;
    scoreRoundTemplate = null;
    scoreRunning.hidden = true;
    scoreSetup.hidden = false;
    resetScorePanelScrollPositions();
    scoreResultPanel.hidden = true;
    if (clearCanvas) clearScoreRoundParts();
    else promoteScoreRoundPartsToNormalGroup();
    setScoreRoundCanvasState(false);
    tryPlayMusic();
    scoreGradeButton.disabled = false;
    scoreCancelButton.disabled = false;
    scoreCancelButton.innerHTML = '<i class="fa-solid fa-xmark" aria-hidden="true"></i><span>取消</span>';
    normalModeTab.disabled = false;
    scoreModeStatus.textContent = scoreQuestionMode === "fixed" && !scoreFixedUnitId
        ? "選擇一隻角色後即可開始。"
        : "題目已準備好，可以開始。";
    renderParts();
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

function normalizeSprite(sprite) {
    if (!sprite || typeof sprite !== "object") return null;
    const values = ["x", "y", "width", "height", "sheetWidth", "sheetHeight"]
        .map((key) => Number(sprite[key]));
    if (!values.every(Number.isFinite)) return null;
    const [x, y, width, height, sheetWidth, sheetHeight] = values;
    if (x < 0 || y < 0 || width <= 0 || height <= 0 || sheetWidth <= 0 || sheetHeight <= 0) return null;
    if (x + width > sheetWidth || y + height > sheetHeight) return null;
    return { x, y, width, height, sheetWidth, sheetHeight };
}

function spriteFromElement(part) {
    try {
        return normalizeSprite(JSON.parse(part.dataset.sprite ?? ""));
    } catch {
        return null;
    }
}

function assetFromElement(part) {
    return {
        id: part.dataset.partId,
        src: part.dataset.src,
        name: part.dataset.name,
        sprite: spriteFromElement(part),
    };
}

function createAssetPreview(asset, className, maximumWidth, maximumHeight) {
    const image = document.createElement("img");
    const sprite = normalizeSprite(asset.sprite);
    image.src = asset.src;
    image.alt = "";
    image.draggable = false;

    if (!sprite) {
        image.className = `${className} asset-preview`;
        return image;
    }

    const scale = Math.min(maximumWidth / sprite.width, maximumHeight / sprite.height, 1);
    const crop = document.createElement("span");
    crop.className = `${className} asset-preview sprite-preview`;
    crop.style.width = `${sprite.width * scale}px`;
    crop.style.height = `${sprite.height * scale}px`;
    image.className = "sprite-sheet-image";
    image.style.width = `${sprite.sheetWidth * scale}px`;
    image.style.height = `${sprite.sheetHeight * scale}px`;
    image.style.left = `${-sprite.x * scale}px`;
    image.style.top = `${-sprite.y * scale}px`;
    crop.append(image);
    return crop;
}

function isPalettePartDrag(dataTransfer) {
    return [...(dataTransfer?.types ?? [])].includes(PART_DRAG_TYPE);
}

function beginPalettePartDrag(part, image, sourceBounds, clientX, clientY, dataTransfer) {
    const sprite = normalizeSprite(part.sprite);
    const partWidth = Number(part.width);
    const partHeight = Number(part.height);
    const width = sprite?.width ?? (Number.isFinite(partWidth) ? partWidth : image.naturalWidth);
    const height = sprite?.height ?? (Number.isFinite(partHeight) ? partHeight : image.naturalHeight);
    const offsetX = clamp((clientX - sourceBounds.left) / sourceBounds.width, 0, 1) * width;
    const offsetY = clamp((clientY - sourceBounds.top) / sourceBounds.height, 0, 1) * height;
    palettePartDrag = { id: part.id, width, height, offsetX, offsetY };

    if (!dataTransfer?.setDragImage || !image?.naturalWidth || !image.naturalHeight) return;
    const scale = Math.min(1, 96 / Math.max(width, height));
    const preview = document.createElement("canvas");
    preview.className = "native-drag-preview";
    preview.width = Math.max(1, Math.round(width * scale));
    preview.height = Math.max(1, Math.round(height * scale));
    const context = preview.getContext("2d");
    context.imageSmoothingEnabled = false;
    if (sprite) {
        context.drawImage(image, sprite.x, sprite.y, sprite.width, sprite.height, 0, 0, preview.width, preview.height);
    } else {
        context.drawImage(image, 0, 0, preview.width, preview.height);
    }
    document.body.append(preview);
    dataTransfer.setDragImage(preview, Math.round(offsetX * scale), Math.round(offsetY * scale));
    requestAnimationFrame(() => preview.remove());
}

function showPartsLoading() {
    activeParts = new Map();
    partsList.replaceChildren();
    const loading = document.createElement("p");
    loading.className = "parts-loading";
    loading.setAttribute("role", "status");
    loading.setAttribute("aria-label", "載入中");
    loading.innerHTML = '<span>載入中</span><span class="parts-loading-dots" aria-hidden="true"></span>';
    partsList.append(loading);
    unitStatus.textContent = "正在載入角色部件…";
}

function ensurePartSourceLoaded(source) {
    if (loadedPartImages.has(source)) return Promise.resolve(loadedPartImages.get(source));
    if (loadingPartSources.has(source)) return loadingPartSources.get(source);
    const request = new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => {
            loadedPartImages.set(source, image);
            resolve(image);
        };
        image.onerror = () => {
            loadingPartSources.delete(source);
            reject(new Error(`無法載入角色圖片：${source}`));
        };
        image.src = source;
    });
    loadingPartSources.set(source, request);
    return request;
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

function createGroupId() {
    return globalThis.crypto?.randomUUID?.() ?? `group-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function createGroupColor() {
    return `hsl(${Math.floor(Math.random() * 360)} 70% 52% / 0.18)`;
}

function snapAngle(angle) {
    const normalized = ((angle % 360) + 360) % 360;
    const nearest = Math.round(normalized / 90) * 90;
    const distance = Math.abs(normalized - nearest);
    return distance <= 6 ? nearest % 360 : angle;
}

function updateUndoButton() {
    if (undoButton) undoButton.disabled = history.length === 0;
    window.dispatchEvent(new CustomEvent("tbcPuzzleHistoryChange", {
        detail: { canUndo: history.length > 0, canRedo: redoHistory.length > 0 },
    }));
}

function isPartMovementLocked(part) {
    if (!part?.isConnected || part.classList.contains("is-layer-locked")) return true;
    const groupId = part.dataset.groupId;
    return Boolean(groupId && orderedParts().some((member) => member.dataset.groupId === groupId && member.classList.contains("is-layer-locked")));
}

function hasMovementLockedPart(parts) {
    return parts.some((part) => isPartMovementLocked(part));
}

function updateLayerButtons() {
    if (!layerBackButton || !layerFrontButton) return;
    if (!selectedPart?.isConnected || isPartMovementLocked(selectedPart)) {
        layerBackButton.disabled = true;
        layerFrontButton.disabled = true;
        return;
    }

    const groupId = selectedPart.dataset.groupId;
    const movesWithinGroup = groupId && !isWholeGroupSelected(selectedPart);
    const parts = movesWithinGroup
        ? orderedParts().filter((part) => part.dataset.groupId === groupId)
        : layerBlocks();
    const current = movesWithinGroup ? selectedPart : layerBlockForPart(selectedPart, parts);
    const index = parts.indexOf(current);
    layerBackButton.disabled = index <= 0;
    layerFrontButton.disabled = index === -1 || index === parts.length - 1;
}

function selectionBoundsInWorld(part) {
    const state = positionOf(part);
    const image = part.querySelector("img");
    const width = Number.parseFloat(part.style.width) || part.offsetWidth || image?.naturalWidth || 0;
    const height = Number.parseFloat(part.style.height) || part.offsetHeight || image?.naturalHeight || 0;
    const scale = Number.parseFloat(state.scale);
    const centerX = Number.parseFloat(state.left);
    const centerY = Number.parseFloat(state.top);
    const angle = Number.parseFloat(state.rotation) * Math.PI / 180;
    if (![width, height, scale, centerX, centerY, angle].every(Number.isFinite)) return null;

    const scaledWidth = width * Math.abs(scale);
    const scaledHeight = height * Math.abs(scale);
    const boundWidth = Math.abs(scaledWidth * Math.cos(angle)) + Math.abs(scaledHeight * Math.sin(angle));
    const boundHeight = Math.abs(scaledWidth * Math.sin(angle)) + Math.abs(scaledHeight * Math.cos(angle));
    return {
        left: centerX - boundWidth / 2,
        top: centerY - boundHeight / 2,
        right: centerX + boundWidth / 2,
        bottom: centerY + boundHeight / 2,
    };
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
        // Hidden layers use display:none, so getBoundingClientRect() would
        // collapse them to zero. Calculate from stored transform data instead.
        const bounds = parts.map(selectionBoundsInWorld).filter(Boolean);
        if (!bounds.length) return;
        const left = Math.min(...bounds.map((bound) => bound.left));
        const top = Math.min(...bounds.map((bound) => bound.top));
        const right = Math.max(...bounds.map((bound) => bound.right));
        const bottom = Math.max(...bounds.map((bound) => bound.bottom));
        const padding = 10;
        selectionFrame.style.left = `${(left + right) / 2}px`;
        selectionFrame.style.top = `${(top + bottom) / 2}px`;
        selectionFrame.style.width = `${right - left + padding}px`;
        selectionFrame.style.height = `${bottom - top + padding}px`;
        selectionFrame.style.setProperty("--rotation", "0deg");
        selectionFrame.classList.add("is-group-selection");
        canvasWorld.classList.add("has-group-selection");
        selectionFrame.classList.add("is-visible");
        return;
    }

    const state = positionOf(selectedPart);
    const scale = Number.parseFloat(state.scale);
    const padding = 24;
    selectionFrame.style.left = state.left;
    selectionFrame.style.top = state.top;
    selectionFrame.style.width = `${selectedPart.offsetWidth * scale + padding}px`;
    selectionFrame.style.height = `${selectedPart.offsetHeight * scale + padding}px`;
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
    layerGroupPointerGrab = null;
    layersPanel.querySelectorAll(".layer-row, .layer-group").forEach((item) => item.classList.remove("is-dragging", "is-drop-target"));
}

function setGroupDragImage(event, groupContainer, pointerGrab = null) {
    const bounds = groupContainer.getBoundingClientRect();
    const preview = groupContainer.cloneNode(true);
    preview.classList.remove("is-dragging", "is-drop-target");
    preview.classList.add("layer-group-drag-preview");
    preview.style.width = `${bounds.width}px`;
    document.body.append(preview);
    const clientX = pointerGrab?.clientX ?? event.clientX;
    const clientY = pointerGrab?.clientY ?? event.clientY;
    // 拖曳預覽以按下群組的位置為游標熱點，避免固定抓在中央造成跳動。
    const grabX = clamp(clientX - bounds.left, 0, bounds.width);
    const grabY = clamp(clientY - bounds.top, 0, bounds.height);
    event.dataTransfer.setDragImage(preview, grabX, grabY);
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

function moveCanvasLayerBlock(part, direction, toEdge = false) {
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

function focusCanvasOnParts(parts) {
    const bounds = parts
        .filter((part) => part?.isConnected)
        .map(selectionBoundsInWorld)
        .filter(Boolean);
    if (!bounds.length) return;

    const left = Math.min(...bounds.map((bound) => bound.left));
    const top = Math.min(...bounds.map((bound) => bound.top));
    const right = Math.max(...bounds.map((bound) => bound.right));
    const bottom = Math.max(...bounds.map((bound) => bound.bottom));
    viewX = canvas.clientWidth / 2 - ((left + right) / 2) * viewScale;
    viewY = canvas.clientHeight / 2 - ((top + bottom) / 2) * viewScale;
    updateViewTransform();
    updateSelectionFrame();
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
    const groupId = createGroupId();
    const groupColor = createGroupColor();
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

function promoteScoreRoundPartsToNormalGroup() {
    const beforeOrder = orderedParts();
    const parts = beforeOrder.filter((part) => part.dataset.scoreRoundPart === "true" && part.isConnected);
    if (!parts.length) return;

    const previousGroups = parts.map((part) => ({
        image: part,
        groupId: part.dataset.groupId ?? "",
        groupColor: part.dataset.groupColor ?? "",
    }));

    if (parts.length > 1) {
        const groupId = createGroupId();
        const groupColor = createGroupColor();
        parts.forEach((part) => {
            part.dataset.groupId = groupId;
            part.dataset.groupColor = groupColor;
        });
        const firstGroupIndex = beforeOrder.findIndex((part) => parts.includes(part));
        const afterOrder = beforeOrder.filter((part) => !parts.includes(part));
        afterOrder.splice(firstGroupIndex, 0, ...parts);
        setLayerOrder(afterOrder);
        remember({ type: "group", parts: previousGroups, order: beforeOrder });
    }

    parts.forEach((part) => delete part.dataset.scoreRoundPart);
    scoreHistoryStart = null;
    setSelectedParts(parts, parts.at(-1));
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
    const sprite = spriteFromElement(part);

    overlay.width = sprite?.width ?? image.naturalWidth;
    overlay.height = sprite?.height ?? image.naturalHeight;
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
    if (sprite) {
        context.drawImage(
            image,
            sprite.x,
            sprite.y,
            sprite.width,
            sprite.height,
            0,
            0,
            overlay.width,
            overlay.height,
        );
    } else {
        context.drawImage(image, 0, 0, overlay.width, overlay.height);
    }
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
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

function waitForExportImage(image) {
    if (image.complete) {
        return image.naturalWidth && image.naturalHeight
            ? Promise.resolve()
            : Promise.reject(new Error("角色圖片載入失敗"));
    }
    if (typeof image.decode === "function") return image.decode();
    return new Promise((resolve, reject) => {
        image.addEventListener("load", resolve, { once: true });
        image.addEventListener("error", reject, { once: true });
    });
}

function canvasToPngBlob(output) {
    return new Promise((resolve, reject) => {
        output.toBlob((blob) => {
            if (blob) resolve(blob);
            else reject(new Error("PNG 編碼失敗"));
        }, "image/png");
    });
}

async function pngBlobToDrawable(blob) {
    if (typeof createImageBitmap === "function") return createImageBitmap(blob);
    const url = URL.createObjectURL(blob);
    try {
        return await new Promise((resolve, reject) => {
            const image = new Image();
            image.onload = () => resolve(image);
            image.onerror = () => reject(new Error("無法讀取 PNG 圖片"));
            image.src = url;
        });
    } finally {
        URL.revokeObjectURL(url);
    }
}

function releasePngDrawable(drawable) {
    drawable?.close?.();
}

function scoreCompositionEntries() {
    return currentScoreRoundParts()
        .filter((part) => !part.classList.contains("is-layer-hidden"))
        .map((part) => {
            const image = part.querySelector("img");
            const sprite = spriteFromElement(part);
            const state = positionOf(part);
            if (!image || !sprite) return null;
            return {
                part,
                image,
                sprite,
                x: Number.parseFloat(state.left),
                y: Number.parseFloat(state.top),
                scaleX: Number.parseFloat(state.scale) * Number.parseFloat(state.flipX),
                scaleY: Number.parseFloat(state.scale),
                angle: Number.parseFloat(state.rotation),
                opacity: clamp(Number.parseFloat(part.style.opacity || "1"), 0, 1),
                z: Number(part.style.zIndex) || 0,
            };
        })
        .filter((entry) => entry
            && Number.isFinite(entry.x)
            && Number.isFinite(entry.y)
            && Number.isFinite(entry.scaleX)
            && Number.isFinite(entry.scaleY)
            && Number.isFinite(entry.angle));
}

async function createScoreCompositionPng() {
    const entries = scoreCompositionEntries();
    if (!entries.length) throw new Error("找不到可複製的組合");
    await Promise.all(entries.map((entry) => waitForExportImage(entry.image)));

    const bounds = scoreImageBounds(entries);
    const padding = 20;
    const scale = Math.min(2, Math.max(1, window.devicePixelRatio || 1));
    const output = document.createElement("canvas");
    output.width = Math.max(1, Math.ceil((bounds.right - bounds.left + padding * 2) * scale));
    output.height = Math.max(1, Math.ceil((bounds.bottom - bounds.top + padding * 2) * scale));
    const context = output.getContext("2d");
    if (!context) throw new Error("無法建立 PNG 繪圖區");

    context.scale(scale, scale);
    context.translate(padding - bounds.left, padding - bounds.top);
    entries
        .sort((left, right) => left.z - right.z)
        .forEach((entry) => {
            context.save();
            context.globalAlpha = entry.opacity;
            context.translate(entry.x, entry.y);
            context.rotate(entry.angle * Math.PI / 180);
            context.scale(entry.scaleX, entry.scaleY);
            context.drawImage(
                entry.image,
                entry.sprite.x,
                entry.sprite.y,
                entry.sprite.width,
                entry.sprite.height,
                -entry.sprite.width / 2,
                -entry.sprite.height / 2,
                entry.sprite.width,
                entry.sprite.height,
            );
            context.restore();
        });
    return canvasToPngBlob(output);
}

async function scoreAnswerEntries() {
    if (!scoreRoundTarget || !scoreRoundTemplate) throw new Error("找不到正解資料");
    const unit = unitCatalog[scoreRoundTarget.unitId] ?? await ensureUnitLoaded(scoreRoundTarget.unitId);
    const assetsByCrop = new Map(availablePartsForRank(unit, scoreRoundTarget.rank)
        .map((part) => [cropIndexFromPartId(part.id), part])
        .filter(([cropIndex]) => cropIndex !== null));
    const sourceAssets = scoreRoundTemplate.parts
        .map((targetPart) => ({ targetPart, asset: assetsByCrop.get(targetPart.cropIndex) }))
        .filter(({ asset }) => asset && normalizeSprite(asset.sprite));
    await Promise.all([...new Set(sourceAssets.map(({ asset }) => asset.src))].map(ensurePartSourceLoaded));
    return sourceAssets.map(({ targetPart, asset }) => {
        const sprite = normalizeSprite(asset.sprite);
        return {
            image: loadedPartImages.get(asset.src),
            sprite,
            x: Number(targetPart.x),
            y: Number(targetPart.y),
            scaleX: Math.abs(Number(targetPart.scaleX) || 1) * (Number(targetPart.flipX) === -1 ? -1 : 1),
            scaleY: Math.abs(Number(targetPart.scaleY) || 1) * (Number(targetPart.flipY) === -1 ? -1 : 1),
            angle: Number(targetPart.angle) || 0,
            opacity: clamp(Number.isFinite(Number(targetPart.opacity)) ? Number(targetPart.opacity) : 1, 0, 1),
            z: Number(targetPart.z) || 0,
        };
    }).filter((entry) => entry.image && entry.sprite);
}

async function createScoreAnswerPng() {
    const entries = await scoreAnswerEntries();
    if (!entries.length) throw new Error("找不到正解圖片");
    await Promise.all(entries.map((entry) => waitForExportImage(entry.image)));
    const bounds = scoreImageBounds(entries);
    const padding = 20;
    const scale = Math.min(2, Math.max(1, window.devicePixelRatio || 1));
    const output = document.createElement("canvas");
    output.width = Math.max(1, Math.ceil((bounds.right - bounds.left + padding * 2) * scale));
    output.height = Math.max(1, Math.ceil((bounds.bottom - bounds.top + padding * 2) * scale));
    const context = output.getContext("2d");
    if (!context) throw new Error("無法建立正解 PNG 繪圖區");
    context.scale(scale, scale);
    context.translate(padding - bounds.left, padding - bounds.top);
    entries.sort((left, right) => left.z - right.z).forEach((entry) => {
        context.save();
        context.globalAlpha = entry.opacity;
        context.translate(entry.x, entry.y);
        context.rotate(entry.angle * Math.PI / 180);
        context.scale(entry.scaleX, entry.scaleY);
        context.drawImage(entry.image, entry.sprite.x, entry.sprite.y, entry.sprite.width, entry.sprite.height, -entry.sprite.width / 2, -entry.sprite.height / 2, entry.sprite.width, entry.sprite.height);
        context.restore();
    });
    return canvasToPngBlob(output);
}

function roundedCanvasRect(context, x, y, width, height, radius, fillStyle, strokeStyle = "") {
    const rounded = Math.min(radius, width / 2, height / 2);
    context.beginPath();
    context.moveTo(x + rounded, y);
    context.arcTo(x + width, y, x + width, y + height, rounded);
    context.arcTo(x + width, y + height, x, y + height, rounded);
    context.arcTo(x, y + height, x, y, rounded);
    context.arcTo(x, y, x + width, y, rounded);
    context.closePath();
    context.fillStyle = fillStyle;
    context.fill();
    if (strokeStyle) {
        context.strokeStyle = strokeStyle;
        context.lineWidth = 3;
        context.stroke();
    }
}

function drawContainedImage(context, image, x, y, width, height, padding = 24) {
    const imageScale = Math.min((width - padding * 2) / image.width, (height - padding * 2) / image.height);
    const drawWidth = image.width * imageScale;
    const drawHeight = image.height * imageScale;
    context.drawImage(image, x + (width - drawWidth) / 2, y + (height - drawHeight) / 2, drawWidth, drawHeight);
}

async function createScoreResultPng() {
    const [playerBlob, answerBlob] = await Promise.all([createScoreCompositionPng(), createScoreAnswerPng()]);
    const [playerImage, answerImage] = await Promise.all([pngBlobToDrawable(playerBlob), pngBlobToDrawable(answerBlob)]);
    try {
        const isDark = root.dataset.theme === "dark";
        const background = isDark ? "#171717" : "#bdbdbd";
        const panel = isDark ? "#222222" : "#ffffff";
        const answerPanel = isDark ? "#3c3c3c" : "#eeeeee";
        const text = isDark ? "#f6f6f6" : "#202020";
        const muted = isDark ? "#b9b9b9" : "#666666";
        const output = document.createElement("canvas");
        output.width = 1200;
        output.height = 820;
        const context = output.getContext("2d");
        if (!context) throw new Error("無法建立結算 PNG 繪圖區");
        context.fillStyle = background;
        context.fillRect(0, 0, output.width, output.height);

        const labelWidth = 82;
        const scenesX = 110;
        const scenesWidth = 780;
        const statsX = 912;
        const statsWidth = 240;
        const panelHeight = 374;
        const firstY = 28;
        const secondY = firstY + panelHeight + 16;
        roundedCanvasRect(context, scenesX, firstY, scenesWidth, panelHeight, 16, panel, isDark ? "#666" : "#777");
        roundedCanvasRect(context, scenesX, secondY, scenesWidth, panelHeight, 16, answerPanel, isDark ? "#aaa" : "#888");
        roundedCanvasRect(context, statsX, firstY, statsWidth, panelHeight * 2 + 16, 16, panel, isDark ? "#666" : "#777");

        context.font = '700 28px "GenJyuuGothic", sans-serif';
        context.textAlign = "center";
        context.textBaseline = "middle";
        [["你", firstY + panelHeight / 2], ["正解", secondY + panelHeight / 2]].forEach(([label, centerY]) => {
            roundedCanvasRect(context, 12, Number(centerY) - 27, labelWidth, 54, 27, isDark ? "#3c3c3c" : "#f1f1f1", isDark ? "#777" : "#aaa");
            context.fillStyle = muted;
            context.fillText(label, 12 + labelWidth / 2, Number(centerY));
        });
        drawContainedImage(context, playerImage, scenesX, firstY, scenesWidth, panelHeight);
        drawContainedImage(context, answerImage, scenesX, secondY, scenesWidth, panelHeight);

        const result = latestScoreResultView?.result;
        context.fillStyle = text;
        context.font = '900 78px "GenJyuuGothic", sans-serif';
        context.fillText(`${result?.total ?? "--"}`, statsX + statsWidth / 2, 116);
        context.font = '700 18px "GenJyuuGothic", sans-serif';
        context.fillText("分", statsX + statsWidth / 2 + 56, 130);
        const metrics = [
            ["物件", result ? `${result.matched} / ${result.targetCount}` : "--"],
            ["位置", result ? `${Math.round(result.layout * 100)}%` : "--"],
            ["角度", result ? `${Math.round(result.transform * 100)}%` : "--"],
            ["圖層", result ? `${Math.round(result.order * 100)}%` : "--"],
            ["影像", result ? `+${Math.round(result.imageBonus)} 分` : "--"],
        ];
        metrics.forEach(([label, value], index) => {
            const y = 220 + index * 105;
            context.fillStyle = muted;
            context.font = '700 20px "GenJyuuGothic", sans-serif';
            context.fillText(label, statsX + statsWidth / 2, y);
            context.fillStyle = text;
            context.font = '800 28px "GenJyuuGothic", sans-serif';
            context.fillText(value, statsX + statsWidth / 2, y + 36);
        });
        return canvasToPngBlob(output);
    } finally {
        releasePngDrawable(playerImage);
        releasePngDrawable(answerImage);
    }
}

function writeScorePngToClipboard(png) {
    if (!navigator.clipboard?.write || typeof ClipboardItem === "undefined") {
        return Promise.reject(new Error("此瀏覽器不支援複製圖片，請使用 GitHub Pages 或 localhost 網頁。"));
    }
    // Pass the in-progress PNG promise to ClipboardItem immediately. This
    // preserves the right-click user gesture even while the canvas encodes.
    return navigator.clipboard.write([new ClipboardItem({ "image/png": png })]);
}

function copyScoreCompositionImage() {
    return createScoreCompositionPng();
}

function copyScoreResultImage() {
    return createScoreResultPng();
}

function markScoreImageCopied(button = null) {
    scoreResultPreview.classList.add("is-image-copied");
    if (button) button.classList.add("is-copied");
    window.setTimeout(() => {
        scoreResultPreview.classList.remove("is-image-copied");
        button?.classList.remove("is-copied");
    }, 1_200);
}

function openScoreImageCopyFallback(blob, filename) {
    const url = URL.createObjectURL(blob);
    const dialog = document.createElement("dialog");
    dialog.className = "score-copy-fallback";
    dialog.innerHTML = `
        <button class="score-copy-fallback-close" type="button" aria-label="關閉">×</button>
        <p>長按圖片後選擇「複製」或「儲存圖片」</p>
        <img alt="可複製的結算圖片">
        <a download="${filename}" href="${url}">儲存圖片</a>
    `;
    const close = () => dialog.close();
    dialog.querySelector("img").src = url;
    dialog.querySelector(".score-copy-fallback-close").addEventListener("click", close);
    dialog.addEventListener("click", (event) => {
        if (event.target === dialog) close();
    });
    dialog.addEventListener("close", () => {
        URL.revokeObjectURL(url);
        dialog.remove();
    }, { once: true });
    document.body.append(dialog);
    dialog.showModal();
}

async function shareScorePng(blob, filename, title = "貓咪拼圖結算") {
    if (!navigator.share || typeof File === "undefined") throw new Error("此瀏覽器不支援系統分享");
    const file = new File([blob], filename, { type: "image/png" });
    if (navigator.canShare && !navigator.canShare({ files: [file] })) throw new Error("此瀏覽器無法分享圖片檔案");
    await navigator.share({ files: [file], title });
}

function usesAndroidScoreShare() {
    return /Android/i.test(navigator.userAgent) && typeof navigator.share === "function" && typeof File !== "undefined";
}

function updateScoreImageActionLabels() {
    const isAndroidShare = usesAndroidScoreShare();
    const actions = [
        [scoreCopyCompositionButton, isAndroidShare ? "分享你" : "複製你", isAndroidShare ? "fa-solid fa-share-nodes" : "fa-regular fa-copy"],
        [scoreCopyResultButton, isAndroidShare ? "分享結算" : "複製結算", isAndroidShare ? "fa-solid fa-share-nodes" : "fa-regular fa-images"],
    ];
    actions.forEach(([button, label, iconClass]) => {
        button.setAttribute("aria-label", label);
        button.title = label;
        button.querySelector(".icon-tooltip").textContent = label;
        button.querySelector("i").className = iconClass;
    });
}

function resetScoreImageExports() {
    scoreImageExportVersion += 1;
    scoreCompositionPngBlob = null;
    scoreResultPngBlob = null;
    scoreCompositionPngPromise = null;
    scoreResultPngPromise = null;
    scoreCopyCompositionButton.disabled = false;
    scoreCopyResultButton.disabled = false;
}

function prepareScoreImageExport(kind) {
    const isComposition = kind === "composition";
    const blob = isComposition ? scoreCompositionPngBlob : scoreResultPngBlob;
    const pending = isComposition ? scoreCompositionPngPromise : scoreResultPngPromise;
    if (blob) return Promise.resolve(blob);
    if (pending) return pending;

    const version = scoreImageExportVersion;
    const factory = isComposition ? createScoreCompositionPng : createScoreResultPng;
    const promise = factory().then((createdBlob) => {
        if (version === scoreImageExportVersion) {
            if (isComposition) scoreCompositionPngBlob = createdBlob;
            else scoreResultPngBlob = createdBlob;
        }
        return createdBlob;
    }).finally(() => {
        if (version !== scoreImageExportVersion) return;
        if (isComposition) scoreCompositionPngPromise = null;
        else scoreResultPngPromise = null;
    });
    if (isComposition) scoreCompositionPngPromise = promise;
    else scoreResultPngPromise = promise;
    return promise;
}

function precomputeAndroidScoreShares() {
    if (!usesAndroidScoreShare()) return;
    const exports = [
        ["composition", scoreCopyCompositionButton],
        ["result", scoreCopyResultButton],
    ];
    exports.forEach(([kind, button]) => {
        button.setAttribute("aria-busy", "true");
        void prepareScoreImageExport(kind)
            .catch((error) => {
                console.warn("預先建立分享圖片失敗", error);
            })
            .finally(() => {
                button.removeAttribute("aria-busy");
            });
    });
}

function sharePreparedScoreImage(kind, button, filename) {
    const blob = kind === "composition" ? scoreCompositionPngBlob : scoreResultPngBlob;
    if (!blob) {
        window.alert("圖片正在準備中，請稍後再點一次。");
        return;
    }
    void shareScorePng(blob, filename)
        .then(() => markScoreImageCopied(button))
        .catch((error) => {
            if (error?.name === "AbortError") return;
            console.warn("系統分享失敗，改顯示可儲存圖片。", error);
            openScoreImageCopyFallback(blob, filename);
        });
}

function copyScoreImageWithFeedback(createPng, button = null, filename = "battle-cats-puzzle.png") {
    let png;
    try {
        png = Promise.resolve(createPng());
    } catch (error) {
        console.error("建立結算圖片失敗", error);
        window.alert("無法建立圖片，請確認角色圖片已載入完成後再試一次。");
        return;
    }

    void writeScorePngToClipboard(png)
        .then(() => {
            markScoreImageCopied(button);
        })
        .catch(async (clipboardError) => {
            console.warn("直接複製圖片不可用，改用手機相容流程。", clipboardError);
            try {
                const blob = await png;
                try {
                    await shareScorePng(blob, filename);
                    markScoreImageCopied(button);
                } catch (shareError) {
                    if (shareError?.name === "AbortError") return;
                    openScoreImageCopyFallback(blob, filename);
                }
            } catch (imageError) {
                console.error("建立結算圖片失敗", imageError);
                const message = window.location.protocol === "file:"
                    ? "直接雙擊 index.html 的 file:// 模式無法複製圖片。請使用 GitHub Pages 或「啟動本機網站.cmd」開啟 localhost 網頁。"
                    : "無法建立圖片，請確認角色圖片已載入完成後再試一次。";
                window.alert(message);
            }
        });
}

async function createPngExport() {
    const parts = orderedParts().filter((part) => !part.classList.contains("is-layer-hidden"));
    const images = parts.map((part) => part.querySelector("img"));
    if (images.some((image) => !image)) throw new Error("找不到圖層圖片");
    await Promise.all(images.map((image) => waitForExportImage(image)));

    const scale = Math.min(2, Math.max(1, window.devicePixelRatio || 1));
    const output = document.createElement("canvas");
    output.width = Math.round(canvas.clientWidth * scale);
    output.height = Math.round(canvas.clientHeight * scale);
    const context = output.getContext("2d");
    if (!context) throw new Error("無法建立 PNG 繪圖區");
    context.scale(scale, scale);

    parts.forEach((part) => {
        const image = part.querySelector("img");
        if (!image?.naturalWidth || !image.naturalHeight) throw new Error("角色圖片尚未載入完成");
        const state = positionOf(part);
        const partScale = Number.parseFloat(state.scale);
        const angle = Number.parseFloat(state.rotation) * Math.PI / 180;
        context.save();
        context.translate(viewX + Number.parseFloat(state.left) * viewScale, viewY + Number.parseFloat(state.top) * viewScale);
        context.scale(partScale * viewScale, partScale * viewScale);
        context.rotate(angle);
        context.scale(Number.parseFloat(state.flipX), 1);
        const sprite = spriteFromElement(part);
        if (sprite) {
            context.drawImage(
                image,
                sprite.x,
                sprite.y,
                sprite.width,
                sprite.height,
                -sprite.width / 2,
                -sprite.height / 2,
                sprite.width,
                sprite.height,
            );
        } else {
            context.drawImage(image, -image.naturalWidth / 2, -image.naturalHeight / 2);
        }
        context.restore();
    });

    return canvasToPngBlob(output);
}

function markCanvasImageActionComplete(button) {
    if (!button) return;
    button.classList.add("is-action-complete");
    window.setTimeout(() => button.classList.remove("is-action-complete"), 1200);
}

function showCanvasImageError(error) {
    console.error("主畫面圖片建立失敗", error);
    const message = window.location.protocol === "file:"
        ? "直接雙擊 index.html 的 file:// 模式無法複製或分享圖片。請使用 GitHub Pages 或「啟動本機網站.cmd」開啟 localhost 網頁。"
        : "無法建立主畫面圖片，請確認角色圖片已載入完成後再試一次。";
    window.alert(message);
}

function copyCurrentCanvasImage() {
    const png = createPngExport();
    void writeScorePngToClipboard(png)
        .then(() => markCanvasImageActionComplete(copyCanvasImageButton))
        .catch(async (clipboardError) => {
            console.warn("直接複製主畫面圖片不可用，改用分享或儲存流程。", clipboardError);
            try {
                const blob = await png;
                await shareScorePng(blob, "battle-cats-current-canvas.png", "貓咪拼圖");
                markCanvasImageActionComplete(copyCanvasImageButton);
            } catch (shareError) {
                if (shareError?.name === "AbortError") return;
                try {
                    openScoreImageCopyFallback(await png, "battle-cats-current-canvas.png");
                } catch (imageError) {
                    showCanvasImageError(imageError);
                }
            }
        });
}

function shareCurrentCanvasImage() {
    const png = createPngExport();
    if (shareCanvasImageButton) shareCanvasImageButton.disabled = true;
    void (async () => {
        try {
            await shareScorePng(await png, "battle-cats-current-canvas.png", "貓咪拼圖");
            markCanvasImageActionComplete(shareCanvasImageButton);
        } catch (error) {
            if (error?.name === "AbortError") return;
            try {
                openScoreImageCopyFallback(await png, "battle-cats-current-canvas.png");
            } catch (imageError) {
                showCanvasImageError(imageError);
            }
        } finally {
            if (shareCanvasImageButton) shareCanvasImageButton.disabled = false;
        }
    })();
}

async function exportTransparentPng() {
    if (!exportPngButton) return;
    if (window.location.protocol === "file:") {
        window.alert("直接雙擊 index.html 的 file:// 模式無法安全匯出角色圖片。請雙擊「啟動本機網站.cmd」，並在開啟的 localhost 網頁中再匯出 PNG。");
        return;
    }

    exportPngButton.disabled = true;
    try {
        const png = await createPngExport();
        downloadBlob(png, timestampedFileName("png"));
    } catch (error) {
        console.error("PNG 匯出失敗", error);
        const message = error?.name === "SecurityError"
            ? "PNG 匯出被瀏覽器的圖片安全限制擋下。請用「啟動本機網站.cmd」開啟 localhost 網頁後再試。"
            : "PNG 匯出失敗，請確認角色圖片已載入完成後再試一次。";
        window.alert(message);
    } finally {
        exportPngButton.disabled = false;
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
            sprite: spriteFromElement(part),
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

function readLayerProjectText(file) {
    if (typeof file.text === "function") return file.text();
    return new Promise((resolve, reject) => {
        if (typeof FileReader === "undefined") {
            reject(new Error("此瀏覽器不支援讀取匯入檔案"));
            return;
        }
        const reader = new FileReader();
        reader.addEventListener("load", () => resolve(String(reader.result ?? "")), { once: true });
        reader.addEventListener("error", () => reject(reader.error ?? new Error("讀取檔案失敗")), { once: true });
        reader.readAsText(file);
    });
}

async function importLayerProject(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    try {
        const project = JSON.parse(await readLayerProjectText(file));
        if (project?.format !== "tbc-units-puzzle" || !Array.isArray(project.layers)) throw new Error("檔案格式不正確");
        const layers = project.layers.filter((layer) => typeof layer?.src === "string" && layer.src.length > 0);

        orderedParts().forEach((part) => part.remove());
        history.length = 0;
        redoHistory.length = 0;

        const importedParts = layers.map((layer, index) => {
            const left = Number.parseFloat(layer.left);
            const top = Number.parseFloat(layer.top);
            const part = addPartToCanvas({
                src: layer.src,
                name: layer.name || `圖層 ${index + 1}`,
                sprite: normalizeSprite(layer.sprite),
            }, 0, 0, {
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
        redoHistory.length = 0;
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
    const parts = isScoreRoundCanvasActive
        ? orderedParts().filter((part) => part.dataset.scoreRoundPart === "true")
        : orderedParts();
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
        const thumbnail = createAssetPreview(assetFromElement(part), "layer-thumbnail", 58, 44);
        const visibility = document.createElement("button");
        const lock = document.createElement("button");
        row.className = "layer-row";
        row.dataset.layerIndex = String(parts.indexOf(part));
        row.draggable = !isPartMovementLocked(part);
        row.title = part.dataset.name;
        row.tabIndex = 0;
        row.setAttribute("role", "button");
        row.setAttribute("aria-label", `選取圖層：${part.dataset.name}`);
        row.classList.toggle("is-selected", selectedParts.has(part));
        row.classList.toggle("is-hidden", part.classList.contains("is-layer-hidden"));
        row.classList.toggle("is-locked", part.classList.contains("is-layer-locked"));
        row.classList.toggle("is-flipped", part.dataset.flipX === "-1");

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
            if (isPartMovementLocked(part)) {
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
            const sourceParts = draggedLayerParts();
            const [source] = sourceParts;
            const canDropOnRow = source && source !== part && (
                (source.dataset.groupId && source.dataset.groupId === part.dataset.groupId)
                || (!source.dataset.groupId && !part.dataset.groupId)
                || (source.dataset.groupId && !part.dataset.groupId)
            );

            // A drop over a member row of another group belongs to that group's
            // container. Do not clear the drag state here, or the bubbled group
            // drop loses its source and appears to do nothing.
            if (!canDropOnRow) return;
            event.preventDefault();
            const bounds = row.getBoundingClientRect();
            const insertAbove = event.clientY <= bounds.top + bounds.height / 2;
            if (part.dataset.groupId) {
                placePartWithinGroup(source, part, insertAbove);
            } else {
                moveLayerBlock(sourceParts, [part], insertAbove);
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
            groupContainer.dataset.layerGroupId = part.dataset.groupId;
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
            visibilityToggle.setAttribute("aria-label", allHidden ? "群組目前全部消失，點擊全部出現" : "群組目前全部出現，點擊全部消失");
            visibilityToggle.innerHTML = `<i class="fa-solid ${allHidden ? "fa-eye-slash" : "fa-eye"}" aria-hidden="true"></i>`;
            lockToggle.className = "layer-group-control";
            lockToggle.type = "button";
            lockToggle.setAttribute("aria-label", allLocked ? "群組目前全部鎖定，點擊全部解鎖" : "群組目前全部解鎖，點擊全部鎖定");
            lockToggle.innerHTML = `<i class="fa-solid ${allLocked ? "fa-lock" : "fa-lock-open"}" aria-hidden="true"></i>`;
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
                layerGroupPointerGrab = {
                    groupId: part.dataset.groupId,
                    clientX: event.clientX,
                    clientY: event.clientY,
                };
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
                const pointerGrab = layerGroupPointerGrab?.groupId === part.dataset.groupId ? layerGroupPointerGrab : null;
                setGroupDragImage(event, groupContainer, pointerGrab);
            });
            groupContainer.addEventListener("dragend", clearLayerDragState);
            groupContainer.addEventListener("dragover", (event) => {
                const sourceParts = draggedLayerParts();
                if (!sourceParts.length || sourceParts.every((item) => item.dataset.groupId === part.dataset.groupId)) return;
                event.preventDefault();
                groupContainer.classList.add("is-drop-target");
            });
            groupContainer.addEventListener("dragleave", (event) => {
                if (!groupContainer.contains(event.relatedTarget)) groupContainer.classList.remove("is-drop-target");
            });
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
    if (!button) return;
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

    if (moveCanvasLayerBlock(selectedPart, direction, toEdge) && toEdge) {
        flashLayerButton(direction > 0 ? layerFrontButton : layerBackButton);
    }
}

function resetCanvasView() {
    viewScale = 1;
    viewX = canvas.clientWidth / 2;
    viewY = canvas.clientHeight / 2;
    updateViewTransform();
    updateSelectionFrame();
}

function remember(action) {
    if (action.type === "layers") action.afterOrder = orderedParts();
    if (action.type === "group" || action.type === "ungroup") {
        action.afterGroups = action.parts.map(({ image }) => ({
            image,
            groupId: image.dataset.groupId ?? "",
            groupColor: image.dataset.groupColor ?? "",
        }));
        action.afterOrder = orderedParts();
    }
    history.push(action);
    redoHistory.length = 0;
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
    redoHistory.push(action);

    if (action.type === "add") action.image.remove();
    if (action.type === "paste-group") action.parts.forEach((image) => image.remove());
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

function redo() {
    const action = redoHistory.pop();
    if (!action) return;

    if (action.type === "add") canvasWorld.append(action.image);
    if (action.type === "paste-group") action.parts.forEach((image) => canvasWorld.append(image));
    if (action.type === "move" || action.type === "rotate" || action.type === "scale" || action.type === "flip") restoreImage(action.image, action.to);
    if (action.type === "move-group" || action.type === "rotate-group" || action.type === "scale-group" || action.type === "flip-group") {
        action.changes.forEach(({ image, to }) => restoreImage(image, to));
    }
    if (action.type === "remove") action.image.remove();
    if (action.type === "remove-group") action.parts.forEach(({ image }) => image.remove());
    if (action.type === "clear") action.parts.forEach(({ image }) => image.remove());
    if (action.type === "layers" && action.afterOrder) setLayerOrder(action.afterOrder);
    if ((action.type === "group" || action.type === "ungroup") && action.afterGroups) {
        action.afterGroups.forEach(({ image, groupId, groupColor }) => {
            if (groupId) image.dataset.groupId = groupId;
            else delete image.dataset.groupId;
            if (groupColor) image.dataset.groupColor = groupColor;
            else delete image.dataset.groupColor;
        });
        if (action.afterOrder) setLayerOrder(action.afterOrder);
    }
    if (action.type === "layer" && action.to !== undefined) action.image.style.zIndex = action.to;

    history.push(action);
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

function opaqueHitMaskForPart(part) {
    const sprite = spriteFromElement(part);
    const source = part.dataset.src;
    if (!sprite || !source) return null;
    const key = `${source}|${sprite.x},${sprite.y},${sprite.width},${sprite.height}`;
    if (opaqueHitMasks.has(key)) return opaqueHitMasks.get(key);

    const image = loadedPartImages.get(source) ?? part.querySelector("img");
    if (!image?.complete || !image.naturalWidth) return null;
    try {
        const raster = document.createElement("canvas");
        raster.width = sprite.width;
        raster.height = sprite.height;
        const context = raster.getContext("2d", { willReadFrequently: true });
        context.drawImage(image, sprite.x, sprite.y, sprite.width, sprite.height, 0, 0, sprite.width, sprite.height);
        const pixels = context.getImageData(0, 0, sprite.width, sprite.height).data;
        const alpha = new Uint8Array(sprite.width * sprite.height);
        for (let index = 0; index < alpha.length; index += 1) alpha[index] = pixels[index * 4 + 3];
        const mask = { width: sprite.width, height: sprite.height, alpha };
        opaqueHitMasks.set(key, mask);
        return mask;
    } catch (error) {
        // Some local file browsers disallow Canvas pixel readback.  Keep the
        // former rectangular hit area as a safe fallback in that environment.
        console.warn("無法建立部件透明度抓取遮罩，改用矩形範圍。", error);
        opaqueHitMasks.set(key, null);
        return null;
    }
}

function isOpaquePartHit(part, clientX, clientY) {
    const sprite = spriteFromElement(part);
    if (!sprite) return true;
    const position = positionOf(part);
    const scale = Math.abs(Number.parseFloat(position.scale));
    const flipX = Number.parseFloat(position.flipX) || 1;
    const left = Number.parseFloat(position.left);
    const top = Number.parseFloat(position.top);
    if (!Number.isFinite(scale) || !Number.isFinite(left) || !Number.isFinite(top) || scale === 0) return true;

    const point = clientToWorld(clientX, clientY);
    const radians = (Number.parseFloat(position.rotation) || 0) * (Math.PI / 180);
    const dx = point.x - left;
    const dy = point.y - top;
    const rotatedX = Math.cos(radians) * dx + Math.sin(radians) * dy;
    const rotatedY = -Math.sin(radians) * dx + Math.cos(radians) * dy;
    const localX = rotatedX / (scale * flipX) + sprite.width / 2;
    const localY = rotatedY / scale + sprite.height / 2;
    const mask = opaqueHitMaskForPart(part);
    if (!mask) return localX >= 0 && localX < sprite.width && localY >= 0 && localY < sprite.height;

    const tolerance = Math.max(1, Math.ceil(3 / Math.max(viewScale * scale, 0.01)));
    const centerX = Math.round(localX);
    const centerY = Math.round(localY);
    for (let offsetY = -tolerance; offsetY <= tolerance; offsetY += 1) {
        for (let offsetX = -tolerance; offsetX <= tolerance; offsetX += 1) {
            if (offsetX ** 2 + offsetY ** 2 > tolerance ** 2) continue;
            const x = centerX + offsetX;
            const y = centerY + offsetY;
            if (x >= 0 && x < mask.width && y >= 0 && y < mask.height && mask.alpha[y * mask.width + x] > 24) return true;
        }
    }
    return false;
}

function topOpaquePartAt(clientX, clientY) {
    return orderedParts().reverse().find((part) => {
        return part.isConnected
            && !part.classList.contains("is-layer-hidden")
            && isOpaquePartHit(part, clientX, clientY);
    }) ?? null;
}

function beginPlacedPartDrag(image, event) {
    if (isPartMovementLocked(image)) {
        if (!image.classList.contains("is-layer-locked")) selectPlacedPart(image);
        return;
    }
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
    const selectedDragParts = selectedParts.has(image)
        ? [...selectedParts].filter((part) => part.isConnected && !part.classList.contains("is-layer-locked"))
        : [];
    const dragParts = selectedDragParts.length > 1
        ? selectedDragParts
        : (groupedParts.length > 1 ? groupedParts : [image]);
    if (selectedDragParts.length <= 1 && dragParts.length > 1) setSelectedParts(dragParts, image);
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
}

function makePlacedPartDraggable(image) {
    image.addEventListener("contextmenu", (event) => showLayerContextMenu(event, image));
    image.addEventListener("pointerdown", (event) => {
        if (event.button !== 0) return;
        if (event.target.closest(".rotate-handle")) return;
        const hitPart = topOpaquePartAt(event.clientX, event.clientY);
        if (!hitPart) return;
        beginPlacedPartDrag(hitPart, event);
        return;

        // Legacy drag body retained below for now; the alpha-aware path above
        // always handles left-button presses.
        if (image.classList.contains("is-layer-locked")) return;
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
        const selectedDragParts = selectedParts.has(image)
            ? [...selectedParts].filter((part) => part.isConnected && !part.classList.contains("is-layer-locked"))
            : [];
        const dragParts = selectedDragParts.length > 1
            ? selectedDragParts
            : (groupedParts.length > 1 ? groupedParts : [image]);
        if (selectedDragParts.length <= 1 && dragParts.length > 1) setSelectedParts(dragParts, image);
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
    if (canvas.classList.contains("is-mobile-pan-mode")) return;
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
        if (isPartMovementLocked(image)) return;
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
        if (!parts.length || hasMovementLockedPart(parts)) return;
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
            if (!parts.length || hasMovementLockedPart(parts)) return;
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
    const sprite = normalizeSprite(part.sprite);
    const lockStripeOverlay = document.createElement("canvas");
    const rotateHandle = document.createElement("button");
    placedPart.className = "placed-part";
    if (part.scoreRound || isScoreRoundCanvasActive) placedPart.dataset.scoreRoundPart = "true";
    placedPart.dataset.partId = part.id;
    placedPart.dataset.src = part.src;
    placedPart.dataset.name = part.name;
    if (sprite) placedPart.dataset.sprite = JSON.stringify(sprite);
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
    if (sprite) {
        const crop = document.createElement("span");
        placedPart.classList.add("has-sprite");
        placedPart.style.width = `${sprite.width}px`;
        placedPart.style.height = `${sprite.height}px`;
        crop.className = "placed-sprite-crop";
        crop.style.width = `${sprite.width}px`;
        crop.style.height = `${sprite.height}px`;
        image.className = "sprite-sheet-image";
        image.style.width = `${sprite.sheetWidth}px`;
        image.style.height = `${sprite.sheetHeight}px`;
        image.style.left = `${-sprite.x}px`;
        image.style.top = `${-sprite.y}px`;
        crop.append(image);
        placedPart.append(crop, lockStripeOverlay, rotateHandle);
    } else {
        placedPart.append(image, lockStripeOverlay, rotateHandle);
    }
    makePlacedPartDraggable(placedPart);
    makePlacedPartRotatable(placedPart);
    canvasWorld.append(placedPart);
    selectPlacedPart(placedPart);
    if (options.remember !== false) remember({ type: "add", image: placedPart });
    return placedPart;
}

function copySelectedParts() {
    const parts = orderedParts().filter((part) => selectedParts.has(part) && part.isConnected);
    const copiedSet = new Set(parts);
    const copiedGroups = new Map();

    parts.forEach((part) => {
        const groupId = part.dataset.groupId;
        if (!groupId || copiedGroups.has(groupId)) return;
        const members = orderedParts().filter((item) => item.dataset.groupId === groupId);
        if (members.every((member) => copiedSet.has(member))) copiedGroups.set(groupId, true);
    });

    copiedParts = parts.map((part) => ({
            ...assetFromElement(part),
            ...positionOf(part),
            groupKey: copiedGroups.has(part.dataset.groupId) ? part.dataset.groupId : "",
        }));
}

function pasteCopiedParts() {
    if (!copiedParts.length) return;
    const pasteOffset = 24;
    const pastedGroups = new Map();
    const pastedParts = copiedParts.map((part) => {
        const pastedPart = addPartToCanvas(part, 0, 0, {
            worldPoint: {
                x: Number.parseFloat(part.left) + pasteOffset,
                y: Number.parseFloat(part.top) + pasteOffset,
            },
            rotation: part.rotation,
            scale: part.scale,
            flipX: part.flipX,
            remember: false,
        });

        if (part.groupKey) {
            if (!pastedGroups.has(part.groupKey)) {
                pastedGroups.set(part.groupKey, {
                    id: createGroupId(),
                    color: createGroupColor(),
                });
            }
            const group = pastedGroups.get(part.groupKey);
            pastedPart.dataset.groupId = group.id;
            pastedPart.dataset.groupColor = group.color;
        }
        return pastedPart;
    });
    setSelectedParts(pastedParts, pastedParts.at(-1));
    remember({ type: "paste-group", parts: pastedParts });
}

function createPartCard(part) {
    const card = document.createElement("button");
    const preview = createAssetPreview(part, "part-asset-preview", 76, 76);
    card.className = "part-card";
    card.type = "button";
    card.draggable = true;
    card.setAttribute("aria-label", `拖曳 ${part.form} 階級部件：${part.name}`);
    const image = preview.querySelector?.("img") ?? preview;
    image.loading = "lazy";
    image.decoding = "async";
    card.addEventListener("pointerdown", (event) => {
        if (event.button !== 0) return;
        palettePointerGrab = {
            id: part.id,
            clientX: event.clientX,
            clientY: event.clientY,
            sourceBounds: preview.getBoundingClientRect(),
        };
    });
    card.addEventListener("dragstart", (event) => {
        event.dataTransfer.effectAllowed = "copy";
        event.dataTransfer.setData(PART_DRAG_TYPE, part.id);
        const grab = palettePointerGrab?.id === part.id ? palettePointerGrab : null;
        beginPalettePartDrag(
            part,
            image,
            grab?.sourceBounds ?? preview.getBoundingClientRect(),
            grab?.clientX ?? event.clientX,
            grab?.clientY ?? event.clientY,
            event.dataTransfer,
        );
    });
    card.addEventListener("dragend", () => {
        palettePartDrag = null;
        palettePointerGrab = null;
    });
    card.addEventListener("click", () => {
        palettePointerGrab = null;
        const spread = 180;
        const mobileSpawnOffsetY = window.matchMedia("(max-width: 700px) and (pointer: coarse)").matches ? -120 : 0;
        addPartToCanvas(part, 0, 0, {
            worldPoint: {
                x: (Math.random() - 0.5) * spread,
                y: mobileSpawnOffsetY + (Math.random() - 0.5) * spread,
            },
        });
        playPopSound();
    });
    card.append(preview);
    return card;
}

async function renderParts() {
    const renderVersion = ++partsRenderVersion;
    const unit = unitCatalog[unitSelect.value];
    if (!unit) {
        showPartsLoading();
        return;
    }
    const candidateParts = availablePartsForRank(unit, rankSelect.value);
    showPartsLoading();
    try {
        await Promise.all([...new Set(candidateParts.map((part) => part.src))].map(ensurePartSourceLoaded));
    } catch (error) {
        console.error(error);
        if (renderVersion === partsRenderVersion) {
            partsList.replaceChildren();
            unitStatus.textContent = "角色圖片載入失敗，請再試一次。";
        }
        return;
    }
    if (renderVersion !== partsRenderVersion) return;
    const parts = withoutTransparentParts(candidateParts);
    activeParts = new Map(parts.map((part) => [part.id, part]));
    partsList.replaceChildren();
    unitStatus.textContent = parts.length ? `${parts.length} 個可拖曳部件` : "此階級沒有可用部件。";

    partsList.append(...parts.map(createPartCard));
}

function updateRankOptions() {
    const unit = unitCatalog[unitSelect.value];
    if (!unit) return;
    const forms = new Set(unit.parts.map((part) => part.form));
    for (const option of rankSelect.options) option.disabled = !forms.has(option.value);
    if (!forms.has(rankSelect.value)) rankSelect.value = [...forms][0] ?? "f";
    rankButtons.forEach((button) => {
        const isAvailable = forms.has(button.dataset.rank);
        const isSelected = button.dataset.rank === rankSelect.value;
        button.disabled = !isAvailable;
        button.classList.toggle("is-selected", isSelected);
        button.setAttribute("aria-pressed", String(isSelected));
    });
}

function availableRanksForUnit(unit) {
    const forms = new Set(unit.parts.map((part) => part.form));
    return [...rankSelect.options]
        .map((option) => option.value)
        .filter((form) => forms.has(form));
}

function updateScoreFixedRankOptions(unit) {
    const forms = new Set(unit?.parts?.map((part) => part.form) ?? []);
    for (const button of scoreFixedRankButtons) {
        button.disabled = !forms.has(button.dataset.rank);
    }
    const selectedRankIsAvailable = forms.has(scoreFixedRank);
    if (!selectedRankIsAvailable) {
        scoreFixedRank = scoreFixedRankButtons.find((button) => !button.disabled)?.dataset.rank ?? "";
    }
    scoreFixedRankButtons.forEach((button) => {
        const isSelected = button.dataset.rank === scoreFixedRank;
        button.classList.toggle("is-selected", isSelected);
        button.setAttribute("aria-pressed", String(isSelected));
    });
}

function setScoreFixedRankButtonsDisabled(disabled) {
    scoreFixedRankButtons.forEach((button) => {
        button.disabled = disabled;
        if (disabled) {
            button.classList.remove("is-selected");
            button.setAttribute("aria-pressed", "false");
        }
    });
}

function unitLabel(unitId) {
    const name = unitIndex[unitId]?.name ?? unitCatalog[unitId]?.name;
    return name && name !== unitId ? `${unitId} ${name}` : unitId;
}

function unitMatchesSearch(unitId, query) {
    if (!query) return true;
    const entry = unitIndex[unitId] ?? {};
    const searchTerms = [unitId, entry.name, ...(entry.aliases ?? [])];
    return searchTerms.some((term) => String(term ?? "").toLocaleLowerCase().includes(query));
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

function closeScoreUnitResults() {
    scoreUnitResults.classList.remove("is-open");
    scoreUnitSearch.setAttribute("aria-expanded", "false");
}

async function chooseFixedScoreUnit(unitId) {
    if (!unitIndex[unitId]) return;
    scoreFixedUnitId = unitId;
    scoreUnitSearch.placeholder = "搜尋編號或名稱";
    scoreUnitSearch.value = unitLabel(unitId);
    closeScoreUnitResults();
    setScoreFixedRankButtonsDisabled(true);
    scoreModeStatus.textContent = "正在讀取可用階級…";
    try {
        const unit = await ensureUnitLoaded(unitId);
        if (scoreFixedUnitId !== unitId) return;
        updateScoreFixedRankOptions(unit);
        scoreModeStatus.textContent = "角色已選擇；請確認階級後開始。";
    } catch (error) {
        console.error(error);
        if (scoreFixedUnitId !== unitId) return;
        scoreFixedUnitId = "";
        updateScoreFixedRankOptions(null);
        scoreModeStatus.textContent = "角色資料載入失敗，請再選一次。";
    }
}

function renderScoreUnitResults() {
    const query = scoreUnitSearch.value.trim().toLocaleLowerCase();
    const allUnitIds = Object.keys(unitIndex).sort();
    const suggestions = query
        ? allUnitIds.filter((unitId) => unitMatchesSearch(unitId, query))
        : allUnitIds;
    const remaining = query ? allUnitIds.filter((unitId) => !suggestions.includes(unitId)) : [];
    scoreUnitResults.replaceChildren();
    scoreUnitResults.scrollTop = 0;

    const addSectionTitle = (text) => {
        const title = document.createElement("p");
        title.className = "unit-result-section";
        title.textContent = text;
        scoreUnitResults.append(title);
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
        result.addEventListener("click", () => chooseFixedScoreUnit(unitId));
        scoreUnitResults.append(result);
    };

    if (!suggestions.length) {
        const empty = document.createElement("p");
        empty.className = "unit-result-empty";
        empty.textContent = "找不到相符角色，仍可從完整清單選擇。";
        scoreUnitResults.append(empty);
    }
    if (query && suggestions.length) addSectionTitle("建議角色");
    suggestions.forEach(addResult);
    if (query) addSectionTitle("全部角色");
    remaining.forEach(addResult);
    scoreUnitResults.classList.add("is-open");
    scoreUnitSearch.setAttribute("aria-expanded", "true");
}

function setScoreQuestionMode(mode) {
    scoreQuestionMode = mode;
    const isFixed = mode === "fixed";
    scoreQuestionModeButtons.forEach((button) => {
        const isSelected = button.dataset.scoreMode === mode;
        button.classList.toggle("is-selected", isSelected);
        button.setAttribute("aria-pressed", String(isSelected));
    });
    scoreFixedPicker.hidden = !isFixed;
    closeScoreUnitResults();
    if (isFixed) {
        scoreModeStatus.textContent = scoreFixedUnitId
            ? "角色已選擇；請確認階級後開始。"
            : "選擇一隻角色後即可開始。";
        return;
    }

    scoreRandomTarget = null;
    scoreModeStatus.textContent = "正在準備隨機題目…";
    const preparation = prepareRandomScoreTarget();
    scoreRandomPreparation = preparation;
    preparation
        .then((target) => {
            if (scoreQuestionMode !== "random" || scoreRandomPreparation !== preparation) return;
            scoreRandomTarget = target;
            scoreModeStatus.textContent = target ? "隨機題目已準備完成。" : "隨機題目準備失敗，請再試一次。";
        })
        .catch((error) => {
            console.error(error);
            if (scoreQuestionMode === "random" && scoreRandomPreparation === preparation) {
                scoreModeStatus.textContent = "隨機題目準備失敗，請再試一次。";
            }
        });
}

function updateActiveUnitResult() {
    unitResults.querySelectorAll(".unit-result").forEach((result, index) => {
        const isActive = index === activeUnitResultIndex;
        result.classList.toggle("is-active", isActive);
        result.setAttribute("aria-selected", String(isActive));
        if (isActive) result.scrollIntoView({ block: "nearest" });
    });
}

async function chooseUnit(unitId, preferredRank = null) {
    if (!unitIndex[unitId]) return;
    unitSelect.value = unitId;
    unitSearch.value = unitLabel(unitId);
    closeUnitResults();
    showPartsLoading();

    try {
        await ensureUnitLoaded(unitId);
    } catch (error) {
        console.error(error);
        if (unitSelect.value === unitId) {
            unitStatus.textContent = "角色部件載入失敗，請再試一次。";
        }
        return false;
    }

    if (unitSelect.value !== unitId) return false;
    updateRankOptions();
    if (preferredRank && [...rankSelect.options].some((option) => option.value === preferredRank && !option.disabled)) {
        rankSelect.value = preferredRank;
    }
    updateRankOptions();
    await renderParts();
    return unitSelect.value === unitId;
}

async function chooseRandomUnitAndRank() {
    const unitIds = Object.keys(unitIndex);
    if (!unitIds.length) return;

    randomUnitButton.disabled = true;
    try {
        const unitId = unitIds[Math.floor(Math.random() * unitIds.length)];
        const unit = await ensureUnitLoaded(unitId);
        const ranks = availableRanksForUnit(unit);
        if (!ranks.length) return;
        const rank = ranks[Math.floor(Math.random() * ranks.length)];
        await chooseUnit(unitId, rank);
    } finally {
        randomUnitButton.disabled = false;
    }
}

function renderUnitResults() {
    const query = unitSearch.value.trim().toLocaleLowerCase();
    const allUnitIds = Object.keys(unitIndex).sort();
    const suggestedUnitIds = query
        ? allUnitIds.filter((unitId) => unitMatchesSearch(unitId, query))
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
    showPartsLoading();
    ensureUnitLoaded(initialUnitId)
        .then(() => {
            if (unitSelect.value !== initialUnitId) return;
            updateRankOptions();
            return renderParts();
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
updateScoreImageActionLabels();
initializeUnitIndex();
window.addEventListener("unitindexready", initializeUnitIndex);
resetCanvasView();
updateUndoButton();
makeSelectedGroupRotatable();
makeSelectionScalable();

let lastCanvasSize = { width: canvas.clientWidth, height: canvas.clientHeight };
let pendingCanvasResize = 0;
function keepCanvasViewStableAfterResize() {
    pendingCanvasResize = 0;
    const nextSize = { width: canvas.clientWidth, height: canvas.clientHeight };
    if (nextSize.width <= 0 || nextSize.height <= 0) return;
    if (lastCanvasSize.width > 0 && lastCanvasSize.height > 0) {
        // 旋轉平板時維持同一個世界中心，避免畫面與選取框沿用舊的長寬座標。
        viewX += (nextSize.width - lastCanvasSize.width) / 2;
        viewY += (nextSize.height - lastCanvasSize.height) / 2;
        updateViewTransform();
        updateSelectionFrame();
    }
    lastCanvasSize = nextSize;
}
function scheduleCanvasResizeSync() {
    if (pendingCanvasResize) return;
    pendingCanvasResize = window.requestAnimationFrame(keepCanvasViewStableAfterResize);
}
if ("ResizeObserver" in window) new ResizeObserver(scheduleCanvasResizeSync).observe(canvas);
window.addEventListener("resize", scheduleCanvasResizeSync);
window.addEventListener("orientationchange", scheduleCanvasResizeSync);

normalModeTab.addEventListener("click", () => setActiveMode("normal"));
scoreModeTab.addEventListener("click", () => setActiveMode("score"));
scoreTimeButtons.forEach((button) => {
    button.addEventListener("click", () => {
        selectedScoreDuration = Number(button.dataset.duration);
        scoreTimeButtons.forEach((item) => {
            const isSelected = item === button;
            item.classList.toggle("is-selected", isSelected);
            item.setAttribute("aria-pressed", String(isSelected));
        });
    });
});
scoreQuestionModeButtons.forEach((button) => {
    button.addEventListener("click", () => setScoreQuestionMode(button.dataset.scoreMode));
});
scoreFixedRankButtons.forEach((button) => button.addEventListener("click", () => {
    if (button.disabled) return;
    scoreFixedRank = button.dataset.rank;
    scoreFixedRankButtons.forEach((item) => {
        const isSelected = item === button;
        item.classList.toggle("is-selected", isSelected);
        item.setAttribute("aria-pressed", String(isSelected));
    });
    if (scoreFixedUnitId) scoreModeStatus.textContent = "角色與階級已選擇，可以開始。";
}));
rankButtons.forEach((button) => button.addEventListener("click", () => {
    if (button.disabled || button.dataset.rank === rankSelect.value) return;
    rankSelect.value = button.dataset.rank;
    updateRankOptions();
    renderParts();
}));
scoreStartButton.addEventListener("click", startScoreRound);
scoreCancelButton.addEventListener("click", () => finishScoreRound(false));
scoreGradeButton.addEventListener("click", () => finishScoreRound(true));
scoreRetryButton.addEventListener("click", () => {
    closeScoreResultOverlay();
    finishScoreRound(false, { clearCanvas: false });
});
scoreResultHistoryButton.addEventListener("click", reopenLatestScoreResultOverlay);
scoreImageOverlapButton.addEventListener("click", () => {
    scoreImageOverlayVisible = !scoreImageOverlayVisible;
    renderScoreImageOverlay();
});
scoreCopyCompositionButton.addEventListener("click", () => {
    if (usesAndroidScoreShare()) {
        sharePreparedScoreImage("composition", scoreCopyCompositionButton, "battle-cats-your-composition.png");
        return;
    }
    copyScoreImageWithFeedback(copyScoreCompositionImage, scoreCopyCompositionButton, "battle-cats-your-composition.png");
});
scoreCopyResultButton.addEventListener("click", () => {
    if (usesAndroidScoreShare()) {
        sharePreparedScoreImage("result", scoreCopyResultButton, "battle-cats-puzzle-result.png");
        return;
    }
    copyScoreImageWithFeedback(copyScoreResultImage, scoreCopyResultButton, "battle-cats-puzzle-result.png");
});
scoreResultPreview.title = "右鍵複製你的組合圖片";
scoreResultPreview.addEventListener("contextmenu", (event) => {
    event.preventDefault();
    copyScoreImageWithFeedback(copyScoreCompositionImage, null, "battle-cats-your-composition.png");
});
scoreResultOverlay.addEventListener("pointerdown", (event) => {
    const hasJustOpened = performance.now() - scoreResultOpenedAt < SCORE_RESULT_CLOSE_GUARD_MS;
    if (event.target === scoreResultOverlay && !hasJustOpened) closeScoreResultOverlay();
});
scoreUnitSearch.addEventListener("focus", renderScoreUnitResults);
scoreUnitSearch.addEventListener("input", () => {
    scoreUnitSearch.placeholder = "搜尋編號或名稱";
    scoreFixedUnitId = "";
    updateScoreFixedRankOptions(null);
    renderScoreUnitResults();
});
scoreUnitSearch.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        closeScoreUnitResults();
        scoreUnitSearch.blur();
    }
});

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
    const isExcluded = event.target.closest("#trash-zone, #help-button, #random-unit-button, .part-card, .unit-result");
    if (button && !button.disabled && !isExcluded) playButtonSound();
});
helpButton.addEventListener("click", () => {
    playSecretAreaSound();
    helpDialog.showModal();
});
newsButton.addEventListener("click", () => newsDialog.showModal());
closeNewsButton.addEventListener("click", () => newsDialog.close());
newsDialog.addEventListener("click", (event) => {
    if (event.target === newsDialog) newsDialog.close();
});
closeHelpButton.addEventListener("click", () => helpDialog.close());
helpDialog.addEventListener("click", (event) => {
    if (event.target === helpDialog) helpDialog.close();
});
if (undoButton) undoButton.addEventListener("click", undo);
viewHomeButton.addEventListener("click", resetCanvasView);
if (layerBackButton) layerBackButton.addEventListener("click", (event) => moveSelectedLayer(-1, event.shiftKey));
if (layerFrontButton) layerFrontButton.addEventListener("click", (event) => moveSelectedLayer(1, event.shiftKey));
trashZone.addEventListener("pointerdown", startClearHold);
unitSearch.addEventListener("pointerdown", () => {
    // Restore focus before document-level canvas interactions can close the picker.
    requestAnimationFrame(() => {
        unitSearch.focus({ preventScroll: true });
        renderUnitResults();
    });
});
unitSearch.addEventListener("focus", renderUnitResults);
unitSearch.addEventListener("input", renderUnitResults);
randomUnitButton.addEventListener("click", chooseRandomUnitAndRank);
randomUnitButton.addEventListener("pointerdown", () => {
    closeUnitResults();
    playButtonSound();
});
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
    if (!event.target.closest(".unit-search:not(.score-unit-search)")) closeUnitResults();
    if (!event.target.closest(".score-unit-search")) closeScoreUnitResults();
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
focusLayerButton.addEventListener("click", () => {
    focusCanvasOnParts(contextMenuParts());
    closeLayerContextMenu();
});
importProjectButton.addEventListener("click", () => importProjectInput.click());
importProjectInput.addEventListener("change", importLayerProject);
saveProjectButton.addEventListener("click", saveLayerProject);
if (pngExportEnabled && exportPngButton) exportPngButton.addEventListener("click", exportTransparentPng);
copyCanvasImageButton.addEventListener("click", copyCurrentCanvasImage);
shareCanvasImageButton.addEventListener("click", shareCurrentCanvasImage);
rankSelect.addEventListener("change", () => {
    updateRankOptions();
    renderParts();
});
canvas.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;
    if (canvas.classList.contains("is-mobile-pan-mode")) return;
    const target = event.target;
    if (target.closest(".placed-part, .selection-corner, .layer-controls, .trash-zone")) return;
    if (target === canvas || target === canvasWorld) selectPlacedPart(null);
}, true);
canvas.addEventListener("pointerdown", startMarqueeSelection);
canvas.addEventListener("pointerdown", startCanvasPan);
canvas.addEventListener("wheel", zoomCanvas, { passive: false });
canvas.addEventListener("contextmenu", (event) => event.preventDefault());
canvas.addEventListener("dragenter", (event) => {
    if (!isPalettePartDrag(event.dataTransfer)) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
});
canvas.addEventListener("dragover", (event) => {
    if (!isPalettePartDrag(event.dataTransfer)) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
});
canvas.addEventListener("drop", (event) => {
    if (!isPalettePartDrag(event.dataTransfer)) return;
    event.preventDefault();
    const part = activeParts.get(event.dataTransfer.getData(PART_DRAG_TYPE));
    const point = clientToWorld(event.clientX, event.clientY);
    if (part) {
        const drag = palettePartDrag?.id === part.id ? palettePartDrag : null;
        const scale = 1.6;
        addPartToCanvas(part, 0, 0, {
            worldPoint: drag
                ? {
                    x: point.x + (drag.width / 2 - drag.offsetX) * scale,
                    y: point.y + (drag.height / 2 - drag.offsetY) * scale,
                }
                : point,
        });
    }
    palettePartDrag = null;
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

// Kept deliberately small so the touch-only UI can live in mobile.js without
// duplicating desktop canvas state or changing desktop pointer behavior.
window.tbcPuzzleMobile = Object.freeze({
    panCanvasBy(deltaX, deltaY) {
        viewX += deltaX;
        viewY += deltaY;
        updateViewTransform();
        updateSelectionFrame();
    },
    zoomCanvasAt(clientX, clientY, factor) {
        const bounds = canvas.getBoundingClientRect();
        const worldPoint = clientToWorld(clientX, clientY);
        const nextScale = clamp(viewScale * factor, 0.5, 2.5);
        viewX = clientX - bounds.left - worldPoint.x * nextScale;
        viewY = clientY - bounds.top - worldPoint.y * nextScale;
        viewScale = nextScale;
        updateViewTransform();
        updateSelectionFrame();
    },
    selectAll() {
        setSelectedParts(orderedParts());
    },
    togglePartSelection(part) {
        if (!part?.isConnected || part.classList.contains("is-layer-locked")) return;
        const nextSelection = new Set(selectedParts);
        const members = part.dataset.groupId
            ? orderedParts().filter((item) => item.dataset.groupId === part.dataset.groupId && !item.classList.contains("is-layer-locked"))
            : [part];
        const isSelected = members.every((member) => nextSelection.has(member));
        members.forEach((member) => {
            if (isSelected) nextSelection.delete(member);
            else nextSelection.add(member);
        });
        const nextParts = [...nextSelection];
        setSelectedParts(nextParts, nextSelection.has(part) ? part : nextParts.at(-1));
    },
    deleteSelected() {
        removeSelectedParts();
    },
    clearAll() {
        if (!clearCanvas()) return false;
        playBowlingSound();
        playTrashClearAnimation();
        return true;
    },
    undo() {
        undo();
    },
    redo() {
        redo();
    },
    historyState() {
        return { canUndo: history.length > 0, canRedo: redoHistory.length > 0 };
    },
    moveLayerFromTouch({ sourceIndex, sourceGroupId = "", targetIndex, targetGroupId = "", insertAbove }) {
        const visibleParts = isScoreRoundCanvasActive
            ? orderedParts().filter((part) => part.dataset.scoreRoundPart === "true")
            : orderedParts();
        const sourcePart = Number.isInteger(sourceIndex) ? visibleParts[sourceIndex] : null;
        const targetPart = Number.isInteger(targetIndex) ? visibleParts[targetIndex] : null;
        const sourceId = sourceGroupId || sourcePart?.dataset.groupId || "";
        const targetId = targetGroupId || targetPart?.dataset.groupId || "";
        if (!sourcePart && !sourceId) return;
        if (!targetPart && !targetId) return;

        if (sourcePart && sourceId && sourceId === targetId && !sourceGroupId) {
            if (isPartMovementLocked(sourcePart)) return;
            placePartWithinGroup(sourcePart, targetPart, Boolean(insertAbove));
            return;
        }

        const allParts = orderedParts();
        const sourceParts = sourceId
            ? allParts.filter((part) => part.dataset.groupId === sourceId)
            : [sourcePart];
        const targetParts = targetId
            ? allParts.filter((part) => part.dataset.groupId === targetId)
            : [targetPart];
        if (hasMovementLockedPart(sourceParts)) return;
        moveLayerBlock(sourceParts, targetParts, Boolean(insertAbove));
    },
    selectLayerFromTouch({ sourceIndex, sourceGroupId = "" }) {
        const visibleParts = isScoreRoundCanvasActive
            ? orderedParts().filter((part) => part.dataset.scoreRoundPart === "true")
            : orderedParts();
        if (sourceGroupId) {
            const groupParts = visibleParts.filter((part) => part.dataset.groupId === sourceGroupId);
            setSelectedParts(groupParts, groupParts.at(-1));
            return;
        }
        const part = Number.isInteger(sourceIndex) ? visibleParts[sourceIndex] : null;
        if (part) setSelectedParts([part], part, { expandGroups: false });
    },
    showPartMenu(part, clientX, clientY) {
        if (!part?.isConnected) return;
        showLayerContextMenu(new MouseEvent("contextmenu", {
            bubbles: true,
            cancelable: true,
            clientX,
            clientY,
        }), part);
    },
});
