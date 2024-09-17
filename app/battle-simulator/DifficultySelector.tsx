import React from "react";

type Difficulty = "Easy" | "Medium" | "Hard";

interface Props {
  selectedDifficulty: Difficulty;
  onSelectDifficulty: (difficulty: Difficulty) => void;
}

const DifficultySelector: React.FC<Props> = ({
  selectedDifficulty,
  onSelectDifficulty,
}) => {
  const descriptions: Record<Difficulty, string> = {
    Easy: "A relaxed pace for beginners.",
    Medium: "A balanced experience for players.",
    Hard: "A challenge for seasoned players.",
  };

  return (
    <div className="flex flex-col items-center my-4">
      <div className="flex justify-center space-x-4 mb-2">
        {(["Easy", "Medium", "Hard"] as Difficulty[]).map((level) => (
          <button
            key={level}
            onClick={() => onSelectDifficulty(level)}
            className={`px-4 py-2 rounded transition-transform duration-150 ${
              selectedDifficulty === level
                ? "bg-blue-500 text-white scale-105 shadow-lg"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
            title={descriptions[level]}
            aria-pressed={selectedDifficulty === level}
          >
            {level}
          </button>
        ))}
      </div>
      <p className="text-sm mt-2 text-white">
        {descriptions[selectedDifficulty]}
      </p>
    </div>
  );
};

export default DifficultySelector;
