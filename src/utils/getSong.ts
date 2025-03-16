import { Feature, Polygon } from "geojson";
import geojsondata from "../data/GeoJSON";
import { toOurPixelCoordinates } from "./coordinate-utils";
import { decodeHTML } from "./string-utils";
const playedSongs = new Set();
const playedSongsOrder: string[] = [];

const isFeatureVisibleOnMap = (feature: Feature<Polygon>) =>
  feature.geometry.coordinates.some((polygon) =>
    polygon.every((point) => {
      const [, y] = toOurPixelCoordinates(point);
      return y > 0;
    }),
  );

export const getRandomSong = () => {
  let randomSongName: string | null = "";
  const visibleFeatures = geojsondata.features.filter(isFeatureVisibleOnMap);
  do {
    const randomFeature = visibleFeatures.sort(
      () => Math.random() - Math.random(),
    )[0];
    randomSongName = decodeHTML(
      randomFeature.properties?.title.match(/>(.*?)</)[1],
    );
  } while (playedSongs.has(randomSongName));
  updatePlayedSongs(randomSongName!);
  return randomSongName;
};

export const updatePlayedSongs = (newSongName: string) => {
  playedSongsOrder.push(newSongName);

  // If limit is reached, remove the oldest song
  if (playedSongsOrder.length > 100) {
    //change val based on how many songs should be shown without dupes
    const oldestSong = playedSongsOrder.shift();
    playedSongs.delete(oldestSong);
  }

  playedSongs.add(newSongName);
};
