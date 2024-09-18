import React, { useState } from "react";
import PokemonSearch from "./PokemonSearch";
import PokemonLevelAdjuster, { calculateStats } from "./PokemonLevelAdjuster";
import MoveSelector from "./MoveSelector";
import PokemonCard from "./PokemonCard";
import { usePokemonTeam } from "./PokemonTeamContext";

const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

interface Move {
  name: string;
  power: number | string;
  type: string;
}

interface Stats {
  hp: number;
  attack: number;
  defense: number;
  speed: number;
  specialAttack: number;
  specialDefense: number;
}

interface Pokemon {
  id: number;
  name: string;
  level: number;
  stats: Stats;
  sprites: {
    front_default: string;
  };
  moves: Move[];
  selectedMoves: Move[];
  types: { type: { name: string } }[];
}

const TeamSelector: React.FC<{ isPlayer: boolean; onSaveTeam: () => void }> = ({
  isPlayer,
}) => {
  const {
    playerTeam,
    setPlayerTeam,
    opponentTeam,
    setOpponentTeam,
    addPokemonToTeam,
  } = usePokemonTeam();

  const team = isPlayer ? playerTeam : opponentTeam;
  const setTeam = isPlayer ? setPlayerTeam : setOpponentTeam;
  const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null);

  const randomizeTeam = async () => {
    const randomizedTeam: Pokemon[] = [];
    for (let i = 0; i < 3; i++) {
      const randomPokemon = await fetchRandomPokemon();
      randomizedTeam.push(randomPokemon);
    }
    setTeam(randomizedTeam);
    setTimeout(() => randomizedTeam.forEach(autoSelectPokemon), 0);
  };

  const autoSelectPokemon = (pokemon: Pokemon) => {
    setSelectedPokemon(pokemon);
    handlePokemonSelect(pokemon);
  };

  const fetchRandomPokemon = async (): Promise<Pokemon> => {
    const randomId = Math.floor(Math.random() * 1010) + 1;
    const response = await fetch(
      `https://pokeapi.co/api/v2/pokemon/${randomId}`
    );
    const data = await response.json();

    const allMoves = await Promise.all(
      data.moves.map(async (moveEntry: { move: { url: string } }) => {
        const moveResponse = await fetch(moveEntry.move.url);
        const moveData = await moveResponse.json();
        return {
          name: capitalize(moveData.name || "Unknown Move"),
          power: moveData.power || "N/A",
          type: capitalize(moveData.type?.name || "Unknown"),
        };
      })
    );

    const attackingMoves = allMoves.filter(
      (move) => typeof move.power === "number" && move.power > 0
    );

    const selectedMoves = getRandomMoves(attackingMoves, 4);

    const level = Math.floor(Math.random() * 100) + 1;
    const stats = calculateStats(getBaseStats(data), level);

    return {
      id: data.id,
      name: capitalize(data.name),
      level,
      stats,
      sprites: {
        front_default: data.sprites.front_default,
      },
      moves: attackingMoves,
      selectedMoves,
      types: data.types,
    };
  };

  const getBaseStats = (data: any): Stats => ({
    hp: data.stats[0].base_stat,
    attack: data.stats[1].base_stat,
    defense: data.stats[2].base_stat,
    speed: data.stats[5].base_stat,
    specialAttack: data.stats[3].base_stat,
    specialDefense: data.stats[4].base_stat,
  });

  const getRandomMoves = (moves: Move[], count: number): Move[] => {
    const selectedMoves: Move[] = [];
    while (selectedMoves.length < count && moves.length > 0) {
      const randomMoveIndex = Math.floor(Math.random() * moves.length);
      selectedMoves.push(moves[randomMoveIndex]);
      moves.splice(randomMoveIndex, 1);
    }
    return selectedMoves;
  };

  const addPokemon = async (pokemonName: string) => {
    if (team.length >= 3) {
      alert("You can only select up to 3 Pokémon.");
      return;
    }

    const response = await fetch(
      `https://pokeapi.co/api/v2/pokemon/${pokemonName.toLowerCase()}`
    );
    const data = await response.json();

    const allMoves = await Promise.all(
      data.moves.map(async (moveEntry: { move: { url: string } }) => {
        const moveResponse = await fetch(moveEntry.move.url);
        const moveData = await moveResponse.json();
        return {
          name: capitalize(moveData.name),
          power: moveData.power || "N/A",
          type: capitalize(moveData.type.name) || "Unknown",
        };
      })
    );

    // Filter to only include attacking moves
    const attackingMoves = allMoves.filter(
      (move) => typeof move.power === "number" && move.power > 0
    );

    const level = 50;
    const stats = calculateStats(getBaseStats(data), level);

    const fetchedPokemon: Pokemon = {
      id: data.id,
      name: capitalize(data.name),
      level,
      stats,
      sprites: {
        front_default: data.sprites.front_default,
      },
      moves: attackingMoves,
      selectedMoves: [],
      types: data.types,
    };

    addPokemonToTeam(team, setTeam, fetchedPokemon);
    setSelectedPokemon(fetchedPokemon);
  };

  const handleLevelChange = (level: number, updatedStats: Stats) => {
    if (selectedPokemon) {
      setSelectedPokemon({ ...selectedPokemon, level, stats: updatedStats });
      setTeam(
        team.map((p) =>
          p.id === selectedPokemon.id ? { ...p, level, stats: updatedStats } : p
        )
      );
    }
  };

  const calculateDamage = (
    move: Move,
    attacker: Pokemon,
    defender: Pokemon
  ): number => {
    const attackStat = attacker.stats.attack;
    const defenseStat = defender.stats.defense;

    let movePower = typeof move.power === "string" ? 0 : move.power;
    movePower = Math.max(10, Math.min(movePower, 150));

    const baseDamage =
      (((2 * attacker.level) / 5 + 2) *
        movePower *
        (attackStat / defenseStat)) /
        50 +
      2;

    return Math.round(baseDamage);
  };

  const handleMoveSelect = (move: Move) => {
    if (selectedPokemon && selectedPokemon.selectedMoves.length < 4) {
      if (!selectedPokemon.selectedMoves.some((m) => m.name === move.name)) {
        const updatedSelectedMoves = [
          ...selectedPokemon.selectedMoves,
          {
            ...move,
            calculatedPower: calculateDamage(
              move,
              selectedPokemon,
              selectedPokemon
            ),
          },
        ];
        setSelectedPokemon({
          ...selectedPokemon,
          selectedMoves: updatedSelectedMoves,
        });
        setTeam(
          team.map((p) =>
            p.id === selectedPokemon.id
              ? { ...p, selectedMoves: updatedSelectedMoves }
              : p
          )
        );
      } else {
        alert("This move has already been selected.");
      }
    } else {
      alert("You can only select up to 4 moves.");
    }
  };

  const handleMoveRemove = (moveName: string, pokemonId: number) => {
    const updatedTeam = team.map((pokemon) => {
      if (pokemon.id === pokemonId) {
        const updatedSelectedMoves = pokemon.selectedMoves.filter(
          (move) => move.name !== moveName
        );
        return { ...pokemon, selectedMoves: updatedSelectedMoves };
      }
      return pokemon;
    });

    setTeam(updatedTeam);

    if (selectedPokemon?.id === pokemonId) {
      setSelectedPokemon({
        ...selectedPokemon,
        selectedMoves:
          updatedTeam.find((p) => p.id === pokemonId)?.selectedMoves || [],
      });
    }
  };

  const handlePokemonSelect = (pokemon: Pokemon) => {
    setSelectedPokemon(pokemon);
  };

  const handlePokemonRemove = (pokemonId: number) => {
    setTeam(team.filter((p) => p.id !== pokemonId));
    if (selectedPokemon?.id === pokemonId) {
      setSelectedPokemon(null);
    }
  };

  return (
    <div className="my-4">
      <h2 className="text-white text-sm font-bold flex justify-center mx-auto">
        Select Pokémon Team (Max 3)
      </h2>
      <button
        onClick={randomizeTeam}
        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded mb-4 flex justify-center mx-auto mt-4"
      >
        Randomize Pokémon Team
      </button>
      <PokemonSearch onPokemonSelect={addPokemon} />

      {selectedPokemon && (
        <>
          <PokemonLevelAdjuster
            onLevelChange={handleLevelChange}
            level={selectedPokemon.level}
          />
          <MoveSelector
            availableMoves={selectedPokemon.moves.map((move) => ({
              ...move,
              calculatedPower: calculateDamage(
                move,
                selectedPokemon,
                selectedPokemon
              ),
            }))}
            onMoveSelect={handleMoveSelect}
            level={selectedPokemon.level}
          />
        </>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 my-4">
        {team.map((pokemon) => (
          <div key={pokemon.id} className="relative">
            <PokemonCard
              pokemon={pokemon}
              onSelect={() => handlePokemonSelect(pokemon)}
              onRemove={() => handlePokemonRemove(pokemon.id)}
            />
            <div className="mt-2">
              <h4 className="font-bold text-white">Selected Moves:</h4>
              <div className="grid grid-cols-2 gap-2">
                {pokemon.selectedMoves.map((move, index) => (
                  <div
                    key={index}
                    className="relative text-xs bg-gray-100 p-2 rounded flex flex-col justify-center"
                    style={{ width: "auto", height: "120px" }}
                  >
                    <button
                      onClick={() => handleMoveRemove(move.name, pokemon.id)}
                      className="absolute top-1 right-1 text-gray-500 rounded-md p-1 text-sm hover:text-white hover:bg-red-500 transition-colors duration-200"
                    >
                      ×
                    </button>
                    <span className="text-black text-xs">
                      <strong>{move.name}</strong>
                      <br />
                      Power: {calculateDamage(move, pokemon, pokemon)}
                      <br />
                      Type: {move.type}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeamSelector;
