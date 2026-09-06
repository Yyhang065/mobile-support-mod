import {
  PolyMod,
} from "https://cdn.polymodloader.com/cb/PolyTrackMods/PolyModLoader/0.6.2/PolyTypes.js";

class MobileSupportMod extends PolyMod {
  postInit = () => {
    const STORAGE_KEY =
      "mobile-support-mod-layouts-v4";

    const DEFAULT_SIZE = 1;
    const DEFAULT_OPACITY = 0.6;

    let currentSize = DEFAULT_SIZE;
    let currentOpacity = DEFAULT_OPACITY;
    let currentLayout = "default";
    let editing = false;

    let layouts = {
      slot1: null,
      slot2: null,
    };

    let activeMenu = null;
    let closingMenu = null;

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

    const getControlPositions = () => {
      const controls = getControls();

      return controls.map((control) => {
        const rect =
          control.getBoundingClientRect();

        return {
          left:
            rect.left /
            Math.max(window.innerWidth, 1),

          top:
            rect.top /
            Math.max(window.innerHeight, 1),
        };
      });
    };

    const clearPositionStyles = () => {
      getControls().forEach((control) => {
        control.style.position = "";
        control.style.left = "";
        control.style.top = "";
        control.style.right = "";
        control.style.bottom = "";
        control.style.margin = "";
      });
    };

    const restoreDefault = () => {
      currentSize = DEFAULT_SIZE;
      currentOpacity = DEFAULT_OPACITY;

      getControls().forEach((control) => {
        control.style.width = "";
        control.style.height = "";
        control.style.opacity = "";
        control.style.transform = "";
        control.style.position = "";
        control.style.left = "";
        control.style.top = "";
        control.style.right = "";
        control.style.bottom = "";
        control.style.margin = "";
        control.style.backgroundSize = "";
        control.style.backgroundPosition = "";
        control.style.outline = "";
        control.style.cursor = "";
      });
    };

    const applyPositions = (positions) => {
      const controls = getControls();

      if (!positions) {
        clearPositionStyles();
        return;
      }

      controls.forEach((control, index) => {
        const position = positions[index];

        if (!position) return;

        control.style.position = "fixed";
        control.style.left =
          `${position.left * 100}vw`;
        control.style.top =
          `${position.top * 100}vh`;
        control.style.right = "auto";
        control.style.bottom = "auto";
        control.style.margin = "0";
      });
    };

    const applySettings = () => {
      const controls = getControls();

      const size = Math.max(
        0.75,
        Math.min(1.25, currentSize)
      );

      controls.forEach((control) => {
        const finalSize = 160 * size;

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
        if (currentLayout === "default") {
          reset.style.backgroundSize = "";
          reset.style.backgroundPosition = "";
        } else {
          reset.style.backgroundSize =
            `${32 * size}px`;

          reset.style.backgroundPosition =
            "center";
        }
      }
    };

    const applyCurrentLayout = () => {
      if (currentLayout === "default") {
        restoreDefault();
        return;
      }

      const layout =
        layouts[currentLayout];

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
      applyPositions(layout.positions);
    };

    const updatePositionForControl = (
      control,
      clientX,
      clientY
    ) => {
      const width =
        control.getBoundingClientRect().width;

      const height =
        control.getBoundingClientRect().height;

      let left =
        clientX - width / 2;

      let top =
        clientY - height / 2;

      left = Math.max(
        0,
        Math.min(
          window.innerWidth - width,
          left
        )
      );

      top = Math.max(
        0,
        Math.min(
          window.innerHeight - height,
          top
        )
      );

      control.style.position = "fixed";
      control.style.left =
        `${left}px`;
      control.style.top =
        `${top}px`;
      control.style.right = "auto";
      control.style.bottom = "auto";
      control.style.margin = "0";
    };

    const enablePositionEditing = () => {
      if (!editing) return;

      const controls = getControls();

      controls.forEach((control) => {
        control.style.cursor = "move";
        control.style.outline =
          "2px dashed white";

        if (
          control.dataset.mobileSupportDrag
        ) {
          return;
        }

        control.dataset.mobileSupportDrag =
          "true";

        let dragging = false;
        let moved = false;

        const startDrag = (event) => {
          if (!editing) return;

          event.preventDefault();
          event.stopPropagation();

          dragging = true;
          moved = false;

          control.setPointerCapture?.(
            event.pointerId
          );

          updatePositionForControl(
            control,
            event.clientX,
            event.clientY
          );
        };

        const moveDrag = (event) => {
          if (!dragging || !editing) {
            return;
          }

          event.preventDefault();
          event.stopPropagation();

          moved = true;

          updatePositionForControl(
            control,
            event.clientX,
            event.clientY
          );
        };

        const endDrag = (event) => {
          if (!dragging) return;

          event.preventDefault();
          event.stopPropagation();

          dragging = false;

          try {
            control.releasePointerCapture?.(
              event.pointerId
            );
          } catch {}

          if (
            moved &&
            currentLayout !== "default" &&
            layouts[currentLayout]
          ) {
            layouts[currentLayout]
              .positions =
              getControlPositions();

            saveLayouts();
          }
        };

        control.addEventListener(
          "pointerdown",
          startDrag
        );

        control.addEventListener(
          "pointermove",
          moveDrag
        );

        control.addEventListener(
          "pointerup",
          endDrag
        );

        control.addEventListener(
          "pointercancel",
          endDrag
        );
      });
    };

    const disablePositionEditing = () => {
      getControls().forEach(
        (control) => {
          control.style.cursor = "";
          control.style.outline = "";
        }
      );
    };

    const createSlider = (
      parent,
      labelText,
      min,
      max,
      value,
      step,
      onChange,
      formatter
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

      labelName.textContent =
        labelText;

      const valueText =
        document.createElement("span");

      valueText.className =
        "mobile-support-slider-value";

      valueText.textContent =
        formatter(value);

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

      const setValue = (clientX) => {
        const rect =
          track.getBoundingClientRect();

        let ratio =
          (clientX - rect.left) /
          rect.width;

        ratio = Math.max(
          0,
          Math.min(1, ratio)
        );

        let newValue =
          min +
          ratio * (max - min);

        newValue =
          Math.round(
            newValue / step
          ) * step;

        newValue =
          Math.max(
            min,
            Math.min(max, newValue)
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
          formatter(newValue);

        onChange(newValue);
      };

      track.addEventListener(
        "pointerdown",
        (event) => {
          event.preventDefault();
          event.stopPropagation();

          track.setPointerCapture?.(
            event.pointerId
          );

          setValue(event.clientX);
        }
      );

      track.addEventListener(
        "pointermove",
        (event) => {
          if (
            !track.hasPointerCapture?.(
              event.pointerId
            )
          ) {
            return;
          }

          event.preventDefault();
          event.stopPropagation();

          setValue(event.clientX);
        }
      );

      const initialPercent =
        ((value - min) /
          (max - min)) *
        100;

      fill.style.width =
        `${initialPercent}%`;

      knob.style.left =
        `${initialPercent}%`;

      return {
        wrapper,
        update: (newValue) => {
          const percent =
            ((newValue - min) /
              (max - min)) *
            100;

          fill.style.width =
            `${percent}%`;

          knob.style.left =
            `${percent}%`;

          valueText.textContent =
            formatter(newValue);
        },
      };
    };

    const closeControlsMenu = () => {
      if (!activeMenu) return;

      const menu = activeMenu;

      activeMenu = null;
      editing = false;

      disablePositionEditing();

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
        if (menu.parentNode) {
          menu.remove();
        }

        if (closingMenu === menu) {
          closingMenu = null;
        }
      }, 250);
    };

    const openControlsMenu = () => {
      if (activeMenu) return;

      if (closingMenu) {
        closingMenu.remove();
        closingMenu = null;
      }

      const menu =
        document.createElement("div");

      menu.className =
        "mobile-support-menu mobile-support-fade-in";

      const style =
        document.createElement("style");

      style.textContent = `
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

          font-family:
            ForcedSquare,
            Arial,
            sans-serif !important;

          font-style: italic !important;
          font-weight: normal !important;

          box-shadow:
            0 8px 30px
            rgba(0, 0, 0, 0.45);
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

        .mobile-support-menu * {
          font-family:
            ForcedSquare,
            Arial,
            sans-serif !important;

          font-style: italic !important;
          font-weight: normal !important;
        }

        .mobile-support-title {
          font-size: 28px;
          margin-bottom: 18px;
          text-align: center;
        }

        .mobile-support-section {
          margin-bottom: 18px;
        }

        .mobile-support-section-title {
          font-size: 20px;
          margin-bottom: 10px;
        }

        .mobile-support-slider {
          margin-bottom: 15px;
        }

        .mobile-support-slider-label {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 7px;
          font-size: 17px;
        }

        .mobile-support-slider-value {
          opacity: 0.8;
        }

        .mobile-support-slider-track {
          position: relative;

          width: 100%;
          height: 14px;

          background: #141c3a;
          border-radius: 3px;

          touch-action: none;
          user-select: none;
        }

        .mobile-support-slider-fill {
          position: absolute;

          left: 0;
          top: 0;

          height: 100%;
          width: 50%;

          background: #33477f;
          border-radius: 3px;

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

          border: 5px solid #212b58;
          box-sizing: border-box;

          pointer-events: none;
        }

        .mobile-support-layout {
          display: flex;
          flex-direction: column;
          gap: 9px;
        }

        .mobile-support-layout-row {
          display: flex;
          gap: 8px;
        }

        .mobile-support-layout-row > .button {
          flex: 1;
          min-width: 0;
        }

        .mobile-support-close {
          width: 100%;
          margin-top: 4px;
        }
      `;

      document.head.appendChild(style);

      activeMenu = menu;

      const title =
        document.createElement("div");

      title.className =
        "mobile-support-title";

      title.textContent =
        "Edit Mobile";

      menu.appendChild(title);

      const settingsSection =
        document.createElement("div");

      settingsSection.className =
        "mobile-support-section";

      const settingsTitle =
        document.createElement("div");

      settingsTitle.className =
        "mobile-support-section-title";

      settingsTitle.textContent =
        "Button Settings";

      settingsSection.appendChild(
        settingsTitle
      );

      const sizeSlider =
        createSlider(
          settingsSection,
          "Size",
          0.75,
          1.25,
          currentSize,
          0.01,
          (value) => {
            if (!editing) return;

            currentSize = value;

            applySettings();
          },
          (value) =>
            `${Math.round(
              value * 100
            )}%`
        );

      const opacitySlider =
        createSlider(
          settingsSection,
          "Opacity",
          0.1,
          1,
          currentOpacity,
          0.01,
          (value) => {
            if (!editing) return;

            currentOpacity = value;

            applySettings();
          },
          (value) =>
            `${Math.round(
              value * 100
            )}%`
        );

      menu.appendChild(
        settingsSection
      );

      const positionHint =
        document.createElement("div");

      positionHint.style.fontSize =
        "15px";

      positionHint.style.opacity =
        "0.7";

      positionHint.style.textAlign =
        "center";

      positionHint.style.marginBottom =
        "15px";

      positionHint.textContent =
        "Press Edit to move and customize a layout.";

      menu.appendChild(
        positionHint
      );

      const layoutSection =
        document.createElement("div");

      layoutSection.className =
        "mobile-support-section";

      const layoutTitle =
        document.createElement("div");

      layoutTitle.className =
        "mobile-support-section-title";

      layoutTitle.textContent =
        "Layouts";

      layoutSection.appendChild(
        layoutTitle
      );

      const layoutContainer =
        document.createElement("div");

      layoutContainer.className =
        "mobile-support-layout";

      const slotRows = {};

      const updateSliderUI = () => {
        sizeSlider.update(
          currentSize
        );

        opacitySlider.update(
          currentOpacity
        );
      };

      const updateEditingUI = () => {
        settingsSection.style.display =
          editing
            ? "block"
            : "none";

        positionHint.style.display =
          editing
            ? "block"
            : "none";

        if (editing) {
          enablePositionEditing();
        } else {
          disablePositionEditing();
        }
      };

      const startEditing = (name) => {
        if (!layouts[name]) {
          layouts[name] = {
            size: DEFAULT_SIZE,
            opacity: DEFAULT_OPACITY,
            positions: null,
          };
        }

        currentLayout = name;
        editing = true;

        currentSize =
          Math.max(
            0.75,
            Math.min(
              1.25,
              Number(
                layouts[name].size
              ) || DEFAULT_SIZE
            )
          );

        currentOpacity =
          Math.max(
            0.1,
            Math.min(
              1,
              Number(
                layouts[name].opacity
              ) || DEFAULT_OPACITY
            )
          );

        applySettings();

        if (layouts[name].positions) {
          applyPositions(
            layouts[name].positions
          );
        }

        updateEditingUI();
        updateSliderUI();
      };

      const useLayout = (name) => {
        currentLayout = name;
        editing = false;

        applyCurrentLayout();

        updateEditingUI();
        updateSliderUI();
      };

      const createLayoutRow = (
        name,
        displayName
      ) => {
        const row =
          document.createElement("div");

        row.className =
          "mobile-support-layout-row";

        const nameButton =
          document.createElement("button");

        nameButton.className =
          "button";

        nameButton.textContent =
          displayName;

        nameButton.addEventListener(
          "click",
          () => {
            if (name === "default") {
              currentLayout =
                "default";

              editing = false;

              restoreDefault();

              updateEditingUI();
              updateSliderUI();

              return;
            }

            useLayout(name);
          }
        );

        row.appendChild(
          nameButton
        );

        if (name !== "default") {
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
              startEditing(name);
            }
          );

          const useButton =
            document.createElement(
              "button"
            );

          useButton.className =
            "button";

          useButton.textContent =
            "Use";

          useButton.addEventListener(
            "click",
            () => {
              useLayout(name);
            }
          );

          const deleteButton =
            document.createElement(
              "button"
            );

          deleteButton.className =
            "button";

          deleteButton.textContent =
            "Delete";

          deleteButton.addEventListener(
            "click",
            () => {
              layouts[name] = null;

              if (
                currentLayout === name
              ) {
                currentLayout =
                  "default";

                editing = false;

                restoreDefault();
              }

              saveLayouts();

              refreshLayoutButtons();
              updateEditingUI();
              updateSliderUI();
            }
          );

          row.appendChild(
            editButton
          );

          row.appendChild(
            useButton
          );

          row.appendChild(
            deleteButton
          );
        }

        return row;
      };

