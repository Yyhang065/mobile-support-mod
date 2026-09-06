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

    let layouts = {
      slot1: null,
      slot2: null,
    };

    let activeMenu = null;
    let closingMenu = null;
    let menuStyle = null;

    let editMobileButton = null;

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
                  parsed.slot1.positions || null,
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
                  parsed.slot2.positions || null,
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

    const getTouchControls = () =>
      document.querySelector(
        ".touch-controls-ui"
      );

    const getControls = () => {
      const root = getTouchControls();

      if (!root) return [];

      return [
        ...root.querySelectorAll(
          ":scope > button, :scope > div > div"
        ),
      ];
    };

    const disableGameplayControls = () => {
      const root = getTouchControls();

      if (!root) return;

      root.classList.add(
        "mobile-support-game-disabled"
      );
    };

    const enableGameplayControls = () => {
      const root = getTouchControls();

      if (!root) return;

      root.classList.remove(
        "mobile-support-game-disabled"
      );
    };

    const restoreDefault = () => {
      currentSize = DEFAULT_SIZE;
      currentOpacity = DEFAULT_OPACITY;

      const controls = getControls();

      controls.forEach((control) => {
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

    const applySettings = () => {
      const controls = getControls();

      const size = Math.max(
        0.75,
        Math.min(1.25, currentSize)
      );

      const finalSize = 160 * size;

      controls.forEach((control) => {
        control.style.width =
          `${finalSize}px`;

        control.style.height =
          `${finalSize}px`;

        control.style.opacity =
          currentOpacity;
      });

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
      const controls = getControls();

      if (!positions) return;

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

    const applyLayout = (
      layoutName
    ) => {
      if (layoutName === "default") {
        restoreDefault();
        return;
      }

      const layout =
        layouts[layoutName];

      if (!layout) {
        restoreDefault();
        return;
      }

      currentSize = Math.max(
        0.75,
        Math.min(
          1.25,
          Number(layout.size) ||
            DEFAULT_SIZE
        )
      );

      currentOpacity = Math.max(
        0.1,
        Math.min(
          1,
          Number(layout.opacity) ||
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

    const clearPositionOutlines = () => {
      getControls().forEach(
        (control) => {
          control.style.outline = "";
          control.style.cursor = "";
        }
      );
    };

    const checkPositionValidity = () => {
      const controls =
        getControls();

      let valid = true;

      const rectangles =
        controls.map(
          (control) =>
            control.getBoundingClientRect()
        );

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
              rectangles[otherIndex];

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

    const saveCurrentPositioning = () => {
      if (
        !editingPosition ||
        currentLayout === "default"
      ) {
        return;
      }

      if (
        !layouts[currentLayout]
      ) {
        return;
      }

      if (
        !checkPositionValidity()
      ) {
        return;
      }

      layouts[currentLayout] = {
        size: currentSize,
        opacity: currentOpacity,
        positions:
          getControlPositions(),
      };

      saveLayouts();

      editingPosition = false;
      editingLayout = false;

      clearPositionOutlines();
      enableGameplayControls();

      if (editMobileButton) {
        editMobileButton.textContent =
          "Edit Mobile";
      }

      applyLayout(
        currentLayout
      );
    };

    const positionPointerDown =
      (event) => {
        if (!editingPosition) {
          return;
        }

        event.preventDefault();
        event.stopPropagation();
      };

    const setupPositionDragging =
      () => {
        const controls =
          getControls();

        controls.forEach(
          (control) => {
            if (
              control.dataset
                .mobileSupportPositionReady
            ) {
              return;
            }

            control.dataset
              .mobileSupportPositionReady =
              "true";

            let dragging = false;

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

                control.setPointerCapture?.(
                  event.pointerId
                );

                const rect =
                  control.getBoundingClientRect();

                control.dataset
                  .mobileSupportDragOffsetX =
                  String(
                    event.clientX -
                      rect.left
                  );

                control.dataset
                  .mobileSupportDragOffsetY =
                  String(
                    event.clientY -
                      rect.top
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

                const offsetX =
                  Number(
                    control.dataset
                      .mobileSupportDragOffsetX
                  ) || 0;

                const offsetY =
                  Number(
                    control.dataset
                      .mobileSupportDragOffsetY
                  ) || 0;

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

    const enterPositionEditing =
      () => {
        if (
          currentLayout === "default"
        ) {
          return;
        }

        if (
          !layouts[currentLayout]
        ) {
          return;
        }

        if (activeMenu) {
          activeMenu.classList.remove(
            "mobile-support-fade-in"
          );

          activeMenu.classList.add(
            "mobile-support-fade-out"
          );

          const oldMenu =
            activeMenu;

          activeMenu = null;

          setTimeout(() => {
            if (
              oldMenu.parentNode
            ) {
              oldMenu.remove();
            }
          }, 250);
        }

        layouts[currentLayout] = {
          size: currentSize,
          opacity: currentOpacity,
          positions:
            getControlPositions(),
        };

        saveLayouts();

        editingLayout = false;
        editingPosition = true;

        disableGameplayControls();

        if (editMobileButton) {
          editMobileButton.textContent =
            "Save Positioning";
        }

        setupPositionDragging();

        requestAnimationFrame(() => {
          checkPositionValidity();
        });
      };

    const exitPositionEditing =
      () => {
        editingPosition = false;

        clearPositionOutlines();
        enableGameplayControls();

        if (editMobileButton) {
          editMobileButton.textContent =
            "Edit Mobile";
        }

        if (
          currentLayout !==
            "default" &&
          layouts[currentLayout]
        ) {
          applyLayout(
            currentLayout
          );
        }
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
          if (!editingLayout) {
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

      const update = (
        newValue
      ) => {
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

    const closeControlsMenu =
      (save = true) => {
        if (!activeMenu) {
          return;
        }

        if (
          save &&
          editingLayout &&
          currentLayout !==
            "default" &&
          layouts[currentLayout]
        ) {
          layouts[currentLayout] = {
            size: currentSize,
            opacity: currentOpacity,
            positions:
              layouts[currentLayout]
                .positions ||
              null,
          };

          saveLayouts();
        }

        editingLayout = false;

        enableGameplayControls();

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

        closingMenu = menu;

        setTimeout(() => {
          if (
            menu.parentNode
          ) {
            menu.remove();
          }

          if (
            menuStyle ===
            menu._mobileSupportStyle
          ) {
            menuStyle.remove();
            menuStyle = null;
          }

          if (
            closingMenu === menu
          ) {
            closingMenu = null;
          }
        }, 250);
      };

    const openControlsMenu =
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

            align-items: stretch;
          }

          .mobile-support-layout-row
            > .mobile-support-layout-name {
            text-align: left;
          }

          .mobile-support-layout-row
            > .button {
            font-size: 24px !important;
            white-space: nowrap;
          }

          .mobile-support-layout-row
            > .mobile-support-selected {
            background-color:
              #33477f !important;
          }

          .mobile-support-layout-row
            > .mobile-support-disabled {
            opacity: 0.35;
            pointer-events: none;
          }

          .mobile-support-edit-section {
            margin-bottom: 18px;
          }

          .mobile-support-edit-section-title {
            font-size: 24px;
            margin-bottom: 14px;
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

            background:
              #141c3a;

            touch-action: none;
            user-select: none;
          }

          .mobile-support-slider-fill {
            position: absolute;

            left: 0;
            top: 0;

            height: 100%;
            width: 50%;

            background:
              #33477f;

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

          .mobile-support-close {
            width: 100%;
            margin-top: 18px;

            font-size: 24px !important;
          }

          .mobile-support-game-disabled {
            pointer-events: none !important;
          }

          .mobile-support-game-disabled * {
            pointer-events: none !important;
          }
        `;

        document.head.appendChild(
          style
        );

        menu._mobileSupportStyle =
          style;

        menuStyle = style;
        activeMenu = menu;

        disableGameplayControls();

        const title =
          document.createElement(
            "div"
          );

        title.className =
          "mobile-support-title";

        title.textContent =
          "Edit Mobile";

        menu.appendChild(title);

        const editSection =
          document.createElement(
            "div"
          );

        editSection.className =
          "mobile-support-edit-section";

        const editTitle =
          document.createElement(
            "div"
          );

        editTitle.className =
          "mobile-support-edit-section-title";

        editTitle.textContent =
          "Edit Layout";

        editSection.appendChild(
          editTitle
        );

        const sizeSlider =
          createSlider(
            editSection,
            "Size",
            0.75,
            1.25,
            currentSize,
            0.01,
            (value) => {
              currentSize =
                value;

              applySettings();

              if (
                editingPosition
              ) {
                checkPositionValidity();
              }
            }
          );

        const opacitySlider =
          createSlider(
            editSection,
            "Opacity",
            0.1,
            1,
            currentOpacity,
            0.01,
            (value) => {
              currentOpacity =
                value;

              applySettings();

              if (
                editingPosition
              ) {
                checkPositionValidity();
              }
            }
          );

        const positionButton =
          document.createElement(
            "button"
          );

        positionButton.className =
          "button mobile-support-position-button";

        positionButton.textContent =
          "Press to Edit Position";

        positionButton.addEventListener(
          "click",
          () => {
            if (
              !editingLayout ||
              currentLayout ===
                "default"
            ) {
              return;
            }

            layouts[currentLayout] = {
              size: currentSize,
              opacity:
                currentOpacity,
              positions:
                layouts[currentLayout]
                  .positions ||
                getControlPositions(),
            };

            saveLayouts();

            enterPositionEditing();
          }
        );

        editSection.appendChild(
          positionButton
        );

        editSection.style.display =
          "none";

        menu.appendChild(
          editSection
        );

        const layoutsSection =
          document.createElement(
            "div"
          );

        layoutsSection.className =
          "mobile-support-edit-section";

        const layoutsTitle =
          document.createElement(
            "div"
          );

        layoutsTitle.className =
          "mobile-support-edit-section-title";

        layoutsTitle.textContent =
          "Layouts";

        layoutsSection.appendChild(
          layoutsTitle
        );

        const layoutsContainer =
          document.createElement(
            "div"
          );

        layoutsContainer.className =
          "mobile-support-layouts";

        layoutsSection.appendChild(
          layoutsContainer
        );

        menu.appendChild(
          layoutsSection
        );

        const updateEditUI =
          () => {
            editSection.style.display =
              editingLayout
                ? "block"
                : "none";

            sizeSlider(
              currentSize
            );

            opacitySlider(
              currentOpacity
            );
          };

        const refreshLayouts =
          () => {
            layoutsContainer.innerHTML =
              "";

            const createRow =
              (
                name,
                displayName
              ) => {
                const row =
                  document.createElement(
                    "div"
                  );

                row.className =
                  "mobile-support-layout-row";

                const nameButton =
                  document.createElement(
                    "button"
                  );

                nameButton.className =
                  "button mobile-support-layout-name";

                nameButton.textContent =
                  displayName;

                row.appendChild(
                  nameButton
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

                    if (
                      editingLayout &&
                      currentLayout !==
                        "default" &&
                      layouts[
                        currentLayout
                      ]
                    ) {
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
                    }

                    editingLayout =
                      false;

                    currentLayout =
                      name;

                    applyLayout(
                      name
                    );

                    updateEditUI();
                    refreshLayouts();
                  }
                );

                row.appendChild(
                  useButton
                );

                if (
                  name !==
                    "default"
                ) {
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
                            currentSize,
                          opacity:
                            currentOpacity,
                          positions:
                            getControlPositions(),
                        };

                        saveLayouts();
                      }

                      currentLayout =
                        name;

                      editingLayout =
                        true;

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

                      disableGameplayControls();

                      updateEditUI();
                      refreshLayouts();
                    }
                  );

                  row.appendChild(
                    editButton
                  );
                }

                return row;
              };

            layoutsContainer.appendChild(
              createRow(
                "default",
                "Default Layout"
              )
            );

            layoutsContainer.appendChild(
              createRow(
                "slot1",
                "Custom Layout 1"
              )
            );

            layoutsContainer.appendChild(
              createRow(
                "slot2",
                "Custom Layout 2"
              )
            );
          };

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
            closeControlsMenu(
              true
            );
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

        refreshLayouts();
        updateEditUI();

        if (
          currentLayout ===
          "default"
        ) {
          editingLayout = false;
          restoreDefault();
        } else {
          applyLayout(
            currentLayout
          );
        }

        updateEditUI();
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
              return;
            }

            openControlsMenu();
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

    setupPositionDragging();

    const observer =
      new MutationObserver(
        () => {
          const controls =
            getTouchControls();

          if (!controls) {
            if (activeMenu) {
              closeControlsMenu(
                false
              );
            }

            if (
              editingPosition
            ) {
              exitPositionEditing();
            }

            return;
          }

          createEditButton();
          setupPositionDragging();

          if (
            editingPosition
          ) {
            checkPositionValidity();
            return;
          }

          if (
            activeMenu
          ) {
            return;
          }

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
