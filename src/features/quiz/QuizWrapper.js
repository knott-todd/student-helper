import { Outlet, useLocation, useParams } from "react-router-dom";
import { QuizProvider } from "./QuizContext";
import QuizPreview from "./QuizPreview";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const QuizWrapper = () => {
  const { id } = useParams();
  const location = useLocation();

  // destructure topics and questions from location.state, fallback to null
  const { topicIDs = null, questions = null } = location.state || {};

  return (
    <QuizProvider quizId={id} initialTopics={topicIDs} initialQuestions={questions}>
      {/* exit icon button */}
      <FontAwesomeIcon icon="fa-light fa-xmark" />
      <QuizPreview />
    </QuizProvider>
  );
};


export default QuizWrapper;