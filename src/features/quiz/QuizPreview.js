import { useNavigate } from "react-router-dom";
import { useQuizContext } from "./QuizContext";
import styles from './css/QuizPreview.module.css'; 

const QuizPreview = () => {
    // get topics
    const { topics, questions } = useQuizContext();

    const navigate = useNavigate();

    return (
        <div className="quiz-preview">
            <h2>Get Ready for Your Quiz</h2>

            <p>{questions.length} questions on...</p>

            <div className="line"></div>

            {/* [list of topics] */}
            <ul style={{listStyleType: "none", paddingLeft: 0}}>
                {topics?.map((topic, index) => (
                    <li key={index}><p style={{fontSize: "14"}}>{topic.name}</p></li>
                ))}
            </ul>

            {/* Motivational blurb */}
            <p style={{marginTop: "2rem"}} className="body-sm blurb">You've got this — let's go!</p>

            {/* start quiz button */}
            <button style={{marginTop: "1rem"}} className="primary-btn full-width-btn" type="button" onClick={() => navigate("question/0")}>
                Start Quiz
            </button>
        </div>
    );
}

export default QuizPreview;