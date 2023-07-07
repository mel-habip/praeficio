// import './App.css';
import React, { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useNavigate, useParams } from 'react-router-dom';

import ThemeContext from './contexts/ThemeContext';
import IsLoggedInContext from './contexts/IsLoggedInContext';
import LanguageContext from './contexts/LanguageContext';
import { NextUIProvider, createTheme, Loading } from '@nextui-org/react';
import axios from 'axios';

const PublicPage = lazy(() => import('./pages/PublicPage'));
const QuickNotes = lazy(() => import('./pages/QuickNotes'));
const Newsletters = lazy(() => import('./pages/NewsLetterPages/Newsletters'));
const SpecificNewsletterPage = lazy(() => import('./pages/NewsLetterPages/SpecificNewsletterPage'));
const NewslettersAdmin = lazy(() => import('./pages/NewsLetterPages/NewslettersAdmin'));
const InternalAdmin = lazy(() => import('./pages/InternalAdmin'));
const LoginPage = lazy(() => import('./pages/LoginPage.jsx'));
const Portal = lazy(() => import('./pages/Portal.jsx'));
const Positions = lazy(() => import('./pages/Positions.jsx'));
const Settings = lazy(() => import('./pages/Settings.jsx'));
const Alerts = lazy(() => import('./pages/Alerts.jsx'));
const Workspaces = lazy(() => import('./pages/Workspaces.jsx'));
const ToDos = lazy(() => import('./pages/ToDos.jsx'));
const TestZone = lazy(() => import('./pages/TestZone'));
const TicTacToePage = lazy(() => import('./pages/TicTacToePage.jsx'));
const RandomizerPage = lazy(() => import('./pages/RandomizerPage.jsx'));
const FeedbackLogsPage = lazy(() => import('./pages/FeedbackLogsPage.jsx'));
const SpecificFeedbackLogPage = lazy(() => import('./pages/SpecificFeedbackLogPage.jsx'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage.jsx'));
const ForbiddenPage = lazy(() => import('./pages/ForbiddenPage.jsx'));
const LoadingPage = lazy(() => import('./pages/LoadingPage'));
const ErrorPage = lazy(() => import('./pages/ErrorPage'));

const MelPage = lazy(() => import('./pages/PersonalPages/Mel'));
const HiraPage = lazy(() => import('./pages/PersonalPages/Hira'));
const TiddlesPage = lazy(() => import('./pages/PersonalPages/Tiddles'));

const ServiceDesk = lazy(() => import('./pages/ServiceDesk'));
const SpecificDebtAccountPage = lazy(() => import('./pages/SpecificDebtAccountPage'));
const DebtAccounts = lazy(() => import('./pages/DebtAccounts'));

const UsersPage = lazy(() => import('./pages/UsersPage'));
const SpecificUserProfilePage = lazy(() => import('./pages/SpecificUserProfilePage'));

const SpecificVoterPage = lazy(() => import('./pages/VotingPages/SpecificVoterPage'));
const VotingSessionsPage = lazy(() => import('./pages/VotingPages/VotingSessionsPage'));
const SpecificVotingSessionPage = lazy(() => import('./pages/VotingPages/SpecificVotingSessionPage'));
const VoterRedirectPageOne = lazy(() => import('./pages/VotingPages/VoterRedirectPageOne'));
const VoterRedirectPageTwo = lazy(() => import('./pages/VotingPages/VoterRedirectPageTwo'));
const VotingSessionClosedPage = lazy(() => import('./pages/VotingPages/VotingSessionClosedPage'));



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

  const localLang = localStorage.getItem('language');

  const queryParams = new URLSearchParams(window.location.search);
  const languageQueryParam = queryParams.get("lang");

  let initialLang = 'en';

  if (['fr', 'french', 'francais'].includes(languageQueryParam)) {
    initialLang = 'fr';
  } else if (['fr', 'french', 'francais'].includes(localLang)) {
    initialLang = 'fr';
  }

  const [language, setLanguage] = useState(() => initialLang);
  const toggleLanguage = () => {
    let n;
    setLanguage(prev => {
      if (prev === 'fr') {
        n = 'en';
      } else {
        n = 'fr';
      }
      return n;
    });
    localStorage.setItem('language', n);
  };

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
    if (localAccessToken) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${localAccessToken}`;
      axios.get(`${process.env.REACT_APP_API_LINK}/users/session`).then(response => {
        console.log('/session fetch results', response)
        if (response.status === 200) {
          setUser(response.data);
          setAccessToken(localAccessToken);
          localStorage.setItem('user_id', response.data.user_id); //not sure what this would truly be useful for
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

  console.log('api link', process.env.REACT_APP_API_LINK);
  console.log('build env', process.env.REACT_APP_BUILD_ENV);

  return (
    <NextUIProvider theme={isDark ? darkTheme : lightTheme}>
      <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage }} >
        <IsLoggedInContext.Provider value={{ isLoggedIn, setIsLoggedIn, setUserId, accessToken, setAccessToken, toDoCategories, setToDoCategories, user, setUser }}>
          <ThemeContext.Provider value={{ isDark, toggleTheme }}> {/*this controls everything custom */}
            <div className="App">
              <Router >
                <Suspense fallback={<Loading size='xl' />} >
                  <Routes>
                    <Route path='/' element={<PublicPage />} exact />
                    <Route path='/company' element={<Navigate to="/" replace />} />
                    <Route path='/home' element={<Navigate to="/portal" replace />} />

                    <Route path='/mel' element={<Navigate to="/mel-habip" replace />} />
                    <Route path='/habip' element={<Navigate to="/mel-habip" replace />} />
                    <Route path='/mel-habip' element={<MelPage />} exact />
                    <Route path='/hira' element={<Navigate to="/hira-qazi" replace />} />
                    <Route path='/qazi' element={<Navigate to="/hira-qazi" replace />} />
                    <Route path='/hira-qazi' element={<HiraPage />} exact />
                    <Route path='/tiddles' element={<TiddlesPage />} exact />

                    <Route path='/portal' element={isLoggedIn ? <Portal /> : <LoginPage />} exact />
                    <Route path='/newsletters' element={<Newsletters />} exact />
                    <Route path='/notes' element={<QuickNotes />} exact />
                    <Route path='/quicknotes' element={<QuickNotes />} exact />
                    <Route path='/quick_notes' element={<QuickNotes />} exact />
                    <Route path='/quick-notes' element={<QuickNotes />} exact />
                    <Route path='/newsletters/admin' element={(isLoggedIn && user?.permissions) ? (user?.is_dev ? <NewslettersAdmin /> : <Navigate to="/403" replace />) : <LoginPage />} exact />
                    <Route path='/internal_admin' element={isLoggedIn ? ((['total', 'dev_lead'].includes(user?.permissions)) ? <InternalAdmin /> : <Navigate to="/403" replace />) : <LoginPage />} exact />
                    <Route path='/newsletters/:newsletter_id' element={<SpecificNewsletterPage />} exact />
                    <Route path='/login' element={isLoggedIn ? <Navigate to="/home" replace /> : <LoginPage />} exact />
                    <Route path='/positions' element={isLoggedIn ? <Positions /> : <LoginPage />} exact />
                    <Route path='/alerts' element={isLoggedIn ? <Alerts /> : <LoginPage />} exact />
                    <Route path='/service_desk' element={isLoggedIn ? <ServiceDesk /> : <LoginPage />} exact />

                    <Route path="/tic-tac-toe" element={<Navigate to="/tictactoe" replace />} />
                    <Route path="/tic_tac_toe" element={<Navigate to="/tictactoe" replace />} />
                    <Route path='/tictactoe' element={<TicTacToePage />} />

                    <Route path='/randomizer' element={<RandomizerPage />} />

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
                    <Route path='/feedback-logs' element={<Navigate to="/feedback_logs" replace />} />
                    <Route path='/feedback_logs' element={isLoggedIn ? <FeedbackLogsPage /> : <LoginPage />} exact />
                    <Route path='/feedback-logs/archive' element={<Navigate to="/feedback_logs/archive" replace />} />
                    <Route path='/feedback_logs/archive' element={isLoggedIn ? <FeedbackLogsPage archive /> : <LoginPage />} exact />
                    <Route path='/feedback_logs/:feedback_log_id' element={isLoggedIn ? <SpecificFeedbackLogPage /> : <LoginPage />} exact />

                    <Route path='/users' element={isLoggedIn ? <UsersPage /> : <LoginPage />} exact />
                    <Route path='/users/:user_id' element={isLoggedIn ? <SpecificUserProfilePage /> : <LoginPage />} exact />

                    <Route path='/debt-accounts' element={<Navigate to="/debt_accounts" replace />} />
                    <Route path='/debt_accounts' element={isLoggedIn ? <DebtAccounts /> : <LoginPage />} exact />
                    <Route path='/debt_accounts/:debt_account_id' element={isLoggedIn ? <SpecificDebtAccountPage /> : <LoginPage />} exact />

                    <Route path='/vote' element={<VoterRedirectPageOne />} exact />
                    <Route path='/voting_completed' element={<VotingSessionClosedPage />} exact />
                    <Route path='/voting_sessions/' element={isLoggedIn ? <VotingSessionsPage /> : <LoginPage />} exact />
                    <Route path='/voting_sessions/:voting_session_id' element={isLoggedIn ? <SpecificVotingSessionPage /> : <LoginPage />} exact />
                    <Route path='/voting_sessions/:voting_session_id/vote' element={<VoterRedirectPageTwo />} exact />
                    <Route path='/voting_sessions/:voting_session_id/vote/:voter_key' element={<SpecificVoterPage />} exact />

                    <Route path='/testzone' element={<TestZone />} exact />
                    <Route path='/ip' element={<Navigate to="https://api.praeficio.com/api/my_ip" replace />} />
                    <Route path='/my_ip' element={<TestZone />} exact />
                    <Route path='/403' element={<ForbiddenPage />} exact />
                    <Route path='/500' element={<ErrorPage />} exact />
                    <Route path='/*' element={<NotFoundPage />} />
                  </Routes>
                </Suspense>
              </Router>
            </div>
          </ThemeContext.Provider >
        </IsLoggedInContext.Provider >
      </LanguageContext.Provider>
    </NextUIProvider >
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
