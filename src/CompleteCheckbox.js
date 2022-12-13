const CompleteCheckbox = props => {

    const onChange = e => {
        props.onChange(e, props.id)

        
    }
    return (
        <label>
            {/* Completed */}
            <input type="checkbox" checked={(props.question.is_complete)} onChange={onChange} />
        </label>
    )
}

export default CompleteCheckbox;