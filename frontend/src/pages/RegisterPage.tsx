import React, {FormEvent, useCallback, useState} from 'react';
import "../css/HomePage.css";
import "../css/LoginPage.css";
import "../css/RegisterPage.css";
import { useNavigate } from "react-router-dom";
import {handleRegister} from "../helpers/api";
import {useAuth} from "../contexts/AuthContext";
import CustomNavbar from "../components/Navbar";
import Form from "react-bootstrap/Form";
import CustomButton from "../components/CustomButton";
import { ToastContainer, toast } from "react-toastify";

const USERNAME_REGEX = /^[a-zA-Z0-9_]+$/;

const RegisterPage = (): React.ReactElement => {
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = useCallback(async (e: FormEvent) => {
        e.preventDefault();
        setLoading(false);
        if (!email.length) {
            toast.error("No email provided.", { position: 'top-center'})
        } else if (!username.length) {
            toast.error("No username provided.", { position: 'top-center'})
        } else if (password.length < 8) {
            toast.error("Password must be at least 8 characters long.", { position: 'top-center'})
        } else if (password !== confirmPassword) {
            toast.error("Passwords need to match.", { position: 'top-center'})
        } else if (!USERNAME_REGEX.test(username)) {
            toast.error("Username can only contain alphanumeric characters (A-Z, a-z, 0-9) and underscores.",
                { position: 'top-center'})
        } else {
            const credentials = await handleRegister({ email, password, username });
            if (credentials.token !== null) {
                login(credentials);
                navigate("/game", { state: { showTutorial: true} });
            } else {
                toast.error(credentials.error,{ position: 'top-center'})
            }
        }
    }, [password, confirmPassword, email, navigate, login, username]);

    return (
        <div className="home-page">
            <CustomNavbar />
            <div className="home-main-section">
                <h1 className="home-page-slogan">You're on the right route.</h1>
                <h6 className="home-page-slogan-under">Sign up to collect points, level up your profile, and attain fame on the global leaderboard.</h6>
                <Form className="login-form" onSubmit={handleSubmit} style={{ width: "70vw"}}>
                    <Form.Group className="mb-3 d-flex flex-column" controlId="formBasicEmail">
                        <Form.Label className="align-self-start">Email address</Form.Label>
                        <Form.Control
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter email"
                            type="email"
                            value={email}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3 d-flex flex-column">
                        <Form.Label className="align-self-start" style={{ marginBottom: "0.1rem" }}>Username</Form.Label>
                        <Form.Text className="form-label-subtext">
                            Usernames can only contain alphanumeric characters and underscores.
                        </Form.Text>
                        <Form.Control
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter username"
                            value={username}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3 d-flex flex-column" controlId="formBasicPassword">
                        <Form.Label className="align-self-start" style={{ marginBottom: "0.1rem" }}>Password</Form.Label>
                        <Form.Text className="form-label-subtext">
                            Password must be at least 8 characters.
                        </Form.Text>
                        <Form.Control
                            onChange={(e) => setPassword(e.target.value)}
                            type="password"
                            placeholder="Enter password"
                            value={password}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3 d-flex flex-column" controlId="formBasicPassword">
                        <Form.Label className="align-self-start">Confirm Password</Form.Label>
                        <Form.Control
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            type="password"
                            placeholder="Enter password again"
                            value={confirmPassword}
                        />
                    </Form.Group>
                    <CustomButton loading={loading} style={{ width: "50%", alignSelf: "center"}} type="submit">
                        Sign Up
                    </CustomButton>
                    <a href="/login" className="register-text mt-3">Already on board? Log in!</a>
                </Form>

            </div>
            <ToastContainer />
        </div>
    )
}

export default RegisterPage;