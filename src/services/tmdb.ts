const TMDB_API_KEY = "c1dc975936a5b8fe2d8c5ca0a44aadad";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

interface TMDBSearchResult {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  release_date?: string;
  first_air_date?: string;
  media_type: "movie" | "tv";
}

interface TMDBResponse {
  results: TMDBSearchResult[];
  total_pages: number;
  total_results: number;
}

const cache = new Map();
const CACHE_DURATION = 1000 * 60 * 5; // 5 minutos

export const searchTMDB = async (query: string): Promise<TMDBSearchResult[]> => {
  const cacheKey = `search:${query}`;
  const cached = cache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=pt-BR`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Falha ao buscar no TMDB");
    }

    const data: TMDBResponse = await response.json();
    const results = data.results.filter(
      (item) => item.media_type === "movie" || item.media_type === "tv"
    );

    cache.set(cacheKey, { data: results, timestamp: Date.now() });
    return results;
  } catch (error) {
    console.error("Erro ao buscar no TMDB:", error);
    return [];
  }
};

export const getMediaDetails = async (mediaId: number, mediaType: "movie" | "tv") => {
  const cacheKey = `details:${mediaType}:${mediaId}`;
  const cached = cache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/${mediaType}/${mediaId}?api_key=${TMDB_API_KEY}&language=pt-BR`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Falha ao buscar detalhes do ${mediaType}`);
    }

    const data = await response.json();
    cache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  } catch (error) {
    console.error(`Erro ao buscar detalhes do ${mediaType}:`, error);
    return null;
  }
};