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
    // User data
    user: null,
    
    // Products data
    products: [
      { 
        id: 1, 
        name: "Whey Protein Premium", 
        price: 35000, 
        description: "Protéine de haute qualité pour la récupération musculaire", 
        imageUrl: "https://images.unsplash.com/photo-1579722821273-0f6d7a4bd178?q=80&w=2070&auto=format&fit=crop",
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
        imageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=2020&auto=format&fit=crop",
        category: "equipment",
        subcategory: "fitness",
        stock: 8,
        featured: true
      },
      {
        id: 3,
        name: "Haltères Ajustables",
        price: 45000,
        description: "Poids ajustables de 2kg à 20kg pour votre entraînement à domicile",
        imageUrl: "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?q=80&w=2187&auto=format&fit=crop",
        category: "equipment",
        subcategory: "musculation",
        stock: 5,
        featured: false
      },
      {
        id: 4,
        name: "BCAA Energisant",
        price: 28000,
        description: "Acides aminés pour la récupération et l'énergie pendant l'entraînement",
        imageUrl: "https://images.unsplash.com/photo-1579722821273-0f6d7a4bd178?q=80&w=2070&auto=format&fit=crop",
        category: "supplement",
        subcategory: "acides-amines",
        stock: 20,
        featured: false
      }
    ],
    
    // Featured products
    'products/featured': [
      { 
        id: 1, 
        name: "Whey Protein Premium", 
        price: 35000, 
        description: "Protéine de haute qualité pour la récupération musculaire", 
        imageUrl: "https://images.unsplash.com/photo-1579722821273-0f6d7a4bd178?q=80&w=2070&auto=format&fit=crop",
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
        imageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=2020&auto=format&fit=crop",
        category: "equipment",
        subcategory: "fitness",
        stock: 8,
        featured: true
      }
    ],
    
    // Cart data
    cart: [],
    
    // Orders data
    orders: [],
    
    // Categories
    categories: [
      { id: 1, name: "Suppléments", slug: "supplement" },
      { id: 2, name: "Équipement", slug: "equipment" }
    ],
    
    // Subcategories
    subcategories: [
      { id: 1, name: "Protéines", slug: "proteines", categoryId: 1 },
      { id: 2, name: "Acides Aminés", slug: "acides-amines", categoryId: 1 },
      { id: 3, name: "Fitness", slug: "fitness", categoryId: 2 },
      { id: 4, name: "Musculation", slug: "musculation", categoryId: 2 }
    ]
  };
  
  // Handle special cases for product detail
  if (endpoint.startsWith('products/') && !endpoint.includes('featured') && !endpoint.includes('category')) {
    const productId = parseInt(endpoint.split('/')[1]);
    const product = mockData.products.find(p => p.id === productId);
    return product || null;
  }
  
  // Handle category filter
  if (endpoint.startsWith('products/category/')) {
    const category = endpoint.split('/')[2];
    return mockData.products.filter(p => p.category === category);
  }
  
  // Handle subcategory filter
  if (endpoint.startsWith('products/subcategory/')) {
    const subcategory = endpoint.split('/')[2];
    return mockData.products.filter(p => p.subcategory === subcategory);
  }
  
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