/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
// src/components/AddFriend.jsx
import React, { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  setDoc,
  doc,
} from "firebase/firestore";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
const AddFriend = () => {
  const [friendId, setFriendId] = useState("");
  const [userId, setUserId] = useState("");
  const navigate = useNavigate();

  const handleAddFriend = async (e) => {
    e.preventDefault()
    try {
      const currentUser = auth.currentUser;

      if (currentUser) {
        const userRef = doc(db, "users", currentUser.uid);
        const friendQuery = query(
          collection(db, "users"),
          where("uid", "==", friendId)
        );
        const friendSnapshot = await getDocs(friendQuery);
        const ids = [currentUser.uid, friendId]
        ids.sort()
        if (!friendSnapshot.empty) {
          // Create chat room
          const chatRoomRef = doc(
            db,
            "chatrooms",
            `${ids[0]}_${ids[1]}`
          );
          await setDoc(chatRoomRef, {
            users: [
              {
                uid: currentUser.uid,
                name: currentUser.displayName,
                email: currentUser.email,
              },
              {
                uid: friendId,
                name: friendSnapshot.docs[0].data().name,
                email: friendSnapshot.docs[0].data().email,
              },
            ],
            messages: [],
          });
          alert("Success! Friends chatrooms created!")
          navigate("/chat")
        } else {
          alert("User not found");
        }
      }
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    auth?.onAuthStateChanged(async (user) => {
      if (user) {
        setUserId(auth?.currentUser?.uid);
      }
    });
  }, [auth]);
  useEffect(() => {
    const token = Cookies.get("_token");
    if (!token) {
      navigate("/");
    }
  }, [navigate]);

  const copyClipboardId = () => {
    const id = userId;
    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(id)
        .then(() => {
          // console.log("ID copied :", id);
          // Anda bisa menambahkan notifikasi sukses di sini, misalnya:
          alert("ID berhasil disalin!");
        })
        .catch((error) => {
          // console.error("Failed to copy ID :", error);
          // Anda bisa menambahkan notifikasi kegagalan di sini, misalnya:
          alert("Gagal menyalin ID.");
        });
    } else {
      // Fallback jika browser tidak mendukung navigator.clipboard
      // console.error("Clipboard API tidak didukung di browser ini.");
      alert("Clipboard API tidak didukung di browser ini.");
    }
  };

  return (
    <div className="p-4 h-screen relative">
      <p className="mb-10 text-lg ">
        My user id :{" "}
        <div>
          <strong>{userId && userId}</strong>
          <button
            onClick={copyClipboardId}
            className=" ml-2 rounded-md p-4 bg-green-300"
          >
            Copy
          </button>
        </div>
      </p>
      <form className="absolute top-1/3" onSubmit={handleAddFriend}>
        <label className="text-xl"> Lets Add friends and start chat with them!</label>
        <input
          type="text"
          value={friendId}
          onChange={(e) => setFriendId(e.target.value)}
          placeholder="Friend's ID"
          className="border border-black px-4 py-5 rounded-lg mr-2 bg-white mt-5"
        />
        <button
          type="submit"
          className="bg-green-500 text-white px-4 py-5 rounded-lg"
        >
          Add Friend
        </button>
      </form>
    </div>
  );
};

export default AddFriend;
