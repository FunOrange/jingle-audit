import L from "leaflet";
import { MutableRefObject } from "react";

export const handleMapMoveEnd = (
  mapRef: MutableRefObject<L.Map>,
  outerBounds: L.LatLngBounds,
) => {
  const map = mapRef.current;

  if (map) {
    const currentBounds = map.getBounds();

    if (!outerBounds.contains(currentBounds)) {
      map.fitBounds(outerBounds);
    }
  }
};
