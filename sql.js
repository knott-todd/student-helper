const express = require('express');
const mysql = require('mysql');
const { nextTick } = require('process');
// const { config } = require('nodemon');
const syncSql = require('sync-sql');
const util = require('util');

/*
NEXT TO DO: Calculate familiarity score 
1. Implement threshold count tables in db
2. Retrieve unfamiliar and familiar threshold counts for each familiarity tag
3. Calculate familiar and unfamiliar thresholds
4. For each objective calculate familiarity using thresholds 
*/

// Configure SQL connection
class Database {
    constructor( config ) {
        this.connection = mysql.createConnection( config );
    }
    query( sql, args ) {
        return new Promise( ( resolve, reject ) => {
            this.connection.query( sql, args, ( err, rows ) => {
                if ( err )
                    return reject( err );
                resolve( rows );
            } );
        } );
    }
    close() {
        return new Promise( ( resolve, reject ) => {
            this.connection.end( err => {
                if ( err )
                    return reject( err );
                resolve();
            } );
        } );
    }
}

const db2 = new Database({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'student_helper'
})

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'student_helper'
});

// Connect to SQL db
db.connect((err) => {
    if (err) throw err;

    console.log('Connected succesfully to SQL database.');
});

// Queries
/// Testing
// let userID = 1;
const getUserPapers = (subID, unitNum, userID) => (`
SELECT pastpaper.year, user_pastpaper.is_complete, pastpaper.id
FROM user 
INNER JOIN user_pastpaper 
ON user.id = user_pastpaper.user 
INNER JOIN pastpaper 
ON pastpaper.id = user_pastpaper.pastpaper
INNER JOIN unit
ON pastpaper.unit = unit.id
WHERE (user.id = ${userID} AND subject = ${subID} AND unit.num = ${unitNum})
ORDER BY user_pastpaper.is_complete;
`); // updated

const getUnitPapers = (subID, unitNum) => (`
SELECT pastpaper.id
FROM pastpaper
INNER JOIN unit
ON pastpaper.unit = unit.id
WHERE (subject = ${subID} AND unit.num=${unitNum})
`)

const addUserPaper = (paperID, userID) => (`
INSERT INTO user_pastpaper (user, pastpaper, is_complete) 
VALUES (${userID}, ${paperID}, 0)
`)

const getPaperQuestions = paperID => (`
SELECT id
FROM question
WHERE pastpaper = ${paperID}
`)

const getQuestPaper = quest => (`
SELECT pastpaper
FROM question
WHERE id = ${quest.id}
`)

const getPaperCompleted = (paperID, userID) => (`
SELECT question.id, user_question.is_complete
FROM user_question
INNER JOIN question
ON user_question.question = question.id
WHERE user_question.user = ${userID} AND question.pastpaper = ${paperID}
`)

const setPaperCompleteness = (paperID, userID, isComplete) => (`
UPDATE user_pastpaper
SET is_complete = ${isComplete}
WHERE pastpaper = ${paperID} AND user = ${userID};
`)

const getPaperTopics = paperID => (`
SELECT DISTINCT topic.id, topic.name
FROM question
INNER JOIN topic
ON question.topic = topic.id
WHERE pastpaper = ${paperID}
`)

const addUserQuestion = (questionID, userID) => (`
INSERT INTO user_question (user, question, is_complete, familiarity) 
VALUES (${userID}, ${questionID}, 0, 3)
`)

// const exam = "CAPE";
// const subject = "Physics";
// const pastpaperYear = "2016";

const gPastpaperID = 1;
const getPastPaper = pastpaperID => (`
SELECT pdf_link, id, markscheme_link, unit
FROM pastpaper 
WHERE pastpaper.id = ${pastpaperID};
`); //updated
const getMarkScheme = pastpaperID => (`
SELECT markscheme_link, id
FROM pastpaper 
WHERE pastpaper.id = ${pastpaperID};
`); //updated

const getUserPaperQuestions = (pastpaperID, userID) => (`
SELECT num,sub_letter,sub_sub_roman,sub_sub_sub_letter,is_complete, question.id, familiarity, info, objective.id AS objective_id, question.topic, module
FROM user_question
INNER JOIN question
ON user_question.question = question.id
LEFT OUTER JOIN objective
ON question.objective = objective.id
LEFT OUTER JOIN topic
ON question.topic = topic.id
WHERE (question.pastpaper = ${pastpaperID} AND user_question.user = ${userID});
`); //updated

const getObjectiveQuestions = (objectiveID, userID) => (`
SELECT question.num,sub_letter,sub_sub_roman,sub_sub_sub_letter,is_complete, question.id, familiarity, year, pastpaper.id AS paper_id
FROM user_question
INNER JOIN question
ON user_question.question = question.id
INNER JOIN pastpaper
ON question.pastpaper = pastpaper.id
WHERE (question.objective = ${objectiveID} AND user_question.user = ${userID});
`)

const getTopicQuestions = (topicID, userID) => (`
SELECT question.num,sub_letter,sub_sub_roman,sub_sub_sub_letter,is_complete, question.id, familiarity, year, pastpaper.id AS paper_id
FROM user_question
INNER JOIN question
ON user_question.question = question.id
INNER JOIN pastpaper
ON question.pastpaper = pastpaper.id
WHERE (question.topic = ${topicID} AND user_question.user = ${userID});
`)

