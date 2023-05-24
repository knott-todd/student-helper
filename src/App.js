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
import { faFilePen, faBarsProgress, faArrowLeft, faFolderPlus, faUser, faListCheck, faAtom, faDna, faFlask, faSuperscript, faChartSimple, faEarthAmericas, faInfinity, faEarthEurope, faComments, faDrumSteelpan, faSquareRootVariable, faMessage, faBook, faTimeline, faUsers, faHandshake, faCoins, faHandHoldingDollar, faBitcoinSign, faBriefcase, faCircleCheck, faPencil, faPlus, faForward, faAngleLeft, faAngleRight } from '@fortawesome/free-solid-svg-icons'
import TaskForm from './TaskForm';
import { saveInteraction } from './services/SQLService';
import { ToastContainer } from 'react-toastify';
import OneSignal from 'react-onesignal';
import { eventWrapper } from '@testing-library/user-event/dist/utils';
import { useState } from 'react';
import { inject } from '@vercel/analytics';
import SentenceSimilarity from './SentenceSimilarity';
import Home from './Home';
library.add(faFilePen, faBarsProgress, faArrowLeft, faFolderPlus, faUser, faListCheck, faAtom, faDna, faFlask, faSuperscript, faChartSimple, faEarthAmericas, faInfinity, faEarthEurope, faComments, faDrumSteelpan, faSquareRootVariable, faMessage, faBook, faTimeline, faUsers, faHandshake, faCoins, faHandHoldingDollar, faBitcoinSign, faBriefcase, faCircleCheck, faPencil, faPlus, faForward, faAngleLeft, faAngleRight )

