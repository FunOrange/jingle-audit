import { useRef, useState } from "react";
import {
  DailyChallenge as DailyChallengeType,
  GameState,
  GameStatus,
} from "../types/jingle";
import RunescapeMap from "./RunescapeMap";
import {
  incrementDailyChallenge,
  incrementGlobalGuessCounter,
  incrementSongFailureCount,
  incrementSongSuccessCount,
} from "../db/db";
import { getCurrentDateInBritain } from "../utils/date-utils";
import { sum } from "ramda";
import HomeButton from "./HomeButton";
import DailyGuessLabel from "./DailyGuessLabel";
import Footer from "./Footer";
import "../style/uiBox.css";
import { match } from "ts-pattern";
import ResultMessage from "./ResultMessage";
import useGameLogic from "../hooks/useGameLogic";

interface DailyChallengeProps {
  dailyChallenge: DailyChallengeType;
}
export default function DailyChallenge({
  dailyChallenge,
}: DailyChallengeProps) {
  const { gameState, guess, nextSong } = useGameLogic(dailyChallenge);

  const audioRef = useRef<HTMLAudioElement>(null);
  const playSong = (songName: string) => {
    const src = `https://mahloola.com/${songName.trim().replace(/ /g, "_")}.mp3`;
    audioRef.current!.src = src;
    audioRef.current!.load();
    audioRef.current!.play();
  };

  const onGuess = (correct: boolean, distance: number) => {
    const score = guess(correct, distance);

    // update statistics
    incrementGlobalGuessCounter();
    const currentSong = gameState.songs[gameState.round];
    if (correct) incrementSongSuccessCount(currentSong);
    else incrementSongFailureCount(currentSong);

    localStorage.setItem(
      "dailyResults",
      JSON.stringify([...gameState.scores, score]),
    );
    if (gameState.round === gameState.songs.length) {
      localStorage.setItem("dailyComplete", getCurrentDateInBritain());
      incrementDailyChallenge(sum(gameState.scores));
    }
  };

  const onNextSongClick = () => {
    nextSong();
    playSong(gameState.songs[gameState.round + 1]);
  };

  const endGame = () => {
    throw new Error("Not implemented");
  };

  const button = (label: string, onClick?: () => void) => (
    <div
      className="guess-btn-container"
      onClick={onClick}
      style={{ pointerEvents: onClick ? "auto" : "none" }}
    >
      <img src="https://mahloola.com/osrsButtonWide.png" alt="OSRS Button" />
      <div className="guess-btn">{label}</div>
    </div>
  );

  return (
    <>
      <div className="App-inner">
        <div className="ui-box">
          <HomeButton />
          <div className="below-map">
            <div style={{ display: "flex", gap: "2px" }}>
              <DailyGuessLabel number={gameState.scores[0]} />
              <DailyGuessLabel number={gameState.scores[1]} />
              <DailyGuessLabel number={gameState.scores[2]} />
              <DailyGuessLabel number={gameState.scores[3]} />
              <DailyGuessLabel number={gameState.scores[4]} />
            </div>

            {match(gameState.status)
              .with(GameStatus.Guessing, () =>
                button("Place your pin on the map"),
              )
              .with(GameStatus.AnswerRevealed, () => {
                if (gameState.round < gameState.songs.length - 1) {
                  return button("Next Song", onNextSongClick);
                } else {
                  return button("End Game", endGame);
                }
              })
              .exhaustive()}

            <audio controls id="audio" ref={audioRef} />

            <Footer />
          </div>
        </div>
      </div>

      <RunescapeMap gameState={gameState} onGuess={onGuess} />

      <ResultMessage gameState={gameState} />
    </>
  );
}
