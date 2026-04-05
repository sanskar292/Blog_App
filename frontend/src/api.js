import axios from "axios";

const API = axios.create({
 baseURL: "https://blogapp-backend-amwi.onrender.com/api",
});

// Attach JWT token
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

// Log errors for debugging
API.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error(
      `[API Error] ${err.config?.method?.toUpperCase()} ${err.config?.url}`,
      "→ Status:", err.response?.status,
      "→ Message:", err.response?.data
    );
    return Promise.reject(err);
  }
);

// AUTH
export const registerUser = (data) => API.post("/auth/register", data);
export const loginUser    = (data) => API.post("/auth/login", data);

// ARTICLES (formerly Posts)
export const fetchArticles      = (page = 0, size = 5) => API.get(`/articles?page=${page}&size=${size}`);
export const fetchArticleById   = (id)                  => API.get(`/articles/${id}`);
export const searchArticles     = (query, page = 0, size = 5) => API.get(`/articles/search?q=${query}&page=${page}&size=${size}`);
export const createNewArticle   = (data)                => API.post("/articles", data);
export const updateArticleById  = (id, data)            => API.put(`/articles/edit/${id}`, data);
export const deleteArticleById  = (id)                  => API.delete(`/articles/${id}`);

// COMMENTS
export const fetchComments = (articleId) => API.get(`/comments/${articleId}`);
export const createComment = (articleId, content) => API.post(`/comments/${articleId}`, { content });

// USERS
export const fetchUserProfile = () => API.get("/users/profile");
export const fetchUserArticles = (username, page = 0, size = 5) => API.get(`/users/${username}/posts?page=${page}&size=${size}`);

// POETRY
export const fetchPoems = (page = 0, size = 6) => API.get(`/poetry?page=${page}&size=${size}`);
export const fetchPoemById = (id) => API.get(`/poetry/${id}`);
export const createNewPoem = (data) => API.post("/poetry", data);
export const updatePoemById = (id, data) => API.put(`/poetry/${id}`, data);
export const deletePoemById = (id) => API.delete(`/poetry/${id}`);
export const fetchPoemsByAuthor = (author, page = 0, size = 6) => API.get(`/poetry/author/${author}?page=${page}&size=${size}`);

// POETRY COMMENTS
export const fetchPoetryComments = (poetryId) => API.get(`/poetry-comments/${poetryId}`);
export const createPoetryComment = (poetryId, content) => API.post(`/poetry-comments/${poetryId}`, content, {
  headers: { "Content-Type": "application/json" }
});

// STORIES
export const fetchStories = (page = 0, size = 10) => API.get(`/stories?page=${page}&size=${size}`);
export const fetchStoryById = (id) => API.get(`/stories/${id}`);
export const createStory = (data) => API.post("/stories", data);

// Decode JWT to get logged-in username
export const getLoggedInUser = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.sub;
  } catch {
    return null;
  }
};

export default API;
