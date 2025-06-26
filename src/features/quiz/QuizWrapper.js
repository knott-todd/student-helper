import { Outlet, useLocation, useParams } from "react-router-dom";
import { QuizProvider, useQuizContext } from "./QuizContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from './css/QuizWrapper.module.css';

const QuizWrapper = () => {
  const { id } = useParams();
  const location = useLocation();

  const { topicIDs = null, questions = null } = location.state || {};

  return (
    <QuizProvider quizId={id} initialTopics={topicIDs} initialQuestions={questions}>
      <QuizLayout />
    </QuizProvider>
  );
};

const QuizLayout = () => {
  const { exitQuiz } = useQuizContext();

  return (
    <div className={styles.quizWrapper}>
      <button className={styles.exitButton} onClick={exitQuiz}>
        <FontAwesomeIcon icon="xmark" />
      </button>

      <Outlet />
    </div>
  );
};

export default QuizWrapper;