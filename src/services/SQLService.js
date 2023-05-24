const backendURL = 'https://student-helper-backend.vercel.app';
// const backendURL = 'http://localhost:3080'

const onesignalURL = 'https://onesignal.com/api/v1/notifications';
const onesignalAppID = '99b7a99a-31e5-4656-86d7-ab456591292b';

const sqlToJSDeadline = deadline => {
    const dateParts = deadline.split("-");
    return new Date(dateParts[0], dateParts[1] - 1, dateParts[2].substr(0,2));

}

export async function getPastpapers (subID, examID, userID) {
    try {
        const response = await fetch(`${backendURL}/userpapers/${subID}/${examID}/${userID}`, {
            headers: {
                "Bypass-Tunnel-Reminder": "true"
            }
        });
        return await response.json();
    } catch(error) {
        return [];
    }
}

export async function getPastpaper (id) {
    try {
        const response = await fetch(`${backendURL}/pastpaper/${id}`, {
            headers: {
                "Bypass-Tunnel-Reminder": "true"
            }
        });
        return await response.json();
    } catch(error) {
        return [];
    }
}

export async function getMarkscheme (id) {
    try {
        const response = await fetch(`${backendURL}/markscheme/${id}`, {
            headers: {
                "Bypass-Tunnel-Reminder": "true"
            }
        });
        return await response.json();
    } catch(error) {
        return [];
    }
}

export async function getPaperQuestions (id, userID) {
    try {
        const response = await fetch(`${backendURL}/questions/${id}/${userID}`, {
            headers: {
                "Bypass-Tunnel-Reminder": "true"
            }
        });
        return await response.json();
    } catch(error) {
        return [];
    }
}

export async function getFamiliarities () {
    try {
        const response = await fetch(`${backendURL}/familiarities`, {
            headers: {
                "Bypass-Tunnel-Reminder": "true"
            }
        });
        return await response.json();
    } catch(error) {
        return [];
    }
}

export async function getUserExam (userID) {
    try {
        const response = await fetch(`${backendURL}/user_exam/${userID}`, {
            headers: {
                "Bypass-Tunnel-Reminder": "true"
            }
        });
        return await response.json();
    } catch(error) {
        return [];
    }
}

export async function getTaskInfo (taskID) {
    try {
        const response = await fetch(`${backendURL}/task_info/${taskID}`, {
            headers: {
                "Bypass-Tunnel-Reminder": "true"
            }
        });
        return await response.json();
    } catch(error) {
        return [];
    }
}

export async function getUserTasks (userID) {
    try {
        const response = await fetch(`${backendURL}/user_tasks/${userID}`, {
            headers: {
                "Bypass-Tunnel-Reminder": "true"
            }
        });
        return await response.json();
    } catch(error) {
        return [];
    }
}



export async function setUserExam(examID, userID) {
    const response = await fetch(`${backendURL}/set_user_exam`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            "Bypass-Tunnel-Reminder": "true"
        },
        body: JSON.stringify({examID, userID})
    })
    return await response.json();
}

export async function setSubExam(examID, subID, userID) {
    const response = await fetch(`${backendURL}/set_sub_exam`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            "Bypass-Tunnel-Reminder": "true"
        },
        body: JSON.stringify({examID, subID, userID})
    })
    return await response.json();
}

export async function updateUserQuestion(data, userID) {
    console.log("Updated")
    const response = await fetch(`${backendURL}/update_user_question`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            "Bypass-Tunnel-Reminder": "true"
        },
        body: JSON.stringify({question: data, userID})
    })
    return await response.json();
}

export async function updateTask(taskID, taskText, subject, deadline) {
    const response = await fetch(`${backendURL}/update_task`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            "Bypass-Tunnel-Reminder": "true"
        },
        body: JSON.stringify({taskID, taskText, subject, deadline})
    })

    const signalOptions = {
        method: 'PUT',
        headers: {
            accept: 'application/json',
            Authorization: 'Basic MWNlZjkwNjItOGVmOS00N2JkLWIyZWItNzlmOTNkN2VkYTM2',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            contents: {en: `${taskText}`},
            app_id: onesignalAppID,
            send_after: `${deadline.slice(0, 10)}`,
            delayed_option: "timezone",
            delivery_time_of_day: "9:00AM"
        })
    };
      
    fetch(onesignalURL + `/${taskID}`, signalOptions)
    .then(res => res.json())
    .then(json => console.log(json))
    .catch(err => console.error('error:' + err));

    return await response.json();
}

export async function updateTaskComplete (taskID, isCompleted) {
    const response = await fetch(`${backendURL}/update_task_complete`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            "Bypass-Tunnel-Reminder": "true"
        },
        body: JSON.stringify({taskID, is_completed: isCompleted})
    })
    return await response.json();
}

