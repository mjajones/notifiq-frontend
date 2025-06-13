import React, { useState, useRef, useEffect } from 'react';

export default function StatusSelector({ options, value, onChange }) {
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);
    
    const selectedOption = options.find(opt => opt.value.toLowerCase() === value.toLowerCase()) || options[0];

    const handleSelect = (option) => {
        onChange(option.value);
        setIsOpen(false);
    };

    return (
        <div className="relative w-full" ref={wrapperRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full px-3 py-1.5 text-sm font-semibold text-white text-center rounded-md ${selectedOption.colorClass}`}
            >
                {selectedOption.label}
            </button>

            {isOpen && (
                <div className="absolute z-10 w-full mt-1 bg-foreground border border-border rounded-md shadow-lg">
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