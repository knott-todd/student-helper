import { useQuery } from '@tanstack/react-query';
import { getAllModules, getAllTopics, getExams, getExamSubjects, getUnits } from '../services/SQLService';

const fetchSyllabusData = async () => {
    const exams = await getExams();

    const subjects = (
        await Promise.all(
            exams.map(async (exam) => {
                const subs = await getExamSubjects(exam.id);
                return subs.map(sub => ({ ...sub, exam_id: exam.id }));
            })
        )
    ).flat();

    const units = (
        await getUnits()
    ).flat();

    const modules = (
        await getAllModules()
    ).flat();

    const topics = (
        await getAllTopics()
    ).flat();

    return { exams, subjects, modules, topics, units };
};

export const useSyllabusData = () => {
    return useQuery({
        queryKey: ['syllabus'],
        queryFn: fetchSyllabusData,
        staleTime: 1000 * 60 * 5,
    });
};
