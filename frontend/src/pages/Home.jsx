import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { fetchArticles, fetchPoems, fetchStories } from "../api";
import { getThumbnail, handleImageError } from "../utils/imageUtils";
import "./Home.css";

const stripHtml = (html) => {
  const tmp = document.createElement("div");
  tmp.innerHTML = html || "";
  return tmp.textContent || tmp.innerText || "";
};

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

function Home() {
  const [data, setData] = useState({ posts: [], poems: [], stories: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const loadData = useCallback(async (filter) => {
    setLoading(true);
    setError(null);
    try {
      if (filter === "all") {
        const [postsRes, poemsRes, storiesRes] = await Promise.all([
          fetchArticles(0, 8),
          fetchPoems(0, 4),
          fetchStories(0, 4)
        ]);
        setData({
          posts: postsRes.data.content || [],
          poems: poemsRes.data.content || [],
          stories: storiesRes.data.content || []
        });
      } else if (filter === "poetry") {
        const res = await fetchPoems(0, 12);
        setData({ posts: [], stories: [], poems: res.data.content || [] });
      } else if (filter === "articles") {
        const res = await fetchArticles(0, 12);
        setData({ poems: [], stories: [], posts: res.data.content || [] });
      } else if (filter === "stories") {
        const res = await fetchStories(0, 12);
        setData({ posts: [], poems: [], stories: res.data.content || [] });
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to load content. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(activeFilter);
  }, [activeFilter, loadData]);

  const renderArticle = (article) => (
    <article key={article.id} className="feed-item">
      <div className="item-main">
        <div className="item-meta">
          <div className="author-avatar">{article.author?.charAt(0).toUpperCase()}</div>
          <span className="author-name">{article.author}</span>
          <span className="meta-dot">·</span>
          <span className="item-date">{formatDate(article.createdAt)}</span>
        </div>
        <Link to={`/article/${article.id}`} className="item-link">
          <h2 className="item-title">{article.title}</h2>
          <p className="item-excerpt">{stripHtml(article.content).substring(0, 160)}...</p>
        </Link>
        <div className="item-footer">
          <span className="item-tag">Article</span>
          <span className="read-time">
            {Math.max(1, Math.round(stripHtml(article.content).split(/\s+/).length / 200))} min read
          </span>
        </div>
      </div>
      <div className="item-image-wrapper">
        <img 
          src={getThumbnail(article.coverImage, "article")} 
          alt={article.title} 
          className="item-image" 
          onError={(e) => handleImageError(e, "article")}
        />
      </div>
    </article>
  );

  const renderPoem = (poem) => (
    <article key={poem.id} className="feed-item poetry-item">
      <div className="item-main">
        <div className="item-meta">
          <div className="author-avatar poetry-avatar">{poem.author?.charAt(0).toUpperCase()}</div>
          <span className="author-name">{poem.author}</span>
          <span className="meta-dot">·</span>
          <span className="item-date">{formatDate(poem.createdAt)}</span>
        </div>
        <Link to={`/poetry/${poem.id}`} className="item-link">
          <h2 className="item-title poetry-title-font">{poem.title}</h2>
          <p className="item-excerpt poetry-excerpt">
            {stripHtml(poem.content).substring(0, 100)}...
          </p>
        </Link>
        <div className="item-footer">
          <span className="item-tag tag-poetry">Poetry</span>
          {poem.mood && <span className="item-mood">{poem.mood}</span>}
        </div>
      </div>
      <div className="item-image-wrapper poetry-thumb">
        <img 
          src={getThumbnail(null, "poetry")} 
          alt={poem.title} 
          className="item-image" 
          onError={(e) => handleImageError(e, "poetry")}
        />
      </div>
    </article>
  );

  const renderStory = (story) => (
    <article key={story.id} className="feed-item">
      <div className="item-main">
        <div className="item-meta">
          <div className="author-avatar story-avatar">{story.author?.charAt(0).toUpperCase() || 'S'}</div>
          <span className="author-name">{story.author || "Versa Storyteller"}</span>
          <span className="meta-dot">·</span>
          <span className="item-date">{formatDate(story.createdAt)}</span>
        </div>
        <Link to={`/stories/${story.id}`} className="item-link">
          <h2 className="item-title">{story.title}</h2>
          <p className="item-excerpt">{stripHtml(story.content).substring(0, 160)}...</p>
        </Link>
        <div className="item-footer">
          <span className="item-tag tag-story">Story</span>
          <span className="item-genre">{story.genre || "Narrative"}</span>
        </div>
      </div>
      <div className="item-image-wrapper">
        <img 
          src={getThumbnail(story.coverImage, "story")} 
          alt={story.title} 
          className="item-image" 
          onError={(e) => handleImageError(e, "story")}
        />
      </div>
    </article>
  );

  return (
    <div className="home-container">
      <div className={`home-layout ${isSidebarOpen ? '' : 'layout-focused'}`}>
        
        {/* Floating Toggle Button */}
        <button 
          className="sidebar-toggle-btn" 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          title={isSidebarOpen ? "Enter Focus Mode" : "Show Sidebars"}
        >
          <span className="material-symbols-outlined">
            {isSidebarOpen ? "visibility" : "visibility_off"}
          </span>
        </button>

        {/* Left Sidebar - Navigation */}
        <aside className="sidebar">
          <nav className="sidebar-nav">
            <button 
              className={`sidebar-link ${activeFilter === "all" ? "active" : ""}`}
              onClick={() => setActiveFilter("all")}
            >
              <span className="material-symbols-outlined">home</span>
              Home
            </button>
            <button 
              className={`sidebar-link ${activeFilter === "articles" ? "active" : ""}`}
              onClick={() => setActiveFilter("articles")}
            >
              <span className="material-symbols-outlined">article</span>
              Articles
            </button>
            <button 
              className={`sidebar-link ${activeFilter === "poetry" ? "active" : ""}`}
              onClick={() => setActiveFilter("poetry")}
            >
              <span className="material-symbols-outlined">auto_awesome</span>
              Poetry
            </button>
            <button 
              className={`sidebar-link ${activeFilter === "stories" ? "active" : ""}`}
              onClick={() => setActiveFilter("stories")}
            >
              <span className="material-symbols-outlined">auto_stories</span>
              Stories
            </button>
          </nav>
          <div className="sidebar-divider"></div>
          <div className="sidebar-footer">
            <p>© 2026 Versa Editorial</p>
          </div>
        </aside>

        {/* Main Feed Content */}
        <main className="feed-main">
          {error && <div className="error-message">{error}</div>}

          <div className="feed-items">
            {loading ? (
              <div className="loading-shimmer">
                {[1, 2, 3].map(i => (
                  <div key={i} className="shimmer-item">
                    <div className="shimmer-meta"></div>
                    <div className="shimmer-title"></div>
                    <div className="shimmer-excerpt"></div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                {/* Interleaved Feed */}
                {activeFilter === "all" ? (
                  <>
                    {/* Combine and sort by date ideally, but for now just interleave sections */}
                    {data.posts.map(renderArticle)}
                    {data.poems.map(renderPoem)}
                    {data.stories.map(renderStory)}
                  </>
                ) : (
                  <>
                    {activeFilter === "articles" && data.posts.map(renderArticle)}
                    {activeFilter === "poetry" && data.poems.map(renderPoem)}
                    {activeFilter === "stories" && data.stories.map(renderStory)}
                  </>
                )}
                
                {!loading && data.posts.length === 0 && data.poems.length === 0 && data.stories.length === 0 && (
                  <div className="empty-state">
                    <h3>No content found</h3>
                    <p>Try switching filters or check back later.</p>
                  </div>
                )}
              </>
            )}
          </div>
        </main>

        {/* Right Sidebar - Trending/About (Fixed on desktop) */}
        <aside className="right-sidebar">
          <div className="trending-container">
            <h3 className="section-heading">Trending on Versa</h3>
            <div className="trending-items">
              {data.posts.slice(0, 3).map((post, i) => (
                <div key={post.id} className="trending-item">
                  <span className="trending-number">0{i+1}</span>
                  <div className="trending-content">
                    <div className="trending-meta">{post.author}</div>
                    <Link to={`/article/${post.id}`} className="trending-link">
                      <h4 className="trending-title">{post.title}</h4>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="staff-picks">
             <h3 className="section-heading">Curator's Picks</h3>
             {data.poems.slice(0, 2).map(poem => (
               <div key={poem.id} className="pick-item">
                 <Link to={`/poetry/${poem.id}`} className="pick-link">
                    <p className="pick-title">{poem.title}</p>
                    <span className="pick-author">{poem.author}</span>
                 </Link>
               </div>
             ))}
          </div>
        </aside>
      </div>
    </div>
  );
}

export default Home;