const getObjective = objectiveID => (`
SELECT *
FROM objective
WHERE id = ${objectiveID}
;`)

const getTopic = topicID => (`
SELECT *
FROM topic
WHERE id = ${topicID}
;`)

let familiarity = "Familiar";
let isCompleted = 1;
let quesNum = 1;
let subQuesLetter = "a";
let subSubQuesRoman = "ii";
let subSubSubQues = "";
// const updateQuestionStatus = `
// UPDATE user_question 
// SET familiarity = "${familiarity}", is_completed = ${isCompleted} 
// WHERE (user_question.exam = "${exam}" AND user_question.subject = "${subject}" AND user_question.unit = "${unitNumber}" AND user_question.pastpaper_year = "${pastpaperYear}" AND user_question.question_number = "${quesNum}" AND user_question.sub_question_letter = "${subQuesLetter}" AND user_question.sub_sub_roman = "${subSubQuesRoman}" AND user_question.sub_sub_sub_question = "${subSubSubQues}" AND user_question.user = "${userID}");
// `;

const getFamiliarities = `
SELECT id, name
FROM familiarity
`;

const updateUserQuestion = (question, userID) => (`
UPDATE user_question 
SET familiarity = ${question.familiarity}, is_complete = ${question.is_complete}
WHERE (user_question.user = ${userID} AND user_question.question = ${question.id})
`);



/// Tracking
let gObjective = 4;
const unitID = 1;

const getModules = (subID, unitNum) => (`
SELECT module.id, exam, subject, unit.num AS unit_number, module.num AS number, module.name
FROM module
INNER JOIN unit
ON module.unit = unit.id
WHERE (subject = ${subID} AND unit.num = ${unitNum})
`); //updated

const maxPriorityScore = (userID) => (`
SELECT MAX(priority_score) 
FROM user_familiarity
WHERE user = "${userID}";
`); //updated

const getProportions = (userID) => (`
SELECT variable, proportion
FROM user_variable
WHERE user = ${userID};
`);





// Setup express
const app = express();

app.listen('3080', () => {
    console.log('Now listening to port 3080...')
})

app.use(express.static('public'));
app.use(express.json())

// Routes
app.get('/', (req, res) => {
    const sql = 'SELECT * FROM user';

    db.query(sql, (err, result) => {
        if (err) res.send(err);
        res.send(result);
    });
})

app.get('/test', (req, res) => {
    const config = {
        tables: [
            {
                name: 'user',
                columns: [
                    'first_name',
                    'last_name',
                    'email'
                ],
                valuelists: [
                    ['Olusanya', 'Todd', 'o@gmail.com'],
                    ['Jerry', 'Rice', 'j@gmail.com']
                ]
            },
            {
                name: 'subject',
                columns: [
                    'subject_name'
                ],
                valuelists: [
                    ['Physics'],
                    ['Biology']
                ]
            },
            {
                name: 'unit',
                columns: [
                    'subject',
                    'number',
                    'name'
                ],
                valuelists: [
                    ['955d3f27-cfd1-11ec-9cb6-089798d989df', 1, ''],
                    ['955d3f27-cfd1-11ec-9cb6-089798d989df', 2, '']
                ]
            },
            {
                name: 'module',
                columns: [
                    'subject',
                    'unit_number',
                    'number',
                    'name'
                ],
                valuelists: [
                    ['955d3f27-cfd1-11ec-9cb6-089798d989df', 1, 1, "Physics of the atom"],
                    ['955d3f27-cfd1-11ec-9cb6-089798d989df', 1, 2, "Polymers"],
                    ['955d3f27-cfd1-11ec-9cb6-089798d989df', 1, 3, "Bombs and stuff"]
                ]
            },
            {
                name: 'topic',
                columns: [
                    'subject',
                    'unit_number',
                    'module_number',
                    'topic_title'
                ],
                valuelists: [
                    ['955d3f27-cfd1-11ec-9cb6-089798d989df', 1, 1, 'Atomic potential energy'],
                    ['955d3f27-cfd1-11ec-9cb6-089798d989df', 1, 1, 'Momentum of an atom']
                ]
            }
        ]
    }

    let sql = bulkDelete(config);
    sql += bulkInsert(config);

    console.log(sql);

    db.query(sql, (err, result) => {
        if (err) res.send(err);
        res.send(result);
    });

})

