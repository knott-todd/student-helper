import { useEffect, useState, useContext } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { getModule, getTopics } from "./services/SQLService";
import {AppContext} from "./AppContext";
import './CSS/global.css'
import './CSS/Module.css'
import Progress from "./Progress";

const Module = () => {

    const {id} = useParams();

    const [topics, setTopics] = useState([]);
    const [module, setModule] = useState({});

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
        getModule(id).then(result => {
            setModule(result);
        })

        getTopics(id, global.userID).then(result => {
            result.avgFam = result.reduce((sum, next) => sum + next.topicFam, 0) / result.length;
            setTopics(result);
            // console.log(result[0].familiarity);
        })
    }, [])

    return (
        <div className="body-div">
            <h1 className="page-title">{module.name}</h1>
            <Progress value={topics.avgFam} height="6px" width="90%" />
            {/* {topics.sort((a, b) => a.combined - b.combined).map((topic, i) => ( */}
            {topics.sort((a, b) => !a.topicFam || !b.topicFam ? (a.topicFam ? 1 : -1) : a.topicFam - b.topicFam).map(topic => (

                <div className={`topic-card track-card ${topic.topicFam >= 1 ? "familiarity-complete": ""}`} key={topic.topic.id}>

                    <div className="card-content">
                        <div className="card-header">
                            <Link className="topic-link card-link" to={`/track/topic_questions/${topic.topic.id}`}>

                                <h2 className={`track-card-heading`} >
                                    {topic.topic.name}
                                </h2>

                            </Link>
                        </div>

                        {/* {topic.objective.id ? (
                            <Link className="topic-link card-link accent-link" to={`/track/objective_questions/${topic.objective.id}`} style={{display: "block", padding: 3, paddingLeft: 0, margin:0, fontSize:14}}>
                                <p style={{display: "inline-block", padding: 0, margin:0}}>
                                    <p className="topic-card-heading" style={{fontWeight: 500, padding: 0, margin: 0, display: "inline"}}>Next Objective:</p> {topic.objective.info ? topic.objective.info : "None"}
                                </p>
                                <p style={{display: "inline-block", padding: 3, margin:0}}>
                                <p style={{fontWeight: 500, padding: 3, margin: 0, display: "inline"}}>Familiarity:</p> {topic.lowestFamiliarity ? ((topic.lowestFamiliarity  * 100).toFixed(2) + "%") : "None"}
                                </p>
                            </Link>
                        ) : ""} */}

                        {topic.objective.id ? (
                            <Link className="card-subtext topic-link card-link accent-link" to={`/track/topic/${topic.topic.id}`}>
                                <p style={{display: "inline-block", padding: 0, margin:0}}>
                                    <span className="next">Next:</span><span className="sub-description">  {topic.objective.info ? topic.objective.info : "None"} </span>({topic.lowestFamiliarity ? ((topic.lowestFamiliarity  * 100).toFixed(2) + "%") : "None"})
                                </p>
                            </Link>

                        ) : ""}

                        <Progress label="Familiarity" value={topic.topicFam} height="5px" width="100%" position="absolute" />

                        {/* <Link className="accent-link" to={`/topic_questions/${topic.topic.id}`}>
                            <p>Practice</p>
                        </Link> */}
                    </div>
                    {topic.topic.image_url ? <img className="card-bg-img" src={`${topic.topic.image_url}`} onError={(event) => event.target.style.display = 'none'} /> : ""}
                    
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