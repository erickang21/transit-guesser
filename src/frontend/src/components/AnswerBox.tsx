import React, { useState } from 'react';
import "../css/components/AnswerBox.css";
import { IoIosCheckmark } from "react-icons/io";

const AnswerBox = (): React.ReactElement => {
    const [guessStep, setGuessStep] = useState(0);
    const [guessed, setGuessed] = useState(true);
    const verifyGuess = () => {
        setGuessed(true);
        if (true) { // placeholder for if line is correct
            if (guessStep < 2) {
                setGuessStep((prev) => prev + 1);
            }
        }
    }

    const AnswerBoxSuccessMessage = (): React.ReactElement => (
        <span className="answer-box-result-success">{guessStep === 1 ? "Amazing work! Can you guess the direction?" : guessStep === 2 ? "Flawless!" : ""}</span>
    )

    return (
        <div className="answer-box">
        <span className="answer-box-title">Take a guess!</span>
            {guessStep >= 1 && guessed && <AnswerBoxSuccessMessage />}
            <div className="answer-box-form">
                <div className="answer-box-text">
                    <span className="answer-box-input-header">Route:</span>
                    {guessStep >= 1 && <IoIosCheckmark style={{color: "green"}}/>}
                </div>
                <input disabled={guessStep !== 0} style={guessStep === 1 ? { border: "1px solid green"} : {}}/>
            </div>
            {guessStep >= 1 && (
                <div className="answer-box-form">
                    <div className="answer-box-text">
                        <span className="answer-box-input-header">Direction:</span>
                        {guessStep === 2 && <IoIosCheckmark style={{color: "green"}}/>}
                    </div>
                    <input/>
                </div>
            )}
            <button className="answer-box-submit-button" onClick={verifyGuess}>
                Lock it in!
            </button>

        </div>
    )
}

export default AnswerBox;