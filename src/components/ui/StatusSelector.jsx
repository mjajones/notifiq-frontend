import React, { useState, useRef, useEffect } from 'react';

export default function StatusSelector({ options, value, onChange }) {
    const [isOpen, setIsOpen] = useState(false);
    const [opensUp, setOpensUp] = useState(false);
    const wrapperRef = useRef(null);

    // This effect closes the dropdown if you click outside of it
    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);
    
    const handleToggle = () => {
        if (!isOpen && wrapperRef.current) {
            const rect = wrapperRef.current.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            
            const dropdownHeight = options.length * 40 + 10; 

            if (spaceBelow < dropdownHeight && rect.top > dropdownHeight) {
                setOpensUp(true);
            } else {
                setOpensUp(false);
            }
        }
        setIsOpen(!isOpen);
    };
    
    const selectedOption = options.find(opt => opt.value.toLowerCase() === (value || '').toLowerCase()) || options[0];

    const handleSelect = (option) => {
        onChange(option.value);
        setIsOpen(false);
    };


    const dropdownMenuClasses = `
        absolute z-20 w-full bg-foreground border border-border rounded-md shadow-lg
        ${opensUp ? 'bottom-full mb-1' : 'top-full mt-1'}
    `;

    return (
        <div className="relative w-full" ref={wrapperRef}>
            <button
                type="button"
                onClick={handleToggle}
                className={`w-full px-3 py-1.5 text-sm font-semibold text-white text-center rounded-md truncate ${selectedOption.colorClass}`}
            >
                {selectedOption.label}
            </button>

            {isOpen && (
                <div className={dropdownMenuClasses}>
                    <ul className="py-1">
                        {options.map((option) => (
                            <li
                                key={option.value}
                                onClick={() => handleSelect(option)}
                                className={`px-3 py-1.5 text-sm font-semibold text-white text-center rounded-md m-1 cursor-pointer ${option.colorClass}`}
                            >
                                {option.label}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}