import {
  PolyMod,
  MixinType,
} from "https://cdn.polymodloader.com/cb/PolyTrackMods/PolyModLoader/0.6.2/PolyTypes.js";

class MobileSupportMod extends PolyMod {
  init = (pml) => {
    pml.registerGlobalMixin({
      type: MixinType.INSERT,
      token: `e.append(document.createTextNode(n.get("Watch"))),`,
      func: `
        {
          const button = document.createElement("button");

          button.className = "button";
          button.textContent = "CUSTOMIZE CONTROLS";

          button.addEventListener("click", () => {
            console.log("[Mobile Support Mod] CUSTOMIZE CONTROLS CLICKED");
          });

          m.appendChild(button);
        }
      `,
    });
  };
}

export let polyMod = new MobileSupportMod();
