import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FiEdit } from 'react-icons/fi';

function DropdownList({ options, onSelect, onClose, targetRect, onEditLabels }) {
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
    <div ref={dropdownRef} className="fixed z-50">
      <ul className="py-1 bg-foreground border border-border rounded-md shadow-lg">
        {options.map((option) => (
          <li key={option.value} onClick={() => onSelect(option)} className={`px-3 py-1.5 text-sm font-semibold text-white text-center rounded-md m-1 cursor-pointer ${option.colorClass}`}>
            {option.label}
          </li>
        ))}
        <li className="border-t border-border mt-1 pt-1">
            <button onClick={onEditLabels} className="w-full text-left px-3 py-1.5 text-sm text-text-secondary hover:bg-gray-100 flex items-center gap-2">
                <FiEdit size={14} /> Edit Labels
            </button>
        </li>
      </ul>
    </div>,
    document.body
  );
}


export default function StatusSelector({ options, value, onChange, onEditLabels }) {
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
            <button type="button" onClick={handleToggle} className={`w-full px-3 py-1.5 text-sm font-semibold text-white text-center rounded-md truncate`} style={{ backgroundColor: selectedOption.color || '#808080' }}>
                {selectedOption.label || 'Select...'}
            </button>
            {isOpen && (
                <DropdownList options={options} onSelect={handleSelect} onClose={() => setIsOpen(false)} targetRect={buttonRect} onEditLabels={onEditLabels} />
            )}
        </div>
    );
}