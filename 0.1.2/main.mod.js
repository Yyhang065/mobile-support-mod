import { PolyMod } from "https://cdn.polymodloader.com/cb/PolyTrackMods/PolyModLoader/0.6.2/PolyTypes.js";

class MobileSupportMod extends PolyMod {
  postInit = () => {
    const addButton = () => {
      const container = document.querySelector(
        ".game-toolbar-ui > .button-container"
      );

      if (!container) return;

      if (container.querySelector(".mobile-support-button")) return;

      const button = document.createElement("button");
      button.className = "button mobile-support-button";
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

    const getTouchControls = () => {
      return document.querySelector(".touch-controls-ui");
    };

    const applySettings = (size, opacity) => {
      const controls = getTouchControls();

      if (!controls) return;

      const elements = controls.querySelectorAll(
        ":scope > button, :scope > div > div"
      );

      elements.forEach((element) => {
        element.style.transform = `scale(${size})`;
        element.style.opacity = opacity;
      });
    };

    const openControlsMenu = () => {
      if (document.querySelector(".mobile-support-menu")) return;

      const menu = document.createElement("div");
      menu.className = "mobile-support-menu";

      menu.innerHTML = `
        <div class="mobile-support-panel">
          <div class="mobile-support-title">Edit Mobile</div>

          <label>
            Size:
            <span id="mobile-size-value">100%</span>
          </label>

          <input
            id="mobile-size-slider"
            type="range"
            min="0.5"
            max="1.5"
            step="0.05"
            value="1"
          >

          <label>
            Opacity:
            <span id="mobile-opacity-value">60%</span>
          </label>

          <input
            id="mobile-opacity-slider"
            type="range"
            min="0.1"
            max="1"
            step="0.05"
            value="0.6"
          >

          <button id="mobile-close-button" class="button">
            Close
          </button>
        </div>
      `;

      const style = document.createElement("style");

      style.textContent = `
        .mobile-support-menu {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 999999;
          pointer-events: auto !important;
          touch-action: auto !important;
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
          touch-action: auto !important;
        }

        .mobile-support-title {
          color: white;
          font-size: 24px;
          margin-bottom: 20px;
        }

        .mobile-support-panel label {
          display: block;
          margin-top: 12px;
          margin-bottom: 6px;
          color: white;
        }

        .mobile-support-panel label span {
          color: white;
        }

        .mobile-support-panel input[type="range"] {
          display: block;
          width: 100%;
          height: 24px;
          margin: 0;
          pointer-events: auto !important;
          touch-action: pan-y !important;
          cursor: pointer;
          position: relative;
          z-index: 1000000;
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

      const sizeSlider = menu.querySelector("#mobile-size-slider");
      const opacitySlider = menu.querySelector("#mobile-opacity-slider");

      const sizeValue = menu.querySelector("#mobile-size-value");
      const opacityValue = menu.querySelector("#mobile-opacity-value");

      sizeSlider.addEventListener("input", () => {
        const size = Number(sizeSlider.value);

        sizeValue.textContent = `${Math.round(size * 100)}%`;

        applySettings(
          size,
          Number(opacitySlider.value)
        );
      });

      opacitySlider.addEventListener("input", () => {
        const opacity = Number(opacitySlider.value);

        opacityValue.textContent = `${Math.round(opacity * 100)}%`;

        applySettings(
          Number(sizeSlider.value),
          opacity
        );
      });

      menu.querySelector("#mobile-close-button").addEventListener(
        "click",
        () => {
          menu.remove();
          style.remove();
        }
      );

      applySettings(
        Number(sizeSlider.value),
        Number(opacitySlider.value)
      );
    };

    addButton();

    const observer = new MutationObserver(addButton);

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  };
}

export let polyMod = new MobileSupportMod();
