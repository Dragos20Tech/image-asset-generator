import React from 'react';

const sizes = [
  { label: '16x16', value: 16 },
  { label: '32x32', value: 32 },
  { label: '64x64', value: 64 },
  { label: '128x128', value: 128 },
  { label: '192x192', value: 192 },
  { label: '256x256', value: 256 },
  { label: '512x512', value: 512 },
];

interface SizeSelectorProps {
  selectedSize: number;
  onSizeChange: (size: number) => void;
}

const SizeSelector: React.FC<SizeSelectorProps> = ({ selectedSize, onSizeChange }) => {
  return (
    <div className="size-selector-container">
      <label htmlFor="size-selector" className="size-label">
        📏 Choose output dimensions:
      </label>
      <select
        id="size-selector"
        className="size-select"
        value={selectedSize}
        onChange={(e) => onSizeChange(Number(e.target.value))}
      >
        {sizes.map((size) => (
          <option key={size.value} value={size.value}>
            {size.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SizeSelector;