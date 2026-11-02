import { HeroismStore } from "./storage.js";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export class HeroismGMView extends HandlebarsApplicationMixin(ApplicationV2) {
  static DEFAULT_OPTIONS = {
    id: "heroism-tokens-gm",
    tag: "section",
    window: { title: "Жетоны героизма — профили игроков", icon: "fas fa-users", resizable: true },
    position: { width: 720, height: 560 },
    classes: ["heroism-window", "heroism-gm"],
    actions: {
      selectPlayer: HeroismGMView.selectPlayer
    }
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

    const users = game.users.filter(user => !user.isGM);
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

    // Keep the selected profile by Foundry User ID, even when the list refreshes.
    if (!players.some(player => player.id === this.selectedUserId)) {
      this.selectedUserId = players[0]?.id ?? null;
    }

    const selectedPlayer = players.find(player => player.id === this.selectedUserId) ?? null;
    for (const player of players) player.isSelected = player.id === this.selectedUserId;

    return { players, selectedPlayer };
  }

  static selectPlayer(event, target) {
    const userId = target.dataset.userId;
    if (!userId || !game.users.has(userId)) return;
    this.selectedUserId = userId;
    this.render({ force: true });
  }
}
