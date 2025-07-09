import styles from '../CSS/PrimaryButton.module.css'

const PrimaryButton = ({children, onClick, className, widthAdaptive=false, style}) => {

    return (
        <button style={style} className={`${styles.primaryBtn} ${className} ${widthAdaptive ? 'adaptive-width-btn' : ''}`} onClick={onClick}>
            {children ? children : 'BUTTON'}
        </button>
    )
}

export default PrimaryButton;