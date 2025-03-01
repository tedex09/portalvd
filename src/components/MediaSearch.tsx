"use client";

import { useState } from "react";
import { Search, Film, Tv } from "lucide-react";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";

interface MediaSearchProps {
  onSelect: (media: {
    id: number;
    title: string;
    type: "movie" | "tv";
    posterPath: string;
    year: string;
  }) => void;
  type: "movie" | "tv";
}

const MediaSearch = ({ onSelect, type }: MediaSearchProps) => {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);

  const { data: results, isLoading } = useQuery({
    queryKey: ["media-search", debouncedSearch, type],
    queryFn: async () => {
      if (!debouncedSearch) return [];
      const response = await fetch(
        `/api/tmdb?type=${type}&query=${encodeURIComponent(debouncedSearch)}`
      );
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
    },
    enabled: debouncedSearch.length > 2,
  });

  return (
    <div className="space-y-4">
      <div className="relative">
        <Input
          placeholder={`Buscar ${type === "movie" ? "filme" : "série"}...`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
        <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
      </div>

      {isLoading && (
        <div className="text-center text-muted-foreground">
          Buscando... ⏳
        </div>
      )}

      {results && results.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {results.map((item) => (
            <Card
              key={item.id}
              className="overflow-hidden transition-all hover:scale-105 cursor-pointer animate-fade-in"
              onClick={() => onSelect(item)}
            >
              {item.posterPath ? (
                <div className="relative aspect-[2/3]">
                  <Image
                    src={`https://image.tmdb.org/t/p/w500${item.posterPath}`}
                    alt={item.title}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="aspect-[2/3] bg-muted flex items-center justify-center">
                  {type === "movie" ? (
                    <Film className="h-12 w-12 text-muted-foreground" />
                  ) : (
                    <Tv className="h-12 w-12 text-muted-foreground" />
                  )}
                </div>
              )}
              <div className="p-2">
                <h3 className="font-medium line-clamp-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.year}</p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MediaSearch;