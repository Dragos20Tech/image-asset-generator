import React from 'react';

interface ImagePreviewProps {
    imageSrc: string | ArrayBuffer | null;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ imageSrc }) => {
    return (
        <div className="preview-container">
            {imageSrc ? (
                <img 
                    src={String(imageSrc)} 
                    alt="Preview" 
                    className="preview-image"
                />
            ) : (
                <p className="no-image-text">No image uploaded</p>
            )}
        </div>
    );
};

export default ImagePreview;