/// Testing
app.get('/userpapers/:sub_id/:unit_num/:userID', async (req, res) => {
    const unitPapers = await db2.query(getUnitPapers(req.params.sub_id, req.params.unit_num));

    const userPapers = await db2.query(getUserPapers(req.params.sub_id, req.params.unit_num, req.params.userID));
    const userPaperIDs = userPapers.map(userPaper => userPaper.id);

    console.log(req.params.unit_num, unitPapers);
    console.log(req.params.userID)
    console.log(userPaperIDs);

    for (const unitPaper of unitPapers) {

        if(!userPaperIDs.includes(unitPaper.id)) {
            console.log(".")
            await db2.query(addUserPaper(unitPaper.id, req.params.userID));
        }
    }

    // db.query(getUserPapers(req.params.sub_id, req.params.unit_num, req.params.userID), (err, result) => {
    //     if (err) res.send(err);
    //     console.log(result.map(userPaper => userPaper.id))
    //     res.send(result);
    // });

    db2.query(getUserPapers(req.params.sub_id, req.params.unit_num, req.params.userID))
        .then(async (result) => {
    
            for (const userPaper of result) {
                userPaper.topics = await db2.query(getPaperTopics(userPaper.id))
            }

            res.send(result)
        })
        .catch(err => res.send(err))
})

app.get('/pastpaper/:id', (req, res) => {
    db.query(getPastPaper(req.params.id), (err, result) => {
        if (err) res.send(err);
        res.send(result[0]);
    });
})

app.get('/markscheme/:id', (req, res) => {
    db.query(getMarkScheme(req.params.id), (err, result) => {
        if (err) res.send(err);
        res.send(result[0]);
    });
})

app.get('/questions/:id/:userID', async (req, res) => {
    const paperQuestions = await db2.query(getPaperQuestions(req.params.id));

    const userQuestions = await db2.query(getUserPaperQuestions(req.params.id, req.params.userID));

    console.log(userQuestions)
    const userQuestIDs = await userQuestions.map(userQuest => userQuest.id);

    console.log("Q-IDs:")
    console.log(userQuestIDs)

    for (const question of paperQuestions) {

        console.log(question.id)

        if(!userQuestIDs.includes(question.id)) {
            await db2.query(addUserQuestion(question.id, req.params.userID));
        }

    }

    await db2.query(getUserPaperQuestions(req.params.id, req.params.userID))
        .then(result => {
            console.log("DONE")
            res.send(result)
        })
        .catch(err => {
            console.log(err)
            res.send(err)
        })
})

app.get('/objective_questions/:id/:userID', (req, res) => {
    db.query(getObjectiveQuestions(req.params.id, req.params.userID), (err, result) => {
        if (err){ res.send(err)}
        else res.send(result);
    });
})

app.get('/topic_questions/:id/:userID', (req, res) => {
    db2.query(getTopicQuestions(req.params.id, req.params.userID))
    .then(result => res.send(result))
    .catch(err => res.send(err))
})

app.get('/update', (req, res) => {
    let updates = [{"questionID": 1,"familiarity":"Familiar","is_complete":1}];
    let sql = bulkUpdate(updates);

    db.query(sql, (err, result) => {
        if (err) res.send(err);
        res.send(result);
    });
})

app.get('/familiarities', (req, res) => {
    db.query(getFamiliarities, (err, result) => {
        if(err) res.send(err);
        res.send(result);
    })
})

app.put('/update_user_question', async (req, res) => {

    await db2.query(updateUserQuestion(req.body.question, req.body.userID))
    .then(async result => {
        const paper = (await db2.query(getQuestPaper(req.body.question)))[0].pastpaper;
        const questionsCompleteness = await db2.query(getPaperCompleted(paper, req.body.userID))
        
        console.log(paper)
        console.log(questionsCompleteness.every(q => q.is_complete === true))
        await db2.query(setPaperCompleteness(paper, req.body.userID, questionsCompleteness.every(q => q.is_complete === true)))

        res.send(result)
    })
    .catch(err => res.send(err))
})

/// Tracking
app.get('/score/:userID', (req, res) => {
    db.query(objectivePriorityScore(gObjective), (err, score) => {
        if (err) res.send(err);

        db.query(maxPriorityScore(req.params.userID), (maxErr, maxScore) => {
            if (err) res.send(err);

            res.send((Object.values(score[0])[0] / Object.values(maxScore[0])[0]).toString())

        })

    });
})

const config = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'student_helper'
}

