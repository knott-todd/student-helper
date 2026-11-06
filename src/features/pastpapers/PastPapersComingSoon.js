import { useContext, useEffect } from "react";
import { AppContext } from "../../AppContext";
import EmptyState from "../../components/EmptyState";

export const PAST_PAPERS_COMING_SOON = "Pure Maths papers coming soon";

// Shown for the Past Papers tab and every old paper, mark scheme and
// question URL until Pure Maths papers are loaded.
const PastPapersComingSoon = () => {
    const global = useContext(AppContext);

    useEffect(() => {
        global.setPageTitle("Past Papers");
    }, []);

    return (
        <div className="body-div">
            <EmptyState>{PAST_PAPERS_COMING_SOON}</EmptyState>
        </div>
    );
};

export default PastPapersComingSoon;
