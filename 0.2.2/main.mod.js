import {
  PolyMod,
} from "https://cdn.polymodloader.com/cb/PolyTrackMods/PolyModLoader/0.6.2/PolyTypes.js";

class MobileSupportMod extends PolyMod {
  postInit = () => {
    const STORAGE_KEY =
      "mobile-support-mod-layouts-v5";

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

    let layouts = {
      slot1: null,
      slot2: null,
    };

    /* -------------------------------------------------- */
    /* STORAGE                                             */
    /* -------------------------------------------------- */

    const loadLayouts = () => {
      try {
        const saved =
          localStorage.getItem(STORAGE_KEY);

        if (!saved) return;

        const parsed = JSON.parse(saved);

        layouts = {
          slot1: parsed?.slot1
            ? {
                size:
                  Number(parsed.slot1.size) ||
                  DEFAULT_SIZE,

                opacity:
                  Number(parsed.slot1.opacity) ||
                  DEFAULT_OPACITY,

                positions:
                  parsed.slot1.positions ||
                  null,
              }
            : null,

          slot2: parsed?.slot2
            ? {
                size:
                  Number(parsed.slot2.size) ||
                  DEFAULT_SIZE,

                opacity:
                  Number(parsed.slot2.opacity) ||
                  DEFAULT_OPACITY,

                positions:
                  parsed.slot2.positions ||
                  null,
              }
            : null,
        };
      } catch {
        layouts = {
          slot1: null,
          slot2: null,
        };
      }
    };

    const saveLayouts = () => {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(layouts)
      );
    };

    /* -------------------------------------------------- */
    /* CONTROLS                                            */
    /* -------------------------------------------------- */

    const getTouchControls = () =>
      document.querySelector(
        ".touch-controls-ui"
      );

    const getControls = () => {
      const root =
        getTouchControls();

      if (!root) return [];

      return [
        ...root.querySelectorAll(
          ":scope > button, :scope > div > div"
        ),
      ];
    };

    const disableGameplayControls = () => {
      const root =
        getTouchControls();

      if (!root) return;

      root.classList.add(
        "mobile-support-disabled"
      );
    };

    const enableGameplayControls = () => {
      const root =
        getTouchControls();

      if (!root) return;

      root.classList.remove(
        "mobile-support-disabled"
      );
    };

    /* -------------------------------------------------- */
    /* SIZE / OPACITY                                      */
    /* -------------------------------------------------- */

    const restoreDefault = () => {
      currentSize =
        DEFAULT_SIZE;

      currentOpacity =
        DEFAULT_OPACITY;

      getControls().forEach(
        (control) => {
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
        }
      );
    };

    const applySettings = () => {
      const controls =
        getControls();

      const size =
        Math.max(
          0.75,
          Math.min(
            1.25,
            currentSize
          )
        );

      const finalSize =
        160 * size;

      controls.forEach(
        (control) => {
          control.style.width =
            `${finalSize}px`;

          control.style.height =
            `${finalSize}px`;

          control.style.opacity =
            currentOpacity;
        }
      );

      const reset =
        document.querySelector(
          ".touch-controls-ui > .reset"
        );

      if (reset) {
        reset.style.backgroundSize =
          `${32 * size}px`;

        reset.style.backgroundPosition =
          "center";
      }
    };

    /* -------------------------------------------------- */
    /* POSITIONS                                           */
    /* -------------------------------------------------- */

    const getControlPositions = () => {
      return getControls().map(
        (control) => {
          const rect =
            control.getBoundingClientRect();

          return {
            left:
              rect.left /
              window.innerWidth,

            top:
              rect.top /
              window.innerHeight,
          };
        }
      );
    };

    const applyPositions = (
      positions
    ) => {
      if (!positions) return;

      const controls =
        getControls();

      controls.forEach(
        (control, index) => {
          const position =
            positions[index];

          if (!position) return;

          control.style.position =
            "fixed";

          control.style.left =
            `${position.left * 100}vw`;

          control.style.top =
            `${position.top * 100}vh`;

          control.style.right =
            "auto";

          control.style.bottom =
            "auto";

          control.style.margin =
            "0";
        }
      );
    };

