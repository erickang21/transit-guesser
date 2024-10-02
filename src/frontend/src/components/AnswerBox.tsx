import React, {useCallback, useContext, useEffect, useState} from 'react';
import "../css/components/AnswerBox.css";
import { IoIosCheckmark } from "react-icons/io";
import { ImCross } from "react-icons/im";
import {getOperators, getRandomStop} from "../helpers/api";
import { RxCross1 } from "react-icons/rx";
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import {RandomStopResponse} from "../types/types";
import {MainGameContext} from "../contexts/MainGameContext";

const AnswerBox = (): React.ReactElement => {
    // Game mechanics
    const [guessStep, setGuessStep] = useState(0);
    const [guessed, setGuessed] = useState(true);
    const [wrongAnswer, setWrongAnswer] = useState(false);
    const [strikes, setStrikes] = useState(0);
    // Form choices
    const [selectedOperatorValue, setSelectedOperatorValue] = useState('');
    const [selectedRouteValue, setSelectedRouteValue] = useState('');

    const { correctAnswers, operatorData } = useContext(MainGameContext);

    /*
    useEffect(() => {
        // A failsafe by ensuring correct answers are added to selection list.
        for (const [operator, routes] of Object.entries(correctAnswers)) {
            console.log("operator is", operator)
            // This should never happen, but if routes are empty, don't add either of them.
            console.log("Routes: ", routes);
            console.log("Operator data: ", operatorData[operator]);
            if (routes?.length && operatorData[operator]) {
                for (const route of routes) {
                    if (!operatorData[operator].includes(route)) {
                        setOperatorData((prev) => {
                            const newData = {...prev};
                            newData[operator] = [...prev[operator], route];
                            console.log("Added", operator, route);
                            return newData;
                        })
                    }
                }
            }
        }
    }, [setOperatorData, correctAnswers])

     */

    const handleOperatorChange = (event: any) => {
        setSelectedOperatorValue(event.target.value)
    }

    const handleRouteChange = (event: any) => {
        setSelectedRouteValue(event.target.value)
    }
    const verifyGuess = useCallback(() => {
        setWrongAnswer(false);
        setGuessed(true);
        if (guessStep === 0) { // Currently guessing transit operator.
            const correctOperators = Object.keys(correctAnswers);
            console.log("correct operators ", correctOperators)
            console.log("selected", selectedOperatorValue)
            if (correctOperators.includes(selectedOperatorValue)) { // Correct!
                setGuessStep((prev) => prev + 1);
            } else {
                setStrikes((prev) => (prev < 3 ? prev + 1 : prev));
                setWrongAnswer(true);
            }
        } else if (guessStep === 1) {
            const correctRoutes = correctAnswers[selectedOperatorValue];
            console.log("Selected operator", selectedOperatorValue, correctAnswers[selectedOperatorValue]);
            console.log("Selected route", selectedRouteValue);
            if (correctRoutes.includes(selectedRouteValue)) {
                setGuessStep((prev) => prev + 1);
            } else {
                setStrikes((prev) => (prev < 3 ? prev + 1 : prev));
                setWrongAnswer(true);
            }
        }
    }, [guessStep, correctAnswers, selectedOperatorValue, selectedRouteValue])

    const AnswerBoxSuccessMessage = (): React.ReactElement => (
        <span className="answer-box-result-success">{guessStep === 1 ? "Amazing work! Now guess the route." : guessStep === 2 ? "Flawless!" : ""}</span>
    )

    const AnswerBoxErrorMessage = (): React.ReactElement => strikes < 3 ? (
        <span className="answer-box-result-error">Not quite...</span>
    ) : (
        <span className="answer-box-result-error" style={{color: 'darkred'}}>Round over. Better luck on the next!</span>
    )

    console.log("Rendered correct answers", correctAnswers)
    console.log("Rendered operator data", operatorData)
    if (!Object.keys(correctAnswers).length || !Object.keys(operatorData).length) {
        return (
            <div className="answer-box">
                <span>Loading...</span>
            </div>
        )
    }

    return (
        <div className="answer-box">
            <span className="answer-box-title">Take a guess!</span>
            <div className="answer-box-remaining-guesses">
                <span>Remaining Guesses: </span>
                <div className="answer-box-strikes">
                {[...Array(3)].map((_, index) => (
                    <div>
                        {index >= 3 - strikes ?
                            <RxCross1 className="answer-box-remaining-guesses-icon" /> :
                            <RxCross1 className="answer-box-remaining-guesses-icon" style={{color: "red"}}/>}
                    </div>
                ))}
                </div>
            </div>
            {wrongAnswer && <AnswerBoxErrorMessage />}
            {guessStep >= 1 && guessed && !wrongAnswer && <AnswerBoxSuccessMessage />}
            <div className="answer-box-form">
                <div className="answer-box-text">
                    <span className="answer-box-input-header">Transit Operator:</span>
                    {strikes === 3 && <ImCross style={{color: "red"}}/>}
                    {guessStep >= 1 && strikes !== 3 && <IoIosCheckmark style={{color: "green"}}/>}
                </div>
                <select
                    className="answer-box-operator-select"
                    id="options"
                    value={selectedOperatorValue}
                    onChange={handleOperatorChange}
                    disabled={guessStep !== 0 || strikes === 3}
                    style={guessStep === 1 && strikes !== 3 ? {border: "1px solid green"} : {}}
                >
                    <option value="">Choose an option...</option>
                    {Object.keys(operatorData).map((operator) => (
                        <option value={operator}>{operator}</option>
                    ))}
                </select>
            </div>
            {guessStep >= 1 && (
                <div className="answer-box-form">
                    <div className="answer-box-text">
                        <span className="answer-box-input-header">Route Number:</span>
                        {strikes === 3 && <ImCross style={{color: "red"}}/>}
                        {guessStep > 1 && strikes !== 3 && <IoIosCheckmark style={{color: "green"}}/>}
                    </div>
                    <select
                        className="answer-box-operator-select"
                        id="options"
                        value={selectedRouteValue}
                        onChange={handleRouteChange}
                        disabled={guessStep !== 1 || strikes === 3}
                        style={guessStep > 1 && strikes !== 3 ? {border: "1px solid green"} : {}}
                    >
                        <option value="">Choose an option...</option>
                        {operatorData[selectedOperatorValue].map((route) => (
                            <option value={route}>{route}</option>
                        ))}
                    </select>
                </div>
            )}
            <button className="answer-box-submit-button" onClick={verifyGuess}>
                <span className="answer-box-submit-button-text">Lock it in!</span>
            </button>

        </div>
    )
}

export default AnswerBox;