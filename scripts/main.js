import { HeroismWindow } from "./window.js";
import { HeroismGMView } from "./gm-view.js";
import { HeroismStore } from "./storage.js";

const MODULE_ID = "heroism-tokens";
let playerWindow = null;
let gmWindow = null;

function openPlayerWindow() {
  if (!playerWindow) playerWindow = new HeroismWindow();
  playerWindow.render({ force: true });
}

function openGMWindow() {
  if (!gmWindow) gmWindow = new HeroismGMView();
  gmWindow.render({ force: true });
}

Hooks.once("init", () => {
  console.log(`[${MODULE_ID}] Initializing Heroism Tokens for Foundry VTT 13`);
});

Hooks.once("ready", () => {
  HeroismStore.init();
  game.socket.on(`module.${MODULE_ID}`, (payload) => {
    if (!payload || payload.type !== "user-state") return;
    if (game.user.isGM && gmWindow?.rendered) gmWindow.render({ force: true });
  });
});

Hooks.on("getSceneControlButtons", (controls) => {
  // Add the launcher as a single tool inside Foundry's existing Token controls.
  // This avoids creating a separate control group for a module with one button.
  const tokenControl = controls.tokens;
  if (!tokenControl?.tools) {
    console.warn(`[${MODULE_ID}] Could not find the Token scene control group.`);
    return;
  }

  tokenControl.tools.heroismTokens = {
    name: "heroismTokens",
    title: "Открыть жетоны героизма",
    icon: "fa-solid fa-coins",
    button: true,
    visible: true,
    order: Object.keys(tokenControl.tools).length,
    onChange: () => openPlayerWindow()
  };
});

Hooks.on("getHeaderControlsApplicationV2", (app, controls) => {
  if (!game.user.isGM) return;
  controls.push({
    icon: "fas fa-users",
    label: "Жетоны игроков",
    onClick: () => openGMWindow()
  });
});

Hooks.on("userConnected", () => {
  if (game.user.isGM && gmWindow?.rendered) gmWindow.render({ force: true });
});

Hooks.on("updateUser", () => {
  if (game.user.isGM && gmWindow?.rendered) gmWindow.render({ force: true });
});
