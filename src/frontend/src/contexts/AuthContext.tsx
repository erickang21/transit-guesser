import React, {createContext, useState, useContext, useEffect, useCallback} from 'react';
import {AuthenticationResponse} from "../types/types";
import {handleUpdatePoints} from "../helpers/api";

interface AuthContextType {
    addPoints: (pointsToAdd: number) => Promise<number | undefined>;
    error: string | null;
    email: string | null;
    isAuthenticated: boolean;
    level: number | null;
    login: (credentials: AuthenticationResponse) => void;
    logout: () => void;
    points: number | null;
    setError: React.Dispatch<React.SetStateAction<string | null>>;
    token: string | null;
    username: string | null;
}

const AuthContext = createContext<AuthContextType>({
    addPoints: async () => { return undefined; },
    error: null,
    email: null,
    isAuthenticated: false,
    level: null,
    login: () => {},
    logout: () => {},
    points: null,
    setError: () => {},
    token: null,
    username: null,
});

const BASE_LEVEL_POINTS = 500;
const GROWTH_FACTOR = 1.05;

export function pointsForLevel(level: number) {
    const points = BASE_LEVEL_POINTS * Math.pow(GROWTH_FACTOR, level - 1);
    return Math.round(points / 100) * 100;
}


export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }: { children: React.ReactElement }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [token, setToken] = useState<string | null>(null);
    const [username, setUsername] = useState<string | null>(null);
    const [email, setEmail] = useState<string | null>(null);
    const [level, setLevel] = useState<number | null>(null);
    const [points, setPoints] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            setIsAuthenticated(true);
            setToken(token);
        }
    }, [setIsAuthenticated, setToken]);

    const login = useCallback((credentials: AuthenticationResponse) => {
        if (credentials.token && credentials.username && credentials.level !== null && credentials.points !== null && credentials.email) {
            console.log("Set authenticated")
            localStorage.setItem('authToken', credentials.token);
            setIsAuthenticated(true);
            setToken(credentials.token);
            setUsername(credentials.username);
            setEmail(credentials.email);
            setLevel(credentials.level);
            setPoints(credentials.points);
            setError(null);
        }
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('authToken');  // Remove the token from localStorage
        setIsAuthenticated(false);
        setToken(null);
        setUsername(null);
        setEmail(null);
        setLevel(null);
        setPoints(null);
        setError(null);
    }, []);

    const addPoints = useCallback(async (pointsToAdd: number): Promise<number | undefined> => {
        let leveledUp = false;
        if (points !== null && level !== null && email != null) {
            let newPoints = points + pointsToAdd;
            let newLevel = level;
            while (newPoints > pointsForLevel(newLevel)) {
                newPoints -= pointsForLevel(newLevel);
                newLevel += 1;
                if (!leveledUp) leveledUp = true;
            }
            // update state for frontend
            setPoints(newPoints);
            setLevel(newLevel);
            // save to backend (database)
            const result = await handleUpdatePoints({ email, level: newLevel, points: newPoints });
            if (!result.success) {
                setError(result.error);
                return undefined;
            }
            return leveledUp ? newLevel : undefined;
        } else {
            return undefined;
        }
    }, [points, level, email]);

    return (
        <AuthContext.Provider value={{ addPoints, error, email, isAuthenticated, level, login, logout, points, setError, token, username }}>
            {children}
        </AuthContext.Provider>
    );
};
