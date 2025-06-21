import React, { useState } from 'react';

interface ImageUploaderProps {
    onUpload: (file: File) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onUpload }) => {
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const validFormats = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'];
            if (validFormats.includes(file.type)) {
                onUpload(file);
                setError(null);
            } else {
                setError('Invalid file format. Please upload a PNG, JPEG, WEBP, or SVG image.');
            }
        }
    };

    return (
        <div className="upload-container">
            <label className="file-input-wrapper">
                <span className="upload-icon">📁</span>
                Choose Image File
                <input 
                    type="file" 
                    className="file-input"
                    accept="image/png, image/jpeg, image/webp, image/svg+xml" 
                    onChange={handleFileChange} 
                />
            </label>
            {error && <div className="error-message">{error}</div>}
        </div>
    );
};

export default ImageUploader;