import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getModules } from "./services/SQLService";
import './CSS/global.css'
import './CSS/Track.css'
import {AppContext} from "./AppContext";

const Track = () => {
    const [modules, setModules] = useState([]);

    const global = useContext(AppContext);

    useEffect(() => {
        
        if(global.currSub) {

            getModules(global.currSub.id, global.currUnit, global.userID).then(result => {
                setModules(result)
            })
        }

    }, [global.currSub, global.currUnit]);

    return (
        <div className="track body-div">
            <h1 className="page-title">Track</h1>

            {modules.sort((a, b) => (a.avgFam || a.avgFam === 0) ? a.avgFam - b.avgFam : b.avgFam - a.avgFam).map(module => (
                <div className="module-card track-card" key={module.module.id} style={{ margin: 3}}>

                    <Link className="module-link card-link" to={`module/${module.module.id}`} style={{display:"block", padding: 0, margin: 0}}>

                        <h2 className="track-card-heading" >
                            M{module.module.number}: {module.module.name}
                        </h2>
                        <div>
                            <label for="avg">
                                Familiarity ({module.avgFam ? ((module.avgFam  * 100).toFixed(2) + "%") : "None"})
                            </label>

                            <div className="progress" style={{overflow: "hidden", width: "100px", display:"inline-block"}}>
                                <div className="progress-bg negative-progress-bg">
                                    <div className="negative-progress" style={{maxWidth: "100%", width: module.avgFam < 0 ? `${-module.avgFam * 100}%` : 0}}/>
                                </div>
                                <div className="progress-bg positive-progress-bg">
                                    <div className="positive-progress" style={{maxWidth: "100%", width: module.avgFam > 0 ? `${module.avgFam * 100}%` : 0}}/>
                                </div>
                            </div>
                        </div>

                    </Link>

                    <Link className="module-link card-link accent-link" to={`objective_questions/${module.objective.id}`} style={{display: "block", padding: 3, paddingLeft: 0, margin:0, fontSize:14}}>
                        <p style={{display: "inline-block", padding: 0, margin:0}}>
                            <p className="module-card-heading" style={{fontWeight: 500, padding: 0, margin: 0, display: "inline"}}>Next Objective:</p> {module.objective.info ? module.objective.info : "None"}
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