import React from 'react';
import './Carrossel.css';

interface HighlightItem {
  name: string;
  image: string;
  discount: number;
}

interface CarrossellProps {
  items: HighlightItem[];
}

export default function Carrossel({ items }: CarrossellProps) {
  return (
    <div className="carousel">
      {items.map((item, index) => (
        <div className="carousel-item" key={index}>
          <img src={item.image} alt={item.name} />
          <p>{item.name}</p>
          <span className="discount">-{item.discount}%</span>
        </div>
      ))}
    </div>
  );
}
