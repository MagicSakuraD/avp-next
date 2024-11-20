"use client";
import React, { useState, useEffect } from "react";
import L from "leaflet";
import {
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

interface GeoJSONFeature {
  type: string;
  properties: {
    Type: string;
    Id: string;
    Name?: string;
    Function?: string;
    EntryPosition?: [number, number];
  };
  geometry: {
    type: string;
    coordinates: [number, number, number][] | [number, number, number][][];
  };
}

interface GeoJSONData {
  type: string;
  features: GeoJSONFeature[];
}

interface LeafletMapProps {
  points?: [number, number][];
  geoJsonPath?: string;
  carInfo?: {
    x: number;
    y: number;
    yaw: number;
  };
}

const entryPointIcon = L.icon({
  iconUrl: "/info.svg",
  iconSize: [15, 15],
});

const LeafletMap: React.FC<LeafletMapProps> = ({
  points,
  geoJsonPath,
  carInfo,
}) => {
  const [geoJsonData, setGeoJsonData] = useState<GeoJSONData | null>(null);

  useEffect(() => {
    if (geoJsonPath) {
      fetch(geoJsonPath)
        .then((response) => response.json())
        .then((data) => {
          setGeoJsonData(data);
        })
        .catch((error) => console.error("Error loading GeoJSON:", error));
    }
  }, [geoJsonPath]);

  const customIcon = L.icon({
    iconUrl: "/dot.png",
    iconSize: [20, 20],
  });

  // Helper function to convert 3D coordinates to 2D
  const convert3Dto2D = (coord: [number, number, number]): [number, number] => {
    return [coord[1], coord[0]];
  };

  return (
    <MapContainer
      center={[22.743663, 113.580362]} // 更新为实际的中心点坐标
      zoom={20} // 调整缩放级别
      minZoom={18}
      maxZoom={24}
      scrollWheelZoom={true}
      className="rounded-lg w-full h-[36rem]"
    >
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

      {geoJsonData?.features.map((feature, index) => {
        if (
          feature.properties.Type === "Lane" ||
          feature.properties.Type === "LaneBoundary"
        ) {
          const coordinates = (
            feature.geometry.coordinates as [number, number, number][]
          ).map(convert3Dto2D);
          return (
            <React.Fragment key={`lane-${index}`}>
              <Polyline
                pathOptions={{ color: "#000000", weight: 2 }}
                positions={coordinates}
              >
                <Popup>{feature.properties.Id}</Popup>
              </Polyline>
            </React.Fragment>
          );
        }

        if (feature.properties.Type === "ParkingSpace") {
          const coordinates = (
            feature.geometry.coordinates as [number, number, number][][]
          )[0].map(convert3Dto2D);
          return (
            <React.Fragment key={`parking-${index}`}>
              <Polyline
                pathOptions={{ color: "#0000FF", weight: 2 }}
                positions={coordinates}
              >
                <Popup>{feature.properties.Id}</Popup>
              </Polyline>
              {feature.properties.EntryPosition && (
                <Marker
                  position={[
                    feature.properties.EntryPosition[1],
                    feature.properties.EntryPosition[0],
                  ]}
                  icon={entryPointIcon}
                >
                  <Popup>
                    <div>
                      <p>ID: {feature.properties.Id}</p>
                      {feature.properties.Name && (
                        <p>Name: {feature.properties.Name}</p>
                      )}
                      {feature.properties.Function && (
                        <p>Function: {feature.properties.Function}</p>
                      )}
                    </div>
                  </Popup>
                </Marker>
              )}
            </React.Fragment>
          );
        }

        return null;
      })}

      <ScaleControl position="bottomleft" metric={true} imperial={false} />
      <MapMarker data={[carInfo!.x, carInfo!.y]} angle={carInfo!.yaw} />
    </MapContainer>
  );
};

export default LeafletMap;
