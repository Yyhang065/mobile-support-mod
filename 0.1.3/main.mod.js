import { PolyMod } from "https://cdn.polymodloader.com/cb/PolyTrackMods/PolyModLoader/0.6.2/PolyTypes.js";

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

      const size = currentSize;
      const opacity = currentOpacity;

      const buttonSize = 160 * size;

      const buttons = controls.querySelectorAll(
        ":scope > button"
      );

      buttons.forEach((button) => {
        button.style.width = `${buttonSize}px`;
        button.style.height = `${buttonSize}px`;
        button.style.opacity = opacity;
        button.style.transform = "none";
      });

      const steeringButtons = controls.querySelectorAll(
        ":scope > div > div"
      );

      steeringButtons.forEach((button) => {
        button.style.width = `${buttonSize}px`;
        button.style.height = `${buttonSize}px`;
        button.style.opacity = opacity;
        button.style.transform = "none";
      });
    };

    const createSlider = (parent, min, max, value, onChange) => {
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
      parent.appendChild(slider);

      let dragging = false;

      const updateFromPosition = (clientX) => {
        const rect = track.getBoundingClientRect();

        let percentage =
          (clientX - rect.left) / rect.width;

        percentage = Math.max(
          0,
          Math.min(1, percentage)
        );

        const newValue =
          min + percentage * (max - min);

        fill.style.width = `${percentage * 100}%`;
        knob.style.left = `${percentage * 100}%`;

        onChange(newValue);
      };

      const startDrag = (event) => {
        dragging = true;

        event.preventDefault();
        event.stopPropagation();

        const touch = event.touches
          ? event.touches[0]
          : event;

        updateFromPosition(touch.clientX);
      };

      const moveDrag = (event) => {
        if (!dragging) return;

        event.preventDefault();
        event.stopPropagation();

        const touch = event.touches
          ? event.touches[0]
          : event;

        updateFromPosition(touch.clientX);
      };

      const endDrag = (event) => {
        dragging = false;

        if (event) {
          event.stopPropagation();
        }
      };

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

      slider.addEventListener(
        "touchstart",
        startDrag,
        { passive: false }
      );

      document.addEventListener(
        "touchmove",
        moveDrag,
        { passive: false }
      );

      document.addEventListener(
        "touchend",
        endDrag,
        { passive: false }
      );

      const initialPercentage =
        ((value - min) / (max - min)) * 100;

      fill.style.width =
        `${initialPercentage}%`;

      knob.style.left =
        `${initialPercentage}%`;

      return slider;
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

        <div class="mobile-support-label">
          Size:
          <span id="mobile-size-value">
            ${Math.round(currentSize * 100)}%
          </span>
        </div>

        <div id="mobile-size-slider"></div>

        <div class="mobile-support-label">
          Opacity:
          <span id="mobile-opacity-value">
            ${Math.round(currentOpacity * 100)}%
          </span>
        </div>

        <div id="mobile-opacity-slider"></div>

        <button
          id="mobile-close-button"
          class="button"
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
          pointer-events: auto !important;
          touch-action: none !important;
        }

        .mobile-support-panel {
          min-width: 280px;
          padding: 20px;
          background: var(--background-color, #222);
          border: 2px solid var(--button-color, #555);
          border-radius: 8px;
          font-family: inherit;
          color: white;
          pointer-events: auto !important;
          touch-action: none !important;
          user-select: none;
          -webkit-user-select: none;
        }

        .mobile-support-title {
          color: white;
          font-size: 24px;
          margin-bottom: 20px;
        }

        .mobile-support-label {
          display: block;
          margin-top: 12px;
          margin-bottom: 8px;
          color: white;
          font-size: 16px;
        }

        .mobile-support-label span {
          color: white;
        }

        .mobile-support-slider {
          width: 100%;
          height: 40px;
          display: flex;
          align-items: center;
          touch-action: none !important;
          pointer-events: auto !important;
          position: relative;
        }

        .mobile-support-slider-track {
          position: relative;
          width: 100%;
          height: 8px;
          background: rgba(255, 255, 255, 0.25);
          border-radius: 4px;
          pointer-events: auto !important;
        }

        .mobile-support-slider-fill {
          position: absolute;
          left: 0;
          top: 0;
          height: 100%;
          width: 0%;
          background: white;
          border-radius: 4px;
          pointer-events: none;
        }

        .mobile-support-slider-knob {
          position: absolute;
          top: 50%;
          width: 20px;
          height: 20px;
          transform: translate(-50%, -50%);
          background: white;
          border-radius: 50%;
          pointer-events: none;
        }

        #mobile-close-button {
          margin-top: 20px;
          width: 100%;
          color: white;
          pointer-events: auto !important;
          touch-action: manipulation !important;
        }
      `;

      document.head.appendChild(style);
      document.body.appendChild(menu);

      const sizeValue =
        panel.querySelector(
          "#mobile-size-value"
        );

      const opacityValue =
        panel.querySelector(
          "#mobile-opacity-value"
        );

      createSlider(
        panel.querySelector(
          "#mobile-size-slider"
        ),
        0.5,
        1.5,
        currentSize,
        (value) => {
          currentSize = value;

          sizeValue.textContent =
            `${Math.round(value * 100)}%`;

          applySettings();
        }
      );

      createSlider(
        panel.querySelector(
          "#mobile-opacity-slider"
        ),
        0.1,
        1,
        currentOpacity,
        (value) => {
          currentOpacity = value;

          opacityValue.textContent =
            `${Math.round(value * 100)}%`;

          applySettings();
        }
      );

      panel
        .querySelector(
          "#mobile-close-button"
        )
        .addEventListener("click", () => {
          menu.remove();
          style.remove();
        });

      applySettings();
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

      const button = document.createElement("button");

      button.className =
        "button mobile-support-button";

      button.textContent = "Edit Mobile";

      button.addEventListener("click", () => {
        openControlsMenu();
      });

      const watchButton = container.querySelector(
        'button:has(img[src="images/preview.svg"])'
      );

      if (watchButton) {
        watchButton.after(button);
      } else {
        container.appendChild(button);
      }
    };

    addButton();

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
