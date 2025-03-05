import React from 'react'
import { auth, db  } from '../firebase';
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import GoogleButton from 'react-google-button';

const style = {
    wrapper : `
    flex justify-center
    `
}

const googleSignIn = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Reference to the user's document in Firestore
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    // If the user doesn't exist in Firestore, create a new document
    if (!userSnap.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        name: user.displayName.toLowerCase(),
        email: user.email,
        photoURL: user.photoURL,
        createdAt: serverTimestamp(),
      });
    }
  } catch (error) {
    console.error("Sign-in error:", error);
  }
};


const SignIn = () => {

  return (
    <div className={style.wrapper}>
        <GoogleButton onClick={() => googleSignIn()}/>
    </div>
  )
}

export default SignIn
