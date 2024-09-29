// Map.tsx
import React from "react";
import { MapContainer, Popup, TileLayer } from "react-leaflet";
import CustomMarker from "./CustomMarker";
import { Coordinate } from "../types/types";

interface MapProps {
    center: Coordinate;
    markers: Coordinate[];
    zoom?: number;
}

export default function Map({ center, markers, zoom }: MapProps) {
    console.log("Map is rendered with center: ", center);
    console.log("Map is rendered with markers: ", markers)
    return (
        <div style={{width: "100vw"}}>
        <MapContainer center={[center.latitude, center.longitude]} zoom={zoom || 35} scrollWheelZoom={false} >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {markers.length && markers.map((marker, index) => (
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