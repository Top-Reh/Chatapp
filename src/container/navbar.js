import React from 'react'
import { auth } from '../firebase';
import {useAuthState} from 'react-firebase-hooks/auth'
import SignIn from './signIn';
import Signout from './signout';
import { useMediaQuery } from 'react-responsive';
import styled from 'styled-components';

const Navbar = () => {
    const [user, loading, error] = useAuthState(auth);
    const isMobile = useMediaQuery({ maxWidth: 768 });

    const Nav = styled.div`
    padding:${isMobile ? '10px' : '7px'};
    height:90px
    `;

  return (
    <Nav className='nav w-full flex justify-between align-middle bg-gray-100'>
      <h1 className='font-extrabold text-4xl'>Chatting</h1>
      {
        user ? <Signout/> : <SignIn/>
      }
    </Nav>
  )
}

export default Navbar