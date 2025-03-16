import { useRef } from "react";
import { DailyChallenge, GameStatus } from "../types/jingle";
import RunescapeMap from "./RunescapeMap";
import {
  incrementDailyChallenge,
  incrementGlobalGuessCounter,
  incrementSongFailureCount,
  incrementSongSuccessCount,
} from "../data/db";
import { getCurrentDateInBritain } from "../utils/date-utils";
import { sum } from "ramda";
import HomeButton from "./HomeButton";
import DailyGuessLabel from "./DailyGuessLabel";
import Footer from "./Footer";
import "../style/uiBox.css";
import { match } from "ts-pattern";
import RoundResult from "./RoundResult";
import useGameLogic, { Guess } from "../hooks/useGameLogic";
import { copyResultsToClipboard } from "../utils/copyResultsToClipboard";
import GameOver from "./GameOver";
import getJingleNumber from "../utils/getJingleNumber";
import { keys } from "../data/localstorage";

interface DailyJingleProps {
  dailyChallenge: DailyChallenge;
}
export default function DailyJingle({ dailyChallenge }: DailyJingleProps) {
  const jingleNumber = getJingleNumber(dailyChallenge);
  const jingle = useGameLogic(dailyChallenge);
  const gameState = jingle.gameState;

  const audioRef = useRef<HTMLAudioElement>(null);
  const playSong = (songName: string) => {
    const src = `https://mahloola.com/${songName.trim().replace(/ /g, "_")}.mp3`;
    audioRef.current!.src = src;
    audioRef.current!.load();
    audioRef.current!.play();
  };

  const guess = (guess: Guess) => {
    const gameState = jingle.guess(guess);

    // update statistics
    incrementGlobalGuessCounter();
    const currentSong = gameState.songs[gameState.round];
    if (guess.correct) incrementSongSuccessCount(currentSong);
    else incrementSongFailureCount(currentSong);

    localStorage.setItem(
      keys.gameState(jingleNumber),
      JSON.stringify(gameState),
    );
    if (gameState.round === gameState.songs.length) {
      localStorage.setItem(keys.dailyComplete, getCurrentDateInBritain());
      incrementDailyChallenge(sum(gameState.scores));
    }
  };

  const nextSong = () => {
    jingle.nextSong();
    playSong(gameState.songs[gameState.round + 1]);
  };

  const button = (label: string, onClick?: () => any) => (
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
                  return button("Next Song", nextSong);
                } else {
                  return button("End Game", jingle.endGame);
                }
              })
              .with(GameStatus.GameOver, () =>
                button("Copy Results", () => copyResultsToClipboard(gameState)),
              )
              .exhaustive()}

            <audio controls id="audio" ref={audioRef} />

            <Footer />
          </div>
        </div>
      </div>

      <RunescapeMap gameState={gameState} onGuess={guess} />

      <RoundResult gameState={gameState} />

      {gameState.status === GameStatus.GameOver && (
        <GameOver gameState={gameState} dailyChallenge={dailyChallenge} />
      )}
    </>
  );
}
