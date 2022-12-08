const mysql = require('mysql');
// const { config } = require('nodemon');
const syncSql = require('sync-sql');

/*
NEXT TO DO: Calculate familiarity score 
1. Implement threshold count tables in db
2. Retrieve unfamiliar and familiar threshold counts for each familiarity tag
3. Calculate familiar and unfamiliar thresholds
4. For each objective calculate familiarity using thresholds 
*/

// Configure SQL connection
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
const userID = 1;
const getUserPapers = `
SELECT user_pastpaper.pastpaper, user_pastpaper.is_complete
FROM user 
INNER JOIN user_pastpaper 
ON user.id = user_pastpaper.user 
INNER JOIN pastpaper 
ON pastpaper.id = user_pastpaper.pastpaper
WHERE user.id = ${userID}
ORDER BY user_pastpaper.is_complete;
`; // updated

// const exam = "CAPE";
// const subject = "Physics";
// const pastpaperYear = "2016";

const gPastpaperID = 1;
const getPastPaper = pastpaperID => `
SELECT pdf_link 
FROM pastpaper 
WHERE pastpaper.id = ${pastpaperID};
`; //updated
const getMarkScheme = `
SELECT markscheme_link 
FROM pastpaper 
WHERE pastpaper.id = ${gPastpaperID};
`; //updated

const getPaperQuestions = `
SELECT num,sub_letter,sub_sub_roman,sub_sub_sub_letter,familiarity,is_complete
FROM user_question
INNER JOIN question
ON user_question.question = question.id
WHERE (question.pastpaper = ${gPastpaperID} AND user_question.user = ${userID});
`; //updated

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





/// Tracking
let gObjective = 4;
const unitID = 1;

const getModules = `
SELECT module.id, exam, subject, unit.num AS unit_number, module.num AS number
FROM module
INNER JOIN unit
ON module.unit = unit.id
WHERE unit = ${unitID};
`; //updated

const maxPriorityScore = `
SELECT MAX(priority_score) 
FROM user_familiarity
WHERE user = "${userID}";
`; //updated







// Setup express

// Routes
// app.get('/', (req, res) => {
//     const sql = 'SELECT * FROM user';

//     db.query(sql, (err, result) => {
//         if (err) res.send(err);
//         res.send(result);
//     });
// })

// app.get('/test', (req, res) => {
//     const config = {
//         tables: [
//             {
//                 name: 'user',
//                 columns: [
//                     'first_name',
//                     'last_name',
//                     'email'
//                 ],
//                 valuelists: [
//                     ['Olusanya', 'Todd', 'o@gmail.com'],
//                     ['Jerry', 'Rice', 'j@gmail.com']
//                 ]
//             },
//             {
//                 name: 'subject',
//                 columns: [
//                     'subject_name'
//                 ],
//                 valuelists: [
//                     ['Physics'],
//                     ['Biology']
//                 ]
//             },
//             {
//                 name: 'unit',
//                 columns: [
//                     'subject',
//                     'number',
//                     'name'
//                 ],
//                 valuelists: [
//                     ['955d3f27-cfd1-11ec-9cb6-089798d989df', 1, ''],
//                     ['955d3f27-cfd1-11ec-9cb6-089798d989df', 2, '']
//                 ]
//             },
//             {
//                 name: 'module',
//                 columns: [
//                     'subject',
//                     'unit_number',
//                     'number',
//                     'name'
//                 ],
//                 valuelists: [
//                     ['955d3f27-cfd1-11ec-9cb6-089798d989df', 1, 1, "Physics of the atom"],
//                     ['955d3f27-cfd1-11ec-9cb6-089798d989df', 1, 2, "Polymers"],
//                     ['955d3f27-cfd1-11ec-9cb6-089798d989df', 1, 3, "Bombs and stuff"]
//                 ]
//             },
//             {
//                 name: 'topic',
//                 columns: [
//                     'subject',
//                     'unit_number',
//                     'module_number',
//                     'topic_title'
//                 ],
//                 valuelists: [
//                     ['955d3f27-cfd1-11ec-9cb6-089798d989df', 1, 1, 'Atomic potential energy'],
//                     ['955d3f27-cfd1-11ec-9cb6-089798d989df', 1, 1, 'Momentum of an atom']
//                 ]
//             }
//         ]
//     }

