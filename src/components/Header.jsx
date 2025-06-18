import React from 'react';
import { FiMenu } from 'react-icons/fi';

export default function Header({ onMenuClick }) {
  return (
    <header className="bg-foreground md:hidden p-4 border-b border-border sticky top-0 z-10">
      <button onClick={onMenuClick} className="text-text-primary">
        <FiMenu size={24} />
      </button>
    </header>
  );
}