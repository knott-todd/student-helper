import React, { Component, useEffect } from 'react';
import { useState } from 'react';
import { useContext } from 'react';
import {AppContext} from './AppContext';
import { getModules, getPastpaper, getTopicQuestions, getTopics } from './services/SQLService';
import './CSS/Home.css'

const Home = () => {

    // Local variables
    const [topics, setTopics] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currTopic, setCurrTopic] = useState();

    // Global variables
    const global = useContext(AppContext);

    useEffect(() => {
        // Defined as func cause useEffect cant be async
        const fetchData = async () => {

            if(global.userID && global.currSub && global.currExam) {
        
                // Get subject modules
                const modules = await getModules(global.currSub.id, global.currExam, global.userID);
                console.log(await modules);
        
                // Get all user topics
                let temp = [];

                await Promise.all(modules.map(async modulePackage => {
                    
                    const topicsPackage = await getTopics(modulePackage.module.id, global.userID);

                    temp = temp.concat(topicsPackage.map(_topic => ({..._topic, module: modulePackage.module.number, isPaperLoaded: false})));
                    
                    
                }));

                setTopics(temp)
                setIsLoading(false);
                console.log("loaded", topics, temp)
    
            }

        }

        fetchData();

    }, [global.userID, global.currSub, global.currExam])

    // Find a not-completed or unfamiliar pastpaper question for the topic
    const loadTopicPaper = async topicID => {

        const topicQuests = await getTopicQuestions(topicID, global.userID);

        let quest;

        if(quest = topicQuests.find(quest => !quest.is_complete)) {

            let temp = [...topics];
            let tempTopic = temp.find(topicPackage => topicPackage.topic.id === topicID);

            tempTopic.paper = await getPastpaper(quest.paper_id);
            tempTopic.questions = topicQuests.filter(_quest => _quest.paper_id === quest.paper_id);
            tempTopic.isPaperLoaded =  true;

            setTopics(temp);

        }
        
    }

    const handleTopicClick = topicID => {
        
        if(currTopic === topicID) setCurrTopic()
        else setCurrTopic(topicID)
        
        if(!topics.find(topicPackage => topicPackage.topic.id === topicID).isPaperLoaded)
            loadTopicPaper(topicID)

    }
    
    return (
        <div className='body-div'>
            {isLoading ? "Loading..." :
            (
                <div>
                    <div className='home-hero'>
                        <h1>Hey Olusanya,</h1>
                        <h3>Let's do some <span className='suggested-topic'>{topics.reduce((prev, curr) => (prev.topicFam > curr.topicFam ? curr : prev), {topicFam: Infinity}).topic.name}</span> practice</h3>
                        <button className='home-hero-button' onClick={e => {let topicID = topics.reduce((prev, curr) => (prev.topicFam > curr.topicFam ? curr : prev), {topicFam: Infinity}).topic.id; loadTopicPaper(topicID); document.getElementById(`topic-${topicID}`).scrollIntoView({ behavior: "smooth", block: "center"}); setCurrTopic(topicID)}}>Okay</button>
                    </div>

                    <div className='topics-wrapper'>
                        {topics
                        .sort((a, b) => !a.topicFam || !b.topicFam ? (a.topicFam ? 1 : -1) : a.topicFam - b.topicFam)
                        .map(topicPackage => (
                            <div id={`topic-${topicPackage.topic.id}`} key={topicPackage.topic.id} className='topic-wrapper' onClick={e => handleTopicClick(topicPackage.topic.id)}>

                                <h4 className={`topic-top-peek ${topicPackage.topic.id === currTopic ? "peek" : "hide"}`}>M{topicPackage.module}</h4>

                                <h2 className='topic-head'><span className='topic-name'>{topicPackage.topic.name}</span> &#x2022; {Math.round(topicPackage.topicFam * 100, 0)}%</h2>

                                <div className={`topic-bottom-peek ${topicPackage.topic.id === currTopic ? "peek" : "hide"}`}>
                                    {!topicPackage.isPaperLoaded ? "Loading pastpaper..." : (
                                        <div className='topic-paper'>
                                            <h3>{topicPackage.paper.year}</h3>
                                            {topicPackage.questions.map(quest => (
                                                <div>
                                                    {quest.num}{quest.sub_letter}{quest.sub_roman}{quest.sub_sub_letter}
                                                </div>
                                            ))}
                                            <iframe src={topicPackage.paper.pdf_link} width="99%" height="100%" style={{height: "69vh"}}></iframe>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                </div>

            )}
            
        </div>
    );
}

export default Home;