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
