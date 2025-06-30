import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFlag as faRegularFlag } from '@fortawesome/free-regular-svg-icons';
import styles from '../css/ReportIcon.module.css'

const ReportIcon = () => {
    return (
        <div className={styles.parent}>
            <div className={styles.content}>
                <button className={`${styles.reportIcon} tertiary-btn`}>
                    <FontAwesomeIcon icon={faRegularFlag} />

                </button>

            </div>
        </div>
    );
}

export default ReportIcon;