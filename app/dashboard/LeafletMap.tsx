"use client";
import React, { useState } from "react";
import L from "leaflet";
import {
  ImageOverlay,
  MapContainer,
  Marker,
  Polyline,
  Popup,
  ScaleControl,
  useMapEvent,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import MapMarker from "./MapMarker";

function MyClick() {
  const map = useMapEvent("click", (e) => {
    const popup = L.popup()
      .setLatLng(e.latlng)
      .setContent(`(${e.latlng.lng.toFixed(2)}, ${e.latlng.lat.toFixed(2)})`);
    popup.openOn(map);
  });

  return null;
}

interface LeafletMapProps {
  points: [number, number][];
}

const LeafletMap: React.FC<LeafletMapProps> = ({ points }) => {
  const [mapImage] = useState<string>("/baidu.png");

  // Define fixed bounds for the image
  const bounds: [[number, number], [number, number]] = [
    [0, 0],
    [1000, 1000], // Adjust these values based on your image dimensions and desired scale
  ];

  const customIcon = L.icon({
    iconUrl: "/dot.png",
    iconSize: [20, 20],
  });

  return (
    <MapContainer
      center={[0, 0]} // Center point adjusted to match the bounds
      zoom={5}
      minZoom={3}
      maxZoom={8}
      scrollWheelZoom={true}
      className="rounded-lg w-full h-[45rem]"
    >
      <ImageOverlay url={mapImage} bounds={bounds} />
      <MyClick />
      {points.length > 1 && (
        <>
          <Polyline
            pathOptions={{
              color: "#0c0a09",
              weight: 8,
            }}
            positions={points}
          />
          <Marker position={points[0]} icon={customIcon}>
            <Popup>起点</Popup>
          </Marker>
          <Marker position={points[points.length - 1]} icon={customIcon}>
            <Popup>终点</Popup>
          </Marker>
        </>
      )}
      <ScaleControl position="bottomleft" metric={true} imperial={false} />
      <MapMarker data={[1, 1]} angle={1 * 45} />
    </MapContainer>
  );
};

export default LeafletMap;
