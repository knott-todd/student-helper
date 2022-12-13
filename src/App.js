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
import './CSS/global.css';
import {AppContext} from './AppContext';
import ObjectiveInsert from './ObjectiveInsert';
import ObjectiveSetter from './ObjectiveSetter';
import StructureParser from './StructureParser';
import TopicQuestions from './TopicQuestions';
import SignIn from './SignIn';
import Refresh from './Refresh';
import { useContext, useEffect } from 'react';
import { library } from '@fortawesome/fontawesome-svg-core'
import { faFilePen, faBarsProgress, faArrowLeft, faFolderPlus, faUser } from '@fortawesome/free-solid-svg-icons'
library.add(faFilePen, faBarsProgress, faArrowLeft, faFolderPlus, faUser)

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

            <Route path='/insert_objective' element={<ObjectiveInsert />} />
            <Route path='/set_objectives' element={<ObjectiveSetter />} />
            <Route path='/parse_structure' element={<StructureParser />} />

            <Route path="/sign_in" element={<SignIn />} />

            <Route path="*" element={<Refresh />} />
            
          </Route>
        </Routes>

        <Navbar />
      </Router>
      
    </div>
  );
}

export default App;
