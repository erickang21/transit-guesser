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
import Form from "react-bootstrap/Form";
import CustomNavbar from "../components/Navbar";
import { ToastContainer, toast } from "react-toastify";

const EMAIL_REGEX = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;

const LoginPage = (): React.ReactElement => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = useCallback(async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        let params = {
            password,
            ...(EMAIL_REGEX.test(email) ? { email, username: '' } : { username: email, email: ''})
        };
        const credentials = await handleLogin(params);
        console.log("Credentials", credentials)
        setLoading(false);
        if (credentials.token !== null) {
            login(credentials);
            navigate("/game");
        } else {
            toast.error(credentials.error, {position: 'top-center'});
        }
    }, [email, login, password, navigate]);

    return (
        <div className="home-page">
            <CustomNavbar />
            <div className="home-main-section">
                <h1 className="home-page-slogan">Next stop: infinite fun.</h1>
                {/*
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
                */}
                <Form className="login-form" onSubmit={handleSubmit}>
                    <Form.Group className="mb-3 d-flex flex-column" controlId="formBasicEmail">
                        <Form.Label className="align-self-start">Email address/Username</Form.Label>
                        <Form.Control
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter email or username"
                            value={email}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3 d-flex flex-column" controlId="formBasicPassword">
                        <Form.Label className="align-self-start">Password</Form.Label>
                        <Form.Control
                            onChange={(e) => setPassword(e.target.value)}
                            type="password"
                            placeholder="Password"
                            value={password}
                        />
                    </Form.Group>
                    <CustomButton loading={loading} style={{ width: "50%", alignSelf: "center"}} type="submit">
                        Login
                    </CustomButton>
                    <a href="/register" className="register-text mt-3">Not part of the fun yet? Sign up!</a>
                </Form>
            </div>
            <ToastContainer/>
        </div>
    )
}

export default LoginPage;