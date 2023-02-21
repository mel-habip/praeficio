// import logo from './logo.gif';
import './App.css';
import React, { useState } from 'react';
import AnimatedButtonBox from './fields/AnimatedButtonBox';
import LoginPage from './pages/LoginPage';

function App() {
  document.body.style = 'background: lightsteelblue;';

  const sayHello = () => {
    console.log('Hello!');
  }



  return (
    <div className="App">
      <h1>Welcome to Mel's Portfolio Tracker App </h1>
      <div className="app-initial-buttons">
        <LoginPage />
      </div>
    </div>
  );
}

export default App;
