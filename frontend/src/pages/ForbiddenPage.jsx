import React, { useContext } from 'react';
import ThemeContext from '../contexts/ThemeContext';
import { Link } from 'react-router-dom';

import NavMenu from '../components/NavMenu';

import centerpiece from '../media/gandalf-you-shall-not-pass.gif';


export default function ForbiddenPage() {
  const { isDark, toggleTheme } = useContext(ThemeContext);

  return (
    <>
      <NavMenu/>
      <h1>Ah! Sorry bud!</h1>
      <h2>Forbidden: You don't have access to this page 🙁 </h2>
      <h6>(this is a 403 error)</h6>
      <img src={centerpiece} alt="forbidden-no-access" width="500" style={{ borderRadius: '15px', filter: `drop-shadow(0 -10px 4.5rem ${isDark ? 'blue' : 'orange'})` }} />
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