app.get('/probability', (req, res) => {
    let highestProbs = [];
    let currProb;

    let modules = syncSql.mysql(config, getModules);

    modules.data.rows.forEach(async (module, moduleIndex) => {

        // Add module to probability list
        highestProbs.push({
            module,
            highestProb: 0,
            objective: {}
        })


        let objectives = await db2.query(moduleObjectives(module.id));
        
        for (const objective in objectives) {

            let sum = await db2.query(objectiveSum(module.id));


            let count = await db2.query(objectiveCount(objective.id));

            
            // console.log("Count: ", countresult, " Sum: ", sumresult)
            
            if(sum == 0) {
                currProb = 0;
            } else {
                currProb = (Object.values(count[0])[0] / Object.values(sum[0])[0]).toString();
            }

            if (currProb > highestProbs[moduleIndex].highestProb) {
                highestProbs[moduleIndex].highestProb = currProb;
                highestProbs[moduleIndex].objective = objective;
            };
            
        }

    })

    highestProbs.sort((a, b) => a.highestProb > b.highestProb);
    res.send(highestProbs);
    

    // db.query(getModules, (moduleErr, modules) => {
    //     if (moduleErr) res.send(moduleErr)
        
    //     modules.forEach((module, moduleIndex) => {

    //         // Add module to probability list
    //         highestProbs.push({
    //             module,
    //             highestProb: 0,
    //             objective: {}
    //         })

    //         let objectives = syncSql.mysql(config, moduleObjectives(module));
            
    //         // Begin query
    //         db.query(moduleObjectives(module), (moErr, objectives) => {
    //             if(moErr) res.send(moErr);

    //             let objectiveIndex;

    //             console.log(objectives)
                
    //             // Normal response
    //             objectives.forEach((objective, objIndex) => {

    //                 objectiveIndex = objIndex;

    //                 let sum = syncSql.mysql(config, objectiveSum(module));

    //                 db.query(objectiveSum(module), (sumErr, sumresult) => {
    //                     if (sumErr) res.send(sumErr);

    //                     let count = syncSql.mysql(config, objectiveCount(objective));

    //                     db.query(objectiveCount(objective), (countErr, countresult) => {
    //                         if (countErr) res.send(countErr);

                            
    //                         // console.log("Count: ", countresult, " Sum: ", sumresult)
                            
    //                         if(sumresult == 0) {
    //                             currProb = 0;
    //                         } else {
    //                             currProb = (Object.values(countresult[0])[0] / Object.values(sumresult[0])[0]).toString();
    //                         }

    //                         if (currProb > highestProbs[moduleIndex].highestProb) {
    //                             highestProbs[moduleIndex].highestProb = currProb;
    //                             highestProbs[moduleIndex].objective = objective;
    //                         };

    //                         // console.log(highestProbs);

    //                         // console.log(objective.id, module.number);
    //                         // console.log((Object.values(countresult[0])[0] / Object.values(sumresult[0])[0]).toString());
                            
    //                         console.log("O: ", objectiveIndex + 1, objectives.length);
    //                         console.log("M: ", moduleIndex + 1, modules.length);
    //                         if (objectiveIndex + 1 == objectives.length && moduleIndex + 1 == modules.length){
    //                             console.log("Yeah")

    //                             highestProbs.sort((a, b) => a.highestProb > b.highestProb);

    //                             res.send(highestProbs);

    //                         }
    //                     });

    //                 });
                    
    //             })

    //             // Handle response if the last module has no objectives
    //             if (objectives.length == 0 && moduleIndex + 1 == modules.length) {

    //                 highestProbs.sort((a, b) => a.highestProb > b.highestProb);

    //                 res.send(highestProbs);

    //             }
    //         })

    //     })

    // })
    
})

app.get('/combined/:userID', (req, res) => {
    let highestCombines = [];
    let currProb;
    let currPriority;
    let currCombined;

    let modules = syncSql.mysql(config, getModules);

    const probProportion = syncSql.mysql(config, variableProportion("probability")).data.rows[0].proportion;
    const priorityProportion = syncSql.mysql(config, variableProportion("priority")).data.rows[0].proportion;

    console.log("HII", probProportion, priorityProportion);

    modules.data.rows.forEach((module, moduleIndex) => {

        // Add module to probability list
        highestCombines.push({
            module,
            highestCombined: 0,
            objective: {}
        })


        let objectives = syncSql.mysql(config, moduleObjectives(module.id));
        
        console.log(objectives)
        
        objectives.data.rows.forEach(objective => {

            currProb = objectiveProbability(objective, module);
            currPriority = Object.values(syncSql.mysql(config, objectivePriorityScore(objective, req.params.userID)).data.rows[0])[0];
            
            currCombined = currProb * probProportion + currPriority * priorityProportion;

            if (currCombined > highestCombines[moduleIndex].highestCombined) {
                highestCombines[moduleIndex].highestCombined = currCombined;
                highestCombines[moduleIndex].objective = objective;
            };
            
        })

    })

    highestCombines.sort((a, b) => a.highestCombined > b.highestCombined);
    res.send(highestCombines);
    
})

// Async (extremely slow, don't use)
// app.get('/familiarity', (req, res) => {
//     let lowestFamiliarities = [];
//     let currPriority;
//     let currFam;

//     let modules = syncSql.mysql(config, getModules);

//     modules.data.rows.forEach((module, moduleIndex) => {

//         // Add module to probability list
//         lowestFamiliarities.push({
//             module,
//             avgFam: undefined,
//             lowestFamiliarity: Infinity,
//             objective: {}
//         })

//         let famSum = 0;

//         let objectives = syncSql.mysql(config, moduleObjectives(module.id)).data.rows;
        
//         objectives.forEach(objective => {
            
//             const familiarThresh = calculateThreshold(1, objective.id);
//             const unfamiliarThresh = calculateThreshold(2, objective.id);

//             currPriority = Object.values(syncSql.mysql(config, objectivePriorityScore(objective)).data.rows[0])[0] / maxPriority;
            
//             currFam = 1 - (currPriority - familiarThresh) / (unfamiliarThresh - familiarThresh);

//             if(currFam) {
//                 famSum += currFam;
//             };

//             if (currFam < lowestFamiliarities[moduleIndex].lowestFamiliarity) {
//                 lowestFamiliarities[moduleIndex].lowestFamiliarity = currFam;
//                 lowestFamiliarities[moduleIndex].objective = objective;
//             };
            
