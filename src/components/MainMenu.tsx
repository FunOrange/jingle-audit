import { FaDiscord, FaDonate, FaGithub } from "react-icons/fa";
import { mediaHostUrl } from "../data/hostUrl";
import { getStatistics } from "../db/db";
import "../style/footer.css";
import "../style/mainMenu.css";
import NextDailyCountdown from "./NextDailyCountdown";
import getCurrentDateInBritain, { getNextUtc4AM } from "../utils/date-utils";
import useSWR from "swr";
import { DailyChallenge } from "../types/jingle";

interface MainMenuProps {
  dailyChallenge: DailyChallenge | undefined;
  onDailyChallengeClick: () => void;
  onPracticeClick: () => void;
}
export default function MainMenu({
  dailyChallenge,
  onDailyChallengeClick,
  onPracticeClick,
}: MainMenuProps) {
  const dailyCompleted =
    localStorage.getItem("dailyComplete") === getCurrentDateInBritain();

  const { data: statistics } = useSWR(["statistics", "global"], getStatistics, {
    refreshInterval: 2000,
  });

  return (
    <div className="main-menu-container">
      <img
        className="main-menu-image"
        src={`${mediaHostUrl}/Jingle.png`}
        alt="Jingle"
      />

      <h1 className="main-menu-text">Jingle</h1>

      {/* Daily Jingle Option */}
      <h1
        className="main-menu-option"
        style={{ left: "17vw", top: "70%" }}
        onClick={onDailyChallengeClick}
      >
        Daily Jingle
        {dailyCompleted && <NextDailyCountdown end={getNextUtc4AM()} />}
        {!dailyCompleted && <div style={{ color: "#00FF00" }}>Ready</div>}{" "}
        <div style={{ fontSize: "40%" }}>
          {dailyChallenge?.results.length.toLocaleString()} Completions
        </div>
      </h1>

      <h1
        className="main-menu-option"
        style={{ left: "53vw", top: "70%" }}
        onClick={onPracticeClick}
      >
        Unlimited Practice
        <div style={{ fontSize: "40%" }}>∞</div>
      </h1>

      <div className="menu-statistics">
        <div>
          {statistics?.guesses.toLocaleString()}
          <div style={{ fontSize: "65%", marginTop: "-7%" }}>
            Global Guesses
          </div>
        </div>
      </div>

      <div className="main-menu-icon-container">
        <a
          className="main-menu-icon"
          href="https://github.com/mahloola/osrs-music"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FaGithub />
        </a>
        <a className="main-menu-icon" href="https://discord.gg/7sB8fyUS9W">
          <FaDiscord />
        </a>
        <a className="main-menu-icon" href="https://ko-fi.com/mahloola">
          <FaDonate />
        </a>
      </div>
    </div>
  );
}
