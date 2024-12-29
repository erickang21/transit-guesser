import React, {useMemo} from 'react';
import {Link, useNavigate} from "react-router-dom";
import "../css/components/Navbar.css";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import Container from "react-bootstrap/Container";
import {useAuth} from "../contexts/AuthContext";
import CustomButton from "./CustomButton";
import DropdownButton from "react-bootstrap/DropdownButton";
import { Dropdown } from 'react-bootstrap';
import ProgressBar from 'react-bootstrap/ProgressBar';
import {pointsForLevel} from "../contexts/AuthContext";
import {handleLogout} from "../helpers/api";

const CustomNavbar = () => {
    const { email, username, level, points, logout, isAuthenticated } = useAuth();
    console.log(username, level, points, isAuthenticated)
    const navigate = useNavigate();
    const levelUpProgress = useMemo(() => (points! / pointsForLevel(level!)) * 100, [points, level])
    if (email === null || username === null || level === null || points === null) {
        return (
            <div style={{width: "100vw"}}>
                <Navbar expand="lg" className="bg-body-tertiary home-navbar-element">
                    <Container fluid className="d-flex align-items-center justify-content-between" style={{marginLeft: "0", marginRight: "0", height: "100%"}}>
                        <Navbar.Brand href="/" style={{height: "100%"}}>
                            <div className="navbar-image"/>
                        </Navbar.Brand>
                        <Navbar.Toggle aria-controls="basic-navbar-nav"/>
                        <div className="ms-auto">
                            <CustomButton colorScheme={"primary"} onClick={() => navigate("/login")}>
                                <span>Login</span>
                            </CustomButton>
                        </div>
                    </Container>

                </Navbar></div>
        );
    } else {
        return (
            <div style={{width: "100vw"}}>
                <Navbar expand="lg" className="bg-body-tertiary home-navbar-element">
                    <Container fluid className="d-flex align-items-center justify-content-between" style={{marginLeft: "0", marginRight: "0", height: "100%"}}>
                        <Navbar.Brand href="/" style={{height: "100%"}}>
                            <div className="navbar-image"/>
                        </Navbar.Brand>
                        <Navbar.Toggle aria-controls="basic-navbar-nav"/>
                        <div className="ms-auto">
                            <div className="profile-section">
                                {/*<img
                                    src="https://images-ext-1.discordapp.net/external/NaJAhOcsQ33ZRMWHegBuUzRb4EI9GyUcSDFR7Rb9i0Y/%3Fsize%3D4096/https/cdn.discordapp.com/avatars/304737539846045696/29bdf89ef0acf3a07f7cd56340447bc5.png?format=webp&quality=lossless&width=640&height=640"  // Replace with your profile image URL
                                    alt="Profile"
                                    className="profile-img ms-3"
                                />*/}
                                <DropdownButton drop="down-centered" id="dropdown-basic-button" title={username}>
                                    <Dropdown.Item className="dropdown-info">
                                        <div style={{
                                            display: "flex",
                                            flexDirection: "row",
                                            justifyContent: "space-between"
                                        }}>
                                            <div style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
                                                <span>Level</span><b style={{ fontSize: "37px"}}>{level}</b>
                                            </div>
                                            <div style={{display: "flex", flexDirection: "column"}}>
                                                <span>Points</span><b>{points}/{pointsForLevel(level)}</b>
                                                <ProgressBar animated now={levelUpProgress} />
                                            </div>
                                        </div>
                                    </Dropdown.Item>
                                    <Dropdown.Item className="dropdown-info">
                                        <CustomButton colorScheme="danger" onClick={() => {
                                            logout();
                                            handleLogout({ email });
                                            navigate("/");
                                        }}>
                                            <span>Logout</span>
                                        </CustomButton>
                                    </Dropdown.Item>
                                </DropdownButton>
                            </div>
                        </div>
                    </Container>

                </Navbar></div>
        );
    }
};

export default CustomNavbar;