//     let sql = bulkDelete(config);
//     sql += bulkInsert(config);

//     console.log(sql);

//     db.query(sql, (err, result) => {
//         if (err) res.send(err);
//         res.send(result);
//     });

// })

/// Testing
// app.get('/userpapers', (req, res) => {
//     db.query(getUserPapers, (err, result) => {
//         if (err) res.send(err);
//         res.send(result);
//     });
// })


const getPastpapers = pastpaperID => {
    return new Promise((resolve, reject) => {
        db.query(getPastPaper(pastpaperID), (err, result) => {
            if (err) return reject(err);
            resolve (__dirname + result[0].pdf_link);
        });
    })
    
}

// app.get('/markscheme', (req, res) => {
//     db.query(getMarkScheme, (err, result) => {
//         if (err) res.send(err);
//         res.sendFile(__dirname + result[0].pdf_link);
//     });
// })

// app.get('/questions', (req, res) => {
//     db.query(getPaperQuestions, (err, result) => {
//         if (err) res.send(err);
//         res.send(result);
//     });
// })

// app.get('/update', (req, res) => {
//     let updates = [{"questionID": 1,"familiarity":"Familiar","is_complete":1}];
//     let sql = bulkUpdate(updates);

//     db.query(sql, (err, result) => {
//         if (err) res.send(err);
//         res.send(result);
//     });
// })

/// Tracking
// app.get('/score', (req, res) => {
//     db.query(objectivePriorityScore(gObjective), (err, score) => {
//         if (err) res.send(err);

//         db.query(maxPriorityScore, (maxErr, maxScore) => {
//             if (err) res.send(err);

//             res.send((Object.values(score[0])[0] / Object.values(maxScore[0])[0]).toString())

//         })

//     });
// })

const config = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'student_helper'
}

// app.get('/probability', (req, res) => {
//     let highestProbs = [];
//     let currProb;

//     let modules = syncSql.mysql(config, getModules);

//     modules.data.rows.forEach((module, moduleIndex) => {

//         // Add module to probability list
//         highestProbs.push({
//             module,
//             highestProb: 0,
//             objective: {}
//         })


//         let objectives = syncSql.mysql(config, moduleObjectives(module));
        
//         console.log(objectives)
        
//         objectives.data.rows.forEach(objective => {

//             let sum = syncSql.mysql(config, objectiveSum(module));


//             let count = syncSql.mysql(config, objectiveCount(objective.id));

            
//             // console.log("Count: ", countresult, " Sum: ", sumresult)
            
//             if(sum.data.rows == 0) {
//                 currProb = 0;
//             } else {
//                 currProb = (Object.values(count.data.rows[0])[0] / Object.values(sum.data.rows[0])[0]).toString();
//             }

//             if (currProb > highestProbs[moduleIndex].highestProb) {
//                 highestProbs[moduleIndex].highestProb = currProb;
//                 highestProbs[moduleIndex].objective = objective;
//             };
            
//         })

//     })

//     highestProbs.sort((a, b) => a.highestProb > b.highestProb);
//     res.send(highestProbs);
    

//     // db.query(getModules, (moduleErr, modules) => {
//     //     if (moduleErr) res.send(moduleErr)
        
//     //     modules.forEach((module, moduleIndex) => {

//     //         // Add module to probability list
//     //         highestProbs.push({
//     //             module,
//     //             highestProb: 0,
//     //             objective: {}
//     //         })

//     //         let objectives = syncSql.mysql(config, moduleObjectives(module));
            
//     //         // Begin query
//     //         db.query(moduleObjectives(module), (moErr, objectives) => {
//     //             if(moErr) res.send(moErr);

//     //             let objectiveIndex;

//     //             console.log(objectives)
                
//     //             // Normal response
//     //             objectives.forEach((objective, objIndex) => {

