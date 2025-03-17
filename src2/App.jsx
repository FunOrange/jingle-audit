import 'bootstrap/dist/css/bootstrap.min.css';
import { useContext, useRef, useState } from 'react';
import useSWR from 'swr';
import './App.css';
import RunescapeMap from './RunescapeMap';
import Footer from './components/Footer';
import HomeButton from './components/HomeButton';
import MainMenu from './components/MainMenu';
import NewsButton from './components/NewsButton';
import ResultMessage from './components/ResultMessage';
import ResultScreen from './components/ResultScreen';
import SettingsButton from './components/SettingsButton';
import StatsButton from './components/StatsButton';
import UiBox from './components/UiBox';
import { songHostUrl } from './data/hostUrl';
import { getDailyChallenge } from './db/db';
import { JingleContext, JingleContextProvider } from './store/jingleContext';
import './style/leaflet.css';
import { calculateTimeDifference } from './utils/calculateTimeDifference';
import getCurrentDateInBritain from './utils/getCurrentDateinBritain';
import getJingleNumber from './utils/getJingleNumber';

const today = getCurrentDateInBritain();
const getDaily = async () => {
  const data = await getDailyChallenge(today);
  return data;
};

function App() {
  const { data, error } = useSWR('unique-key', getDaily, {
    revalidateOnMount: true, // Ensures the function runs when the component mounts
    revalidateOnFocus: true, // Optional: Re-run the function when the window gains focus
    revalidateOnReconnect: true, // Optional: Re-run the function when the network reconnects
  });
  const dailyChallenge = {
    date: '2024-04-09',
    songs: [
      'Al Kharid',
      'Arabian',
      'Back to Life',
      'Country Jig',
      'Crystal Sword',
    ],
    results: ['0', '2434'],
    submissions: '742',
  };

  const { currSong } = useContext(JingleContext);
  const [modalVisible, setModalVisible] = useState(false);

  console.log(`Playing: ${currSong}`);
  const audioRef = useRef(null);
  const sourceRef = useRef(null);
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

  const playSong = (songName) => {
    const src = `${songHostUrl}/${songName.trim().replaceAll(' ', '_')}.mp3`;
    sourceRef.current.src = src;
    audioRef.current.load();
    audioRef.current.play();
  };
  return (
    <JingleContextProvider>
      <div className='App'>
        <div>
          <div className='App-inner'>
            <div
              className='ui-box'
              style={{ display: startedGame ? 'block' : 'none' }}
            >
              <HomeButton />
              <SettingsButton />
              <NewsButton />
              <StatsButton />
              {/* <SettingsModal className='modal-container' /> */}
              <UiBox
                dailyChallenge={dailyChallenge}
                playSong={playSong}
                audioRef={audioRef}
                sourceRef={sourceRef}
                dailyMode={dailyMode}
              ></UiBox>
              <Footer />
            </div>
          </div>
          <div className={`${!startedGame ? 'blur' : ''}`}>
            <RunescapeMap />
          </div>

          {!startedGame && (
            <MainMenu
              setDailyComplete={setDailyComplete}
              setTimeTaken={setTimeTaken}
              setStartTime={setStartTime}
              playSong={playSong}
              dailyChallenge={dailyChallenge}
              dailyComplete={dailyComplete}
              setPracticeRoundsMode={setPracticeRoundsMode}
              setDailyMode={setDailyMode}
            ></MainMenu>
          )}
          {dailyComplete && (
            <ResultScreen
              percentile={percentile}
              time={
                timeTaken
                  ? timeTaken
                  : calculateTimeDifference(startTime, new Date())
              }
              jingleNumber={getJingleNumber(dailyChallenge)}
            />
          )}
          {!dailyComplete && (
            <ResultMessage
              resultVisible={resultVisible}
              guessResult={guessResult}
            ></ResultMessage>
          )}
        </div>
      </div>
    </JingleContextProvider>
  );
}

export default App;