//         })

//         lowestFamiliarities[moduleIndex].avgFam = famSum / objectives.length;

//     })

//     lowestFamiliarities.sort((a, b) => a.lowestFamiliarity < b.lowestFamiliarity);
//     res.send(lowestFamiliarities);
    
// })

app.get('/familiarity/:sub_id/:unit_num/:userID', async (req, res) => {
    let lowestFamiliarities = [];
    let currPriority;
    let currFam;

    const modules = await db2.query(getModules(req.params.sub_id, req.params.unit_num));
    
    for (const [moduleIndex, module] of modules.entries()) {

        // Add module to probability list
        lowestFamiliarities.push({
            module,
            avgFam: undefined,
            lowestFamiliarity: Infinity,
            objective: {}
        })

        let famSum = 0;

        let objectives = await db2.query(moduleObjectives(module.id));
        
        for (const [i, objective] of objectives.entries()) {
            
            currFam = await calcFamiliarity(objective, req.params.userID);

            currProb = await calcProb(module.id, objective);

            combined = await calcCombined(currFam, currProb, req.params.userID);

            if(currFam) {
                famSum += currFam;
            };

            if (currFam < lowestFamiliarities[moduleIndex].lowestFamiliarity) {
                lowestFamiliarities[moduleIndex].lowestFamiliarity = currFam;
                lowestFamiliarities[moduleIndex].objective = objective;
            };
            
        }

        lowestFamiliarities[moduleIndex].avgFam = famSum / objectives.length;

    }

    lowestFamiliarities.sort((a, b) => a.lowestFamiliarity < b.lowestFamiliarity);
    res.send(lowestFamiliarities);
    
})

app.get('/topics_familiarity/:module_id/:userID', async (req, res) => {
    let lowestFamiliarities = [];
    let currPriority;
    let currFam;

    const topics = await db2.query(getModuleTopics(req.params.module_id));
    
    for (const [topicIndex, topic] of topics.entries()) {

        // Add topic to probability list
        lowestFamiliarities.push({
            topic,
            topicFam: undefined,
            topicProb: undefined,
            topicCombined: undefined,
            avgFam: undefined,
            lowestFamiliarity: Infinity,
            objective: {}
        })

        lowestFamiliarities[topicIndex].topicFam = await calcTopicFamiliarity(topic, req.params.userID);

        lowestFamiliarities[topicIndex].topicProb = await calcTopicProb(req.params.module_id, topic);

        lowestFamiliarities[topicIndex].topicCombined = await calcCombined(lowestFamiliarities[topicIndex].topicFam, lowestFamiliarities[topicIndex].topicProb, req.params.userID);

        let famSum = 0;

        let objectives = await db2.query(getTopicObjectives(topic.id));
        
        for (const [i, objective] of objectives.entries()) {
            
            currFam = await calcFamiliarity(objective, req.params.userID);

            currProb = await calcProb(topic.id, objective);

            combined = await calcCombined(currFam, currProb, req.params.userID);

            if(currFam) {
                famSum += currFam;
            };

            if (currFam < lowestFamiliarities[topicIndex].lowestFamiliarity) {
                lowestFamiliarities[topicIndex].lowestFamiliarity = currFam;
                lowestFamiliarities[topicIndex].objective = objective;
            };
            
        }

        lowestFamiliarities[topicIndex].avgFam = famSum / objectives.length;

    }

    lowestFamiliarities.sort((a, b) => a.lowestFamiliarity < b.lowestFamiliarity);
    res.send(lowestFamiliarities);
    
})

app.get('/objective/:id/:userID', async (req, res) => {
    let objective = (await db2.query(getObjective(req.params.id)))[0];
    
    objective.familiarity = await calcFamiliarity(objective, req.params.userID);

    res.send(objective);
})

app.get('/topic/:id/:userID', async (req, res) => {
    let topic = (await db2.query(getTopic(req.params.id)))[0];
    
    topic.familiarity = await calcTopicFamiliarity(topic, req.params.userID);

    res.send(topic);
})

app.get('/module_objectives/:id/:userID', async (req, res) => {

    const moduleID = req.params.id;

    let objectives = await db2.query(moduleObjectives(moduleID));
        
    for (const objective of objectives) {

        // Familiarity
        fam = await calcFamiliarity(objective, req.params.userID);
        objective.familiarity = fam;


        // Probability
        prob = await calcProb(moduleID, objective);
        objective.probability = prob;

        // Combined
        objective.combined = await calcCombined(fam, prob, req.params.userID);
        
    }

    res.send(objectives);
})

app.get('/threshold/:userID', async (req, res) => {
    res.send((await calculateThreshold(1, req.params.userID)).toString());
})



/// General
app.get('/subjects', async (req, res) => {
    res.send(await db2.query(getSubjects()))
})

app.get('/user_subjects/:userID', async (req, res) => {
    res.send(await db2.query(getUserSubjects(req.params.userID)))
})

app.get('/exams', async (req, res) => {
    res.send(await db2.query(getExams))
})

