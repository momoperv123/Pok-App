import React, { useState, useEffect, useCallback } from "react";
import useDebounce from "./useDebounce";

interface Stats {
  hp: number;
  attack: number;
  defense: number;
  speed: number;
  specialAttack: number;
  specialDefense: number;
}

interface PokemonLevelAdjusterProps {
  stage?: keyof typeof statRanges;
  level?: number;
  onLevelChange: (level: number, updatedStats: Stats) => void;
}

const statRanges: {
  basic: Stats;
  firstEvolution: Stats;
  finalEvolution: Stats;
} = {
  basic: {
    hp: 45,
    attack: 49,
    defense: 49,
    speed: 45,
    specialAttack: 65,
    specialDefense: 65,
  },
  firstEvolution: {
    hp: 60,
    attack: 62,
    defense: 63,
    speed: 60,
    specialAttack: 80,
    specialDefense: 80,
  },
  finalEvolution: {
    hp: 80,
    attack: 82,
    defense: 83,
    speed: 80,
    specialAttack: 100,
    specialDefense: 100,
  },
};

const calculateStat = (
  baseStat: number,
  level: number,
  iv: number = 31,
  ev: number = 252,
  isHp: boolean = false
): number => {
  if (isHp) {
    return (
      Math.floor(((2 * baseStat + iv + Math.floor(ev / 4)) * level) / 100) +
      level +
      10
    );
  } else {
    return (
      Math.floor(((2 * baseStat + iv + Math.floor(ev / 4)) * level) / 100) + 5
    );
  }
};

const calculateStats = (
  baseStats: Stats,
  level: number,
  iv: number = 31,
  ev: number = 252
): Stats => {
  return {
    hp: calculateStat(baseStats.hp, level, iv, ev, true),
    attack: calculateStat(baseStats.attack, level, iv, ev),
    defense: calculateStat(baseStats.defense, level, iv, ev),
    speed: calculateStat(baseStats.speed, level, iv, ev),
    specialAttack: calculateStat(baseStats.specialAttack, level, iv, ev),
    specialDefense: calculateStat(baseStats.specialDefense, level, iv, ev),
  };
};

const areStatsEqual = (stats1: Stats, stats2: Stats): boolean => {
  return (
    stats1.hp === stats2.hp &&
    stats1.attack === stats2.attack &&
    stats1.defense === stats2.defense &&
    stats1.speed === stats2.speed &&
    stats1.specialAttack === stats2.specialAttack &&
    stats1.specialDefense === stats2.specialDefense
  );
};

const PokemonLevelAdjuster: React.FC<PokemonLevelAdjusterProps> = ({
  stage = "basic",
  level: initialLevel = 50,
  onLevelChange,
}) => {
  const [baseStats, setBaseStats] = useState<Stats>(() => statRanges[stage]);
  const [level, setLevel] = useState(initialLevel);
  const debouncedLevel = useDebounce(level, 150);
  const [updatedStats, setUpdatedStats] = useState<Stats>(
    calculateStats(baseStats, level)
  );

  const handleLevelChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newLevel = Math.min(Math.max(Number(e.target.value), 1), 100);
      setLevel(newLevel);
    },
    []
  );

  useEffect(() => {
    const newStats = calculateStats(baseStats, debouncedLevel);
    if (!areStatsEqual(newStats, updatedStats)) {
      setUpdatedStats(newStats);
      onLevelChange(debouncedLevel, newStats);
    }
  }, [debouncedLevel, baseStats, onLevelChange, updatedStats]);

  useEffect(() => {
    const newBaseStats = statRanges[stage];
    setBaseStats(newBaseStats);
    setUpdatedStats(calculateStats(newBaseStats, debouncedLevel));
  }, [stage, debouncedLevel]);

  useEffect(() => {
    setLevel(initialLevel);
  }, [initialLevel]);

  return (
    <div className="mt-4">
      <label className="block font-bold text-white">Adjust Level:</label>
      <input
        type="range"
        min="1"
        max="100"
        value={level}
        onChange={handleLevelChange}
        className="w-full mt-2"
      />
      <div className="flex justify-between mt-2 text-xs text-white">
        <span>Level: {level}</span>
        <span>HP: {updatedStats.hp}</span>
        <span>Atk: {updatedStats.attack}</span>
        <span>Def: {updatedStats.defense}</span>
        <span>Spd: {updatedStats.speed}</span>
        <span>Sp. Atk: {updatedStats.specialAttack}</span>
        <span>Sp. Def: {updatedStats.specialDefense}</span>
      </div>
    </div>
  );
};

export { calculateStats };
export default PokemonLevelAdjuster;
