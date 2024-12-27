export interface User {
  chips: number;
  username: string;
  stats: {
    handsPlayed: number;
    totalWinnings: number;
    biggestWin: number;
  };
}