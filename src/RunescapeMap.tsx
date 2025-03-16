import { useState, useRef } from "react";
import L, { CRS } from "leaflet";
import "leaflet/dist/leaflet.css";
import * as React from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import { MapClickHandler } from "./MapClickHandler";
import { handleMapMoveEnd } from "./utils/handleMapMoveEnd";

const RunescapeMap = ({
  setCorrectPolygon,
  correctPolygon,
  currentSong,
  setGuessResult,
  setResultVisible,
  resultVisible,
  userGuessed,
  setResultsArray,
  resultsArray,
  dailyChallengeIndex,
  setDailyComplete,
  startedGame,
  currentSongUi,
  setCurrentSongUi,
  setPercentile,
  startTime,
  setTimeTaken,
  totalDailyResults,
}) => {
  const outerBounds = new L.LatLngBounds(
    L.latLng(-78, 0),
    L.latLng(0, 136.696),
  );

  const mapRef = useRef<L.Map>(null);

  React.useEffect(() => {
    const map = mapRef.current;
    if (map) {
      const moveend = handleMapMoveEnd(mapRef, outerBounds);
      map.addEventListener("moveend", moveend);
      return () => map.removeEventListener("moveend", moveend);
    }
  }, []);

  // #region click handler
  const [position, setPosition] = useState(null);
  let zoom = 0;
  let geojsonFeature;
  let center;
  const userGuessed = (
    geojsonFeature,
    center,
    zoom,
    setResultVisible,
    setCorrectPolygon,
    map,
  ) => {
    setResultVisible(true);
    setCorrectPolygon(geojsonFeature);
    map.panTo(center, zoom);
    setCurrentSongUi(currentSong);
  };

  const calculatePoints = (distance) =>
    (1000 * 1) / Math.exp(0.0018 * distance);

  const map = useMapEvents({
    click: async (e) => {
      if (resultVisible || !startedGame) {
        return;
      }
      incrementGlobalGuessCounter();
      setPosition(e.latlng);

      zoom = map.getMaxZoom();
      const { x, y } = map.project(e.latlng, zoom);
      const ourPixelCoordsClickedPoint = [x, y];

      const clickedFeatures = geojsondata.features.filter((feature) =>
        feature.geometry.coordinates.some((poly) => {
          const transformedPoly = polygon([
            closePolygon(poly.map(toOurPixelCoordinates)),
          ]);
          return booleanPointInPolygon(
            ourPixelCoordsClickedPoint,
            transformedPoly,
          );
        }),
      );
      const correctFeature = geojsondata.features.find(
        featureMatchesSong(currentSong),
      );
      const correctClickedFeature = clickedFeatures.find(
        featureMatchesSong(currentSong),
      );
      const resultsArrayTemp = resultsArray;

      if (correctClickedFeature) {
        setGuessResult(1000);
        resultsArrayTemp[dailyChallengeIndex] = 1000;
        setResultsArray(resultsArrayTemp);
        incrementSongSuccessCount(currentSong);
        setResultVisible(true);
        localStorage.setItem("dailyResults", JSON.stringify(resultsArray));
      } else {
        incrementSongFailureCount(currentSong);
        const correctPolygonCenterPoints =
          correctFeature.geometry.coordinates.map((polygon) =>
            getCenterOfPolygon(polygon.map(toOurPixelCoordinates)),
          );
        const distances = correctPolygonCenterPoints.map((point) =>
          calculateDistance(ourPixelCoordsClickedPoint, point),
        );
        const minDistance = Math.min(...distances);
        setGuessResult(Math.round(calculatePoints(minDistance)));
        resultsArrayTemp[dailyChallengeIndex] = Math.round(
          calculatePoints(minDistance),
        );
        setResultsArray(resultsArrayTemp);
        localStorage.setItem("dailyResults", JSON.stringify(resultsArray));
      }
      if (resultsArray.length > 4) {
        setTimeTaken(calculateTimeDifference(startTime, new Date()));
        setTimeout(() => setDailyComplete(true), 1500);
        if (
          localStorage?.dailyComplete === undefined ||
          localStorage?.dailyComplete !== getCurrentDateInBritain()
        ) {
          const dailyComplete = getCurrentDateInBritain();
          localStorage.setItem("dailyComplete", dailyComplete);
          localStorage.setItem(
            "dailyTimeTaken",
            calculateTimeDifference(startTime, new Date()),
          );
          const dailyResultTotal = resultsArray.reduce(
            (total, result) => total + result,
            0,
          );
          const percentile = calculateDailyChallengePercentile(
            totalDailyResults,
            dailyResultTotal,
          );
          // const percentile = await getDailyChallengePercentileAndIncrement(
          //   dailyResultTotal ?? 0,
          // );
          incrementDailyChallenge(dailyResultTotal);
          setPercentile(percentile);
        }
      } else {
        setDailyComplete(false);
      }
      // Create a GeoJSON feature for the nearest correct polygon
      const correctPolygon = correctFeature.geometry.coordinates.sort(
        (polygon1, polygon2) => {
          const c1 = getCenterOfPolygon(polygon1.map(toOurPixelCoordinates));
          const c2 = getCenterOfPolygon(polygon2.map(toOurPixelCoordinates));
          const d1 = calculateDistance(ourPixelCoordsClickedPoint, c1);
          const d2 = calculateDistance(ourPixelCoordsClickedPoint, c2);
          return d1 - d2;
        },
      )[0];
      const convertedCoordinates = correctPolygon // 1. their pixel coords
        .map(toOurPixelCoordinates) // 2. our pixel coords
        .map((coordinate) => map.unproject(coordinate, zoom)) // 3. leaflet { latlng }
        .map(({ lat, lng }) => [lng, lat]); // 4. leaflet [ latlng ]
      geojsonFeature = {
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: [convertedCoordinates],
        },
      };

      center = map.unproject(
        getCenterOfPolygon(
          correctPolygon // 1. their pixel coords
            .map(toOurPixelCoordinates), // 2. our pixel coords
        ),
        zoom,
      );
      userGuessed(
        geojsonFeature,
        center,
        zoom,
        setResultVisible,
        setCorrectPolygon,
        map,
      );
    },
  });

  // #endregion click handler

  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <MapContainer
        ref={mapRef}
        center={[-35, 92.73]}
        zoom={5}
        maxZoom={6}
        minZoom={4}
        style={{ height: "100vh", width: "100%" }}
        maxBounds={outerBounds}
        maxBoundsViscosity={1}
        crs={CRS.Simple}
      >
        <MapClickHandler
          setCorrectPolygon={setCorrectPolygon}
          correctPolygon={correctPolygon}
          currentSong={currentSong}
          setGuessResult={setGuessResult}
          setResultVisible={setResultVisible}
          resultVisible={resultVisible}
          userGuessed={userGuessed}
          setResultsArray={setResultsArray}
          resultsArray={resultsArray}
          dailyChallengeIndex={dailyChallengeIndex}
          setDailyComplete={setDailyComplete}
          startedGame={startedGame}
          currentSongUi={currentSongUi}
          setCurrentSongUi={setCurrentSongUi}
          setPercentile={setPercentile}
          startTime={startTime}
          setTimeTaken={setTimeTaken}
          totalDailyResults={totalDailyResults}
        />
        <TileLayer attribution="offline" url={`/rsmap-tiles/{z}/{x}/{y}.png`} />
      </MapContainer>
    </div>
  );
};

export default RunescapeMap;
