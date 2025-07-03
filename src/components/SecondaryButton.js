import styles from '../CSS/SecondaryButton.module.css'

const SecondaryButton = ({children, onClick, className, widthAdaptive=false}) => {

    return (
        <button className={`${styles.secondaryButton} ${className} ${widthAdaptive ? 'adaptive-width-btn' : ''}`} onClick={onClick}>
            {children ? children : 'BUTTON'}
        </button>
    )
}

export default SecondaryButton;