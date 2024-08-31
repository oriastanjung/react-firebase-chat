import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Chat from "./pages/Chat";
import AddFriend from "./pages/AddFriend";
import ChatRoomList from "./pages/ChatRoomList";

const App = () => {
  return (
    <Router>
      <div
        className="bg-cover bg-center min-h-screen "
        style={{ backgroundImage: "url('/background.png')" }}
      >
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/chat" element={<ChatRoomList />} />
          <Route path="/chat/:chatRoomId" element={<Chat />} />
          <Route path="/add-friend" element={<AddFriend />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