app.get('/exam_subjects/:exam_id', async (req, res) => {
    res.send(await db2.query(getExamSubjects(req.params.exam_id)))
})

app.get('/subject_units/:exam_id/:subject_id', async (req, res) => {
    res.send(await db2.query(getSubjectUnits(req.params.exam_id, req.params.subject_id)))
})

app.get('/unit_modules/:unit_id', async (req, res) => {
    res.send(await db2.query(getUnitModules(req.params.unit_id)));
})

app.get('/module_topics/:module_id', async (req, res) => {
    res.send(await db2.query(getModuleTopics(req.params.module_id)));
})

app.post('/add_objective', async (req, res) => {
    db2.query(addObjectives(req.body.info, req.body.topic, req.body.notes))
        .then(result => res.send(result))
        .catch(err => res.status(400).send(err))
})

app.post('/add_question', async (req, res) => {
    
    db2.query(addQuestion(req.body.num, req.body.letter, req.body.roman, req.body.subLetter, req.body.paperID))
        .then(result => res.send(result))
        // .catch(err => res.status(400).send(err))
})

app.put('/set_objective', async (req, res) => {
    console.log(req.body)
    db2.query(setObjective(req.body.question, req.body.objective))
        .then(result => res.send(result))
        .catch(err => res.status(400).send(err))
})

app.put('/set_topic', async (req, res) => {

    db2.query(setTopic(req.body.question, req.body.topic))
        .then(result => res.send(result))
        .catch(err => res.status(400).send(err))

})

app.put('/set_user_subject', async (req, res) => {

    if(req.body.subject.isUserSub) {
        console.log("BYE")
        db2.query(addUserSub(req.body.userID, req.body.subject.id))
        .then(result => res.send(result))
        .catch(err => {
            console.log(err)
            res.status(400).send(err)
        })
    } else {
        console.log(req.body)
        db2.query(delUserSub(req.body.userID, req.body.subject.id))
        .then(result => res.send(result))
        .catch(err => {
            console.log(err)
            res.status(400).send(err)
        })
    }
    

})

app.put('/set_user', async (req, res) => {
    let userID = await db2.query(getUserID(req.body.fname, req.body.lname));
    console.log(typeof userID[0])


    db2.query(setUser(req.body))
        .then(async result => {
            if(typeof userID[0] === 'undefined') {
                userID = (await db2.query(getUserID(req.body.fname, req.body.lname)))[0].id;
                setDefaultUserValues(userID);
            }

            res.send(result);
        })
        .catch(err => res.status(400).send(err))

    
    

})

app.get('/get_userID/:fname/:lname', async (req, res) => {
    res.send(await db2.query(getUserID(req.params.fname, req.params.lname)));
})

// app.get('/topic_objectives/:topic_id', async (req, res) => {
//     db2.query(getTopicObjectives(req.params.topic_id))
//         .then(result => res.send(result));
// })

app.get('/topic_objectives/:topic_id/:userID', async (req, res) => {

    const topicID = req.params.topic_id;

    let objectives = await db2.query(getTopicObjectives(topicID));
        
    for (const objective of objectives) {

        // Familiarity
        fam = await calcFamiliarity(objective, req.params.userID);
        objective.familiarity = fam;


        // Probability
        prob = await calcProb(topicID, objective);
        objective.probability = prob;

        // Combined
        objective.combined = await calcCombined(fam, prob, req.params.userID);
        
    }

    res.send(objectives);
})

app.get('/question_topic/:quest_id', async (req, res) => {
    db2.query(getQuestTopic(req.params.quest_id))
        .then(result => res.send(result))
})

const getQuestTopic = questID => (`
SELECT topic.id, name, module
FROM question
INNER JOIN topic
ON question.topic = topic.id
WHERE question.id = ${questID}`)

const getSubjects = () => (`
SELECT id, name
FROM subject
`);

const getUserSubjects = (userID) => (`
SELECT id, name
FROM user_subject
INNER JOIN subject
ON user_subject.subject = subject.id
WHERE user=${userID}
`);

const getExamSubjects = examID => (`
SELECT id, name
FROM exam_subject
INNER JOIN subject
ON exam_subject.subject = subject.id
WHERE exam=${examID}
`);

const getSubjectUnits = (examID, subjectID) => (`
SELECT id, num, name
FROM unit
WHERE (exam=${examID} AND subject=${subjectID})
`);

const getUnitModules = unitID => (`
SELECT id, num, name
FROM module
WHERE unit=${unitID}
`);

const getModuleTopics = moduleID => (`
SELECT id, name
FROM topic
WHERE module=${moduleID}
`);

const getExams = `
SELECT *
FROM exam
`;

const addObjectives = (info, topic, notes) => (`
INSERT INTO objective (id, info, topic, is_underlined, notes) 
VALUES (NULL, '${info}', ${topic}, '', '${notes}')
`)

const addQuestion = (num, letter, roman, subLetter, paperID) => (`
INSERT INTO question (id, num, sub_letter, sub_sub_roman, sub_sub_sub_letter, pastpaper, objective, topic) 
VALUES (NULL, ${num ? "'" + num + "'" : "NULL"}, ${letter ? "'" + letter + "'" : "NULL"}, ${roman ? "'" + roman + "'" : "NULL"}, ${subLetter ? "'" + subLetter + "'" : "NULL"}, ${paperID}, NULL, NULL)
`)

