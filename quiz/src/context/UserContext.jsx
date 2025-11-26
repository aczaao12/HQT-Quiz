import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../../firebase';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

const UserContext = createContext();

export const useUser = () => {
  return useContext(UserContext);
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Firebase Auth user object
  const [userData, setUserData] = useState(null); // Firestore user document
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const userRef = doc(db, 'users', firebaseUser.uid);
        const docSnap = await getDoc(userRef);

        if (!docSnap.exists()) {
          // New user, create a profile in Firestore
          const newUserDoc = {
            name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
            email: firebaseUser.email,
            role: 'student', // Default role
            organization_id: 'default_org', // Placeholder for now
            created_at: serverTimestamp(),
          };
          await setDoc(userRef, newUserDoc);
          setUserData(newUserDoc);
        } else {
          // Existing user, fetch their data
          setUserData(docSnap.data());
        }
      } else {
        setUserData(null); // Clear user data on logout
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const value = {
    user,
    userData,
    loading,
    setUserData, // Allow updating user data from other components if needed
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};
