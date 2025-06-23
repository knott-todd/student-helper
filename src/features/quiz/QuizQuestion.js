import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const QuizQuestion = ()=> {
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
        isLastQuestion: false
    }
  return (
    <div className="quiz-question">
        {/* Progress bar */}
        <QuizProgressBar />

        {/* Report icon */}
        <FontAwesomeIcon icon="fa-regular fa-flag" />

        {/* Question text */}
        <p>question.text</p>

        {/* Pin icon */}
        {questionData.isPinned 
        ? <FontAwesomeIcon icon="fa-solid fa-thumbtack" /> 
        : <FontAwesomeIcon icon="fa-regular fa-thumbtack" />
        }
        
        {/* Multiple choice buttons */}
        <div className="quiz-options">
            {questionData.options.map((option, index) => (
                <button key={index} className="quiz-option">
                    {option.text}
                </button>
            ))}

        </div>

        {/* Back */}
        <button className="quiz-back-button">
            Back
        </button>

        {/* Skip */}
        <button className="quiz-skip-button">
            Skip
        </button>

        {/* Next or Finish button */}
        <button className="quiz-next-button">
            {questionData.isLastQuestion ? "Finish" : "Next"}
        </button>
    </div>
  );
}

export default QuizQuestion;