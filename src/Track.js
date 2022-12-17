import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getModules } from "./services/SQLService";
import './CSS/global.css'
import './CSS/Track.css'
import {AppContext} from "./AppContext";
import { faFutbolBall } from "@fortawesome/free-solid-svg-icons";
import Progress from "./Progress";

const Track = () => {
    const [modules, setModules] = useState([]);

    const global = useContext(AppContext);

    useEffect(() => {
        
        if(global.currSub && global.currSub.id && global.currExam) {

            getModules(global.currSub.id, global.currExam, global.userID).then(result => {
                result.avgFam = result.reduce((sum, next) => sum + next.avgFam, 0) / result.length;
                setModules(result)
            })
        }

    }, [global.currSub, global.currExam]);

    return (
        <div className="track body-div">
            <h1 className="page-title">Track</h1>
            <Progress value={modules.avgFam} height="6px" width="90%" />

            {modules.sort((a, b) => (a.avgFam || a.avgFam === 0) ? a.avgFam - b.avgFam : b.avgFam - a.avgFam).map(module => (
                <div className="module-card track-card" key={module.module.id} style={{ margin: 3}}>

                    <Link className="module-link card-link" to={`module/${module.module.id}`} style={{display:"block", padding: 0, margin: 0}}>

                        <h2 className="track-card-heading" >
                            M{module.module.number}: {module.module.name}
                        </h2>

                        <Progress label="Familiarity" value={module.avgFam} />

                    </Link>

                    <Link className="module-link card-link accent-link" to={`topic_questions/${module.topic.id}`} style={{display: "block", padding: 3, paddingLeft: 0, margin:0, fontSize:14}}>
                        <p style={{display: "inline-block", padding: 0, margin:0}}>
                            <p className="module-card-heading" style={{fontWeight: 500, padding: 0, margin: 0, display: "inline"}}>Next Topic:</p> {module.topic.name ? module.topic.name : "None"}
                        </p>
                        <p style={{display: "inline-block", padding: 3, margin:0}}>
                            <p style={{fontWeight: 500, padding: 0, margin: 0, display: "inline"}}>Familiarity:</p> {module.lowestFamiliarity ? ((module.lowestFamiliarity  * 100).toFixed(2) + "%") : "None"}
                        </p>
                    </Link>
                </div>
            ))}
        </div>
    )
}

export default Track;