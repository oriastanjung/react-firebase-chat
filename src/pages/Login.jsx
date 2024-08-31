/* eslint-disable no-unused-vars */
// src/pages/Login.jsx
import { signInWithPopup, auth, provider } from "../firebase";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { useEffect } from "react";
import { collection, doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";

const Login = () => {
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await signInWithPopup(auth, provider);
      const user = response.user;
      
      // Check if user already exists in Firestore
      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        // Save user to Firestore if not exists
        await setDoc(userRef, {
          uid: user.uid,
          name: user.displayName,
          email: user.email,
        });
      }

      // Save token in cookies
      Cookies.set("_token", user.refreshToken, { expires: 1 });
      navigate("/chat");
    } catch (error) {
      console.error("Error signing in with Google", error);
    }
  };

  useEffect(() => {
    const token = Cookies.get("_token");
    if (token) {
      navigate("/chat");
    }
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 gap-10">
      <h2 className="font-bold">Welcome to Chat Apps</h2>
      <button
        onClick={handleLogin}
        className="p-4 rounded-full shadow flex items-center gap-2 border-black border"
      >
        <img src="https://sore-pixelcrafters.vercel.app/google-logo.png" alt="" className="w-4 h-4" />
        Sign In with Google
      </button>
    </div>
  );
};

export default Login;
