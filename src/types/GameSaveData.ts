import type { AchievementStore } from "@/stores/achievementStore";
import type { BlackjackStore } from "@/stores/blackjackStore";
import type { ClickerStore } from "@/stores/clickerStore";
import type { RouletteStore } from "@/stores/rouletteStore";
import type { TransactionSaveData } from "@/types/TransactionSaveData";
import type { UserStore } from "@/stores/userStore";

export interface GameSaveData {
  user: UserStore;
  achievements: AchievementStore;
  blackjack: BlackjackStore;
  clicker: ClickerStore;
  transactions: TransactionSaveData;
  roulette: RouletteStore;
  timestamp: number;
}
