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
  type: string[];
  sprites: {
    front_default: string;
  };
  selectedMoves: Move[];
}

export interface Move {
  name: string;
  power: number;
  type: string;
}

export type Difficulty = "Easy" | "Medium" | "Hard";
