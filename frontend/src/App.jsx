// import logo from './logo.gif';
// import './App.css';
import React, { useState, useEffect } from 'react';
import NavMenu from './components/NavMenu';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginPage from './pages/LoginPage.jsx';
import Portal from './pages/Portal.jsx';
import Positions from './pages/Positions.jsx';
import Settings from './pages/Settings.jsx';
import Alerts from './pages/Alerts.jsx';
import Workspaces from './pages/Workspaces.jsx';
import ToDos from './pages/ToDos.jsx';
import TestZone from './pages/TestZone';
import FeedbackLogsPage from './pages/FeedbackLogsPage.jsx';
import SpecificFeedbackLogPage from './pages/SpecificFeedbackLogPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import ForbiddenPage from './pages/ForbiddenPage.jsx';
import LoadingPage from './pages/LoadingPage';
import ThemeContext from './contexts/ThemeContext';
import IsLoggedInContext from './contexts/IsLoggedInContext';
import { NextUIProvider, createTheme } from '@nextui-org/react';

import axios from 'axios';


function App() {
  const browserDarkPreference = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const localTheme = localStorage.getItem('theme');
  let isDarkInitial = false; //proves persistence, sets State based on localStorage
  if (localTheme === 'dark') {
    isDarkInitial = true;
  } else if (localTheme === 'light') {
    isDarkInitial = false;
  } else if (browserDarkPreference) {
    isDarkInitial = true;
  }
  const [isDark, setDark] = useState(isDarkInitial);

  const [isLoggedIn, setIsLoggedIn] = useState(null); //we start as null so that we don't immediately kick ourselves out, after that it is a boolean
  const [userId, setUserId] = useState(null);
  const [accessToken, setAccessToken] = useState('');
  const [toDoCategories, setToDoCategories] = useState([]);
  const [user, setUser] = useState(null);

  const toggleTheme = () => {
    setDark(!isDark);
  };
  const lightTheme = createTheme({
    type: 'light'
  });

  const darkTheme = createTheme({
    type: 'dark'
  });


  useEffect(() => { //provides the persistence, makes doc attribute update when StateLoads
    console.log('isDarkState', isDark);
    document.documentElement.setAttribute("data-theme", isDark ? 'dark' : 'light');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const localAccessToken = localStorage.getItem('access_token');
  //pre_logged_in_module
  useEffect(() => {
    const localUserId = localStorage.getItem('user_id');
    if (!localUserId) return;
    if (localAccessToken) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${localAccessToken}`;
      axios.get(`http://localhost:8000/users/session`).then(response => {
        console.log('/session fetch results', response)
        if (response.status === 200) {
          setUser(response.data);
          setAccessToken(localAccessToken);
          setUserId(response.data.id);
          setIsLoggedIn(true);
        } else if (response.status === 401) {
          setIsLoggedIn(false);
        }
      });
    } else {
      setIsLoggedIn(false);
    }
  }, [localAccessToken]);

  useEffect(() => { //kickout function
    if (isLoggedIn === false) {
      console.log('kicked out');
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_id');
      setIsLoggedIn(null); //revert to original, or else will be stuck 
    }
  }, [isLoggedIn]);

  if (![true, false].includes(isLoggedIn)) { return (<LoadingPage />); }

  return (
    <NextUIProvider theme={isDark ? darkTheme : lightTheme}>
      <IsLoggedInContext.Provider value={{ isLoggedIn, setIsLoggedIn, setUserId, accessToken, setAccessToken, toDoCategories, setToDoCategories, user, setUser }}>
        <ThemeContext.Provider value={{ isDark, toggleTheme }}> {/*this controls everything custom */}
          <div className="App">
            <Router >
              <Routes>
                <Route path='/' element={isLoggedIn ? <Portal /> : <LoginPage />} exact />
                <Route path='/login' element={<LoginPage />} />
                <Route path='/positions' element={isLoggedIn ? <Positions /> : <LoginPage />} exact />
                <Route path='/alerts' element={isLoggedIn ? <Alerts /> : <LoginPage />} exact />
                <Route path='/workspaces' element={isLoggedIn ? <Workspaces /> : <LoginPage />} exact />
                <Route path='/workspaces/:workspace_id' element={isLoggedIn ? <Workspaces /> : <LoginPage />} exact />
                <Route path='/todos' element={isLoggedIn ? <ToDos /> : <LoginPage />} exact />
                <Route path='/todos/archive' element={isLoggedIn ? <ToDos archive /> : <LoginPage />} exact />
                <Route path='/settings' element={isLoggedIn ? <Settings /> : <LoginPage />} exact />
                <Route path='/feedback_logs' element={isLoggedIn ? <FeedbackLogsPage /> : <LoginPage />} exact />
                <Route path='/feedback_logs/archive' element={isLoggedIn ? <FeedbackLogsPage archive /> : <LoginPage />} exact />
                <Route path='/feedback_logs/:feedback_log_id' element={isLoggedIn ? <SpecificFeedbackLogPage /> : <LoginPage />} exact />
                <Route path='/testzone' element={<TestZone />} exact />
                <Route path='/403' element={<ForbiddenPage />} exact />
                <Route path='/*' element={<NotFoundPage />} />
              </Routes>
            </Router>
          </div>
        </ThemeContext.Provider >
      </IsLoggedInContext.Provider >
    </NextUIProvider>
  );
}

export default App;
