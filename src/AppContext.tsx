import { getBuildVersion, getPaperQuestions, getPastpapers } from "./services/SQLService";

import React, { createContext, useState, useEffect } from "react";

export interface AppContextType {
    clearCache: () => void;
    currSub: any;
    setCurrSub: (sub: any) => void;
    currUnit: any;
    setCurrUnit: (unit: any) => void;
    userID: any;
    setUserID: (id: any) => void;
    setRandomAccent: () => void;
    userSubs: any[];
    setUserSubs: (subs: any[]) => void;
    isLightMode: boolean;
    setIsLightMode: (mode: boolean) => void;
    currExam: any;
    setCurrExam: (exam: any) => void;
    pageTitle: string;
    setPageTitle: (title: string) => void;
    user: any;
    setUser: (user: any) => void;
    progressValue: any;
    setProgressValue: (val: any) => void;
    singleProgressValue: any;
    setSingleProgressValue: (val: any) => void;
    examSubs: any[];
    setExamSubs: (subs: any[]) => void;
    accent: string;
    setAccent: (accent: string) => void;
    paperType: number;
    setPaperType: (type: number) => void;
}

export const AppContext = createContext<AppContextType>({} as AppContextType);


type AppContextProviderProps = {
    children: React.ReactNode;
};

const getLocalStorage = <T,>(key: string, fallback: T): T => {
    const item = localStorage.getItem(key);
    try {
        return item ? JSON.parse(item) : fallback;
    } catch {
        return fallback;
    }
};

const AppContextProvider: React.FC<AppContextProviderProps> = ({ children }) => {
    const [currSub, setCurrSub] = useState<any>(getLocalStorage<any>("sub", null));
    const [currUnit, setCurrUnit] = useState<any>();
    const [currExam, setCurrExam] = useState<any>();
    const [userID, setUserID] = useState<any>(getLocalStorage<any>("userID", null));
    const [user, setUser] = useState<any>(getLocalStorage<any>("user", null));
    const [userSubs, setUserSubs] = useState<any[]>([]);
    const [isLightMode, setIsLightMode] = useState<boolean>(true);
    const [pageTitle, setPageTitle] = useState<string>("");
    const [progressValue, setProgressVal] = useState<any>();
    const [singleProgressValue, setSingleProgressVal] = useState<any>();
    const [accent, setAccent] = useState<string>('brown');
    const [examSubs, setExamSubs] = useState<any[]>([]);
    const [paperType, setPaperType] = useState<number>(2);

    const setProgressValue = (val: any) => {
        setSingleProgressVal(undefined);
        setProgressVal(val);
    };

    const setSingleProgressValue = (val: any) => {
        setProgressVal(undefined);
        setSingleProgressVal(val);
    };

    const cacheVariables: Record<string, any> = {
        sub: currSub,
        userID,
        user
    };

    const cacheSetCommands: Record<string, any> = {
        setCurrSub: "",
        setUserID: "",
        setUser: "",
        setCurrExam: "",
        setUserSubs: "[]"
    };

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
        let _accent: [number, string, string];
        if (isLightMode) {
            _accent = lightmodeAccentColors[Math.floor(Math.random() * lightmodeAccentColors.length)] as [number, string, string];
        } else {
            _accent = darkmodeAccentColors[Math.floor(Math.random() * darkmodeAccentColors.length)] as [number, string, string];
        }
        // Set accent as a string for context, e.g. hsl string
        setAccent(`hsl(${_accent[0]}, ${_accent[1]}, ${_accent[2]})`);
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
        );
    };

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
        Object.keys(cacheVariables).forEach((item) => {
            if (cacheVariables[item]) {
                console.log(`${item}`, JSON.stringify(cacheVariables[item]));
                localStorage.setItem(`${item}`, JSON.stringify(cacheVariables[item]));
            }
        });
    }, [cacheVariables]);

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
    );
};

export { AppContextProvider as default };