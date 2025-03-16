export default function getJingleNumber(dailyChallenge: { date: string }) {
  const dailyChallengeDate = dailyChallenge.date;
  const currentDate = new Date(dailyChallengeDate);
  const targetDate = new Date("2024-05-17");
  return (currentDate.getTime() - targetDate.getTime()) / (1000 * 60 * 60 * 24);
}
