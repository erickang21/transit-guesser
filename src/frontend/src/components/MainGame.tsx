import React, {useEffect, useMemo, useState} from 'react';
import {Coordinate, Stop} from "../types/types";
import Map from "./Map";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import Container from 'react-bootstrap/Container';
import "../css/home.css";
import AnswerBox from "./AnswerBox";
import CustomNavbar from "./Navbar";

const MainGame = (): React.ReactElement => {
    return (
        <div className="home-page">
            <CustomNavbar />
            <div className="home-map-container">
                <Map />
            </div>
            <AnswerBox />
        </div>
    );
}

export default MainGame;