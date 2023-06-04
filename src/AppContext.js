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
    const [examSubs, setExamSubs] = useState([]);
    const [paperType, setPaperType] = useState(2);

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
        [350, "96%", "33%"],
        [203, "94%", "39%"],
        [49, "91%", "48%"],
        [128, "26%", "40%"],
        [244, "93%", "18%"],
        [35, "100%", "55%"],
        [332, "39%", "55%"],
        [197, "94%", "58%"],
        [212, "92%", "69%"],
        [343, "86%", "58%"],
        [315, "41%", "30%"],
        [168, "42%", "72%"]
    ]
    const darkmodeAccentColors = [
        [203, "94%", "39%"],
        [49, "91%", "48%"],
        [35, "100%", "55%"],
        [332, "39%", "55%"],
        [197, "94%", "58%"],
        [212, "92%", "69%"],
        [343, "86%", "58%"],
        [197, "100%", "89%"],
        [22, "98%", "49%"],
        [251, "42%", "50%"],
        [112, "38%", "73%"],
        [168, "42%", "72%"]
    ]

    // Hex
    // const darkmodeAccentColors = [
    //     "067BC2",
    //     "ECC30B",
    //     "FF9F1C",
    //     "B95F89",
    //     "2EC0F9",
    //     "67AAF9",
    //     "F0386B",
    //     "C9F0FF",
    //     "F75C03",
    //     "5F4BB6",
    //     "A6D49F",
    //     "99D5C9"
    // ]
    // const lightmodeAccentColors = [
    //     "A4031F",
    //     "067BC2",
    //     "ECC30B",
    //     "4B7F52",
    //     "080357",
    //     "FF9F1C",
    //     "B95F89",
    //     "2EC0F9",
    //     "67AAF9",
    //     "F0386B",
    //     "6B2D5C",
    //     "99D5C9"
    // ]

    const setRandomAccent = () => {
        let _accent;
        if(isLightMode){
            _accent = lightmodeAccentColors[Math.floor(Math.random() * lightmodeAccentColors.length)];
        } else{
            _accent = darkmodeAccentColors[Math.floor(Math.random() * darkmodeAccentColors.length)];
        }
        setAccent(_accent);
        document.documentElement.style.setProperty(
            '--accent-l',
            `${_accent[2]}`
        );
        document.documentElement.style.setProperty(
            '--accent-lighten',
            `hsl(${_accent[0]}, ${_accent[1]}, calc(var(--accent-l) + 7%))`
        );
        document.documentElement.style.setProperty(
            '--accent',
            `hsl(${_accent[0]}, ${_accent[1]}, var(--accent-l))`
            // `#${_accent}`
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
        examSubs,
        setExamSubs,
        accent,
        setAccent,
        paperType,
        setPaperType
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