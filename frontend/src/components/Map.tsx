// Map.tsx
import React, {useContext, useEffect} from "react";
import {MapContainer, Popup, TileLayer, useMap} from "react-leaflet";
import CustomMarker from "./CustomMarker";
import { Coordinate } from "../types/types";
import {MainGameContext} from "../contexts/MainGameContext";

interface MapProps {
    zoom?: number;
}

function MapCenter({ center }: { center: [number, number] }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center);
    }, [center, map]);
    return null;
}

export default function Map({ zoom }: MapProps) {
    const { coordinates } = useContext(MainGameContext);
    console.log("Coordinates detected for re-render: ", coordinates[coordinates.length - 1]?.latitude, coordinates[coordinates.length - 1]?.longitude);
    if (!coordinates.length) return (
        <div style={{width: "100vw"}}>
            <span>Loading...</span>
        </div>
    )
    return (
        <div style={{width: "100vw"}}>
        <MapContainer center={[coordinates[coordinates.length - 1].latitude, coordinates[coordinates.length - 1].longitude]} zoom={zoom || 35} scrollWheelZoom={false} >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapCenter center={[coordinates[coordinates.length - 1].latitude, coordinates[coordinates.length - 1].longitude]} />
            {coordinates.length && coordinates.map((marker, index) => (
                <>
                    <CustomMarker position={[marker.latitude, marker.longitude]} key={`marker-${index}`}>
                        <Popup>Take your guess!</Popup>
                        <p>test marker</p>
                    </CustomMarker>
                </>
            ))}
        </MapContainer>
        </div>
    );
}