import { useContext, useEffect, useState, memo } from "react";
import { Link } from "react-router-dom";
import { getModules } from "../../services/SQLService";
import "../../CSS/global.css";
import "../../CSS/Track.css";
import { AppContext } from "../../AppContext";
import { faFutbolBall } from "@fortawesome/free-solid-svg-icons";
import Progress from "../../Progress";

const Track = memo(() => {
    const [modules, setModules] = useState([]);

    const global = useContext(AppContext);

    useEffect(() => {

        if (global.currSub && global.currSub.id && global.currExam) {

            getModules(global.currSub.id, global.currExam, global.userID).then(result => {
                result.avgFam = result.reduce((sum, next) => sum + next.avgFam, 0) / result.length;
                setModules(result)
                
                global.setProgressValue(result.avgFam);
                console.log(result)
            })
        }

    }, [global.currSub, global.currExam]);

    useEffect(() => {
        global.setPageTitle("Track");
    }, [])

    return (
        <div style={{position: "relative"}}>
            {/* <h1 className="page-title">Track</h1> */}
            {/* <Progress value={modules.avgFam} height="4px" width="100%" position="absolute" overstyle={{top: 0}} /> */}

            <div className="track body-div">
                {modules.sort((a, b) => (a.avgFam || a.avgFam === 0) ? a.avgFam - b.avgFam : b.avgFam - a.avgFam).map(module => (
                    
                    <div className={`module-card track-card ${module.avgFam >= 1 ? "familiarity-complete": ""}`} key={module.module.id}>
                        
                        <div className="card-content">
                            <div className="card-header" >
                                <Link className="module-link card-link" to={`module/${module.module.id}`}>

                                    <h2 className="track-card-heading" >
                                        <span className="track-card-module-num">M{module.module.number}: </span>{module.module.name}
                                    </h2>

                                    {/* <Progress label="Familiarity" value={module.avgFam} /> */}

                                </Link>
                                <Link className="card-subtext card-link accent-link" to={`topic_questions/${module.topic.id}`}>
                                    <p style={{ display: "inline-block", padding: 0, margin: 0 }}>
                                        <span className="next">Next:</span><span className="sub-description"> {module.topic.name ? module.topic.name : "None"} </span>{/*({module.lowestFamiliarity ? ((module.lowestFamiliarity * 100).toFixed(2) + "%") : (module.lowestFamiliarity === 0 ? "0.00%" : "None")})*/}
                                    </p>
                                </Link>
                            </div>


                            {/* <Link className="module-link card-link accent-link" to={`topic_questions/${module.topic.id}`} style={{display: "block", padding: 3, paddingLeft: 0, margin:0, fontSize:14}}>
                                <p style={{display: "inline-block", padding: 0, margin:0}}>
                                    <p className="module-card-heading" style={{fontWeight: 500, padding: 0, margin: 0, display: "inline"}}>Next Topic:</p> {module.topic.name ? module.topic.name : "None"}
                                </p>
                                <p style={{display: "inline-block", padding: 3, margin:0}}>
                                    <p style={{fontWeight: 500, padding: 0, margin: 0, display: "inline"}}>Familiarity:</p> {module.lowestFamiliarity ? ((module.lowestFamiliarity  * 100).toFixed(2) + "%") : "None"}
                                </p>
                            </Link> */}



                            <Progress label="Familiarity" value={module.avgFam} height="4px" width="100%" position="absolute" />
                        </div>

                        {module.module.image_url ? <img className="card-bg-img" src={`${module.module.image_url}`} onError={(event) => event.target.style.display = 'none'} /> : ""}
                        
                    </div>
                ))}

            </div>
            
        </div>
    )
})

export default Track;