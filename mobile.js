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
        const layersPanel = document.querySelector("#layers-panel");
        const api = window.tbcPuzzleMobile;
        const toolbar = document.createElement("nav");
        toolbar.className = "mobile-toolbar";
        toolbar.setAttribute("aria-label", "手機版工具列");

        let panMode = false;
        let multiSelectMode = false;
        let activePan = null;
        let longPress = null;
        let pinch = null;
        let layerTouchDrag = null;
        const touchPoints = new Map();

        const cancelLongPress = (pointerId = null) => {
            if (!longPress || (pointerId !== null && longPress.pointerId !== pointerId)) return;
            window.clearTimeout(longPress.timer);
            longPress = null;
        };
        const stopMobilePan = () => {
            activePan = null;
            canvas.classList.remove("is-mobile-panning");
        };

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

        const undoAction = makeAction("fa-arrow-rotate-left", "上一步", () => api.undo());
        const redoAction = makeAction("fa-arrow-rotate-right", "下一步", () => api.redo());
        const syncHistoryActions = (state = api.historyState()) => {
            undoAction.disabled = !state.canUndo;
            redoAction.disabled = !state.canRedo;
        };
        window.addEventListener("tbcPuzzleHistoryChange", (event) => syncHistoryActions(event.detail));
        syncHistoryActions();

        let trashHold = null;
        let skipTrashClick = false;
        const trashButton = makeAction("fa-trash-can", "刪除選取物件；長按清空全部", () => {
            if (skipTrashClick) {
                skipTrashClick = false;
                return;
            }
            api.deleteSelected();
        });
        const stopTrashHold = (event) => {
            if (!trashHold || event.pointerId !== trashHold.pointerId) return;
            window.clearTimeout(trashHold.timer);
            const completed = trashHold.completed;
            trashHold = null;
            trashButton.classList.remove("is-clearing");
            if (trashButton.hasPointerCapture(event.pointerId)) trashButton.releasePointerCapture(event.pointerId);
            skipTrashClick = event.type === "pointerup";
            if (!completed) api.deleteSelected();
        };
        trashButton.addEventListener("pointerdown", (event) => {
            if (event.pointerType !== "touch" || event.button !== 0) return;
            event.preventDefault();
            trashButton.setPointerCapture(event.pointerId);
            trashButton.classList.add("is-clearing");
            trashHold = {
                pointerId: event.pointerId,
                completed: false,
                timer: window.setTimeout(() => {
                    if (!trashHold) return;
                    trashHold.completed = api.clearAll();
                    navigator.vibrate?.(24);
                    trashButton.classList.remove("is-clearing");
                }, 800),
            };
        });
        trashButton.addEventListener("pointerup", stopTrashHold);
        trashButton.addEventListener("pointercancel", stopTrashHold);
        trashButton.addEventListener("lostpointercapture", stopTrashHold);

        toolbar.append(drawerButton, panButton, undoAction, redoAction, layersButton, multiSelectButton, trashButton);
        game.append(toolbar);

        const touchPair = () => [...touchPoints.values()].slice(0, 2);
        const distanceBetween = ([first, second]) => Math.hypot(first.x - second.x, first.y - second.y);
        const centerBetween = ([first, second]) => ({ x: (first.x + second.x) / 2, y: (first.y + second.y) / 2 });
        canvas.addEventListener("pointerdown", (event) => {
            if (event.pointerType !== "touch") return;
            touchPoints.set(event.pointerId, { x: event.clientX, y: event.clientY });
            if (touchPoints.size < 2) return;
            cancelLongPress();
            stopMobilePan();
            const pair = touchPair();
            pinch = {
                distance: Math.max(distanceBetween(pair), 1),
                center: centerBetween(pair),
            };
            canvas.classList.add("is-mobile-pinching");
            event.preventDefault();
            event.stopImmediatePropagation();
        }, true);
        canvas.addEventListener("pointermove", (event) => {
            if (!touchPoints.has(event.pointerId)) return;
            touchPoints.set(event.pointerId, { x: event.clientX, y: event.clientY });
            if (!pinch || touchPoints.size < 2) return;
            const pair = touchPair();
            const distance = Math.max(distanceBetween(pair), 1);
            const center = centerBetween(pair);
            api.panCanvasBy(center.x - pinch.center.x, center.y - pinch.center.y);
            api.zoomCanvasAt(center.x, center.y, distance / pinch.distance);
            pinch.distance = distance;
            pinch.center = center;
            event.preventDefault();
            event.stopImmediatePropagation();
        }, true);
        const finishTouchPoint = (event) => {
            touchPoints.delete(event.pointerId);
            if (touchPoints.size < 2) {
                pinch = null;
                canvas.classList.remove("is-mobile-pinching");
            }
        };
        canvas.addEventListener("pointerup", finishTouchPoint, true);
        canvas.addEventListener("pointercancel", finishTouchPoint, true);

        canvas.addEventListener("pointerdown", (event) => {
            if (event.pointerType !== "touch") return;
            closeDrawer();
            if (!panMode || pinch) return;
            event.preventDefault();
            event.stopImmediatePropagation();
            activePan = { pointerId: event.pointerId, x: event.clientX, y: event.clientY };
            canvas.setPointerCapture(event.pointerId);
            canvas.classList.add("is-mobile-panning");
        }, true);

        canvas.addEventListener("pointermove", (event) => {
            if (!activePan || event.pointerId !== activePan.pointerId || pinch) return;
            event.preventDefault();
            api.panCanvasBy(event.clientX - activePan.x, event.clientY - activePan.y);
            activePan.x = event.clientX;
            activePan.y = event.clientY;
        }, true);
        const stopPan = (event) => {
            if (!activePan || event.pointerId !== activePan.pointerId) return;
            stopMobilePan();
        };
        canvas.addEventListener("pointerup", stopPan, true);
        canvas.addEventListener("pointercancel", stopPan, true);

        canvas.addEventListener("pointerdown", (event) => {
            if (event.pointerType !== "touch" || panMode || pinch) return;
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
                if (Math.hypot(moveEvent.clientX - startX, moveEvent.clientY - startY) > 10) cancelLongPress(pointerId);
            };
            const stop = (stopEvent) => {
                if (stopEvent.pointerId !== pointerId) return;
                cancelLongPress(pointerId);
                canvas.removeEventListener("pointermove", move, true);
                canvas.removeEventListener("pointerup", stop, true);
                canvas.removeEventListener("pointercancel", stop, true);
            };
            canvas.addEventListener("pointermove", move, true);
            canvas.addEventListener("pointerup", stop, true);
            canvas.addEventListener("pointercancel", stop, true);
        }, true);

        const clearLayerTouchDrag = () => {
            if (!layerTouchDrag) return;
            layerTouchDrag.target?.classList.remove("is-drop-target");
            layerTouchDrag.source?.classList.remove("is-dragging");
            layerTouchDrag = null;
        };
        const layerDropAt = (clientX, clientY) => {
            const element = document.elementFromPoint(clientX, clientY);
            const row = element?.closest?.(".layer-row");
            const group = element?.closest?.(".layer-group");
            if (!group || !layersPanel.contains(group)) return null;
            const target = row ?? group;
            const bounds = target.getBoundingClientRect();
            return {
                target,
                targetIndex: row ? Number.parseInt(row.dataset.layerIndex, 10) : null,
                targetGroupId: row ? "" : (group.dataset.layerGroupId ?? ""),
                insertAbove: clientY <= bounds.top + bounds.height / 2,
            };
        };
        layersPanel.addEventListener("pointerdown", (event) => {
            if (event.pointerType !== "touch" || event.target.closest("button")) return;
            const row = event.target.closest(".layer-row");
            const groupHeader = event.target.closest(".layer-group-header");
            const group = groupHeader?.closest(".layer-group") ?? row?.closest(".layer-group");
            if (!row && !groupHeader) return;
            layerTouchDrag = {
                pointerId: event.pointerId,
                startX: event.clientX,
                startY: event.clientY,
                moved: false,
                source: row ?? group,
                sourceIndex: row ? Number.parseInt(row.dataset.layerIndex, 10) : null,
                sourceGroupId: groupHeader ? (group?.dataset.layerGroupId ?? "") : "",
                target: null,
            };
            layersPanel.setPointerCapture(event.pointerId);
            event.preventDefault();
            event.stopImmediatePropagation();
        }, true);
        layersPanel.addEventListener("pointermove", (event) => {
            if (!layerTouchDrag || event.pointerId !== layerTouchDrag.pointerId) return;
            if (!layerTouchDrag.moved && Math.hypot(event.clientX - layerTouchDrag.startX, event.clientY - layerTouchDrag.startY) < 10) return;
            layerTouchDrag.moved = true;
            event.preventDefault();
            event.stopImmediatePropagation();
            const nextTarget = layerDropAt(event.clientX, event.clientY);
            if (layerTouchDrag.target && layerTouchDrag.target !== nextTarget?.target) layerTouchDrag.target.classList.remove("is-drop-target");
            layerTouchDrag.target = nextTarget?.target ?? null;
            layerTouchDrag.drop = nextTarget;
            layerTouchDrag.target?.classList.add("is-drop-target");
            layerTouchDrag.source.classList.add("is-dragging");
        }, true);
        const stopLayerTouchDrag = (event) => {
            if (!layerTouchDrag || event.pointerId !== layerTouchDrag.pointerId) return;
            const drag = layerTouchDrag;
            const drop = drag.moved ? (layerDropAt(event.clientX, event.clientY) ?? drag.drop) : null;
            if (drag.moved && drop) {
                api.moveLayerFromTouch({
                    sourceIndex: drag.sourceIndex,
                    sourceGroupId: drag.sourceGroupId,
                    targetIndex: drop.targetIndex,
                    targetGroupId: drop.targetGroupId,
                    insertAbove: drop.insertAbove,
                });
                layersPanel.addEventListener("click", (clickEvent) => {
                    clickEvent.preventDefault();
                    clickEvent.stopImmediatePropagation();
                }, { capture: true, once: true });
            } else if (!drag.moved) {
                api.selectLayerFromTouch({
                    sourceIndex: drag.sourceIndex,
                    sourceGroupId: drag.sourceGroupId,
                });
            }
            event.preventDefault();
            event.stopImmediatePropagation();
            if (layersPanel.hasPointerCapture(event.pointerId)) layersPanel.releasePointerCapture(event.pointerId);
            clearLayerTouchDrag();
        };
        layersPanel.addEventListener("pointerup", stopLayerTouchDrag, true);
        layersPanel.addEventListener("pointercancel", stopLayerTouchDrag, true);
    }

    initializeMobileControls();
    touchLayout.addEventListener("change", initializeMobileControls);
})();
