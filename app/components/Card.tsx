import React from "react";

interface CardProps {
  name: string;
  imageSrc: string;
}

const Card: React.FC<CardProps> = ({ name, imageSrc }) => {
  return (
    <div className="relative">
      <img
        src={imageSrc}
        alt={name}
        className="aspect-[2/3] w-full rounded-xl bg-gray-900/5 object-cover shadow-lg"
      />
      <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-gray-900/10" />
    </div>
  );
};

export default Card;
