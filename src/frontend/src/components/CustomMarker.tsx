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
        iconUrl: "https://cdn.discordapp.com/attachments/520734295112024064/1288638128139014215/pngegg.png?ex=66f5e947&is=66f497c7&hm=243b3c3b943d24ac70abb4025cf194e43f09c30c95b6fb65ffacb26fee714b9e&",
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