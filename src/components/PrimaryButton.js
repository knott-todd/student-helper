import styles from '../CSS/PrimaryButton.module.css'

const PrimaryButton = ({text, onClick, className, widthAdaptive=false}) => {

    return (
        <button className={`${styles.primaryBtn} ${className} ${widthAdaptive ? 'adaptive-width-btn' : ''}`} onClick={onClick}>
            {text}
        </button>
    )
}

export default PrimaryButton;