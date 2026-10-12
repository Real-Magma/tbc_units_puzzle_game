(() => {
    const touchLayout = window.matchMedia("(max-width: 700px) and (pointer: coarse)");
    let initialized = false;

    function makeAction(icon, label, action) {
        const button = document.createElement("button");
        button.className = "mobile-action";
        button.type = "button";
        button.setAttribute("aria-label", label);
        button.title = label;
        button.innerHTML = `<i class="fa-solid ${icon}" aria-hidden="true"></i>`;
        button.addEventListener("click", action);
        return button;
    }

    function initializeMobileControls() {
        if (initialized || !touchLayout.matches || !window.tbcPuzzleMobile) return;
        initialized = true;

        const game = document.querySelector("#game");
        const canvas = document.querySelector("#canvas");
        const api = window.tbcPuzzleMobile;
        const toolbar = document.createElement("nav");
        toolbar.className = "mobile-toolbar";
        toolbar.setAttribute("aria-label", "手機版工具列");

        let panMode = false;
        let multiSelectMode = false;
        let activePan = null;
        let longPress = null;

        let drawerButton;
        const closeDrawer = () => {
            game.classList.remove("is-mobile-panel-open");
            drawerButton?.classList.remove("is-active");
            drawerButton?.setAttribute("aria-label", "開啟角色與部件");
        };
        drawerButton = makeAction("fa-cat", "開啟角色與部件", () => {
            const willOpen = !game.classList.contains("is-mobile-panel-open");
            game.classList.toggle("is-mobile-panel-open", willOpen);
            drawerButton.classList.toggle("is-active", willOpen);
            drawerButton.setAttribute("aria-label", willOpen ? "關閉角色與部件" : "開啟角色與部件");
        });

        const panButton = makeAction("fa-hand", "開啟畫布平移", () => {
            panMode = !panMode;
            panButton.classList.toggle("is-active", panMode);
            canvas.classList.toggle("is-mobile-pan-mode", panMode);
            panButton.setAttribute("aria-label", panMode ? "關閉畫布平移" : "開啟畫布平移");
        });

        const zoomAtCanvasCenter = (factor) => {
            const bounds = canvas.getBoundingClientRect();
            api.zoomCanvasAt(bounds.left + bounds.width / 2, bounds.top + bounds.height / 2, factor);
        };

        const layersButton = makeAction("fa-layer-group", "開啟圖層面板", () => {
            const willOpen = !canvas.classList.contains("is-mobile-layers-open");
            canvas.classList.toggle("is-mobile-layers-open", willOpen);
            layersButton.classList.toggle("is-active", willOpen);
            layersButton.setAttribute("aria-label", willOpen ? "關閉圖層面板" : "開啟圖層面板");
        });

        const multiSelectButton = makeAction("fa-object-group", "開啟多選物件", () => {
            multiSelectMode = !multiSelectMode;
            multiSelectButton.classList.toggle("is-active", multiSelectMode);
            multiSelectButton.setAttribute("aria-label", multiSelectMode ? "結束多選物件" : "開啟多選物件");
        });

        toolbar.append(
            drawerButton,
            panButton,
            makeAction("fa-minus", "縮小畫布", () => zoomAtCanvasCenter(0.82)),
            makeAction("fa-plus", "放大畫布", () => zoomAtCanvasCenter(1.22)),
            layersButton,
            multiSelectButton,
            makeAction("fa-trash-can", "刪除選取物件", () => api.deleteSelected()),
        );
        game.append(toolbar);

        canvas.addEventListener("pointerdown", (event) => {
            if (event.pointerType !== "touch") return;
            closeDrawer();

            if (!panMode) return;
            event.preventDefault();
            event.stopImmediatePropagation();
            activePan = { pointerId: event.pointerId, x: event.clientX, y: event.clientY };
            canvas.setPointerCapture(event.pointerId);
            canvas.classList.add("is-mobile-panning");
        }, true);

        canvas.addEventListener("pointermove", (event) => {
            if (!activePan || event.pointerId !== activePan.pointerId) return;
            event.preventDefault();
            api.panCanvasBy(event.clientX - activePan.x, event.clientY - activePan.y);
            activePan.x = event.clientX;
            activePan.y = event.clientY;
        }, true);

        const stopPan = (event) => {
            if (!activePan || event.pointerId !== activePan.pointerId) return;
            activePan = null;
            canvas.classList.remove("is-mobile-panning");
        };
        canvas.addEventListener("pointerup", stopPan, true);
        canvas.addEventListener("pointercancel", stopPan, true);

        canvas.addEventListener("pointerdown", (event) => {
            if (event.pointerType !== "touch" || panMode) return;
            const part = event.target.closest?.(".placed-part");
            if (!part) return;
            if (multiSelectMode) {
                event.preventDefault();
                event.stopImmediatePropagation();
                api.togglePartSelection(part);
                return;
            }
            const startX = event.clientX;
            const startY = event.clientY;
            const pointerId = event.pointerId;
            const cancelLongPress = () => {
                if (!longPress || longPress.pointerId !== pointerId) return;
                window.clearTimeout(longPress.timer);
                longPress = null;
            };
            longPress = {
                pointerId,
                timer: window.setTimeout(() => {
                    longPress = null;
                    api.showPartMenu(part, startX, startY);
                    navigator.vibrate?.(16);
                }, 550),
            };
            const move = (moveEvent) => {
                if (moveEvent.pointerId !== pointerId) return;
                if (Math.hypot(moveEvent.clientX - startX, moveEvent.clientY - startY) > 10) cancelLongPress();
            };
            const stop = (stopEvent) => {
                if (stopEvent.pointerId !== pointerId) return;
                cancelLongPress();
                canvas.removeEventListener("pointermove", move, true);
                canvas.removeEventListener("pointerup", stop, true);
                canvas.removeEventListener("pointercancel", stop, true);
            };
            canvas.addEventListener("pointermove", move, true);
            canvas.addEventListener("pointerup", stop, true);
            canvas.addEventListener("pointercancel", stop, true);
        }, true);
    }

    initializeMobileControls();
    touchLayout.addEventListener("change", initializeMobileControls);
})();
