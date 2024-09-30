import React, {useState, useEffect, useContext} from 'react';
import {Coordinate, RandomStopResponse, Route, Stop} from "../types/types";
import {getAllStops, getRandomStop} from "../helpers/api";
import MainGame from "../components/MainGame";
import {MainGameContext} from "../contexts/MainGameContext";

const MainGamePage = (): React.ReactElement => {
    return <MainGame />
}

export default MainGamePage;