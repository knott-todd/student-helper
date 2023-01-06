import { useEffect, useState, useContext } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { getTopics } from "./services/SQLService";
import {AppContext} from "./AppContext";
import './CSS/global.css'
import './CSS/Module.css'
import Progress from "./Progress";

const Module = () => {
    // Previous code that sorted the site into Modules>Objectives. To be copied and modified into Modules>Topics
    // const {id} = useParams();

    // const [objectives, setObjectives] = useState([]);

    // useEffect(() => {
    //     getModuleObjectives(id).then(result => {
    //         setObjectives(result);
    //         console.log(result[0].familiarity)
    //     })
    // }, [])

    // return (
    //     <div>
    //         {objectives.sort((a, b) => a.combined - b.combined).map((objective, i) => (
    //             <Link key={objective.id} to={`/objective_questions/${objective.id}`} style={{display: "block", padding: 0}}>
    //                 <div className="list-item" key={objective.id} style={{padding: 12, margin: 0}}>
    //                     {
    //                         (i === 0) ? (
    //                             <h2 style={{display: "inline-block", paddingRight: 10}}>
    //                                 Next to Study:
    //                             </h2>
    //                         ) : null
    //                     }
    //                     <p style={{display: "inline-block"}}>
    //                         {objective.info}
    //                     </p>

    //                     <div>
    //                         <label htmlFor="fam">
    //                             Familiarity (<Percent value={objective.familiarity} />)
    //                         </label>
    //                         <progress id="fam" value={objective.familiarity + 1} max="2" />    
    //                     </div>            
                        

    //                     <div>
    //                         <label htmlFor="prob">
    //                             Probability (<Percent value={objective.probability} />)
    //                         </label>
    //                         <progress id="prob" value={objective.probability} max="1" />
    //                     </div>

    //                     <div>
    //                             <label htmlFor="comb">
    //                             Combined (<Percent value={objective.combined} />)
    //                         </label>
    //                         <progress id="comb" value={objective.combined + 1} max="2" />    
    //                     </div>            
                        
    //                 </div>
    //             </Link>
    //         ))}
    //     </div>
    // )

    const {id} = useParams();

    const [topics, setTopics] = useState([]);

    const global = useContext(AppContext);

    const FamiliarityProgress = props => {
        return (
            <div>
                <label for="avg">
                    Familiarity ({props.topic.topicFam ? ((props.topic.topicFam  * 100).toFixed(2) + "%") : "None"})
                </label>

                <div className="progress" style={{overflow: "hidden", width: "100px", display:"inline-block"}}>
                    <div className="progress-bg negative-progress-bg">
                        <div className="negative-progress" style={{maxWidth: "100%", width: props.topic.topicFam < 0 ? `${-props.topic.topicFam * 100}%` : 0}}/>
                    </div>
                    <div className="progress-bg positive-progress-bg">
                        <div className="positive-progress" style={{maxWidth: "100%", width: props.topic.topicFam > 0 ? `${props.topic.topicFam * 100}%` : 0}}/>
                    </div>
                </div>
            </div>
        )
    }

    useEffect(() => {
        getTopics(id, global.userID).then(result => {
            result.avgFam = result.reduce((sum, next) => sum + next.topicFam, 0) / result.length;
            setTopics(result);
            // console.log(result[0].familiarity);
        })
    }, [])

    return (
        <div className="body-div">
            <h1 className="page-title">Topics</h1>
            <Progress value={topics.avgFam} height="6px" width="90%" />
            {/* {topics.sort((a, b) => a.combined - b.combined).map((topic, i) => ( */}
            {topics.sort((a, b) => (a.avgFam || a.avgFam === 0) ? a.avgFam - b.avgFam : b.avgFam - a.avgFam).map(topic => (
                
                // <Link key={topic.id} to={`/objective_questions/${topic.id}`} style={{display: "block", padding: 0}}>
                //     <div className="list-item" key={topic.id} style={{padding: 12, margin: 0}}>
                //         {
                //             (i === 0) ? (
                //                 <h2 style={{display: "inline-block", paddingRight: 10}}>
                //                     Next to Study:
                //                 </h2>
                //             ) : null
                //         }
                //         <p style={{display: "inline-block"}}>
                //             {topic.info}
                //         </p>

                //         <div>
                //             <label htmlFor="fam">
                //                 Familiarity (<Percent value={objective.familiarity} />)
                //             </label>
                //             <progress id="fam" value={objective.familiarity + 1} max="2" />    
                //         </div>            
                        

                //         <div>
                //             <label htmlFor="prob">
                //                 Probability (<Percent value={objective.probability} />)
                //             </label>
                //             <progress id="prob" value={objective.probability} max="1" />
                //         </div>

                //         <div>
                //                 <label htmlFor="comb">
                //                 Combined (<Percent value={objective.combined} />)
                //             </label>
                //             <progress id="comb" value={objective.combined + 1} max="2" />    
                //         </div>            
                        
                //     </div>
                // </Link>

                <div className={`topic-card track-card ${topic.topicFam >= 1 ? "familiarity-complete": ""}`} key={topic.topic.id} style={{ margin: 3}}>

                    <Link className="topic-link card-link" to={`/track/topic_questions/${topic.topic.id}`} style={{display:"block", padding: 0, margin: 0}}>

                        <h2 className={`track-card-heading`} >
                            {topic.topic.name}
                        </h2>

                        <Progress label="Familiarity" value={topic.topicFam} />
                    </Link>
                    {topic.objective.id ? (
                        <Link className="topic-link card-link accent-link" to={`/track/objective_questions/${topic.objective.id}`} style={{display: "block", padding: 3, paddingLeft: 0, margin:0, fontSize:14}}>
                            <p style={{display: "inline-block", padding: 0, margin:0}}>
                                <p className="topic-card-heading" style={{fontWeight: 500, padding: 0, margin: 0, display: "inline"}}>Next Objective:</p> {topic.objective.info ? topic.objective.info : "None"}
                            </p>
                            <p style={{display: "inline-block", padding: 3, margin:0}}>
                            <p style={{fontWeight: 500, padding: 3, margin: 0, display: "inline"}}>Familiarity:</p> {topic.lowestFamiliarity ? ((topic.lowestFamiliarity  * 100).toFixed(2) + "%") : "None"}
                            </p>
                        </Link>
                    ) : ""}
                    

                    {/* <Link className="accent-link" to={`/topic_questions/${topic.topic.id}`}>
                        <p>Practice</p>
                    </Link> */}
                </div>
            ))}
        </div>
    )
}

const Percent = props => {
    return (
        <p style={{display: "inline"}}>
            {(props.value || props.value === 0) ? ((props.value  * 100).toFixed(2) + "%") : "None"}
        </p>
    )
}

export default Module;