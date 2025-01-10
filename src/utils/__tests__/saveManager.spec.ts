import { describe, it, expect, beforeEach } from 'vitest';
import { SaveManager } from '@/utils/saveManager';
import type { GameSaveData } from '@/types/GameSaveData';
import { SIGNATURE } from '../gameSaveSerializer';
import type { AchievementStore } from '@/stores/achievementStore';
import type { UserStore } from '@/stores/user';
import type { BlackjackStore } from '@/stores/blackjack';
import type { ClickerStore } from '@/stores/clicker';

describe('SaveManager', () => {
  let saveManager: SaveManager;
  let mockSaveData: GameSaveData;

  beforeEach(() => {
    saveManager = new SaveManager();
    mockSaveData = {
      user: {
        username: 'testUser',
        chips: 1000
      } as UserStore,
      achievements: {
        currentLevel: {
          level: 5
        }
      } as AchievementStore,
      blackjack: {} as BlackjackStore,
      clicker: {} as ClickerStore,
      timestamp: Date.now()
    };
  });

  it('should export save data successfully', async () => {
    const result = await saveManager.exportSave(mockSaveData);
    expect(result).toBeTruthy();
    expect(result.endsWith(SIGNATURE)).toBe(true);
  });

  it('should validate save file signature', () => {
    const validSave = `some-data${SIGNATURE}`;
    const invalidSave = 'some-data';

    expect(saveManager.validateSaveFile(validSave)).toBe(true);
    expect(saveManager.validateSaveFile(invalidSave)).toBe(false);
  });

  it('should import valid save data', async () => {
    const exported = await saveManager.exportSave(mockSaveData);
    const imported = await saveManager.importSave(exported);

    expect(imported).toEqual(mockSaveData);
  });

  it('should reject invalid save data', async () => {
    const invalidSave = `{"invalid":"data"}${SIGNATURE}`;

    await expect(saveManager.importSave(invalidSave)).rejects.toThrow();
  });

  it('should extract correct save preview', () => {
    const preview = saveManager.extractSavePreview(mockSaveData);

    expect(preview).toEqual({
      username: 'testUser',
      balance: 1000,
      level: 5,
      timestamp: mockSaveData.timestamp
    });
  });
});