const getTopicObjectives = topicID => (`
SELECT id, info
FROM objective
WHERE topic=${topicID}
`);

const setObjective = (questionID, objectiveID) => (`
UPDATE question 
SET objective = ${objectiveID} 
WHERE question.id = ${questionID}
`)

const setTopic = (questionID, topicID) => (`
UPDATE question 
SET topic = ${topicID} 
WHERE question.id = ${questionID}
`)

const addUserSub = (userID, subID) => (`
INSERT INTO user_subject (user, subject)
VALUES (${userID}, ${subID})
`)

const delUserSub = (userID, subID) => (`
DELETE FROM user_subject
WHERE user = ${userID} AND subject = ${subID}
`)

const setUser = (user) => (`
INSERT INTO user(first_name, last_name) 
SELECT "${user.fname}", "${user.lname}"
FROM dual
WHERE NOT EXISTS (
    SELECT * 
    FROM user
    WHERE first_name = "${user.fname}" AND last_name = "${user.lname}"
);
`)

const getUserID = (fname, lname) => (`
SELECT id
FROM user
WHERE first_name = "${fname}" AND last_name = "${lname}"
`)

// const maxPriority = Object.values(syncSql.mysql(config, maxPriorityScore).data.rows[0])[0];
// const calculateThreshold = (thresholdID, objective) => {
//     const counts = syncSql.mysql(config, thresholdCounts(thresholdID)).data.rows;
//     let sum = 0;
//     const numObjectives = Object.values(syncSql.mysql(config, objectiveCount(objective)).data.rows[0])[0];
//     let numBlanks = numObjectives;
//     let totalCount;
    
//     counts.forEach(count => {
//         sum += count.count * count.priority_score;
//         numBlanks -= count.count;
//         totalCount += count.count;
//     })

//     const blankID = 3;
//     const blankScore = syncSql.mysql(config, priorityScore(blankID)).data.rows[0].priority_score;

//     sum += numBlanks * blankScore;

//     let avg;
//     if(totalCount > numObjectives) {
//         avg = sum / totalCount;
//     } else {
//         avg = sum / numObjectives;
//     }
    
//     const normalised = avg / maxPriority;

//     return normalised
// }

const calculateThreshold = async (thresholdID, userID) => {
    const counts = await db2.query(thresholdCounts(thresholdID, userID));
    let sum = 0;
    // const numObjectives = Object.values((await db2.query(objectiveCount(objective)))[0]);
    // let numBlanks = numObjectives;
    // let totalCount;
    
    counts.forEach(count => {
        sum += count.count * count.priority_score;
        // numBlanks -= count.count;
        // totalCount += count.count;
    })

    // const blankID = 3;
    // const blankScore = (await db2.query(priorityScore(blankID)))[0].priority_score;

    // sum += numBlanks * blankScore;

    // let avg;
    // if(totalCount > numObjectives) {
    //     avg = sum / totalCount;
    // } else {
    //     avg = sum / numObjectives;
    // }
    
    // const normalised = avg / maxPriority;

    return sum
}


// Query Builders

const bulkDelete = config => {
    let sql = "";

    config.tables.forEach(table => {
        sql += `DELETE FROM ${table.name};\n`;
    })

    return sql;
}

const bulkInsert = (config) => {
    // Config format
    // let config = {
    //     tables: [
    //         {
    //             name: 'table1',
    //             columns: [
    //             'column1',
    //             'column2'
    //             ],
    //             values: [
    //              'value1',
    //              'value2'
    //              ]
    //         }
    //     ]
    // }

    let sql = "";

    config.tables.forEach(table => {
        sql += `INSERT INTO ${table.name} (${table.columns}) VALUES ${table.valuelists.map(list => "('" + list.join("','") + "')")};\n`;
    })

    return sql;
}

const bulkUpdate = updates => {
    // Update format
    // updates = [{"question_number":1,"sub_question_letter":"a","sub_sub_question_roman":"ii","sub_sub_sub_question":"","familiarity":"","is_completed":0}]

    let sql = ""

    updates.forEach(update => {
        sql += `UPDATE user_question SET familiarity = "${update.familiarity}", is_complete = ${update.is_complete} WHERE (user_question.question = ${update.questionID} AND user_question.user = "${userID}");\n`;
    })

    return sql;
}

const moduleObjectives = moduleID => {return `
SELECT objective.id, objective.info
FROM objective 
INNER JOIN topic 
ON (objective.topic = topic.id)
WHERE topic.module = ${moduleID};
`;} //updated

const objectiveCount = objective => {return `
SELECT COUNT(*) FROM question 
WHERE question.objective = "${objective}"
`;} //updated

const topicCount = topic => {return `
SELECT COUNT(*) FROM question 
WHERE question.topic = "${topic}"
`;} //updated

const objectiveSum = module => {return `
SELECT COUNT(*)
FROM question
INNER JOIN topic
ON question.topic = topic.id
WHERE topic.module = ${module};
`;} //updated

