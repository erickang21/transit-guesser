import React, {createContext, useState, useEffect, useCallback} from 'react';
import {Coordinate, RandomStopResponse} from "../types/types";
import {getOperators, getRandomStop} from "../helpers/api";

type MainGameContextType = {
    coordinates: Coordinate[];
    correctAnswers: Record<string, string[]>;
    operatorData: Record<string, string[]>;
    getNewData: () => void;
}

const MainGameContext: React.Context<MainGameContextType> = createContext<MainGameContextType>({
    coordinates: [],
    correctAnswers: {},
    operatorData: {},
    getNewData: () => {},
});

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
        }
        if (!coordinates.length) fetchAllData();
    }, [coordinates.length]);

    const getNewData = useCallback(async () => {
        const selectedStop: RandomStopResponse = await getRandomStop();
        const operators: Record<string, string[]> = await getOperators();
        setOperatorData((prev) => operators);
        setCoordinates((prev) => [...prev, { latitude: selectedStop.latitude, longitude: selectedStop.longitude }])
        setCorrectAnswers((prev) => selectedStop.correctRoutes);
    }, [setOperatorData, setCoordinates, setCorrectAnswers])

    return (
        <MainGameContext.Provider value={{ coordinates, correctAnswers, operatorData, getNewData }}>
            {children}
        </MainGameContext.Provider>
    );
};

export { MainGameContext, MainGameProvider };
