import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchStoryById } from "../../api";
import DOMPurify from "dompurify";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Noto+Serif:ital,wght@0,400;0,700;1,400&family=Work+Sans:wght@300;400;500;600&display=swap');

  .story-detail {
    background: var(--surface);
    min-height: 100vh;
  }

  .story-hero {
    height: 100vh;
    width: 100%;
    position: relative;
    display: flex;
    align-items: flex-end;
    background: var(--primary);
    overflow: hidden;
  }

  .story-hero img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0.6;
  }

  .story-hero-gradient {
    position: absolute;
    inset: 0;
    background: linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 40%, rgba(0,0,0,0.8) 100%);
  }

  .story-hero-content {
    position: relative;
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem 6rem;
    color: white;
  }

  .story-hero-label {
    display: flex;
    align-items: center;
    gap: 1rem;
    color: var(--secondary);
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.3em;
    margin-bottom: 1.5rem;
  }

  .story-hero-label::before {
    content: '';
    width: 40px;
    height: 1px;
    background: var(--secondary);
  }

  .story-hero-title {
    font-family: 'Noto Serif', serif;
    font-size: clamp(3rem, 8vw, 6rem);
    line-height: 1.1;
    letter-spacing: -0.02em;
    margin-bottom: 2rem;
  }

  .story-hero-author {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .story-author-avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: var(--secondary);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
  }

  .story-body {
    max-width: 800px;
    margin: 0 auto;
    padding: 6rem 2rem 10rem;
  }

  .story-content {
    font-family: 'Work Sans', sans-serif;
    font-size: 1.25rem;
    line-height: 1.8;
    color: var(--on-surface-variant);
  }

  .story-content p {
    margin-bottom: 2.5rem;
  }

  .story-content p:first-of-type::first-letter {
    float: left;
    font-family: 'Noto Serif', serif;
    font-size: 5rem;
    line-height: 0.8;
    padding-top: 0.5rem;
    padding-right: 1rem;
    color: var(--primary);
  }

  .story-footer {
    border-top: 1px solid var(--outline-variant);
    margin-top: 6rem;
    padding-top: 4rem;
    text-align: center;
  }

  .back-to-stories {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    text-decoration: none;
    color: var(--secondary);
    font-weight: 700;
    font-size: 0.875rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }
`;

function StoryDetails() {
  const { id } = useParams();
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadStory = useCallback(async () => {
    try {
      const { data } = await fetchStoryById(id);
      setStory(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadStory();
  }, [loadStory]);

  if (loading) return <div style={{ padding: '10rem', textAlign: 'center' }}>Immersing in the narrative...</div>;
  if (!story) return <div style={{ padding: '10rem', textAlign: 'center' }}>The story has vanished.</div>;

  return (
    <>
      <style>{styles}</style>
      <div className="story-detail">
        <section className="story-hero">
          {story.coverImage && <img src={story.coverImage} alt={story.title} />}
          <div className="story-hero-gradient" />
          <div className="story-hero-content">
            <div className="story-hero-label">A Featured Narrative</div>
            <h1 className="story-hero-title">{story.title}</h1>
            <div className="story-hero-author">
              <div className="story-author-avatar">{story.author.charAt(0).toUpperCase()}</div>
              <div>
                <p style={{ fontWeight: 600 }}>{story.author}</p>
                <p style={{ fontSize: '0.75rem', opacity: 0.7 }}>
                  {story.readingTime || 10} MIN READ • {story.genre || "STORY"}
                </p>
              </div>
            </div>
          </div>
        </section>

        <article className="story-body">
          <div className="story-content" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(story.content) }} />
          
          <footer className="story-footer">
            <Link to="/home" className="back-to-stories">
              <span className="material-symbols-outlined">arrow_back</span>
              Return to Archives
            </Link>
          </footer>
        </article>
      </div>
    </>
  );
}

export default StoryDetails;
