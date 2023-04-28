import React, { useContext, useState, useEffect, lazy } from 'react';
import IsLoggedInContext from '../contexts/IsLoggedInContext';
import ThemeContext from '../contexts/ThemeContext';
import { Button } from '@nextui-org/react';
import { Link } from 'react-router-dom';

import NavMenu from '../components/NavMenu';

import centerpiece from '../crying.jpg';


const images = ['crying.jpg', "this_is_fine.gif", "ok_boomer.jpg", 'awkward_dog.jpg'];

function NotFoundPage() {
  const { isLoggedIn } = useContext(IsLoggedInContext);
  const { isDark, toggleTheme } = useContext(ThemeContext);
  const [imageSrc, setImageSrc] = useState(null);

  useEffect(() => {
    const randomNumber = Math.floor(Math.random() * images.length);
    console.log(randomNumber);
    import(`../${images[randomNumber]}`).then(image => {
      setImageSrc(image.default);
    });
  }, []);

  return (
    <>
      {isLoggedIn && <NavMenu></NavMenu>}
      {!isLoggedIn && <Button
        css={{ width: '4rem', minWidth: '1rem', background: isDark ? 'lightgray' : 'black', color: isDark ? 'black' : 'white', position: 'fixed', left: '0%', top: '0%', margin: '1rem' }}
        onPress={toggleTheme}><i className={isDark ? "fa-regular fa-moon" : "fa-regular fa-sun"}></i></Button>}
      <h1>Oopsie-daisie!</h1>
      <h2>You stumbled here but there is nothing to see!</h2>
      <h6>(this is a 404 error)</h6>
      {imageSrc &&
        <img
          src={imageSrc}
          alt="sad cat on not found page"
          width="500"
          style={{ borderRadius: '15px', filter: `drop-shadow(0 -10px 4.5rem ${isDark ? 'blue' : 'orange'})` }} />
      }
      <br />
      <div style={{ display: 'flex', flexDirection: 'row', width: '50%' }} >
        <Link className='nav-links' onClick={() => window.history.go(-1)} > <i className="fa-solid fa-backward"></i> &nbsp;Back</Link>
        <Link to='/' className='nav-links' >
          Let's go home...
        </Link>
      </div>
    </>
  )
}

export default NotFoundPage;