//     //                 objectiveIndex = objIndex;

//     //                 let sum = syncSql.mysql(config, objectiveSum(module));

//     //                 db.query(objectiveSum(module), (sumErr, sumresult) => {
//     //                     if (sumErr) res.send(sumErr);

//     //                     let count = syncSql.mysql(config, objectiveCount(objective));

//     //                     db.query(objectiveCount(objective), (countErr, countresult) => {
//     //                         if (countErr) res.send(countErr);

                            
//     //                         // console.log("Count: ", countresult, " Sum: ", sumresult)
                            
//     //                         if(sumresult == 0) {
//     //                             currProb = 0;
//     //                         } else {
//     //                             currProb = (Object.values(countresult[0])[0] / Object.values(sumresult[0])[0]).toString();
//     //                         }

//     //                         if (currProb > highestProbs[moduleIndex].highestProb) {
//     //                             highestProbs[moduleIndex].highestProb = currProb;
//     //                             highestProbs[moduleIndex].objective = objective;
//     //                         };

//     //                         // console.log(highestProbs);

//     //                         // console.log(objective.id, module.number);
//     //                         // console.log((Object.values(countresult[0])[0] / Object.values(sumresult[0])[0]).toString());
                            
//     //                         console.log("O: ", objectiveIndex + 1, objectives.length);
//     //                         console.log("M: ", moduleIndex + 1, modules.length);
//     //                         if (objectiveIndex + 1 == objectives.length && moduleIndex + 1 == modules.length){
//     //                             console.log("Yeah")

//     //                             highestProbs.sort((a, b) => a.highestProb > b.highestProb);

//     //                             res.send(highestProbs);

//     //                         }
//     //                     });

//     //                 });
                    
//     //             })

//     //             // Handle response if the last module has no objectives
//     //             if (objectives.length == 0 && moduleIndex + 1 == modules.length) {

//     //                 highestProbs.sort((a, b) => a.highestProb > b.highestProb);

//     //                 res.send(highestProbs);

//     //             }
//     //         })

//     //     })

//     // })
    
// })

// app.get('/combined', (req, res) => {
//     let highestCombines = [];
//     let currProb;
//     let currPriority;
//     let currCombined;

//     let modules = syncSql.mysql(config, getModules);

//     const probProportion = syncSql.mysql(config, variableProportion("probability")).data.rows[0].proportion;
//     const priorityProportion = syncSql.mysql(config, variableProportion("priority")).data.rows[0].proportion;

//     console.log("HII", probProportion, priorityProportion);

//     modules.data.rows.forEach((module, moduleIndex) => {

//         // Add module to probability list
//         highestCombines.push({
//             module,
//             highestCombined: 0,
//             objective: {}
//         })


//         let objectives = syncSql.mysql(config, moduleObjectives(module));
        
//         console.log(objectives)
        
//         objectives.data.rows.forEach(objective => {

//             currProb = objectiveProbability(objective, module);
//             currPriority = Object.values(syncSql.mysql(config, objectivePriorityScore(objective)).data.rows[0])[0];
            
//             currCombined = currProb * probProportion + currPriority * priorityProportion;

//             if (currCombined > highestCombines[moduleIndex].highestCombined) {
//                 highestCombines[moduleIndex].highestCombined = currCombined;
//                 highestCombines[moduleIndex].objective = objective;
//             };
            
//         })

//     })

//     highestCombines.sort((a, b) => a.highestCombined > b.highestCombined);
//     res.send(highestCombines);
    
// })

// app.get('/familiarity', (req, res) => {
//     let highestFamiliarities = [];
//     let currPriority;
//     let currFam;

//     let modules = syncSql.mysql(config, getModules);

//     modules.data.rows.forEach((module, moduleIndex) => {

//         // Add module to probability list
//         highestFamiliarities.push({
//             module,
//             highestFamiliarity: 0,
//             objective: {}
//         })


//         let objectives = syncSql.mysql(config, moduleObjectives(module));
        
//         objectives.data.rows.forEach(objective => {
            
