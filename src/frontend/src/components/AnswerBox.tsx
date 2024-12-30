import React, {useCallback, useContext, useEffect, useMemo, useState} from 'react';
import "../css/components/AnswerBox.css";
import { IoIosCheckmark } from "react-icons/io";
import { ImCross } from "react-icons/im";
import {getOperators, getRandomStop} from "../helpers/api";
import { RxCross1 } from "react-icons/rx";
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import {RandomStopResponse} from "../types/types";
import {MainGameContext} from "../contexts/MainGameContext";
import {useAuth} from "../contexts/AuthContext";

type AnswerBoxProps = {
    onLevelUp: (oldLevel: number, newLevel: number) => void;
}
const AnswerBox = ({ onLevelUp }: AnswerBoxProps): React.ReactElement => {
    // Game mechanics
    const [guessStep, setGuessStep] = useState(0);
    const [guessed, setGuessed] = useState(true);
    const [wrongAnswer, setWrongAnswer] = useState(false);
    const [strikes, setStrikes] = useState(0);
    // Form choices
    const [selectedOperatorValue, setSelectedOperatorValue] = useState('');
    const [selectedRouteValue, setSelectedRouteValue] = useState('');

    const { correctAnswers, operatorData, getNewData } = useContext(MainGameContext);
    const { addPoints, level } = useAuth();

    const roundOver = useMemo(() => strikes === 3 || guessStep === 2, [strikes, guessStep]);

    const handleOperatorChange = (event: any) => {
        setSelectedOperatorValue(event.target.value)
    }

    const handleRouteChange = (event: any) => {
        setSelectedRouteValue(event.target.value)
    }

    const calculatePoints = useCallback(() => {
        let basePoints = strikes === 3 ? 50 : 400;
        if (strikes === 0) basePoints += 100;
        return basePoints;
    }, [strikes]);

    const verifyGuess = useCallback(async () => {
        const oldLevel = level;
        setWrongAnswer(false);
        setGuessed(true);
        let isOver = false;
        if (guessStep === 0) { // Currently guessing transit operator.
            const correctOperators = Object.keys(correctAnswers);
            console.log("correct operators ", correctOperators)
            console.log("selected", selectedOperatorValue)
            if (correctOperators.includes(selectedOperatorValue)) { // Correct!
                setGuessStep((prev) => prev + 1);
            } else {
                if (strikes === 2) isOver = true;
                setStrikes((prev) => (prev < 3 ? prev + 1 : prev));
                setWrongAnswer(true);
            }
        } else if (guessStep === 1) {
            const correctRoutes = correctAnswers[selectedOperatorValue];
            console.log("Selected operator", selectedOperatorValue, correctAnswers[selectedOperatorValue]);
            console.log("Selected route", selectedRouteValue);
            if (correctRoutes.includes(selectedRouteValue)) {
                setGuessStep((prev) => prev + 1);
                isOver = true;
            } else {
                if (strikes === 2) isOver = true;
                setStrikes((prev) => (prev < 3 ? prev + 1 : prev));
                setWrongAnswer(true);
            }
        }
        if (isOver) {
            console.log("Calculated points: ", calculatePoints());
            const newLevel = await addPoints(calculatePoints());
            if (newLevel !== undefined && newLevel !== oldLevel) {
                onLevelUp(oldLevel!, newLevel);
            }
        }
    }, [guessStep, correctAnswers, selectedOperatorValue, strikes, selectedRouteValue, calculatePoints, addPoints, level])

    const goToNextRound = useCallback(() => {
        setStrikes(0);
        setGuessStep(0);
        getNewData();
        setGuessed(false);
        setSelectedOperatorValue('');
        setSelectedRouteValue('');
    }, [getNewData])

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
            {(guessStep === 2 || strikes === 3) && (
                <div>
                    <span className="answer-box-points">+{calculatePoints()} points</span>
                    {guessStep === 2 && <div className="answer-box-points-entry"><span>Correct answer</span><span>+400 points</span></div>}
                    {(guessStep === 2 && strikes === 0) && <div className="answer-box-points-entry"><span>Flawless</span><span>+100 points</span></div>}
                    {strikes === 3 && <div className="answer-box-points-entry"><span>A good effort!</span><span>+50 points</span></div>}
                </div>
            )}
            {strikes === 3 || guessStep === 2 ? (
                <button className="answer-box-submit-button" style={{color: "yellow"}} onClick={goToNextRound}>
                    <span className="answer-box-submit-button-text">Next one!</span>
                </button>
            ) : (
                <button className="answer-box-submit-button" onClick={verifyGuess}>
                    <span className="answer-box-submit-button-text">Lock it in!</span>
                </button>
            )}

        </div>
    )
}

export default AnswerBox;