const objectivePriorityScore = (objective, userID) => {return `
SELECT SUM(user_familiarity.priority_score) 
FROM user_question
INNER JOIN question 
ON user_question.question = question.id
INNER JOIN user_familiarity
ON (user_question.user = user_familiarity.user AND user_question.familiarity = user_familiarity.familiarity)
WHERE (user_question.user = ${userID} AND question.objective = ${objective.id} AND is_complete = 1);
`;} //updated

const topicPriorityScore = (topic, userID) => {return `
SELECT SUM(user_familiarity.priority_score) 
FROM user_question
INNER JOIN question 
ON user_question.question = question.id
INNER JOIN user_familiarity
ON (user_question.user = user_familiarity.user AND user_question.familiarity = user_familiarity.familiarity)
WHERE (user_question.user = ${userID} AND question.topic = ${topic.id} AND is_complete = 1);
`;} //updated

const variableProportion = variable => {return `
SELECT proportion, variable
FROM user_variable
WHERE (user = 1 AND variable = ${variable})
`};

const priorityScore = (familiarityID, userID) => `
SELECT priority_score
FROM user_familiarity
WHERE (user = ${userID} AND familiarity = ${familiarityID});
`;

const thresholdCounts = (thresholdID, userID) => `
SELECT count, priority_score
FROM threshold_familiarity
INNER JOIN user_familiarity
ON threshold_familiarity.familiarity = user_familiarity.familiarity
WHERE (user = ${userID} AND threshold = ${thresholdID})
`;


// Functions
const objectiveProbability = (objective, module) => {
    let sum = syncSql.mysql(config, objectiveSum(module.id));
    let count = syncSql.mysql(config, objectiveCount(objective));

    // console.log("Count: ", countresult, " Sum: ", sumresult)
    
    if(sum.data.rows == 0) {
        return 0;
    } else {
        return (Object.values(count.data.rows[0])[0] / Object.values(sum.data.rows[0])[0]).toString();
    }
}
const topicObjectiveProbability = (objective, topic) => {
    let sum = syncSql.mysql(config, objectiveSum(topic.id));
    let count = syncSql.mysql(config, objectiveCount(objective));

    // console.log("Count: ", countresult, " Sum: ", sumresult)
    
    if(sum.data.rows == 0) {
        return 0;
    } else {
        return (Object.values(count.data.rows[0])[0] / Object.values(sum.data.rows[0])[0]).toString();
    }
}

const calcFamiliarity = async (objective, userID) => {
    const familiarThresh = await calculateThreshold(1, userID);
    const unfamiliarThresh = await calculateThreshold(2, userID);

    const priority = Object.values((await db2.query(objectivePriorityScore(objective, userID)))[0])[0];

    if (priority > 0) 
        return -priority / unfamiliarThresh;

    if (priority < 0) 
        return priority / familiarThresh;

    return 0;
}

const calcTopicFamiliarity = async (topic, userID) => {
    const objectiveCount = (await db2.query(getTopicObjectives(topic.id))).length;
    const familiarThresh = await calculateThreshold(1, userID) /* * objectiveCount */;
    const unfamiliarThresh = await calculateThreshold(2, userID) /*  * objectiveCount */;

    const priority = Object.values((await db2.query(topicPriorityScore(topic, userID)))[0])[0];

    if (priority > 0) 
        return -priority / unfamiliarThresh;

    if (priority < 0) 
        return priority / familiarThresh;

    return 0;
}

const calcProb = async (moduleID, objective) => {
    const sum = await db2.query(objectiveSum(moduleID));


    const count = await db2.query(objectiveCount(objective.id));
    
    if(sum == 0)
        return 0;
    
    return (Object.values(count[0])[0] / Object.values(sum[0])[0]).toString();
    
}

const calcTopicProb = async (moduleID, topic) => {
    const sum = await db2.query(objectiveSum(moduleID));


    const count = await db2.query(topicCount(topic.id));
    
    if(sum == 0)
        return 0;
    
    return (Object.values(count[0])[0] / Object.values(sum[0])[0]).toString();
    
}

const calcCombined = async (fam, prob, userID) => {
    
    console.log(userID)
    const proportions = await db2.query(getProportions(userID));

    const famProp = proportions.find(prop => prop.variable == "familiarity").proportion;
    const probProp = proportions.find(prop => prop.variable == "probability").proportion;

    return fam * famProp + -prob * probProp;

}

setDefaultUserValues = async (userID) => {

    // Set default user_variable's
    await db2.query(setDefaultUserVariables(userID));

    // Set default user_familiarity's
    await db2.query(setDefaultUserFamiliarities(userID));

}

setDefaultUserVariables = (userID) => (`
INSERT INTO user_variable (user, variable, proportion) 
VALUES ('${userID}', 'probability', '0.5'), ('${userID}', 'familiarity', '0.5')
`)

setDefaultUserFamiliarities = (userID) => (`
INSERT INTO user_familiarity (user, familiarity, priority_score) 
VALUES ('${userID}', '1', '-2'),
('${userID}', '2', '2'),
('${userID}', '3', '0'),
('${userID}', '4', '1')
`)