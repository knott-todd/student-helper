// let userID = 1;

export async function getPastpapers (subID, unitNum, userID) {
    try {
        const response = await fetch(`/userpapers/${subID}/${unitNum}/${userID}`);
        return await response.json();
    } catch(error) {
        return [];
    }
}

export async function getPastpaper (id) {
    try {
        const response = await fetch(`/pastpaper/${id}`);
        return await response.json();
    } catch(error) {
        return [];
    }
}

export async function getMarkscheme (id) {
    try {
        const response = await fetch(`/markscheme/${id}`);
        return await response.json();
    } catch(error) {
        return [];
    }
}

export async function getPaperQuestions (id, userID) {
    try {
        const response = await fetch(`/questions/${id}/${userID}`);
        return await response.json();
    } catch(error) {
        return [];
    }
}

export async function getFamiliarities () {
    try {
        const response = await fetch(`/familiarities`);
        return await response.json();
    } catch(error) {
        return [];
    }
}

export async function updateUserQuestion(data, userID) {
    const response = await fetch(`/update_user_question`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({question: data, userID})
    })
    return await response.json();
}

export async function setQuestObjective(data) {
    console.log(data);
    const response = await fetch(`/set_objective`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
    })
    return await response.json();
}

export async function setQuestTopic(data) {
    console.log(data);
    const response = await fetch(`/set_topic`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
    })
    return await response.json();
}

export async function setUserSub(subject, userID) {
    const response = await fetch(`/set_user_subject`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({subject, userID})
    })
    return await response.json();
}

export async function getQuestTopic (questID) {
    try {
        const response = await fetch(`/question_topic/${questID}`);
        return await response.json();
    } catch(error) {
        return [];
    }
}

export async function getModules (subID, unitID, userID) {
    try {
        const response = await fetch(`/familiarity/${subID}/${unitID}/${userID}`);
        return await response.json();
    } catch(error) {
        return [];
    }
}

export async function getTopics (moduleID, userID) {
    try {
        const response = await fetch(`/topics_familiarity/${moduleID}/${userID}`);
        return await response.json();
    } catch(error) {
        return [];
    }
}

export async function getUnitModules (unitID) {
    try {
        const response = await fetch(`/unit_modules/${unitID}`);
        return await response.json();
    } catch(error) {
        return [];
    }
}

export async function getModuleTopics (moduleID) {
    try {
        const response = await fetch(`/module_topics/${moduleID}`);
        return await response.json();
    } catch(error) {
        return [];
    }
}

export async function getObjectiveQuestions (id, userID) {
    try {
        const response = await fetch(`/objective_questions/${id}/${userID}`);
        return await response.json();
    } catch(error) {
        return [];
    }
}

export async function getTopicQuestions (id, userID) {
    try {
        const response = await fetch(`/topic_questions/${id}/${userID}`);
        return await response.json();
    } catch(error) {
        return [];
    }
}

export async function getObjective (id, userID) {
    try {
        const response = await fetch(`/objective/${id}/${userID}`);
        return await response.json();
    } catch(error) {
        return [];
    }
}

export async function getTopic (id, userID) {
    try {
        const response = await fetch(`/topic/${id}/${userID}`);
        return await response.json();
    } catch(error) {
        return [];
    }
}

export async function getModuleObjectives (id, userID) {
    try {
        const response = await fetch(`/module_objectives/${id}/${userID}`);
        return await response.json();
    } catch(error) {
        return [];
    }
}

export async function getTopicObjectives (id, userID) {
    try {
        const response = await fetch(`/topic_objectives/${id}/${userID}`);
        return await response.json();
    } catch(error) {
        return [];
    }
}

export async function getSubjects () {
    try {
        const response = await fetch(`/subjects`);
        return await response.json();
    } catch(error) {
        return [];
    }
}

export async function getUserSubjects (userID) {
    try {
        const response = await fetch(`/user_subjects/${userID}`);
        return await response.json();
    } catch(error) {
        return [];
    }
}

export async function getExams () {
    try {
        const response = await fetch(`/exams`);
        return await response.json();
    } catch(error) {
        return [];
    }
}

export async function getExamSubjects (examID) {
    try {
        const response = await fetch(`/exam_subjects/${examID}`);
        return await response.json();
    } catch(error) {
        return [];
    }
}

export async function getSubjectUnits (examID, subjectID) {
    try {
        const response = await fetch(`/subject_units/${examID}/${subjectID}`);
        return await response.json();
    } catch(error) {
        return [];
    }
}

export async function addObjective(objective) {
    const response = await fetch(`/add_objective`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(objective)
    })
    return await response.json();
}

export async function addQuestion(question) {
    const response = await fetch(`/add_question`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(question)
    })
    return await response.json();
}

export async function setUser(fname, lname) {
    const response = await fetch(`/set_user`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({fname, lname})
    })
    return response;

    // try {
    //     const response = await fetch(`/getuserID/${fname}/${lname}`);
    //     // userID = await response.json()[0].id;
    //     return await response.json();
    // } catch(error) {
    //     return [];
    // }
}

export async function getUserID (fname, lname) {
    try {
        const response = await fetch(`/get_userID/${fname}/${lname}`);
        return await response.json();
    } catch(error) {
        return [];
    }
}