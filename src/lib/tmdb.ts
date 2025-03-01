const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = process.env.TMDB_BASE_URL;

export async function searchMedia(query: string, type: "movie" | "tv") {
  const response = await fetch(
    `${TMDB_BASE_URL}/search/${type}?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(
      query
    )}&language=pt-BR`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch from TMDB");
  }

  const data = await response.json();
  return data.results.map((item: any) => ({
    id: item.id,
    title: type === "movie" ? item.title : item.name,
    posterPath: item.poster_path,
    year: type === "movie"
      ? item.release_date?.split("-")[0]
      : item.first_air_date?.split("-")[0],
    type,
  }));
}

export async function getMediaDetails(id: number, type: "movie" | "tv") {
  const response = await fetch(
    `${TMDB_BASE_URL}/${type}/${id}?api_key=${TMDB_API_KEY}&language=pt-BR`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch media details");
  }

  return response.json();
}