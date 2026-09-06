import {
  PolyMod,
  MixinType,
} from "https://cdn.polymodloader.com/cb/PolyTrackMods/PolyModLoader/0.6.2/PolyTypes.js";

class MobileSupportMod extends PolyMod {
  init = (pml) => {
    pml.registerChunkMixin("112", {
      type: MixinType.INSERT,
      token: "k.appendChild(C));",
      func: `
        {
          const button = document.createElement("button");
          button.className = "button";
          button.textContent = "MOBILE SUPPORT TEST";

          button.addEventListener("click", () => {
            console.log("[Mobile Support Mod] BUTTON CLICKED");
          });

          k.appendChild(button);
        }
      `,
    });
  };
}

export let polyMod = new MobileSupportMod();
