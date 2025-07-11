import { saveService } from '@/services/api';
import { useUserStore } from '@/stores/userStore';
import { useAchievementStore } from '@/stores/achievementStore';
import { useBlackjackStore } from '@/stores/blackjackStore';
import { useClickerStore } from '@/stores/clickerStore';
import { useTransactionStore } from '@/stores/transactionStore';
import { useRouletteStore } from '@/stores/rouletteStore';
import { useAuthStore } from '@/stores/authStore';
import type { GameSaveData } from '@/types/GameSaveData';
import { SaveManager } from '@/utils/saveManager';

export class CloudSaveService {
  private autoSaveInterval: number | null = null;
  private autoSaveDelay = 60000; // 1 minute
  private saveManager = new SaveManager();

  /**
   * Get freshly instantiated stores
   * (Using getters instead of properties to ensure we always have the latest store state)
   */
  private get userStore() { return useUserStore(); }
  private get achievementStore() { return useAchievementStore(); }
  private get blackjackStore() { return useBlackjackStore(); }
  private get clickerStore() { return useClickerStore(); }
  private get transactionStore() { return useTransactionStore(); }
  private get rouletteStore() { return useRouletteStore(); }
  private get authStore() { return useAuthStore(); }

  constructor() { }

  /**
   * Start auto-save timer
   */
  public startAutoSave() {
    if (this.autoSaveInterval) this.stopAutoSave();

    this.autoSaveInterval = window.setInterval(() => {
      this.saveToCloud();
    }, this.autoSaveDelay);

    console.log('Auto-save started');
  }

  /**
   * Stop auto-save timer
   */
  public stopAutoSave() {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
      this.autoSaveInterval = null;
      console.log('Auto-save stopped');
    }
  }

  /**
   * Save game to cloud
   */
  public async saveToCloud(): Promise<boolean> {
    if (!this.authStore.isAuthenticated) {
      console.log('Not saving to cloud - not authenticated');
      return false;
    }

    try {
      const saveData = this.saveManager.getCurrentGameState();
      await saveService.saveGame(saveData);
      console.log('Game saved to cloud');
      return true;
    } catch (error) {
      console.error('Failed to save game to cloud:', error);
      return false;
    }
  }

  /**
   * Load game from cloud
   */
  public async loadFromCloud(): Promise<boolean> {
    if (!this.authStore.isAuthenticated) {
      console.log('Not loading from cloud - not authenticated');
      return false;
    }

    try {
      const response = await saveService.loadGame();
      const saveData = response.data;

      if (!saveData) {
        console.log('No cloud save found');
        return false;
      }

      // Validate save data
      if (!this.saveManager.isValidGameSaveData(saveData)) {
        console.error('Invalid save data structure');
        return false;
      }

      // Apply save data to all stores
      this.userStore.$patch(saveData.user);
      this.achievementStore.$patch(saveData.achievements);
      this.blackjackStore.$patch(saveData.blackjack);
      this.clickerStore.$patch(saveData.clicker);
      this.transactionStore.$patch(saveData.transactions);
      this.rouletteStore.$patch(saveData.roulette);

      console.log('Game loaded from cloud');
      return true;
    } catch (error) {
      console.error('Failed to load game from cloud:', error);
      return false;
    }
  }

  /**
   * Compare local and cloud saves
   */
  public async compareCloudAndLocalSaves(): Promise<{
    hasCloud: boolean;
    hasLocal: boolean;
    cloudNewer: boolean;
    cloudTimestamp: number | null;
    localTimestamp: number;
  }> {
    const localSave = this.saveManager.getCurrentGameState();
    const localTimestamp = localSave.timestamp;

    // If not authenticated, don't bother checking cloud
    if (!this.authStore.isAuthenticated) {
      return {
        hasCloud: false,
        hasLocal: true,
        cloudNewer: false,
        cloudTimestamp: null,
        localTimestamp
      };
    }

    try {
      const response = await saveService.loadGame();
      const cloudSave = response.data;

      if (!cloudSave) {
        return {
          hasCloud: false,
          hasLocal: true,
          cloudNewer: false,
          cloudTimestamp: null,
          localTimestamp
        };
      }

      return {
        hasCloud: true,
        hasLocal: true,
        cloudNewer: cloudSave.timestamp > localTimestamp,
        cloudTimestamp: cloudSave.timestamp,
        localTimestamp
      };
    } catch (error) {
      console.error('Failed to compare saves:', error);
      return {
        hasCloud: false,
        hasLocal: true,
        cloudNewer: false,
        cloudTimestamp: null,
        localTimestamp
      };
    }
  }
}

// Extend the SaveManager to make isValidGameSaveData public
export class ExtendedSaveManager extends SaveManager {
  public isValidGameSaveData(data: unknown): data is GameSaveData {
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

export const cloudSaveService = new CloudSaveService();
