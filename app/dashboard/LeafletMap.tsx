/* eslint-disable @typescript-eslint/no-unused-vars */
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
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import MapMarker from "./MapMarker";
import { GeoJSON } from "react-leaflet"; // 添加这个导入
import * as utm from "utm"; // 使用 utm 库
import { json } from "stream/consumers";

function MyClick() {
  const map = useMapEvent("click", (e) => {
    const popup = L.popup()
      .setLatLng(e.latlng)
      .setContent(`(${e.latlng.lng.toFixed(2)}, ${e.latlng.lat.toFixed(2)})`);
    popup.openOn(map);
  });

  return null;
}

export interface Obstacle {
  id: number; // 障碍物的唯一标识符
  polygon: Array<[number, number]>; // 定义障碍物边界的坐标数组
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
    coordinates:
      | [number, number][]
      | [number, number][][]
      | [number, number][][][];
  };
}

interface GeoJSONData {
  type: "FeatureCollection";
  features: GeoJSONFeature[];
}

interface LeafletMapProps {
  points?: [number, number][];
  geoJsonPath?: string;
  carInfo?: {
    x: number | null;
    y: number | null;
    yaw: number | null;
  };
  obstacles: Obstacle[];
}

const entryPointIcon = L.icon({
  iconUrl: "/info.svg",
  iconSize: [15, 15],
});

const startPointIcon = L.icon({
  iconUrl: "/rectangle.png",
  iconSize: [22, 22],
});

const customIcon = L.icon({
  iconUrl: "/dot.png",
  iconSize: [15, 15],
});

// 定义原点坐标
const ORI_LON = 113.580362; // 原点经度
const ORI_LAT = 22.743663; // 原点纬度

// 获取原点UTM坐标
const oriUtm = utm.fromLatLon(ORI_LAT, ORI_LON);
const ORI_X = oriUtm.easting; // 原点东向偏移
const ORI_Y = oriUtm.northing; // 原点北向偏移

// 定义局部原点的UTM坐标
const LOCAL_ORIGIN_X = -415649.377958606;
const LOCAL_ORIGIN_Y = 915007.46913815168;

function rotatePoint(
  symX: number,
  symY: number,
  angleDegrees: number
): [number, number] {
  // 将角度转换为弧度
  const angleRadians = (angleDegrees * Math.PI) / 180;

  // 计算旋转矩阵的元素
  const cosTheta = Math.cos(angleRadians);
  const sinTheta = Math.sin(angleRadians);

  // 应用旋转矩阵
  const rotX = cosTheta * symX + sinTheta * symY;
  const rotY = -sinTheta * symX + cosTheta * symY;

  return [rotX, rotY];
}

function transformCRS(x: number, y: number): [number, number] {
  // Step 1: Y-axis symmetry transformation
  const symX = x;
  const symY = -y;

  // Step 2: Translation to align first point
  const angleDegrees = -34; // 顺时针旋转30度

  const [rotX, rotY] = rotatePoint(symX, symY, angleDegrees);

  const resX = rotX + 35.0682;
  const resY = rotY + 6.22232;

  return [resX, resY];
}

function obstacleCRS(x: number, y: number): [number, number] {
  //step1：旋转90度变换
  const angleDegrees = 90;
  const [rotX, rotY] = rotatePoint(x, y, angleDegrees);
  const resX = rotX;
  const resY = -rotY;
  return [resX, resY];
}

// function transformAngle(angle: number): number {
//   const rotationAngle = -34; // 顺时针旋转34度
//   return angle + rotationAngle;
// }

// 添加坐标转换函数
function transformCoordinates(lon: number, lat: number): [number, number] {
  try {
    // 检查输入值是否有效
    if (
      !isFinite(lon) ||
      !isFinite(lat) ||
      lon < -180 ||
      lon > 180 ||
      lat < -90 ||
      lat > 90
    ) {
      console.warn("Invalid coordinates lon:", lon);
      console.warn("Invalid coordinates lat:", lat);
      return [0, 0];
    }

    const utmCoord = utm.fromLatLon(lat, lon);
    // 从原点偏移
    const x = utmCoord.easting - ORI_X - LOCAL_ORIGIN_X;
    const y = utmCoord.northing - ORI_Y - LOCAL_ORIGIN_Y;
    return [x, y];
  } catch (error) {
    console.error("Error in coordinate transformation:", error);
    return [0, 0];
  }
}

