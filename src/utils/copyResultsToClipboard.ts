import { sum } from "ramda";
import { GameState } from "../types/jingle";

export function copyResultsToClipboard(gameState: GameState) {
  const score = sum(gameState.scores);
  const resultsString = gameState.scores
    .map((score) =>
      score === 0 ? "0 🔴" : score === 1000 ? "1000 🟢" : score + " 🟡",
    )
    .join("\n");

  const percentile = 0.5;

  if (percentile && gameState.timeTaken) {
    navigator.clipboard.writeText(
      `I scored ${score} on today's Jingle challenge! I finished in ${gameState.timeTaken} and placed in the top ${percentile.toFixed(1)}%, can you beat me? https://jingle.rs\n\n` +
        resultsString,
    );
  } else {
    navigator.clipboard.writeText(
      `I scored ${score} on today's Jingle challenge, can you beat me? https://jingle.rs\n\n` +
        resultsString,
    );
  }
}
