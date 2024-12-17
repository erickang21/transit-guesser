import axios from "axios";
import { DevEndpoints, Endpoints } from "./endpoints";
import {RandomStopResponse, Route, Stop, AuthenticationResponse, AuthenticationRequest} from "../types/types";

export const getAllStops = async (): Promise<Stop[]> => {
    const endpoints: Record<string, string> = process.env.NODE_ENV === "development" ? DevEndpoints : Endpoints;
    try {
        console.log("endpoint ", endpoints.stops)
        const response = await axios.get(endpoints.stops);
        return response.data;
    } catch (err) {
        throw new Error(`\`Error fetching stops: ${err}`)
    }
}

export const getAllRoutes = async (): Promise<Route[]> => {
    const endpoints: Record<string, string> = process.env.NODE_ENV === "development" ? DevEndpoints : Endpoints;
    try {
        const response = await axios.get(endpoints.routes);
        return await response.data;
    } catch (err) {
        throw new Error(`\`Error fetching routes: ${err}`)
    }
}

export const getRandomStop = async (): Promise<RandomStopResponse> => {
    const endpoints: Record<string, string> = process.env.NODE_ENV === "development" ? DevEndpoints : Endpoints;
    try {
        const response = await axios.get(endpoints.randomStop);
        return response.data;
    } catch (err) {
        throw new Error(`\`Error fetching a random stop: ${err}`)
    }
}

export const getOperators = async (): Promise<Record<string, string[]>> => {
    const endpoints: Record<string, string> = process.env.NODE_ENV === "development" ? DevEndpoints : Endpoints;
    try {
        const response = await axios.get(endpoints.operators);
        return response.data;
    } catch (err) {
        throw new Error(`\`Error fetching a random stop: ${err}`)
    }
}

export const handleLogin = async ({ email, password, username }: AuthenticationRequest): Promise<AuthenticationResponse> => {
    const endpoints: Record<string, string> = process.env.NODE_ENV === "development" ? DevEndpoints : Endpoints;
    try {
        const response = await axios.post(endpoints.login, { email, password, username }, {
            headers: {
                'Content-Type': 'application/json', // Ensure correct content type
            }
        });
        if (response.data.success) {
            return {
                success: true,
                token: response.data.token,
                level: response.data.level,
                points: response.data.points,
                username: response.data.username,
                email: response.data.email,
                error: null,
            };
        } else {
            return {
                success: false,
                token: null,
                level: null,
                points: null,
                username: null,
                email: null,
                error: response.data.error
            };
        }
    } catch (err) {
        throw new Error(`\`Error completing login: ${err}`)
    }
}

export const handleRegister = async ({ email, password, username }: AuthenticationRequest): Promise<AuthenticationResponse> => {
    const endpoints: Record<string, string> = process.env.NODE_ENV === "development" ? DevEndpoints : Endpoints;
    try {
        const response = await axios.post(endpoints.register, { email, password, username }, {
            headers: {
                'Content-Type': 'application/json', // Ensure correct content type
            }
        });
        console.log("response", response)
        if (response.data.success) {
            return {
                success: true,
                token: response.data.token,
                level: response.data.level,
                points: response.data.points,
                username: response.data.username,
                email: response.data.email,
                error: null
            };
        } else {
            return {
                success: false,
                token: null,
                level: null,
                points: null,
                username: null,
                email: null,
                error: response.data.error
            };
        }
    } catch (err) {
        throw new Error(`\`Error completing registration: ${err}`)
    }
}

export const handleUpdatePoints = async ({ email, level, points }: { email: string, level: number, points: number }): Promise<{ success: boolean, error: string | null }> => {
    const endpoints: Record<string, string> = process.env.NODE_ENV === "development" ? DevEndpoints : Endpoints;
    try {
        const response = await axios.post(endpoints.addPoints, { email, level, points }, {
            headers: {
                'Content-Type': 'application/json', // Ensure correct content type
            }
        });
        if (response.data.success) return { success: true, error: null }
        else return { success: false, error: response.data.error }
    } catch (err) {
        throw new Error(`\`Error completing adding points: ${err}`)
    }
}