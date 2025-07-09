import { useEffect } from "react";
import { useQuizContext } from "../QuizContext";

const QuizQuestionNavigation = ({ isReview}) => {
    
    const { nextQuestion, prevQuestion, 
        skipQuestion, finishQuiz, 
        finishQuizReview, nextReviewQuestion, 
        prevReviewQuestion, currentIndex, 
        incorrectIndexes, currQuestion, questions } = useQuizContext();

    const isLastQuestion = currentIndex === questions.length - 1;
    
    return (
	<span style={{ display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'flex-end', marginTop: '4rem' }}>

        {/* Back */}
        { currentIndex === 0 || (isReview && parseInt(currentIndex) === incorrectIndexes?.[0]) ? null : (
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
        { isLastQuestion || (isReview && parseInt(currentIndex) === incorrectIndexes?.[incorrectIndexes?.length - 1]) ? (
            <button disabled={currQuestion.user_answer === null && !isReview} className="quiz-finish-button primary-btn" onClick={() => isReview ? finishQuizReview() : finishQuiz()}>
                Finish
            </button>   
        ) : (
            <button disabled={currQuestion.user_answer === null && !isReview} className="quiz-next-button primary-btn" onClick={() => isReview ? nextReviewQuestion() : nextQuestion()}>
                Next
            </button>
        )}

    </span>
)}

export default QuizQuestionNavigation;