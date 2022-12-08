import { useContext, useEffect, useState } from "react";
import {AppContext} from "./AppContext";
import { getExams, getExamSubjects, getUnitModules, getSubjectUnits, getModuleTopics, addObjective } from "./services/SQLService";
import './CSS/ObjectiveInsert.css';
import DependentDropdown from "./DependentDropdown";

const ObjectiveInsert = () => {

    const [exams, setExams] = useState([]);
    const [exam, setExam] = useState({});

    const [subs, setSubs] = useState([]);
    const [sub, setSub] = useState({});

    const [units, setUnits] = useState([]);
    const [unit, setUnit] = useState({});

    const [modules, setModules] = useState([]);
    const [module, setModule] = useState({});

    const [topics, setTopics] = useState([]);
    const [topic, setTopic] = useState({});

    const [objectives, setObjectives] = useState("");

    useEffect(() => {

        getExams()
            .then(result => {
                setExams(result);
            })

    }, []);

    useEffect(() => {
        if(exam.id) {
            getExamSubjects(exam.id)
                .then(result => {
                    setSubs(result);
                })
        }
    }, [exam]);

    useEffect(() => {
        if(exam.id && sub.id) {
            getSubjectUnits(exam.id, sub.id)
                .then(result => {
                    setUnits(result);
                })
        }
    }, [sub, exam]);

    useEffect(() => {
        if(unit.id) {
            getUnitModules(unit.id)
                .then(result => {
                    setModules(result);
                })
        }
    }, [unit]);

    useEffect(() => {
        if(module.id) {
            getModuleTopics(module.id)
                .then(result => {
                    setTopics(result);
                })
        }
    }, [module]);

    const parseObjectives = () => {

        // 1st Pass - Parsing numbers (1.1, 1.2...)
        let parsed = objectives.split(/[0-9]\.[0-9][0-9]? /).slice(1);
        
        // Removing trailing /n's
        parsed = parsed.map(objective => objective.charAt(objective.length - 1) === "\n" ? objective.slice(0, -1) : objective)

        // 2nd Pass - Separating notes
        parsed = parsed.map(obj => obj.split(/\n(?=[A-Z])/));

        // Removing middle /n's and trailing ;'s, and fixing quotations
        parsed = parsed.map(arr => arr.map(obj => obj.replace("\n", " ").replace(";", ".").replace("'", "\\'")));

        return parsed;

    }

    const addObjectives = async (parsed) => {
        let count = 0; 

        await Promise.all(parsed.map(async (obj) => {
            await addObjective({info: obj[0], topic: topic.id, notes: obj[1]})
                .then(response => {
                    console.log(response);
                    count++;
                });
        }));

        return count;
    }

    const handleSubmit = e => {

        e.preventDefault();

        const parsed = parseObjectives();

        console.log(parsed);

        addObjectives(parsed)
            .then(result => console.log("Sent ", result, " rows"));

    }

    return (
        <div className="objective-insert">
            <form>

                <DependentDropdown currVal={exam} vals={exams} setObj={setExam} required={[]} label="Exam" labelColumn="short_name" />
                <DependentDropdown currVal={sub} vals={subs} setObj={setSub} required={[exam.id]} label="Subject" />
                <DependentDropdown currVal={unit} vals={units} setObj={setUnit} required={[exam.id, sub.id]} label="Unit" prepend={"obj.num ? (obj.num + ' - ') : null"} />
                <DependentDropdown currVal={module} vals={modules} setObj={setModule} required={[unit.id]} label="Module" prepend={"obj.num ? (obj.num + ' - ') : null"} />
                <DependentDropdown currVal={topic} vals={topics} setObj={setTopic} required={[module.id]} label="Topic" />
                
                <label htmlFor="objectives">Objectives</label>
                <textarea value={objectives} onChange={e => setObjectives(e.target.value)} disabled={!topic.id} cols="100" rows="20" style={{display: "block"}} id="objectives" type="text" placeholder="Copy the objectives from the CXC syllabus. Fix formulas and ordering if necessary. (Notes usually end up out of order when copied over)
                Eg:
                1.1 use the equation Q = It to solve problems;
                1.2 define the ‘coulomb’;
                1.3 define the ‘volt’;
                ..."/>


                <button disabled={!topic.id} onClick={handleSubmit}>Submit</button>


            </form>
        </div>
    )
}

export default ObjectiveInsert;