import { useContext } from "react"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { AppContext } from "./AppContext"
import Progress from "./Progress"
import { getUserTasks, updateTaskComplete } from "./services/SQLService"
import SingleProgress from "./SingleProgress"
import './CSS/Homework.css'

const AllTasks = () => {
    const _tasks = [{
        id: 1,
        task_text: "SBA Lab",
        deadline: "2023-01-08",
        is_completed: false,
        subject: 1,
        user: 1
    }, {
        id: 2,
        task_text: "Build cool app",
        deadline: "2023-01-11",
        is_completed: false,
        subject: 1,
        user: 1
    }, {
        id: 3,
        task_text: "Delete everything",
        deadline: "2023-01-10",
        is_completed: true,
        subject: 1,
        user: 1
    }]

    const [tasks, setTasks] = useState([{}]);
    const [today, setToday] = useState(new Date());

    const global = useContext(AppContext);

    useEffect(() => {

        if(global.userID){
            console.log("idso")
            getUserTasks(global.userID)
                .then(result => {
                    console.log("tasks: ", result)
                    setTasks(result);
                })
        }
    }, []);

    const onIsCompleteChange = (e, task) => {
        
        const newValue = e.target.checked;

        let tempTasks = [...tasks];
        tempTasks[tempTasks.findIndex(_task => _task.id === task.id)].is_completed = newValue;
        setTasks(tempTasks);

        updateTaskComplete(task.id, newValue)
    }

    const sqlToJSDeadline = deadline => {
        const dateParts = deadline.split("-");
        return new Date(dateParts[0], dateParts[1] - 1, dateParts[2].substr(0,2));

    }

    const isTaskForToday = task => {
        if(tasks[0].deadline) {
            const jsDeadline = sqlToJSDeadline(task.deadline);
            const numDaysToDeadline = (jsDeadline.getTime() / (1000*60*60*24) - Math.ceil(today.getTime() / (1000*60*60*24)));
            
            // If difference between today and deadline is > 0, <= 2, or < 0 and not completed
            return (numDaysToDeadline <= 2 && numDaysToDeadline > 0) || (numDaysToDeadline < 0 && !task.is_completed)
        }
        
    }

    const handleCheckboxInLink = e => {
        if(e.target.tagName === "INPUT") {
            e.stopImmediatePropagation();
        }
    }

    return (
        <div>
            <h1>Homework</h1>
            <SingleProgress width="90%" value={tasks.filter(task => task.is_completed && isTaskForToday(task)).length / tasks.filter(task => isTaskForToday(task)).length}/>
            <a>All Tasks</a>
            <div>
                {tasks.sort((a, b) => new Date(a.deadline) - new Date(b.deadline)).sort((a, b) => a.is_completed - b.is_completed).map(task => (
                    <Link to={`task_form/${task.id}`} onClick={handleCheckboxInLink}>
                        <div className={`task ${task.is_completed ? "completed_task" : ""}`}>
                            <p style={{display: "inline-block", margin: "10px"}}>{task.task_text}</p>
                            <p style={{display: "inline-block", margin: "10px"}}>{task.deadline.substr(0, 10)}</p>
                            <input type="checkbox" checked={task.is_completed} onChange={e => onIsCompleteChange(e, task)}/>
                        </div>
                    </Link>
                ))}
            </div>
            <Link to="task_form">Add New</Link>
        </div>
    )
}

export default AllTasks