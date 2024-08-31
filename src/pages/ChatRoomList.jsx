/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { db, auth, signOut } from "../firebase";
import {
  collection,
  onSnapshot,
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import moment from "moment";
const ChatRoomList = () => {
  const [chatRooms, setChatRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = Cookies.get("_token");
    if (!token) {
      navigate("/");
    }
    const unsubscribeAuth = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const chatRoomRef = collection(db, "chatrooms");

        const unsubscribeChat = onSnapshot(chatRoomRef, async (snapshot) => {
          const allRooms = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          // Filter rooms where currentUser.uid is in the users array
          const filteredRooms = allRooms.filter((room) =>
            room.users?.some((user) => user.uid === auth.currentUser.uid)
          );

          console.log("Filtered chat rooms:", filteredRooms); // Debug output
          setChatRooms(filteredRooms);
          setLoading(false); // Set loading to false once data is received
        });

        return () => unsubscribeChat();
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, [navigate]);

  const getChatRoomId = (ids) => {
    console.log("ids >> ", ids);
    ids.sort(); // Sort to ensure consistent ordering
    return `${ids[0]}_${ids[1]}`;
  };

  const handleChatClick = (friendId) => {
    const chatRoomId = getChatRoomId([auth.currentUser.uid, friendId]);
    navigate(`/chat/${chatRoomId}?friendId=${friendId}`);
  };

  if (loading) {
    return <p>Loading...</p>;
  }
  const handleLogout = async ()=>{
    await signOut(auth)
    Cookies.remove("_token")
    navigate("/")
  }
  return (
    <div className="p-4  h-screen overflow-hidden relative ">
      <div className="my-5 text-2xl">
        Hallo , <strong>{auth?.currentUser?.displayName}</strong>
      </div>
      <div className="mb-10">
        <Link to={'/add-friend'} className="bg-green-500 text-white px-3 py-2 rounded-md">Add Friends</Link>
      </div>
      <div className="flex flex-col items-center w-full gap-5 h-[50vh] overflow-scroll">
        {chatRooms.length === 0 ? (
          <p>No chat rooms available</p>
        ) : (
          chatRooms.map((room) => {
            const dateNow = moment(new Date());
            const dateChat =
              room.messages.length > 0 &&
              moment(
                new Date(room.messages[room.messages.length - 1].timestamps)
              );
            return (
              <div
                key={room.id}
                onClick={() =>
                  handleChatClick(
                    room.users.find((user) => user.uid !== auth.currentUser.uid)
                      ?.uid
                  )
                }
                className="p-4 border border-black bg-white  bg-opacity-5 backdrop-blur rounded-xl cursor-pointer w-full h-28 "
              >
                <div className="flex flex-col gap-1">
                  <p className="font-base text-sm flex flex-row w-full justify-between">
                    <span>
                      {
                        room.users.find(
                          (user) => user.uid !== auth.currentUser.uid
                        )?.name
                      }
                    </span>
                    <span>
                      {
                        room.users.find(
                          (user) => user.uid !== auth.currentUser.uid
                        )?.email
                      }
                    </span>
                  </p>
                  <p className="font-medium text-lg ">
                    {room.messages.length > 0 &&
                      room.messages[room.messages.length - 1].text}
                  </p>
                  <div className="w-full flex justify-end">
                    <p>{dateNow.from(dateChat) === "Invalid date" ? "Start Chat Now" :dateNow.from(dateChat)}</p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
      <div className="my-5 flex items-center justify-center absolute w-full bottom-10">
        <button onClick={handleLogout} className="bg-red-500 text-white px-3 py-2 rounded-full w-1/4">
          Logout
        </button>
      </div>
    </div>
  );
};

export default ChatRoomList;
