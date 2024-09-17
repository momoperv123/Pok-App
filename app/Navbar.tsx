"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import pokeballIcon from "./public/images/pokeball.png";

function Navbar() {
  const [isHovered, setIsHovered] = useState(false);
  const [isWrapped, setIsWrapped] = useState(false);
  const linkContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkWrap = () => {
      if (linkContainerRef.current) {
        const containerTop =
          linkContainerRef.current.getBoundingClientRect().top;
        const firstLinkTop =
          linkContainerRef.current.children[0].getBoundingClientRect().top;
        setIsWrapped(firstLinkTop > containerTop);
      }
    };

    checkWrap();

    window.addEventListener("resize", checkWrap);

    return () => {
      window.removeEventListener("resize", checkWrap);
    };
  }, []);

  return (
    <nav
      className={`w-full bg-transparent absolute p-4 ${
        isWrapped ? "mb-12" : ""
      }`}
    >
      <div className="container mx-auto flex flex-wrap justify-between items-center max-w-full">
        <Link
          href="/"
          className="flex items-center text-white text-xl font-bold"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div
            className={`relative w-12 h-12 mt-1 transform transition-transform duration-500 ${
              isHovered ? "animate-pokeball-jump" : ""
            }`}
            onAnimationEnd={() => setIsHovered(false)}
          >
            <Image
              src={pokeballIcon}
              alt="Pokéball"
              layout="fill"
              objectFit="cover"
            />
          </div>
          <span className="z-10 text-red-600">
            Poké<span className="text-white">App</span>
          </span>
        </Link>
        <div
          ref={linkContainerRef}
          className="flex space-x-4 items-center mt-2 md:mt-0"
        >
          <Link
            href="/pokedex"
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition font-semibold z-10"
          >
            Pokédex
          </Link>
          <Link
            href="/battle-simulator/player-team-selection"
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition font-semibold z-10"
          >
            Battle
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
