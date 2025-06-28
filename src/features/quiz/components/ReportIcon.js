import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFlag as faRegularFlag } from '@fortawesome/free-regular-svg-icons';

const ReportIcon = () => {
    return (
        <button style={{ position: 'absolute', top: '2rem', right: '1rem' }} className="tertiary-btn quiz-report-button">
            <FontAwesomeIcon icon={faRegularFlag} />

        </button>
    );
}

export default ReportIcon;