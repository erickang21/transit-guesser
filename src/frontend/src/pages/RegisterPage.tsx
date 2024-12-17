import React, {FormEvent, useCallback, useState} from 'react';
import Navbar from "react-bootstrap/Navbar";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import "../css/HomePage.css";
import "../css/LoginPage.css";
import "../css/RegisterPage.css";
import { GameMode } from "../types/types";
import { useNavigate } from "react-router-dom";
import {handleRegister} from "../helpers/api";
import {useAuth} from "../contexts/AuthContext";

const USERNAME_REGEX = /^[a-zA-Z0-9_]+$/;

const RegisterPage = (): React.ReactElement => {
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = useCallback(async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        if (password !== confirmPassword) {
            setError("Passwords need to match");
        } else if (!USERNAME_REGEX.test(username)) {
            setError("Username can only contain alphanumeric characters (A-Z, a-z, 0-9) and underscores.")
        } else {
            const credentials = await handleRegister({ email, password, username });
            if (credentials.token !== null) {
                login(credentials);
                navigate("/game");
            } else {
                setError(credentials.error)
            }
        }
    }, [password, confirmPassword, email, navigate, login, setError, username]);

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
                <h1 className="home-page-slogan">You're on the right route.</h1>
                <h6 className="home-page-slogan-under">Sign up to collect points, level up your profile, and attain fame on the global leaderboard.</h6>
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
                            <label className="login-form-label">Username:</label>
                            <input
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
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
                        <div className="login-form-entry">
                            <label className="login-form-label">Confirm Password:</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>
                        <button type="submit">Sign Up</button>
                        {error !== null && <span className="register-error">{error}</span>}
                    </form>
                </div>

            </div>
        </div>
    )
}

export default RegisterPage;