function processGeoJsonData(data: GeoJSONData): GeoJSONData {
  const transformedData: GeoJSONData = JSON.parse(JSON.stringify(data));

  transformedData.features.forEach((feature: GeoJSONFeature) => {
    if (
      feature.properties.Type === "Lane" ||
      feature.properties.Type === "LaneBoundary"
    ) {
      feature.geometry.coordinates = (
        feature.geometry.coordinates as [number, number][]
      ).map((coords) => {
        const [x, y] = transformCoordinates(coords[0], coords[1]);
        return [x, y];
      });
    } else if (feature.properties.Type === "Surface") {
      // @ts-expect-error: 测试环境不需要严格类型检查
      feature.geometry.coordinates = (
        feature.geometry.coordinates as [number, number][][][]
      ).map((polygon) =>
        polygon.map((coordsArray) =>
          coordsArray.map((coords) => {
            const [x, y] = transformCoordinates(coords[0], coords[1]);
            return [x, y];
          })
        )
      );
    } else if (feature.properties.Type === "ParkingSpace") {
      // @ts-expect-error: 测试环境不需要严格类型检查
      feature.geometry.coordinates = (
        feature.geometry.coordinates as [number, number][][]
      ).map((ring) =>
        ring.map((coords) => {
          const [x, y] = transformCoordinates(coords[0], coords[1]);

          return [x, y];
        })
      );

      if (feature.properties.EntryPosition) {
        const [x, y] = transformCoordinates(
          feature.properties.EntryPosition[0],
          feature.properties.EntryPosition[1]
        );
        feature.properties.EntryPosition = [x, y];
      }
    }
  });

  return transformedData;
}

const LeafletMap: React.FC<LeafletMapProps> = ({
  points,
  geoJsonPath,
  carInfo,
  obstacles,
}) => {
  const [geoJsonData, setGeoJsonData] = useState<GeoJSONData | null>(null);
  useEffect(() => {
    if (geoJsonPath) {
      fetch(geoJsonPath)
        .then((response) => response.json())
        .then((data) => {
          const transformedData = processGeoJsonData(data);
          setGeoJsonData(transformedData);
        })
        .catch((error) => console.error("Error loading GeoJSON:", error));
    }
  }, [geoJsonPath]);

  return (
    <MapContainer
      center={[10, 10]} // 地图中心点（可调整）
      zoom={1} // 调整缩放级别
      minZoom={3}
      maxZoom={6}
      scrollWheelZoom={true}
      crs={L.CRS.Simple}
      className="rounded-lg w-full h-[36rem]"
    >
      <MyClick />

      {points && points.length > 1 && (
        <>
          <Polyline
            pathOptions={{
              color: "#0c0a09",
              weight: 5,
            }}
            positions={points.map(([lng, lat]) => transformCRS(lng, lat))} // 对经度取负值
            smoothFactor={1.0}
          />
          <Marker
            position={transformCRS(points[0][0], points[0][1])}
            icon={startPointIcon}
          >
            {" "}
            {/* 起点镜像 */}
            <Popup>起点</Popup>
          </Marker>
          <Marker
            position={transformCRS(
              points[points.length - 1][0],
              points[points.length - 1][1]
            )}
            icon={customIcon}
          >
            {" "}
            {/* 终点镜像 */}
            <Popup>终点</Popup>
          </Marker>
        </>
      )}

      {geoJsonData && (
        <>
          <GeoJSON
            data={geoJsonData}
            style={(feature) => {
              if (
                feature?.properties.Type === "Lane" ||
                feature?.properties.Type === "LaneBoundary"
              ) {
                return {
                  color: "#000000",
                  weight: 2,
                };
              } else if (feature?.properties.Type === "ParkingSpace") {
                return {
                  color: "#0000FF",
                  weight: 2,
                };
              }
              return {};
            }}
            pointToLayer={(feature, latlng) => {
              if (
                feature.properties.Type === "ParkingSpace" &&
                feature.properties.EntryPosition
              ) {
                return L.marker(
                  [
                    feature.properties.EntryPosition[1],
                    feature.properties.EntryPosition[0],
                  ],
                  { icon: entryPointIcon }
                );
              }
              return L.marker(latlng);
            }}
            onEachFeature={(feature, layer) => {
              if (feature.properties.Type === "ParkingSpace") {
                // layer.bindPopup(`
                //   <div>
                //     <p>ID: ${feature.properties.Id}</p>
                //     ${
                //       feature.properties.Name
                //         ? `<p>Name: ${feature.properties.Name}</p>`
                //         : ""
                //     }
                //     ${
                //       feature.properties.Function
                //         ? `<p>Function: ${feature.properties.Function}</p>`
                //         : ""
                //     }
                //   </div>
                // `);
              } else {
                // layer.bindPopup(feature.properties.Id);
              }
            }}
            coordsToLatLng={(coords) => {
              return L.latLng(coords[1], coords[0]);
            }}
          />
        </>
      )}

      <ScaleControl position="bottomleft" metric={true} imperial={false} />
      {carInfo &&
        carInfo.x !== null &&
        carInfo.y !== null &&
        carInfo.yaw !== null && (
          <MapMarker
            data={transformCRS(carInfo.x, carInfo.y)}
            angle={-(carInfo.yaw - 34 + 360) % 360} // 修正后的角度
          />
        )}
      {obstacles &&
        obstacles.map((obstacle) => (
          <Polyline
            key={obstacle.id}
            positions={obstacle.polygon.map(([lng, lat]) =>
              obstacleCRS(lng, lat)
            )}
            pathOptions={{ color: "red", weight: 3 }}
          />
        ))}
    </MapContainer>
  );
};

export default LeafletMap;
