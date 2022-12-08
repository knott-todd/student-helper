import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import {AppContext} from "./AppContext";
import DependentDropdown from "./DependentDropdown";
import Questions from "./Questions";
import { getModuleTopics, getPaperQuestions, getQuestTopic, getTopicObjectives, getUnitModules, setQuestObjective, setQuestTopic } from "./services/SQLService";
import React from "react";

// Really is a TopicSetter after reconsideration :/
const ObjectiveSetter = (props) => {

    // const unitID = props.unit;

    const [modules, setModules] = useState([]);
    const [module, setModule] = useState({});
    const [prevModule, setPrevModule] = useState({});

    const [topics, setTopics] = useState([]);
    const [topic, setTopic] = useState({});
    const [prevTopic, setPrevTopic] = useState({});

    // const [objectives, setObjectives] = useState([]);
    // const [objective, setObjective] = useState({});
    
    const [quests, setQuests] = useState([{}]);
    const [ordered, setOrdered] = useState([]);
    const [questIndex, setQuestIndex] = useState(0);

    const [prevPaperID, setPrevPaperID] = useState();

    const global = useContext(AppContext);

    useEffect(() => {

        if(quests[questIndex].id) {

            if(quests[questIndex]) {

                setPrevTopic(topic);
                setPrevModule(module);

                setTopic({id: quests[questIndex].topic});
                setModule({id: quests[questIndex].module});

                // console.log("PP:", prevTopic, topic, questIndex);

            } else {
                
                setPrevTopic(topic);
                setPrevModule(module);

                setTopic({});
                setModule({});
            }

            // getQuestTopic(quests[questIndex].id)
            //     .then(result => {
            //         if(result[0]) {

            //             setPrevTopic(topic);
            //             setPrevModule(module);

            //             setTopic({id: result[0].id});
            //             setModule({id: result[0].module});

            //             console.log("PP:", prevTopic, topic, questIndex);

            //         } else {
                        
            //             setPrevTopic(topic);
            //             setPrevModule(module);

            //             setTopic({});
            //             setModule({});
            //         }
            //     })
        }
        
    }, [quests[questIndex], questIndex]);

    useEffect(() => {
        console.log(prevTopic);
    }, [prevTopic])

    // useEffect(() => {
    //     console.log("o", objective.id)
    //     console.log(quests[questIndex].id)
    // }, [objective])

    useEffect(() => {

        getPaperQuestions(props.paperID, global.userID).then(result => {
            if(typeof result[0] !== 'undefined'){
                // setQuests(result);
                setQuests(result.sort((a, b) => {
                    if (a.num !== b.num) return a.num - b.num
                    if (a.sub_letter !== b.sub_letter) return a.sub_letter.localeCompare(b.sub_letter)
                    if (a.sub_sub_roman !== b.sub_sub_roman) return romanToNum(a.sub_sub_roman) - romanToNum(b.sub_sub_roman)
                    if (a.sub_sub_sub_letter !== b.sub_sub_sub_letter) return a.sub_sub_sub_letter.localeCompare(b.sub_sub_sub_letter)
                }))
            }
        })

    }, []);

    useEffect(() => {
        console.log(quests[questIndex]);
        if(props.unit) {
            getUnitModules(props.unit)
                .then(result => {
                    setModules(result);
                })
        }
    }, [props.unit]);

    useEffect(() => {
        if(module.id) {
            getModuleTopics(module.id)
                .then(result => {
                    setTopics(result);
                })
        }
    }, [module]);

    // useEffect(() => {
    //     if(topic.id) {
    //         getTopicObjectives(topic.id)
    //             .then(result => {
    //                 setObjectives(result);
    //             })
    //     }
    // }, [topic]);

    function romanToNum(roman) {
        if (roman === "")           return 0;
        if (roman.startsWith("x"))  return 10 + romanToNum(roman.substr(1));
        if (roman.startsWith("ix")) return 9  + romanToNum(roman.substr(2));
        if (roman.startsWith("v"))  return 5  + romanToNum(roman.substr(1));
        if (roman.startsWith("iv")) return 4  + romanToNum(roman.substr(2));
        if (roman.startsWith("i"))  return 1  + romanToNum(roman.substr(1));
        return 0;
    }

    const handleSubmit = (e) => {

        e.preventDefault();

        if(topic.id){
            console.log("JS", topic)
            setQuestTopic({question: quests[questIndex].id, topic: topic.id});

            let temp = quests;
            temp[questIndex].topic = topic.id;
            temp[questIndex].module = module.id;
            setQuests(temp);

            if(questIndex + 1 < quests.length)
                setQuestIndex(questIndex + 1);
        }

    }

    const copyPrevTopic = e => {

        e.preventDefault();
        
        if(prevTopic.id && prevModule.id) {
            setTopic(prevTopic);
            setModule(prevModule);
        }

    }

    const copyPrevModule = e => {

        e.preventDefault();
        
        if(prevModule.id) {
            setModule(prevModule);
        }

    }

    const navigateQues = (e, i) => {

        e.preventDefault();

        if(questIndex + i < quests.length && questIndex + i >= 0)
            setQuestIndex(questIndex + i);

    }

    return (
        <div>

            <p>
                {(quests[questIndex].num ? quests[questIndex].num : "No Questions Found") +
                (quests[questIndex].sub_letter ? quests[questIndex].sub_letter : "") +
                (quests[questIndex].sub_sub_roman ? quests[questIndex].sub_sub_roman : "") +
                (quests[questIndex].sub_sub_sub_letter  ? quests[questIndex].sub_sub_sub_letter  : "") + 
                (quests[questIndex].num ? ")" : "")}
            </p>

            {(quests[questIndex].num ? (
                <form>
                    <DependentDropdown setPrev={setPrevModule} currVal={module} vals={modules} setObj={setModule} required={[]} label="Module" prepend={"obj.num ? (obj.num + ' - ') : null"} />
                    <button disabled={!prevModule.id} onClick={copyPrevModule} >Copy Prev Module</button>

                    <DependentDropdown setPrev={setPrevTopic} currVal={topic} vals={topics} setObj={setTopic} required={[module.id]} label="Topic" />
                    {/* <DependentDropdown vals={objectives} setObj={setObjective} required={[module, topic.id]} label="Objective" labelColumn="info" /> */}

                    <div style={{marginTop: "10px"}}>

                        <button disabled={questIndex === 0} onClick={e => navigateQues(e, -1)}>&lt;</button>
                        
                        <div style={{display: "inline-block", verticalAlign: "middle", paddingBottom: "30px"}}>
                            
                            <button style={{display: "block", margin: "auto", width: "100px"}} disabled={!prevTopic.id} onClick={copyPrevTopic} >Copy Prev All</button>
                            <button style={{width: "100px", margin: "0px 10px"}} disabled={!topic.id} onClick={handleSubmit} >Submit</button>

                        </div>

                        <button disabled={questIndex === quests.length - 1} onClick={e => navigateQues(e, 1)}>&gt;</button>

                    </div>

                    

                    
                </form>
            ) : null)}

        </div>
    )
}

export default ObjectiveSetter;