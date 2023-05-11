// import './App.css';
import React, { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useNavigate, useParams } from 'react-router-dom';

import ThemeContext from './contexts/ThemeContext';
import IsLoggedInContext from './contexts/IsLoggedInContext';
import { NextUIProvider, createTheme, Loading } from '@nextui-org/react';
import axios from 'axios';

const CompanyPublicPage = lazy(() => import('./pages/CompanyPublicPage'));
const Newsletters = lazy(() => import('./pages/Newsletters'));
const NewslettersAdmin = lazy(() => import('./pages/NewslettersAdmin'));
const LoginPage = lazy(() => import('./pages/LoginPage.jsx'));
const Portal = lazy(() => import('./pages/Portal.jsx'));
const Positions = lazy(() => import('./pages/Positions.jsx'));
const Settings = lazy(() => import('./pages/Settings.jsx'));
const Alerts = lazy(() => import('./pages/Alerts.jsx'));
const Workspaces = lazy(() => import('./pages/Workspaces.jsx'));
const ToDos = lazy(() => import('./pages/ToDos.jsx'));
const TestZone = lazy(() => import('./pages/TestZone'));
const TicTacToePage = lazy(() => import('./pages/TicTacToePage.jsx'));
const FeedbackLogsPage = lazy(() => import('./pages/FeedbackLogsPage.jsx'));
const SpecificFeedbackLogPage = lazy(() => import('./pages/SpecificFeedbackLogPage.jsx'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage.jsx'));
const ForbiddenPage = lazy(() => import('./pages/ForbiddenPage.jsx'));
const LoadingPage = lazy(() => import('./pages/LoadingPage'));


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
      axios.get(`https://${process.env.REACT_APP_API_LINK}.praeficio.com/users/session`).then(response => {
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

  if (window.location.href.includes('api.praeficio.com')) return (<div></div>);

  return (
    <NextUIProvider theme={isDark ? darkTheme : lightTheme}>
      <IsLoggedInContext.Provider value={{ isLoggedIn, setIsLoggedIn, setUserId, accessToken, setAccessToken, toDoCategories, setToDoCategories, user, setUser }}>
        <ThemeContext.Provider value={{ isDark, toggleTheme }}> {/*this controls everything custom */}
          <div className="App">
            <Router >
              <Routes>
                <Suspense fallback={<Loading size='xl' />} >

                  <Route path='/' element={<CompanyPublicPage />} exact />
                  <Route path='/company' element={<Navigate to="/" replace />} />
                  <Route path='/home' element={<Navigate to="/portal" replace />} />
                  <Route path='/portal' element={isLoggedIn ? <Portal /> : <LoginPage />} exact />
                  <Route path='/newsletters' element={<Newsletters />} exact />
                  <Route path='/newsletters/admin' element={isLoggedIn ? <NewslettersAdmin /> : <LoginPage />} exact />
                  <Route path='/login' element={<LoginPage />} exact />
                  <Route path='/positions' element={isLoggedIn ? <Positions /> : <LoginPage />} exact />
                  <Route path='/alerts' element={isLoggedIn ? <Alerts /> : <LoginPage />} exact />

                  <Route path="/tic-tac-toe" element={<Navigate to="/tictactoe" replace />} />
                  <Route path="/tic_tac_toe" element={<Navigate to="/tictactoe" replace />} />
                  <Route path='/tictactoe' element={<TicTacToePage />} />

                  <Route path="/workspaces" element={<Navigate to="/workspaces/my_workspaces" replace />} />

                  <Route path="/workspaces/my_workspaces" element={isLoggedIn ? <Workspaces subSection="my_workspaces" /> : <LoginPage />} exact />
                  <Route path="/workspaces/my_favourites" element={isLoggedIn ? <Workspaces subSection="my_favourites" /> : <LoginPage />} exact />
                  <Route path="/workspaces/discover" element={isLoggedIn ? <Workspaces subSection="discover" /> : <LoginPage />} exact />
                  <Route path="/workspaces/:workspace_id" element={<WorkspacesRedirectToMessages />} exact />
                  <Route path="/workspaces/:workspace_id/settings" element={isLoggedIn ? <Workspaces subSection="settings" /> : <LoginPage />} exact />
                  <Route path="/workspaces/:workspace_id/messages" element={isLoggedIn ? <Workspaces subSection="messages" /> : <LoginPage />} exact />
                  <Route path="/workspaces/:workspace_id/members" element={isLoggedIn ? <Workspaces subSection="members" /> : <LoginPage />} exact />
                  <Route path="/workspaces/:workspace_id/positions" element={isLoggedIn ? <Workspaces subSection="positions" /> : <LoginPage />} exact />


                  <Route path='/todos' element={isLoggedIn ? <ToDos /> : <LoginPage />} exact />
                  <Route path='/todos/archive' element={isLoggedIn ? <ToDos archive /> : <LoginPage />} exact />
                  <Route path='/settings' element={isLoggedIn ? <Settings /> : <LoginPage />} exact />
                  <Route path='/feedback_logs' element={isLoggedIn ? <FeedbackLogsPage /> : <LoginPage />} exact />
                  <Route path='/feedback_logs/archive' element={isLoggedIn ? <FeedbackLogsPage archive /> : <LoginPage />} exact />
                  <Route path='/feedback_logs/:feedback_log_id' element={isLoggedIn ? <SpecificFeedbackLogPage /> : <LoginPage />} exact />
                  <Route path='/testzone' element={<TestZone />} exact />
                  <Route path='/403' element={<ForbiddenPage />} exact />
                  <Route path='/*' element={<NotFoundPage />} />
                </Suspense>
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
