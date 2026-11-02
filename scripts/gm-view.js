import { HeroismStore } from "./storage.js";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export class HeroismGMView extends HandlebarsApplicationMixin(ApplicationV2) {
  static DEFAULT_OPTIONS = {
    id: "heroism-tokens-gm",
    tag: "section",
    window: { title: "Жетоны героизма — игроки", icon: "fas fa-users", resizable: true },
    position: { width: 720, height: 640 },
    classes: ["heroism-window", "heroism-gm"]
  };

  static PARTS = {
    main: { template: "modules/heroism-tokens/templates/gm-dashboard.hbs" }
  };

  async _prepareContext() {
    if (!game.user.isGM) return { players: [] };
    const users = game.users.filter(u => !u.isGM);
    const players = await Promise.all(users.map(async user => {
      const state = await HeroismStore.getFor(user);
      return {
        id: user.id,
        name: user.name,
        active: user.active,
        tokens: state.tokens,
        count: state.tokens.filter(Boolean).length,
        apotheosis: state.apotheosis
      };
    }));
    return { players };
  }
}