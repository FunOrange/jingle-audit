// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  query,
  setDoc,
  where,
} from "firebase/firestore/lite";
import { getCurrentDateInBritain } from "../utils/date-utils";
import { DailyChallenge } from "../types/jingle";

// Initialize Firebase
if (!import.meta.env.VITE_FIRESTORE_KEY) {
  throw new Error("Firestore key not found");
}
const app = initializeApp(JSON.parse(import.meta.env.VITE_FIRESTORE_KEY));
const db = getFirestore(app);

async function getSong(songName: string) {
  const songsQuery = query(
    collection(db, "songs"),
    where("name", "==", songName),
  );
  const songsQuerySnapshot = await getDocs(songsQuery);
  if (!songsQuerySnapshot.empty) {
    const song = songsQuerySnapshot.docs[0]; // returns undefined if successCount is not found
    return song;
  } else {
    return null;
  }
}

async function getDailyChallenge() {
  const formattedDate = getCurrentDateInBritain();
  const dailyChallengesRef = doc(db, "dailyChallenges", formattedDate);
  const dailyChallengesSnap = await getDoc(dailyChallengesRef);
  return dailyChallengesSnap.data() as DailyChallenge;
}

async function getDailyChallengePercentileAndIncrement(result: number) {
  const dailyChallenge = await getDailyChallenge();
  const dailyChallengeResults = dailyChallenge?.results ?? [];

  if (result) {
    const dailyChallengeSubmissions = dailyChallenge?.submissions
      ? dailyChallenge.submissions + 1
      : 1;
    dailyChallengeResults.push(result);
    await setDoc(
      doc(db, "dailyChallenges", dailyChallenge!.date),
      {
        submissions: dailyChallengeSubmissions,
        results: dailyChallengeResults,
      },
      { merge: true },
    );
  }

  const sortedResults = dailyChallengeResults.sort(
    (a: number, b: number) => a - b,
  );
  const resultIndex = sortedResults.findIndex(
    (value: number) => value >= result,
  );
  const percentileOpposite = (resultIndex / sortedResults.length) * 100;
  const percentile = 100 - percentileOpposite;
  return percentile;
}

export async function getDailyChallengeResults() {
  const dailyChallenge = await getDailyChallenge();
  const dailyChallengeResults = dailyChallenge?.results ?? [];
  return dailyChallengeResults;
}
export function calculateDailyChallengePercentile(
  dailyChallengeResults: number[],
  result: number,
) {
  const sortedResults = dailyChallengeResults.sort((a, b) => a - b);
  const resultIndex = sortedResults.findIndex((value) => value >= result);
  const percentileOpposite = (resultIndex / sortedResults.length) * 100;
  const percentile = 100 - percentileOpposite;
  return percentile;
}
export async function incrementDailyChallenge(result: number) {
  const dailyChallenge = await getDailyChallenge();
  const dailyChallengeResults = dailyChallenge?.results ?? [];

  if (result) {
    const dailyChallengeSubmissions = dailyChallenge?.submissions
      ? dailyChallenge.submissions + 1
      : 1;
    dailyChallengeResults.push(result);
    await setDoc(
      doc(db, "dailyChallenges", dailyChallenge!.date),
      {
        submissions: dailyChallengeSubmissions,
        results: dailyChallengeResults,
      },
      { merge: true },
    );
  }
}

async function getStatistics() {
  const statisticsRef = doc(db, "statistics", "global");
  const statisticsSnap = await getDoc(statisticsRef);
  return statisticsSnap.data();
}

async function incrementGlobalGuessCounter() {
  const statistics = await getStatistics();
  await setDoc(doc(db, "statistics", "global"), {
    guesses: statistics!.guesses + 1,
  });
}

async function incrementSongSuccessCount(songName: string) {
  const songSnapshot = await getSong(songName);
  const song = songSnapshot!.data() as {
    successCount: number;
    failureCount: number;
  };
  const successCount = song?.successCount ?? 0;
  const successRate = calculateSuccessRate(song);
  if (successRate) {
    await setDoc(
      doc(db, "songs", songName),
      {
        successCount: successCount + 1,
        name: songName,
        successRate: calculateSuccessRate(song, 1),
        dateUpdated: new Date(),
      },
      { merge: true },
    );
  } else {
    await setDoc(
      doc(db, "songs", songName),
      {
        successCount: successCount,
        name: songName,
        dateUpdated: new Date(),
      },
      { merge: true },
    );
  }
}

async function incrementSongFailureCount(songName: string) {
  const songSnapshot = await getSong(songName);
  const song = songSnapshot!.data() as {
    successCount: number;
    failureCount: number;
  };
  const failureCount = song?.failureCount ?? 0;
  const successRate = calculateSuccessRate(song, 0);
  if (successRate) {
    await setDoc(
      doc(db, "songs", songName),
      {
        failureCount: failureCount + 1,
        name: songName,
        successRate: calculateSuccessRate(song),
        dateUpdated: new Date(),
      },
      { merge: true },
    );
  } else {
    await setDoc(
      doc(db, "songs", songName),
      {
        failureCount: failureCount,
        name: songName,
        dateUpdated: new Date(),
      },
      { merge: true },
    );
  }
}

function calculateSuccessRate(
  song: { successCount: number; failureCount: number },
  successStatus?: number,
) {
  if (!song) return 0;
  let successRate = 0;
  const successCount = song?.successCount ?? 0;
  const failureCount = song?.failureCount ?? 0;
  if (successStatus == 1) {
    successRate = successCount + 1 / (successCount + failureCount + 1);
  } else {
    successRate = successCount / (successCount + failureCount + 1);
  }
  return successRate ?? null;
}

export {
  getDailyChallenge,
  getDailyChallengePercentileAndIncrement,
  getSong,
  getStatistics,
  incrementGlobalGuessCounter,
  incrementSongFailureCount,
  incrementSongSuccessCount,
};
