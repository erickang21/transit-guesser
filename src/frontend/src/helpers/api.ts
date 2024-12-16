import axios from "axios";
import { DevEndpoints, Endpoints } from "./endpoints";
import {RandomStopResponse, Route, Stop, AuthenticationResponse} from "../types/types";

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

export const handleLogin = async ({ email, password }: { email: string, password: string }): Promise<AuthenticationResponse> => {
    const endpoints: Record<string, string> = process.env.NODE_ENV === "development" ? DevEndpoints : Endpoints;
    try {
        const response = await axios.post(endpoints.login, { email, password }, {
            headers: {
                'Content-Type': 'application/json', // Ensure correct content type
            }
        });
        if (response.data.success) {
            return { success: true, token: response.data.token };
        } else {
            return { success: false, token: null};
        }
    } catch (err) {
        throw new Error(`\`Error completing login: ${err}`)
    }
}

export const handleRegister = async ({ email, password }: { email: string, password: string }): Promise<AuthenticationResponse> => {
    const endpoints: Record<string, string> = process.env.NODE_ENV === "development" ? DevEndpoints : Endpoints;
    try {
        const response = await axios.post(endpoints.register, { email, password}, {
            headers: {
                'Content-Type': 'application/json', // Ensure correct content type
            }
        });
        console.log("response", response)
        if (response.data.success) {
            return { success: true, token: response.data.token };
        } else {
            return { success: false, token: null };
        }
    } catch (err) {
        throw new Error(`\`Error completing registration: ${err}`)
    }
}