"use client";

import React, { useState } from "react";
import axios from "axios";
import PokemonList from "./PokemonList";
import SearchBar from "./SearchBar";
import Navbar from "../Navbar";
import Background from "../public/images/pokedex.jpeg";

interface Pokemon {
  name: string;
  id: number;
  height: number;
  weight: number;
  sprites: {
    front_default: string;
    back_default: string;
    front_shiny: string;
    back_shiny: string;
  };
  types: { type: { name: string } }[];
  abilities: { ability: { name: string } }[];
  moves: { move: { name: string } }[];
  flavor_text: string;
  stats: { base_stat: number; stat: { name: string } }[];
}

interface FlavorTextEntry {
  flavor_text: string;
  language: {
    name: string;
  };
}

interface EvolutionChain {
  species: {
    name: string;
    url: string;
  };
  evolves_to: EvolutionChain[];
  evolution_details: {
    min_level: number;
  }[];
}

interface EvolutionForm {
  name: string;
  sprite: string;
  level?: number;
}

const typeColors: { [key: string]: string } = {
  normal: "bg-gray-400",
  fire: "bg-red-500",
  water: "bg-blue-500",
  grass: "bg-green-500",
  electric: "bg-yellow-500",
  ice: "bg-blue-300",
  fighting: "bg-orange-700",
  poison: "bg-purple-500",
  ground: "bg-yellow-600",
  flying: "bg-indigo-300",
  psychic: "bg-pink-500",
  bug: "bg-green-600",
  rock: "bg-yellow-800",
  ghost: "bg-purple-800",
  dragon: "bg-indigo-700",
  dark: "bg-gray-700",
  steel: "bg-gray-500",
  fairy: "bg-pink-300",
};

const statAbbreviations: { [key: string]: string } = {
  hp: "HP",
  attack: "Atk",
  defense: "Def",
  "special-attack": "SpA",
  "special-defense": "SpD",
  speed: "Spd",
};

const statColors: { [key: string]: string } = {
  hp: "bg-red-500",
  attack: "bg-orange-500",
  defense: "bg-blue-500",
  "special-attack": "bg-purple-500",
  "special-defense": "bg-green-500",
  speed: "bg-yellow-500",
};

