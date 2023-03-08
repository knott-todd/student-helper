import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import './CSS/App.css';
import Pastpaper from './Pastpaper';
import Test from './Test';
import Markscheme from './Markscheme';
import Questions from './Questions';
import Navbar from './Navbar';
import Track from './Track';
import ObjectiveQuestions from './ObjectiveQuestions';
import Module from './Module';
import Header from './Header';
import Topic from './Topic';
import Tasks from './Tasks';
import './CSS/global.css';
import {AppContext} from './AppContext';
import ObjectiveInsert from './ObjectiveInsert';
import ObjectiveSetter from './ObjectiveSetter';
import StructureParser from './StructureParser';
import TopicQuestions from './TopicQuestions';
import SignIn from './SignIn';
import Refresh from './Refresh';
import { useContext, useEffect } from 'react';
import 'react-toastify/dist/ReactToastify.css';
import { library } from '@fortawesome/fontawesome-svg-core'
import { faFilePen, faBarsProgress, faArrowLeft, faFolderPlus, faUser, faListCheck, faAtom, faDna, faFlask, faSuperscript, faChartSimple, faEarthAmericas, faInfinity, faEarthEurope, faComments, faDrumSteelpan, faSquareRootVariable, faMessage, faBook, faTimeline, faUsers, faHandshake, faCoins, faHandHoldingDollar, faBitcoinSign, faBriefcase, faCircleCheck, faPencil, faPlus } from '@fortawesome/free-solid-svg-icons'
import TaskForm from './TaskForm';
import { saveInteraction } from './services/SQLService';
import { ToastContainer } from 'react-toastify';
import OneSignal from 'react-onesignal';
library.add(faFilePen, faBarsProgress, faArrowLeft, faFolderPlus, faUser, faListCheck, faAtom, faDna, faFlask, faSuperscript, faChartSimple, faEarthAmericas, faInfinity, faEarthEurope, faComments, faDrumSteelpan, faSquareRootVariable, faMessage, faBook, faTimeline, faUsers, faHandshake, faCoins, faHandHoldingDollar, faBitcoinSign, faBriefcase, faCircleCheck, faPencil, faPlus )

function App() {
  const global = useContext(AppContext);

  const emptyCache = () => {
    if('caches' in window){
    caches.keys().then((names) => {
        // Delete all the cache files
        names.forEach(name => {
            caches.delete(name);
        })
      });

      // Makes sure the page reloads. Changes are only visible after you refresh.
      window.location.reload(true);
    }
  }

  const colors = {
    lightmode: {
      backgroundColor: "#f2f2f2",
      contentBackgroundColor: "white",
      primaryTextColor: "black"
    },
    darkmode: {
      backgroundColor: "#191919",
      contentBackgroundColor: "#131313",
      primaryTextColor: "white"
    }
  }

  // useEffect(() => {
  //   const today = new Date();
  //   const time = today.getHours();

  //   if(time > 6 && time < 18) {

  //     global.setIsLightMode(true);
      
  //     document.documentElement.style.setProperty(
  //       '--background-color',
  //       `${colors.lightmode.backgroundColor}`
  //     );
  //     document.documentElement.style.setProperty(
  //       '--content-background-color',
  //       `${colors.lightmode.contentBackgroundColor}`
  //     );
  //     document.documentElement.style.setProperty(
  //       '--primary-text-color',
  //       `${colors.lightmode.primaryTextColor}`
  //     );
  //   } else {

  //     global.setIsLightMode(false);

  //     document.documentElement.style.setProperty(
  //       '--background-color',
  //       `${colors.darkmode.backgroundColor}`
  //     );
  //     document.documentElement.style.setProperty(
  //       '--content-background-color',
  //       `${colors.darkmode.contentBackgroundColor}`
  //     );
  //     document.documentElement.style.setProperty(
  //       '--primary-text-color',
  //       `${colors.darkmode.primaryTextColor}`
  //     );
  //   }

  // }, [])

  useEffect(() => {
    OneSignal.init({
      appId: "99b7a99a-31e5-4656-86d7-ab456591292b"
    });
  }, []);

  useEffect(() => {
    if(global.userID) {
      
      saveInteraction(global.userID)

    }
  }, [global.userID])

  return (
    <div className="App">

      <Router>
        <Header >
          <script src="https://kit.fontawesome.com/ed9cf2ed95.js" crossorigin="anonymous"></script>
        </Header>
        <Routes>
          <Route exact path = "/" >
            <Route path='/' element={ global.userID ? <Navigate to="/test" /> : <Navigate to="/sign_in" /> } />

            <Route path = "test">
              <Route path = "" element={<Test />} />
              <Route path = "pastpaper/:id" element={<Pastpaper />} />
              <Route path = "markscheme/:id" element={<Markscheme />} />
              <Route path = "questions/:id" element={<Questions />} />
            </Route>

            <Route path='track' >
              <Route path = "" element={<Track />} />
              <Route path = "objective_questions/:id" element={<ObjectiveQuestions />} />
              <Route path = "topic_questions/:id" element={<TopicQuestions />} />
              <Route path = "module/:id" element={<Module />} />
              <Route path = "topic/:id" element={<Topic />} />
            </Route>

            <Route path='tasks'>
              <Route path = "" element={<Tasks />} />
              <Route path = "task_form/:id" element={<TaskForm />} />
              <Route path = "task_form" element={<TaskForm />} />
            </Route>

            <Route path='/insert_objective' element={<ObjectiveInsert />} />
            <Route path='/set_objectives' element={<ObjectiveSetter />} />
            <Route path='/parse_structure' element={<StructureParser />} />

            <Route path="/sign_in" element={<SignIn />} />

            
          </Route>
        </Routes>

        <Navbar />
      </Router>

      <ToastContainer
        position="bottom-left"
        autoClose={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        theme="colored"
      />
      
    </div>
  );
}

export default App;
