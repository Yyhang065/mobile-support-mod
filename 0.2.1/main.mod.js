import {
  PolyMod,
} from "https://cdn.polymodloader.com/cb/PolyTrackMods/PolyModLoader/0.6.2/PolyTypes.js";

class MobileSupportMod extends PolyMod {
  postInit = () => {
    const STORAGE_KEY = "mobile-support-mod-layouts-v3";

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
    let closingMenu = null;

    const loadLayouts = () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);

          layouts = {
            slot1: parsed?.slot1
              ? {
                  size: Number(parsed.slot1.size) || DEFAULT_SIZE,
                  opacity:
                    Number(parsed.slot1.opacity) || DEFAULT_OPACITY,
                }
              : null,

            slot2: parsed?.slot2
              ? {
                  size: Number(parsed.slot2.size) || DEFAULT_SIZE,
                  opacity:
                    Number(parsed.slot2.opacity) || DEFAULT_OPACITY,
                }
              : null,
          };
        }
      } catch {
        layouts = {
          slot1: null,
          slot2: null,
        };
      }
    };

    const saveLayouts = () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(layouts));
    };

    const getTouchControls = () =>
      document.querySelector(".touch-controls-ui");

    const getControls = () => {
      const root = getTouchControls();

      if (!root) return [];

      return [
        ...root.querySelectorAll(
          ":scope > button, :scope > div > div"
        ),
      ];
    };

    const restoreDefault = () => {
      currentSize = DEFAULT_SIZE;
      currentOpacity = DEFAULT_OPACITY;

      const controls = getControls();

      controls.forEach((control) => {
        control.style.width = "";
        control.style.height = "";
        control.style.opacity = "";
        control.style.transform = "";
        control.style.position = "";
        control.style.left = "";
        control.style.top = "";
        control.style.right = "";
        control.style.bottom = "";
        control.style.backgroundSize = "";
        control.style.backgroundPosition = "";
        control.style.outline = "";
      });
    };

    const applySettings = () => {
      const controls = getControls();

      controls.forEach((control) => {
        const baseWidth =
          control.tagName === "BUTTON" ? 160 : 160;

        const size = Math.max(
          0.75,
          Math.min(1.25, currentSize)
        );

        const finalSize = baseWidth * size;

        control.style.width = `${finalSize}px`;
        control.style.height = `${finalSize}px`;
        control.style.opacity = currentOpacity;

        control.style.position = "";
        control.style.left = "";
        control.style.top = "";
        control.style.right = "";
        control.style.bottom = "";
      });

      const reset = document.querySelector(
        ".touch-controls-ui > .reset"
      );

      if (reset) {
        if (currentLayout === "default") {
          reset.style.backgroundSize = "";
          reset.style.backgroundPosition = "";
        } else {
          reset.style.backgroundSize = `${32 * currentSize}px`;
          reset.style.backgroundPosition = "center";
        }
      }
    };

    const setLayout = (layoutName) => {
      currentLayout = layoutName;

      if (layoutName === "default") {
        restoreDefault();
        return;
      }

      const layout = layouts[layoutName];

      if (!layout) {
        currentSize = DEFAULT_SIZE;
        currentOpacity = DEFAULT_OPACITY;
        applySettings();
        return;
      }

      currentSize = Math.max(
        0.75,
        Math.min(1.25, Number(layout.size) || DEFAULT_SIZE)
      );

      currentOpacity = Math.max(
        0.1,
        Math.min(1, Number(layout.opacity) || DEFAULT_OPACITY)
      );

      applySettings();
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
      const wrapper = document.createElement("div");
      wrapper.className = "mobile-support-slider";

      const label = document.createElement("div");
      label.className = "mobile-support-slider-label";

      const labelName = document.createElement("span");
      labelName.textContent = labelText;

      const valueText = document.createElement("span");
      valueText.className = "mobile-support-slider-value";
      valueText.textContent = formatter(value);

      label.appendChild(labelName);
      label.appendChild(valueText);

      const track = document.createElement("div");
      track.className = "mobile-support-slider-track";

      const fill = document.createElement("div");
      fill.className = "mobile-support-slider-fill";

      const knob = document.createElement("div");
      knob.className = "mobile-support-slider-knob";

      track.appendChild(fill);
      track.appendChild(knob);

      wrapper.appendChild(label);
      wrapper.appendChild(track);
      parent.appendChild(wrapper);

      let dragging = false;

      const updateFromPointer = (clientX) => {
        const rect = track.getBoundingClientRect();

        let ratio =
          (clientX - rect.left) / rect.width;

        ratio = Math.max(0, Math.min(1, ratio));

        let newValue =
          min + ratio * (max - min);

        newValue =
          Math.round(newValue / step) * step;

        newValue =
          Math.max(min, Math.min(max, newValue));

        const percent =
          ((newValue - min) / (max - min)) * 100;

        fill.style.width = `${percent}%`;
        knob.style.left = `${percent}%`;

        valueText.textContent = formatter(newValue);

        onChange(newValue);
      };

      const pointerDown = (event) => {
        event.preventDefault();
        event.stopPropagation();

        dragging = true;
        updateFromPointer(event.clientX);
      };

      const pointerMove = (event) => {
        if (!dragging) return;

        event.preventDefault();
        updateFromPointer(event.clientX);
      };

      const pointerUp = () => {
        dragging = false;
      };

      track.addEventListener("mousedown", pointerDown);

      document.addEventListener("mousemove", pointerMove);
      document.addEventListener("mouseup", pointerUp);

      track.addEventListener(
        "touchstart",
        (event) => {
          event.preventDefault();
          event.stopPropagation();

          dragging = true;

          updateFromPointer(
            event.touches[0].clientX
          );
        },
        { passive: false }
      );

      document.addEventListener(
        "touchmove",
        (event) => {
          if (!dragging) return;

          event.preventDefault();

          updateFromPointer(
            event.touches[0].clientX
          );
        },
        { passive: false }
      );

      document.addEventListener("touchend", pointerUp);

      const initialPercent =
        ((value - min) / (max - min)) * 100;

      fill.style.width = `${initialPercent}%`;
      knob.style.left = `${initialPercent}%`;

      return wrapper;
    };

    const closeControlsMenu = () => {
      if (!activeMenu) return;

      const menu = activeMenu;

      activeMenu = null;
      editing = false;

      menu.classList.remove(
        "mobile-support-fade-in"
      );
      menu.classList.add(
        "mobile-support-fade-out"
      );

      menu.style.pointerEvents = "none";

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

      const menu = document.createElement("div");
      menu.className =
        "mobile-support-menu mobile-support-fade-in";

      const style = document.createElement("style");

      style.textContent = `
        .mobile-support-menu {
          position: fixed;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          width: min(420px, 85vw);
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
            0 8px 30px rgba(0, 0, 0, 0.45);
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
        }

        .mobile-support-slider-fill {
          position: absolute;
          left: 0;
          top: 0;

          height: 100%;
          width: 50%;

          background: #33477f;
          border-radius: 3px;
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

        .mobile-support-editing {
          outline: 2px solid white;
        }
      `;

      document.head.appendChild(style);

      activeMenuStyle = style;
      activeMenu = menu;

      const title = document.createElement("div");
      title.className = "mobile-support-title";
      title.textContent = "Edit Mobile";

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

      settingsSection.appendChild(settingsTitle);

      createSlider(
        settingsSection,
        "Size",
        0.75,
        1.25,
        currentSize,
        0.01,
        (value) => {
          currentSize = value;

          if (currentLayout !== "default") {
            applySettings();
          } else {
            applySettings();
          }
        },
        (value) =>
          `${Math.round(value * 100)}%`
      );

      createSlider(
        settingsSection,
        "Opacity",
        0.1,
        1,
        currentOpacity,
        0.01,
        (value) => {
          currentOpacity = value;
          applySettings();
        },
        (value) =>
          `${Math.round(value * 100)}%`
      );

      menu.appendChild(settingsSection);

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

      layoutSection.appendChild(layoutTitle);

      const layoutContainer =
        document.createElement("div");

      layoutContainer.className =
        "mobile-support-layout";

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

        nameButton.className = "button";
        nameButton.textContent = displayName;

        nameButton.addEventListener(
          "click",
          () => {
            if (name === "default") {
              setLayout("default");
              return;
            }

            if (!layouts[name]) {
              layouts[name] = {
                size: currentSize,
                opacity: currentOpacity,
              };

              saveLayouts();
            }

            setLayout(name);

            refreshLayoutButtons();
          }
        );

        row.appendChild(nameButton);

        if (name !== "default") {
          const editButton =
            document.createElement("button");

          editButton.className = "button";
          editButton.textContent = "Edit";

          editButton.addEventListener(
            "click",
            () => {
              if (!layouts[name]) {
                layouts[name] = {
                  size: DEFAULT_SIZE,
                  opacity: DEFAULT_OPACITY,
                };
              }

              currentLayout = name;

              currentSize =
                layouts[name].size;

              currentOpacity =
                layouts[name].opacity;

              editing = true;

              applySettings();
              refreshLayoutButtons();
              updateSliders();
            }
          );

          const useButton =
            document.createElement("button");

          useButton.className = "button";
          useButton.textContent = "Use";

          useButton.addEventListener(
            "click",
            () => {
              if (!layouts[name]) return;

              setLayout(name);
              refreshLayoutButtons();
              updateSliders();
            }
          );

          const deleteButton =
            document.createElement("button");

          deleteButton.className = "button";
          deleteButton.textContent = "Delete";

          deleteButton.addEventListener(
            "click",
            () => {
              layouts[name] = null;

              if (currentLayout === name) {
                currentLayout = "default";
                restoreDefault();
              }

              saveLayouts();

              refreshLayoutButtons();
              updateSliders();
            }
          );

          row.appendChild(editButton);
          row.appendChild(useButton);
          row.appendChild(deleteButton);
        }

        return row;
      };

      let slotRows = {};

      const refreshLayoutButtons = () => {
        Object.values(slotRows).forEach(
          (row) => row.remove()
        );

        slotRows = {};

        const defaultRow =
          createLayoutRow(
            "default",
            "Default"
          );

        layoutContainer.appendChild(
          defaultRow
        );

        slotRows.default = defaultRow;

        if (layouts.slot1) {
          const row =
            createLayoutRow(
              "slot1",
              "Save 1"
            );

          layoutContainer.appendChild(row);
          slotRows.slot1 = row;
        } else {
          const row =
            document.createElement("div");

          row.className =
            "mobile-support-layout-row";

          const createButton =
            document.createElement("button");

          createButton.className = "button";
          createButton.textContent =
            "Create Save 1";

          createButton.addEventListener(
            "click",
            () => {
              layouts.slot1 = {
                size: currentSize,
                opacity: currentOpacity,
              };

              currentLayout = "slot1";
              editing = true;

              saveLayouts();
              applySettings();

              refreshLayoutButtons();
              updateSliders();
            }
          );

          row.appendChild(createButton);
          layoutContainer.appendChild(row);

          slotRows.slot1 = row;
        }

        if (layouts.slot2) {
          const row =
            createLayoutRow(
              "slot2",
              "Save 2"
            );

          layoutContainer.appendChild(row);
          slotRows.slot2 = row;
        } else {
          const row =
            document.createElement("div");

          row.className =
            "mobile-support-layout-row";

          const createButton =
            document.createElement("button");

          createButton.className = "button";
          createButton.textContent =
            "Create Save 2";

          createButton.addEventListener(
            "click",
            () => {
              layouts.slot2 = {
                size: currentSize,
                opacity: currentOpacity,
              };

              currentLayout = "slot2";
              editing = true;

              saveLayouts();
              applySettings();

              refreshLayoutButtons();
              updateSliders();
            }
          );

          row.appendChild(createButton);
          layoutContainer.appendChild(row);

          slotRows.slot2 = row;
        }
      };

      const updateSliders = () => {
        const tracks =
          menu.querySelectorAll(
            ".mobile-support-slider-track"
          );

        if (tracks.length < 2) return;

        const values = [
          {
            value: currentSize,
            min: 0.75,
            max: 1.25,
          },
          {
            value: currentOpacity,
            min: 0.1,
            max: 1,
          },
        ];

        tracks.forEach((track, index) => {
          const data = values[index];

          const percent =
            ((data.value - data.min) /
              (data.max - data.min)) *
            100;

          const fill =
            track.querySelector(
              ".mobile-support-slider-fill"
            );

          const knob =
            track.querySelector(
              ".mobile-support-slider-knob"
            );

          const valueText =
            track.parentElement.querySelector(
              ".mobile-support-slider-value"
            );

          if (fill) {
            fill.style.width =
              `${percent}%`;
          }

          if (knob) {
            knob.style.left =
              `${percent}%`;
          }

          if (valueText) {
            valueText.textContent =
              index === 0
                ? `${Math.round(
                    data.value * 100
                  )}%`
                : `${Math.round(
                    data.value * 100
                  )}%`;
          }
        });
      };

      layoutSection.appendChild(
        layoutContainer
      );

      menu.appendChild(layoutSection);

      const closeButton =
        document.createElement("button");

      closeButton.className =
        "button mobile-support-close";

      closeButton.textContent = "Close";

      closeButton.addEventListener(
        "click",
        () => {
          if (
            editing &&
            currentLayout !== "default"
          ) {
            layouts[currentLayout] = {
              size: currentSize,
              opacity: currentOpacity,
            };

            saveLayouts();
          }

          closeControlsMenu();
        }
      );

      menu.appendChild(closeButton);

      const blockGameTouch = (event) => {
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

      refreshLayoutButtons();
      updateSliders();

      document.body.appendChild(menu);

      if (currentLayout === "default") {
        restoreDefault();
      } else {
        applySettings();
      }
    };

    const createEditButton = () => {
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
        [...toolbar.children].find(
          (child) =>
            child.textContent?.trim() ===
            "Watch"
        );

      if (!watchButton) return;

      const button =
        document.createElement("button");

      button.className =
        "button mobile-support-edit-button";

      button.textContent = "Edit Mobile";

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

        if (
          currentLayout === "default"
        ) {
          restoreDefault();
        } else {
          applySettings();
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
          new TouchEvent("touchend", {
            bubbles: true,
            cancelable: true,
          });

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
