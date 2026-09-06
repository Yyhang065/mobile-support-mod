import {
  PolyMod,
} from "https://cdn.polymodloader.com/cb/PolyTrackMods/PolyModLoader/0.6.2/PolyTypes.js";

class MobileSupportMod extends PolyMod {
  postInit = () => {
    const STORAGE_KEY = "mobile-support-mod-layouts-v2";

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

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);

        if (parsed && typeof parsed === "object") {
          layouts.slot1 = parsed.slot1 || null;
          layouts.slot2 = parsed.slot2 || null;
        }
      }
    } catch {
      layouts = {
        slot1: null,
        slot2: null,
      };
    }

    const saveLayouts = () => {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(layouts)
        );
      } catch {}
    };

    const getTouchControls = () => {
      return document.querySelector(".touch-controls-ui");
    };

    const getButtons = () => {
      const controls = getTouchControls();
      if (!controls) return {};

      return {
        camera: controls.querySelector(
          'button.camera'
        ),

        reset: controls.querySelector(
          'button.reset'
        ),

        left: controls.querySelector(
          'img[src="images/arrow_left.svg"]'
        )?.parentElement,

        right: controls.querySelector(
          'img[src="images/arrow_right.svg"]'
        )?.parentElement,

        up: controls.querySelector(
          'img[src="images/arrow_up.svg"]'
        )?.parentElement,

        down: controls.querySelector(
          'img[src="images/arrow_down.svg"]'
        )?.parentElement,
      };
    };

    const getAllButtons = () => {
      const buttons = getButtons();

      return Object.entries(buttons).filter(
        ([, button]) => button
      );
    };

    const clearButtonPosition = (button) => {
      if (!button) return;

      button.style.position = "";
      button.style.left = "";
      button.style.top = "";
      button.style.right = "";
      button.style.bottom = "";
    };

    const restoreDefault = () => {
      const controls = getTouchControls();
      if (!controls) return;

      currentSize = DEFAULT_SIZE;
      currentOpacity = DEFAULT_OPACITY;

      currentLayout = "default";

      getAllButtons().forEach(
        ([, button]) => {
          button.style.width = "";
          button.style.height = "";
          button.style.opacity = "";
          button.style.transform = "";

          clearButtonPosition(button);
        }
      );
    };

    const applySettings = () => {
      const controls = getTouchControls();
      if (!controls) return;

      if (currentLayout === "default") {
        restoreDefault();
        return;
      }

      const buttonSize = 160 * currentSize;

      getAllButtons().forEach(
        ([name, button]) => {
          button.style.width =
            `${buttonSize}px`;

          button.style.height =
            `${buttonSize}px`;

          button.style.opacity =
            currentOpacity;

          button.style.transform = "none";

          const position =
            layouts[currentLayout]?.positions?.[name];

          if (position) {
            button.style.position = "fixed";
            button.style.left =
              `${position.x * window.innerWidth}px`;
            button.style.top =
              `${position.y * window.innerHeight}px`;
            button.style.right = "auto";
            button.style.bottom = "auto";
          }
        }
      );

      /*
       * PolyTrack's checkpoint flag is the background
       * image of the restart button.
       *
       * Keep it attached to the restart button and make
       * its size follow the restart button's size.
       */
      const reset = getButtons().reset;

      if (reset) {
        reset.style.backgroundPosition =
          "center";

        reset.style.backgroundSize =
          `${32 * currentSize}px`;
      }
    };

    const getCurrentPositions = () => {
      const positions = {};

      getAllButtons().forEach(
        ([name, button]) => {
          const rect =
            button.getBoundingClientRect();

          positions[name] = {
            x: rect.left / window.innerWidth,
            y: rect.top / window.innerHeight,
          };
        }
      );

      return positions;
    };

    const createInitialLayout = () => {
      const positions = getCurrentPositions();

      return {
        size: currentSize,
        opacity: currentOpacity,
        positions,
      };
    };

    const applyLayout = (slot) => {
      if (!layouts[slot]) return;

      currentLayout = slot;

      currentSize =
        layouts[slot].size ?? DEFAULT_SIZE;

      currentOpacity =
        layouts[slot].opacity ?? DEFAULT_OPACITY;

      applySettings();
    };

    const startEditing = (slot) => {
      const controls = getTouchControls();

      if (!controls) return;

      if (!layouts[slot]) {
        layouts[slot] = createInitialLayout();
        saveLayouts();
      }

      currentLayout = slot;

      currentSize =
        layouts[slot].size ?? DEFAULT_SIZE;

      currentOpacity =
        layouts[slot].opacity ?? DEFAULT_OPACITY;

      editing = true;

      applySettings();

      controls.classList.add(
        "mobile-support-editing"
      );

      getAllButtons().forEach(
        ([, button]) => {
          button.style.outline =
            "4px dashed rgba(255,255,255,0.8)";

          button.style.cursor = "move";
        }
      );
    };

    const stopEditing = (save) => {
      const controls = getTouchControls();

      if (!controls) return;

      if (
        save &&
        currentLayout !== "default"
      ) {
        layouts[currentLayout] = {
          size: currentSize,
          opacity: currentOpacity,
          positions:
            getCurrentPositions(),
        };

        saveLayouts();
      }

      editing = false;

      controls.classList.remove(
        "mobile-support-editing"
      );

      getAllButtons().forEach(
        ([, button]) => {
          button.style.outline = "";
          button.style.cursor = "";
        }
      );

      applySettings();
    };

    const setupDragging = () => {
      getAllButtons().forEach(
        ([, button]) => {
          if (
            button.dataset.mobileSupportDrag
          ) {
            return;
          }

          button.dataset.mobileSupportDrag =
            "true";

          let dragging = false;
          let offsetX = 0;
          let offsetY = 0;

          const start = (event) => {
            if (!editing) return;

            const point =
              event.touches?.length
                ? event.touches[0]
                : event;

            const rect =
              button.getBoundingClientRect();

            dragging = true;

            offsetX =
              point.clientX - rect.left;

            offsetY =
              point.clientY - rect.top;

            event.preventDefault();
            event.stopPropagation();
          };

          const move = (event) => {
            if (!editing || !dragging) return;

            const point =
              event.touches?.length
                ? event.touches[0]
                : event;

            let x =
              point.clientX - offsetX;

            let y =
              point.clientY - offsetY;

            x = Math.max(
              0,
              Math.min(
                window.innerWidth -
                  button.offsetWidth,
                x
              )
            );

            y = Math.max(
              0,
              Math.min(
                window.innerHeight -
                  button.offsetHeight,
                y
              )
            );

            button.style.position =
              "fixed";

            button.style.left =
              `${x}px`;

            button.style.top =
              `${y}px`;

            button.style.right = "auto";
            button.style.bottom = "auto";

            event.preventDefault();
            event.stopPropagation();
          };

          const end = (event) => {
            if (!dragging) return;

            dragging = false;

            if (event) {
              event.preventDefault();
              event.stopPropagation();
            }
          };

          button.addEventListener(
            "touchstart",
            start,
            {
              passive: false,
            }
          );

          button.addEventListener(
            "touchmove",
            move,
            {
              passive: false,
            }
          );

          button.addEventListener(
            "touchend",
            end,
            {
              passive: false,
            }
          );

          button.addEventListener(
            "touchcancel",
            end,
            {
              passive: false,
            }
          );

          button.addEventListener(
            "mousedown",
            start
          );

          document.addEventListener(
            "mousemove",
            move
          );

          document.addEventListener(
            "mouseup",
            end
          );
        }
      );
    };

    const createSlider = (
      parent,
      labelText,
      min,
      max,
      value,
      onChange,
      suffix
    ) => {
      const wrapper =
        document.createElement("div");

      wrapper.className =
        "mobile-support-slider-wrapper";

      const label =
        document.createElement("div");

      label.className =
        "mobile-support-label";

      const valueText =
        document.createElement("span");

      valueText.className =
        "mobile-support-value";

      label.textContent =
        `${labelText}: `;

      label.appendChild(valueText);

      const slider =
        document.createElement("div");

      slider.className =
        "mobile-support-slider";

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

      slider.appendChild(track);

      wrapper.appendChild(label);
      wrapper.appendChild(slider);

      parent.appendChild(wrapper);

      let dragging = false;

      const updateVisual = (newValue) => {
        const percentage =
          ((newValue - min) /
            (max - min)) * 100;

        fill.style.width =
          `${percentage}%`;

        knob.style.left =
          `${percentage}%`;

        valueText.textContent =
          `${Math.round(
            newValue * 100
          )}${suffix}`;
      };

      const updateFromEvent = (event) => {
        const rect =
          track.getBoundingClientRect();

        const clientX =
          event.touches?.length
            ? event.touches[0].clientX
            : event.clientX;

        let percentage =
          (clientX - rect.left) /
          rect.width;

        percentage = Math.max(
          0,
          Math.min(1, percentage)
        );

        let newValue =
          min +
          (max - min) *
            percentage;

        newValue =
          Math.round(
            newValue * 100
          ) / 100;

        updateVisual(newValue);
        onChange(newValue);
      };

      const startDrag = (event) => {
        dragging = true;

        event.preventDefault();
        event.stopPropagation();

        updateFromEvent(event);
      };

      const moveDrag = (event) => {
        if (!dragging) return;

        event.preventDefault();
        event.stopPropagation();

        updateFromEvent(event);
      };

      const endDrag = (event) => {
        dragging = false;

        if (event) {
          event.stopPropagation();
        }
      };

      slider.addEventListener(
        "touchstart",
        startDrag,
        { passive: false }
      );

      slider.addEventListener(
        "touchmove",
        moveDrag,
        { passive: false }
      );

      slider.addEventListener(
        "touchend",
        endDrag,
        { passive: false }
      );

      slider.addEventListener(
        "touchcancel",
        endDrag,
        { passive: false }
      );

      slider.addEventListener(
        "mousedown",
        startDrag
      );

      document.addEventListener(
        "mousemove",
        moveDrag
      );

      document.addEventListener(
        "mouseup",
        endDrag
      );

      updateVisual(value);
    };

    const openControlsMenu = () => {
      if (
        document.querySelector(
          ".mobile-support-menu"
        )
      ) {
        return;
      }

      const menu =
        document.createElement("div");

      menu.className =
        "mobile-support-menu";

      const panel =
        document.createElement("div");

      panel.className =
        "mobile-support-panel";

      panel.innerHTML = `
        <div class="mobile-support-title">
          Mobile Controls
        </div>

        <div class="mobile-support-section-title">
          Layouts
        </div>

        <div id="mobile-layout-list"></div>

        <div
          id="mobile-editor"
          class="mobile-support-editor"
        ></div>

        <button
          id="mobile-close-button"
          class="mobile-support-button"
        >
          Close
        </button>
      `;

      menu.appendChild(panel);

      const style =
        document.createElement("style");

      style.textContent = `
        .mobile-support-menu {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);

          z-index: 999999;

          width: min(460px, 88vw);
          max-height: 90vh;

          overflow-y: auto;

          pointer-events: auto !important;
          touch-action: none !important;
        }

        .mobile-support-panel {
          box-sizing: border-box;

          width: 100%;

          padding: 24px;

          background: #212b58;

          color: white;

          font-family: inherit;

          pointer-events: auto !important;
          touch-action: none !important;

          user-select: none;
          -webkit-user-select: none;

          box-shadow:
            0 8px 30px rgba(0,0,0,0.45);
        }

        .mobile-support-title {
          margin-bottom: 24px;

          color: white;

          font-size: 25px;
          font-weight: bold;

          text-align: center;
        }

        .mobile-support-section-title {
          margin-bottom: 12px;

          font-size: 18px;
          font-weight: bold;
        }

        .mobile-support-layout {
          display: flex;
          align-items: center;

          gap: 8px;

          margin-bottom: 10px;
        }

        .mobile-support-layout-name {
          flex: 1;

          padding: 12px;

          background: #17214a;

          color: white;

          font-size: 17px;
          font-weight: bold;
        }

        .mobile-support-layout-button {
          padding: 11px 13px;

          background: #17214a;

          border: none;

          color: white;

          font-family: inherit;

          font-size: 15px;
          font-weight: bold;

          touch-action: manipulation;
        }

        .mobile-support-layout-button:active,
        .mobile-support-button:active {
          background: #33477f;
        }

        .mobile-support-editor {
          margin-top: 22px;
          margin-bottom: 18px;

          padding-top: 18px;

          border-top:
            1px solid rgba(255,255,255,0.18);
        }

        .mobile-support-editor-title {
          margin-bottom: 18px;

          font-size: 18px;
          font-weight: bold;
        }

        .mobile-support-slider-wrapper {
          margin-bottom: 22px;
        }

        .mobile-support-label {
          margin-bottom: 10px;

          color: white;

          font-size: 17px;
          font-weight: bold;
        }

        .mobile-support-slider {
          position: relative;

          width: 100%;
          height: 42px;

          display: flex;
          align-items: center;

          touch-action: none !important;
          pointer-events: auto !important;
        }

        .mobile-support-slider-track {
          position: relative;

          width: 100%;
          height: 10px;

          background: #141c3a;

          pointer-events: auto !important;
        }

        .mobile-support-slider-fill {
          position: absolute;

          left: 0;
          top: 0;

          height: 100%;
          width: 0%;

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

          box-sizing: border-box;

          background: white;

          border: 4px solid white;

          box-shadow:
            inset 0 0 0 5px #212b58;

          pointer-events: none;
        }

        .mobile-support-button {
          width: 100%;

          margin-top: 8px;
          padding: 12px 18px;

          box-sizing: border-box;

          background: #17214a;

          border: none;

          color: white;

          font-family: inherit;

          font-size: 18px;
          font-weight: bold;

          touch-action: manipulation;
        }

        .mobile-support-hint {
          margin-bottom: 16px;

          color: rgba(255,255,255,0.75);

          font-size: 14px;
          line-height: 1.4;
        }
      `;

      document.head.appendChild(style);

      const layoutList =
        panel.querySelector(
          "#mobile-layout-list"
        );

      const editor =
        panel.querySelector(
          "#mobile-editor"
        );

      const refreshLayoutList = () => {
        layoutList.innerHTML = "";

        const createLayoutRow = (
          name,
          slot,
          isDefault
        ) => {
          const row =
            document.createElement("div");

          row.className =
            "mobile-support-layout";

          const nameBox =
            document.createElement("div");

          nameBox.className =
            "mobile-support-layout-name";

          nameBox.textContent = name;

          row.appendChild(nameBox);

          const useButton =
            document.createElement("button");

          useButton.className =
            "mobile-support-layout-button";

          useButton.textContent = "Use";

          useButton.addEventListener(
            "click",
            () => {
              if (editing) {
                stopEditing(false);
              }

              if (isDefault) {
                restoreDefault();
              } else {
                applyLayout(slot);
              }

              refreshLayoutList();
            }
          );

          row.appendChild(useButton);

          if (!isDefault) {
            const editButton =
              document.createElement("button");

            editButton.className =
              "mobile-support-layout-button";

            editButton.textContent = "Edit";

            editButton.addEventListener(
              "click",
              () => {
                startEditing(slot);
                openEditor(slot);
              }
            );

            row.appendChild(editButton);

            if (layouts[slot]) {
              const deleteButton =
                document.createElement("button");

              deleteButton.className =
                "mobile-support-layout-button";

              deleteButton.textContent =
                "Delete";

              deleteButton.addEventListener(
                "click",
                () => {
                  layouts[slot] = null;

                  if (
                    currentLayout === slot
                  ) {
                    restoreDefault();
                  }

                  saveLayouts();

                  editor.innerHTML = "";

                  refreshLayoutList();
                }
              );

              row.appendChild(deleteButton);
            }
          }

          layoutList.appendChild(row);
        };

        createLayoutRow(
          "Default",
          "default",
          true
        );

        createLayoutRow(
          layouts.slot1
            ? "Save 1"
            : "Save 1 — Empty",
          "slot1",
          false
        );

        createLayoutRow(
          layouts.slot2
            ? "Save 2"
            : "Save 2 — Empty",
          "slot2",
          false
        );
      };

      const openEditor = (slot) => {
        editor.innerHTML = "";

        const title =
          document.createElement("div");

        title.className =
          "mobile-support-editor-title";

        title.textContent =
          `Editing ${
            slot === "slot1"
              ? "Save 1"
              : "Save 2"
          }`;

        editor.appendChild(title);

        const hint =
          document.createElement("div");

        hint.className =
          "mobile-support-hint";

        hint.textContent =
          "Drag the mobile buttons on screen to move them. Adjust size and opacity below.";

        editor.appendChild(hint);

        createSlider(
          editor,
          "Size",
          0.75,
          1.25,
          currentSize,
          (value) => {
            currentSize = value;

            applySettings();
          },
          "%"
        );

        createSlider(
          editor,
          "Opacity",
          0.1,
          1,
          currentOpacity,
          (value) => {
            currentOpacity = value;

            applySettings();
          },
          "%"
        );

        const saveButton =
          document.createElement("button");

        saveButton.className =
          "mobile-support-button";

        saveButton.textContent =
          "Save Layout";

        saveButton.addEventListener(
          "click",
          () => {
            stopEditing(true);

            editor.innerHTML = "";

            refreshLayoutList();
          }
        );

        editor.appendChild(saveButton);

        const cancelButton =
          document.createElement("button");

        cancelButton.className =
          "mobile-support-button";

        cancelButton.textContent =
          "Cancel";

        cancelButton.addEventListener(
          "click",
          () => {
            stopEditing(false);

            editor.innerHTML = "";

            refreshLayoutList();
          }
        );

        editor.appendChild(cancelButton);
      };

      const closeButton =
        panel.querySelector(
          "#mobile-close-button"
        );

      closeButton.addEventListener(
        "click",
        () => {
          if (editing) {
            stopEditing(false);
          }

          menu.remove();
          style.remove();
        }
      );

      document.body.appendChild(menu);

      refreshLayoutList();

      setupDragging();
    };

    const addButton = () => {
      const container =
        document.querySelector(
          ".game-toolbar-ui > .button-container"
        );

      if (!container) return;

      if (
        container.querySelector(
          ".mobile-support-button"
        )
      ) {
        return;
      }

      const button =
        document.createElement("button");

      button.className =
        "button mobile-support-button";

      button.textContent =
        "Edit Mobile";

      button.addEventListener(
        "click",
        () => {
          openControlsMenu();
        }
      );

      const watchButton =
        container.querySelector(
          'button:has(img[src="images/preview.svg"])'
        );

      if (watchButton) {
        watchButton.after(button);
      } else {
        container.appendChild(button);
      }
    };

    /*
     * PolyTrack does not listen for touchcancel.
     * Make sure steering is released when Safari
     * cancels a touch.
     */
    const releaseCancelledTouch = () => {
      try {
        const event =
          new TouchEvent(
            "touchend",
            {
              bubbles: true,
              cancelable: true,
              touches: [],
              targetTouches: [],
              changedTouches: [],
            }
          );

        window.dispatchEvent(event);
      } catch {
        const event =
          new Event(
            "touchend",
            {
              bubbles: true,
              cancelable: true,
            }
          );

        Object.defineProperty(
          event,
          "touches",
          {
            value: {
              length: 0,
              item: () => null,
            },
          }
        );

        window.dispatchEvent(event);
      }
    };

    window.addEventListener(
      "touchcancel",
      releaseCancelledTouch,
      {
        capture: true,
        passive: true,
      }
    );

    addButton();
    setupDragging();

    if (currentLayout !== "default") {
      applySettings();
    }

    const observer =
      new MutationObserver(() => {
        addButton();
        setupDragging();

        if (!editing) {
          if (
            currentLayout === "default"
          ) {
            restoreDefault();
          } else {
            applySettings();
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

    window.addEventListener(
      "resize",
      () => {
        if (!editing) {
          applySettings();
        }
      }
    );
  };
}

export let polyMod =
  new MobileSupportMod();
