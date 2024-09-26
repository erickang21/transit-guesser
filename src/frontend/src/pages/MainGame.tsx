import React, {useEffect, useState} from 'react';
import {Coordinate} from "../types/types";
import {getData} from "../helpers/fetchTransitRoutes";
import Map from "../components/Map";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import Container from 'react-bootstrap/Container';
import "../css/home.css";
import AnswerBox from "../components/AnswerBox";

const MainGame = (): React.ReactElement => {
    const data: Coordinate[] = getData();
    const [currentStops, setCurrentStops] = useState<Coordinate[]>([]);
    if (!currentStops.length) {
        setCurrentStops([data[Math.floor(Math.random() * data.length)]]);
    }
    /*
    useEffect(() => {
        // Create a guess when starting up the page.
        if (!currentStops.length) {
            setCurrentStops([data[Math.floor(Math.random() * data.length)]]);
        }
    }, [currentStops.length, setCurrentStops, data])
     */

    return (
        <div className="home-page">
            <div className="home-navbar">
                <Navbar expand="lg" className="bg-body-tertiary home-navbar-element">
                    <Container>
                        <Navbar.Brand href="#home">Transit Guesser</Navbar.Brand>
                        <Navbar.Toggle aria-controls="basic-navbar-nav" />
                        <Navbar.Collapse id="basic-navbar-nav">
                            <Nav className="me-auto">
                                <Nav.Link href="#home">Home</Nav.Link>
                            </Nav>
                        </Navbar.Collapse>
                    </Container>
                </Navbar>
            </div>
            <div className="home-map-container">
                <Map center={currentStops[0] } markers={currentStops} />
            </div>
            <AnswerBox />
        </div>
    )
}

export default MainGame;