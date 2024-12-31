export interface Level {
  level: number;
  currentXP: number;
  requiredXP: number;
  rewards: {
    chips: number;
    multiplier?: number;
  };
}
