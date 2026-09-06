import {
  PolyMod,
} from "https://cdn.polymodloader.com/cb/PolyTrackMods/PolyModLoader/0.6.2/PolyTypes.js";

class MobileSupportMod extends PolyMod {
  postInit = () => {
    const STORAGE_KEY = "mobile-support-mod-layouts-v6";
    const DEFAULT_SIZE = 1;
    const DEFAULT_OPACITY = 0.6;

    let currentSize = DEFAULT_SIZE;
    let currentOpacity = DEFAULT_OPACITY;
    let currentLayout = "default";

    let editingLayout = false;
    let editingPosition = false;
    let activeMenu = null;
    let closingMenu = null;
    let editMobileButton = null;
    let positionSnapshot = null;
    let menuStyle = null;
    let observerPaused = false;

    let layouts = {
      slot1: null,
      slot2: null,
    };

    const loadLayouts = () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (!saved) return;

        const parsed = JSON.parse(saved);

        const readLayout = (layout) => {
          if (!layout) return null;

          return {
            size: Math.max(
              0.75,
              Math.min(1.25, Number(layout.size) || DEFAULT_SIZE)
            ),
            opacity: Math.max(
              0.1,
              Math.min(1, Number(layout.opacity) || DEFAULT_OPACITY)
            ),
            positions: Array.isArray(layout.positions)
              ? layout.positions
              : null,
          };
        };

        layouts = {
          slot1: readLayout(parsed?.slot1),
          slot2: readLayout(parsed?.slot2),
        };
      } catch {
        layouts = { slot1: null, slot2: null };
      }
    };

    const saveLayouts = () => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(layouts));
      } catch {}
    };

    const getTouchControls = () =>
      document.querySelector(".touch-controls-ui");

    const getControls = () => {
      const root = getTouchControls();
      if (!root) return [];

      return [
        ...root.querySelectorAll(":scope > button, :scope > div > div"),
      ];
    };

    const ensureMenuStyle = () => {
      if (menuStyle && menuStyle.isConnected) return;

      menuStyle = document.createElement("style");
      menuStyle.id = "mobile-support-menu-style";
      menuStyle.textContent = `
        .mobile-support-menu {
          position: fixed;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          width: min(420px, 85vw);
          max-height: 90vh;
          overflow-y: auto;
          padding: 22px;
          box-sizing: border-box;
          background: #212b58;
          border-radius: 12px;
          z-index: 999999;
          color: white;
          font-family: ForcedSquare, Arial, sans-serif !important;
          font-style: italic !important;
          font-weight: normal !important;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.45);
          user-select: none;
        }

        .mobile-support-menu * {
          font-family: ForcedSquare, Arial, sans-serif !important;
          font-style: italic !important;
          font-weight: normal !important;
        }

        .mobile-support-fade-in {
          animation: mobile-support-fade-in 0.25s ease-out forwards;
        }

        .mobile-support-fade-out {
          animation: mobile-support-fade-out 0.25s ease-in forwards;
        }

        @keyframes mobile-support-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes mobile-support-fade-out {
          from { opacity: 1; }
          to { opacity: 0; }
        }

        .mobile-support-title {
          font-size: 24px;
          margin-bottom: 18px;
          text-align: center;
        }

        .mobile-support-layouts {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .mobile-support-layout-row {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto auto;
          gap: 8px;
          align-items: center;
        }

        .mobile-support-layout-name {
          font-size: 24px;
          text-align: left;
          color: white;
          pointer-events: none;
        }

        .mobile-support-selected {
          background-color: #33477f !important;
        }

        .mobile-support-edit-section {
          margin-bottom: 18px;
        }

        .mobile-support-slider {
          margin-bottom: 18px;
        }

        .mobile-support-slider-label {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
          font-size: 24px;
        }

        .mobile-support-slider-value {
          opacity: 0.8;
        }

        .mobile-support-slider-track {
          position: relative;
          width: 100%;
          height: 14px;
          background: #141c3a;
          touch-action: none;
          user-select: none;
        }

        .mobile-support-slider-fill {
          position: absolute;
          left: 0;
          top: 0;
          height: 100%;
          background: #33477f;
          pointer-events: none;
        }

        .mobile-support-slider-knob {
          position: absolute;
          top: 50%;
          width: 32px;
          height: 32px;
          transform: translate(-50%, -50%);
          background: white;
          border: 4px solid #212b58;
          box-sizing: border-box;
          pointer-events: none;
        }

        .mobile-support-position-button,
        .mobile-support-save-layout,
        .mobile-support-close {
          width: 100%;
          font-size: 24px !important;
        }

        .mobile-support-position-button {
          margin-top: 4px;
        }

        .mobile-support-save-layout {
          margin-top: 10px;
        }

        .mobile-support-close {
          margin-top: 18px;
        }

        .mobile-support-position-buttons {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          position: fixed;
          left: 50%;
          bottom: 18px;
          transform: translateX(-50%);
          z-index: 999999;
        }

        .mobile-support-position-buttons .button {
          white-space: nowrap;
          font-size: 24px !important;
        }

        .mobile-support-position-mode {
          touch-action: none !important;
        }
      `;
      document.head.appendChild(menuStyle);
    };

    const disableGameplayControls = () => {
      const root = getTouchControls();
      if (!root) return;
      root.style.pointerEvents = "none";
    };

    const enableGameplayControls = () => {
      const root = getTouchControls();
      if (!root) return;
      root.style.pointerEvents = "";
    };

    const applySettings = () => {
      const size = Math.max(
        0.75,
        Math.min(1.25, Number(currentSize) || DEFAULT_SIZE)
      );

      const opacity = Math.max(
        0.1,
        Math.min(1, Number(currentOpacity) || DEFAULT_OPACITY)
      );

      const finalSize = 160 * size;

      getControls().forEach((control) => {
        control.style.width = `${finalSize}px`;
        control.style.height = `${finalSize}px`;
        control.style.opacity = String(opacity);
      });

      const reset = document.querySelector(
        ".touch-controls-ui > .reset"
      );

      if (reset) {
        reset.style.backgroundSize = `${32 * size}px`;
        reset.style.backgroundPosition = "center";
      }
    };

    const restoreDefault = () => {
      currentSize = DEFAULT_SIZE;
      currentOpacity = DEFAULT_OPACITY;

      getControls().forEach((control) => {
        control.style.width = "";
        control.style.height = "";
        control.style.opacity = "";
        control.style.position = "";
        control.style.left = "";
        control.style.top = "";
        control.style.right = "";
        control.style.bottom = "";
        control.style.margin = "";
        control.style.outline = "";
        control.style.cursor = "";
        control.style.backgroundSize = "";
        control.style.backgroundPosition = "";
      });
    };

    const getControlPositions = () =>
      getControls().map((control) => {
        const rect = control.getBoundingClientRect();

        return {
          left: rect.left / window.innerWidth,
          top: rect.top / window.innerHeight,
        };
      });

    const applyPositions = (positions) => {
      if (!Array.isArray(positions)) return;

      getControls().forEach((control, index) => {
        const position = positions[index];

        if (!position) return;

        control.style.position = "fixed";
        control.style.left = `${position.left * 100}vw`;
        control.style.top = `${position.top * 100}vh`;
        control.style.right = "auto";
        control.style.bottom = "auto";
        control.style.margin = "0";
      });
    };

    const savePositionSnapshot = () => {
      positionSnapshot = getControlPositions();
    };

    const restorePositionSnapshot = () => {
      if (positionSnapshot) {
        applyPositions(positionSnapshot);
      }
    };

    const checkPositionValidity = () => {
      const controls = getControls();

      const rectangles = controls.map((control) =>
        control.getBoundingClientRect()
      );

      let valid = true;

      controls.forEach((control, index) => {
        const rect = rectangles[index];

        let invalid =
          rect.left < 0 ||
          rect.top < 0 ||
          rect.right > window.innerWidth ||
          rect.bottom > window.innerHeight;

        for (
          let otherIndex = 0;
          otherIndex < rectangles.length;
          otherIndex++
        ) {
          if (otherIndex === index) continue;

          const other = rectangles[otherIndex];

          const overlapWidth =
            Math.min(rect.right, other.right) -
            Math.max(rect.left, other.left);

          const overlapHeight =
            Math.min(rect.bottom, other.bottom) -
            Math.max(rect.top, other.top);

          if (overlapWidth > 1 && overlapHeight > 1) {
            invalid = true;
            break;
          }
        }

        control.style.outline = invalid
          ? "3px dotted red"
          : "3px dotted white";

        control.style.cursor = "move";

        if (invalid) {
          valid = false;
        }
      });

      return valid;
    };

    const stopGameplayTouch = (event) => {
      if (!editingPosition) return;

      event.preventDefault();
      event.stopPropagation();
    };

    const attachPositionTouchBlocker = () => {
      const root = getTouchControls();

      if (
        !root ||
        root.dataset.mobileSupportTouchBlocker
      ) {
        return;
      }

      root.dataset.mobileSupportTouchBlocker = "true";

      for (const type of [
        "touchstart",
        "touchmove",
        "touchend",
        "touchcancel",
      ]) {
        root.addEventListener(
          type,
          stopGameplayTouch,
          {
            capture: true,
            passive: false,
          }
        );
      }
    };

    const setupPositionDragging = () => {
      getControls().forEach((control) => {
        if (control.dataset.mobileSupportDragging) {
          return;
        }

        control.dataset.mobileSupportDragging = "true";

        let dragging = false;
        let offsetX = 0;
        let offsetY = 0;

        control.addEventListener(
          "pointerdown",
          (event) => {
            if (!editingPosition) return;

            event.preventDefault();
            event.stopPropagation();

            dragging = true;

            const rect =
              control.getBoundingClientRect();

            offsetX =
              event.clientX - rect.left;

            offsetY =
              event.clientY - rect.top;

            control.setPointerCapture?.(
              event.pointerId
            );

            checkPositionValidity();
          }
        );

        control.addEventListener(
          "pointermove",
          (event) => {
            if (
              !dragging ||
              !editingPosition
            ) {
              return;
            }

            event.preventDefault();
            event.stopPropagation();

            control.style.position = "fixed";

            control.style.left =
              `${event.clientX - offsetX}px`;

            control.style.top =
              `${event.clientY - offsetY}px`;

            control.style.right = "auto";
            control.style.bottom = "auto";
            control.style.margin = "0";

            checkPositionValidity();
          }
        );

        const finishDrag = (event) => {
          if (!dragging) return;

          event.preventDefault?.();
          event.stopPropagation?.();

          dragging = false;

          try {
            control.releasePointerCapture?.(
              event.pointerId
            );
          } catch {}

          checkPositionValidity();
        };

        control.addEventListener(
          "pointerup",
          finishDrag
        );

        control.addEventListener(
          "pointercancel",
          finishDrag
        );
      });
    };

    const createSlider = (
      parent,
      labelText,
      min,
      max,
      value,
      step,
      onChange
    ) => {
      const wrapper =
        document.createElement("div");

      wrapper.className =
        "mobile-support-slider";

      const label =
        document.createElement("div");

      label.className =
        "mobile-support-slider-label";

      const labelName =
        document.createElement("span");

      labelName.textContent = labelText;

      const valueText =
        document.createElement("span");

      valueText.className =
        "mobile-support-slider-value";

      label.appendChild(labelName);
      label.appendChild(valueText);

      const track =
        document.createElement("div");

      track.className =
        "mobile-support-slider-track";

      const fill =
        document.createElement("div");

      fill.className =
        "mobile-support-slider-fill";

      const knob =
        document.createElement("div");

      knob.className =
        "mobile-support-slider-knob";

      track.appendChild(fill);
      track.appendChild(knob);

      wrapper.appendChild(label);
      wrapper.appendChild(track);

      parent.appendChild(wrapper);

      let dragging = false;

      const updateVisual = (newValue) => {
        const percent =
          ((newValue - min) /
            (max - min)) *
          100;

        fill.style.width =
          `${percent}%`;

        knob.style.left =
          `${percent}%`;

        valueText.textContent =
          `${Math.round(
            newValue * 100
          )}%`;
      };

      const updateFromPointer = (
        clientX
      ) => {
        const rect =
          track.getBoundingClientRect();

        let ratio =
          (clientX - rect.left) /
          rect.width;

        ratio =
          Math.max(
            0,
            Math.min(1, ratio)
          );

        let newValue =
          min +
          ratio *
            (max - min);

        newValue =
          Math.round(
            newValue / step
          ) * step;

        newValue =
          Math.max(
            min,
            Math.min(
              max,
              newValue
            )
          );

        updateVisual(newValue);
        onChange(newValue);
      };

      track.addEventListener(
        "pointerdown",
        (event) => {
          if (!editingLayout) return;

          event.preventDefault();
          event.stopPropagation();

          dragging = true;

          track.setPointerCapture?.(
            event.pointerId
          );

          updateFromPointer(
            event.clientX
          );
        }
      );

      track.addEventListener(
        "pointermove",
        (event) => {
          if (
            !editingLayout ||
            !dragging
          ) {
            return;
          }

          event.preventDefault();
          event.stopPropagation();

          updateFromPointer(
            event.clientX
          );
        }
      );

      const finishSlider = (
        event
      ) => {
        if (!dragging) return;

        event.preventDefault?.();
        event.stopPropagation?.();

        dragging = false;

        try {
          track.releasePointerCapture?.(
            event.pointerId
          );
        } catch {}
      };

      track.addEventListener(
        "pointerup",
        finishSlider
      );

      track.addEventListener(
        "pointercancel",
        finishSlider
      );

      const update = (
        newValue
      ) => {
        updateVisual(newValue);
      };

      update(value);

      return update;
    };

    const fadeRemove = (
      menu,
      callback
    ) => {
      if (!menu) {
        callback?.();
        return;
      }

      menu.style.pointerEvents =
        "none";

      menu.classList.remove(
        "mobile-support-fade-in"
      );

      menu.classList.add(
        "mobile-support-fade-out"
      );

      setTimeout(() => {
        if (menu.parentNode) {
          menu.remove();
        }

        if (
          closingMenu === menu
        ) {
          closingMenu = null;
        }

        callback?.();
      }, 250);
    };

    const closeControlsMenu = () => {
      if (!activeMenu) return;

      const menu = activeMenu;

      activeMenu = null;
      editingLayout = false;

      enableGameplayControls();

      closingMenu = menu;

      fadeRemove(menu);
    };

    const addMenuEventBlockers = (
      menu
    ) => {
      const block = (event) => {
        if (
          activeMenu !== menu
        ) {
          return;
        }

        event.stopPropagation();
      };

      for (const type of [
        "touchstart",
        "touchmove",
        "touchend",
        "touchcancel",
        "pointerdown",
        "pointermove",
        "pointerup",
        "pointercancel",
      ]) {
        menu.addEventListener(
          type,
          block,
          {
            capture: true,
            passive: false,
          }
        );
      }
    };

    const openLayoutEditor = () => {
      if (
        activeMenu ||
        editingPosition
      ) {
        return;
      }

      if (closingMenu) {
        closingMenu.remove();
        closingMenu = null;
      }

      ensureMenuStyle();

      const menu =
        document.createElement("div");

      menu.className =
        "mobile-support-menu mobile-support-fade-in";

      activeMenu = menu;
      editingLayout = true;

      disableGameplayControls();

      const title =
        document.createElement("div");

      title.className =
        "mobile-support-title";

      title.textContent =
        "Edit Mobile";

      menu.appendChild(title);

      const sliderSection =
        document.createElement("div");

      sliderSection.className =
        "mobile-support-edit-section";

      const sizeSlider =
        createSlider(
          sliderSection,
          "Size",
          0.75,
          1.25,
          currentSize,
          0.01,
          (value) => {
            if (!editingLayout) {
              return;
            }

            currentSize = value;

            applySettings();
          }
        );

      const opacitySlider =
        createSlider(
          sliderSection,
          "Opacity",
          0.1,
          1,
          currentOpacity,
          0.01,
          (value) => {
            if (!editingLayout) {
              return;
            }

            currentOpacity = value;

            applySettings();
          }
        );

      menu.appendChild(
        sliderSection
      );

      const positionButton =
        document.createElement("button");

      positionButton.className =
        "button mobile-support-position-button";

      positionButton.textContent =
        "Press to Edit Positioning";

      positionButton.addEventListener(
        "click",
        enterPositionEditing
      );

      menu.appendChild(
        positionButton
      );

      const saveLayoutButton =
        document.createElement("button");

      saveLayoutButton.className =
        "button mobile-support-save-layout";

      saveLayoutButton.textContent =
        "Save Layout";

      saveLayoutButton.addEventListener(
        "click",
        () => {
          if (
            currentLayout ===
              "default" ||
            !layouts[currentLayout]
          ) {
            return;
          }

          layouts[currentLayout] = {
            size: currentSize,
            opacity: currentOpacity,
            positions:
              layouts[currentLayout]
                .positions ||
              null,
          };

          saveLayouts();

          editingLayout = false;

          enableGameplayControls();

          const oldMenu =
            activeMenu;

          activeMenu = null;

          fadeRemove(
            oldMenu,
            openLayoutList
          );
        }
      );

      menu.appendChild(
        saveLayoutButton
      );

      addMenuEventBlockers(menu);

      document.body.appendChild(
        menu
      );

      sizeSlider(currentSize);
      opacitySlider(currentOpacity);

      if (
        currentLayout !==
          "default" &&
        layouts[currentLayout]
      ) {
        applySettings();

        if (
          layouts[currentLayout]
            .positions
        ) {
          applyPositions(
            layouts[currentLayout]
              .positions
          );
        }
      }
    };

    const openLayoutList = () => {
      if (
        activeMenu ||
        editingPosition
      ) {
        return;
      }

      if (closingMenu) {
        closingMenu.remove();
        closingMenu = null;
      }

      ensureMenuStyle();

      const menu =
        document.createElement("div");

      menu.className =
        "mobile-support-menu mobile-support-fade-in";

      activeMenu = menu;
      editingLayout = false;

      disableGameplayControls();

      const title =
        document.createElement("div");

      title.className =
        "mobile-support-title";

      title.textContent =
        "Edit Mobile";

      menu.appendChild(title);

      const layoutsContainer =
        document.createElement("div");

      layoutsContainer.className =
        "mobile-support-layouts";

      const createLayoutRow = (
        name,
        displayName,
        canEdit
      ) => {
        const row =
          document.createElement("div");

        row.className =
          "mobile-support-layout-row";

        const nameText =
          document.createElement("div");

        nameText.className =
          "mobile-support-layout-name";

        nameText.textContent =
          displayName;

        row.appendChild(
          nameText
        );

        const useButton =
          document.createElement(
            "button"
          );

        useButton.className =
          "button";

        useButton.textContent =
          "Use";

        if (
          name === currentLayout
        ) {
          useButton.classList.add(
            "mobile-support-selected"
          );
        }

        if (
          name !== "default" &&
          !layouts[name]
        ) {
          useButton.disabled =
            true;
        }

        useButton.addEventListener(
          "click",
          () => {
            if (
              name !== "default" &&
              !layouts[name]
            ) {
              return;
            }

            currentLayout = name;
            editingLayout = false;

            applyLayout(name);

            closeControlsMenu();
          }
        );

        row.appendChild(
          useButton
        );

        if (canEdit) {
          const editButton =
            document.createElement(
              "button"
            );

          editButton.className =
            "button";

          editButton.textContent =
            "Edit";

          editButton.addEventListener(
            "click",
            () => {
              if (!layouts[name]) {
                layouts[name] = {
                  size:
                    DEFAULT_SIZE,
                  opacity:
                    DEFAULT_OPACITY,
                  positions:
                    getControlPositions(),
                };

                saveLayouts();
              }

              currentLayout =
                name;

              currentSize =
                Math.max(
                  0.75,
                  Math.min(
                    1.25,
                    Number(
                      layouts[name]
                        .size
                    ) ||
                      DEFAULT_SIZE
                  )
                );

              currentOpacity =
                Math.max(
                  0.1,
                  Math.min(
                    1,
                    Number(
                      layouts[name]
                        .opacity
                    ) ||
                      DEFAULT_OPACITY
                  )
                );

              editingLayout =
                true;

              applySettings();

              if (
                layouts[name]
                  .positions
              ) {
                applyPositions(
                  layouts[name]
                    .positions
                );
              }

              const oldMenu =
                activeMenu;

              activeMenu = null;
              editingLayout = false;

              fadeRemove(
                oldMenu,
                openLayoutEditor
              );
            }
          );

          row.appendChild(
            editButton
          );
        }

        return row;
      };

      layoutsContainer.appendChild(
        createLayoutRow(
          "default",
          "Default Layout",
          false
        )
      );

      layoutsContainer.appendChild(
        createLayoutRow(
          "slot1",
          "Custom Layout 1",
          true
        )
      );

      layoutsContainer.appendChild(
        createLayoutRow(
          "slot2",
          "Custom Layout 2",
          true
        )
      );

      menu.appendChild(
        layoutsContainer
      );

      const closeButton =
        document.createElement(
          "button"
        );

      closeButton.className =
        "button mobile-support-close";

      closeButton.textContent =
        "Close";

      closeButton.addEventListener(
        "click",
        closeControlsMenu
      );

      menu.appendChild(
        closeButton
      );

      addMenuEventBlockers(menu);

      document.body.appendChild(
        menu
      );
    };

    const applyLayout = (
      name
    ) => {
      if (name === "default") {
        restoreDefault();
        return;
      }

      const layout =
        layouts[name];

      if (!layout) {
        restoreDefault();
        return;
      }

      currentSize =
        Math.max(
          0.75,
          Math.min(
            1.25,
            Number(
              layout.size
            ) ||
              DEFAULT_SIZE
          )
        );

      currentOpacity =
        Math.max(
          0.1,
          Math.min(
            1,
            Number(
              layout.opacity
            ) ||
              DEFAULT_OPACITY
          )
        );

      applySettings();

      if (layout.positions) {
        applyPositions(
          layout.positions
        );
      }
    };

    const enterPositionEditing =
      () => {
        if (
          currentLayout ===
            "default" ||
          !layouts[currentLayout]
        ) {
          return;
        }

        savePositionSnapshot();

        editingLayout = false;
        editingPosition = true;

        const menu =
          activeMenu;

        activeMenu = null;

        if (menu) {
          fadeRemove(menu);
        }

        // The controls must remain draggable.
        enableGameplayControls();

        const root =
          getTouchControls();

        if (root) {
          root.classList.add(
            "mobile-support-position-mode"
          );
        }

        attachPositionTouchBlocker();
        setupPositionDragging();

        if (editMobileButton) {
          editMobileButton.textContent =
            "Save Positioning";
        }

        requestAnimationFrame(
          () => {
            checkPositionValidity();
          }
        );
      };

    const clearPositionEditingVisuals =
      () => {
        getControls().forEach(
          (control) => {
            control.style.outline =
              "";

            control.style.cursor =
              "";
          }
        );

        const root =
          getTouchControls();

        if (root) {
          root.classList.remove(
            "mobile-support-position-mode"
          );
        }
      };

    const finishPositionEditing =
      () => {
        editingPosition = false;

        clearPositionEditingVisuals();

        positionSnapshot = null;

        if (editMobileButton) {
          editMobileButton.textContent =
            "Edit Mobile";
        }
      };

    const saveCurrentPositioning =
      () => {
        if (
          !editingPosition ||
          currentLayout ===
            "default" ||
          !layouts[currentLayout]
        ) {
          return;
        }

        if (
          !checkPositionValidity()
        ) {
          return;
        }

        layouts[currentLayout]
          .positions =
          getControlPositions();

        saveLayouts();

        finishPositionEditing();

        openLayoutEditor();
      };

    const returnToMenu = () => {
      if (!editingPosition) {
        return;
      }

      restorePositionSnapshot();

      finishPositionEditing();

      openLayoutEditor();
    };

    const createEditButton =
      () => {
        const toolbar =
          document.querySelector(
            ".game-toolbar-ui > .button-container"
          );

        if (!toolbar) return;

        let button =
          toolbar.querySelector(
            ".mobile-support-edit-button"
          );

        if (button) {
          editMobileButton =
            button;

          button.textContent =
            editingPosition
              ? "Save Positioning"
              : "Edit Mobile";

          return;
        }

        const watchButton =
          [
            ...toolbar.children,
          ].find(
            (child) =>
              child.textContent
                ?.trim() ===
              "Watch"
          );

        if (!watchButton) {
          return;
        }

        button =
          document.createElement(
            "button"
          );

        button.className =
          "button mobile-support-edit-button";

        button.textContent =
          "Edit Mobile";

        button.addEventListener(
          "click",
          () => {
            if (
              editingPosition
            ) {
              saveCurrentPositioning();
            } else {
              openLayoutList();
            }
          }
        );

        watchButton.insertAdjacentElement(
          "afterend",
          button
        );

        editMobileButton =
          button;
      };

    loadLayouts();
    ensureMenuStyle();

    let lastControls = [];

    const observer =
      new MutationObserver(
        () => {
          if (observerPaused) {
            return;
          }

          const controlsRoot =
            getTouchControls();

          if (!controlsRoot) {
            lastControls = [];

            if (editingPosition) {
              editingPosition =
                false;

              positionSnapshot =
                null;

              clearPositionEditingVisuals();
            }

            if (activeMenu) {
              closeControlsMenu();
            }

            return;
          }

          createEditButton();
          setupPositionDragging();
          attachPositionTouchBlocker();

          const controls =
            getControls();

          const controlsChanged =
            controls.length !==
              lastControls.length ||
            controls.some(
              (control, index) =>
                control !==
                lastControls[index]
            );

          if (controlsChanged) {
            lastControls =
              controls.slice();

            if (
              !editingPosition &&
              !activeMenu
            ) {
              if (
                currentLayout ===
                "default"
              ) {
                restoreDefault();
              } else {
                applyLayout(
                  currentLayout
                );
              }
            }
          }

          if (editingPosition) {
            checkPositionValidity();
          }
        }
      );

    observer.observe(
      document.body,
      {
        childList: true,
        subtree: true,
      }
    );

    document.addEventListener(
      "touchcancel",
      () => {
        if (editingPosition) {
          return;
        }

        try {
          document.dispatchEvent(
            new TouchEvent(
              "touchend",
              {
                bubbles: true,
                cancelable: true,
              }
            )
          );
        } catch {}
      },
      true
    );

    window.addEventListener(
      "resize",
      () => {
        if (editingPosition) {
          checkPositionValidity();
        }
      }
    );

    createEditButton();
  };
}

export let polyMod =
  new MobileSupportMod();
