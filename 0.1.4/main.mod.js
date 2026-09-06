import {
  PolyMod,
} from "https://cdn.polymodloader.com/cb/PolyTrackMods/PolyModLoader/0.6.2/PolyTypes.js";

class MobileSupportMod extends PolyMod {
  postInit = () => {
    let currentSize = 1;
    let currentOpacity = 0.6;

    const getTouchControls = () => {
      return document.querySelector(".touch-controls-ui");
    };

    const applySettings = () => {
      const controls = getTouchControls();
      if (!controls) return;

      const buttonSize = 160 * currentSize;

      const buttons = controls.querySelectorAll(":scope > button");

      buttons.forEach((button) => {
        button.style.width = `${buttonSize}px`;
        button.style.height = `${buttonSize}px`;
        button.style.opacity = currentOpacity;
        button.style.transform = "none";
      });

      const steeringButtons = controls.querySelectorAll(
        ":scope > div > div"
      );

      steeringButtons.forEach((button) => {
        button.style.width = `${buttonSize}px`;
        button.style.height = `${buttonSize}px`;
        button.style.opacity = currentOpacity;
        button.style.transform = "none";
      });
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
      const wrapper = document.createElement("div");
      wrapper.className = "mobile-support-slider-wrapper";

      const label = document.createElement("div");
      label.className = "mobile-support-label";

      const valueText = document.createElement("span");
      valueText.className = "mobile-support-value";

      const updateLabel = (newValue) => {
        valueText.textContent = `${Math.round(
          newValue * 100
        )}${suffix}`;
      };

      label.textContent = `${labelText}: `;
      label.appendChild(valueText);

      const slider = document.createElement("div");
      slider.className = "mobile-support-slider";

      const track = document.createElement("div");
      track.className = "mobile-support-slider-track";

      const fill = document.createElement("div");
      fill.className = "mobile-support-slider-fill";

      const knob = document.createElement("div");
      knob.className = "mobile-support-slider-knob";

      track.appendChild(fill);
      track.appendChild(knob);
      slider.appendChild(track);
      wrapper.appendChild(label);
      wrapper.appendChild(slider);
      parent.appendChild(wrapper);

      let dragging = false;

      const updateVisual = (newValue) => {
        const percentage =
          ((newValue - min) / (max - min)) * 100;

        fill.style.width = `${percentage}%`;
        knob.style.left = `${percentage}%`;

        updateLabel(newValue);
      };

      const updateFromEvent = (event) => {
        const rect = track.getBoundingClientRect();

        const clientX =
          event.touches && event.touches.length
            ? event.touches[0].clientX
            : event.clientX;

        let percentage =
          (clientX - rect.left) / rect.width;

        percentage = Math.max(
          0,
          Math.min(1, percentage)
        );

        let newValue =
          min + (max - min) * percentage;

        newValue =
          Math.round(newValue * 100) / 100;

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
      if (
        document.querySelector(
          ".mobile-support-menu"
        )
      ) {
        return;
      }

      const menu = document.createElement("div");
      menu.className = "mobile-support-menu";

      const panel = document.createElement("div");
      panel.className = "mobile-support-panel";

      panel.innerHTML = `
        <div class="mobile-support-title">
          Edit Mobile
        </div>

        <div id="mobile-size-slider"></div>

        <div id="mobile-opacity-slider"></div>

        <button
          id="mobile-close-button"
          class="mobile-support-button"
        >
          Close
        </button>
      `;

      menu.appendChild(panel);

      const style = document.createElement("style");

      style.textContent = `
        .mobile-support-menu {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);

          z-index: 999999;

          width: min(430px, 88vw);
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

          border: none;

          border-radius: 0;

          color: white;

          font-family: inherit;

          pointer-events: auto !important;
          touch-action: none !important;

          user-select: none;
          -webkit-user-select: none;

          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.45);
        }

        .mobile-support-title {
          margin-bottom: 26px;

          color: white;

          font-size: 25px;
          font-weight: bold;

          text-align: center;
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

        .mobile-support-value {
          color: white;
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

          border-radius: 0;

          pointer-events: auto !important;
        }

        .mobile-support-slider-fill {
          position: absolute;

          left: 0;
          top: 0;

          height: 100%;
          width: 0%;

          background: #33477f;

          border-radius: 0;

          pointer-events: none;
        }

        .mobile-support-slider-knob {
          position: absolute;

          top: 50%;

          width: 32px;
          height: 32px;

          transform: translate(-50%, -50%);

          box-sizing: border-box;

          background: white;

          border: 4px solid white;

          border-radius: 0;

          box-shadow: inset 0 0 0 5px #212b58;

          pointer-events: none;
        }

        .mobile-support-button {
          width: 100%;

          margin-top: 8px;
          padding: 12px 18px;

          box-sizing: border-box;

          background: #17214a;

          border: none;
          border-radius: 0;

          color: white;

          font-family: inherit;

          font-size: 18px;
          font-weight: bold;

          cursor: pointer;

          touch-action: manipulation;
        }

        .mobile-support-button:active {
          background: #33477f;
        }
      `;

      document.head.appendChild(style);

      const sizeSlider = panel.querySelector(
        "#mobile-size-slider"
      );

      const opacitySlider = panel.querySelector(
        "#mobile-opacity-slider"
      );

      createSlider(
        sizeSlider,
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
        opacitySlider,
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

      const closeButton =
        panel.querySelector(
          "#mobile-close-button"
        );

      closeButton.addEventListener(
        "click",
        () => {
          menu.remove();
          style.remove();
        }
      );

      document.body.appendChild(menu);
    };

    const addButton = () => {
      const container = document.querySelector(
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

      button.textContent = "Edit Mobile";

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
     *
     * Safari can sometimes cancel a touch instead
     * of sending a normal touchend. This makes sure
     * the steering state is cleared.
     */

    const releaseCancelledTouch = () => {
      try {
        const event = new TouchEvent(
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
        const event = new Event(
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
    applySettings();

    const observer =
      new MutationObserver(() => {
        addButton();
        applySettings();
      });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  };
}

export let polyMod =
  new MobileSupportMod();
