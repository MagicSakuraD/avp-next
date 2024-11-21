"use client";
import { LeafletTrackingMarker } from "react-leaflet-tracking-marker";
import { useEffect, useState } from "react";
import L from "leaflet";

const icon = L.icon({
  iconSize: [25, 25],

  iconUrl: "/compass.png",
});

interface MapMarkerProps {
  data: [number, number];
  angle: number; // Add this line
}

export default function MapMarker({ data, angle }: MapMarkerProps) {
  const [latitude, longitude] = data;
  const [prevPos, setPrevPos] = useState([latitude, longitude]);
  const [prevAngle, setPrevAngle] = useState(angle);

  // console.log("latitude", latitude, "longitude", longitude, "angle", angle);

  useEffect(() => {
    if (prevPos[1] !== longitude || prevPos[0] !== latitude)
      setPrevPos([latitude, longitude]);
  }, [latitude, longitude, prevPos]);

  useEffect(() => {
    if (prevAngle !== angle) setPrevAngle(angle);
  }, [angle, prevAngle]);

  return (
    <LeafletTrackingMarker
      icon={icon}
      position={[latitude, longitude]}
      // previousPosition={prevPos as L.LatLngExpression}
      duration={1000}
      rotationAngle={angle}
    />
  );
}
