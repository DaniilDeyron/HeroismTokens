import { HeroismWindow } from "./window.js";
import { HeroismGMView } from "./gm-view.js";
import { HeroismStore } from "./storage.js";

const MODULE_ID = "heroism-tokens";
let playerWindow = null;
let gmWindow = null;

Hooks.once("init", () => {
  console.log(`[${MODULE_ID}] Initializing Heroism Tokens for Foundry VTT 13`);
});

Hooks.once("ready", () => {
  // Warm up local store and subscribe to cross-client updates.
  HeroismStore.init();
  game.socket.on(`module.${MODULE_ID}`, (payload) => {
    if (!payload || payload.type !== "user-state") return;
    if (game.user.isGM && gmWindow?.rendered) gmWindow.render({ force: true });
  });
});

Hooks.on("getSceneControlButtons", (controls) => {
  const control = {
    name: "heroism-tokens",
    title: "Жетоны героизма",
    icon: "fas fa-coins",
    layer: "TokenLayer",
    visible: true,
    tools: [{
      name: "open-heroism",
      title: "Открыть жетоны героизма",
      icon: `fa-solid fa-coins`,
      button: true,
      onClick: () => {
        if (!playerWindow || !playerWindow.rendered) playerWindow = new HeroismWindow();
        playerWindow.render({ force: true });
      }
    }]
  };

  // V13 uses an object keyed by control name.
  if (Array.isArray(controls)) {
    controls.push(control);
  } else {
    controls[control.name] = control;
  }
});

Hooks.on("getHeaderControlsApplicationV2", (app, controls) => {
  if (!game.user.isGM) return;
  controls.push({
    icon: "fas fa-users",
    label: "Жетоны игроков",
    onClick: () => {
      if (!gmWindow || !gmWindow.rendered) gmWindow = new HeroismGMView();
      gmWindow.render({ force: true });
    }
  });
});

Hooks.on("userConnected", () => {
  if (game.user.isGM && gmWindow?.rendered) gmWindow.render({ force: true });
});

Hooks.on("updateUser", (user) => {
  if (game.user.isGM && gmWindow?.rendered) gmWindow.render({ force: true });
});

Hooks.on("canvasReady", () => {
  // No scene-specific state; tool remains persistent across scene changes.
});