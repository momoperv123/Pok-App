export interface Move {
  name: string;
  power: number | string;
  type: string;
}

export interface Pokemon {
  id: number;
  name: string;
  level: number;
  stats: {
    hp: number;
    attack: number;
    defense: number;
    speed: number;
    specialAttack: number;
    specialDefense: number;
  };
  types: { type: { name: string } }[];
  sprites: {
    front_default: string;
  };
  moves: Move[];
  selectedMoves: Move[];
}

export type Difficulty = "Easy" | "Medium" | "Hard";
