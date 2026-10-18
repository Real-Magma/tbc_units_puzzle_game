(() => {
    // 平板沿用雙欄畫面，但也需要手機的手指拖曳、雙指縮放與平移邏輯。
    // 工具列是否顯示仍由 CSS 區分：只有窄螢幕手機顯示底部工具列。
    const touchLayout = window.matchMedia("(pointer: coarse)");
    // 部分手機瀏覽器與開發者工具不會把目前指標回報為 coarse；
    // 窄螢幕仍應建立手機工具列，否則畫面會完全沒有可用工具。
    const phoneLayout = window.matchMedia("(max-width: 700px)");
    const isAppleTablet = /iPad/.test(navigator.userAgent)
        || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    document.documentElement.classList.toggle("is-apple-tablet", isAppleTablet);
    let initialized = false;

    // Prevent browser-level zoom on touch devices. Canvas pinch zoom is handled
    // separately below with Pointer Events, so the game interaction remains intact.
    const preventViewportZoom = (event) => event.preventDefault();
    document.addEventListener("gesturestart", preventViewportZoom, { passive: false });
    document.addEventListener("gesturechange", preventViewportZoom, { passive: false });
    document.addEventListener("gestureend", preventViewportZoom, { passive: false });
    document.addEventListener("dblclick", (event) => {
        if (touchLayout.matches || isAppleTablet) event.preventDefault();
    }, { passive: false });

    function makeAction(icon, label, action, { persistentLabel = false } = {}) {
        const button = document.createElement("button");
        button.className = "mobile-action";
        button.type = "button";
        button.setAttribute("aria-label", label);
        button.title = label;
        button.innerHTML = `<i class="fa-solid ${icon}" aria-hidden="true"></i>${persistentLabel ? `<span class="icon-tooltip mobile-more-tooltip" aria-hidden="true">${label}</span>` : ""}`;
        button.addEventListener("click", action);
        return button;
    }

    function makeImportAction(label, action, { persistentLabel = false } = {}) {
        const control = document.createElement("label");
        control.className = "mobile-action file-import-action";
        control.htmlFor = "import-project-input";
        control.setAttribute("aria-label", label);
        control.title = label;
        control.innerHTML = `<i class="fa-solid fa-folder-open" aria-hidden="true"></i>${persistentLabel ? `<span class="icon-tooltip mobile-more-tooltip" aria-hidden="true">${label}</span>` : ""}`;
        control.addEventListener("click", action);
        return control;
    }

    function initializeMobileControls() {
        if (initialized || (!phoneLayout.matches && !touchLayout.matches && !isAppleTablet) || !window.tbcPuzzleMobile) return;
        initialized = true;

        const game = document.querySelector("#game");
        const canvas = document.querySelector("#canvas");
        const layersPanel = document.querySelector("#layers-panel");
        const api = window.tbcPuzzleMobile;
        const toolbar = document.createElement("nav");
        toolbar.className = "mobile-toolbar";
        toolbar.setAttribute("aria-label", "手機版工具列");
        const tabletHistoryControls = document.createElement("nav");
        tabletHistoryControls.className = "tablet-history-controls";
        tabletHistoryControls.setAttribute("aria-label", "平板版歷史紀錄工具");
        // 先放入 DOM；後續任一觸控功能失敗時，CSS 仍可保留工具列位置。
        game.append(toolbar, tabletHistoryControls);

        let multiSelectMode = false;
        let longPress = null;
        let pinch = null;
        let layerTouchDrag = null;
        const touchPoints = new Map();

        const cancelLongPress = (pointerId = null) => {
            if (!longPress || (pointerId !== null && longPress.pointerId !== pointerId)) return;
            window.clearTimeout(longPress.timer);
            longPress = null;
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
        const tabletUndoAction = makeAction("fa-arrow-rotate-left", "上一步", () => api.undo());
        const tabletRedoAction = makeAction("fa-arrow-rotate-right", "下一步", () => api.redo());
        tabletHistoryControls.append(tabletUndoAction, tabletRedoAction);
        toolbar.append(drawerButton, undoAction, redoAction, layersButton, multiSelectButton);
        const syncHistoryActions = (state) => {
            let nextState = state;
            if (!nextState) {
                try {
                    nextState = api.historyState();
                } catch {
                    nextState = { canUndo: false, canRedo: false };
                }
            }
            undoAction.disabled = !nextState.canUndo;
            redoAction.disabled = !nextState.canRedo;
            tabletUndoAction.disabled = !nextState.canUndo;
            tabletRedoAction.disabled = !nextState.canRedo;
        };

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
        toolbar.append(trashButton);

        const moreMenu = document.createElement("div");
        moreMenu.id = "mobile-more-menu";
        moreMenu.className = "mobile-more-menu";
        moreMenu.setAttribute("aria-label", "更多主畫面工具");
        const desktopTools = [
            ["#view-home-button", "fa-house", "回到原點"],
            ["#save-project-button", "fa-floppy-disk", "儲存圖層"],
            ["#import-project-button", "fa-folder-open", "匯入圖層"],
            ["#copy-canvas-image-button", "fa-copy", "複製主畫面"],
            ["#share-canvas-image-button", "fa-share-nodes", "分享主畫面"],
        ];
        let moreButton;
        const closeMoreMenu = () => {
            moreMenu.classList.remove("is-open");
            moreButton?.classList.remove("is-active");
            moreButton?.setAttribute("aria-expanded", "false");
        };
        desktopTools.forEach(([selector, icon, label]) => {
            const action = selector === "#import-project-button"
                ? makeImportAction(label, closeMoreMenu, { persistentLabel: true })
                : makeAction(icon, label, () => {
                closeMoreMenu();
                document.querySelector(selector)?.click();
            }, { persistentLabel: true });
            moreMenu.append(action);
        });
        moreButton = makeAction("fa-ellipsis", "更多工具", () => {
            const willOpen = !moreMenu.classList.contains("is-open");
            moreMenu.classList.toggle("is-open", willOpen);
            moreButton.classList.toggle("is-active", willOpen);
            moreButton.setAttribute("aria-expanded", String(willOpen));
        });
        moreButton.setAttribute("aria-controls", "mobile-more-menu");
        moreButton.setAttribute("aria-expanded", "false");
        const setMoreButtonScoreLock = (isLocked) => {
            moreButton.disabled = isLocked;
            moreButton.classList.toggle("is-score-locked", isLocked);
            if (isLocked) closeMoreMenu();
        };
        window.addEventListener("tbcPuzzleScoreRoundStateChange", (event) => {
            setMoreButtonScoreLock(Boolean(event.detail?.active));
        });
        setMoreButtonScoreLock(document.documentElement.classList.contains("is-score-round-active"));

        toolbar.append(moreMenu, moreButton);
        // 先讓使用者看得到整列工具；歷史紀錄更新失敗不應阻斷工具列出現。
        window.addEventListener("tbcPuzzleHistoryChange", (event) => syncHistoryActions(event.detail));
        syncHistoryActions();

        const touchPair = () => [...touchPoints.values()].slice(0, 2);
        const distanceBetween = ([first, second]) => Math.hypot(first.x - second.x, first.y - second.y);
        const centerBetween = ([first, second]) => ({ x: (first.x + second.x) / 2, y: (first.y + second.y) / 2 });
        canvas.addEventListener("pointerdown", (event) => {
            if (event.pointerType !== "touch") return;
            touchPoints.set(event.pointerId, { x: event.clientX, y: event.clientY });
            if (touchPoints.size < 2) return;
            cancelLongPress();
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
            if (event.pointerType !== "touch" || pinch) return;
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
        const canUseLayerDrag = (event) => ["touch", "pen", "mouse"].includes(event.pointerType);
        const layerDropAt = (clientX, clientY) => {
            const element = document.elementFromPoint(clientX, clientY);
            const row = element?.closest?.(".layer-row");
            const group = element?.closest?.(".layer-group");
            // Standalone rows do not have a .layer-group parent.  Treat them
            // as valid targets as well, otherwise most normal layers cannot
            // receive a mobile drop at all.
            if (!row && !group) return null;
            if (row && !layersPanel.contains(row)) return null;
            if (!row && group && !layersPanel.contains(group)) return null;
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
            const row = event.target.closest(".layer-row");
            if (!canUseLayerDrag(event) || event.target.closest("button")) return;
            // 收合按鈕只處理收合／展開。群組排序從群組中的任一物件開始，
            // 讓手勢與一般單物件拖曳一致。
            if (!row) return;
            const group = row.closest(".layer-group");
            if (row?.classList.contains("is-locked") || group?.querySelector(".layer-row.is-locked")) return;
            layerTouchDrag = {
                pointerId: event.pointerId,
                startX: event.clientX,
                startY: event.clientY,
                moved: false,
                source: row,
                sourceIndex: Number.parseInt(row.dataset.layerIndex, 10),
                sourceGroupId: "",
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
            if (!layersPanel.hasPointerCapture(event.pointerId)) layersPanel.setPointerCapture(event.pointerId);
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
        layersPanel.addEventListener("lostpointercapture", clearLayerTouchDrag);
    }

    // 先嘗試建立；若主程式尚未完成，收到就緒事件或頁面完成載入時會再試一次。
    initializeMobileControls();
    window.addEventListener("tbcPuzzleMobileReady", initializeMobileControls);
    window.addEventListener("load", initializeMobileControls, { once: true });
    touchLayout.addEventListener("change", initializeMobileControls);
    phoneLayout.addEventListener("change", initializeMobileControls);
})();
