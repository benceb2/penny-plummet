import type { AchievementStore } from "@/stores/achievementStore";
import type { BlackjackStore } from "@/stores/blackjackStore";
import type { ClickerStore } from "@/stores/clickerStore";
import type { UserStore } from "@/stores/userStore";

export interface GameSaveData {
  user: UserStore;
  achievements: AchievementStore;
  blackjack: BlackjackStore;
  clicker: ClickerStore;
  timestamp: number;
}
