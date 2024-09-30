import React, {createContext, useState, useContext, useEffect} from 'react';
import {Coordinate, RandomStopResponse} from "../types/types";
import {getOperators, getRandomStop} from "../helpers/api";

type MainGameContextType = {
    coordinates: Coordinate[];
    correctAnswers: Record<string, string[]>;
    operatorData: Record<string, string[]>;
}

// Create a Context for the theme (light/dark)
const MainGameContext: React.Context<MainGameContextType> = createContext<MainGameContextType>({
    coordinates: [],
    correctAnswers: {},
    operatorData: {},
});

// Create a ThemeProvider component to manage the theme state
const MainGameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [coordinates, setCoordinates] = useState<Coordinate[]>([]);
    const [correctAnswers, setCorrectAnswers] = useState<Record<string, string[]>>({});
    const [operatorData, setOperatorData] = useState<Record<string, string[]>>({});

    // Make API calls.
    useEffect(() => {
        const fetchAllData = async () => {
            const selectedStop: RandomStopResponse = await getRandomStop();
            const operators: Record<string, string[]> = await getOperators();
            setOperatorData((prev) => operators);
            setCoordinates((prev) => [...prev, { latitude: selectedStop.latitude, longitude: selectedStop.longitude }])
            setCorrectAnswers((prev) => selectedStop.correctRoutes);
            console.log("Context called from API: ", selectedStop, operators)
        }
        if (!coordinates.length) fetchAllData();
    }, []);

    return (
        <MainGameContext.Provider value={{ coordinates, correctAnswers, operatorData }}>
            {children}
        </MainGameContext.Provider>
    );
};

export { MainGameContext, MainGameProvider };
