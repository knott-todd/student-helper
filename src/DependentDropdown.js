const DependentDropdown = (props) => {
    const {labelColumn = "name"} = props;

    const handleChange = e => {

        if(e.target.value) {

            if(props.setPrev)
                props.setPrev(props.currVal);
            
            props.setObj(props.vals.find(obj => obj.id === parseInt(e.target.value)));
        }
    }

    return (
        <div>
            <label htmlFor={props.label.toLowerCase()}>{props.label}</label>
            <select value={props.currVal.id} className="dependent-select" id={props.label.toLowerCase()} disabled={props.required.includes(undefined)} onChange={handleChange}>
                <option key={-1} value={-1}></option>
                {[{}].concat(props.vals).map(obj => (
                    <option key={parseInt(obj.id)} value={obj.id}>{eval(props.prepend)}{obj[labelColumn]}</option>
                ))}
            </select>
        </div>
    )
}

export default DependentDropdown;