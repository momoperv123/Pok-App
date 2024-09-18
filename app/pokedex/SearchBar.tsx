"use client";

import React, { useState, useEffect } from "react";

interface PokemonSuggestion {
  name: string;
  image: string;
}

interface SearchBarProps {
  onSearch: (name: string) => void;
}

interface PokemonAPIResponse {
  name: string;
  url: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [suggestions, setSuggestions] = useState<PokemonSuggestion[]>([]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchTerm.length > 2) {
        try {
          const response = await fetch(
            `https://pokeapi.co/api/v2/pokemon?limit=1000`
          );
          const data = await response.json();
          const filteredSuggestions = data.results
            .map((pokemon: PokemonAPIResponse) => ({
              name: pokemon.name,
              image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${
                pokemon.url.split("/").slice(-2, -1)[0]
              }.png`,
            }))
            .filter((pokemon: PokemonSuggestion) =>
              pokemon.name.toLowerCase().startsWith(searchTerm.toLowerCase())
            );
          setSuggestions(filteredSuggestions.slice(0, 5)); // Limit to 5 suggestions
        } catch (error) {
          console.error("Error fetching suggestions:", error);
        }
      } else {
        setSuggestions([]);
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchSuggestions();
    }, 300); // Debouncing to avoid too many API calls

    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const capitalizedSearchTerm =
      searchTerm.charAt(0).toUpperCase() + searchTerm.slice(1).toLowerCase();
    onSearch(capitalizedSearchTerm);
    setSuggestions([]);
  };

  const handleSuggestionClick = (suggestion: PokemonSuggestion) => {
    const capitalizedSuggestion =
      suggestion.name.charAt(0).toUpperCase() +
      suggestion.name.slice(1).toLowerCase();
    setSearchTerm(capitalizedSuggestion);
    setTimeout(() => {
      setSuggestions([]);
      onSearch(capitalizedSuggestion);
    }, 100);
  };

  return (
    <div className="relative w-full max-w-md mb-8">
      <form onSubmit={handleSearch} className="flex w-full">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Enter Pokémon name or ID"
          className="text-black px-4 py-2 border rounded-l w-full text-xs"
          aria-label="Search for Pokémon by name or ID"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded-r hover:bg-blue-600 transition text-xs"
          aria-label="Search"
        >
          Fetch
        </button>
      </form>
      {suggestions.length > 0 && (
        <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded mt-1 text-xs">
          {suggestions.map((suggestion, index) => (
            <li
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className="text-black flex items-center px-4 py-2 cursor-pointer hover:bg-gray-200"
            >
              <span className="flex-grow">
                {suggestion.name.charAt(0).toUpperCase() +
                  suggestion.name.slice(1)}
              </span>
              <img
                src={suggestion.image}
                alt={suggestion.name}
                width={32}
                height={32}
                className="ml-2"
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchBar;
