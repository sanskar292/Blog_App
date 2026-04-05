import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { fetchStories } from "../../api";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Noto+Serif:ital,wght@0,400;0,700;1,400&family=Work+Sans:wght@300;400;500;600&display=swap');
  
  :root {
    --primary: #000000;
    --secondary: #725b35;
    --surface: #fbf9f4;
    --surface-container: #f0eee9;
    --on-surface: #1b1c19;
    --on-surface-variant: #444748;
    --on-primary: #ffffff;
  }

  .stories-container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 2rem 2rem 5rem;
  }

  .stories-hero {
    height: 60vh;
    border-radius: 1rem;
    overflow: hidden;
    position: relative;
    margin-bottom: 4rem;
    background: var(--primary);
  }

  .stories-hero img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0.7;
  }

  .stories-hero-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 60%);
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    padding: 4rem;
  }

  .stories-hero-label {
    color: var(--secondary);
    font-family: 'Work Sans', sans-serif;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.4em;
    margin-bottom: 1rem;
  }

  .stories-hero-title {
    font-family: 'Noto Serif', serif;
    font-size: clamp(2.5rem, 5vw, 4.5rem);
    color: white;
    line-height: 1.1;
    margin-bottom: 1.5rem;
    max-width: 800px;
  }

  .stories-grid {
    display: grid;
    grid-template-columns: repeat(1, 1fr);
    gap: 3rem;
  }

  @media (min-width: 768px) {
    .stories-grid {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  .story-card {
    text-decoration: none;
    color: inherit;
    display: flex;
    flex-direction: column;
    group-hover: opacity: 0.9;
  }

  .story-image-box {
    aspect-ratio: 3/4;
    border-radius: 0.75rem;
    overflow: hidden;
    margin-bottom: 1.5rem;
    position: relative;
    background: var(--surface-container);
  }

  .story-image-box img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.8s ease;
  }

  .story-card:hover .story-image-box img {
    transform: scale(1.1);
  }

  .story-genre {
    position: absolute;
    top: 1rem;
    left: 1rem;
    background: rgba(255,255,255,0.2);
    backdrop-filter: blur(10px);
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    font-size: 0.65rem;
    font-weight: 600;
    text-transform: uppercase;
    color: white;
    letter-spacing: 0.1em;
  }

  .story-info-title {
    font-family: 'Noto Serif', serif;
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
    line-height: 1.3;
  }

  .story-info-author {
    font-size: 0.875rem;
    color: var(--on-surface-variant);
    font-family: 'Work Sans', sans-serif;
  }

  .story-info-meta {
    margin-top: 1rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    font-size: 0.75rem;
    color: var(--secondary);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }
`;

function Stories() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadStories = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await fetchStories(0, 12);
      setStories(data.content || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStories();
  }, [loadStories]);

  const featuredStory = stories[0];
  const otherStories = stories.slice(1);

  return (
    <>
      <style>{styles}</style>
      <div className="stories-container">
        {featuredStory && (
          <Link to={`/stories/${featuredStory.id}`} className="stories-hero">
            {featuredStory.coverImage ? (
              <img src={featuredStory.coverImage} alt={featuredStory.title} />
            ) : (
              <div style={{ width: "100%", height: "100%", background: "#1a1a1a" }} />
            )}
            <div className="stories-hero-overlay">
              <span className="stories-hero-label">Featured Narrative</span>
              <h1 className="stories-hero-title">{featuredStory.title}</h1>
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem', fontWeight: '500' }}>
                By {featuredStory.author} • {featuredStory.readingTime || 10} MIN READ
              </div>
            </div>
          </Link>
        )}

        <div className="stories-grid">
          {otherStories.map((story) => (
            <Link key={story.id} to={`/stories/${story.id}`} className="story-card">
              <div className="story-image-box">
                {story.coverImage ? (
                  <img src={story.coverImage} alt={story.title} />
                ) : (
                  <div style={{ width: "100%", height: "100%", background: "var(--surface-container)" }} />
                )}
                <span className="story-genre">{story.genre || "NARRATIVE"}</span>
              </div>
              <h2 className="story-info-title">{story.title}</h2>
              <p className="story-info-author">By {story.author}</p>
              <div className="story-info-meta">
                <span>{story.readingTime || 5} MIN READ</span>
                <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>arrow_forward</span>
              </div>
            </Link>
          ))}
        </div>

        {!loading && stories.length === 0 && (
          <div style={{ textAlign: 'center', padding: '5rem 0' }}>
            <p>Our library of stories is currently being curated. Check back soon.</p>
          </div>
        )}
      </div>
    </>
  );
}

export default Stories;
