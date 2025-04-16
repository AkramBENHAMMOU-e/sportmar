import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { api, fetchWithFallback, getMockData } from "./api";

// Fonction utilitaire pour obtenir l'URL de base de l'API
function getBaseUrl() {
  // En production sur Vercel, utilisez l'URL de déploiement
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    return window.location.origin;
  }
  // En développement local
  return 'http://localhost:5000';
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    try {
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const errorData = await res.json();
        throw new Error(errorData.message || `${res.status}: ${res.statusText}`);
      } else {
        const text = await res.text();
        throw new Error(`${res.status}: ${text || res.statusText}`);
      }
    } catch (e) {
      if (e instanceof Error) throw e;
      throw new Error(`${res.status}: ${res.statusText}`);
    }
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // S'assurer que l'URL commence par /api pour les requêtes API
  if (!url.startsWith('http') && !url.startsWith('/api')) {
    url = `/api${url.startsWith('/') ? '' : '/'}${url}`;
  }

  // Si l'URL n'est pas absolue, préfixer avec l'URL de base
  if (!url.startsWith('http')) {
    url = `${getBaseUrl()}${url}`;
  }

  console.log(`API Request: ${method} ${url}`);
  
  try {
    const res = await fetch(url, {
      method,
      headers: {
        ...data ? { "Content-Type": "application/json" } : {},
        "Accept": "application/json",
      },
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
    });

    // Vérifier d'abord si le serveur est en panne (erreur 500)
    if (res.status === 500) {
      console.warn("API server error, trying to use fallback data");
      
      // Extraire le chemin de l'API pour obtenir les données de secours
      const path = url.includes('/api/') 
        ? url.split('/api/')[1] 
        : url.replace(/^\/api\//, '');
      
      // Utiliser les données de secours
      const mockData = getMockData(path);
      if (mockData) {
        return {
          ok: true,
          status: 200,
          json: async () => mockData,
          text: async () => JSON.stringify(mockData),
          headers: new Headers({ 'content-type': 'application/json' }),
        } as Response;
      }
    }

    await throwIfResNotOk(res);
    return res;
  } catch (error) {
    console.error(`API Error (${method} ${url}):`, error);
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw" | "returnData";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    let url = queryKey[0] as string;
    
    // S'assurer que l'URL commence par /api pour les requêtes API
    if (!url.startsWith('http') && !url.startsWith('/api')) {
      url = `/api${url.startsWith('/') ? '' : '/'}${url}`;
    }

    // Si l'URL n'est pas absolue, préfixer avec l'URL de base
    if (!url.startsWith('http')) {
      url = `${getBaseUrl()}${url}`;
    }
    
    console.log(`Query Request: ${url}`);
    
    try {
      const res = await fetch(url, {
        credentials: "include",
        headers: {
          "Accept": "application/json",
        },
      });

      // Vérifier d'abord si le serveur est en panne (erreur 500)
      if (res.status === 500) {
        console.warn("API server error, trying to use fallback data");
        
        // Extraire le chemin de l'API pour obtenir les données de secours
        const path = url.includes('/api/') 
          ? url.split('/api/')[1] 
          : url.replace(/^\/api\//, '');
        
        // Utiliser les données de secours
        const mockData = getMockData(path);
        if (mockData) {
          return mockData;
        }
      }

      // Traitement spécial pour les erreurs 401
      if (res.status === 401) {
        if (unauthorizedBehavior === "returnNull") {
          return null;
        } else if (unauthorizedBehavior === "returnData") {
          // Pour le panier invité, on renvoie un tableau vide au lieu d'une erreur
          return [];
        }
        // Sinon, on continue et on lancera une erreur
      }

      await throwIfResNotOk(res);
      return await res.json();
    } catch (error) {
      console.error(`Query Error (${url}):`, error);
      
      // En cas d'erreur, essayer d'utiliser les données de secours
      const path = url.includes('/api/') 
        ? url.split('/api/')[1] 
        : url.replace(/^\/api\//, '');
      
      const mockData = getMockData(path);
      if (mockData) {
        console.warn("Using fallback data due to API error");
        return mockData;
      }
      
      throw error;
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
    mutations: {
      retry: 1,
    },
  },
});
