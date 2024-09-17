"use client";

import React, { useState, useEffect } from "react";
import TeamSelector from "../TeamSelector";
import Link from "next/link"; // Import Link for navigation
import { usePokemonTeam } from "../PokemonTeamContext";
import Navbar from "@/app/Navbar";
import Background from "@/app/public/images/battle.png"; // Import the background image

export default function BattleSimulator() {
  const [loading, setLoading] = useState(true);
  const { setOpponentTeam, opponentTeam } = usePokemonTeam();

  useEffect(() => {
    // Simulate data fetching
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  const saveOpponentTeam = () => {
    setOpponentTeam([...opponentTeam]); // Save the opponent's team
  };

  const validateAndSaveOpponentTeam = (): boolean => {
    // Ensure at least one Pokémon is selected
    if (opponentTeam.length === 0) {
      alert("You must select at least one Pokémon.");
      return false;
    }

    // Ensure all Pokémon have at least one move selected
    const allHaveMoves = opponentTeam.every(
      (pokemon) => pokemon.selectedMoves.length > 0
    );

    if (!allHaveMoves) {
      alert("Each Pokémon must have at least one move selected.");
      return false;
    }

    // Save the opponent's team if validation passes
    saveOpponentTeam();
    return true;
  };

  if (loading) {
    return <div className="text-center mt-10 text-white">Loading...</div>;
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
      <Navbar />{" "}
      <div className="max-w-4xl mx-auto py-12">
        <h1 className="text-2xl font-bold text-center text-red-500 mb-6 mt-20">
          Opponent Team
        </h1>
        <TeamSelector isPlayer={false} onSaveTeam={saveOpponentTeam} />

        <div className="flex justify-center space-x-4 mt-6">
          <Link
            href="/battle-simulator/player-team-selection"
            className="px-6 py-3 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Your Team
          </Link>
          <Link
            href="/battle-simulator/start-battle"
            className="px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={(e) => {
              if (!validateAndSaveOpponentTeam()) {
                e.preventDefault();
              }
            }}
          >
            Start Battle
          </Link>
        </div>
      </div>
    </div>
  );
}
