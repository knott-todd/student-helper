import { Outlet, useLocation, useParams } from "react-router-dom";
import { QuizProvider, useQuizContext } from "./QuizContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from './css/QuizWrapper.module.css';

const QuizWrapper = () => {
  const location = useLocation();

  const { topicIDs = [], questions = [] } = location.state || {};

  return (
    <QuizProvider initialTopics={topicIDs} initialQuestions={questions}>
      <QuizLayout />
    </QuizProvider>
  );
};

const QuizLayout = () => {
  const { exitQuiz } = useQuizContext();

  return (
    <div className={styles.quizWrapper}>
      <button className={`${styles.exitButton} tertiary-btn`} onClick={exitQuiz}>
        <FontAwesomeIcon icon="xmark" />
      </button>
      <div className={styles.content}>

        <Outlet />
        
      </div>
    </div>
  );
};

export default QuizWrapper;