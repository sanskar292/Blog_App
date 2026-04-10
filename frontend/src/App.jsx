import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import LandingPage from "./pages/LandingPage";
import Home from "./pages/Home";
import Articles from "./pages/article/Articles";
import ArticleDetails from "./pages/article/ArticleDetails";
import CreateArticle from "./pages/article/CreateArticle";
import EditArticle from "./pages/article/EditArticle";
import PoetryHome from "./pages/poetry/PoetryHome";
import PoetryDetails from "./pages/poetry/PoetryDetails";
import CreatePoetry from "./pages/poetry/CreatePoetry";
import Stories from "./pages/story/Stories";
import StoryDetails from "./pages/story/StoryDetails";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Search from "./pages/Search";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/home" element={<Layout><Home /></Layout>} />
        <Route path="/articles" element={<Layout><Articles /></Layout>} />
        <Route path="/article/:id" element={<Layout><ArticleDetails /></Layout>} />
        <Route path="/article/edit/:id" element={<EditArticle />} />
        <Route path="/create" element={<CreateArticle />} />
        <Route path="/poetry" element={<PoetryHome />} />
        <Route path="/poetry/:id" element={<Layout><PoetryDetails /></Layout>} />
        <Route path="/poetry/create" element={<Layout><CreatePoetry /></Layout>} />
        <Route path="/stories" element={<Layout><Stories /></Layout>} />
        <Route path="/stories/:id" element={<Layout><StoryDetails /></Layout>} />
        <Route path="/login" element={<Layout><Login /></Layout>} />
        <Route path="/register" element={<Layout><Register /></Layout>} />
        <Route path="/profile" element={<Layout><Profile /></Layout>} />
        <Route path="/search" element={<Layout><Search /></Layout>} />
      </Routes>
    </Router>
  );
}

export default App;
