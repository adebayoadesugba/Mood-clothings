import API from './axios';

// --- Auth Endpoints ---
export const loginUser = (credentials) => API.post('/auth/login', credentials);
export const registerUser = (userData) => API.post('/auth/register', userData);

// --- Product Endpoints ---
export const fetchAllProducts = () => API.get('/products');
export const fetchProductById = (id) => API.get(`/products/${id}`);
export const createProduct = (productData) => API.post('/products', productData);

// --- Order Endpoints ---
export const placeOrder = (orderData) => API.post('/orders', orderData);
export const fetchMyOrders = () => API.get('/orders/myorders');