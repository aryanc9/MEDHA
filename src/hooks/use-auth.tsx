
"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
  onAuthStateChanged,
  getAuth,
  User,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut as firebaseSignOut,
  sendEmailVerification,
} from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, onSnapshot } from "firebase/firestore";
import { firebaseApp } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { useRouter, usePathname } from "next/navigation";

const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

// Define a type for user settings
export interface UserSettings {
    [key: string]: any;
    studentScore?: number;
}


interface AuthContextType {
  user: User | null;
  userSettings: UserSettings | null;
  loading: boolean;
  signIn: (email: string, pass: string) => Promise<any>;
  signUp: (email: string, pass: string, fullName: string) => Promise<any>;
  signInWithGoogle: () => Promise<any>;
  signInWithGithub: () => Promise<any>;
  signOut: () => Promise<void>;
  updateUserSettings: (uid: string, settings: UserSettings) => Promise<void>;
  handleNewUserSetup: (user: User) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userSettings: null,
  loading: true,
  signIn: async () => {},
  signUp: async () => {},
  signInWithGoogle: async () => {},
  signInWithGithub: async () => {},
  signOut: async () => {},
  updateUserSettings: async () => {},
  handleNewUserSetup: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();

  const handleNewUserSetup = useCallback(async (user: User) => {
    const userDocRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(userDocRef);

    if (!docSnap.exists()) {
       // This is a new user, create their document
       await setDoc(userDocRef, {
            uid: user.uid,
            displayName: user.displayName,
            email: user.email,
            createdAt: new Date(),
            studentScore: 0,
        }, { merge: true });
        // Redirect to onboarding
        if (pathname !== '/onboarding') {
            router.push('/onboarding');
        }
        return;
    }

    const settings = docSnap.data();
    const hasCompletedOnboarding = settings.careerPath && settings.academicLevel;

    if (hasCompletedOnboarding) {
        // User has completed onboarding, send them to the dashboard if they are on a public/auth page
        if (pathname === '/onboarding' || pathname === '/login' || pathname === '/signup' || pathname === '/') {
             router.push('/dashboard');
        }
    } else {
        // User has not completed onboarding, send them there
         if (pathname !== '/onboarding') {
            router.push('/onboarding');
        }
    }
  }, [router, pathname]);


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      if (user) {
         if (!user.emailVerified && !user.providerData.some(p => p.providerId === GoogleAuthProvider.PROVIDER_ID || p.providerId === GithubAuthProvider.PROVIDER_ID)) {
            setUser(null);
            setUserSettings(null);
         } else {
            setUser(user);
         }
      } else {
        setUser(null);
        setUserSettings(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Listen for real-time updates to user settings
   useEffect(() => {
    if (user) {
      const docRef = doc(db, 'users', user.uid);
      const unsubscribe = onSnapshot(docRef, (doc) => {
        if(doc.exists()){
            const settings = doc.data() as UserSettings;
            setUserSettings(settings);
        } else {
            setUserSettings(null);
        }
      });
      return () => unsubscribe();
    }
  }, [user]);

  const signIn = async (email: string, pass: string) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, pass);
        if (userCredential.user && !userCredential.user.emailVerified) {
          await sendEmailVerification(userCredential.user);
          await firebaseSignOut(auth); // Sign out the user
          throw new Error("Please verify your email before logging in. A new verification email has been sent.");
        }
        return userCredential;
    } catch (error) {
        throw error;
    }
  };
  
  const signUp = async (email: string, pass: string, fullName: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    await updateProfile(userCredential.user, { displayName: fullName });
    
    const userDocRef = doc(db, "users", userCredential.user.uid);
    await setDoc(userDocRef, {
        uid: userCredential.user.uid,
        displayName: fullName,
        email: email,
        createdAt: new Date(),
        studentScore: 0,
    });

    await sendEmailVerification(userCredential.user);
    await firebaseSignOut(auth);
    return userCredential;
  };
  
  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    return await signInWithPopup(auth, provider);
  };
  
  const signInWithGithub = async () => {
    const provider = new GithubAuthProvider();
    return await signInWithPopup(auth, provider);
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    router.push('/');
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out."
    });
  };

  const updateUserSettings = async (uid: string, settings: UserSettings) => {
    const userDocRef = doc(db, "users", uid);
    await setDoc(userDocRef, settings, { merge: true });
  };

  return (
    <AuthContext.Provider value={{ user, userSettings, loading, signIn, signUp, signInWithGoogle, signInWithGithub, signOut, updateUserSettings, handleNewUserSetup }}>
      {children}
    </AuthContext.Provider>
  );
};


export const useAuth = () => useContext(AuthContext);
