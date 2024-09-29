import React, {useEffect, useState} from 'react';
import "../css/components/AnswerBox.css";
import { IoIosCheckmark } from "react-icons/io";
import {getOperators, getRandomStop} from "../helpers/api";
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import {RandomStopResponse} from "../types/types";

const AnswerBox = (): React.ReactElement => {

    const [guessStep, setGuessStep] = useState(0);
    const [guessed, setGuessed] = useState(true);
    const [operatorList, setOperatorList] = useState<string[]>([]);
    const [operatorData, setOperatorData] = useState<Record<string, string[]>>({});

    useEffect(() => {
        const fetchOperators = async () => {
            try {
                const operators: Record<string, string[]> = await getOperators();
                // Randomly select a stop
                setOperatorList((prev) => [...prev, ...Object.keys(operators)]);
                setOperatorData(operators);
            } catch (error) {
                console.error('Error fetching stops:', error);
            }
        };
        fetchOperators();
    }, []);
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
                    <span className="answer-box-input-header">Transit Operator:</span>
                    {guessStep >= 1 && <IoIosCheckmark style={{color: "green"}}/>}
                </div>
                <DropdownButton id="dropdown-basic-button" title="Dropdown button" disabled={guessStep !== 0}>
                    <Dropdown.Item href="#/action-1">Action</Dropdown.Item>
                    <Dropdown.Item href="#/action-2">Another action</Dropdown.Item>
                    <Dropdown.Item href="#/action-3">Something else</Dropdown.Item>
                </DropdownButton>
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