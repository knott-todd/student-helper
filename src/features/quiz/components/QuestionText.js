import { faThumbTack, faThumbTackSlash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useQuizContext } from "../QuizContext";
import styles from '../css/QuestionText.module.css'

const QuestionText = ({ questionText, isPinned }) => {

    const { toggleQuestionPin } = useQuizContext();

    return (
        <span style={{ display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'center', marginTop: '8rem' }}>
            
            {/* Pin icon */}
            <button style={{width: 24}} className={`tertiary-btn ${styles.pin} ${isPinned ? styles.pinned : styles.unpinned}`} onClick={() => toggleQuestionPin()}>
                {/* {isPinned 
                ? <FontAwesomeIcon icon={faThumbTack} /> 
                : <FontAwesomeIcon icon={faThumbTackSlash} />
                } */}
                <FontAwesomeIcon icon={faThumbTack} /> 
            </button>


            {/* Question text */}
            <p style={{textAlign: 'justify', fontFamily: 'serif', maxWidth: '50ch'}}>{questionText}</p>

        </span>
    );
}

export default QuestionText;