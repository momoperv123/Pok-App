"use client";

import React, { useState, useEffect } from "react";
import { Move, Pokemon } from "../types";
import { usePokemonTeam } from "../PokemonTeamContext";
import Navbar from "@/app/Navbar";
import Background from "@/app/public/images/battle.png";

export default function StartBattlePage() {
  const { playerTeam, opponentTeam } = usePokemonTeam();
  const [currentPlayerTeam, setCurrentPlayerTeam] = useState([...playerTeam]);
  const [currentOpponentTeam, setCurrentOpponentTeam] = useState([
    ...opponentTeam,
  ]);
  const [playerPokemon, setPlayerPokemon] = useState(currentPlayerTeam[0]);
  const [opponentPokemon, setOpponentPokemon] = useState(
    currentOpponentTeam[0]
  );
  const [playerHP, setPlayerHP] = useState(playerPokemon.stats.hp);
  const [opponentHP, setOpponentHP] = useState(opponentPokemon.stats.hp);
  const [battleText, setBattleText] = useState("A wild battle has begun!");
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [showSwitchMenu, setShowSwitchMenu] = useState(false);
  const [moveLog, setMoveLog] = useState<string[]>([]);
  const [showEndOverlay, setShowEndOverlay] = useState(false);
  const [endMessage, setEndMessage] = useState("");

  useEffect(() => {
    if (playerHP <= 0) {
      handlePlayerFaint();
    } else if (opponentHP <= 0) {
      handleOpponentFaint();
    }
  }, [playerHP, opponentHP]);

  const handleMoveSelect = (move: Move) => {
    if (isPlayerTurn) {
      const damage = calculateDamage(move, playerPokemon, opponentPokemon);
      if (!isNaN(damage)) {
        setOpponentHP((prevHP) => Math.max(prevHP - damage, 0));
        const logEntry = `${playerPokemon.name} uses ${move.name} for ${damage} points of damage on ${opponentPokemon.name}`;
        setMoveLog((prevLog) => [...prevLog, logEntry]);
        setBattleText(logEntry);
      } else {
        const logEntry = `${playerPokemon.name} missed the move!`;
        setMoveLog((prevLog) => [...prevLog, logEntry]);
        setBattleText(logEntry);
      }
      setIsPlayerTurn(false);

      setTimeout(() => {
        if (opponentHP - damage <= 0) {
          handleOpponentFaint();
        } else {
          handleOpponentTurn();
        }
      }, 2000);
    }
  };

  const handleSwitchPokemon = (pokemon: Pokemon) => {
    if (pokemon !== playerPokemon) {
      // Save the current HP of the Pokémon being switched out
      setCurrentPlayerTeam((prevTeam) =>
        prevTeam.map((p) =>
          p === playerPokemon
            ? { ...p, stats: { ...p.stats, hp: playerHP } }
            : p
        )
      );

      // Switch to the new Pokémon and set its HP
      setPlayerPokemon(pokemon);
      setPlayerHP(pokemon.stats.hp);

      const logEntry = `${playerPokemon.name} switched to ${pokemon.name}`;
      setMoveLog((prevLog) => [...prevLog, logEntry]);
      setBattleText(`${pokemon.name}, I choose you!`);
      setShowSwitchMenu(false);
      setIsPlayerTurn(false);

      setTimeout(() => {
        handleOpponentTurn();
      }, 2000);
    }
  };

  const handlePlayerFaint = () => {
    if (playerHP > 0) return;

    const logEntry = `${playerPokemon.name} fainted!`;
    setMoveLog((prevLog) => [...prevLog, logEntry]);
    setBattleText(logEntry);

    const remainingPlayerTeam = currentPlayerTeam.filter(
      (p) => p !== playerPokemon
    );

    setCurrentPlayerTeam(remainingPlayerTeam);

    if (remainingPlayerTeam.length > 0) {
      const nextPokemon = remainingPlayerTeam[0];
      setTimeout(() => {
        setPlayerPokemon(nextPokemon);
        setPlayerHP(nextPokemon.stats.hp);
        setBattleText(`${nextPokemon.name}, I choose you!`);
      }, 2000);
    } else {
      setEndMessage("You have no more Pokémon! You blacked out!");
      setShowEndOverlay(true);
    }
  };

  const handleOpponentFaint = () => {
    if (opponentHP > 0) return;

    const logEntry = `${opponentPokemon.name} fainted!`;
    setMoveLog((prevLog) => [...prevLog, logEntry]);
    setBattleText(logEntry);

    const remainingOpponentTeam = currentOpponentTeam.filter(
      (p) => p !== opponentPokemon
    );

    setCurrentOpponentTeam(remainingOpponentTeam);

    if (remainingOpponentTeam.length > 0) {
      const nextPokemon = remainingOpponentTeam[0];
      setTimeout(() => {
        setOpponentPokemon(nextPokemon);
        setOpponentHP(nextPokemon.stats.hp);
        setBattleText(`Opponent sent out ${nextPokemon.name}!`);
        setIsPlayerTurn(true);
      }, 2000);
    } else {
      setEndMessage("You won the battle!");
      setShowEndOverlay(true);
    }
  };

  const handleOpponentTurn = () => {
    const move = selectAIMove();
    const damage = calculateDamage(move, opponentPokemon, playerPokemon);
    if (!isNaN(damage)) {
      setPlayerHP((prevHP) => Math.max(prevHP - damage, 0));
      const logEntry = `${opponentPokemon.name} uses ${move.name} for ${damage} points of damage on ${playerPokemon.name}`;
      setMoveLog((prevLog) => [...prevLog, logEntry]);
      setBattleText(logEntry);
    } else {
      const logEntry = `${opponentPokemon.name} missed the move!`;
      setMoveLog((prevLog) => [...prevLog, logEntry]);
      setBattleText(logEntry);
    }
    setIsPlayerTurn(true);
    if (playerHP - damage <= 0) {
      setTimeout(() => {
        handlePlayerFaint();
      }, 2000);
    }
  };

  const selectAIMove = (): Move => {
    return opponentPokemon.selectedMoves[
      Math.floor(Math.random() * opponentPokemon.selectedMoves.length)
    ];
  };

  const calculateDamage = (
    move: Move,
    attacker: Pokemon,
    defender: Pokemon
  ): number => {
    const attackStat =
      move.type === "special"
        ? attacker.stats.specialAttack
        : attacker.stats.attack;
    const defenseStat =
      move.type === "special"
        ? defender.stats.specialDefense
        : defender.stats.defense;

    const movePower =
      typeof move.power === "string" ? parseInt(move.power, 10) : move.power;

    const baseDamage =
      (((2 * attacker.level) / 5 + 2) *
        movePower *
        (attackStat / defenseStat)) /
        50 +
      2;

    return isNaN(baseDamage) ? NaN : Math.round(baseDamage);
  };

  const selectNewTeam = () => {
    window.location.href = "/battle-simulator/player-team-selection";
  };

  return (
    <div
      style={{
        backgroundImage: `url(${Background.src})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        minHeight: "100vh",
      }}
      className="bg-gray-800 min-h-screen text-xs text-white"
    >
      <Navbar />
      <div className="flex justify-center items-start py-16">
        <div className="flex w-full max-w-7xl mt-16 flex-wrap">
          <div
            className="bg-gray-800 opacity-75 p-4 rounded-lg shadow-lg w-full md:w-1/4 mr-4 overflow-y-scroll no-scrollbar"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            <h2 className="opacity-100 text-lg font-semibold mb-2">Move Log</h2>
            <div className="h-96">
              {moveLog.map((logEntry, index) => (
                <p key={index} className="text-xs">
                  {logEntry}
                  <br />
                  <br />
                </p>
              ))}
            </div>
          </div>

          <div className="p-8 rounded-lg shadow-lg w-full md:w-3/4">
            <div className="flex justify-between items-center mb-8 flex-wrap">
              <div className="text-center w-full md:w-1/2 mb-4 md:mb-0">
                {playerPokemon && (
                  <>
                    <img
                      src={playerPokemon.sprites.front_default}
                      alt={playerPokemon.name}
                      className="w-36 h-36 mx-auto"
                    />
                    <div className="font-bold text-xl mt-2">
                      {playerPokemon.name} (Lv {playerPokemon.level})
                    </div>
                    <div className="text-sm">
                      HP: {playerHP}/{playerPokemon.stats.hp}
                    </div>
                    <div className="w-full bg-gray-800 h-2 rounded mt-1">
                      <div
                        className="bg-green-500 h-2 rounded"
                        style={{
                          width: `${
                            (playerHP / playerPokemon.stats.hp) * 100
                          }%`,
                        }}
                      />
                    </div>
                  </>
                )}
              </div>
              <div className="text-center w-full md:w-1/2">
                {opponentPokemon && (
                  <>
                    <img
                      src={opponentPokemon.sprites.front_default}
                      alt={opponentPokemon.name}
                      className="w-36 h-36 mx-auto"
                    />
                    <div className="font-bold text-xl mt-2">
                      {opponentPokemon.name} (Lv {opponentPokemon.level})
                    </div>
                    <div className="text-sm">
                      HP: {opponentHP}/{opponentPokemon.stats.hp}
                    </div>
                    <div className="w-full bg-gray-800 h-2 rounded mt-1">
                      <div
                        className="bg-red-500 h-2 rounded"
                        style={{
                          width: `${
                            (opponentHP / opponentPokemon.stats.hp) * 100
                          }%`,
                        }}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="bg-gray-700 p-4 rounded-lg text-center mb-4">
              <p className="text-lg font-semibold">{battleText}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {isPlayerTurn &&
                !showSwitchMenu &&
                playerPokemon.selectedMoves.map((move, index) => (
                  <button
                    key={index}
                    onClick={() => handleMoveSelect(move)}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                  >
                    {move.name}
                  </button>
                ))}
              {isPlayerTurn && !showSwitchMenu && (
                <button
                  onClick={() => setShowSwitchMenu(true)}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded col-span-2"
                >
                  Switch Pokémon
                </button>
              )}
            </div>
            {showSwitchMenu && (
              <div className="grid grid-cols-2 gap-4 mt-4">
                {currentPlayerTeam.map((pokemon, index) => (
                  <button
                    key={index}
                    onClick={() => handleSwitchPokemon(pokemon)}
                    className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
                    disabled={pokemon === playerPokemon}
                  >
                    {pokemon.name} (HP: {pokemon.stats.hp})
                  </button>
                ))}
                <button
                  onClick={() => setShowSwitchMenu(false)}
                  className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded col-span-2"
                >
                  Back
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      {showEndOverlay && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
          <div className="bg-gray-800 p-8 rounded-lg shadow-lg text-center">
            <h2 className="text-2xl font-bold text-white mb-4">{endMessage}</h2>
            <div className="grid grid-cols-1 gap-4">
              <button
                onClick={selectNewTeam}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
              >
                Play Again
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
