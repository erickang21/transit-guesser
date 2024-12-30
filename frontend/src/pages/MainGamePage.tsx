import React from 'react';
import MainGame from "../components/MainGame";
import { useLocation } from "react-router-dom";

const MainGamePage = (): React.ReactElement => {
    const location = useLocation();
    const { showTutorial } = location.state || { showTutorial: false };
    return <MainGame showTutorial={showTutorial} />
}

export default MainGamePage;