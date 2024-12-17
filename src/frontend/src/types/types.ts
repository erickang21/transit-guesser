export type Coordinate = {
    latitude: number;
    longitude: number;
}

type RouteEntry = {
    _id: number;
    name: string;
    network: string;
    number: string;
    operator: string;
    type: string;
}

export type Stop = {
    _id: number;
    inaccurateReports: number;
    name: string;
    network: string;
    operator: string;
    routes: RouteEntry[];
    longitude: number;
    latitude: number;
}

export type RandomStopResponse = Stop & {
    availableRoutes: Stop[]
    correctRoutes: Record<string, string[]>
}

type StopEntry = {
    name: string;
    index: number;
    latitude: number;
    longitude: number;
}

export type Route = {
    _id: number;
    inaccurateReports: number;
    name: string;
    network: string;
    number: string;
    operator: string;
    stops: StopEntry[];
    type: string;
}

export type GameMode = {
    name: string;
    imageUrl: string;
    description: string;
}

export type AuthenticationRequest = {
    email: string;
    password: string;
    username: string;
}

export type AuthenticationResponse = {
    error: string | null;
    success: boolean;
    token: string | null;
    username: string | null;
    email: string | null;
    level: number | null;
    points: number | null;
}