import { HeroismStore } from "./storage.js";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export class HeroismWindow extends HandlebarsApplicationMixin(ApplicationV2) {
  static DEFAULT_OPTIONS = {
    id: "heroism-tokens-player",
    tag: "section",
    window: { title: "Жетоны героизма", icon: "fas fa-coins", resizable: true },
    position: { width: 620, height: "auto" },
    classes: ["heroism-window"],
    actions: {
      toggleToken: HeroismWindow.toggleToken,
      toggleApotheosis: HeroismWindow.toggleApotheosis
    }
  };

  static PARTS = {
    main: { template: "modules/heroism-tokens/templates/heroism-window.hbs" }
  };

  async _prepareContext() {
    const state = await HeroismStore.getFor();
    return {
      tokens: state.tokens.map((active, index) => ({ index, active, number: index + 1 })),
      tokenCount: state.tokens.filter(Boolean).length,
      apotheosis: state.apotheosis,
      userName: game.user.name
    };
  }

  static async toggleToken(event, target) {
    const index = Number(target.dataset.index);
    await HeroismStore.toggleToken(index);
    this.render({ force: true });
  }

  static async toggleApotheosis() {
    await HeroismStore.toggleApotheosis();
    this.render({ force: true });
  }
}
