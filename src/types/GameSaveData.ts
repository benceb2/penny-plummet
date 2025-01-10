import type { AchievementStore } from "@/stores/achievement";
import type { BlackjackStore } from "@/stores/blackjack";
import type { ClickerStore } from "@/stores/clicker";
import type { UserStore } from "@/stores/user";

export interface GameSaveData {
  user: UserStore;
  achievements: AchievementStore;
  blackjack: BlackjackStore;
  clicker: ClickerStore;
  timestamp: number;
}
