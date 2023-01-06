import React from "react"
import { Link, useParams } from "react-router-dom"
import { useEffect, useState } from "react";
import { getMarkscheme } from "./services/SQLService";

const Markscheme = (props) => {
    const {id} = useParams();

    const [markscheme, setMarkscheme] = useState({});

    useEffect(() => {
        
        getMarkscheme(id).then(result => {
            setMarkscheme(result)
            console.log(result)
        })
        
    }, []);

    return (
        <div className="markscheme body-div" style={{height: "75vh"}}>

            <iframe src={markscheme.markscheme_link} width="99%" height="100%"></iframe>
            <Link to={`/test/questions/${markscheme.id}`}>
                Continue
            </Link>

        </div>
    )
}

export default Markscheme