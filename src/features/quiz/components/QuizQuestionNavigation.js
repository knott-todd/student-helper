import { useQuizContext } from "../QuizContext";

const QuizQuestionNavigation = ({ isLastQuestion, isReview}) => {
    
    const { nextQuestion, prevQuestion, 
        skipQuestion, finishQuiz, 
        finishQuizReview, nextReviewQuestion, 
        prevReviewQuestion, currentIndex, 
        incorrectIndexes, currQuestion } = useQuizContext();
    
    return (
	<span style={{ display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'flex-end', marginTop: '4rem' }}>

        {/* Back */}
        { currentIndex === 0 || (isReview && currentIndex === incorrectIndexes?.[0]) ? null : (
            <button className="quiz-back-button secondary-btn" onClick={() => isReview ? prevReviewQuestion() : prevQuestion()}>
                Back
            </button>
        )}

        {/* Skip */}
        {isReview || isLastQuestion ? null 
        : <button className="quiz-skip-button tertiary-btn" onClick={() => skipQuestion()}>
            Skip
        </button>
        }

        {/* Next or Finish button */}
        { isLastQuestion || (isReview && currentIndex === incorrectIndexes?.[incorrectIndexes?.length - 1]) ? (
            <button disabled={currQuestion.user_answer === null} className="quiz-finish-button primary-btn" onClick={() => isReview ? finishQuizReview() : finishQuiz()}>
                Finish
            </button>   
        ) : (
            <button disabled={currQuestion.user_answer === null} className="quiz-next-button primary-btn" onClick={() => isReview ? nextReviewQuestion() : nextQuestion()}>
                Next
            </button>
        )}

    </span>
)}

export default QuizQuestionNavigation;