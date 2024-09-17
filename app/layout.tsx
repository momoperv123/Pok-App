import type { Metadata } from "next";
import "./globals.css";
import { PokemonTeamProvider } from "./battle-simulator/PokemonTeamContext";

export const metadata: Metadata = {
  title: "PokéApp",
  description: "Pokémon App with a Pokédex and a Battle Simulator",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <link rel="icon" href="./public/images/pokeball.png" />
      <body>
        <PokemonTeamProvider>{children}</PokemonTeamProvider>
      </body>
    </html>
  );
}
