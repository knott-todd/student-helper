import { getPaperQuestions, getPastpapers } from "./services/SQLService";

const { createContext, useState, useEffect } = require("react");

export const AppContext = createContext(null);

export default ({children}) => {
    const [currSub, setCurrSub] = useState({});
    const [currUnit, setCurrUnit] = useState();
    const [userID, setUserID] = useState(JSON.parse(sessionStorage.getItem("user")));
    const [userSubs, setUserSubs] = useState([]);

    const colors = [
        "A4031F",
        "067BC2",
        "ECC30B",
        "4B7F52",
        "3F4739",
        "080357",
        "FF9F1C",
        "B95F89",
        "2EC0F9",
        "67AAF9",
        "F0386B",
        "6B2D5C"
    ]

    const setRandomAccent = () => {
        document.documentElement.style.setProperty(
            '--accent',
            `#${colors[Math.floor(Math.random() * colors.length)]}`
        );
    }

    const global = {
        currSub,
        setCurrSub,
        currUnit,
        setCurrUnit,
        userID,
        setUserID,
        setRandomAccent,
        userSubs,
        setUserSubs
    }

    useEffect(() => {
        setRandomAccent();
    }, [])

    useEffect(() => {
        if(userID){
            sessionStorage.setItem("user", JSON.stringify(userID))
        }
    }, [userID])

    useEffect(() => {
        if(currSub && currUnit && userID && currSub.id && currUnit.id){
            getPastpapers(currSub.id, currUnit, userID)
            .then(async result => {        
                for(const paper of result){
                    await getPaperQuestions(paper.id, userID)
                }
            })
        }
    }, [currSub, currUnit, userID])

    return (
        <AppContext.Provider value={global}>
            {children}
        </AppContext.Provider>
    )
}