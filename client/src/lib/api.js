import { samplePosts, sampleCategories } from './sampleData';

const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// const BASE = '/api';
const TOKEN_KEY = 'afterglow_token';

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (t) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

async function request(path, { method = 'GET', body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const token = tokenStore.get();
  if (token) headers.Authorization = `Bearer ${token}`;
  let res;
  try {
    res = await fetch(`${BASE}${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
  } catch {
    throw new ApiError('Cannot reach the server. Check that the API is running.', 0);
  }
  const text = await res.text();
  let data = {};
  try { data = text ? JSON.parse(text) : {}; } catch { /* non-JSON error page */ }
  // The Vite proxy answers 5xx when the API is down.
  if (!res.ok) throw new ApiError(data.message || 'Cannot reach the server. Check that the API is running.', res.status >= 500 && !data.message ? 0 : res.status);
  return data;
}

// Public reads fall back to bundled sample posts when the API is offline,
// so the front end can be previewed on its own.
export const offline = { value: false };
async function readWithFallback(fn, fallback) {
  try {
    const out = await fn();
    offline.value = false;
    return out;
  } catch (e) {
    if (e.status === 0) {
      offline.value = true;
      return fallback();
    }
    throw e;
  }
}

const qs = (params = {}) => {
  const s = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== '' && v != null)).toString();
  return s ? `?${s}` : '';
};

export const api = {
  auth: {
    login: (b) => request('/auth/login', { method: 'POST', body: b }),
    register: (b) => request('/auth/register', { method: 'POST', body: b }),
    me: () => request('/auth/me'),
  },
  about: {
    profile: () => request('/about/profile'),
    updatePhoto: (photo) => request('/about/profile', { method: 'PUT', body: { photo } }),
    removePhoto: () => request('/about/profile', { method: 'DELETE' }),
  },
  posts: {
    list: (params) =>
      readWithFallback(
        () => request(`/posts${qs(params)}`),
        () => {
          const { search = '', category = '', page = 1, limit = 9 } = params || {};
          let rows = samplePosts.filter(
            (p) =>
              (!category || category === 'all' || p.category === category) &&
              (!search || `${p.title} ${p.excerpt} ${p.tags.join(' ')}`.toLowerCase().includes(search.toLowerCase()))
          );
          const total = rows.length;
          rows = rows.slice((page - 1) * limit, page * limit);
          return { posts: rows, page, pages: Math.max(1, Math.ceil(total / limit)), total };
        }
      ),
    featured: () => readWithFallback(() => request('/posts/featured'), () => ({ posts: samplePosts.filter((p) => p.featured).slice(0, 3) })),
    categories: () => readWithFallback(() => request('/posts/categories'), () => ({ categories: sampleCategories })),
    get: (slug) =>
      readWithFallback(
        () => request(`/posts/${slug}`),
        () => {
          const post = samplePosts.find((p) => p.slug === slug);
          if (!post) throw new ApiError('That post could not be found.', 404);
          return { post };
        }
      ),
    mine: () => request('/posts/mine'),
    byId: (id) => request(`/posts/id/${id}`),
    create: (b) => request('/posts', { method: 'POST', body: b }),
    update: (id, b) => request(`/posts/${id}`, { method: 'PUT', body: b }),
    remove: (id) => request(`/posts/${id}`, { method: 'DELETE' }),
    like: (id) => request(`/posts/${id}/like`, { method: 'POST' }),
    comments: (id) => readWithFallback(() => request(`/posts/${id}/comments`), () => ({ comments: [] })),
    addComment: (id, body) => request(`/posts/${id}/comments`, { method: 'POST', body: { body } }),
  },
  removeComment: (id) => request(`/comments/${id}`, { method: 'DELETE' }),
  subscribe: (email) => request('/newsletter', { method: 'POST', body: { email } }),
};
