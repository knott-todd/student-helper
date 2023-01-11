import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import Progress from "./Progress"
import { getUserTasks } from "./services/SQLService"
import SingleProgress from "./SingleProgress"

const Homework = () => {
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

    useEffect(() => {

        if(global.userID){
            getUserTasks(global.userID)
                .then(result => {
                    setTasks(result);
                })
        }
    }, []);

    const onIsCompleteChange = (e, task) => {
        
        const newValue = e.target.checked;

        let tempTasks = [...tasks];
        tempTasks[tempTasks.findIndex(_task => _task.id === task.id)].is_completed = newValue;
        setTasks(tempTasks);

        updateTaskComplete({id: task.id, is_completed: newValue})
    }

    const isTaskForToday = task => {
        const dateParts = task.deadline.split("-");
        const jsDeadline = new Date(dateParts[0], dateParts[1] - 1, dateParts[2].substr(0,2));
        const numDaysToDeadline = (jsDeadline.getTime() / (1000*60*60*24) - Math.ceil(today.getTime() / (1000*60*60*24)));
        
        // If difference between today and deadline is > 0, <= 2, or < 0 and not completed
        return (numDaysToDeadline <= 2 && numDaysToDeadline > 0) || (numDaysToDeadline < 0 && !task.is_completed)
    }

    return (
        <div>
            <h1>Homework</h1>
            <SingleProgress value={_tasks.filter(task => task.is_completed && isTaskForToday(task)).length / _tasks.filter(task => isTaskForToday(task)).length}/>
            <a>All Tasks</a>
            <div>
                {_tasks.filter(task => isTaskForToday(task)).map(task => (
                    <div>
                        <Link to={`task_form/${task.id}`}>
                            <p>{task.task_text}</p>
                            <p>{task.deadline}</p>
                        </Link>
                        <input type="checkbox" checked={task.is_completed} onChange={e => onIsCompleteChange(e, task)}/>
                    </div>
                ))}
            </div>
            <Link to="task_form">Add New</Link>
        </div>
    )
}

export default Homework