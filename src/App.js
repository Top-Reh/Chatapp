import React from 'react';
import { auth } from './firebase';
import {useAuthState} from 'react-firebase-hooks/auth'
import Navbar from './container/navbar';
import Home from './home';

const App = () => {
  const [user] = useAuthState(auth);
  return (
    <div className='app h-full w-full'>
      <Navbar/>
      {
        user && <Home/> 
      }
    </div>
  )
}

export default App
