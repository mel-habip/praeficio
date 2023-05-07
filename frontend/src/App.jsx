// import logo from './logo.gif';
// import './App.css';
import React, { useState, useEffect } from 'react';
import NavMenu from './components/NavMenu';
import { BrowserRouter as Router, Route, Routes, Navigate, useNavigate, useParams } from 'react-router-dom';
import CompanyPublicPage from './pages/CompanyPublicPage';
import Newsletters from './pages/Newsletters';
import NewslettersAdmin from './pages/NewslettersAdmin';
import LoginPage from './pages/LoginPage.jsx';
import Portal from './pages/Portal.jsx';
import Positions from './pages/Positions.jsx';
import Settings from './pages/Settings.jsx';
import Alerts from './pages/Alerts.jsx';
import Workspaces from './pages/Workspaces.jsx';
import ToDos from './pages/ToDos.jsx';
import TestZone from './pages/TestZone';
import TicTacToePage from './pages/TicTacToePage.jsx';
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
  let isDarkInitial = true; //proves persistence, sets State based on localStorage
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
      axios.get(`https://${process.env.REACT_APP_BUILD_ENV}.praeficio.com/users/session`).then(response => {
        console.log('/session fetch results', response)
        if (response.status === 200) {
          setUser(response.data);
          setAccessToken(localAccessToken);
          setUserId(response.data.id);
          setIsLoggedIn(true);
        } else if (response.status === 401) {
          setIsLoggedIn(false);
        }
      }).catch(er => setIsLoggedIn(false));
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

  if (isLoggedIn === null && localAccessToken) return (<LoadingPage />);

  if (window.location.href.includes('.praeficio.com') || window.location.pathname.startsWith('/be/')) return (<div></div>);

  return (
    <NextUIProvider theme={isDark ? darkTheme : lightTheme}>
      <IsLoggedInContext.Provider value={{ isLoggedIn, setIsLoggedIn, setUserId, accessToken, setAccessToken, toDoCategories, setToDoCategories, user, setUser }}>
        <ThemeContext.Provider value={{ isDark, toggleTheme }}> {/*this controls everything custom */}
          <div className="App">
            <Router >
              <Routes>
                <Route path='/' element={<CompanyPublicPage />} exact />
                <Route path='/company' element={<Navigate to="/" replace />} />
                <Route path='/home' element={<Navigate to="/portal" replace />} />
                <Route path='/portal' element={isLoggedIn ? <Portal /> : <LoginPage />} exact />
                <Route path='/newsletters' element={<Newsletters />} exact/>
                <Route path='/newsletters/admin' element={isLoggedIn ? <NewslettersAdmin /> : <LoginPage />} exact/>
                <Route path='/login' element={<LoginPage />} exact/>
                <Route path='/positions' element={isLoggedIn ? <Positions /> : <LoginPage />} exact />
                <Route path='/alerts' element={isLoggedIn ? <Alerts /> : <LoginPage />} exact />

                <Route path="/tic-tac-toe" element={<Navigate to="/tictactoe" replace />} />
                <Route path="/tic_tac_toe" element={<Navigate to="/tictactoe" replace />} />
                <Route path='/tictactoe' element={<TicTacToePage />} />

                <Route path="/workspaces" element={<Navigate to="/workspaces/my_workspaces" replace />} />

                <Route path="/workspaces/my_workspaces" element={<Workspaces subSection="my_workspaces" />} exact />
                <Route path="/workspaces/my_favourites" element={<Workspaces subSection="my_favourites" />} exact />
                <Route path="/workspaces/discover" element={<Workspaces subSection="discover" />} exact />
                <Route path="/workspaces/:workspace_id" element={<WorkspacesRedirectToMessages />} exact />
                <Route path="/workspaces/:workspace_id/settings" element={<Workspaces subSection="settings" />} exact />
                <Route path="/workspaces/:workspace_id/messages" element={<Workspaces subSection="messages" />} exact />
                <Route path="/workspaces/:workspace_id/members" element={<Workspaces subSection="members" />} exact />
                <Route path="/workspaces/:workspace_id/positions" element={<Workspaces subSection="positions" />} exact />


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


const WorkspacesRedirectToMessages = () => {
  const { workspace_id } = useParams();
  const navigate = useNavigate();
  useEffect(() =>
    navigate(`/workspaces/${workspace_id}/messages`, { replace: true })
  );
  return null;
}
