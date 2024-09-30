// Map.tsx
import React, {useContext} from "react";
import { MapContainer, Popup, TileLayer } from "react-leaflet";
import CustomMarker from "./CustomMarker";
import { Coordinate } from "../types/types";
import {MainGameContext} from "../contexts/MainGameContext";

interface MapProps {
    zoom?: number;
}

export default function Map({ zoom }: MapProps) {
    const { coordinates } = useContext(MainGameContext);
    if (!coordinates.length) return (
        <div style={{width: "100vw"}}>
            <span>Loading...</span>
        </div>
    )
    return (
        <div style={{width: "100vw"}}>
        <MapContainer center={[coordinates[0].latitude, coordinates[0].longitude]} zoom={zoom || 35} scrollWheelZoom={false} >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
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