"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";

interface Pokemon {
  name: string;
  id: number;
  sprites: {
    front_default: string | null;
  };
  types: { type: { name: string } }[];
}

const typeColors: { [key: string]: string } = {
  normal: "bg-gray-400 hover:bg-gray-500",
  fire: "bg-red-500 hover:bg-red-600",
  water: "bg-blue-500 hover:bg-blue-600",
  grass: "bg-green-500 hover:bg-green-600",
  electric: "bg-yellow-500 hover:bg-yellow-600",
  ice: "bg-blue-300 hover:bg-blue-400",
  fighting: "bg-orange-700 hover:bg-orange-800",
  poison: "bg-purple-500 hover:bg-purple-600",
  ground: "bg-yellow-600 hover:bg-yellow-700",
  flying: "bg-indigo-300 hover:bg-indigo-400",
  psychic: "bg-pink-500 hover:bg-pink-600",
  bug: "bg-green-600 hover:bg-green-700",
  rock: "bg-yellow-800 hover:bg-yellow-900",
  ghost: "bg-purple-800 hover:bg-purple-900",
  dragon: "bg-indigo-700 hover:bg-indigo-800",
  dark: "bg-gray-700 hover:bg-gray-800",
  steel: "bg-gray-500 hover:bg-gray-600",
  fairy: "bg-pink-300 hover:bg-pink-400",
};

const PokemonList: React.FC<{ onSelect: (name: string) => void }> = ({
  onSelect,
}) => {
  const [pokemonList, setPokemonList] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [offset, setOffset] = useState<number>(0);
  const [limit] = useState<number>(24);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPokemonList = async (newOffset: number, newLimit: number) => {
    setLoading(true);
    try {
      const promises = [];
      for (let i = newOffset + 1; i <= newOffset + newLimit; i++) {
        promises.push(axios.get(`https://pokeapi.co/api/v2/pokemon/${i}`));
      }
      const results = await Promise.all(promises);
      const fetchedPokemon = results.map((result) => result.data);
      setPokemonList((prevList) => [...prevList, ...fetchedPokemon]);
      setLoading(false);
      if (fetchedPokemon.length < newLimit) {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error fetching Pokémon list:", error);
      setError("Failed to load Pokémon. Please try again.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPokemonList(offset, limit);
  }, [offset, limit]);

  const loadMore = () => {
    const newOffset = offset + limit;
    setOffset(newOffset);
    fetchPokemonList(newOffset, limit);
  };

  const handleCardClick = (name: string) => {
    onSelect(name);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="w-full px-0 sm:px-4">
      {error && <div className="text-center text-red-500 mb-4">{error}</div>}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
        {pokemonList.map((pokemon) => {
          const type = pokemon.types[0]?.type.name;
          return (
            <div
              key={pokemon.id}
              onClick={() => handleCardClick(pokemon.name)}
              className={`p-4 rounded-lg text-center text-white ${typeColors[type]} cursor-pointer pokemon-card`}
            >
              <img
                src={
                  pokemon.sprites.front_default ||
                  "/path/to/placeholder-image.png"
                }
                alt={pokemon.name}
                width={96}
                height={96}
                className="mx-auto mb-2"
              />
              <h2 className="text-sm font-bold">
                {pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}
              </h2>
              <p className="text-xs">#{pokemon.id}</p>
            </div>
          );
        })}
      </div>

      {hasMore && (
        <div className="text-center mt-8">
          <button
            onClick={loadMore}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition text-xs"
            disabled={loading}
          >
            {loading ? "Loading..." : "Load More"}
          </button>
        </div>
      )}
    </div>
  );
};

export default PokemonList;
