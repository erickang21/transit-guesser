import React from 'react';
import CustomNavbar from '../components/Navbar';
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import "../css/HomePage.css";
import { GameMode } from "../types/types";
import { useNavigate } from "react-router-dom";
import {useAuth} from "../contexts/AuthContext";

const HomePage = (): React.ReactElement => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const gameModes: GameMode[] = [
        {
            name: "Classic",
            imageUrl: "",
            description: "Our most popular mode. Guess the transit agency and route number from a map marker."
        }
    ]
    return (
        <div className="home-page">
            <CustomNavbar />
            <div className="home-main-section">
                <h1 className="home-page-slogan">A classic trivia game, reimagined.</h1>
                <div className="game-body">
                    <div className="game-mode-select-container">
                        <div className="game-mode-selector">
                            {gameModes.map((gameMode) => (
                                <div className="game-mode-display">
                                    <h3>{gameMode.name}</h3>
                                    <img style={{alignSelf: "center", margin: "1rem 0"}}
                                         src="https://i.postimg.cc/BQND66YQ/IMG-3210.jpg" width="75%" height="65%"/>
                                    <span>{gameMode.description}</span>
                                    <button className="game-mode-play" onClick={() => navigate(isAuthenticated ? "/game" : "/login")}>
                                        <span className="game-mode-play-button-text">Let's play!</span>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}

export default HomePage;