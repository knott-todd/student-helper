import { getPaperQuestions, getPastpapers } from "./services/SQLService";

const { createContext, useState, useEffect } = require("react");

export const AppContext = createContext(null);

export default ({children}) => {
    const [currSub, setCurrSub] = useState({});
    const [currUnit, setCurrUnit] = useState();
    const [userID, setUserID] = useState(JSON.parse(sessionStorage.getItem("user")));
    const [userSubs, setUserSubs] = useState([]);
    const [isLightMode, setIsLightMode] = useState();

    const lightmodeAccentColors = [
        "A4031F",
        "067BC2",
        "ECC30B",
        "4B7F52",
        "080357",
        "FF9F1C",
        "B95F89",
        "2EC0F9",
        "67AAF9",
        "F0386B",
        "6B2D5C",
        "99D5C9"
    ]
    const darkmodeAccentColors = [
        "067BC2",
        "ECC30B",
        "FF9F1C",
        "B95F89",
        "2EC0F9",
        "67AAF9",
        "F0386B",
        "C9F0FF",
        "F75C03",
        "5F4BB6",
        "A6D49F",
        "99D5C9"
    ]

    const setRandomAccent = () => {
        if(isLightMode){
            document.documentElement.style.setProperty(
                '--accent',
                `#${lightmodeAccentColors[Math.floor(Math.random() * lightmodeAccentColors.length)]}`
            );
        } else{
            document.documentElement.style.setProperty(
                '--accent',
                `#${darkmodeAccentColors[Math.floor(Math.random() * darkmodeAccentColors.length)]}`
            );
        }
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
        setUserSubs,
        isLightMode,
        setIsLightMode
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