import React from 'react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';


const style = {
    signout:`
        bg-blue-500 px-8 py-4 text-white rounded-xl font-bold text-xl mg-0
    `
}

const Signout = () => {
    const handleSignOut = () => {
        signOut(auth);
        console.log('already log out')
    };
    

  return (
    <button onClick={handleSignOut} className={style.signout}>Signout</button>
  )
}

export default Signout