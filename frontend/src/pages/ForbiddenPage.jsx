import React, { useContext } from 'react';
import IsLoggedInContext from '../contexts/IsLoggedInContext';
import ThemeContext from '../contexts/ThemeContext';
import { Button } from '@nextui-org/react';
import { Link } from 'react-router-dom';

import NavMenu from '../components/NavMenu';

import centerpiece from '../media/gandalf-you-shall-not-pass.gif';


export default function ForbiddenPage() {
  const { isLoggedIn } = useContext(IsLoggedInContext);
  const { isDark, toggleTheme } = useContext(ThemeContext);

  return (
    <>
      {isLoggedIn && <NavMenu></NavMenu>}
      {!isLoggedIn && <Button
        css={{ width: '4rem', minWidth: '1rem', background: isDark ? 'lightgray' : 'black', color: isDark ? 'black' : 'white', position: 'fixed', left: '0%', top: '0%', margin: '1rem' }}
        onPress={toggleTheme}><i className={isDark ? "fa-regular fa-moon" : "fa-regular fa-sun"}></i></Button>}
      <h1>Ah! Sorry bud!</h1>
      <h2>Forbidden: You don't have access to this page 🙁 </h2>
      <h6>(this is a 403 error)</h6>
      <img src={centerpiece} alt="forbidden-no-access" width="500" style={{ 'border-radius': '15px', filter: `drop-shadow(0 -10px 4.5rem ${isDark ? 'blue' : 'orange'})` }} />
      <br></br>

      <div style={{ display: 'flex', flexDirection: 'row', width: '50%' }} >
        {/* <Link className='nav-links' onClick={() => window.history.back()} > Back</Link> */}
        <Link className='nav-links' onClick={() => window.history.go(-2)} > <i className="fa-solid fa-backward"></i> &nbsp;Back</Link>
        <Link to='/' className='nav-links' >
          Let's go home...
        </Link>
      </div>
    </>
  )
};