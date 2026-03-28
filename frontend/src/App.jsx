import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AppNavbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PostDetails from "./pages/PostDetails";
import CreatePost from "./pages/CreatePost";
import Profile from "./pages/Profile";
import PoetryList from "./pages/PoetryList";
import PoetryDetails from "./pages/PoetryDetails";
import CreatePoetry from "./pages/CreatePoetry";

function App() {
  return (
    <Router>
      <AppNavbar />
      <div className="container mt-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/post/:id" element={<PostDetails />} />
          <Route path="/create" element={<CreatePost />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/poetry" element={<PoetryList />} />
          <Route path="/poetry/:id" element={<PoetryDetails />} />
          <Route path="/poetry/create" element={<CreatePoetry />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;