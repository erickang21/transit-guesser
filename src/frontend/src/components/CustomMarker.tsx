// custom-marker.tsx

import React from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";

interface CustomMarkerProps {
    position: L.LatLngExpression;
    children: React.ReactNode; // Content to display inside the marker
}

const CustomMarker: React.FC<CustomMarkerProps> = ({ position, children }) => {
    const map = useMap();

    const customIcon = L.icon({
        iconUrl: "https://media.discordapp.net/attachments/520734295112024064/1278368640143462420/image.png?ex=66f42592&is=66f2d412&hm=44ced06c19d600780a668064de8ff771479ca533945bb979adaa2290f9d52299&=&format=webp&quality=lossless&width=1375&height=772",
        iconSize: [50, 50],
        iconAnchor: [25, 50],
    });

    return (
        <Marker position={position} icon={customIcon}>
            {children}
        </Marker>
    );
};

export default CustomMarker;