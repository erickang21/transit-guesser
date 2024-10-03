import React, {useEffect, useMemo, useState} from 'react';
import {Coordinate, Stop} from "../types/types";
import Map from "./Map";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import Container from 'react-bootstrap/Container';
import "../css/home.css";
import AnswerBox from "./AnswerBox";

const MainGame = (): React.ReactElement => {
    return (
        <div className="home-page">
            <div className="home-navbar">
                <Navbar expand="lg" className="bg-body-tertiary home-navbar-element">
                    <Container style={{ marginLeft: "0", marginRight: "0" }}>
                        <Navbar.Brand href="/">Transit Guesser</Navbar.Brand>
                        <Navbar.Toggle aria-controls="basic-navbar-nav" />
                        <Navbar.Collapse id="basic-navbar-nav">
                            <Nav className="me-auto">
                                <Nav.Link href="/">Home</Nav.Link>
                            </Nav>
                        </Navbar.Collapse>
                    </Container>
                </Navbar>
            </div>
            <div className="home-map-container">
                <Map />
            </div>
            <AnswerBox />
        </div>
    );
}

export default MainGame;