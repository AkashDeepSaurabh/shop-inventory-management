// src/components/ui/Card.tsx
import React from 'react';

interface CardProps {
  title: string;
  content: string;
}

const Card: React.FC<CardProps> = ({ title, content }) => {
  return (
    <div className="p-4 border rounded-lg shadow-lg">
      <h3 className="text-xl font-bold">{title}</h3>
      <p>{content}</p>
    </div>
  );
};

export default Card;
