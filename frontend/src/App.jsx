// import logo from './logo.gif';
// import './App.css';
import React, { useState, useEffect } from 'react';
import NavMenu from './components/NavMenu';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import ThemeContext from './contexts/ThemeContext';
import IsLoggedInContext from './contexts/IsLoggedInContext';
import { NextUIProvider } from '@nextui-org/react';

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

  let isLoggedInInitial = false;
  const [isLoggedIn, setIsLoggedIn] = useState(isLoggedInInitial);

  const toggleTheme = () => {
    setDark(!isDark);
  }

  useEffect(() => { //provides the persistence, makes doc attribute update when StateLoads
    console.log('isDarkState', isDark);
    document.documentElement.setAttribute("data-theme", isDark ? 'dark' : 'light');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark])

  return (
    <NextUIProvider theme={isDark ? 'dark' : 'light'}>
      <IsLoggedInContext.Provider value={{ isLoggedIn, setIsLoggedIn }}>
        <ThemeContext.Provider value={{ isDark, toggleTheme }}>
          <div className="App" style={{ height: "100vh" }}>
            <Router >
              {isLoggedIn ? <NavMenu /> : <LoginPage />}
              <Routes>
                <Route path='/' exact component={LoginPage} /> here?
                {/* <Route path='/services' component={Services} />
          <Route path='/products' component={Products} />
          <Route path='/sign-up' component={SignUp} /> */}
              </Routes>
            </Router>
          </div>
        </ThemeContext.Provider >
      </IsLoggedInContext.Provider >
    </NextUIProvider>
  );
}

export default App;
