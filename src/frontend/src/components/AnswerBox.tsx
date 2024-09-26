import React from 'react';
import "../css/components/AnswerBox.css";

const AnswerBox = (): React.ReactElement => {
    return (
        <div className="answer-box">
            <span>Take a guess!</span>
            <input />
        </div>
    )
}

export default AnswerBox;