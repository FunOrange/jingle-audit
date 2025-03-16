import { mediaHostUrl } from "../data/hostUrl";

interface DailyGuessLabelProps {
  number: number;
  opacity?: number;
}
const DailyGuessLabel = ({ number, opacity }: DailyGuessLabelProps) => {
  return (
    <div style={{ position: "relative", opacity: opacity }}>
      <img src={`${mediaHostUrl}/osrsButton.png`} alt="OSRS Button" />
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          fontSize: "18px",
          fontStyle: "italic",
          fontFamily: "Runescape UF",
          color: "#edfd07",
        }}
      >
        {number}
      </div>
    </div>
  );
};

export default DailyGuessLabel;