    const savePositionSnapshot = () => {
      positionSnapshot =
        getControlPositions();
    };

    const restorePositionSnapshot = () => {
      if (!positionSnapshot) {
        return;
      }

      applyPositions(
        positionSnapshot
      );
    };

    /* -------------------------------------------------- */
    /* POSITION VALIDATION                                 */
    /* -------------------------------------------------- */

    const checkPositionValidity = () => {
      const controls =
        getControls();

      const rectangles =
        controls.map(
          (control) =>
            control.getBoundingClientRect()
        );

      let valid = true;

      controls.forEach(
        (control, index) => {
          const rect =
            rectangles[index];

          let invalid =
            rect.left < 0 ||
            rect.top < 0 ||
            rect.right >
              window.innerWidth ||
            rect.bottom >
              window.innerHeight;

          for (
            let otherIndex = 0;
            otherIndex <
              rectangles.length;
            otherIndex++
          ) {
            if (
              otherIndex === index
            ) {
              continue;
            }

            const other =
              rectangles[
                otherIndex
              ];

            const overlapWidth =
              Math.min(
                rect.right,
                other.right
              ) -
              Math.max(
                rect.left,
                other.left
              );

            const overlapHeight =
              Math.min(
                rect.bottom,
                other.bottom
              ) -
              Math.max(
                rect.top,
                other.top
              );

            if (
              overlapWidth > 1 &&
              overlapHeight > 1
            ) {
              invalid = true;
              break;
            }
          }

          if (invalid) {
            control.style.outline =
              "3px dotted red";

            valid = false;
          } else {
            control.style.outline =
              "3px dotted white";
          }

          control.style.cursor =
            "move";
        }
      );

      return valid;
    };

    /* -------------------------------------------------- */
    /* POSITION DRAGGING                                   */
    /* -------------------------------------------------- */

    const setupPositionDragging =
      () => {
        getControls().forEach(
          (control) => {
            if (
              control.dataset
                .mobileSupportDragging
            ) {
              return;
            }

            control.dataset
              .mobileSupportDragging =
              "true";

            let dragging = false;

            let offsetX = 0;
            let offsetY = 0;

            control.addEventListener(
              "pointerdown",
              (event) => {
                if (
                  !editingPosition
                ) {
                  return;
                }

                event.preventDefault();
                event.stopPropagation();

                dragging = true;

                const rect =
                  control.getBoundingClientRect();

                offsetX =
                  event.clientX -
                  rect.left;

                offsetY =
                  event.clientY -
                  rect.top;

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

                let left =
                  event.clientX -
                  offsetX;

                let top =
                  event.clientY -
                  offsetY;

                control.style.position =
                  "fixed";

                control.style.left =
                  `${left}px`;

                control.style.top =
                  `${top}px`;

                control.style.right =
                  "auto";

                control.style.bottom =
                  "auto";

                control.style.margin =
                  "0";

                checkPositionValidity();
              }
            );

            control.addEventListener(
              "pointerup",
              (event) => {
                if (!dragging) {
                  return;
                }

                event.preventDefault();
                event.stopPropagation();

                dragging = false;

                try {
                  control.releasePointerCapture?.(
                    event.pointerId
                  );
                } catch {}

                checkPositionValidity();
              }
            );

            control.addEventListener(
              "pointercancel",
              () => {
                dragging = false;
                checkPositionValidity();
              }
            );
          }
        );
      };

    /* -------------------------------------------------- */
    /* POSITION EDITING                                    */
    /* -------------------------------------------------- */

