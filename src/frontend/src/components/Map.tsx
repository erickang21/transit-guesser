// Map.tsx
import React from "react";
import { MapContainer, Popup, TileLayer } from "react-leaflet";
import CustomMarker from "./CustomMarker";

export default function Map() {
    return (
        <MapContainer center={[43.4117746, -80.5157882]} zoom={35} scrollWheelZoom={false}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <CustomMarker position={[43.4117746, -80.5157882]}>
                <Popup>This is a custom marker popup</Popup>
            </CustomMarker>
        </MapContainer>
    );
}