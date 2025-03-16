import { GeoJsonObject } from "geojson";
import L from "leaflet";

export enum GameStatus {
  Guessing = "guessing",
  AnswerRevealed = "answer-revealed",
  GameOver = "game-over",
}

export interface GameState {
  status: GameStatus;
  round: number;
  songs: string[];
  scores: number[];
  startTime: number;
  timeTaken: string | null;

  guessedPosition: L.LatLng | null;
  correctPolygon: GeoJsonObject | null;
}

export interface DailyChallenge {
  date: string; // YYYY-MM-DD
  songs: string[];
  submissions: number;
  results: number[];
}