const Pokedex: React.FC = () => {
  const [pokemon, setPokemon] = useState<Pokemon | null>(null);
  const [evolutionChain, setEvolutionChain] = useState<EvolutionForm[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isFrontNormal, setIsFrontNormal] = useState<boolean>(true);
  const [isFrontShiny, setIsFrontShiny] = useState<boolean>(true);
  const [prevPokemon, setPrevPokemon] = useState<Pokemon | null>(null);
  const [nextPokemon, setNextPokemon] = useState<Pokemon | null>(null);
  const [weaknesses, setWeaknesses] = useState<string[]>([]);

  const convertHeightToFeet = (height: number) => {
    const feet = Math.floor(height * 3.28084);
    const inches = Math.round((height * 3.28084 - feet) * 12);
    return `${feet}' ${inches}"`;
  };

  const convertWeightToPounds = (weight: number) => {
    return (weight * 0.220462).toFixed(2);
  };

  const fetchPokemonData = async (name: string) => {
    setError(null);
    try {
      const response = await axios.get(
        `https://pokeapi.co/api/v2/pokemon/${name.toLowerCase().trim()}`
      );
      const speciesResponse = await axios.get(response.data.species.url);

      const flavorTextEntry = speciesResponse.data.flavor_text_entries
        .find((entry: FlavorTextEntry) => entry.language.name === "en")
        ?.flavor_text.replace(/[\n\f\r]/g, " ")
        .replace(/\s+/g, " ")
        .trim();

      const evolutionResponse = await axios.get(
        speciesResponse.data.evolution_chain.url
      );

      setPokemon({
        ...response.data,
        flavor_text: flavorTextEntry || "No entry available.",
      });
      setIsFrontNormal(true);
      setIsFrontShiny(true);
      setEvolutionChain(await getEvolutionChain(evolutionResponse.data.chain));
      setWeaknesses(await getWeaknesses(response.data.types));

      if (response.data.id > 1) {
        fetchAdjacentPokemon(response.data.id - 1, setPrevPokemon);
      }
      fetchAdjacentPokemon(response.data.id + 1, setNextPokemon);
    } catch (error) {
      setError("Pokémon not found. Please check the name or ID.");
      setPokemon(null);
      setEvolutionChain([]);
      setWeaknesses([]);
    }
  };

  const fetchAdjacentPokemon = async (
    id: number,
    setPokemonData: React.Dispatch<React.SetStateAction<Pokemon | null>>
  ) => {
    try {
      const response = await axios.get(
        `https://pokeapi.co/api/v2/pokemon/${id}`
      );
      setPokemonData(response.data);
    } catch (error) {
      setPokemonData(null);
    }
  };

  const getEvolutionChain = async (
    chain: EvolutionChain
  ): Promise<EvolutionForm[]> => {
    const chainArray: EvolutionForm[] = [];
    let currentChain = chain;
    while (currentChain) {
      const pokemonResponse = await axios.get(
        `https://pokeapi.co/api/v2/pokemon/${currentChain.species.name}`
      );
      chainArray.push({
        name: currentChain.species.name,
        sprite: pokemonResponse.data.sprites.front_default,
        level: currentChain.evolution_details[0]?.min_level,
      });
      currentChain = currentChain.evolves_to[0];
    }
    return chainArray;
  };

  const getWeaknesses = async (types: { type: { name: string } }[]) => {
    const weaknesses: string[] = [];

    for (const type of types) {
      const response = await axios.get(
        `https://pokeapi.co/api/v2/type/${type.type.name}`
      );
      response.data.damage_relations.double_damage_from.forEach(
        (weakness: { name: string }) => {
          if (!weaknesses.includes(weakness.name)) {
            weaknesses.push(weakness.name);
          }
        }
      );
    }

    return weaknesses;
  };

  const toggleNormalSprite = () => {
    setIsFrontNormal(!isFrontNormal);
  };

  const toggleShinySprite = () => {
    setIsFrontShiny(!isFrontShiny);
  };

  const handleClose = () => {
    setPokemon(null);
    setEvolutionChain([]);
    setPrevPokemon(null);
    setNextPokemon(null);
    setWeaknesses([]);
    setError(null);
  };

  return (
    <div
      className="flex flex-col items-center justify-start min-h-screen"
      style={{
        backgroundImage: `url(${Background.src})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <Navbar />
      <div className="w-full flex flex-col items-center justify-start min-h-screen py-12">
        <h1 className="text-white text-2xl font-bold mb-4 mt-20">Pokédex</h1>
        <SearchBar onSearch={fetchPokemonData} />
        {/* Use SearchBar component */}
        {error && <p className="text-red-500 mb-4 text-xs">{error}</p>}
        {pokemon && (
          <div className="bg-white shadow-md rounded-lg p-6 text-center w-full max-w-lg relative mb-8 overflow-hidden">
            <button
              onClick={handleClose}
              className="absolute top-2 right-2 text-gray-500 hover:text-white hover:bg-red-500 focus:outline-none text-lg px-2 py-1 rounded"
            >
              &times;
            </button>

            <h2 className="text-black text-sm font-bold mb-2">
              {pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}
            </h2>
            <p className="text-black mb-2 text-xs">#{pokemon.id}</p>

            <div className="flex justify-center space-x-8 mb-4 text-xs">
              <div className="flex flex-col items-center">
                <span className="text-black font-bold mb-2 text-sm">
                  Normal
                </span>
                <img
                  src={
                    isFrontNormal
                      ? pokemon.sprites.front_default
                      : pokemon.sprites.back_default
                  }
                  alt={`${pokemon.name} normal`}
                  className="cursor-pointer w-36 h-auto max-w-full object-contain"
                  onClick={toggleNormalSprite}
                />
              </div>
              <div className="flex flex-col items-center">
                <span className="text-black font-bold mb-2 text-sm">Shiny</span>
                <img
                  src={
                    isFrontShiny
                      ? pokemon.sprites.front_shiny
                      : pokemon.sprites.back_shiny
                  }
                  alt={`${pokemon.name} shiny`}
                  className="cursor-pointer w-36 h-auto max-w-full object-contain"
                  onClick={toggleShinySprite}
                />
              </div>
            </div>

            <div className="flex justify-center space-x-2 mb-4">
              {pokemon.types.map((t, index) => (
                <span
                  key={index}
                  className={`px-2 py-1 rounded ${
                    typeColors[t.type.name]
                  } text-white text-xs`}
                >
                  {t.type.name.charAt(0).toUpperCase() + t.type.name.slice(1)}
                </span>
              ))}
            </div>

            {/* Entry Section */}
            <p className="text-black mb-4 text-xs italic">
              {pokemon.flavor_text}
            </p>

            <div className="flex justify-center space-x-8 mb-4 text-xs">
              <div className="flex flex-col items-center">
                <span className="text-black font-bold mb-2 text-sm">
                  Height
                </span>
                <span className="text-gray-700">
                  {convertHeightToFeet(pokemon.height / 10)}
                </span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-black font-bold text-sm mb-2">
                  Weight
                </span>
                <span className="text-black">
                  {convertWeightToPounds(pokemon.weight / 10)} lbs
                </span>
              </div>
            </div>

            <h3 className="text-black text-sm font-bold mb-2">Abilities</h3>
            <p className="text-black mb-4 text-xs">
              {pokemon.abilities
                .map(
                  (a) =>
                    a.ability.name.charAt(0).toUpperCase() +
                    a.ability.name.slice(1)
                )
                .join(", ")}
            </p>

            {/* Weaknesses Section */}
            <h3 className="text-black text-sm font-bold mb-2">Weaknesses</h3>
            <div className="flex flex-wrap justify-center mb-4">
              {weaknesses.map((weakness, index) => (
                <span
                  key={index}
                  className={`px-2 py-1 rounded ${typeColors[weakness]} text-white text-xs`}
                  style={{ margin: "0.25rem" }} // Adds spacing around each item
                >
                  {weakness.charAt(0).toUpperCase() + weakness.slice(1)}
                </span>
              ))}
            </div>

            {/* Stats Section */}
            <h3 className="text-black text-sm font-bold mb-2">Stats</h3>
            <div className="flex justify-center space-x-4 mb-4">
              {pokemon.stats.map((stat, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 ${
                      statColors[stat.stat.name]
                    } rounded-full flex items-center justify-center`}
                    title={
                      stat.stat.name.charAt(0).toUpperCase() +
                      stat.stat.name.slice(1)
                    }
                  >
                    <span className="text-white text-xs">
                      {statAbbreviations[stat.stat.name] || stat.stat.name}
                    </span>
                  </div>
                  <span className="text-black text-xs mt-2">
                    {stat.base_stat}
                  </span>
                </div>
              ))}
            </div>

            {/* Display Evolutions */}
            {evolutionChain.length > 1 && (
              <>
                <h3 className="text-black text-sm font-bold mb-2">
                  Evolutions
                </h3>
                <div className="flex justify-center items-center space-x-2 mb-4">
                  {evolutionChain.map((evolution, index) => (
                    <React.Fragment key={index}>
                      <div className="flex flex-col items-center">
                        <img
                          src={evolution.sprite}
                          alt={evolution.name}
                          className="w-20 h-20"
                        />
                        <span className="text-black text-xs">
                          {evolution.name.charAt(0).toUpperCase() +
                            evolution.name.slice(1)}
                        </span>
                      </div>
                      {index < evolutionChain.length - 1 && (
                        <div className="flex flex-col items-center">
                          <span className="text-xs text-black mb-1">Lv.</span>
                          <span className="text-xs font-bold text-black">
                            {evolutionChain[index + 1].level || "?"}
                          </span>
                          <span className="text-sm text-black">→</span>
                        </div>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-6">
              {prevPokemon && (
                <button
                  className="flex items-center justify-between w-42 bg-gray-400 p-2 rounded hover:bg-gray-300 transition"
                  onClick={() => fetchPokemonData(prevPokemon.name)}
                >
                  <span className="text-sm font-bold">&lt;</span>
                  <img
                    src={prevPokemon.sprites.front_default}
                    alt={prevPokemon.name}
                    className="w-10 h-10"
                  />
                  <div className="text-left flex-grow">
                    <p className="text-xs font-bold">
                      {prevPokemon.name.charAt(0).toUpperCase() +
                        prevPokemon.name.slice(1)}
                    </p>
                    <p className="text-xs text-black">#{prevPokemon.id}</p>
                  </div>
                </button>
              )}

              {nextPokemon && (
                <button
                  className="flex items-center justify-between w-42 bg-gray-400 p-2 rounded hover:bg-gray-300 transition"
                  onClick={() => fetchPokemonData(nextPokemon.name)}
                >
                  <div className="text-right flex-grow">
                    <p className="text-xs font-bold">
                      {nextPokemon.name.charAt(0).toUpperCase() +
                        nextPokemon.name.slice(1)}
                    </p>
                    <p className="text-xs text-black">#{nextPokemon.id}</p>
                  </div>
                  <img
                    src={nextPokemon.sprites.front_default}
                    alt={nextPokemon.name}
                    className="w-10 h-10"
                  />
                  <span className="text-sm font-bold">&gt;</span>
                </button>
              )}
            </div>
          </div>
        )}
        <PokemonList onSelect={fetchPokemonData} />
      </div>
    </div>
  );
};

export default Pokedex;
