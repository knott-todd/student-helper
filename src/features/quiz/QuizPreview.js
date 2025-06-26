import { useNavigate } from "react-router-dom";
import { useQuizContext } from "./QuizContext";
import styles from './css/QuizPreview.module.css'; 

const QuizPreview = () => {
    // get topics
    const { topics } = useQuizContext();

    const navigate = useNavigate();

    return (
        <div className="quiz-preview">
            <h2>Get Ready for Your Quiz</h2>

            <p>10 questions on...</p>

            <div className="line"></div>

            {/* [list of topics] */}
            <ul>
                {topics?.map((topic, index) => (
                    <li key={index}>{topic.name}</li>
                ))}
            </ul>

            {/* Motivational blurb */}
            <p className="body-sm blurb">You've got this — let's go!</p>

            {/* start quiz button */}
            <button className="primary-btn" type="button" onClick={() => navigate("question/0")}>
                Start Quiz
            </button>
        </div>
    );
}

export default QuizPreview;