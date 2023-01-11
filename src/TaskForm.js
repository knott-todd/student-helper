import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AppContext } from "./AppContext";
import { addTask, getTaskInfo, getUserSubjects } from "./services/SQLService";

const TaskForm = () => {
    const {id} = useParams();

    const [task, setTask] = useState({});

    const [subject, setSubject] = useState();
    const [taskText, setTaskText] = useState();
    const [deadline, setDeadline] = useState();

    const [subs, setSubs] = useState([{}]);

    const global = useContext(AppContext);

    const onSubjectChange = e => {

    }

    useEffect(() => {
        if(id) {
            getTaskInfo(id)
                .then(result => {
                    setSubject(result.subject);
                    setDeadline(result.deadline);
                    setTaskText(result.task_text);
                })
        }
        
        if(global.userID){
            getUserSubjects(global.userID)
                .then(result => {
                    setSubs(result);
                })
        }
    }, [])

    const onSubmit = () => {
        if(id) {
            updateTaskInfo(id, taskText, subject, deadline)
        } else {
            addTask({taskText, subject, deadline})
        }
        // Redirect to homework
    }

    const onDelete = () => {
        if(id) {
            deleteTask(id);
        }
        // Redirect to homework
    }

    return (
        <div>
            <form>
                <label>Subject</label><br />
                <select className="sub-select header-dropdown" value={subject} style={{margin: "10px 10px 10px 5px"}} onChange={e => setSubject(e.target.value)}>
                    {subs.map(sub => (
                        <option key={parseInt(sub.id)} value={sub.id}>{sub.name}</option>
                    ))} 
                </select><br/>
                <label>Task</label><br />
                <input type="text" placeholder="Call Grandma..." value={taskText} onChange={e => setTaskText(e.target.value)} /><br />
                <label>Deadline</label><br />
                <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} /><br />
                <button onClick={onSubmit}>Save</button>
                <button onClick={onDelete}>Delete</button>
            </form>
        </div>
    )
}

export default TaskForm