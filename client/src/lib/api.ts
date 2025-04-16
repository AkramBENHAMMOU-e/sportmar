// Client-side API configuration

// Base URL for API requests
const apiBaseUrl = import.meta.env.PROD 
  ? 'https://sport-maroc-shop.vercel.app/api' // Production
  : '/api'; // Development

// Timeout configuration
const API_TIMEOUT = 10000; // 10 seconds

// Function to fetch with timeout
const fetchWithTimeout = async (url: string, options: RequestInit = {}) => {
  const controller = new AbortController();
  const { signal } = controller;
  
  const timeout = setTimeout(() => controller.abort(), API_TIMEOUT);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    
    if (!response.ok) {
      throw new Error(`${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Request timeout');
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
};

// API client with methods for each endpoint
export const api = {
  // User endpoints
  user: {
    getCurrent: () => fetchWithTimeout(`${apiBaseUrl}/user`),
    login: (data: any) => fetchWithTimeout(`${apiBaseUrl}/auth/login`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    register: (data: any) => fetchWithTimeout(`${apiBaseUrl}/auth/register`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    logout: () => fetchWithTimeout(`${apiBaseUrl}/auth/logout`),
  },
  
  // Product endpoints
  products: {
    getAll: () => fetchWithTimeout(`${apiBaseUrl}/products`),
    getFeatured: () => fetchWithTimeout(`${apiBaseUrl}/products/featured`),
    getById: (id: number) => fetchWithTimeout(`${apiBaseUrl}/products/${id}`),
    getByCategory: (category: string) => fetchWithTimeout(`${apiBaseUrl}/products/category/${category}`),
  },
  
  // Cart endpoints
  cart: {
    get: () => fetchWithTimeout(`${apiBaseUrl}/cart`),
    add: (data: any) => fetchWithTimeout(`${apiBaseUrl}/cart`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    remove: (productId: number) => fetchWithTimeout(`${apiBaseUrl}/cart/${productId}`, {
      method: 'DELETE',
    }),
    clear: () => fetchWithTimeout(`${apiBaseUrl}/cart`, {
      method: 'DELETE',
    }),
  },
  
  // Check API status
  health: () => fetchWithTimeout(`${apiBaseUrl}/debug`),
};

// Function to get mock data during API outages
export const getMockData = (endpoint: string) => {
  // Mock data for different endpoints
  const mockData = {
    user: null,
    'products/featured': [
      { 
        id: 1, 
        name: "Whey Protein Premium", 
        price: 35000, 
        description: "Protéine de haute qualité pour la récupération musculaire", 
        imageUrl: "https://res.cloudinary.com/df59lsiz9/image/upload/v1717007292/sportmaroc/whey_protein_qjlh3v.jpg",
        category: "supplement",
        subcategory: "proteines",
        stock: 15,
        featured: true
      },
      {
        id: 2,
        name: "Tapis de Yoga Pro",
        price: 25000,
        description: "Tapis antidérapant haute densité pour yoga et fitness",
        imageUrl: "https://res.cloudinary.com/df59lsiz9/image/upload/v1717007292/sportmaroc/yoga_mat_pz5dml.jpg",
        category: "equipment",
        subcategory: "fitness",
        stock: 8,
        featured: true
      }
    ],
    cart: []
  };
  
  // Return appropriate mock data
  return mockData[endpoint] || null;
};

// Function to fetch with fallback to mock data
export const fetchWithFallback = async (apiCall: () => Promise<any>, mockEndpoint: string) => {
  try {
    return await apiCall();
  } catch (error) {
    console.error(`API Error (using fallback): ${error.message}`);
    const mockData = getMockData(mockEndpoint);
    return mockData;
  }
}; 