/* eslint-disable no-unused-vars */
import { collection, getDoc, setDoc, doc, getDocs, query, where, deleteDoc } from "firebase/firestore";
import { db, auth } from "../firebase";

const friendsRef = collection(db, "friends");
const usersRef = collection(db, "users");

const addUserIfNotExists = async (user) => {
  const userDocRef = doc(usersRef, user.uid);
  const userDocSnap = await getDoc(userDocRef);

  if (!userDocSnap.exists()) {
    await setDoc(userDocRef, {
      uid: user.uid,
      name: user.displayName || "Unknown",
      email: user.email || "No Email",
    });
  }
};

const addFriendIfNotExists = async (friendId) => {
  const userDocRef = doc(usersRef, friendId);
  const userDocSnap = await getDoc(userDocRef);

  if (!userDocSnap.exists()) {
    // Add friend to users collection with default values
    await setDoc(userDocRef, {
      uid: friendId,
      name: "Unknown",
      email: "No Email"
    });
  }
};

const addChatRoom = async (friendId) => {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("User is not authenticated");
  }

  // Add current user to Firestore if not exists
  await addUserIfNotExists(user);

  // Check if friend exists in Auth
  const friendAuth = await auth.getUser(friendId);
  if (!friendAuth) {
    throw new Error("Friend does not exist");
  }

  // Add friend to Firestore if not exists
  await addFriendIfNotExists(friendId);

  // Get current user data
  const userDocSnap = await getDoc(doc(usersRef, user.uid));
  if (!userDocSnap.exists()) {
    throw new Error("Current user does not exist");
  }
  const userData = userDocSnap.data();

  // Get friend data
  const friendDocSnap = await getDoc(doc(usersRef, friendId));
  if (!friendDocSnap.exists()) {
    throw new Error("Friend does not exist");
  }
  const friendData = friendDocSnap.data();

  // Create or update chat room document
  const chatRoomDocRef = doc(friendsRef, `${user.uid}_${friendId}`);
  const chatRoomData = {
    users: [
      { uid: user.uid, name: userData.name, email: userData.email },
      { uid: friendId, name: friendData.name, email: friendData.email }
    ],
    messages: []
  };

  await setDoc(chatRoomDocRef, chatRoomData);

  console.log("Chat room added successfully");
};


const getChatRooms = async (userId) => {
    try {
      const chatRoomSnapshots = await getDocs(query(friendsRef, where("users", "array-contains", { uid: userId })));
      const chatRooms = chatRoomSnapshots.docs.map(doc => doc.data());
  
      return chatRooms;
    } catch (error) {
      console.error("Error getting chat rooms:", error);
    }
  };



  const displayMessages = (messages, currentUserId) => {
    return messages.map(message => {
      const messageStyle = message.fromId === currentUserId
        ? { textAlign: 'right', backgroundColor: 'green' }
        : { textAlign: 'left', backgroundColor: 'white' };
  
      return (
        <div key={message.messageId} style={messageStyle}>
          <span>{message.text}</span>
        </div>
      );
    });
  };

export { addChatRoom,displayMessages,getChatRooms };
