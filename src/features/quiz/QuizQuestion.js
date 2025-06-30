import QuestionText from "./components/QuestionText";
import ReportIcon from "./components/ReportIcon";
import QuestionOptions from "./components/QuestionOptions";
import { useCurrentQuestion, useQuizContext } from './QuizContext';
import QuizProgressBar from './components/QuizProgressBar';
import { useEffect } from 'react';
import QuizQuestionNavigation from "./components/QuizQuestionNavigation";

const QuizQuestion = ()=> {

    const question = useCurrentQuestion();
    const { selectAnswer, currentIndex } = useQuizContext();

  return (
    <div className="quiz-question">

        { (!question) ? <p>Loading...</p> : (
            <>

                <QuizProgressBar />

                {/* Report icon */}
                <ReportIcon />

                <QuestionText questionText={question.question_text} isPinned={question.is_pinned} />
                
                {/* Multiple choice buttons */}
                <QuestionOptions 
                    mode="quiz"
                    questionOptions={question.options}
                    userAnswer={question.user_answer}
                    onSelect={(index) => selectAnswer(currentIndex, index)}
                />

                <QuizQuestionNavigation isLastQuestion={question.isLastQuestion} />

            </>
        )}
    </div>
  );
}

export default QuizQuestion;