      const refreshLayoutButtons =
        () => {
          Object.values(
            slotRows
          ).forEach(
            (row) => {
              if (row?.parentNode) {
                row.remove();
              }
            }
          );

          Object.keys(slotRows)
            .forEach(
              (key) => {
                delete slotRows[key];
              }
            );

          const defaultRow =
            createLayoutRow(
              "default",
              "Default"
            );

          layoutContainer.appendChild(
            defaultRow
          );

          slotRows.default =
            defaultRow;

          if (layouts.slot1) {
            const row =
              createLayoutRow(
                "slot1",
                "Save 1"
              );

            layoutContainer.appendChild(
              row
            );

            slotRows.slot1 = row;
          } else {
            const row =
              document.createElement(
                "div"
              );

            row.className =
              "mobile-support-layout-row";

            const button =
              document.createElement(
                "button"
              );

            button.className =
              "button";

            button.textContent =
              "Create Save 1";

            button.addEventListener(
              "click",
              () => {
                layouts.slot1 = {
                  size:
                    currentSize,
                  opacity:
                    currentOpacity,
                  positions:
                    getControlPositions(),
                };

                saveLayouts();

                startEditing(
                  "slot1"
                );

                refreshLayoutButtons();
              }
            );

            row.appendChild(button);

            layoutContainer.appendChild(
              row
            );

            slotRows.slot1 = row;
          }

          if (layouts.slot2) {
            const row =
              createLayoutRow(
                "slot2",
                "Save 2"
              );

            layoutContainer.appendChild(
              row
            );

            slotRows.slot2 = row;
          } else {
            const row =
              document.createElement(
                "div"
              );

            row.className =
              "mobile-support-layout-row";

            const button =
              document.createElement(
                "button"
              );

            button.className =
              "button";

            button.textContent =
              "Create Save 2";

            button.addEventListener(
              "click",
              () => {
                layouts.slot2 = {
                  size:
                    currentSize,
                  opacity:
                    currentOpacity,
                  positions:
                    getControlPositions(),
                };

                saveLayouts();

                startEditing(
                  "slot2"
                );

                refreshLayoutButtons();
              }
            );

            row.appendChild(button);

            layoutContainer.appendChild(
              row
            );

            slotRows.slot2 = row;
          }
        };

