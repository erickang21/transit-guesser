import React, { useState, useEffect } from 'react';
import {Coordinate, RandomStopResponse, Route, Stop} from "../types/types";
import {getAllStops, getRandomStop} from "../helpers/api";
import MainGame from "../components/MainGame";

const MainGamePage = (): React.ReactElement => {
    const [coordinates, setCoordinates] = useState<Coordinate[]>([]);
    const [loading, setLoading] = useState(true);
    const [correctRoutes, setCorrectRoutes] = useState<Route[]>([]);

    useEffect(() => {
        const fetchStops = async () => {
            try {
                const selectedStop: RandomStopResponse = await getRandomStop();
                // Randomly select a stop
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