function App() {
  const global = useContext(AppContext);

  const [mousePos, setMousePos] = useState({});
  const [columns, setColumns] = useState();
  const [rows, setRows] = useState();

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

  const gravitateToMouse = (mouseX, mouseY) => {
    const gravStrength = 0.1;
    let columns = Math.floor(document.body.clientWidth / 30);
    let rows = Math.floor(document.body.clientHeight / 30);
    const tileHeight = document.body.clientHeight / rows;
    const tileWidth = document.body.clientWidth / columns;
    console.log(".")

    for (let i = 0; i < columns * rows; i++) {
      let tile = document.getElementById(`grid-${i}`);
      let dotX, dotY;

      let tileColumn = (i) % columns;
      let tileRow = Math.floor(i / columns);

      let tileCenterX = tileColumn * tileWidth + tileWidth /2;
      let tileCenterY = tileRow * tileHeight + tileHeight /2;

      let vectorToMouse = {x: mouseX - tileCenterX, y: mouseY - tileCenterY}
      
      let distanceToMouse = Math.sqrt(Math.pow(vectorToMouse.x, 2) + Math.pow(vectorToMouse.y, 2));

      dotX = gravStrength * vectorToMouse.x + 15;
      dotY = gravStrength * vectorToMouse.y + 15;

      console.log(i, dotX, distanceToMouse)

      if(distanceToMouse < 60) {
        tile.textContent = `@keyframes tug-${i}{`+
          "from {background-image: radial-gradient(circle at 50% 50%, var(--content-background-color) 2px, transparent 0);}"+
          `to {background-image: radial-gradient(circle at ${dotX} ${dotY}, var(--content-background-color) 2px, transparent 0);}`+
        "}";

        tile.style.backgroundImage = `radial-gradient(circle at ${dotX}px ${dotY}px, var(--content-background-color) 2px, transparent 0)`
      };
    }
  }

  const lightenDotsNearMouse = (mouseX, mouseY) => {
    let columns = Math.floor(document.body.clientWidth / 30);
    let rows = Math.floor(document.body.clientHeight / 30);
    const tileHeight = document.body.clientHeight / rows;
    const tileWidth = document.body.clientWidth / columns;

    for (let i = 0; i < columns * rows; i++) {
      // let i = 510;
      let tile = document.getElementById(`grid-${i}`);
      let dotX, dotY;

      let tileColumn = (i) % columns;
      // if (tileColumn === 0) tileColumn = columns;
      let tileRow = Math.floor(i / columns);
      // if (tileRow === 0) tileRow = rows;
      console.log(tileColumn, tileRow)

      let tileCenterX = tileColumn * tileWidth + tileWidth /2;
      let tileCenterY = tileRow * tileHeight + tileHeight /2;
      console.log(tileCenterX, tileCenterY)
      console.log(tileWidth, tileHeight)

      let vectorToMouse = {x: mouseX - tileCenterX, y: mouseY - tileCenterY}

      let distanceToMouse = Math.sqrt(Math.pow(vectorToMouse.x, 2) + Math.pow(vectorToMouse.y, 2));
      console.log(distanceToMouse)
      // console.log("..")

      if(distanceToMouse < 60) {

        tile.style.backgroundImage = `radial-gradient(circle at 50% 50%, rgb(255, 255, 255, ${1 - distanceToMouse / 60}) 2px, transparent 0)`;
        
      } else {
        tile.style.backgroundImage = "radial-gradient(circle at 50% 50%, var(--content-background-color) 2px, transparent 0)"
      }

    }
  }

  useEffect(() => {

    createDotGrid2();

    // window.addEventListener('mousemove', e => {
    //   document.documentElement.style.setProperty('--mouseX', `${e.clientX}px`);
    //   document.documentElement.style.setProperty('--mouseY', `${e.clientY}px`);
    // })

    // window.addEventListener('mousedown', e => {
    //   gravitateToMouse(e.clientX, e.clientY);
    // })

  }, [global.accent])

  const createDotGrid = () => {
    let columns = Math.floor(document.body.clientWidth / 30);
    setColumns(columns);
    let rows = Math.floor(document.body.clientHeight / 30);
    setRows(rows);

    const wrapper = document.getElementById("tiles");

    const createTile = i => {
      const tile = document.createElement("div");
      tile.innerText = i;

      tile.classList.add("tile");
      tile.id = `grid-${i}`;
      tile.style.backgroundColor = `rgba(${255 * ( 1 -  i / columns / rows)}, 0, ${140 * ( i / columns / rows)}, 1)`
      tile.style.backgroundImage = `radial-gradient(circle at 50% 50%, var(--content-background-color) 2px, transparent 0)`

      return tile;
    }

    const createTiles = quantity => { 
      Array.from(Array(quantity)).map((tile, i) => {
        wrapper.appendChild(createTile(i));
      })
    }

    const createGrid = () => {

      wrapper.innerHTML = "";

      columns = Math.floor(window.innerWidth / 30);
      setColumns(columns);
      rows = Math.floor(window.innerHeight / 30);
      setRows(rows);

      wrapper.style.setProperty("--bg-columns", columns);
      wrapper.style.setProperty("--bg-rows", rows);

      createTiles(columns * rows)
      
    }

    createGrid();
    window.onresize = () => createGrid();
  }

  const hexToRgba = (hex) => {
    
    if (hex[0] === "#") hex = hex.slice(1);

    if(!hex.match(/[0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8}/g)) {

      hex = cssToHex(hex);

    }

    if (hex[1] === "#") hex = hex.slice(2);

    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    const a = parseInt(hex.slice(6, 8), 16) / 255;
    return {r, g, b, a};
  };

  const hslToRgb = (h, s, l) => {

    s /= 100;
    l /= 100;
    const k = n => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = n =>
      l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    
    return {r: 255 * f(0), g: 255 * f(8), b: 255 * f(4)};
  };

  // Define a function to convert CSS color name to hex
  function cssToHex(color) {
    // Create a dummy element to get computed style
    var dummy = document.createElement("div");
    dummy.style.color = color;
    document.body.appendChild(dummy);

    // Get the computed color in RGB format
    var rgbColor = window.getComputedStyle(dummy).color;

    // Remove the "rgb(" and ")" parts from the color string
    rgbColor = rgbColor.slice(4, -1);

    // Convert the RGB color to hexadecimal format
    var hexColor = "#" + rgbColor.split(", ").map(function(c) {
      return parseInt(c).toString(16).padStart(2, '0');
    }).join("");

    // Remove the dummy element
    document.body.removeChild(dummy);

    // Return the hexadecimal color value
    return hexColor;
  }

  const createDotGrid2 = () => {
    const canvas = document.getElementById("dots");
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Configuration
    const dotSize = 2;
    const dotSpacingFraction = 0.04; // Fraction of screenHeight
    let dotSpacing = dotSpacingFraction * canvas.height;
    const radius = 60;
    const maxDisplacement = 8;
    const timeToMove1DotSpacing = 6000;
    const defaultDotColor = getComputedStyle(document.documentElement).getPropertyValue('--content-background-color');
    const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--accent');

    function lerp( a, b, alpha ) {
      return a + alpha * ( b - a );
    }

    // Generate dot positions
    let positions = [];
    const generatePositions = () => {
      positions = [];
      for (let y = -dotSize; y < canvas.height; y += dotSpacing) {
        for (let x = 0; x < canvas.width; x += dotSpacing) {
          positions.push({
            x: x, 
            y: y, 
            originalX: x, 
            originalY: y,
            color: defaultDotColor
          });
        }
      }
    }

    generatePositions();

    let time = 0; // counter for animation
    let animating = false; // whether or not the dots are currently animating

    // Draw dots on canvas
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < positions.length; i++) {
        const pos = positions[i];
        ctx.beginPath();
        ctx.arc(pos.displacedX, pos.displacedY, dotSize, 0, Math.PI * 2);
        ctx.fillStyle = pos.color;
        ctx.fill();
      }
    }

    let mouseX, mouseY
    let isMouseMoving = false;
    let throttleDelay = 0;

    // Handle mouse movement
    const handleMouseMove = event => {

      if (!isMouseMoving) {
        isMouseMoving = true;
        const canvasRect = canvas.getBoundingClientRect();
        mouseX = event.clientX - canvasRect.left;
        mouseY = event.clientY - canvasRect.top;
        setTimeout(() => {
          isMouseMoving = false;
        }, throttleDelay); // set the delay time here (in milliseconds)
      }

    }
    window.removeEventListener('mousemove', handleMouseMove);
    window.addEventListener("mousemove", handleMouseMove);

    const handleMouseUp = e => {

      setTimeout(() => {

        mouseX = undefined;
        mouseY = undefined;

      }, 100);

    }
    window.removeEventListener("mouseup", handleMouseUp)
    window.addEventListener("mouseup", handleMouseUp)

    // // Handle touch events
    let touchId = null;
    let isTouchMoving = false;

    function handleTouchStart(event) {
      if (event.touches.length === 1) {
        if (!isTouchMoving) {
          isTouchMoving = true;
          const canvasRect = canvas.getBoundingClientRect();
          const touch = event.touches[0];
          // mouseX = touch.clientX - canvasRect.left;
          // mouseY = touch.clientY - canvasRect.top;
          touchId = touch.identifier;
          setTimeout(() => {
            isTouchMoving = false;
          }, throttleDelay); // set the delay time here (in milliseconds)
        }
      }
    }

    // function handleTouchMove(event) {
    //   for (let i = 0; i < event.changedTouches.length; i++) {
    //     const touch = event.changedTouches[i];
    //     if (touch.identifier === touchId && !isTouchMoving) {
    //       isTouchMoving = true;
    //       // const canvasRect = canvas.getBoundingClientRect();
    //       mouseX = touch.clientX;
    //       mouseY = touch.clientY;

    //       setTimeout(() => {
    //         isTouchMoving = false;
    //       }, throttleDelay); // set the delay time here (in milliseconds)
    //     }
    //   }
    // }

    function handleTouchEnd(event) {
      for (let i = 0; i < event.changedTouches.length; i++) {
        const touch = event.changedTouches[i];
        if (touch.identifier === touchId) {
          touchId = null;
          mouseX = undefined;
          mouseY = undefined;
        }
      }
    }

    window.removeEventListener('touchstart', handleTouchStart);
    window.removeEventListener('touchend', handleTouchEnd);
    window.addEventListener("touchstart", handleTouchStart);
    // window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("touchend", handleTouchEnd);

    // Redraw on window resize
    window.addEventListener("resize", () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      dotSpacing = dotSpacingFraction * canvas.height;
      generatePositions();
      draw();
    });

    // Animate dots moving down
    let speed = dotSpacing / timeToMove1DotSpacing; // dotSpacing per millisecond
    console.log(speed)
    function animate() {
      if (!animating) return;
      let currentTime = Date.now(); // current time in milliseconds
      let elapsedTime = currentTime - time; // elapsed time since last frame in milliseconds

      // Limit frame rate to 60fps
      const maxElapsedTime = 1000 / 60; // maximum elapsed time for 60fps
      if (elapsedTime > maxElapsedTime) {
        elapsedTime = maxElapsedTime;
      }

      time = currentTime; // update time for next frame

      for (let i = 0; i < positions.length; i++) {
        const pos = positions[i];
        if (pos.y < pos.originalY + dotSpacing) {
          pos.y += elapsedTime * speed;
        } else {
          pos.y = pos.originalY;
        }

        const distance = Math.sqrt((pos.x - mouseX) ** 2 + (pos.y - mouseY) ** 2);
        if (distance < radius) {
          const displacement = Math.min(maxDisplacement, distance) * (radius - distance) / radius;
          const angle = Math.atan2(mouseY - pos.y, mouseX - pos.x);
          pos.displacedX = pos.x + displacement * Math.cos(angle);
          pos.displacedY = pos.y + displacement * Math.sin(angle);

          // Light up dots
          let {r, g, b} = hslToRgb(global.accent[0], parseInt(global.accent[1].slice(0, -1)), parseInt(global.accent[2].slice(0, -1)));
          let {r: dotR, g: dotG, b: dotB, a: dotA} = hexToRgba(defaultDotColor)

          // console.log(a, a + (0.5 * (radius - distance) / radius), (0.5 * (radius - distance) / radius));
          pos.color = `rgba(${lerp(r, dotR, distance / radius)}, ${lerp(g, dotG, distance / radius)}, ${lerp(b, dotB, distance / radius)}, ${ lerp(0.5, dotA, distance / radius) })`;

        } else {
          pos.displacedX = pos.x;
          pos.displacedY = pos.y;

          // Return color to default
          pos.color = defaultDotColor;
        }
      }

      draw();
      window.requestAnimationFrame(animate);
    }



    // Start animation loop
    animating = true;
    animate();
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
 
    inject();
  }, []);

  useEffect(() => {
    if(global.userID) {
      
      saveInteraction(global.userID)

    }
  }, [global.userID])

  return (
    <div className="App">

      <div id="tiles" />
      <canvas id="dots" />

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

            <Route path="/sentence_similarity" element={<SentenceSimilarity />} />

            <Route path="/home" element={<Home />} />

            
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
