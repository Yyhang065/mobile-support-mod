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
      button.textContent = "TEST";

      button.addEventListener("click", () => {
        console.log("[Mobile Support Mod] TEST BUTTON CLICKED");
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

    const observer = new MutationObserver(addButton);

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  };
}

export let polyMod = new MobileSupportMod();
