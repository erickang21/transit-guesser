import React, {useCallback, useState} from 'react';
import Map from "./Map";
import "../css/home.css";
import AnswerBox from "./AnswerBox";
import CustomNavbar from "./Navbar";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import { FaLongArrowAltRight } from "react-icons/fa";

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '50vw',
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};

const MainGame = ({ showTutorial }: { showTutorial: boolean }): React.ReactElement => {
    const [open, setOpen] = useState(false);
    const [oldLevel, setOldLevel] = useState(0);
    const [newLevel, setNewLevel] = useState(0);

    const handleLevelUpPopup = useCallback((playerOldLevel: number, playerNewLevel: number) => {
        setOldLevel(playerOldLevel);
        setNewLevel(playerNewLevel);
        setOpen(true);
    }, [])
    const handleClose = () => setOpen(false);
    return (
        <div className="home-page">
            <CustomNavbar showTutorial={showTutorial} showTutorialIcon={true}/>
            <div className="home-map-container">
                <Map />
            </div>
            <AnswerBox onLevelUp={handleLevelUpPopup}/>
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={style}>
                    <Typography id="modal-modal-title" variant="h2" component="h2" style={{
                        color: "green",
                        display: "flex",
                        justifyContent: "center",
                        marginBottom: "1rem"
                    }}>
                        You've leveled up!
                    </Typography>
                    <div style={{display: "flex", justifyContent: "center", gap: "8px"}}>
                        <Typography id="modal-modal-title" variant="h2" component="h2"
                                    style={{display: "flex", justifyContent: "center"}}>
                            {oldLevel}
                        </Typography>
                        <FaLongArrowAltRight size="50px" style={{ alignSelf: "center" }}/>
                        <Typography id="modal-modal-title" variant="h2" component="h2"
                                    style={{display: "flex", justifyContent: "center"}}>
                            {newLevel}
                        </Typography>
                    </div>
                    <Typography id="modal-modal-title" variant="h5" component="h5" style={{
                        marginTop: "2rem",
                        display: "flex",
                        justifyContent: "center",
                    }}>
                        New perks:
                    </Typography>
                    <div style={{display: "flex", justifyContent: "center", gap: "8px"}}>
                        <span>- Coming soon!</span>
                    </div>
                    <Typography variant="h6" component="p" style={{ color: "gray", display: "flex",justifyContent: "center", marginTop: "1rem" }}>
                        Click anywhere outside the box to close.
                    </Typography>
                </Box>
            </Modal>
        </div>
    );
}

export default MainGame;