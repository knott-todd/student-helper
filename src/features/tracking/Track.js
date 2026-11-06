import { useContext, useEffect, useState, memo } from "react";
import { Link } from "react-router-dom";
import { getModules } from "../../services/SQLService";
import "../../CSS/global.css";
import "../../CSS/Track.css";
import { AppContext } from "../../AppContext";
import EmptyState from "../../components/EmptyState";
import { modulesForUnit, sortModules, subjectUnit } from "../../curriculum";

// Modules of the student's subject, for the unit chosen on Profile, in
// syllabus order. No self-ratings: no familiarity bars, scores or "Next:".
const Track = memo(() => {
    const [modules, setModules] = useState([]);
    const [loaded, setLoaded] = useState(false);

    const global = useContext(AppContext);
    const unit = subjectUnit(global.currSub);

    useEffect(() => {
        if (global.currSub && global.currSub.id && global.currExam) {
            setLoaded(false);
            getModules(global.currSub.id, global.currExam).then(result => {
                setModules(Array.isArray(result) ? result.filter(m => m && m.module) : []);
                setLoaded(true);
            })
        }
    }, [global.currSub, global.currExam]);

    useEffect(() => {
        global.setPageTitle("Track");
    }, [])

    const shown = sortModules(modulesForUnit(modules, unit));

    let empty = "";
    if (!global.currSub || !global.currSub.id) empty = "Choose a subject on Profile to see its modules.";
    else if (loaded && shown.length === 0) empty = `No modules to show for Unit ${unit} yet.`;

    return (
        <div style={{position: "relative"}}>
            <div className="track body-div">
                {empty ? <EmptyState>{empty}</EmptyState> : shown.map(module => (
                    <div className="module-card track-card" key={module.module.id}>
                        <div className="card-content">
                            <div className="card-header" >
                                <Link className="module-link card-link" to={`module/${module.module.id}`}>
                                    <h2 className="track-card-heading" >
                                        <span className="track-card-module-num">M{module.module.number}: </span>{module.module.name}
                                    </h2>
                                </Link>
                            </div>
                        </div>

                        {module.module.image_url ? <img className="card-bg-img" alt="" src={`${module.module.image_url}`} onError={(event) => event.target.style.display = 'none'} /> : ""}
                    </div>
                ))}
            </div>
        </div>
    )
})

export default Track;