    const enterPositionEditing =
      () => {
        if (
          currentLayout ===
          "default"
        ) {
          return;
        }

        if (
          !layouts[currentLayout]
        ) {
          return;
        }

        savePositionSnapshot();

        editingLayout =
          false;

        editingPosition =
          true;

        if (activeMenu) {
          const menu =
            activeMenu;

          activeMenu = null;

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
          }, 250);
        }

        disableGameplayControls();

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

    const saveCurrentPositioning =
      () => {
        if (
          !editingPosition ||
          currentLayout ===
            "default"
        ) {
          return;
        }

        const valid =
          checkPositionValidity();

        if (!valid) {
          return;
        }

        if (
          !layouts[currentLayout]
        ) {
          return;
        }

        layouts[currentLayout]
          .positions =
          getControlPositions();

        saveLayouts();

        editingPosition =
          false;

        editingLayout =
          false;

        positionSnapshot =
          null;

        getControls().forEach(
          (control) => {
            control.style.outline =
              "";
            control.style.cursor =
              "";
          }
        );

        enableGameplayControls();

        if (editMobileButton) {
          editMobileButton.textContent =
            "Edit Mobile";
        }

        openControlsMenu();
      };

    const returnToMenu =
      () => {
        if (
          !editingPosition
        ) {
          return;
        }

        restorePositionSnapshot();

        editingPosition =
          false;

        editingLayout =
          true;

        positionSnapshot =
          null;

        getControls().forEach(
          (control) => {
            control.style.outline =
              "";
            control.style.cursor =
              "";
          }
        );

        enableGameplayControls();

        if (editMobileButton) {
          editMobileButton.textContent =
            "Edit Mobile";
        }

        openLayoutEditor();
      };

    /* -------------------------------------------------- */
    /* SLIDER                                              */
    /* -------------------------------------------------- */

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
        document.createElement(
          "div"
        );

      wrapper.className =
        "mobile-support-slider";

      const label =
        document.createElement(
          "div"
        );

      label.className =
        "mobile-support-slider-label";

      const labelName =
        document.createElement(
          "span"
        );

      labelName.textContent =
        labelText;

      const valueText =
        document.createElement(
          "span"
        );

      valueText.className =
        "mobile-support-slider-value";

      valueText.textContent =
        `${Math.round(
          value * 100
        )}%`;

      label.appendChild(
        labelName
      );

      label.appendChild(
        valueText
      );

      const track =
        document.createElement(
          "div"
        );

      track.className =
        "mobile-support-slider-track";

      const fill =
        document.createElement(
          "div"
        );

      fill.className =
        "mobile-support-slider-fill";

      const knob =
        document.createElement(
          "div"
        );

      knob.className =
        "mobile-support-slider-knob";

      track.appendChild(fill);
      track.appendChild(knob);

      wrapper.appendChild(label);
      wrapper.appendChild(track);

      parent.appendChild(wrapper);

      const updateFromPointer =
        (clientX) => {
          const rect =
            track.getBoundingClientRect();

          let ratio =
            (clientX -
              rect.left) /
            rect.width;

          ratio = Math.max(
            0,
            Math.min(
              1,
              ratio
            )
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

          onChange(newValue);
        };

      track.addEventListener(
        "pointerdown",
        (event) => {
          if (
            !editingLayout
          ) {
            return;
          }

          event.preventDefault();
          event.stopPropagation();

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
            !track.hasPointerCapture?.(
              event.pointerId
            )
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

      const update =
        (newValue) => {
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

      update(value);

      return update;
    };

    /* -------------------------------------------------- */
    /* CLOSE MENU                                          */
    /* -------------------------------------------------- */

    const closeControlsMenu =
      () => {
        if (!activeMenu) {
          return;
        }

        const menu =
          activeMenu;

        activeMenu =
          null;

        editingLayout =
          false;

        enableGameplayControls();

        menu.style.pointerEvents =
          "none";

        menu.classList.remove(
          "mobile-support-fade-in"
        );

        menu.classList.add(
          "mobile-support-fade-out"
        );

        closingMenu =
          menu;

        setTimeout(() => {
          if (menu.parentNode) {
            menu.remove();
          }

          if (
            closingMenu ===
            menu
          ) {
            closingMenu =
              null;
          }
        }, 250);
      };

    /* -------------------------------------------------- */
    /* COMMON MENU STYLE                                   */
    /* -------------------------------------------------- */

    const createMenuStyle =
      () => {
        const style =
          document.createElement(
            "style"
          );

        style.textContent = `
          .mobile-support-menu {
            position: fixed;

            left: 50%;
            top: 50%;

            transform:
              translate(-50%, -50%);

            width: min(420px, 85vw);
            max-height: 90vh;

            overflow-y: auto;

            padding: 22px;

            box-sizing: border-box;

            background: #212b58;

            border-radius: 12px;

            z-index: 999999;

            color: white;

            font-family:
              ForcedSquare,
              Arial,
              sans-serif !important;

            font-style: italic !important;
            font-weight: normal !important;

            box-shadow:
              0 8px 30px
              rgba(0, 0, 0, 0.45);

            user-select: none;
          }

          .mobile-support-menu * {
            font-family:
              ForcedSquare,
              Arial,
              sans-serif !important;

            font-style: italic !important;
            font-weight: normal !important;
          }

          .mobile-support-fade-in {
            animation:
              mobile-support-fade-in
              0.25s ease-out forwards;
          }

          .mobile-support-fade-out {
            animation:
              mobile-support-fade-out
              0.25s ease-in forwards;
          }

          @keyframes mobile-support-fade-in {
            from {
              opacity: 0;
            }

            to {
              opacity: 1;
            }
          }

          @keyframes mobile-support-fade-out {
            from {
              opacity: 1;
            }

            to {
              opacity: 0;
            }
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

            grid-template-columns:
              minmax(0, 1fr)
              auto
              auto;

            gap: 8px;

            align-items: center;
          }

          .mobile-support-layout-name {
            background: none !important;

            box-shadow: none !important;

            cursor: default !important;

            pointer-events: none !important;

            text-align: left;

            padding-left: 0 !important;
          }

          .mobile-support-selected {
            background-color:
              #33477f !important;
          }

          .mobile-support-edit-section {
            margin-bottom: 18px;
          }

          .mobile-support-slider {
            margin-bottom: 18px;
          }

          .mobile-support-slider-label {
            display: flex;

            justify-content:
              space-between;

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

            transform:
              translate(-50%, -50%);

            background: white;

            border:
              4px solid #212b58;

            box-sizing: border-box;

            pointer-events: none;
          }

          .mobile-support-position-button {
            width: 100%;

            margin-top: 4px;

            font-size: 24px !important;
          }

          .mobile-support-save-layout {
            width: 100%;

            margin-top: 10px;

            font-size: 24px !important;
          }

          .mobile-support-close {
            width: 100%;

            margin-top: 18px;

            font-size: 24px !important;
          }

          .mobile-support-position-buttons {
            display: grid;

            grid-template-columns:
              1fr 1fr;

            gap: 8px;

            position: fixed;

            left: 50%;

            bottom: 18px;

            transform:
              translateX(-50%);

            z-index: 999999;
          }

          .mobile-support-position-buttons
            .button {
            white-space: nowrap;
          }

          .mobile-support-disabled {
            pointer-events: none !important;
          }

          .mobile-support-disabled * {
            pointer-events: none !important;
          }
        `;

        document.head.appendChild(
          style
        );

        return style;
      };

    /* -------------------------------------------------- */
    /* EDIT LAYOUT MENU                                    */
    /* -------------------------------------------------- */

    const openLayoutEditor =
      () => {
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

        const menu =
          document.createElement(
            "div"
          );

        menu.className =
          "mobile-support-menu mobile-support-fade-in";

        const style =
          createMenuStyle();

        activeMenu =
          menu;

        disableGameplayControls();

        const title =
          document.createElement(
            "div"
          );

        title.className =
          "mobile-support-title";

        title.textContent =
          "Edit Mobile";

        menu.appendChild(
          title
        );

        const sliderSection =
          document.createElement(
            "div"
          );

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
              if (
                !editingLayout
              ) {
                return;
              }

              currentSize =
                value;

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
              if (
                !editingLayout
              ) {
                return;
              }

              currentOpacity =
                value;

              applySettings();
            }
          );

        menu.appendChild(
          sliderSection
        );

        const positionButton =
          document.createElement(
            "button"
          );

        positionButton.className =
          "button mobile-support-position-button";

        positionButton.textContent =
          "Press to Edit Positioning";

        positionButton.addEventListener(
          "click",
          () => {
            enterPositionEditing();
          }
        );

        menu.appendChild(
          positionButton
        );

        const saveLayoutButton =
          document.createElement(
            "button"
          );

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
              !layouts[
                currentLayout
              ]
            ) {
              return;
            }

            layouts[
              currentLayout
            ] = {
              size:
                currentSize,

              opacity:
                currentOpacity,

              positions:
                layouts[
                  currentLayout
                ].positions ||
                null,
            };

            saveLayouts();

            editingLayout =
              false;

            enableGameplayControls();

            closeLayoutMenuAndOpenList();
          }
        );

        menu.appendChild(
          saveLayoutButton
        );

        const blockMenuTouch =
          (event) => {
            if (!activeMenu) {
              return;
            }

            event.stopPropagation();
          };

        menu.addEventListener(
          "touchstart",
          blockMenuTouch,
          {
            capture: true,
            passive: false,
          }
        );

        menu.addEventListener(
          "touchmove",
          blockMenuTouch,
          {
            capture: true,
            passive: false,
          }
        );

        menu.addEventListener(
          "touchend",
          blockMenuTouch,
          {
            capture: true,
            passive: false,
          }
        );

        menu.addEventListener(
          "touchcancel",
          blockMenuTouch,
          {
            capture: true,
            passive: false,
          }
        );

        menu.addEventListener(
          "pointerdown",
          blockMenuTouch,
          true
        );

        menu.addEventListener(
          "pointermove",
          blockMenuTouch,
          true
        );

        menu.addEventListener(
          "pointerup",
          blockMenuTouch,
          true
        );

        document.body.appendChild(
          menu
        );

        /* Force the correct values */
        sizeSlider(
          currentSize
        );

        opacitySlider(
          currentOpacity
        );

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
              layouts[
                currentLayout
              ].positions
            );
          }
        }
      };

    /* -------------------------------------------------- */
    /* LIST MENU                                           */
    /* -------------------------------------------------- */

    const closeLayoutMenuAndOpenList =
      () => {
        if (!activeMenu) {
          openLayoutList();
          return;
        }

        const menu =
          activeMenu;

        activeMenu = null;

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

          openLayoutList();
        }, 250);
      };

    const openLayoutList =
      () => {
        if (
          activeMenu ||
          editingPosition
        ) {
          return;
        }

        const menu =
          document.createElement(
            "div"
          );

        menu.className =
          "mobile-support-menu mobile-support-fade-in";

        createMenuStyle();

        activeMenu =
          menu;

        disableGameplayControls();

        const title =
          document.createElement(
            "div"
          );

        title.className =
          "mobile-support-title";

        title.textContent =
          "Edit Mobile";

        menu.appendChild(
          title
        );

        const layoutsContainer =
          document.createElement(
            "div"
          );

        layoutsContainer.className =
          "mobile-support-layouts";

        const createLayoutRow =
          (
            name,
            displayName,
            canEdit
          ) => {
            const row =
              document.createElement(
                "div"
              );

            row.className =
              "mobile-support-layout-row";

            const nameText =
              document.createElement(
                "button"
              );

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
              name ===
                currentLayout
            ) {
              useButton.classList.add(
                "mobile-support-selected"
              );
            }

            if (
              name !==
                "default" &&
              !layouts[name]
            ) {
              useButton.disabled =
                true;

              useButton.classList.add(
                "mobile-support-disabled"
              );
            }

            useButton.addEventListener(
              "click",
              () => {
                if (
                  name !==
                    "default" &&
                  !layouts[name]
                ) {
                  return;
                }

                currentLayout =
                  name;

                editingLayout =
                  false;

                applyLayout(
                  name
                );

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
                  if (
                    !layouts[name]
                  ) {
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
                          layouts[
                            name
                          ].size
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
                          layouts[
                            name
                          ].opacity
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

                  activeMenu =
                    null;

                  oldMenu.style.pointerEvents =
                    "none";

                  oldMenu.classList.remove(
                    "mobile-support-fade-in"
                  );

                  oldMenu.classList.add(
                    "mobile-support-fade-out"
                  );

                  setTimeout(() => {
                    if (
                      oldMenu.parentNode
                    ) {
                      oldMenu.remove();
                    }

                    openLayoutEditor();
                  }, 250);
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
          () => {
            closeControlsMenu();
          }
        );

        menu.appendChild(
          closeButton
        );

        const blockMenuTouch =
          (event) => {
            if (!activeMenu) {
              return;
            }

            event.stopPropagation();
          };

        menu.addEventListener(
          "touchstart",
          blockMenuTouch,
          {
            capture: true,
            passive: false,
          }
        );

        menu.addEventListener(
          "touchmove",
          blockMenuTouch,
          {
            capture: true,
            passive: false,
          }
        );

        menu.addEventListener(
          "touchend",
          blockMenuTouch,
          {
            capture: true,
            passive: false,
          }
        );

        menu.addEventListener(
          "touchcancel",
          blockMenuTouch,
          {
            capture: true,
            passive: false,
          }
        );

        document.body.appendChild(
          menu
        );
      };

    /* -------------------------------------------------- */
    /* APPLY LAYOUT                                        */
    /* -------------------------------------------------- */

    const applyLayout =
      (name) => {
        if (
          name ===
          "default"
        ) {
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

        if (
          layout.positions
        ) {
          applyPositions(
            layout.positions
          );
        }
      };

    /* -------------------------------------------------- */
    /* EDIT MOBILE BUTTON                                  */
    /* -------------------------------------------------- */

    const createEditButton =
      () => {
        const toolbar =
          document.querySelector(
            ".game-toolbar-ui > .button-container"
          );

        if (!toolbar) {
          return;
        }

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
          editingPosition
            ? "Save Positioning"
            : "Edit Mobile";

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

    /* -------------------------------------------------- */
    /* OBSERVER                                            */
    /* -------------------------------------------------- */

    loadLayouts();

    setupPositionDragging();

    const observer =
      new MutationObserver(
        () => {
          const controls =
            getTouchControls();

          if (!controls) {
            if (activeMenu) {
              closeControlsMenu();
            }

            return;
          }

          createEditButton();
          setupPositionDragging();

          /*
           * IMPORTANT:
           * While editing the position, NEVER
           * reapply the saved layout.
           *
           * This prevents the controls from
           * jumping back while dragging.
           */
          if (
            editingPosition
          ) {
            disableGameplayControls();
            checkPositionValidity();
            return;
          }

          /*
           * While a menu is open, leave the
           * controls alone.
           */
          if (activeMenu) {
            return;
          }

          /*
           * Normal gameplay.
           */
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
      );

    observer.observe(
      document.body,
      {
        childList: true,
        subtree: true,
      }
    );

    /* -------------------------------------------------- */
    /* TOUCH CANCEL FIX                                    */
    /* -------------------------------------------------- */

    document.addEventListener(
      "touchcancel",
      () => {
        if (
          editingPosition
        ) {
          return;
        }

        const touchEnd =
          new TouchEvent(
            "touchend",
            {
              bubbles: true,
              cancelable: true,
            }
          );

        document.dispatchEvent(
          touchEnd
        );
      },
      true
    );

    window.addEventListener(
      "resize",
      () => {
        if (
          editingPosition
        ) {
          checkPositionValidity();
        }
      }
    );

    createEditButton();
  };
}

export let polyMod =
  new MobileSupportMod();
