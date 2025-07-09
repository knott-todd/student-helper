import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretDown, faCaretUp } from "@fortawesome/free-solid-svg-icons";
import styles from './css/QuizSummary.module.css';
import { useQuizContext } from "./QuizContext";
import ShareButton from "../../components/ShareButton";
import QuizProgressBar from "./components/QuizProgressBar";
import PrimaryButton from "../../components/PrimaryButton";

const QuizSummary = ({ id }) => {
    const { reviewQuiz, exitQuiz, quizAttempt, setWasShared, isLoading } = useQuizContext();

    return (
        <div className="quiz-summary">
            <QuizProgressBar />
            <h3>Your Score</h3>
            <h1>{quizAttempt.score}%</h1>
            <p>{quizAttempt.review_blurb}</p>

            <h4 style={{marginTop: 64}}>Your Progress</h4>
            {quizAttempt.topics !== undefined && quizAttempt.topics.map((topic, index) => (
                <div className={styles.topicsContainer} style={{display: "flex", flexDirection: "column", alignItems: "start", justifyContent: "start", marginTop: 8}} key={index}>
                    <span style={{display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 16}} className="topic-progress">


                        {topic.delta < 0 
                        ? <FontAwesomeIcon icon={faCaretDown} />
                        : <FontAwesomeIcon icon={faCaretUp} />}
                        <h4>{topic.name}</h4>
                        <p>{topic.delta >= 0 && "+"}{topic.delta}%</p>

                        
                    </span>

                    <p className={styles.muted} style={{marginLeft: 16}}>└─ {topic.score}/{topic.num_questions} correct</p>
                </div>
            ))}

            {quizAttempt.score === 100
            ? (
                <div style={{marginTop: "2rem"}}>
                    <ShareButton 
                    title={`I scored ${quizAttempt.score}% on The Student Helper!`} 
                    url="https://student-helper-zeta.vercel.app"
                    onClick={() => setWasShared(true)} />
                    <button type="button" className="secondary-btn full-width-btn" onClick={() => exitQuiz()} >
                        Home
                    </button>
                </div>
            ): (
                <>

                    {/* Review mistakes button */}
                    <PrimaryButton
                        onClick={() => reviewQuiz()} 
                        style={{marginTop: 64}}
                        widthAdaptive
                        className="review-mistakes-button"
                    >
                        Review Mistakes
                    </PrimaryButton>

                    {/* Leave now button */}
                    <button onClick={() => exitQuiz()} type="button" className="full-width-btn secondary-btn leave-now-button">
                        Leave Now
                    </button>
                </>
            )}
        </div>
    );
}

export default QuizSummary;