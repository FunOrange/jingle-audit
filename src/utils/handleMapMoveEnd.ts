import L from "leaflet";
import { MutableRefObject } from "react";

export const handleMapMoveEnd =
  (mapRef: MutableRefObject<L.Map | null>, outerBounds: L.LatLngBounds) =>
  () => {
    if (!outerBounds.contains(mapRef.current!.getBounds())) {
      mapRef.current!.fitBounds(outerBounds);
    }
  };