export async function deleteTask (taskID) {

    const signalOptions = {
        method: 'DELETE',
        headers: {
            accept: 'application/json',
            Authorization: 'Basic MWNlZjkwNjItOGVmOS00N2JkLWIyZWItNzlmOTNkN2VkYTM2',
            'Content-Type': 'application/json'
        }
    };

    const taskInfo = await getTaskInfo(taskID);
      
    return fetch(onesignalURL + `/${taskInfo.notification}?app_id=${onesignalAppID}`, signalOptions)
    .then(res => res.json())
    .then(json => console.log(json))
    .then(async () => {

        const response = await fetch(`${backendURL}/delete_task/${taskID}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                "Bypass-Tunnel-Reminder": "true"
            }
        })

        return response;

    })
    .catch(err => console.error('error:' + err));


}

export async function deletePaperQuestions (paperID) {

    const response = await fetch(`${backendURL}/del_paper_questions/${paperID}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            "Bypass-Tunnel-Reminder": "true"
        }
    })

    return response;


}
export async function setQuestObjective(data) {
    console.log(data);
    const response = await fetch(`${backendURL}/set_objective`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            "Bypass-Tunnel-Reminder": "true"
        },
        body: JSON.stringify(data)
    })
    return await response.json();
}

export async function setQuestTopic(data) {
    console.log(data);
    const response = await fetch(`${backendURL}/set_topic`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            "Bypass-Tunnel-Reminder": "true"
        },
        body: JSON.stringify(data)
    })
    return await response.json();
}

export async function setUserSub(subject, userID) {
    const response = await fetch(`${backendURL}/set_user_subject`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            "Bypass-Tunnel-Reminder": "true"
        },
        body: JSON.stringify({subject, userID})
    })
    return await response.json();
}

export async function getQuestTopic (questID) {
    try {
        const response = await fetch(`${backendURL}/question_topic/${questID}`, {
            headers: {
                "Bypass-Tunnel-Reminder": "true"
            }
        });
        return await response.json();
    } catch(error) {
        return [];
    }
}

export async function getModules (subID, examID, userID) {
    try {
        const response = await fetch(`${backendURL}/familiarity/${subID}/${examID}/${userID}`, {
            headers: {
                "Bypass-Tunnel-Reminder": "true"
            }
        });
        return await response.json();
    } catch(error) {
        return [];
    }
}

// Get user topics
export async function getTopics (moduleID, userID) {
    try {
        const response = await fetch(`${backendURL}/topics_familiarity/${moduleID}/${userID}`, {
            headers: {
                "Bypass-Tunnel-Reminder": "true"
            }
        });
        return await response.json();
    } catch(error) {
        return [];
    }
}

export async function getModule (moduleID) {
    try {
        const response = await fetch(`${backendURL}/module_info/${moduleID}`, {
            headers: {
                "Bypass-Tunnel-Reminder": "true"
            }
        });
        return await response.json();
    } catch(error) {
        return [];
    }
}

export async function getUnitModules (unitID) {
    try {
        const response = await fetch(`${backendURL}/unit_modules/${unitID}`, {
            headers: {
                "Bypass-Tunnel-Reminder": "true"
            }
        });
        return await response.json();
    } catch(error) {
        return [];
    }
}

export async function getModuleTopics (moduleID) {
    try {
        const response = await fetch(`${backendURL}/module_topics/${moduleID}`, {
            headers: {
                "Bypass-Tunnel-Reminder": "true"
            }
        });
        return await response.json();
    } catch(error) {
        return [];
    }
}

export async function getObjectiveQuestions (id, userID) {
    try {
        const response = await fetch(`${backendURL}/objective_questions/${id}/${userID}`, {
            headers: {
                "Bypass-Tunnel-Reminder": "true"
            }
        });
        return await response.json();
    } catch(error) {
        return [];
    }
}

export async function getTopicQuestions (id, userID) {
    try {
        const response = await fetch(`${backendURL}/topic_questions/${id}/${userID}`, {
            headers: {
                "Bypass-Tunnel-Reminder": "true"
            }
        });
        return await response.json();
    } catch(error) {
        return [];
    }
}

export async function getObjective (id, userID) {
    try {
        const response = await fetch(`${backendURL}/objective/${id}/${userID}`, {
            headers: {
                "Bypass-Tunnel-Reminder": "true"
            }
        });
        return await response.json();
    } catch(error) {
        return [];
    }
}

export async function getTopic (id, userID) {
    try {
        const response = await fetch(`${backendURL}/topic/${id}/${userID}`, {
            headers: {
                "Bypass-Tunnel-Reminder": "true"
            }
        });
        return await response.json();
    } catch(error) {
        return [];
    }
}

export async function getModuleObjectives (id, userID) {
    try {
        const response = await fetch(`${backendURL}/module_objectives/${id}/${userID}`, {
            headers: {
                "Bypass-Tunnel-Reminder": "true"
            }
        });
        return await response.json();
    } catch(error) {
        return [];
    }
}

export async function getTopicObjectives (id, userID) {
    try {
        const response = await fetch(`${backendURL}/topic_objectives/${id}/${userID}`, {
            headers: {
                "Bypass-Tunnel-Reminder": "true"
            }
        });
        return await response.json();
    } catch(error) {
        return [];
    }
}

