import { useEffect, useState } from "react";
import { getFamiliarities } from "./services/SQLService";

const FamiliarityDropdown = props => {
    const [fams, setFams] = useState([]);

    useEffect(() => {

        getFamiliarities().then(result => {
            setFams(result);
        })

    }, []);

    return (
        <label style={{padding: 10}}>
            Familiarity  
            <select value={props.question.familiarity} disabled={!props.question.is_complete} style={{margin: "10px 10px 10px 5px"}} onChange={e => props.onChange(e, props.id)}>
                {fams.map(fam => (
                    <option key={fam.id} value={fam.id}>{fam.name}</option>
                ))} 
            </select> 
        </label>
    )
}

export default FamiliarityDropdown;