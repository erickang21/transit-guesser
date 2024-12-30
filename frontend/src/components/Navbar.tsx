import React, {useLayoutEffect, useMemo, useState} from 'react';
import {useLocation, useNavigate} from "react-router-dom";
import "../css/components/Navbar.css";
import Navbar from "react-bootstrap/Navbar";
import Container from "react-bootstrap/Container";
import {useAuth} from "../contexts/AuthContext";
import CustomButton from "./CustomButton";
import DropdownButton from "react-bootstrap/DropdownButton";
import {Dropdown, Image, Stack} from 'react-bootstrap';
import ProgressBar from 'react-bootstrap/ProgressBar';
import {pointsForLevel} from "../contexts/AuthContext";
import {handleLogout} from "../helpers/api";
import { AiOutlineQuestionCircle } from "react-icons/ai";
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '90vw',
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};

type CustomNavbarProps = {
    showTutorial?: boolean;
    showTutorialIcon?: boolean;
};

const CustomNavbar = ({ showTutorial = false, showTutorialIcon = false }: CustomNavbarProps) => {
    const { email, username, level, points, logout } = useAuth();
    const navigate = useNavigate();
    const routerLocation = useLocation();
    const levelUpProgress = useMemo(() => (points! / pointsForLevel(level!)) * 100, [points, level])
    const [open, setOpen] = useState(false);

    useLayoutEffect(() => {
        if (showTutorial) {
            setOpen(true);
            navigate(routerLocation.pathname, { replace: true, state: {} })
        }
    }, [navigate, routerLocation.pathname, showTutorial]);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
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
                                <div style={{display: "flex", gap: "8px"}}>
                                    <div style={{display: "flex", alignItems: "center", gap: "4px"}}>
                                        <span>Level</span><b>{level}</b>
                                    </div>
                                    <b>{points}/{pointsForLevel(level)}</b>
                                    <ProgressBar animated now={levelUpProgress} style={{ minWidth: "100px", alignSelf: "center"}}/>
                                </div>


                                {showTutorialIcon && (
                                    <CustomButton showBorder={false} onClick={() => handleOpen()}>
                                        <AiOutlineQuestionCircle color="black" size="30px"/>
                                    </CustomButton>
                                )}
                                <DropdownButton drop="down-centered" id="dropdown-basic-button" title={username}>
                                    <Dropdown.Item className="dropdown-info">
                                        <div style={{
                                            display: "flex",
                                            flexDirection: "row",
                                            justifyContent: "space-between"
                                        }}>
                                            <div style={{
                                                display: "flex",
                                                flexDirection: "column",
                                                alignItems: "center"
                                            }}>
                                                <span>Level</span><b style={{fontSize: "37px"}}>{level}</b>
                                            </div>
                                            <div style={{display: "flex", flexDirection: "column"}}>
                                                <span>Points</span><b>{points}/{pointsForLevel(level)}</b>
                                                <ProgressBar animated now={levelUpProgress}/>
                                            </div>
                                        </div>
                                    </Dropdown.Item>
                                    <Dropdown.Item className="dropdown-info">
                                        <CustomButton colorScheme="danger" onClick={() => {
                                            logout();
                                            handleLogout({email});
                                            navigate("/");
                                        }}>
                                            <span>Logout</span>
                                        </CustomButton>
                                    </Dropdown.Item>
                                </DropdownButton>
                            </div>
                        </div>
                    </Container>

                </Navbar>
                <Modal
                    open={open}
                    onClose={handleClose}
                    aria-labelledby="modal-modal-title"
                    aria-describedby="modal-modal-description"
                >
                    <Box sx={style}>
                        <Typography id="modal-modal-title" variant="h2" component="h2" style={{ display: "flex",justifyContent: "center", marginBottom: "1rem" }}>
                            How do I play Transit Guesser?
                        </Typography>
                        <Stack direction="horizontal" gap={3}>
                            <div className="tutorial-panel">
                                <span><b>Look at the marker.</b></span>
                                <Image
                                    style={{ border: "1px solid black", borderRadius: "4px", marginTop: "0.5rem", marginBottom: "0.5rem" }}
                                    width={"100%"}
                                    height={"44%"}
                                    src="https://i.postimg.cc/JhgFJMTp/Screenshot-2024-12-29-at-6-42-16-PM.png"
                                />
                                <span>Your guesses will be based on this! Be sure to correctly identify the city and major roads.</span>
                            </div>
                            <div className="tutorial-panel">
                                <span><b>Make your guess.</b></span>
                                <Image
                                    className="tutorial-image"
                                    src="https://i.postimg.cc/6qx1jzxR/Screenshot-2024-12-29-at-6-56-49-PM.png"
                                />
                                <span>Guess the transit agency correctly to unlock the route! Routes shown in step 2 will only be part of the given transit agency. However, be wary, as you'll only have 3 strikes before it's over!</span>
                            </div>
                            <div className="tutorial-panel">
                                <span><b>Gain points and level up!</b></span>
                                <Image
                                    className="tutorial-image"
                                    src="https://i.postimg.cc/8PD0LyHg/Screenshot-2024-12-29-at-7-05-18-PM.png"
                                />
                                <span>Every round gains points, whether you win or lose! Level up to earn shiny new profile badges, profile customization options, and climb the leaderboard! (Coming soon)</span>
                            </div>
                            <div className="tutorial-panel">
                                <span><b>Open the tutorial anytime.</b></span>
                                <Image
                                    className="tutorial-image"
                                    src="https://i.postimg.cc/J0QKTLqV/Screenshot-2024-12-29-at-7-20-52-PM.png"
                                />
                                <span>Click the question mark in the top-right if you ever want to re-open this window!</span>
                            </div>
                        </Stack>
                        <Typography variant="h6" component="p" style={{ color: "gray", display: "flex",justifyContent: "center", marginTop: "1rem" }}>
                            Click anywhere outside the box to close.
                        </Typography>
                    </Box>
                </Modal>
            </div>
        );
    }
};

export default CustomNavbar;