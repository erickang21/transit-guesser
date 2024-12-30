import React, {useCallback, useContext, useState} from 'react';
import "../css/components/AnswerBox.css";
import { IoIosCheckmark } from "react-icons/io";
import { ImCross } from "react-icons/im";
import { RxCross1 } from "react-icons/rx";
import Dropdown from 'react-bootstrap/Dropdown';
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

    const handleOperatorChange = (operator: string) => {
        setSelectedOperatorValue(operator)
    }

    const handleRouteChange = (route: string) => {
        setSelectedRouteValue(route)
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
            if (correctOperators.includes(selectedOperatorValue)) { // Correct!
                setGuessStep((prev) => prev + 1);
            } else {
                if (strikes === 2) isOver = true;
                setStrikes((prev) => (prev < 3 ? prev + 1 : prev));
                setWrongAnswer(true);
            }
        } else if (guessStep === 1) {
            const correctRoutes = correctAnswers[selectedOperatorValue];
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
            const newLevel = await addPoints(calculatePoints());
            if (newLevel !== undefined && newLevel !== oldLevel) {
                onLevelUp(oldLevel!, newLevel);
            }
        }
    }, [level, guessStep, correctAnswers, selectedOperatorValue, strikes, selectedRouteValue, addPoints, calculatePoints, onLevelUp])

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
                <Dropdown>
                    <Dropdown.Toggle
                        disabled={guessStep !== 0 || strikes === 3}
                        id="dropdown-basic"
                        style={{
                            border: guessStep > 0 && strikes !== 3 ? "1px solid green" : "1px solid black",
                            width: "100%",
                            background: "none",
                            color: "black",
                            overflow: "hidden",
                            textOverflow: "ellipsis"
                    }}>
                        <span style={{ maxWidth: "100%"}}>{selectedOperatorValue.length ? selectedOperatorValue : "Select an operator..."}</span>
                    </Dropdown.Toggle>

                    <Dropdown.Menu style={{ maxHeight: '200px', overflowY: 'auto', scrollbarWidth: 'thin' }}>
                        {Object.keys(operatorData).map((operator, index) => (
                            <Dropdown.Item
                                key={`route-operator-${index}`}
                                onClick={() => handleOperatorChange(operator)}
                                active={selectedOperatorValue === operator}
                            >{operator}</Dropdown.Item>
                        ))}
                    </Dropdown.Menu>
                </Dropdown>
            </div>
            {guessStep >= 1 && (
                <div className="answer-box-form">
                    <div className="answer-box-text">
                        <span className="answer-box-input-header">Route:</span>
                        {strikes === 3 && <ImCross style={{color: "red"}}/>}
                        {guessStep > 1 && strikes !== 3 && <IoIosCheckmark style={{color: "green"}}/>}
                    </div>
                    <Dropdown>
                        <Dropdown.Toggle disabled={guessStep !== 1 || strikes === 3} id="dropdown-basic" style={{ border: guessStep > 1 && strikes !== 3 ? "1px solid green" : "1px solid black",width: "100%", background: "none", color: "black", overflow: "hidden", textOverflow: "ellipsis"}}>
                            <span style={{ maxWidth: "100%"}}>{selectedRouteValue.length ? selectedRouteValue : "Select a route..."}</span>
                        </Dropdown.Toggle>

                        <Dropdown.Menu style={{ maxHeight: '200px', overflowY: 'auto', scrollbarWidth: 'thin' }}>
                            {operatorData[selectedOperatorValue].map((route, index) => (
                                <Dropdown.Item key={`route-dropdown-${index}`} onClick={() => handleRouteChange(route)} active={selectedRouteValue === route}>{route}</Dropdown.Item>
                            ))}
                        </Dropdown.Menu>
                    </Dropdown>
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
                <button className="answer-box-submit-button" style={{color: "white"}} onClick={goToNextRound}>
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