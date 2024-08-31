/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/rules-of-hooks */
import { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { doc, onSnapshot, setDoc, getDoc } from "firebase/firestore";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Cookies from "js-cookie";
import moment from "moment";
const Chat = () => {
  const { chatRoomId } = useParams();
  const queriesUrl = useLocation();
  // Membuat instance URLSearchParams dari query string di location.search
  const queryParams = new URLSearchParams(location.search);
  // Mengambil nilai query parameter 'friendId'
  const friendId = queryParams.get("friendId");
  const [friendData, setFriendData] = useState("");
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  useEffect(() => {
    const token = Cookies.get("_token");
    if (!token) {
      navigate("/");
    }

    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        const chatRoomRef = doc(db, "chatrooms", `${chatRoomId}`);

        const unsubscribeChat = onSnapshot(chatRoomRef, (snapshot) => {
          const data = snapshot.data();

          if (data) {
            setMessages(data.messages || []);
          }
          setLoading(false); // Set loading to false after data is loaded
        });

        return () => unsubscribeChat();
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, [chatRoomId, navigate]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (messageText.trim() !== "") {
      const chatRoomRef = doc(db, "chatrooms", `${chatRoomId}`);
      try {
        const docSnapshot = await getDoc(chatRoomRef);
        const data = docSnapshot.data() || {};
        const newMessages = [
          ...(data.messages || []),
          {
            uid: auth.currentUser.uid,
            fromId: auth.currentUser.uid,
            timestamps: new Date().toISOString(), // Use new Date() instead of serverTimestamp()
            text: messageText,
          },
        ];

        await setDoc(chatRoomRef, { messages: newMessages }, { merge: true });
        setMessageText("");
      } catch (error) {
        console.error("Error sending message:", error);
      }
    }
  };

  useEffect(() => {
    const fetchFriendData = async () => {
      try {
        // Mengambil dokumen user berdasarkan friendId
        const userDoc = await getDoc(doc(db, "users", friendId));

        if (userDoc.exists()) {
          setFriendData(userDoc.data());
        } else {
          console.log("User not found");
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchFriendData();
  }, [friendId]);
  if (loading) return <div>Loading...</div>;

  return (
    <div className=" h-[90vh] flex flex-col relative">
      <div className="w-full bg-green-500 text-white p-4">
        {friendData && (
          <div>
            <p className="text-2xl font-extrabold">{friendData.name}</p>
            <p className="text-sm">{friendData.email}</p>
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col gap-8 h-[70vh] overflow-auto relative">
        {messages?.map((msg, index) => {
          const dateNow = moment(new Date());
          const dateChat = moment(new Date(msg.timestamps));
          return (
            <div
              key={index}
              className={`w-full ${
                msg.fromId === auth.currentUser.uid ? "flex justify-end" : ""
              }`}
            >
              <p
                className={`p-4 mb-2  w-fit flex flex-col ${
                  msg.fromId === auth.currentUser.uid
                    ? "bg-green-300 text-right rounded-lg relative right-0 shadow-md"
                    : "bg-white shadow-md border border-black rounded-lg text-left"
                }`}
              >
                <span>{msg.text}</span>
                <span className="text-xs">{dateNow.from(dateChat)}</span>
              </p>
            </div>
          );
        })}
      </div>
      <form
        onSubmit={handleSendMessage}
        className="p-4 flex absolute bottom-0 w-full"
      >
        <input
          type="text"
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          placeholder="Type a message"
          className="border border-black shadow-xl px-4 py-4 rounded-full mr-2 flex-1 "
        />
        <button
          type="submit"
          className="bg-green-500 text-white px-4 py-2 rounded-full"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default Chat;
