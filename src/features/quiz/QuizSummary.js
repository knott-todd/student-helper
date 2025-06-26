import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import QuizProgressBar from "./QuizProgressBar";
import { faCaretDown, faCaretUp } from "@fortawesome/free-solid-svg-icons";
import styles from './css/QuizSummary.module.css';
import { useQuizContext } from "./QuizContext";

const QuizSummary = ({ id }) => {
    const { reviewQuiz, exitQuiz, quizAttempt } = useQuizContext();

    const quiz = {
        score: 90,
        reviewBlurb: "Great job — almost there. Let’s aim for that perfect 10!",
        topics: [
            { name: "Simple Harmonic Motion", delta: 15, score: 5, totalNumQuestions: 5 },
            { name: "Thermodynamics", delta: -10, score: 1, totalNumQuestions: 5 }
        ],
    };

    return (
        <div className="quiz-summary">
            <QuizProgressBar />
            <h3>Your Score</h3>
            <h1>{quiz.score}%</h1>
            <p>{quiz.reviewBlurb}</p>

            <h4 style={{marginTop: 64}}>Your Progress</h4>
            {quiz.topics.map((topic, index) => (
                <div className={styles.topicsContainer} style={{display: "flex", flexDirection: "column", alignItems: "start", justifyContent: "start", marginTop: 8}} key={index}>
                    <span style={{display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 16}} className="topic-progress">


                        {topic.delta < 0 
                        ? <FontAwesomeIcon icon={faCaretDown} />
                        : <FontAwesomeIcon icon={faCaretUp} />}
                        <h4>{topic.name}</h4>
                        <p>{topic.delta >= 0 && "+"}{topic.delta}%</p>

                        
                    </span>

                    <p className={styles.muted} style={{marginLeft: 16}}>└─ {topic.score}/{topic.totalNumQuestions} correct</p>
                </div>
            ))}

            {/* Review mistakes button */}
            <button onClick={() => reviewQuiz()} style={{marginTop: 64}} type="button" className="full-width-btn primary-btn review-mistakes-button">
                Review Mistakes
            </button>

            {/* Leave now button */}
            <button onClick={() => exitQuiz()} type="button" className="full-width-btn secondary-btn leave-now-button">
                Leave Now
            </button>
        </div>
    );
}

export default QuizSummary;