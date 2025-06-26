import { useQuizContext } from "./QuizContext";

export const QuizQuestionNavigation = ({ isLastQuestion, isReview}) => {
    
    const { nextQuestion, prevQuestion, 
        skipQuestion, finishQuiz, 
        finishQuizReview, nextReviewQuestion, 
        prevReviewQuestion, currentIndex } = useQuizContext();
    
    return (
	<span style={{ display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'flex-end', marginTop: '4rem' }}>

        {/* Back */}
        { currentIndex === 0 ? null : (
            <button className="quiz-back-button secondary-btn" onClick={() => isReview ? prevReviewQuestion() : prevQuestion()}>
                Back
            </button>
        )}

        {/* Skip */}
        {isReview ? null 
        : <button className="quiz-skip-button tertiary-btn" onClick={() => skipQuestion()}>
            Skip
        </button>
        }

        {/* Next or Finish button */}
        { isLastQuestion ? (
            <button className="quiz-finish-button primary-btn" onClick={() => isReview ? finishQuizReview() : finishQuiz()}>
                Finish
            </button>   
        ) : (
            <button className="quiz-next-button primary-btn" onClick={() => isReview ? nextReviewQuestion() : nextQuestion()}>
                Next
            </button>
        )}

    </span>
)}
