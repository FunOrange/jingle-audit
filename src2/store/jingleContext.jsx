import { createContext, useRef, useState } from 'react';
import { getRandomSong } from '../utils/getSong';

export const JingleContext = createContext({
  currentSong: null,
  setGuessResult: () => {},
  setResultsArray: () => {},
  resultsArray: [],
  dailyChallengeIndex: 0,
  setDailyChallengeIndex: () => {},
  setDailyComplete: () => {},
  dailyComplete: false,
  startedGame: false,
  setStartedGame: () => {},
  setCurrentSongUi: () => {},
  setPercentile: () => {},
  startTime: null,
  setTimeTaken: () => {},
  correctPolygon: null,
  setCorrectPolygon: () => {},
  resultVisible: false,
  setResultVisible: () => {},
});

export const JingleContextProvider = ({ children }) => {
  const initialSong = getRandomSong();

  const audioRef = useRef(null);
  const sourceRef = useRef(null);
  const [currentSong, setCurrentSong] = useState(initialSong);
  const [currentSongUi, setCurrentSongUi] = useState(initialSong);
  const [guessResult, setGuessResult] = useState(-1);
  const [startedGame, setStartedGame] = useState(false);
  const [resultVisible, setResultVisible] = useState(false);
  const [resultsArray, setResultsArray] = useState([]);
  const [dailyChallengeIndex, setDailyChallengeIndex] = useState(0);
  const [dailyComplete, setDailyComplete] = useState(false);
  const [dailyMode, setDailyMode] = useState(false);
  const [practiceRoundsMode, setPracticeRoundsMode] = useState(false);
  const [percentile, setPercentile] = useState(0);
  const [correctPolygon, setCorrectPolygon] = useState(null);
  const [timeTaken, setTimeTaken] = useState(0);
  const [startTime, setStartTime] = useState(0);

  const value = {
    currentSong,
    setGuessResult,
    setResultsArray,
    resultsArray,
    dailyChallengeIndex,
    setDailyChallengeIndex,
    setDailyComplete,
    dailyComplete,
    startedGame,
    setStartedGame,
    setCurrentSongUi,
    setPercentile,
    startTime,
    setTimeTaken,
    correctPolygon,
    setCorrectPolygon,
  };

  return (
    <JingleContext.Provider value={value}>{children}</JingleContext.Provider>
  );
};
