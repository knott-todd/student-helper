import { getBuildVersion, getPaperQuestions, getPastpapers } from "./services/SQLService";

const { createContext, useState, useEffect } = require("react");

export const AppContext = createContext(null);

export default ({children}) => {
    const [currSub, setCurrSub] = useState(JSON.parse(localStorage.getItem("sub")));
    const [currUnit, setCurrUnit] = useState();
    const [currExam, setCurrExam] = useState();
    const [userID, setUserID] = useState(JSON.parse(localStorage.getItem("userID")));
    const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));
    const [userSubs, setUserSubs] = useState([]);
    const [isLightMode, setIsLightMode] = useState();
    const [pageTitle, setPageTitle] = useState();
    const [progressValue, setProgressVal] = useState();
    const [singleProgressValue, setSingleProgressVal] = useState();
    const [accent, setAccent] = useState('brown');

    const setProgressValue = val => {
        setSingleProgressVal();
        setProgressVal(val);
    }

    const setSingleProgressValue = val => {
        setProgressVal();
        setSingleProgressVal(val);
    }

    const cacheVariables = {
        sub: currSub,
        userID,
        user
    }

    const cacheSetCommands = {
        setCurrSub: "",
        setUserID: "",
        setUser: "",
        setCurrExam: "",
        setUserSubs: "[]"
    }

    const clearCache = () => {
        Object.keys(cacheSetCommands).forEach(key => {
            eval(`${key}(${cacheSetCommands[key]})`)
        })
    }

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
        let _accent;
        if(isLightMode){
            _accent = lightmodeAccentColors[Math.floor(Math.random() * lightmodeAccentColors.length)];
        } else{
            _accent = darkmodeAccentColors[Math.floor(Math.random() * darkmodeAccentColors.length)];
        }
        setAccent(_accent);
        document.documentElement.style.setProperty(
            '--accent',
            `#${_accent}`
        );
    }

    const global = {
        clearCache,
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
        setIsLightMode,
        currExam,
        setCurrExam,
        pageTitle,
        setPageTitle,
        user,
        setUser,
        progressValue,
        setProgressValue,
        singleProgressValue,
        setSingleProgressValue,
        accent,
        setAccent
    }

    useEffect(() => {
        setRandomAccent();
    }, [])

    useEffect(() => {
        for (const item in cacheVariables) {

            if(cacheVariables[item]) {
                console.log(`${item}`, JSON.stringify(cacheVariables[item]))
                localStorage.setItem(`${item}`, JSON.stringify(cacheVariables[item]))
            }

        }
    }, [cacheVariables])

    useEffect(() => {
        if(currSub && currExam && userID && currSub.id){
            getPastpapers(currSub.id, currExam, userID)
            .then(async result => {        
                for(const paper of result){
                    await getPaperQuestions(paper.id, userID)
                }
            })
        }
    }, [currSub, currExam, userID])

    useEffect(() => {
        // getBuildVersion()
        //     .then(result => {

        //         let version = result.version;

        //         const last_version = localStorage.getItem('version');
        //         if(last_version !== version) {
        //             localStorage.setItem('version', version);
        //             console.log("Updated! New version: ", version)
        //             // caches.keys().then((names) => {
        //             //     names.forEach((name) => {
        //             //         caches.delete(name);
        //             //     });
        //             // });
        //         }
                
        //     })
        
    }, [])

    return (
        <AppContext.Provider value={global}>
            {children}
        </AppContext.Provider>
    )
}