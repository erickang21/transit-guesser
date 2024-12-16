import React, { createContext, useState, useContext, useEffect } from 'react';

interface AuthContextType {
    isAuthenticated: boolean;
    login: (token: string) => void;
    logout: () => void;
    token: string | null;
}

const AuthContext = createContext<AuthContextType>({
    isAuthenticated: false,
    login: () => {},
    logout: () => {},
    token: null,
});

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }: { children: React.ReactElement }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            setIsAuthenticated(true);
            setToken(token);
        }
    }, [setIsAuthenticated, setToken]);

    const login = (token: string) => {
        localStorage.setItem('authToken', token);
        setIsAuthenticated(true);
        setToken(token);
    };

    const logout = () => {
        localStorage.removeItem('authToken');  // Remove the token from localStorage
        setIsAuthenticated(false);
        setToken(null);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout, token }}>
            {children}
        </AuthContext.Provider>
    );
};
