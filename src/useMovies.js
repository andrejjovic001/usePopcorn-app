import { useState, useEffect } from "react";

const KEY = "3f47614";

// Ovo je custom hook
export function useMovies(query, page, callback) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [movies, setMovies] = useState([]);
  const [totalPages, setTotalPages] = useState(null);
  const [totalResults, setTotalResults] = useState(0);

  useEffect(
    function () {
      callback?.();

      const controller = new AbortController();

      async function fetchMovies() {
        try {
          setIsLoading(true);
          setError(""); // Moramo prvo resetovari errror da nam ne bi uvijek izbacivalo u aplikaciji gresku

          const res = await fetch(
            // `http://www.omdbapi.com/?apikey=${KEY}&s=${query}&page=${page}`,
            `https://www.omdbapi.com/?apikey=${KEY}&s=${query.trim()}&page=${page}&type=movie`,
            { signal: controller.signal }
          );

          if (!res.ok)
            throw new Error("Something went wrong with fetching movies!");

          const data = await res.json();
          console.log(data);
          if (data.Response === "False") throw new Error("Movie not found!");

          setTotalPages(Math.ceil(data.totalResults / data.Search.length));
          setTotalResults(data.totalResults);
          console.log(data);
          setMovies(data.Search);

          setError("");
        } catch (err) {
          if (err.name !== "AbortError") {
            setError(err.message);
            setTotalResults("0");
          }
        } finally {
          setIsLoading(false);
        }
      }

      if (query.length < 3) {
        setMovies([]);
        setTotalResults(null);
        setError("");
        return;
      }

      fetchMovies();

      // Clean Up funkcija
      return function () {
        controller.abort();
      };
    },
    [query, page, callback]
  );

  return { movies, isLoading, error, totalPages, totalResults };
}
