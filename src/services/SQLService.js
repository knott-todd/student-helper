// const backendURL = 'https://student-helper-backend.vercel.app';
const backendURL = 'https://studenthelperbackend.loca.lt';

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

export async function updateUserQuestion(data, userID) {
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