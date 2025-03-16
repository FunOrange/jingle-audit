export enum GameStatus {
  Guessing = "guessing",
  AnswerRevealed = "answer-revealed",
}

export interface GameState {
  status: GameStatus;
  round: number;
  songs: string[];
  scores: number[];
  startTime: number;
  timeTaken: string | null;
}

export interface DailyChallenge {
  date: string; // YYYY-MM-DD
  songs: string[];
  submissions: number;
  results: number[];
}
