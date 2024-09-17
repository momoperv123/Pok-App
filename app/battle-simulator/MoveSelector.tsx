import React from "react";

interface Move {
  name: string;
  power: number | string;
  type: string;
  calculatedPower?: number; // The calculated power is now passed in
}

interface MoveSelectorProps {
  availableMoves: Move[];
  onMoveSelect: (move: Move) => void;
  level: number;
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
  return typeColors[type.toLowerCase()] || "bg-gray-400"; // Default to Normal type color if type is not found
};

const MoveSelector: React.FC<MoveSelectorProps> = ({
  availableMoves = [],
  onMoveSelect,
  level,
}) => {
  // Filter out non-attacking moves (i.e., moves with power <= 0 or "N/A")
  const attackingMoves = availableMoves.filter(
    (move) => typeof move.power === "number" && move.power > 0
  );

  return (
    <div className="mt-4">
      <h3 className="font-bold text-white">Choose a Move:</h3>
      <div className="flex overflow-x-auto space-x-4 mt-2 hide-scrollbar">
        {attackingMoves.map((move) => (
          <div
            key={move.name}
            onClick={() => onMoveSelect(move)}
            className={`${getTypeColorClass(
              move.type
            )} shadow-lg rounded-lg p-4 cursor-pointer hover:shadow-xl transform hover:scale-105 transition-transform duration-150 min-w-max`}
          >
            <h4 className="text-sm font-bold text-white">{move.name}</h4>
            <p className="text-xs text-gray-100">
              Power: {move.calculatedPower}
            </p>
            <p className="text-xs text-gray-100">Type: {move.type}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MoveSelector;
