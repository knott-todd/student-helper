import { faThumbTack, faThumbTackSlash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useQuizContext } from "../QuizContext";

const QuestionText = ({ questionText, isPinned }) => {

    const { toggleQuestionPin } = useQuizContext();

    return (
        <span style={{ display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'center', marginTop: '8rem' }}>
            {/* Question text */}
            <p style={{textAlign: 'justify', fontFamily: 'serif', maxWidth: '50ch'}}>{questionText}</p>

            {/* Pin icon */}
            <button style={{width: 24}} className="tertiary-btn" onClick={() => toggleQuestionPin()}>
                {isPinned 
                ? <FontAwesomeIcon icon={faThumbTack} /> 
                : <FontAwesomeIcon icon={faThumbTackSlash} />
                }
            </button>
        </span>
    );
}

export default QuestionText;