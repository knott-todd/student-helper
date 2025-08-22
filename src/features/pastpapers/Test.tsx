import React, { useState, useEffect, useContext } from "react";
import { getPastpapers } from "../../services/SQLService";
import { Link } from "react-router-dom";
import '../../CSS/global.css';
import '../../CSS/Test.css';
import { AppContext } from "../../AppContext";
import SingleProgress from "../../SingleProgress";
import { useUser } from "../auth/UserContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";

// Define paper type based on your backend shape
interface Topic {
    name: string;
}

interface Paper {
    id: number;
    num: string;
    year: string;
    is_complete: boolean;
    areTopicsLinked?: boolean;
    areAnyTopicsLinked?: boolean;
    areQuestionsOutlined?: boolean;
    completeAmount?: number;
    topics: Topic[];
    [key: string]: any; // For dynamic badge conditions
}

interface Badge {
    icon: string;
    enabledCondition?: string;
    semiCondition?: string;
    description: string;
}

const Test: React.FC = () => {

    const { currSub, currExam, paperType, setPaperType, setPageTitle } = useContext(AppContext);

    const { user, loading } = useUser();

    const queryClient = useQueryClient();

    useEffect(() => {
        setPageTitle("Test");
    }, [setPageTitle]);

    const { data: papers = [], isLoading: papersLoading, error: papersError } = useQuery<Paper[] | Error>({
        queryKey: ['papers', currSub?.id, currExam, user?.user_id],
        queryFn: async () => {
            console.log("FETCHIGN PAPERS");
            const papers =  await getPastpapers(currSub!.id, currExam!, user!.user_id);
            console.log("PAPERS: ", papers);
            return papers;
        },
        enabled: !!currSub && !!currExam && !!user?.user_id && !loading,
        initialData: () => queryClient.getQueryData(['papers', currSub?.id, currExam, user?.user_id]),
    });

    useEffect(() => {
        console.log(papers);
    }, [papers]);

    const badges: Badge[] = [
        {
            icon: "T",
            enabledCondition: "areTopicsLinked",
            description: "All topics linked"
        },
        {
            icon: "T",
            semiCondition: "areAnyTopicsLinked",
            description: "Some topics linked"
        },
        {
            icon: "Q",
            enabledCondition: "areQuestionsOutlined",
            description: "Questions outlined"
        }
    ];


    return (
        papersLoading ? <div>Loading papers...</div> :
        loading ? <div>Loading user data...</div> :
        !currSub || !currExam ? <div className="no-content-text">Please select your subjects and exam on the <a href="/profile">Profile</a> page to view past papers.</div> :
        <div className="Test">
            <div className="body-div">
                <div className="test-top">
                    <div className="badge-key">
                        {badges.map((badge, index) => (
                            <span key={index} style={{ paddingRight: "10px", cursor: "default" }}>
                                <p style={{ display: "inline" }} className={`badge topic-badge ${badge.enabledCondition ? "badge-enabled" : (badge.semiCondition ? "badge-semi" : "badge-disabled")}`}>
                                    {badge.icon} <span style={{ fontWeight: 300, opacity: 1 }}>{badge.description}</span>
                                </p>
                            </span>
                        ))}
                    </div>

                    <label>
                        Paper
                        <select
                            className="dropdown"
                            value={paperType}
                            style={{ marginLeft: "5px" }}
                            onChange={e => setPaperType(Number(e.target.value))}
                        >
                            <option key={1} value={1}>{1}</option>
                            <option key={2} value={2}>{2}</option>
                        </select>
                    </label>
                </div>

                {Array.isArray(papers) ? (
                    papers.filter(paper => paper.num === paperType.toString()).length > 0 ? (
                        <div className="pastpapers list-container">
                            {papers
                                .filter(paper => paper.num === paperType.toString())
                                .sort((a, b) => Number(b.year.match(/\d{4}/)?.[0] || 0) - Number(a.year.match(/\d{4}/)?.[0] || 0))
                                .sort((a, b) => Number(b.areTopicsLinked) - Number(a.areTopicsLinked))
                                .sort((a, b) => Number(b.areAnyTopicsLinked) - Number(a.areAnyTopicsLinked))
                                .sort((a, b) => Number(a.is_complete) - Number(b.is_complete))
                                .map(paper => (
                                    <Link to={`pastpaper/${paper.id}`} className={`list-link test-paper ${paper.is_complete ? "complete" : ""}`} key={paper.id}>
                                        <div className="head-badge-wrapper" style={{ display: "block" }}>
                                            <h2 className="paper-year-head" style={{ display: "inline-block", verticalAlign: "top", margin: 0 }}>{paper.year}</h2>
                                            <div className="badges-wrapper">
                                                {Array(badges.find(badge => (paper[badge.semiCondition || ""] || paper[badge.enabledCondition || ""])) || {}).map(() => (
                                                    <p className={`badge topic-badge ${paper.areTopicsLinked ? "badge-enabled" : (paper.areAnyTopicsLinked ? "badge-semi" : "badge-disabled")}`}>T</p>
                                                ))}
                                            </div>
                                        </div>

                                        <SingleProgress value={paper.completeAmount || 0} />

                                        <div className="whats-inside">
                                            <p style={{ fontWeight: "bold", margin: 0 }}>What's inside:</p>
                                            <div className="topic-preview-wrapper">
                                                {paper.topics.map((topic, i) => (
                                                    <p
                                                        key={i}
                                                        className="paper-topic-preview"
                                                        style={{ paddingBottom: (i === paper.topics.length - 1 ? "20px" : "0px") }}
                                                    >
                                                        {topic.name}
                                                    </p>
                                                ))}
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                        </div>
                    ) : (
                        currSub ? (<p className="no-content-text">Sorry! We don't have any {currSub.name} P{paperType}'s yet.</p>) : ""
                    )
                ) : (
                    <p className="no-content-text">Failed to load papers.</p>
                )}
            </div>
        </div>
    );
};

export default Test;
