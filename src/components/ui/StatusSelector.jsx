import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

function DropdownList({ options, onSelect, onClose, targetRect }) {
  const dropdownRef = useRef(null);

  useEffect(() => {
    const dropdownEl = dropdownRef.current;
    if (!dropdownEl || !targetRect) return;

    const { innerHeight } = window;
    const dropdownHeight = dropdownEl.offsetHeight;
    
    let top = targetRect.bottom + 4; 

    if ((top + dropdownHeight) > innerHeight && targetRect.top > dropdownHeight) {
      top = targetRect.top - dropdownHeight - 4;
    }

    dropdownEl.style.top = `${top}px`;
    dropdownEl.style.left = `${targetRect.left}px`;
    dropdownEl.style.width = `${targetRect.width}px`;

  }, [targetRect]);
  
  useEffect(() => {
    const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
            onClose();
        }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return createPortal(
    <div
      ref={dropdownRef}
      className="fixed z-50" 
    >
      <ul className="py-1 bg-foreground border border-border rounded-md shadow-lg">
        {options.map((option) => (
          <li
            key={option.value}
            onClick={() => onSelect(option)}
            className={`px-3 py-1.5 text-sm font-semibold text-white text-center rounded-md m-1 cursor-pointer ${option.colorClass}`}
          >
            {option.label}
          </li>
        ))}
      </ul>
    </div>,
    document.body 
  );
}


export default function StatusSelector({ options, value, onChange }) {
    const [isOpen, setIsOpen] = useState(false);
    const [buttonRect, setButtonRect] = useState(null);
    const buttonRef = useRef(null);

    const handleToggle = () => {
        if (!isOpen) {
            setButtonRect(buttonRef.current.getBoundingClientRect());
        }
        setIsOpen(!isOpen);
    };

    const handleSelect = (option) => {
        onChange(option.value);
        setIsOpen(false);
    };

    const selectedOption = options.find(opt => opt.value.toLowerCase() === (value || '').toLowerCase()) || options[0] || {};

    return (
        <div className="w-full" ref={buttonRef}>
            <button
                type="button"
                onClick={handleToggle}
                className={`w-full px-3 py-1.5 text-sm font-semibold text-white text-center rounded-md truncate ${selectedOption.colorClass || 'bg-gray-400'}`}
            >
                {selectedOption.label || 'Select...'}
            </button>
            {isOpen && (
                <DropdownList
                    options={options}
                    onSelect={handleSelect}
                    onClose={() => setIsOpen(false)}
                    targetRect={buttonRect}
                />
            )}
        </div>
    );
}