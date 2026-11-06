import { useEffect, useState, useContext } from "react";
import { Link, useParams } from "react-router-dom";
import { getModule, getTopics } from "../../services/SQLService";
import {AppContext} from "../../AppContext";
import EmptyState from "../../components/EmptyState";
import { sortById } from "../../curriculum";
import '../../CSS/global.css'
import '../../CSS/Module.css'

// Topics of a module in syllabus order. A topic opens its objectives page.
// No self-ratings: no familiarity bars, scores or "Next:".
const Module = () => {

    const {id} = useParams();

    const [topics, setTopics] = useState([]);
    const [loaded, setLoaded] = useState(false);
    const [module, setModule] = useState({});

    const global = useContext(AppContext);

    useEffect(() => {
        getModule(id).then(result => {
            setModule(result && !Array.isArray(result) ? result : {});
        })

        setLoaded(false);
        getTopics(id).then(result => {
            const rows = Array.isArray(result) ? result.filter(t => t && t.topic) : [];
            setTopics(sortById(rows.map(t => t.topic)));
            setLoaded(true);
        })
    }, [id])

    useEffect(() => {
        global.setPageTitle(module.name);
    }, [module.name])

    return (
        <div style={{position: "relative"}}>
            <div className="body-div">
                {loaded && topics.length === 0 ? <EmptyState>No topics to show for this module yet.</EmptyState> : topics.map(topic => (
                    <div className="topic-card track-card" key={topic.id}>
                        <div className="card-content">
                            <div className="card-header">
                                <Link className="topic-link card-link" to={`/track/topic/${topic.id}`}>
                                    <h2 className="track-card-heading" >
                                        {topic.name}
                                    </h2>
                                </Link>
                            </div>
                        </div>
                        {topic.image_url ? <img className="card-bg-img" alt="" src={`${topic.image_url}`} onError={(event) => event.target.style.display = 'none'} /> : ""}
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Module;
