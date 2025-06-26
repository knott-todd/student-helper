import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import QuizProgressBar from "./QuizProgressBar";
import { use } from "react";
import { useCurrentQuestion, useQuestionByIndex, useQuizContext } from "./QuizContext";
import { useParams } from "react-router-dom";
import QuestionText from "./components/QuestionText";
import ReportIcon from "./components/ReportIcon";
import QuestionOptions from "./components/QuestionOptions";
import { QuizQuestionNavigation } from "./QuizQuestionNavigation";

const QuizQuestionReview = () => {

    const question = useCurrentQuestion();
    
    return (
        <div>
            {/* Progress bar */}
            <QuizProgressBar />

            <p style={{position: "absolute", top: "4rem", left: "1.5rem"}}>Topic: {question?.topics?.[0].name}</p>
    
            {/* Report icon */}
            <ReportIcon />
    
            {/* Question text */}
            <QuestionText questionText={question.question_text} isPinned={question.is_pinned} />

            {/* Motivational blurb */}
            <p style={{marginTop: "2rem"}}>{question.motivationalBlurb}</p>
            
            {/* Multiple choice buttons */}
            <QuestionOptions questionOptions={question?.options} userAnswer={question.user_answer} correctAnswer={question.correct_answer} />
    
            <QuizQuestionNavigation isReview={true} isLastQuestion={question.isLastQuestion} />

        </div>
    )
}

export default QuizQuestionReview;