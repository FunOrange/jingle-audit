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
import getCurrentDateInBritain, {
  calculateTimeDifference,
} from "../utils/date-utils";
import { sum } from "ramda";
import HomeButton from "./HomeButton";
import DailyGuessLabel from "./DailyGuessLabel";
import Footer from "./Footer";
import "../style/uiBox.css";
import { match } from "ts-pattern";
import ResultMessage from "./ResultMessage";

interface DailyChallengeProps {
  dailyChallenge: DailyChallengeType;
}
export default function DailyChallenge({
  dailyChallenge,
}: DailyChallengeProps) {
  const [gameState, setGameState] = useState<GameState>({
    status: GameStatus.Guessing,
    round: 0,
    songs: dailyChallenge.songs,
    scores: [],
    startTime: Date.now(),
    timeTaken: null,
  });

  const audioRef = useRef<HTMLAudioElement>(null);
  const playSong = (songName: string) => {
    const src = `https://mahloola.com/${songName.trim().replace(/ /g, "_")}.mp3`;
    audioRef.current!.src = src;
    audioRef.current!.load();
    audioRef.current!.play();
  };

  const onGuess = (correct: boolean, distance: number) => {
    const score = Math.round(
      correct ? 1000 : (1000 * 1) / Math.exp(0.0018 * distance),
    );
    const scores = [...gameState.scores, score];
    setGameState((prev) => ({
      ...prev,
      status: GameStatus.AnswerRevealed,
      scores: scores,
    }));
    localStorage.setItem("dailyResults", JSON.stringify(scores));

    // update statistics
    incrementGlobalGuessCounter();
    const currentSong = gameState.songs[gameState.round];
    if (correct) incrementSongSuccessCount(currentSong);
    else incrementSongFailureCount(currentSong);

    // end game
    if (gameState.round === gameState.songs.length) {
      submitResults();
    }
  };

  const nextSong = () => {
    const nextRound = gameState.round + 1;
    setGameState((prev) => ({
      ...prev,
      round: nextRound,
      status: GameStatus.Guessing,
    }));
    playSong(gameState.songs[nextRound]);
  };

  const submitResults = () => {
    setGameState((prev) => ({
      ...prev,
      timeTaken: calculateTimeDifference(prev.startTime, Date.now()),
    }));
    localStorage.setItem("dailyComplete", getCurrentDateInBritain());
    const totalScore = sum(gameState.scores);
    incrementDailyChallenge(totalScore);
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
                  return button("Next Song", nextSong);
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
