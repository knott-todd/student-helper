import { getBuildVersion, getPaperQuestions, getPastpapers } from "./services/SQLService";
import { getSession, ServerUnreachableError } from "./services/auth";
import { onUnauthorized } from "./services/session";

const { createContext, useState, useEffect, useCallback } = require("react");

export const AppContext = createContext(null);

// Before Google sign-in, identity was a client-side userID/user in
// localStorage. The session cookie is now the only source of truth, so the
// old keys are dropped (legacy name-only accounts start fresh).
const LEGACY_IDENTITY_KEYS = ["userID", "user"];

const readStoredSub = () => {
    try {
        return JSON.parse(localStorage.getItem("sub"));
    } catch (error) {
        return null;
    }
};

export default ({children}) => {
    const [currSub, setCurrSub] = useState(readStoredSub);
    const [currUnit, setCurrUnit] = useState();
    const [currExam, setCurrExam] = useState();
    // Signed-in user from POST /auth/google or GET /me. The backend takes the
    // user from the session cookie, so userID is never sent to it; it is only a
    // "signed in" flag for effects and display (and OneSignal's external id).
    const [user, setUser] = useState(null);
    const userID = user ? user.id : null;
    // Shows the admin UI (with REACT_APP_ENABLE_ADMIN). The backend enforces it
    // by re-reading the role from the DB on every admin call.
    const isAdmin = Boolean(user && user.role === "admin");
    // "loading" until GET /me answers, then "signedIn" | "signedOut" |
    // "unreachable" (network error or 5xx: the backend or its DB is down).
    const [authStatus, setAuthStatus] = useState("loading");
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

    const clearCache = () => {
        setCurrSub(null);
        setUser(null);
        setCurrExam();
        setUserSubs([]);
        setExamSubs([]);
        try {
            localStorage.removeItem("sub");
        } catch (error) {
            // Storage unavailable; nothing to clear.
        }
    }

    // A successful sign-in or restored session.
    const signIn = useCallback(signedInUser => {
        setUser(signedInUser);
        setCurrExam(signedInUser.default_exam || undefined);
        setAuthStatus("signedIn");
    }, []);

    // Local half of sign-out; the caller has already ended the server session.
    const signOutLocally = () => {
        clearCache();
        setAuthStatus("signedOut");
    }

    const restoreSession = useCallback(() => {
        setAuthStatus("loading");
        return getSession()
            .then(sessionUser => {
                if (sessionUser) signIn(sessionUser);
                else setAuthStatus("signedOut");
            })
            .catch(error => {
                if (!(error instanceof ServerUnreachableError)) console.error(error);
                setAuthStatus("unreachable");
            });
    }, [signIn]);

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
        isAdmin,
        authStatus,
        signIn,
        signOutLocally,
        restoreSession,
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
        try {
            LEGACY_IDENTITY_KEYS.forEach(key => localStorage.removeItem(key));
        } catch (error) {
            // Storage unavailable; nothing to clear.
        }
        restoreSession();
    }, [restoreSession])

    // Any API call answering 401 means the session is gone (expired, signed out
    // in another tab, or the account was removed): sign out here too, and
    // RequireAuth routes to /sign_in. getSession/signIn don't go through this.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => onUnauthorized(signOutLocally), [])

    // The selected subject is a per-device convenience, not identity.
    useEffect(() => {
        if (!currSub) return;
        try {
            localStorage.setItem("sub", JSON.stringify(currSub));
        } catch (error) {
            // Storage unavailable; the subject just isn't remembered.
        }
    }, [currSub])

    useEffect(() => {
        if(currSub && currExam && userID && currSub.id){
            getPastpapers(currSub.id, currExam)
            .then(async result => {        
                for(const paper of result){
                    await getPaperQuestions(paper.id)
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