import { useEffect } from "react";
import { useQuizContext } from "../QuizContext";
import styles from '../css/QuizProgressBar.module.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate, useParams } from "react-router-dom";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { div } from "@tensorflow/tfjs";

const QuizProgressBar = () => {

    const { questions, isReview, currentIndex } = useQuizContext();

    const navigate = useNavigate();

    const { id } = useParams();

    return (
        <div className={`${styles.content} `}>
            <div className={`${styles.container} `}>
                {questions.map((question, i) => (
                <div className={`${styles.questionContainer} ${currentIndex === i ? styles.current : ''}`}>
                    
                    <button className={`\
                    ${styles.questionBox} \
                    ${question.user_answer !== null ? styles.completed : ''} \
                    ${isReview && question.is_correct ? styles.correct : ''} \
                    ${isReview && !question.is_correct ? styles.incorrect : ''}\
                    ${currentIndex === i ? styles.current : ''} \
                    ${question.was_reviewed ? styles.reviewed : ''}`}
                    
                    onClick={()=> navigate(`/quiz/${id}/${isReview ? 'review' : 'question'}/${i}`)}>
                    
                        {question.was_reviewed ? <FontAwesomeIcon height={10} icon={faCheck}  /> : ''}

                    </button>

                    {question.is_pinned 
                    ? <p style={{marginTop: "1rem"}}>*</p>
                    : ''}
                </div>
            ))}
        </div>

        </div>
    )
}

export default QuizProgressBar;