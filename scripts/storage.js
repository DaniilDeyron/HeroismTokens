const MODULE_ID = "heroism-tokens";
const FLAG_KEY = "state";

export class HeroismStore {
  static init() {
    // Data is stored on each User document, not in world-shared settings.
    for (const user of game.users) {
      const state = user.getFlag(MODULE_ID, FLAG_KEY);
      if (!state) {
        user.setFlag(MODULE_ID, FLAG_KEY, {
          tokens: [false, false, false, false, false],
          apotheosis: true
        }).catch(err => console.error(`[${MODULE_ID}] Could not initialize user flags`, err));
      }
    }
  }

  static normalize(state) {
    const tokens = Array.isArray(state?.tokens) ? state.tokens.slice(0, 5).map(Boolean) : [];
    while (tokens.length < 5) tokens.push(false);
    return { tokens, apotheosis: state?.apotheosis !== false };
  }

  static async getFor(user = game.user) {
    const raw = user.getFlag(MODULE_ID, FLAG_KEY);
    if (!raw) {
      const initial = { tokens: [false, false, false, false, false], apotheosis: true };
      if (user.id === game.user.id) {
        await user.setFlag(MODULE_ID, FLAG_KEY, initial);
      }
      return initial;
    }
    return this.normalize(raw);
  }

  static async setMine(nextState) {
    const safe = this.normalize(nextState);
    await game.user.setFlag(MODULE_ID, FLAG_KEY, safe);
    game.socket.emit(`module.${MODULE_ID}`, {
      type: "user-state",
      userId: game.user.id,
      state: safe
    });
    return safe;
  }

  static async setToken(index, value) {
    if (!Number.isInteger(index) || index < 0 || index > 4) throw new RangeError("Token index must be 0..4");
    const state = await this.getFor();
    state.tokens[index] = Boolean(value);
    return this.setMine(state);
  }

  static async toggleToken(index) {
    const state = await this.getFor();
    return this.setToken(index, !state.tokens[index]);
  }

  static async toggleApotheosis() {
    const state = await this.getFor();
    state.apotheosis = !state.apotheosis;
    return this.setMine(state);
  }
}