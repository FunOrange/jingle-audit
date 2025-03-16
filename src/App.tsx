import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import "./style/leaflet.css";
import { useState } from "react";
import MainMenu from "./components/MainMenu";

enum Screen {
  MainMenu = "main-menu",
  DailyChallenge = "daily-challenge",
  Result = "result",
  Practice = "practice",
}

function App() {
  const [screen, setScreen] = useState<Screen>(Screen.MainMenu);
  if (screen === Screen.MainMenu) {
    return (
      <div
        className="App backdrop-blur"
        style={{
          backgroundImage: `url(/assets/background.jpg)`,
          backgroundSize: "cover",
        }}
      >
        <MainMenu
          onDailyChallengeClick={() => setScreen(Screen.DailyChallenge)}
          onPracticeClick={() => setScreen(Screen.Practice)}
        />
      </div>
    );
  } else if (screen === Screen.DailyChallenge) {
    return <div className="App background-blur">Daily Challenge</div>;
  } else if (screen === Screen.Result) {
    return <div className="App background-blur">Result</div>;
  } else if (screen === Screen.Practice) {
    return <div className="App background-blur">Practice</div>;
  }
}

export default App;
