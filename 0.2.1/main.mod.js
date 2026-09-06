import {
  PolyMod,
} from "https://cdn.polymodloader.com/cb/PolyTrackMods/PolyModLoader/0.6.2/PolyTypes.js";

class MobileSupportMod extends PolyMod {
  postInit = () => {
    const STORAGE_KEY =
      "mobile-support-mod-layouts-v3";

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
    let activeMenuStyle = null;

    try {
      const saved =
        localStorage.getItem(STORAGE_KEY);

      if (saved) {
        const parsed = JSON.parse(saved);

        if (
          parsed &&
          typeof parsed === "object"
        ) {
          layouts.slot1 =
            parsed.slot1 || null;

          layouts.slot2 =
            parsed.slot2 || null;
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
      return document.querySelector(
        ".touch-controls-ui"
      );
    };

    const getButtons = () => {
      const controls =
        getTouchControls();

      if (!controls) return {};

      return {
        camera:
          controls.querySelector(
            "button.camera"
          ),

        reset:
          controls.querySelector(
            "button.reset"
          ),

        left:
          controls.querySelector(
            'img[src="images/arrow_left.svg"]'
          )?.parentElement,

        right:
          controls.querySelector(
            'img[src="images/arrow_right.svg"]'
          )?.parentElement,

        up:
          controls.querySelector(
            'img[src="images/arrow_up.svg"]'
          )?.parentElement,

        down:
          controls.querySelector(
            'img[src="images/arrow_down.svg"]'
          )?.parentElement,
      };
    };

    const getAllButtons = () => {
      return Object.entries(
        getButtons()
      ).filter(
        ([, button]) => button
      );
    };

    const restoreDefault = () => {
      currentSize =
        DEFAULT_SIZE;

      currentOpacity =
        DEFAULT_OPACITY;

      currentLayout =
        "default";

      getAllButtons().forEach(
        ([, button]) => {
          button.style.width = "";
          button.style.height = "";
          button.style.opacity = "";
          button.style.transform = "";

          button.style.position = "";
          button.style.left = "";
          button.style.top = "";
          button.style.right = "";
          button.style.bottom = "";

          button.style.backgroundSize = "";
          button.style.backgroundPosition = "";

          button.style.outline = "";
        }
      );
    };

    const applySettings = () => {
      const controls =
        getTouchControls();

      if (!controls) return;

      if (
        currentLayout ===
        "default"
      ) {
        restoreDefault();
        return;
      }

      const buttonSize =
        160 * currentSize;

      getAllButtons().forEach(
        ([, button]) => {
          button.style.width =
            `${buttonSize}px`;

          button.style.height =
            `${buttonSize}px`;

          button.style.opacity =
            currentOpacity;

          /*
           * Never modify PolyTrack's
           * positioning system.
           */
          button.style.position = "";
          button.style.left = "";
          button.style.top = "";
          button.style.right = "";
          button.style.bottom = "";
          button.style.transform = "";
        }
      );

      /*
       * Keep the checkpoint flag attached
       * to the restart button and scale it
       * together with the button.
       */
      const reset =
        getButtons().reset;

      if (reset) {
        reset.style.backgroundPosition =
          "center";

        reset.style.backgroundSize =
          `${32 * currentSize}px`;
      }
    };

    const applyLayout = (slot) => {
      if (!layouts[slot]) {
        return;
      }

      currentLayout =
        slot;

      currentSize =
        layouts[slot].size ??
        DEFAULT_SIZE;

      currentOpacity =
        layouts[slot].opacity ??
        DEFAULT_OPACITY;

      applySettings();
    };

    const startEditing = (slot) => {
      if (!getTouchControls()) {
        return;
      }

      if (!layouts[slot]) {
        layouts[slot] = {
          size:
            currentSize,

          opacity:
            currentOpacity,
        };

        saveLayouts();
      }

      currentLayout =
        slot;

      currentSize =
        layouts[slot].size ??
        DEFAULT_SIZE;

      currentOpacity =
        layouts[slot].opacity ??
        DEFAULT_OPACITY;

      editing = true;

      applySettings();
    };

    const stopEditing = (save) => {
      if (!editing) {
        return;
      }

      if (
        save &&
        currentLayout !==
          "default"
      ) {
        layouts[currentLayout] = {
          size:
            currentSize,

          opacity:
            currentOpacity,
        };

        saveLayouts();
      }

      editing = false;

      applySettings();
    };

    /*
     * Close the menu completely.
     *
     * This is also used when PolyTrack
     * leaves the run.
     */
    const closeControlsMenu = () => {
      if (editing) {
        stopEditing(false);
      }

      if (activeMenu) {
        activeMenu.remove();
        activeMenu = null;
      }

      if (activeMenuStyle) {
        activeMenuStyle.remove();
        activeMenuStyle = null;
      }
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
        document.createElement(
          "div"
        );

      wrapper.className =
        "mobile-support-slider-wrapper";

      const label =
        document.createElement(
          "div"
        );

      label.className =
        "mobile-support-label";

      const valueText =
        document.createElement(
          "span"
        );

      valueText.className =
        "mobile-support-value";

      label.textContent =
        `${labelText}: `;

      label.appendChild(
        valueText
      );

      const slider =
        document.createElement(
          "div"
        );

      slider.className =
        "mobile-support-slider";

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

      slider.appendChild(track);

      wrapper.appendChild(label);
      wrapper.appendChild(slider);

      parent.appendChild(wrapper);

      let dragging = false;

      const updateVisual =
        (newValue) => {
          const percentage =
            ((newValue - min) /
              (max - min)) *
            100;

          fill.style.width =
            `${percentage}%`;

          knob.style.left =
            `${percentage}%`;

          valueText.textContent =
            `${Math.round(
              newValue * 100
            )}${suffix}`;
        };

      const updateFromEvent =
        (event) => {
          const rect =
            track.getBoundingClientRect();

          const clientX =
            event.touches?.length
              ? event.touches[0].clientX
              : event.clientX;

          let percentage =
            (clientX -
              rect.left) /
            rect.width;

          percentage =
            Math.max(
              0,
              Math.min(
                1,
                percentage
              )
            );

          let newValue =
            min +
            (max - min) *
              percentage;

          newValue =
            Math.round(
              newValue * 100
            ) / 100;

          updateVisual(
            newValue
          );

          onChange(
            newValue
          );
        };

      const startDrag =
        (event) => {
          dragging = true;

          event.preventDefault();
          event.stopPropagation();

          updateFromEvent(
            event
          );
        };

      const moveDrag =
        (event) => {
          if (!dragging) {
            return;
          }

          event.preventDefault();
          event.stopPropagation();

          updateFromEvent(
            event
          );
        };

      const endDrag =
        (event) => {
          dragging = false;

          if (event) {
            event.preventDefault();
            event.stopPropagation();
          }
        };

      slider.addEventListener(
        "touchstart",
        startDrag,
        {
          passive: false,
        }
      );

      slider.addEventListener(
        "touchmove",
        moveDrag,
        {
          passive: false,
        }
      );

      slider.addEventListener(
        "touchend",
        endDrag,
        {
          passive: false,
        }
      );

      slider.addEventListener(
        "touchcancel",
        endDrag,
        {
          passive: false,
        }
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
      if (activeMenu) {
        return;
      }

      const menu =
        document.createElement(
          "div"
        );

      menu.className =
        "mobile-support-menu";

      const panel =
        document.createElement(
          "div"
        );

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
          class="button mobile-support-button"
        >
          Close
        </button>
      `;

      menu.appendChild(panel);

      const style =
        document.createElement(
          "style"
        );

      style.textContent = `
        .mobile-support-menu,
        .mobile-support-menu * {
          font-family:
            ForcedSquare,
            Arial,
            sans-serif !important;

          font-style: italic !important;
          font-weight: normal !important;
        }

        .mobile-support-menu {
          position: fixed;

          top: 50%;
          left: 50%;

          transform:
            translate(-50%, -50%);

          z-index: 999999;

          width:
            min(460px, 88vw);

          max-height: 90vh;

          overflow-y: auto;

          pointer-events:
            auto !important;

          touch-action:
            none !important;
        }

        .mobile-support-panel {
          box-sizing: border-box;

          width: 100%;

          padding: 24px;

          background: #212b58;

          color: white;

          pointer-events:
            auto !important;

          touch-action:
            none !important;

          user-select: none;

          -webkit-user-select: none;

          box-shadow:
            0 8px 30px
            rgba(0,0,0,0.45);
        }

        .mobile-support-title {
          margin-bottom: 24px;

          color: white;

          font-size: 25px;
        }

        .mobile-support-section-title {
          margin-bottom: 12px;

          font-size: 18px;
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
        }

        /*
         * Use PolyTrack's actual .button
         * class so these buttons get the
         * normal PolyTrack press animation.
         */
        .mobile-support-layout-button,
        .mobile-support-button {
          font-family:
            ForcedSquare,
            Arial,
            sans-serif !important;

          font-style: italic !important;
          font-weight: normal !important;

          touch-action:
            manipulation;
        }

        .mobile-support-layout-button {
          padding: 11px 13px;

          background: #17214a;

          border: none;

          color: white;

          font-size: 15px;
        }

        .mobile-support-editor {
          margin-top: 22px;

          margin-bottom: 18px;

          padding-top: 18px;

          border-top:
            1px solid
            rgba(255,255,255,0.18);
        }

        .mobile-support-editor-title {
          margin-bottom: 18px;

          font-size: 18px;
        }

        .mobile-support-slider-wrapper {
          margin-bottom: 22px;
        }

        .mobile-support-label {
          margin-bottom: 10px;

          color: white;

          font-size: 17px;
        }

        .mobile-support-slider {
          position: relative;

          width: 100%;

          height: 42px;

          display: flex;

          align-items: center;

          touch-action:
            none !important;

          pointer-events:
            auto !important;
        }

        .mobile-support-slider-track {
          position: relative;

          width: 100%;

          height: 10px;

          background: #141c3a;

          pointer-events:
            auto !important;
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
            inset 0 0 0 5px
            #212b58;

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

          font-size: 18px;
        }

        .mobile-support-hint {
          margin-bottom: 16px;

          color:
            rgba(255,255,255,0.75);

          font-size: 14px;

          line-height: 1.4;
        }
      `;

      activeMenu = menu;
      activeMenuStyle = style;

      document.head.appendChild(
        style
      );

      const layoutList =
        panel.querySelector(
          "#mobile-layout-list"
        );

      const editor =
        panel.querySelector(
          "#mobile-editor"
        );

      const refreshLayoutList =
        () => {
          layoutList.innerHTML =
            "";

          const createLayoutRow =
            (
              name,
              slot,
              isDefault
            ) => {
              const row =
                document.createElement(
                  "div"
                );

              row.className =
                "mobile-support-layout";

              const nameBox =
                document.createElement(
                  "div"
                );

              nameBox.className =
                "mobile-support-layout-name";

              nameBox.textContent =
                name;

              row.appendChild(
                nameBox
              );

              const useButton =
                document.createElement(
                  "button"
                );

              useButton.className =
                "button mobile-support-layout-button";

              useButton.textContent =
                "Use";

              useButton.addEventListener(
                "click",
                () => {
                  if (editing) {
                    stopEditing(
                      false
                    );
                  }

                  if (
                    isDefault
                  ) {
                    restoreDefault();
                  } else {
                    applyLayout(
                      slot
                    );
                  }

                  refreshLayoutList();
                }
              );

              row.appendChild(
                useButton
              );

              if (!isDefault) {
                const editButton =
                  document.createElement(
                    "button"
                  );

                editButton.className =
                  "button mobile-support-layout-button";

                editButton.textContent =
                  "Edit";

                editButton.addEventListener(
                  "click",
                  () => {
                    startEditing(
                      slot
                    );

                    openEditor(
                      slot
                    );
                  }
                );

                row.appendChild(
                  editButton
                );

                if (
                  layouts[slot]
                ) {
                  const deleteButton =
                    document.createElement(
                      "button"
                    );

                  deleteButton.className =
                    "button mobile-support-layout-button";

                  deleteButton.textContent =
                    "Delete";

                  deleteButton.addEventListener(
                    "click",
                    () => {
                      if (
                        editing &&
                        currentLayout ===
                          slot
                      ) {
                        stopEditing(
                          false
                        );
                      }

                      layouts[slot] =
                        null;

                      if (
                        currentLayout ===
                        slot
                      ) {
                        restoreDefault();
                      }

                      saveLayouts();

                      editor.innerHTML =
                        "";

                      refreshLayoutList();
                    }
                  );

                  row.appendChild(
                    deleteButton
                  );
                }
              }

              layoutList.appendChild(
                row
              );
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

      const openEditor =
        (slot) => {
          editor.innerHTML =
            "";

          const title =
            document.createElement(
              "div"
            );

          title.className =
            "mobile-support-editor-title";

          title.textContent =
            `Editing ${
              slot === "slot1"
                ? "Save 1"
                : "Save 2"
            }`;

          editor.appendChild(
            title
          );

          const hint =
            document.createElement(
              "div"
            );

          hint.className =
            "mobile-support-hint";

          hint.textContent =
            "Adjust the size and opacity of the mobile controls.";

          editor.appendChild(
            hint
          );

          createSlider(
            editor,
            "Size",
            0.75,
            1.25,
            currentSize,
            (value) => {
              currentSize =
                value;

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
              currentOpacity =
                value;

              applySettings();
            },
            "%"
          );

          const saveButton =
            document.createElement(
              "button"
            );

          saveButton.className =
            "button mobile-support-button";

          saveButton.textContent =
            "Save Layout";

          saveButton.addEventListener(
            "click",
            () => {
              stopEditing(
                true
              );

              editor.innerHTML =
                "";

              refreshLayoutList();
            }
          );

          editor.appendChild(
            saveButton
          );

          const cancelButton =
            document.createElement(
              "button"
            );

          cancelButton.className =
            "button mobile-support-button";

          cancelButton.textContent =
            "Cancel";

          cancelButton.addEventListener(
            "click",
            () => {
              stopEditing(
                false
              );

              editor.innerHTML =
                "";

              refreshLayoutList();
            }
          );

          editor.appendChild(
            cancelButton
          );
        };

      const closeButton =
        panel.querySelector(
          "#mobile-close-button"
        );

      closeButton.addEventListener(
        "click",
        closeControlsMenu
      );

      document.body.appendChild(
        menu
      );

      refreshLayoutList();
    };

    const addButton = () => {
      const container =
        document.querySelector(
          ".game-toolbar-ui > .button-container"
        );

      if (!container) {
        return;
      }

      if (
        container.querySelector(
          ".mobile-support-edit-button"
        )
      ) {
        return;
      }

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
        openControlsMenu
      );

      const watchButton =
        container.querySelector(
          'button:has(img[src="images/preview.svg"])'
        );

      if (watchButton) {
        watchButton.after(
          button
        );
      } else {
        container.appendChild(
          button
        );
      }
    };

    /*
     * Fix PolyTrack's missing
     * touchcancel handling.
     */
    const releaseCancelledTouch =
      () => {
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

          window.dispatchEvent(
            event
          );
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

          window.dispatchEvent(
            event
          );
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

    if (
      currentLayout !==
      "default"
    ) {
      applySettings();
    }

    const observer =
      new MutationObserver(
        () => {
          /*
           * If the gameplay controls
           * disappeared, the run ended.
           *
           * Close the editor immediately.
           */
          if (
            activeMenu &&
            !getTouchControls()
          ) {
            closeControlsMenu();
          }

          addButton();

          if (!editing) {
            if (
              currentLayout ===
              "default"
            ) {
              restoreDefault();
            } else {
              applySettings();
            }
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
