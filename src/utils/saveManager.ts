
import type { GameSaveData } from '@/types/GameSaveData';
import { createGameSerializer, SIGNATURE } from './gameSaveSerializer';
import type { SavePreview } from '@/types/SavePreview';

export class SaveManager {
  private serializer = createGameSerializer();

  public async exportSave(saveData: GameSaveData): Promise<string> {
    try {
      const serialized = this.serializer.serialize(saveData);
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

  private isValidGameSaveData(data: unknown): data is GameSaveData {
    if (!data || typeof data !== 'object') return false;

    const save = data as GameSaveData;
    return (
      'user' in save &&
      'achievements' in save &&
      'blackjack' in save &&
      'clicker' in save &&
      'timestamp' in save &&
      typeof save.timestamp === 'number'
    );
  }
}
