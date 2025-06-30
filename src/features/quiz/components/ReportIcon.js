import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFlag as faRegularFlag } from '@fortawesome/free-regular-svg-icons';
import styles from '../css/ReportIcon.module.css'

const ReportIcon = () => {
    return (
        <div style={{position: 'relative', width: '100%', marginTop: '-2rem'}}>
            <button className={`${styles.reportIcon} tertiary-btn`}>
                <FontAwesomeIcon icon={faRegularFlag} />

            </button>
        </div>
    );
}

export default ReportIcon;