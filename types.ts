
export enum GameState {
  START = 'START',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  GAMEOVER = 'GAMEOVER',
  SCORES = 'SCORES',
  WINNER = 'WINNER'
}

export interface ScoreEntry {
  name: string;
  score: number;
  rank: string;
}

export interface GameStats {
  enemiesKilled: number;
  accuracy: number;
  stage: number;
  score: number;
}
