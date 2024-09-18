import React, { useState, useEffect } from "react";

interface PokemonSearchProps {
  onPokemonSelect: (pokemonNameOrId: string) => void;
}

interface PokemonSuggestion {
  name: string;
  sprite: string | null;
}

const PokemonSearch: React.FC<PokemonSearchProps> = ({ onPokemonSelect }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState<PokemonSuggestion[]>([]);
  const [allPokemon, setAllPokemon] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch all Pokémon names on component mount
  useEffect(() => {
    const fetchAllPokemon = async () => {
      const response = await fetch(
        "https://pokeapi.co/api/v2/pokemon?limit=10000"
      );
      const data = await response.json();
      const pokemonNames = data.results.map((pokemon: { name: string }) =>
        capitalize(pokemon.name)
      );
      setAllPokemon(pokemonNames);
    };

    fetchAllPokemon();
  }, []);

  // Utility function to capitalize the first letter of a string
  const capitalize = (str: string) =>
    str.charAt(0).toUpperCase() + str.slice(1);

  const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setError(null); // Clear previous error message

    if (isNaN(Number(value)) && value.length >= 3) {
      // If the value is not a number and at least 3 characters, show name suggestions
      const filteredPokemon = allPokemon.filter((name) =>
        name.toLowerCase().startsWith(value.toLowerCase())
      );

      // Fetch sprites for the filtered Pokémon names
      const pokemonSuggestions = await Promise.all(
        filteredPokemon.map(async (name) => {
          const response = await fetch(
            `https://pokeapi.co/api/v2/pokemon/${name.toLowerCase()}`
          );
          const data = await response.json();
          return {
            name,
            sprite: data.sprites.front_default || null,
          };
        })
      );

      setSuggestions(pokemonSuggestions);
    } else {
      setSuggestions([]);
    }
  };

  const handleSelect = (name: string) => {
    setSearchTerm(name);
    setSuggestions([]);
    onPokemonSelect(name);
  };

  const handleSearchClick = async () => {
    if (!searchTerm) return;

    try {
      const response = await fetch(
        `https://pokeapi.co/api/v2/pokemon/${searchTerm.toLowerCase()}`
      );
      if (!response.ok) {
        throw new Error("Invalid Pokémon name or ID");
      }
      onPokemonSelect(searchTerm);
      setError(null);
    } catch (error) {
      setError("Invalid Pokémon name or ID. Please try again.");
    }
  };

  return (
    <div className="relative">
      <div className="flex items-center">
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Search Pokémon by name or ID"
          className="text-black w-full p-2 border rounded text-sm bg-gray-200 placeholder-gray-700"
        />
        <button
          onClick={handleSearchClick}
          className="ml-2 p-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
        >
          Search
        </button>
      </div>
      {suggestions.length > 0 && (
        <ul className="absolute bg-white border mt-1 w-full rounded shadow-lg z-10">
          {suggestions.map(({ name, sprite }) => (
            <li
              key={name}
              onClick={() => handleSelect(name)}
              className="text-black p-2 cursor-pointer hover:bg-gray-200 flex items-center justify-between"
            >
              <span>{name}</span>
              {sprite && (
                <img src={sprite} alt={name} className="w-8 h-8 ml-2" />
              )}
            </li>
          ))}
        </ul>
      )}
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
};

export default PokemonSearch;
