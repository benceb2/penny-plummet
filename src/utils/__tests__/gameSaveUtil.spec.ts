import { describe, it, expect, beforeEach } from 'vitest'

import { SIGNATURE } from '../gameSaveSerializerUtil';
import gameSaveUtil from '../gameSaveUtil';
import type { GameSaveData } from '@/types/GameSaveData';
import type { AchievementStore } from '@/stores/achievementStore';
import type { UserStore } from '@/stores/userStore';
import type { BlackjackStore } from '@/stores/blackjackStore';
import type { ClickerStore } from '@/stores/clickerStore';
import type { TransactionSaveData } from '@/types/TransactionSaveData';
import type { RouletteStore } from '@/stores/rouletteStore';

describe('gameSaveUtil', () => {
  let mockSaveData: GameSaveData;

  beforeEach(() => {
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
      transactions: { transactions: [] } as TransactionSaveData,
      roulette: {} as RouletteStore,
      timestamp: Date.now()
    };
  });

  it('should export save data successfully', async () => {
    const result = await gameSaveUtil.exportSave(mockSaveData);
    expect(result).toBeTruthy();
    expect(result.endsWith(SIGNATURE)).toBe(true);
  });

  it('should validate save file signature', () => {
    const validSave = `some-data${SIGNATURE}`;
    const invalidSave = 'some-data';

    expect(gameSaveUtil.validateSaveFile(validSave)).toBe(true);
    expect(gameSaveUtil.validateSaveFile(invalidSave)).toBe(false);
  });

  it('should import valid save data', async () => {
    const exported = await gameSaveUtil.exportSave(mockSaveData);
    const imported = await gameSaveUtil.importSave(exported);

    expect(imported).toEqual(mockSaveData);
  });

  it('should reject invalid save data', async () => {
    const invalidSave = `{"invalid":"data"}${SIGNATURE}`;

    await expect(gameSaveUtil.importSave(invalidSave)).rejects.toThrow();
  });

  it('should extract correct save preview', () => {
    const preview = gameSaveUtil.extractSavePreview(mockSaveData);

    expect(preview).toEqual({
      username: 'testUser',
      balance: 1000,
      level: 5,
      timestamp: mockSaveData.timestamp
    });
  });
});
