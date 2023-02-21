import React, { useState } from 'react';
import styled from 'styled-components';
import { GiPartyPopper } from "react-icons/gi";
import { AiFillFire } from "react-icons/ai"; 

import logo from '../logo.gif';

const Crazy = () => (<><AiFillFire/><GiPartyPopper/><AiFillFire/><GiPartyPopper/><AiFillFire/><GiPartyPopper/></>);

function Portal(is_logged_in=true) {

  const [logged_in, setLoggedIn] = useState(is_logged_in);

  return (
    <div>
      <h1>Portal <Crazy /></h1>
      <img src={logo} alt="welcome" />

    </div>
  )
}

export default Portal;


