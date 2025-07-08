import { useEffect, useState } from "react";
import Dropdown from "../../components/Dropdown";
import ExamDropdown from "../../components/ExamDropdown";
import MultiSelect from "../../components/MultiSelect";
import PrimaryButton from "../../components/PrimaryButton";
import { useSyllabusData } from "../../hooks/useSyllabusData";
import { createQuizAttempt, getCats } from "./services/SQLService";

const QuizBuilder = () => {
    // Requires data:
    // exams, subjects, units, modules, topics
    // Ideally, would be taken from a custom hook that returns isLoading, error, and data
    const { data, isLoading, error } = useSyllabusData();

    // Track selected exam, module, topic, # of questions (form)
    const [selectedExamID, setSelectedExamID] = useState(null);
    const [selectedSubjectID, setSelectedSubjectID] = useState(null);
    const [selectedUnitID, setSelectedUnitID] = useState(null);
    const [selectedModuleID, setSelectedModuleID] = useState(null);
    const [selectedTopicIDs, setSelectedTopicIDs] = useState([]);
    const [numQuestions, setNumQuestions] = useState(10);

    useEffect(() => {
        if (isLoading || error || !data) return;
        console.log("Exams:", data.exams);
        console.log("Subjects:", data.subjects);
        console.log("Modules:", data.modules);
        console.log("Topics:", data.topics);
        console.log("Units:", data.units);



    }, [data]);

    useEffect(() => {
        if (isLoading || error || !data || !data.units) return;
        
        const unit = data.units.find(unit => 
            Number(unit.exam) === selectedExamID && Number(unit.subject) === selectedSubjectID
        );

        setSelectedUnitID(unit?.id || '');
    }, [selectedExamID, selectedSubjectID, data]);

    // On submit, send data to backend to generate quiz
    const handleSubmit = async () => {

        if (selectedTopicIDs.length === 0) {
            alert("Please select at least one topic.");
            return;
        }

        
        try {
            console.log(selectedTopicIDs);
            console.log(numQuestions);
            await createQuizAttempt({
                userID: 1,
                topicIDs: selectedTopicIDs,
                numQuestions: numQuestions
            });
        } catch (err) {
            console.error(err);
        }
    }

    if (isLoading) return <p>Loading...</p>;
    if (error) return <p>Error loading syllabus data: {error.message}</p>;

    return (
        <>
        {/* Dropdown: Exam selector */}
        <ExamDropdown
            exams={data.exams}
            selectedExam={selectedExamID}
            onChange={(e) => setSelectedExamID(Number(e.target.value))}
        />

        {/* Dropdown: Subject selector */}
        <Dropdown
            disabled={!selectedExamID}
            dataArray={data.subjects.filter(sub => sub.exam_id === selectedExamID)}
            value={selectedSubjectID}
            onChange={(e) => setSelectedSubjectID(Number(e.target.value))}
            keyOn="id"
            textOn="name"
        />

        {/* Dropdown: Module selector */}
        <Dropdown
            disabled={!selectedUnitID}
            dataArray={data.modules.filter(mod => mod.unit === selectedUnitID)}
            value={selectedModuleID}
            onChange={(e) => setSelectedModuleID(Number(e.target.value))}
            keyOn="id"
            textOn="name"
        />

        {/* Multiselect: Topic selector */}
        <MultiSelect
            disabled={!selectedModuleID}
            dataArray={data.topics.filter(topic => topic.module === selectedModuleID)}
            selectedIDs={selectedTopicIDs}
            keyOn="id"
            labelOn="name"
            onChange={(e) => {
                const topicID = parseInt(e.target.dataset.id);

                setSelectedTopicIDs(prev =>
                    e.target.checked
                        ? [...prev, topicID]
                        : prev.filter(id => id !== topicID)
                );
            }}
        />

        {/* Num questions */}
        <label htmlFor="numQuestions">
            Number of Questions: {numQuestions}
        </label>
        <input
            type="range"
            id="numQuestions"
            min={1}
            max={20}
            step={1}
            value={numQuestions}
            onChange={(e) => setNumQuestions(Number(e.target.value))}
        />

        {/* Submit button */}
        <PrimaryButton 
            onClick={handleSubmit}
            disabled={selectedTopicIDs.length === 0 || isLoading}
        >
            Submit
        </PrimaryButton>
        
        </>
    )
}

export default QuizBuilder;