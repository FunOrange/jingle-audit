import { useState } from "react";
import { DailyChallenge, GameState, GameStatus } from "../types/jingle";
import { calculateTimeDifference } from "../utils/date-utils";
import getJingleNumber from "../utils/getJingleNumber";
import { keys } from "../data/localstorage";
import { GeoJsonObject } from "geojson";
import { LatLng } from "leaflet";

export interface Guess {
  correct: boolean;
  distance: number;
  guessedPosition: LatLng;
  correctPolygon: GeoJsonObject;
}

export default function useGameLogic(dailyChallenge: DailyChallenge) {
  const loadGameState = (): GameState | null => {
    const jingleNumber = getJingleNumber(dailyChallenge);
    const gameStateJson = localStorage.getItem(keys.gameState(jingleNumber));
    try {
      const gameState = JSON.parse(gameStateJson ?? "null");
      return gameState;
    } catch (e) {
      console.error("Failed to parse saved game state: " + gameState);
      return null;
    }
  };
  const [gameState, setGameState] = useState<GameState>(
    loadGameState() ?? {
      status: GameStatus.Guessing,
      round: 0,
      songs: dailyChallenge.songs,
      scores: [],
      startTime: Date.now(),
      timeTaken: null,
      guessedPosition: null,
      correctPolygon: null,
    },
  );

  const guess = (guess: Guess) => {
    const score = Math.round(
      guess.correct ? 1000 : (1000 * 1) / Math.exp(0.0018 * guess.distance),
    );
    let newGameState = {
      ...gameState,
      status: GameStatus.AnswerRevealed,
      scores: [...gameState.scores, score],
      guessedPosition: guess.guessedPosition,
      correctPolygon: guess.correctPolygon,
    };
    setGameState(newGameState);

    if (gameState.round === gameState.songs.length) {
      newGameState = {
        ...newGameState,
        timeTaken: calculateTimeDifference(gameState.startTime, Date.now()),
      };
      setGameState(newGameState);
    }

    return newGameState;
  };

  const nextSong = () => {
    setGameState((prev) => ({
      ...prev,
      round: prev.round + 1,
      status: GameStatus.Guessing,
    }));
  };

  const endGame = () => {
    if (
      !(
        gameState.status === GameStatus.AnswerRevealed &&
        gameState.round === gameState.songs.length - 1
      )
    ) {
      throw new Error("Game is not over yet");
    }

    setGameState((prev) => ({
      ...prev,
      status: GameStatus.GameOver,
    }));
  };

  return { gameState, guess, nextSong, endGame };
}
