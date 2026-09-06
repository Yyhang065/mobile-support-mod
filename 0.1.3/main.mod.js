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
      wrapper.style.marginBottom = "18px";

      const label = document.createElement("div");
      label.textContent = `${labelText}: ${Math.round(
        value * 100
      )}${suffix}`;
      label.style.marginBottom = "8px";

      const slider = document.createElement("div");
      slider.style.position = "relative";
      slider.style.width = "100%";
      slider.style.height = "36px";
      slider.style.background = "rgba(255,255,255,0.15)";
      slider.style.borderRadius = "18px";
      slider.style.touchAction = "none";

      const fill = document.createElement("div");
      fill.style.position = "absolute";
      fill.style.left = "0";
      fill.style.top = "0";
      fill.style.height = "100%";
      fill.style.background = "rgba(255,255,255,0.35)";
      fill.style.borderRadius = "18px";
      slider.appendChild(fill);

      const updateVisual = (newValue) => {
        const percent =
          ((newValue - min) / (max - min)) * 100;

        fill.style.width = `${percent}%`;

        label.textContent = `${labelText}: ${Math.round(
          newValue * 100
        )}${suffix}`;
      };

      let dragging = false;

      const updateFromEvent = (event) => {
        const rect = slider.getBoundingClientRect();

        const clientX =
          event.touches && event.touches.length
            ? event.touches[0].clientX
            : event.clientX;

        let percent = (clientX - rect.left) / rect.width;

        percent = Math.max(0, Math.min(1, percent));

        let newValue = min + (max - min) * percent;

        newValue = Math.round(newValue * 100) / 100;

        updateVisual(newValue);
        onChange(newValue);
      };

      const startDrag = (event) => {
        dragging = true;

        event.stopPropagation();

        updateFromEvent(event);
      };

      const moveDrag = (event) => {
        if (!dragging) return;

        event.stopPropagation();

        updateFromEvent(event);
      };

      const endDrag = (event) => {
        dragging = false;

        if (event) {
          event.stopPropagation();
        }
      };

      slider.addEventListener("touchstart", startDrag, {
        passive: true,
      });

      slider.addEventListener("touchmove", moveDrag, {
        passive: true,
      });

      slider.addEventListener("touchend", endDrag, {
        passive: true,
      });

      slider.addEventListener("touchcancel", endDrag, {
        passive: true,
      });

      slider.addEventListener("mousedown", startDrag);

      window.addEventListener("mousemove", (event) => {
        if (dragging) {
          updateFromEvent(event);
        }
      });

      window.addEventListener("mouseup", endDrag);

      updateVisual(value);

      wrapper.appendChild(label);
      wrapper.appendChild(slider);
      parent.appendChild(wrapper);
    };

    const openControlsMenu = () => {
      if (document.querySelector(".mobile-support-panel")) return;

      const panel = document.createElement("div");
      panel.className = "mobile-support-panel";

      panel.style.position = "fixed";
      panel.style.left = "50%";
      panel.style.top = "50%";
      panel.style.transform = "translate(-50%, -50%)";
      panel.style.width = "min(420px, 85vw)";
      panel.style.padding = "24px";
      panel.style.background = "rgba(20,20,20,0.95)";
      panel.style.borderRadius = "16px";
      panel.style.zIndex = "999999";
      panel.style.color = "white";
      panel.style.fontFamily = "sans-serif";
      panel.style.boxSizing = "border-box";

      const title = document.createElement("div");
      title.textContent = "Mobile Controls";
      title.style.fontSize = "24px";
      title.style.fontWeight = "bold";
      title.style.marginBottom = "22px";

      panel.appendChild(title);

      createSlider(
        panel,
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
        panel,
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

      const closeButton = document.createElement("button");

      closeButton.textContent = "Close";
      closeButton.style.width = "100%";
      closeButton.style.padding = "12px";
      closeButton.style.marginTop = "4px";
      closeButton.style.fontSize = "18px";
      closeButton.style.border = "none";
      closeButton.style.borderRadius = "10px";
      closeButton.style.background = "rgba(255,255,255,0.15)";
      closeButton.style.color = "white";

      closeButton.addEventListener("click", () => {
        panel.remove();
      });

      panel.appendChild(closeButton);

      document.body.appendChild(panel);
    };

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

    /*
     * PolyTrack does not listen for touchcancel.
     *
     * Safari can sometimes cancel a touch instead of sending
     * a normal touchend. PolyTrack's internal steering state can
     * therefore remain active.
     *
     * When this happens, create a synthetic touchend with no
     * touches so PolyTrack's own handler clears up/down/left/right.
     */
    const releaseCancelledTouch = () => {
      try {
        const event = new TouchEvent("touchend", {
          bubbles: true,
          cancelable: true,
          touches: [],
          targetTouches: [],
          changedTouches: [],
        });

        window.dispatchEvent(event);
      } catch {
        const event = new Event("touchend", {
          bubbles: true,
          cancelable: true,
        });

        Object.defineProperty(event, "touches", {
          value: {
            length: 0,
            item: () => null,
          },
        });

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

    const observer = new MutationObserver(() => {
      addButton();
      applySettings();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  };
}

export let polyMod = new MobileSupportMod();
