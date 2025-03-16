import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import "./style/leaflet.css";
import { useState } from "react";
import MainMenu from "./components/MainMenu";
import { match } from "ts-pattern";
import DailyChallenge from "./components/DailyChallenge";
import useSWR from "swr";
import { getCurrentDateInBritain } from "./utils/date-utils";
import { getDailyChallenge } from "./db/db";

enum Screen {
  MainMenu = "main-menu",
  DailyChallenge = "daily-challenge",
  Result = "result",
  Practice = "practice",
}

function App() {
  const { data: dailyChallenge } = useSWR(
    ["dailyChallenges", getCurrentDateInBritain()],
    getDailyChallenge,
  );
  const [screen, setScreen] = useState<Screen>(Screen.MainMenu);

  return (
    <div
      className="App"
      style={{
        backgroundImage: `url(/assets/background.jpg)`,
        backgroundSize: "cover",
      }}
    >
      {match(screen)
        .with(Screen.MainMenu, () => (
          <MainMenu
            dailyChallenge={dailyChallenge}
            onDailyChallengeClick={() => setScreen(Screen.DailyChallenge)}
            onPracticeClick={() => setScreen(Screen.Practice)}
          />
        ))
        .with(
          Screen.DailyChallenge,
          () =>
            dailyChallenge && (
              <DailyChallenge dailyChallenge={dailyChallenge} />
            ),
        )
        .with(Screen.Result, () => (
          <div className="App background-blur">Result</div>
        ))
        .with(Screen.Practice, () => (
          <div className="App background-blur">Practice</div>
        ))
        .exhaustive()}
    </div>
  );
}

export default App;
