import React, {useState, useEffect, useContext} from 'react';
import {Coordinate, RandomStopResponse, Route, Stop} from "../types/types";
import {getAllStops, getRandomStop} from "../helpers/api";
import MainGame from "../components/MainGame";
import {MainGameContext} from "../contexts/MainGameContext";
import { useLocation } from "react-router-dom";

const MainGamePage = (): React.ReactElement => {
    const location = useLocation();
    const { showTutorial } = location.state || { showTutorial: false };
    return <MainGame showTutorial={showTutorial} />
}

export default MainGamePage;