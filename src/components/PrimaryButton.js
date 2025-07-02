const PrimaryButton = ({text, onClick, className}) => {

    return (
        <button className={`primary-btn ${className}`} onClick={() => onClick()}>
            {text}
        </button>
    )
}

export default PrimaryButton;