
import type { GameSaveData } from '@/types/GameSaveData';
import { createGameSerializer, SIGNATURE } from './gameSaveSerializer';
import type { SavePreview } from '@/types/SavePreview';
import { useRouletteStore } from '@/stores/rouletteStore';
import { useTransactionStore } from '@/stores/transactionStore';
import { useBlackjackStore } from '@/stores/blackjackStore';
import { useClickerStore } from '@/stores/clickerStore';
import { useUserStore } from '@/stores/userStore';
import { useAchievementStore } from '@/stores/achievementStore';

export class SaveManager {
  private serializer = createGameSerializer();

  public getCurrentGameState(): GameSaveData {
    const userStore = useUserStore();
    const achievementStore = useAchievementStore();
    const blackjackStore = useBlackjackStore();
    const clickerStore = useClickerStore();
    const transactionStore = useTransactionStore();
    const rouletteStore = useRouletteStore();

    return {
      user: userStore.$state,
      achievements: achievementStore.$state,
      blackjack: blackjackStore.$state,
      clicker: clickerStore.$state,
      transactions: transactionStore.$state,
      roulette: rouletteStore.$state,
      timestamp: Date.now()
    } as GameSaveData;
  }


  public async exportSave(saveData: GameSaveData): Promise<string> {
    try {
      const serialized = this.serializer.serialize(saveData as any);
      return serialized;
    } catch (error) {
      throw new Error(`Failed to export save: ${error}`);
    }
  }

  public async createDownloadBlob(saveData: string): Promise<Blob> {
    return new Blob([saveData], { type: 'text/plain' });
  }

  public validateSaveFile(saveData: string): boolean {
    return saveData.endsWith(SIGNATURE);
  }

  public async importSave(saveData: string): Promise<GameSaveData> {
    try {
      if (!this.validateSaveFile(saveData)) {
        throw new Error('Invalid save file signature');
      }

      const parsed = this.serializer.deserialize(saveData);

      if (!this.isValidGameSaveData(parsed)) {
        throw new Error('Invalid save data structure');
      }

      return parsed;
    } catch (error) {
      throw new Error(`Failed to import save: ${error}`);
    }
  }

  public extractSavePreview(saveData: GameSaveData): SavePreview {
    return {
      username: saveData.user?.username || null,
      balance: saveData.user?.chips || 0,
      level: saveData.achievements?.currentLevel?.level || 1,
      timestamp: saveData.timestamp || Date.now()
    };
  }

  isValidGameSaveData(data: unknown): data is GameSaveData {
    if (!data || typeof data !== 'object') return false;

    const save = data as GameSaveData;
    return (
      'user' in save &&
      'achievements' in save &&
      'blackjack' in save &&
      'transactions' in save &&
      'roulette' in save &&
      'clicker' in save &&
      'timestamp' in save &&
      typeof save.timestamp === 'number'
    );
  }
}
