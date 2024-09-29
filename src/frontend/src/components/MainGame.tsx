import React, {useEffect, useMemo, useState} from 'react';
import {Coordinate, Stop} from "../types/types";
import Map from "./Map";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import Container from 'react-bootstrap/Container';
import "../css/home.css";
import AnswerBox from "./AnswerBox";

const MainGame = ({ coordinates, correctAnswers }: { coordinates: Coordinate[], correctAnswers: Record<string, string[]>}): React.ReactElement => {
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
                <Map
                    center={coordinates[0]}
                    markers={coordinates}
                />
            </div>
            <AnswerBox correctAnswers={correctAnswers} />
        </div>
    );
}

export default MainGame;