//             const familiarThresh = calculateThreshold(1, objective.id);
//             const unfamiliarThresh = calculateThreshold(2, objective.id);

//             console.log(familiarThresh);

//             currPriority = Object.values(syncSql.mysql(config, objectivePriorityScore(objective)).data.rows[0])[0] / maxPriority;
            
//             currFam = 1 - (currPriority - familiarThresh) / (unfamiliarThresh - familiarThresh);

//             console.log(currFam)

//             if (currFam > highestFamiliarities[moduleIndex].highestFamiliarity) {
//                 highestFamiliarities[moduleIndex].highestFamiliarity = currFam;
//                 highestFamiliarities[moduleIndex].objective = objective;
//             };
            
//         })

//     })

//     highestFamiliarities.sort((a, b) => a.highestFamiliarity > b.highestFamiliarity);
//     res.send(highestFamiliarities);
    
// })

// app.get('/threshold', (req, res) => {
//     res.send(calculateThreshold(1, gObjective).toString());
// })

const maxPriority = Object.values(syncSql.mysql(config, maxPriorityScore).data.rows[0])[0];
const calculateThreshold = (thresholdID, objective) => {
    const counts = syncSql.mysql(config, thresholdCounts(thresholdID)).data.rows;
    let sum = 0;
    const numObjectives = Object.values(syncSql.mysql(config, objectiveCount(objective)).data.rows[0])[0];
    let numBlanks = numObjectives;
    let totalCount;
    
    counts.forEach(count => {
        sum += count.count * count.priority_score;
        numBlanks -= count.count;
        totalCount += count.count;
    })

    const blankID = 3;
    const blankScore = syncSql.mysql(config, priorityScore(blankID)).data.rows[0].priority_score;

    sum += numBlanks * blankScore;

    let avg;
    if(totalCount > numObjectives) {
        avg = sum / totalCount;
    } else {
        avg = sum / numObjectives;
    }
    
    const normalised = avg / maxPriority;

    return normalised
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

const moduleObjectives = module => {return `
SELECT objective.id 
FROM objective 
INNER JOIN topic 
ON (objective.topic = topic.id)
WHERE topic.module = ${module.id};
`;} //updated

const objectiveCount = objective => {return `
SELECT COUNT(*) FROM question 
WHERE question.objective = "${objective}"
`;} //updated

const objectiveSum = module => {return `
SELECT COUNT(*)
FROM question
INNER JOIN objective 
ON question.objective = objective.id
INNER JOIN topic
ON objective.topic = topic.id
WHERE topic.module = ${module.id};
`;} //updated

const objectivePriorityScore = objective => {return `
SELECT AVG(user_familiarity.priority_score) 
FROM user_question
INNER JOIN question 
ON user_question.question = question.id
INNER JOIN user_familiarity
ON (user_question.user = user_familiarity.user AND user_question.familiarity = user_familiarity.familiarity)
WHERE (user_question.user = ${userID} AND question.objective = ${objective.id});
`;} //updated

const variableProportion = variable => {return `
SELECT proportion, variable
FROM user_variable
WHERE (user = 1 AND variable = ${variable})
`};

const priorityScore = familiarityID => `
SELECT priority_score
FROM user_familiarity
WHERE (user = ${userID} AND familiarity = ${familiarityID});
`;

const thresholdCounts = thresholdID => `
SELECT count, priority_score
FROM threshold_familiarity
INNER JOIN user_familiarity
ON threshold_familiarity.familiarity = user_familiarity.familiarity
WHERE (user = ${userID} AND threshold = ${thresholdID})
`;


// Functions
const objectiveProbability = (objective, module) => {
    let sum = syncSql.mysql(config, objectiveSum(module));
    let count = syncSql.mysql(config, objectiveCount(objective));

    // console.log("Count: ", countresult, " Sum: ", sumresult)
    
    if(sum.data.rows == 0) {
        return 0;
    } else {
        return (Object.values(count.data.rows[0])[0] / Object.values(sum.data.rows[0])[0]).toString();
    }
}

module.exports = getPastpapers