export async function getSubjects () {
    try {
        const response = await fetch(`${backendURL}/subjects`, {
            headers: {
                "Bypass-Tunnel-Reminder": "true"
            }
        });
        return await response.json();
    } catch(error) {
        return [];
    }
}

export async function getUserSubjects (userID) {
    try {
        const response = await fetch(`${backendURL}/user_subjects/${userID}`, {
            headers: {
                "Bypass-Tunnel-Reminder": "true"
            }
        });
        return await response.json();
    } catch(error) {
        return [];
    }
}

export async function getExams () {
    try {
        const response = await fetch(`${backendURL}/exams`, {
            headers: {
                "Bypass-Tunnel-Reminder": "true"
            }
        });
        return await response.json();
    } catch(error) {
        return [];
    }
}

export async function getBuildVersion () {
    try {
        const response = await fetch(`${backendURL}/build_version`, {
            headers: {
                "Bypass-Tunnel-Reminder": "true"
            }
        });
        return await response.json();
    } catch(error) {
        return [];
    }
}

export async function getExamSubjects (examID) {
    try {
        const response = await fetch(`${backendURL}/exam_subjects/${examID}`, {
            headers: {
                "Bypass-Tunnel-Reminder": "true"
            }
        });
        return await response.json();
    } catch(error) {
        return [];
    }
}

export async function getSubjectUnits (examID, subjectID) {
    try {
        const response = await fetch(`${backendURL}/subject_units/${examID}/${subjectID}`, {
            headers: {
                "Bypass-Tunnel-Reminder": "true"
            }
        });
        return await response.json();
    } catch(error) {
        return [];
    }
}

export async function addObjective(objective) {
    const response = await fetch(`${backendURL}/add_objective`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            "Bypass-Tunnel-Reminder": "true"
        },
        body: JSON.stringify(objective)
    })
    return await response.json();
}

export async function addQuestion(question) {
    const response = await fetch(`${backendURL}/add_question`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            "Bypass-Tunnel-Reminder": "true"
        },
        body: JSON.stringify(question)
    })
    return await response.json();
}

export async function addTask(task, userID) {

    const deadlineTimeInHours = 15;

    const jsDeadline = sqlToJSDeadline(task.deadline);
    // If 2 days before deadline is before today, set reminder for today, otherwise set as 2 days before deadline
    let reminder = new Date();
    reminder.setDate(((jsDeadline.getDate() - 2) < new Date().getDate() ? new Date().getDate() : (jsDeadline.getDate() - 2)));
    reminder.setHours(deadlineTimeInHours);
    const reminderUTC = reminder.toUTCString();

    const signalOptions = {
        method: 'POST',
        headers: {
            accept: 'application/json',
            Authorization: 'Basic MWNlZjkwNjItOGVmOS00N2JkLWIyZWItNzlmOTNkN2VkYTM2',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            include_external_user_ids: [`${userID}`],
            contents: {en: `${task.taskText}`},
            external_id: task.id,
            name: `Task: ${task.taskText}`,
            app_id: onesignalAppID,
            send_after: `${reminderUTC}`,
            delayed_option: "timezone",
            delivery_time_of_day: `${deadlineTimeInHours}:00`
        })
    };
      
    const signalResponse = await (await fetch(onesignalURL, signalOptions)).json()
    console.log(signalResponse)
    // .then(res => res.json())
    // .then(json => console.log(json))
    // .catch(err => console.error('error:' + err));


    const response = await fetch(`${backendURL}/add_task`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            "Bypass-Tunnel-Reminder": "true"
        },
        body: JSON.stringify({...task, userID, notificationID: signalResponse.id})
    })
    
    return await response.json();
}

export async function setUser(fname, lname) {
    const response = await fetch(`${backendURL}/set_user`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            "Bypass-Tunnel-Reminder": "true"
        },
        body: JSON.stringify({fname, lname})
    })
    return response;

    // try {
    //     const response = await fetch(`${backendURL}/getuserID/${fname}/${lname}`);
    //     // userID = await response.json()[0].id;
    //     return await response.json();
    // } catch(error) {
    //     return [];
    // }
}

export async function getUserID (fname, lname) {
    try {
        const response = await fetch(`${backendURL}/get_userID/${fname}/${lname}`, {
            headers: {
                "Bypass-Tunnel-Reminder": "true"
            }
        });
        return await response.json();
    } catch(error) {
        return [];
    }
}

export async function saveInteraction (userID) {
    try {
        const response = await fetch(`${backendURL}/save_interaction/${userID}`, {
            headers: {
                "Bypass-Tunnel-Reminder": "true"
            }
        });
        return await response.json();
    } catch(error) {
        return [];
    }

    // Let todaysUsers = {date: "", users: []}
    // If current date is different to date of array, save to SQL
    // if (new Date() !== todaysUsers.date)
    //   saveArray()
    //   clearArray()
    //   return
    // 
    // If userID in already in array, ignore
    // if(todaysUsers.users.includes(userID))
    //   return
    //
    // If todaysUsers array is empty, save new date
    // if(!todaysUsers.date)
    //   todaysUsers.date = new Date()
    // 
    // todaysUsers.users.push(userID)
}