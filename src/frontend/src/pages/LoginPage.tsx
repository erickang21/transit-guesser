import React, {FormEvent, useCallback, useState} from 'react';
import Navbar from "react-bootstrap/Navbar";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import "../css/HomePage.css";
import "../css/LoginPage.css";
import {handleLogin} from "../helpers/api";
import { GameMode } from "../types/types";
import { useNavigate } from "react-router-dom";
import {useAuth} from "../contexts/AuthContext";

const LoginPage = (): React.ReactElement => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = useCallback(async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        const credentials = await handleLogin({ email, password});
        if (credentials.token !== null) {
            login(credentials.token);
            navigate("/game");
        } else {
            setError("An error occurred during login.");
        }
    }, [email, login, password, navigate, setError]);

    return (
        <div className="home-page">
            <div className="home-navbar">
                <Navbar expand="lg" className="bg-body-tertiary home-navbar-element">
                    <Container style={{ marginLeft: "0", marginRight: "0" }}>
                        <Navbar.Brand href="/">Transit Guesser</Navbar.Brand>
                        <Navbar.Toggle aria-controls="basic-navbar-nav"/>
                        <Navbar.Collapse id="basic-navbar-nav">
                            <Nav className="me-auto">
                                <Nav.Link href="/">Home</Nav.Link>
                            </Nav>
                        </Navbar.Collapse>
                    </Container>
                </Navbar>
            </div>
            <div className="home-main-section">
                <h1 className="home-page-slogan">Next stop: infinite fun.</h1>
                <div className="login-form">
                    <form onSubmit={handleSubmit} className="login-form-object">
                        <div className="login-form-entry">
                            <label className="login-form-label">Email:</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="login-form-entry">
                            <label className="login-form-label">Password:</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <button type="submit">Login</button>
                        {error !== null && <span className="login-error">{error}</span>}
                    </form>
                </div>

            </div>
        </div>
    )
}

export default LoginPage;