      layoutSection.appendChild(
        layoutContainer
      );

      menu.appendChild(
        layoutSection
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
          if (
            editing &&
            currentLayout !==
              "default" &&
            layouts[currentLayout]
          ) {
            layouts[currentLayout] = {
              size:
                currentSize,

              opacity:
                currentOpacity,

              positions:
                getControlPositions(),
            };

            saveLayouts();
          }

          closeControlsMenu();
        }
      );

      menu.appendChild(
        closeButton
      );

      const blockGameTouch =
        (event) => {
          if (!activeMenu) return;

          event.stopPropagation();
        };

      menu.addEventListener(
        "touchstart",
        blockGameTouch,
        {
          capture: true,
          passive: false,
        }
      );

      menu.addEventListener(
        "touchmove",
        blockGameTouch,
        {
          capture: true,
          passive: false,
        }
      );

      menu.addEventListener(
        "touchend",
        blockGameTouch,
        {
          capture: true,
          passive: false,
        }
      );

      menu.addEventListener(
        "touchcancel",
        blockGameTouch,
        {
          capture: true,
          passive: false,
        }
      );

      menu.addEventListener(
        "mousedown",
        blockGameTouch,
        true
      );

      menu.addEventListener(
        "mouseup",
        blockGameTouch,
        true
      );

      document.body.appendChild(
        menu
      );

      refreshLayoutButtons();
      updateSliderUI();
      updateEditingUI();

      if (
        currentLayout ===
        "default"
      ) {
        restoreDefault();
      } else {
        applyCurrentLayout();
      }

      updateSliderUI();
      updateEditingUI();
    };

    const createEditButton =
      () => {
        const toolbar =
          document.querySelector(
            ".game-toolbar-ui > .button-container"
          );

        if (!toolbar) return;

        if (
          toolbar.querySelector(
            ".mobile-support-edit-button"
          )
        ) {
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

        if (!watchButton) return;

        const button =
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
            openControlsMenu();
          }
        );

        watchButton.insertAdjacentElement(
          "afterend",
          button
        );
      };

    loadLayouts();

    const observer =
      new MutationObserver(() => {
        const touchControls =
          getTouchControls();

        if (!touchControls) {
          if (activeMenu) {
            closeControlsMenu();
          }

          return;
        }

        createEditButton();

        if (!activeMenu) {
          if (
            currentLayout ===
            "default"
          ) {
            restoreDefault();
          } else {
            applyCurrentLayout();
          }
        }
      });

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

    createEditButton();
  };
}

export let polyMod =
  new MobileSupportMod();
