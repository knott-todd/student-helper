import { useEffect, useState, useContext, memo } from "react";
import { useParams } from "react-router-dom";
import { getTopic, getTopicObjectives } from "../../services/SQLService";
import {AppContext} from "../../AppContext";
import EmptyState from "../../components/EmptyState";
import { sortById } from "../../curriculum";
import '../../CSS/global.css'
import '../../CSS/Module.css'
import '../../CSS/Topic.css'

// A topic's syllabus objectives, in syllabus order.
const Topic = memo(() => {
    const {id} = useParams();

    const [objectives, setObjectives] = useState([]);
    const [loaded, setLoaded] = useState(false);
    const [topic, setTopic] = useState({});

    const global = useContext(AppContext);

    useEffect(() => {
        setLoaded(false);
        getTopicObjectives(id).then(result => {
            setObjectives(sortById(Array.isArray(result) ? result.filter(o => o && o.info) : []));
            setLoaded(true);
        })

        getTopic(id).then(result => {
            const row = Array.isArray(result) ? result[0] : result;
            setTopic(row || {});
        });
    }, [id])

    useEffect(() => {
        global.setPageTitle(topic.name);
    }, [topic.name])

    return (
        <div className="body-div">
            {loaded && objectives.length === 0 ? <EmptyState>No objectives to show for this topic yet.</EmptyState> : objectives.map(objective => (
                <div className="list-item" key={objective.id} style={{margin: 0}}>
                    <p className="topic-objective" style={{display: "inline-block"}}>
                        {objective.info}
                    </p>
                </div>
            ))}
        </div>
    )
})

export default Topic;
