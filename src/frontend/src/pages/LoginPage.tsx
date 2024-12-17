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
import CustomButton from "../components/CustomButton";

const EMAIL_REGEX = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;

const LoginPage = (): React.ReactElement => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = useCallback(async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        let params = {
            password,
            ...(EMAIL_REGEX.test(email) ? { email, username: '' } : { username: email, email: ''})
        };
        const credentials = await handleLogin(params);
        console.log("Credentials", credentials)
        if (credentials.token !== null) {
            login(credentials);
            navigate("/game");
        } else {
            setError(credentials.error);
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
                            <label className="login-form-label">Username or Email:</label>
                            <input
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
                        <button style={{width: "10vw"}} onClick={() => navigate("/register")}>Register</button>
                    </form>

                </div>

            </div>
        </div>
    )
}

export default LoginPage;