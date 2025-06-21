import React, { useState, useCallback } from 'react';
import ImageUploader from './components/ImageUploader';
import ImagePreview from './components/ImagePreview';
import DownloadButton from './components/DownloadButton';
import Footer from './components/Footer';
import './App.css';

const App = () => {
    const [image, setImage] = useState<File | null>(null);
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [previewImageSrc, setPreviewImageSrc] = useState<string | null>(null);
    const [previewSize, setPreviewSize] = useState<{ width: number; height: number } | null>(null);

    const handleImageUpload = (file: File) => {
        setImage(file);
        const reader = new FileReader();
        reader.onload = () => {
            const result = String(reader.result);
            setImageSrc(result);
            setPreviewImageSrc(result); // Set original as default preview
            setPreviewSize(null);
        };
        reader.readAsDataURL(file);
    };

    // Memoize the callback to prevent unnecessary re-renders
    const handlePreviewSizeChange = useCallback((resizedImageData: string | null, size: { width: number; height: number } | null) => {
        console.log('Preview size change:', size); // Debug log
        setPreviewImageSrc(resizedImageData || imageSrc);
        setPreviewSize(size);
    }, [imageSrc]);

    // Memoize the back to original callback
    const handleBackToOriginal = useCallback(() => {
        console.log('Back to original called'); // Debug log
        setPreviewImageSrc(imageSrc);
        setPreviewSize(null);
        // Trigger a custom event to reset download selection
        window.dispatchEvent(new CustomEvent('resetDownloadSelection'));
    }, [imageSrc]);

    // Show back button when there's a preview size (not original)
    const shouldShowBackButton = previewSize !== null;

    return (
        <div className="app-container">
            <h1 className="app-title">🎨 Image Asset Generator</h1>
            <div className="main-content">
                {!imageSrc ? (
                    // Full-width upload section when no image
                    <div className="upload-section">
                        <h2 className="section-title">Upload Image</h2>
                        <ImageUploader onUpload={handleImageUpload} />
                    </div>
                ) : (
                    // Two-column layout when image is uploaded
                    <div className="content-grid">
                        <div className="section">
                            {/* <h2 className="section-title">Upload New Image</h2> */}
                            <ImageUploader onUpload={handleImageUpload} />
                            
                            {/* Download section moved here */}
                            <div className="download-section-inline">
                                {/* <h2 className="section-title">Download All Sizes</h2> */}
                                <DownloadButton 
                                    imageData={imageSrc} 
                                    onPreviewSizeChange={handlePreviewSizeChange}
                                    onBackToOriginal={handleBackToOriginal}
                                />
                            </div>
                        </div>
                        
                        <div className="section preview-section">
                            {/* <h2 className="section-title">Preview</h2> */}
                            <div className="preview-header">
                                <span className="preview-size-label">
                                    {previewSize ? (
                                        `📐 Preview: ${previewSize.width}×${previewSize.height}`
                                    ) : (
                                        `📐 Original Size`
                                    )}
                                </span>
                                {shouldShowBackButton && (
                                    <button 
                                        className="back-to-original-button"
                                        onClick={handleBackToOriginal}
                                    >
                                        🔄 Back to Original
                                    </button>
                                )}
                            </div>
                            <ImagePreview imageSrc={previewImageSrc} />
                        </div>
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
};

export default App;

