import React from "react";

interface Pokemon {
  id: number;
  name: string;
  level: number;
  stats: {
    hp: number;
    attack: number;
    defense: number;
  };
  sprites: {
    front_default: string;
  };
  types: { type: { name: string } }[]; // Assuming `types` is an array containing the Pokémon's types
}

interface PokemonCardProps {
  pokemon: Pokemon;
  onSelect: () => void;
  onRemove: () => void; // Add a prop for handling removal
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

const getTypeColorClass = (type: string): string => {
  return typeColors[type.toLowerCase()] || "bg-gray-400";
};

const PokemonCard: React.FC<PokemonCardProps> = ({
  pokemon,
  onSelect,
  onRemove,
}) => {
  const primaryType =
    pokemon.types && pokemon.types.length > 0
      ? pokemon.types[0].type.name
      : "normal";

  return (
    <div
      onClick={onSelect}
      className={`${getTypeColorClass(
        primaryType
      )} shadow-lg rounded-lg p-6 cursor-pointer hover:shadow-xl transform transition-transform duration-150 w-64 h-80 mx-auto mb-4 relative`}
    >
      <button
        onClick={(e) => {
          e.stopPropagation(); // Prevents the onSelect from being triggered when removing
          onRemove();
        }}
        className="absolute top-1 right-1 text-gray-500 rounded-md p-1 text-md hover:text-white hover:bg-red-500 transition-colors duration-200"
      >
        ×
      </button>
      <img
        src={pokemon.sprites.front_default}
        alt={pokemon.name}
        className="mx-auto mb-2 w-32 h-32"
      />
      <h3 className="text-lg font-bold text-white truncate">{pokemon.name}</h3>
      <p className="text-md text-gray-100">Level: {pokemon.level}</p>
      <div className="flex justify-between text-sm text-gray-100 mt-2">
        <span>HP: {pokemon.stats.hp}</span>
        <span>Atk: {pokemon.stats.attack}</span>
        <span>Def: {pokemon.stats.defense}</span>
      </div>
    </div>
  );
};

export default PokemonCard;
