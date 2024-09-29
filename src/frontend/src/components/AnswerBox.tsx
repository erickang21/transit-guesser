import React, {useEffect, useState} from 'react';
import "../css/components/AnswerBox.css";
import { IoIosCheckmark } from "react-icons/io";
import {getOperators, getRandomStop} from "../helpers/api";
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import {RandomStopResponse} from "../types/types";

const AnswerBox = ({ correctAnswers }: { correctAnswers: Record<string, string[]> }): React.ReactElement => {
    const [guessStep, setGuessStep] = useState(0);
    const [guessed, setGuessed] = useState(true);
    const [operatorList, setOperatorList] = useState<string[]>([]);
    const [operatorData, setOperatorData] = useState<Record<string, string[]>>({});
    const [selectedOperatorValue, setSelectedOperatorValue] = useState('');
    const [selectedRouteValue, setSelectedRouteValue] = useState('');

    useEffect(() => {
        const fetchOperators = async () => {
            try {
                const operators: Record<string, string[]> = await getOperators();
                // Randomly select a stop
                setOperatorList(Object.keys(operators));
                setOperatorData(operators);
            } catch (error) {
                console.error('Error fetching stops:', error);
            }
        };
        fetchOperators();
    }, []);

    const handleOperatorChange = (event: any) => {
        setSelectedOperatorValue(event.target.value)
    }

    const handleRouteChange = (event: any) => {
        setSelectedRouteValue(event.target.value)
    }
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
                <select
                    id="options"
                    value={selectedOperatorValue}
                    onChange={handleOperatorChange}
                    disabled={guessStep !== 0}
                    style={guessStep === 1 ? {border: "1px solid green"} : {}}
                >
                    <option value="">Choose an option...</option>
                    {operatorList.map((operator) => (
                        <option value={operator}>{operator}</option>
                    ))}
                </select>
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