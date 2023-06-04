import { useContext, lazy, useState, useEffect } from 'react';
import IsLoggedInContext from '../contexts/IsLoggedInContext';
import ThemeContext from '../contexts/ThemeContext';
import { Button } from '@nextui-org/react';
import { Link } from 'react-router-dom';

const NavMenu = lazy(() => import('../components/NavMenu'));

const images = ['chaos.gif', 'sponge_bob_flames.gif'];


export default function ErrorPage() {
  document.title = "Praeficio.com | Error";

  const { isLoggedIn } = useContext(IsLoggedInContext);
  const { isDark, toggleTheme } = useContext(ThemeContext);

  const [imageSrc, setImageSrc] = useState(null);

  useEffect(() => {
    const randomNumber = Math.floor(Math.random() * images.length);
    console.log(randomNumber);
    import(`../media/${images[randomNumber]}`).then(image => {
      setImageSrc(image.default);
    });
  }, []);

  return (
    <>
      {isLoggedIn && <NavMenu/>}
      {!isLoggedIn && <Button
        css={{ width: '4rem', minWidth: '1rem', background: isDark ? 'lightgray' : 'black', color: isDark ? 'black' : 'white', position: 'fixed', left: '0%', top: '0%', margin: '1rem' }}
        onPress={toggleTheme}><i className={isDark ? "fa-regular fa-moon" : "fa-regular fa-sun"}></i></Button>}
      <h1>Crappity-Crappadoo! </h1>
      <h2>Something went horribly wrong while servicing your request 😱😱😱 </h2>
      <h6>(this is a 500 error)</h6>
      <img
        src={imageSrc}
        alt="chaos gif on global error page"
        width="500"
        style={{ borderRadius: '15px', filter: `drop-shadow(0 -10px 4.5rem ${isDark ? 'red' : 'orange'})` }} />

      <div style={{ display: 'flex', flexDirection: 'row', width: '50%', justifyContent: 'space-around' }} >
        {/* <Link className='nav-links' onClick={() => window.history.back()} > Back</Link> */}
        <Link className='nav-links' onClick={() => window.history.go(-2)} > <i className="fa-solid fa-backward"></i> &nbsp;Back</Link>
        <Link to='/' className='nav-links' >
          Let's go home...
        </Link>
      </div>
    </>
  )
};