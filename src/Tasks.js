import { useContext } from "react"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { AppContext } from "./AppContext"
import Progress from "./Progress"
import { getUserTasks, updateTaskComplete } from "./services/SQLService"
import SingleProgress from "./SingleProgress"
import './CSS/Tasks.css'
import './CSS/global.css'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

const Tasks = () => {

    const [tasks, setTasks] = useState([{}]);
    const [todaysTasks, setTodaysTasks] = useState([{}]);
    const [displayedTasks, setDisplayedTasks] = useState([{}]);
    const [today, setToday] = useState(new Date());
    const [todayOnly, setTodayOnly] = useState(true);

    const global = useContext(AppContext);

    useEffect(() => {
        if (!("Notification" in window)) {
            console.log("Browser does not support desktop notification");
        } else {
            Notification.requestPermission();
        }

        // const schedule = require('node-schedule');

        // const job = schedule.scheduleJob('*/1 * * * *', function(){
        //     console.log('The answer to life, the universe, and everything!');

            
        // });

        if(global.currSub)
            console.log(global)

        if(global.userID){
            getUserTasks(global.userID)
                .then(result => {
                    console.log("tasks: ", result)
                    setTasks(result);

                    setTodaysTasks(result.filter(task => isTaskForToday(task)));
                    const tempTodaysTasks = result.filter(task => isTaskForToday(task));
                    global.setSingleProgressValue(tempTodaysTasks.filter(task => task.is_completed).length / tempTodaysTasks.length);
                })
        }
    }, []);

    useEffect(() => {
        global.setPageTitle("Tasks");
    }, [])

    useEffect(() => {

        setTimeout(() => {
            
            setDisplayedTasks((todayOnly ? todaysTasks : tasks)
            .filter(task => task.deadline)
            // .filter(task => global.currSub && global.currSub.id ? task.subject === global.currSub.id : true)
            .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
            .sort((a, b) => a.is_completed - b.is_completed))

        }, 200)


    }, [todaysTasks, tasks, global.currSub, todayOnly])

    const onIsCompleteChange = (e, task) => {

        const newValue = e.target.checked;

        updateTaskComplete(task.id, newValue)

        let tempTasks = [...tasks];
        tempTasks[tempTasks.findIndex(_task => _task.id === task.id)].is_completed = newValue;
        setTasks(tempTasks);

        setTodaysTasks(tempTasks.filter(_task => isTaskForToday(_task) || todaysTasks.filter(__task => __task.id === _task.id).length > 0));
        const tempTodaysTasks = tempTasks.filter(_task => isTaskForToday(_task) || todaysTasks.filter(__task => __task.id === _task.id).length > 0);
        global.setSingleProgressValue(tempTodaysTasks.filter(_task => _task.is_completed).length / tempTodaysTasks.length);
        
    }

    const sqlToJSDeadline = deadline => {
        const dateParts = deadline.split("-");
        return new Date(dateParts[0], dateParts[1] - 1, dateParts[2].substr(0,2));

    }

    const isTaskForToday = task => {
        if(task.deadline) {
            today.setHours(0,0,0,0);
            const jsDeadline = sqlToJSDeadline(task.deadline);
            const numDaysToDeadline = ((jsDeadline.getTime() - today.getTime()) / (1000*60*60*24));
            
            // If difference between today and deadline is > 0, <= 2, or <= 0 and not completed
            // console.log(task, numDaysToDeadline)
            return (numDaysToDeadline <= 2 && numDaysToDeadline > 0) || (numDaysToDeadline <= 0 && !task.is_completed)
        }
        
    }

    const isTaskOverdue = task => {
        if(task.deadline) {
            today.setHours(0,0,0,0);
            const jsDeadline = sqlToJSDeadline(task.deadline);
            const numDaysToDeadline = ((jsDeadline.getTime() - today.getTime()) / (1000*60*60*24));
            
            return (numDaysToDeadline <= 0 && !task.is_completed)
        }

    }

    const handleCheckboxInLink = e => {
        if(e.target.tagName === "INPUT") {
            e.stopImmediatePropagation();
        }
    }

    const dateNumToDate = date => {
        if(date) {
            const jsDate = sqlToJSDeadline(date);
            let weekdays = new Array(7);
            weekdays[0] = "Sunday";
            weekdays[1] = "Monday";
            weekdays[2] = "Tuesday";
            weekdays[3] = "Wednesday";
            weekdays[4] = "Thursday";
            weekdays[5] = "Friday";
            weekdays[6] = "Saturday";
            let day = weekdays[jsDate.getDay()];

            let tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
            if (tomorrow.getFullYear() == jsDate.getFullYear() && tomorrow.getMonth() == jsDate.getMonth() && tomorrow.getDate() == jsDate.getDate()) {
                return "Tomorrow"; // jsDate is one day after today.
            } else if (today.getFullYear() == jsDate.getFullYear() && today.getMonth() == jsDate.getMonth() && today.getDate() == jsDate.getDate()) {
                return "Today";
            }

            else return `${day.substring(0, 3)} ${jsDate.getDate()}`;
        }
    }

    return (
        <div style={{position: "relative"}}>
            {/* <SingleProgress label={`${todaysTasks.filter(task => task.is_completed).length}/${todaysTasks.length}`} height="4px" width="100%" position="absolute" overstyle={{top: 0}} value={todaysTasks.filter(task => task.is_completed).length / todaysTasks.length}/> */}

            <div className="body-div">
                {/* <h1>Tasks</h1> */}
            
                {/* <label>
                    Today Only
                    <input type="checkbox" checked={todayOnly} onChange={e => setTodayOnly(e.target.checked)} />
                </label>
                <br/>
                <h4 style={{marginBottom: "2px"}}>Progress</h4>
                <SingleProgress label={`${todaysTasks.filter(task => task.is_completed).length}/${todaysTasks.length}`} height="5px" width="100%" value={todaysTasks.filter(task => task.is_completed).length / todaysTasks.length}/>
                
                <br/> */}
                {/* <div>
                    {(todayOnly ? todaysTasks : tasks).filter(task => task.deadline).filter(task => global.currSub && global.currSub.id ? task.subject === global.currSub.id : true).sort((a, b) => new Date(a.deadline) - new Date(b.deadline)).sort((a, b) => a.is_completed - b.is_completed).map(task => (
                        <Link to={`task_form/${task.id}`} onClick={handleCheckboxInLink}>
                            <div className={`task ${task.is_completed ? "completed_task" : ""} ${isTaskOverdue(task) ? "overdue_task" : ""}`}>
                                <p style={{display: "inline-block", margin: "10px"}}>{task.task_text}</p>
                                <p className="task_deadline" style={{display: "inline-block", margin: "10px"}}>{/*task.deadline.substr(0, 10)/ dateNumToDate(task.deadline)}</p>
                                <input type="checkbox" checked={task.is_completed} onChange={e => onIsCompleteChange(e, task)}/>
                            </div>
                        </Link>
                    ))}
                </div> */}


                {/* Design revamp */}
                
                {((displayedTasks[0] && displayedTasks.some(task => !task.is_completed)) ? (
                    <div style={{marginLeft: "9%", marginRight: "9%"}}>
                        <div>
                            <h1 style={{textAlign: "start", margin: "11vh 0px 1vh"}}>Hey, {(global.user ? global.user.first_name : "")}</h1>
                            <p style={{textAlign: "start", margin: 0}}>Next for today:</p>
                            <div className={`next-task task ${displayedTasks[0].is_completed ? "completed_task" : ""} ${isTaskOverdue(displayedTasks[0]) ? "overdue_task" : ""}`}>
                                <div className="center-div" style={{margin: "auto", marginRight: "30px"}}>
                                    <h1 className="task-text strike" onClick={e => onIsCompleteChange({target: {checked: true}}, displayedTasks[0]) }>{displayedTasks[0].task_text}</h1>
                                    <Link style={{display: "inline", verticalAlign: "10%", paddingLeft: "5px"}} to={`task_form/${displayedTasks[0].id}`}>
                                        <FontAwesomeIcon icon="pencil" />
                                    </Link>
                                    <p className="deadline-wrap">Due: <span className="task_deadline">{dateNumToDate(displayedTasks[0].deadline)}</span></p>
                                </div>
                            </div>
                        </div>
                        <div>
                            {displayedTasks.length > 1 ? (<h4 style={{textAlign: "start", marginTop: "5vh", marginBottom: "7px"}}>Next up...</h4>) : ""}
                            {/* <label>
                                Today Only
                                <input type="checkbox" checked={todayOnly} onChange={e => setTodayOnly(e.target.checked)} />
                            </label> */}
                            {[...new Set(displayedTasks.slice(1).map((task) => task.deadline))].map(deadline => (
                                <div>
                                    <h4 className={``} style={{textAlign: "start", margin: "3px 0px", color: (isTaskOverdue({deadline}) ? "var(--red)" : ""), opacity: (displayedTasks.slice(1).filter(task => task.deadline === deadline).every(task => task.is_completed) ? "var(--faded-opacity)" : "") }}>{dateNumToDate(deadline)}</h4>
                                    {displayedTasks.slice(1).filter(task => task.deadline === deadline).map(task => (
                                        <Link key={task.id} to={`task_form/${task.id}`} onClick={handleCheckboxInLink}>
                                            <div className={`task ${task.is_completed ? "completed_task" : ""} ${isTaskOverdue(task) ? "overdue_task" : ""}`}>
                                                <input type="checkbox" checked={task.is_completed} onChange={e => onIsCompleteChange(e, task)}/>
                                                <p style={{display: "inline-block", margin: "10px"}}>{task.task_text}</p>
                                                {/* <p className="task_deadline" style={{display: "inline-block", margin: "10px"}}>{ dateNumToDate(task.deadline)}</p> */}
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ))}
                        </div>
                        <p style={{textDecoration: "underline", cursor: "pointer", textAlign: "start"}} onClick={e => setTodayOnly(!todayOnly)}>{(todayOnly ? "View all" : "View today only")}</p>
                    </div>
                ) : (
                    <div>
                        <p style={{opacity: "var(--faded-opacity)"}}>Looks like there's nothing left for today...</p>
                        {((tasks.length > 0 && tasks[0].deadline) ? <p style={{textDecoration: "underline", cursor: "pointer"}} onClick={e => setTodayOnly(!todayOnly)}>{(todayOnly ? "View all" : "View today only")}</p> : "")}
                    </div>
                ))}

                <Link className="add_new" to="task_form">
                    <FontAwesomeIcon icon="plus" style={{display: "inline", position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)"}}/>
                </Link>

            </div>
            
        </div>
    )
}

export default Tasks