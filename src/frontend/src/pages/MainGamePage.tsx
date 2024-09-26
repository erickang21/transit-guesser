import React, { useState, useEffect } from 'react';
import {Coordinate, Stop} from "../types/types";
import {getAllStops} from "../helpers/api";
import MainGame from "../components/MainGame";

const MainGamePage = (): React.ReactElement => {
    const [coordinates, setCoordinates] = useState<Coordinate[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStops = async () => {
            try {
                const stopsData: Stop[] = await getAllStops();
                // Randomly select a stop
                const selectedStop: Stop = stopsData[Math.floor(Math.random() * stopsData.length)];
                setCoordinates((prev) => [...prev, { latitude: selectedStop.latitude, longitude: selectedStop.longitude }])
            } catch (error) {
                console.error('Error fetching stops:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStops();
    }, []);

    if (loading || !coordinates.length) {
        return (
            <div className="home-page">
                <div className="home-navbar">
                    <span>Loading...</span>
                </div>
            </div>
        )
    }

    return <MainGame coordinates={coordinates} />
}

export default MainGamePage;