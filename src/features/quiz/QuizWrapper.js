import { Outlet, useLocation, useParams } from "react-router-dom";
import { QuizProvider } from "../../contexts/QuizContext";

const QuizWrapper = () => {
  const { id } = useParams();
  const location = useLocation();

  // destructure topics and questions from location.state, fallback to null
  const { topics = null, questions = null } = location.state || {};

  return (
    <QuizProvider quizId={id} initialTopics={topics} initialQuestions={questions}>
      <Outlet />
    </QuizProvider>
  );
};


export default QuizWrapper;