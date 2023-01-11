import { useEffect, useState } from "react";
import { getFamiliarities } from "./services/SQLService";

const FamiliarityDropdown = props => {
    const [fams, setFams] = useState([]);

    useEffect(() => {

        getFamiliarities().then(result => {
            setFams(result);
        })

    }, []);

    const globalOnChange = e => {
        if(e.target.value !== "")
            props.question.is_complete = true;
            
        props.onChange(e, props.id)
    }

    return (
        <label style={{padding: 10}}>
            Familiarity  
            <select value={props.question.familiarity} /* disabled={!props.question.is_complete} */ style={{margin: "10px 10px 10px 5px"}} onChange={e => globalOnChange(e)}>
                {fams.map(fam => (
                    <option key={fam.id} value={fam.id}>{fam.name}</option>
                ))} 
            </select> 
        </label>
    )
}

export default FamiliarityDropdown;