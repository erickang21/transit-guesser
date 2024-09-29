import axios from "axios";
import { DevEndpoints, Endpoints } from "./endpoints";
import {RandomStopResponse, Route, Stop} from "../types/types";

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