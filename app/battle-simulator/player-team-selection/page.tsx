"use client";

import React, { useState, useEffect } from "react";
import DifficultySelector from "../DifficultySelector";
import TeamSelector from "../TeamSelector";
import Link from "next/link";
import { usePokemonTeam } from "../PokemonTeamContext";
import Navbar from "@/app/Navbar";
import Background from "@/app/public/images/battle.png";

export default function BattleSimulator() {
  const { difficulty, setDifficulty, playerTeam, setPlayerTeam } =
    usePokemonTeam();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  const validateAndSavePlayerTeam = () => {
    // Ensure a difficulty is selected
    if (!difficulty) {
      alert("You must select a difficulty level.");
      return false;
    }

    // Ensure at least one Pokémon is selected
    if (playerTeam.length === 0) {
      alert("You must select at least one Pokémon.");
      return false;
    }

    // Ensure all Pokémon have at least one move selected
    const allHaveMoves = playerTeam.every(
      (pokemon) => pokemon.selectedMoves.length > 0
    );

    if (!allHaveMoves) {
      alert("Each Pokémon must have at least one move selected.");
      return false;
    }

    // Save the player's team if validation passes
    setPlayerTeam([...playerTeam]);
    return true;
  };

  const handleProceedClick = (
    event: React.MouseEvent<HTMLAnchorElement, MouseEvent>
  ) => {
    if (!validateAndSavePlayerTeam()) {
      event.preventDefault(); // Prevent navigation if validation fails
    }
  };

  if (loading) {
    return <div className="text-center mt-10">Loading...</div>;
  }

  return (
    <div
      style={{
        backgroundImage: `url(${Background.src})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        minHeight: "100vh",
      }}
    >
      <Navbar />
      <div className="max-w-4xl mx-auto py-12">
        <h1 className="text-2xl font-bold text-center text-green-500 mb-6 mt-20">
          Your Team
        </h1>
        <DifficultySelector
          selectedDifficulty={difficulty}
          onSelectDifficulty={setDifficulty}
        />
        <TeamSelector isPlayer={true} onSaveTeam={validateAndSavePlayerTeam} />

        <div className="text-center mt-6">
          <Link
            href="/battle-simulator/opponent-team-selection"
            className="px-6 py-3 bg-red-500 text-white rounded hover:bg-red-600"
            onClick={handleProceedClick}
          >
            Opponent Team
          </Link>
        </div>
      </div>
    </div>
  );
}
