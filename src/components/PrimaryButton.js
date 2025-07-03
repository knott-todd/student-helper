import styles from '../CSS/PrimaryButton.module.css'

const PrimaryButton = ({children, onClick, className, widthAdaptive=false}) => {

    return (
        <button className={`${styles.primaryBtn} ${className} ${widthAdaptive ? 'adaptive-width-btn' : ''}`} onClick={onClick}>
            {children ? children : 'BUTTON'}
        </button>
    )
}

export default PrimaryButton;