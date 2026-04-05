// Centralized Image Utility for fallbacks and thumbnail management

const DEFAULT_IMAGES = {
  article: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&q=80",
  poetry:  "https://images.unsplash.com/photo-1473186578172-c141e6798ee4?w=800&q=80",
  story:   "https://images.unsplash.com/photo-1474932430478-3a7fbaf52839?w=800&q=80",
  user:    "https://images.unsplash.com/photo-1511367461989-f85a21fda181?w=400&q=80"
};

/**
 * Returns a valid thumbnail URL. If the provided URL is invalid or empty, 
 * returns a category-specific default placeholder.
 */
export const getThumbnail = (url, type = "article") => {
  if (!url || url.trim() === "") {
    return DEFAULT_IMAGES[type] || DEFAULT_IMAGES.article;
  }
  return url;
};

/**
 * Image error handler to be used in 'onError' event of <img> tags.
 * Replaces broken images with a fallback placeholder.
 */
export const handleImageError = (e, type = "article") => {
  e.target.onerror = null; // Prevent infinite loops
  e.target.src = DEFAULT_IMAGES[type] || DEFAULT_IMAGES.article;
};

export default {
  getThumbnail,
  handleImageError,
  DEFAULT_IMAGES
};
