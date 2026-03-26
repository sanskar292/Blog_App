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

// POSTS — page and size match Spring's Pageable defaults
export const fetchPosts      = (page = 0, size = 5) => API.get(`/posts?page=${page}&size=${size}`);
export const fetchPostById   = (id)                  => API.get(`/posts/${id}`);
export const createNewPost   = (data)                => API.post("/posts", data);
export const updatePostById  = (id, data)            => API.put(`/posts/${id}`, data);
export const deletePostById  = (id)                  => API.delete(`/posts/${id}`);

// COMMENTS
export const fetchComments = (postId)          => API.get(`/comments/${postId}`);
export const createComment = (postId, content) => API.post(`/comments/${postId}`, { content });

// USERS
export const fetchUserProfile = () => API.get("/users/profile");
export const fetchUserPosts = (username, page = 0, size = 5) => API.get(`/users/${username}/posts?page=${page}&size=${size}`);

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