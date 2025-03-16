import { useState } from "react";
import { DailyChallenge, GameState, GameStatus } from "../types/jingle";
import { calculateTimeDifference } from "../utils/date-utils";

export default function useGameLogic(dailyChallenge: DailyChallenge) {
  const [gameState, setGameState] = useState<GameState>({
    status: GameStatus.Guessing,
    round: 0,
    songs: dailyChallenge.songs,
    scores: [],
    startTime: Date.now(),
    timeTaken: null,
  });

  const guess = (correct: boolean, distance: number) => {
    const score = Math.round(
      correct ? 1000 : (1000 * 1) / Math.exp(0.0018 * distance),
    );
    const scores = [...gameState.scores, score];
    setGameState((prev) => ({
      ...prev,
      status: GameStatus.AnswerRevealed,
      scores: scores,
    }));

    if (gameState.round === gameState.songs.length) {
      setGameState((prev) => ({
        ...prev,
        timeTaken: calculateTimeDifference(prev.startTime, Date.now()),
      }));
    }

    return score;
  };

  const nextSong = () => {
    setGameState((prev) => ({
      ...prev,
      round: prev.round + 1,
      status: GameStatus.Guessing,
    }));
  };

  return { gameState, guess, nextSong };
}
