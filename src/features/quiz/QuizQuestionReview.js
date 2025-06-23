const QuizQuestionReview = ({ question, userAnswer, correctAnswer }) => {
    
    // Get question data (text, answer)
    const questionData = {
        text: "What is Newton's second law of motion?",
        options: [
            "F = ma",
            "F = m/a",
            "a^2 + b^2 = c^2",
            "F = G(m1*m2)/r^2"
        ],
        isPinned: false,
        isLastReviewQuestion: true,
        motivationalBlurb: "Don’t worry, this one trips a lot of students up.",
        topic: {
            name: "Physics"
        },
    }
    return (
        <div>
            {/* Progress bar */}
            <QuizProgressBar />

            <p>Topic: {question.topic.name}</p>
    
            {/* Report icon */}
            <FontAwesomeIcon icon="fa-regular fa-flag" />
    
            {/* Question text */}
            <p>question.text</p>
    
            {/* Pin icon */}
            {questionData.isPinned 
            ? <FontAwesomeIcon icon="fa-solid fa-thumbtack" /> 
            : <FontAwesomeIcon icon="fa-regular fa-thumbtack" />
            }

            {/* Motivational blurb */}
            <p>{questionData.motivationalBlurb}</p>
            
            {/* Multiple choice buttons */}
            <div className="quiz-options">
                {questionData.options.map((option, index) => (
                    <div key={index} className={"quiz-option" + " " + (option.text === userAnswer ? "selected" : "") + (option.text === correctAnswer ? "correct" : "")}>
                        {option.text}
                    </div>
                ))}
    
            </div>
    
            {/* Back */}
            <button className="quiz-back-button">
                Back
            </button>
    
            {/* Next or Finish button */}
            <button className="quiz-next-button">
                {questionData.isLastReviewQuestion ? "Finish Review" : "Next"}
            </button>

        </div>
    )
}

export default QuizQuestionReview;