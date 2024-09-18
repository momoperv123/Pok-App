// PokemonTeamContext.tsx

"use client";

import React, { createContext, useState, useContext, ReactNode } from "react";
import { Difficulty, Pokemon } from "./types";

interface PokemonTeamContextProps {
  playerTeam: Pokemon[];
  setPlayerTeam: React.Dispatch<React.SetStateAction<Pokemon[]>>;
  opponentTeam: Pokemon[];
  setOpponentTeam: React.Dispatch<React.SetStateAction<Pokemon[]>>;
  difficulty: Difficulty;
  setDifficulty: React.Dispatch<React.SetStateAction<Difficulty>>;
  addPokemonToTeam: (
    team: Pokemon[],
    setTeam: React.Dispatch<React.SetStateAction<Pokemon[]>>,
    pokemon: Pokemon
  ) => void;
}

const PokemonTeamContext = createContext<PokemonTeamContextProps | undefined>(
  undefined
);

export const usePokemonTeam = (): PokemonTeamContextProps => {
  const context = useContext(PokemonTeamContext);
  if (!context) {
    throw new Error("usePokemonTeam must be used within a PokemonTeamProvider");
  }
  return context;
};

export const PokemonTeamProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [playerTeam, setPlayerTeam] = useState<Pokemon[]>([]);
  const [opponentTeam, setOpponentTeam] = useState<Pokemon[]>([]);
  const [difficulty, setDifficulty] = useState<Difficulty>("Easy");

  const addPokemonToTeam = (
    team: Pokemon[],
    setTeam: React.Dispatch<React.SetStateAction<Pokemon[]>>,
    pokemon: Pokemon
  ) => {
    if (team.length >= 3) {
      alert("You can only select up to 3 Pokémon.");
      return;
    }
    setTeam([...team, pokemon]);
  };

  return (
    <PokemonTeamContext.Provider
      value={{
        playerTeam,
        setPlayerTeam,
        opponentTeam,
        setOpponentTeam,
        difficulty,
        setDifficulty,
        addPokemonToTeam,
      }}
    >
      {children}
    </PokemonTeamContext.Provider>
  );
};
