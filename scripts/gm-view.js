import { HeroismStore } from "./storage.js";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export class HeroismGMView extends HandlebarsApplicationMixin(ApplicationV2) {
  static DEFAULT_OPTIONS = {
    id: "heroism-tokens-gm",
    tag: "section",
    window: { title: "Жетоны героизма — профили игроков", icon: "fas fa-users", resizable: true },
    position: { width: 720, height: 560 },
    classes: ["heroism-window", "heroism-gm"]
  };

  static PARTS = {
    main: { template: "modules/heroism-tokens/templates/gm-dashboard.hbs" }
  };

  constructor(options = {}) {
    super(options);
    this.selectedUserId = null;
  }

  async _prepareContext() {
    if (!game.user.isGM) return { players: [], selectedPlayer: null };

    // Every profile is read from that Foundry User's own module flag.
    const users = game.users.filter(user => !user.isGM);
    const players = await Promise.all(users.map(async user => {
      const state = await HeroismStore.getFor(user);
      return {
        id: user.id,
        name: user.name,
        active: user.active,
        tokens: state.tokens,
        count: state.tokens.filter(Boolean).length,
        apotheosis: state.apotheosis,
        isSelected: user.id === this.selectedUserId
      };
    }));

    // Keep the selected profile by immutable Foundry User ID.
    if (!players.some(player => player.id === this.selectedUserId)) {
      this.selectedUserId = players[0]?.id ?? null;
    }

    for (const player of players) {
      player.isSelected = player.id === this.selectedUserId;
    }
    const selectedPlayer = players.find(player => player.id === this.selectedUserId) ?? null;
    return { players, selectedPlayer };
  }

  async _onRender(context, options) {
    await super._onRender(context, options);

    // Use a native change listener instead of ApplicationV2 data-action
    // dispatch, so profile switching works reliably in Foundry VTT 13.
    const selector = this.element.querySelector(".heroism-profile-select");
    if (!selector) return;

    selector.addEventListener("change", event => {
      const userId = event.currentTarget.value;
      if (!userId || !game.users.get(userId)) return;
      this.selectedUserId = userId;
      this.render({ force: true });
    });
  }
}
