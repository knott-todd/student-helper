import { faThumbTack, faThumbTackSlash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const QuestionText = ({ questionText, isPinned }) => {
    return (
        <span style={{ display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'center' }}>
            {/* Question text */}
            <p>{questionText}</p>

            {/* Pin icon */}
            {isPinned 
            ? <FontAwesomeIcon icon={faThumbTack} /> 
            : <FontAwesomeIcon icon={faThumbTackSlash} />
            }
        </span>
    );
}

export default QuestionText;