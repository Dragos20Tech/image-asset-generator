import React, { useState, useEffect } from 'react';
import JSZip from 'jszip';

interface DownloadButtonProps {
    imageData: string | null;
    onPreviewSizeChange: (imageData: string | null, size: { width: number; height: number } | null) => void;
    onBackToOriginal: () => void;
}

interface SizeItem {
    width: number;
    height: number;
    name?: string;
}

const sizes: SizeItem[] = [
    { width: 16, height: 16 },
    { width: 32, height: 32 },
    { width: 64, height: 64 },
    { width: 128, height: 128 },
    { width: 192, height: 192 },
    { width: 256, height: 256 },
    { width: 512, height: 512 },
    { width: 1024, height: 1024 }
];

const previewSizes: SizeItem[] = [
    { width: 16, height: 16 },
    { width: 32, height: 32 },
    { width: 64, height: 64 },
    { width: 128, height: 128 },
    { width: 192, height: 192 },
    { width: 256, height: 256 },
    { width: 512, height: 512 }
];

// Android icon sizes (App Icons)
const androidSizes: SizeItem[] = [
    { width: 36, height: 36, name: 'mdpi' },
    { width: 48, height: 48, name: 'hdpi' },
    { width: 72, height: 72, name: 'xhdpi' },
    { width: 96, height: 96, name: 'xxhdpi' },
    { width: 144, height: 144, name: 'xxxhdpi' },
    { width: 192, height: 192, name: 'xxxhdpi-large' }
];

// iOS icon sizes (App Icons)
const iosSizes: SizeItem[] = [
    { width: 20, height: 20, name: 'iPhone-notification' },
    { width: 29, height: 29, name: 'iPhone-settings' },
    { width: 40, height: 40, name: 'iPhone-spotlight' },
    { width: 58, height: 58, name: 'iPhone-settings@2x' },
    { width: 60, height: 60, name: 'iPhone-app' },
    { width: 80, height: 80, name: 'iPhone-spotlight@2x' },
    { width: 87, height: 87, name: 'iPhone-settings@3x' },
    { width: 120, height: 120, name: 'iPhone-app@2x' },
    { width: 180, height: 180, name: 'iPhone-app@3x' },
    { width: 1024, height: 1024, name: 'App-Store' }
];

const DownloadButton: React.FC<DownloadButtonProps> = ({ imageData, onPreviewSizeChange, onBackToOriginal }) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [selectedSize, setSelectedSize] = useState<{ width: number; height: number } | null>(null);
    const [customWidth, setCustomWidth] = useState<string>('');
    const [customHeight, setCustomHeight] = useState<string>('');
    const [downloadMode, setDownloadMode] = useState<'standard' | 'custom' | 'android' | 'ios'>('standard');
    const [aspectRatioLocked, setAspectRatioLocked] = useState(false);
    const [originalAspectRatio, setOriginalAspectRatio] = useState<number>(1);
    const [upscaleQuality, setUpscaleQuality] = useState<'standard' | 'high' | 'ultra'>('high');

    // Get original image dimensions to calculate aspect ratio
    useEffect(() => {
        if (imageData) {
            const img = new Image();
            img.onload = () => {
                const ratio = img.width / img.height;
                setOriginalAspectRatio(ratio);
                console.log(`Original aspect ratio: ${ratio} (${img.width}x${img.height})`);
            };
            img.src = imageData;
        }
    }, [imageData]);

    const resizeImage = (imageSrc: string, width: number, height: number): Promise<string> => {
        return resizeImageAdvanced(imageSrc, width, height, upscaleQuality);
    };

    const resizeImageAdvanced = (
        imageSrc: string, 
        width: number, 
        height: number, 
        quality: 'standard' | 'high' | 'ultra'
    ): Promise<string> => {
        return new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            if (!ctx) {
                reject(new Error('Could not get canvas context'));
                return;
            }

            const img = new Image();
            img.src = imageSrc;

            img.onload = () => {
                const originalWidth = img.width;
                const originalHeight = img.height;
                const isUpscaling = width > originalWidth || height > originalHeight;
                
                console.log(`Resizing image to ${width}x${height} with ${quality} quality`);
                
                if (!isUpscaling || quality === 'standard') {
                    // Standard resize
                    ctx.imageSmoothingEnabled = true;
                    ctx.imageSmoothingQuality = 'high';
                    ctx.drawImage(img, 0, 0, width, height);
                } else if (quality === 'high') {
                    // Multi-step resizing
                    resizeWithSteps(ctx, img, originalWidth, originalHeight, width, height);
                } else if (quality === 'ultra') {
                    // Ultra quality with sharpening
                    resizeWithSharpening(ctx, img, originalWidth, originalHeight, width, height);
                }
                
                const resizedDataUrl = canvas.toDataURL('image/png');
                console.log('Resize successful');
                resolve(resizedDataUrl);
            };

            img.onerror = () => {
                reject(new Error('Failed to load image'));
            };
        });
    };

    // Multi-step resizing for better upscaling quality
    const resizeWithSteps = (
        ctx: CanvasRenderingContext2D, 
        img: HTMLImageElement, 
        originalWidth: number, 
        originalHeight: number, 
        targetWidth: number, 
        targetHeight: number
    ) => {
        const scaleX = targetWidth / originalWidth;
        const scaleY = targetHeight / originalHeight;
        const maxScale = Math.max(scaleX, scaleY);
        
        // If scaling is less than 2x, do direct resize
        if (maxScale < 2) {
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
            return;
        }
        
        // For larger scaling, do it in steps of maximum 2x
        let currentCanvas = document.createElement('canvas');
        let currentCtx = currentCanvas.getContext('2d');
        let currentWidth = originalWidth;
        let currentHeight = originalHeight;
        
        if (!currentCtx) return;
        
        currentCanvas.width = currentWidth;
        currentCanvas.height = currentHeight;
        currentCtx.imageSmoothingEnabled = true;
        currentCtx.imageSmoothingQuality = 'high';
        currentCtx.drawImage(img, 0, 0);
        
        // Scale in steps of 2x maximum
        while (currentWidth < targetWidth || currentHeight < targetHeight) {
            const nextWidth = Math.min(currentWidth * 2, targetWidth);
            const nextHeight = Math.min(currentHeight * 2, targetHeight);
            const nextCanvas = document.createElement('canvas');
            const nextCtx = nextCanvas.getContext('2d');
            if (!nextCtx) return;
            
            nextCanvas.width = nextWidth;
            nextCanvas.height = nextHeight;
            nextCtx.imageSmoothingEnabled = true;
            nextCtx.imageSmoothingQuality = 'high';
            
            // Remove duplicate drawImage call - only draw once
            nextCtx.drawImage(currentCanvas, 0, 0, nextWidth, nextHeight);
            
            currentCanvas = nextCanvas;
            currentCtx = nextCtx;
            currentWidth = nextWidth;
            currentHeight = nextHeight;
        }
        
        // Draw final result to the target canvas
        ctx.drawImage(currentCanvas, 0, 0, targetWidth, targetHeight);
    };

    // Ultra quality resize with post-processing
    const resizeWithSharpening = (
        ctx: CanvasRenderingContext2D,
        img: HTMLImageElement,
        originalWidth: number,
        originalHeight: number,
        targetWidth: number,
        targetHeight: number
    ) => {
        // First do multi-step resizing
        resizeWithSteps(ctx, img, originalWidth, originalHeight, targetWidth, targetHeight);
        
        // Apply unsharp mask for better quality
        const imageData = ctx.getImageData(0, 0, targetWidth, targetHeight);
        const sharpened = applyUnsharpMask(imageData);
        ctx.putImageData(sharpened, 0, 0);
    };

    // Improved unsharp mask implementation
    const applyUnsharpMask = (imageData: ImageData): ImageData => {
        const data = imageData.data;
        const width = imageData.width;
        const height = imageData.height;
        const result = new ImageData(width, height);
        
        // Copy original data
        for (let i = 0; i < data.length; i++) {
            result.data[i] = data[i];
        }
        
        // Gentler sharpening kernel for better quality
        const sharpenKernel = [
            0, -0.5, 0,
            -0.5, 3, -0.5,
            0, -0.5, 0
        ];
        
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                for (let c = 0; c < 3; c++) { // RGB channels only
                    let sum = 0;
                    for (let ky = 0; ky < 3; ky++) {
                        for (let kx = 0; kx < 3; kx++) {
                            const pixelIndex = ((y + ky - 1) * width + (x + kx - 1)) * 4 + c;
                            sum += data[pixelIndex] * sharpenKernel[ky * 3 + kx];
                        }
                    }
                    
                    const resultIndex = (y * width + x) * 4 + c;
                    // Blend with original for gentler sharpening
                    const original = data[resultIndex];
                    const sharpened = Math.max(0, Math.min(255, sum));
                    result.data[resultIndex] = Math.round(original * 0.7 + sharpened * 0.3);
                }
            }
        }
        
        return result;
    };

    // Updated blob version to use advanced quality settings
    const resizeImageToBlob = (imageSrc: string, width: number, height: number): Promise<Blob> => {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            const img = new Image();
            img.src = imageSrc;

            img.onload = () => {
                const originalWidth = img.width;
                const originalHeight = img.height;
                const isUpscaling = width > originalWidth || height > originalHeight;
                
                if (!isUpscaling || upscaleQuality === 'standard') {
                    // Standard resize
                    ctx.imageSmoothingEnabled = true;
                    ctx.imageSmoothingQuality = 'high';
                    ctx.drawImage(img, 0, 0, width, height);
                } else if (upscaleQuality === 'high') {
                    // Multi-step resizing
                    resizeWithSteps(ctx, img, originalWidth, originalHeight, width, height);
                } else if (upscaleQuality === 'ultra') {
                    // Ultra quality with sharpening
                    resizeWithSharpening(ctx, img, originalWidth, originalHeight, width, height);
                }
                
                canvas.toBlob((blob) => {
                    if (blob) {
                        resolve(blob);
                    }
                }, 'image/png');
            };
        });
    };

    const handleSizeClick = async (size: { width: number; height: number }) => {
        console.log('Size clicked:', size);
        if (!imageData) {
            console.log('No image data available');
            return;
        }

        setSelectedSize(size);
        
        try {
            console.log('Starting resize...');
            const resizedImageData = await resizeImage(imageData, size.width, size.height);
            console.log('Resize completed, calling onPreviewSizeChange');
            onPreviewSizeChange(resizedImageData, { width: size.width, height: size.height });
        } catch (error) {
            console.error('Error resizing image for preview:', error);
        }
    };

    // Handle custom width change with aspect ratio lock
    const handleCustomWidthChange = (value: string) => {
        setCustomWidth(value);
        
        if (aspectRatioLocked && value && !isNaN(parseInt(value))) {
            const width = parseInt(value);
            const height = Math.round(width / originalAspectRatio);
            setCustomHeight(height.toString());
        }
    };

    // Handle custom height change with aspect ratio lock
    const handleCustomHeightChange = (value: string) => {
        setCustomHeight(value);
        
        if (aspectRatioLocked && value && !isNaN(parseInt(value))) {
            const height = parseInt(value);
            const width = Math.round(height * originalAspectRatio);
            setCustomWidth(width.toString());
        }
    };

    // Toggle aspect ratio lock
    const handleAspectRatioToggle = () => {
        setAspectRatioLocked(!aspectRatioLocked);
        
        // If locking and we have a width, adjust height
        if (!aspectRatioLocked && customWidth && !isNaN(parseInt(customWidth))) {
            const width = parseInt(customWidth);
            const height = Math.round(width / originalAspectRatio);
            setCustomHeight(height.toString());
        }
        // If locking and we have a height but no width, adjust width
        else if (!aspectRatioLocked && customHeight && !customWidth && !isNaN(parseInt(customHeight))) {
            const height = parseInt(customHeight);
            const width = Math.round(height * originalAspectRatio);
            setCustomWidth(width.toString());
        }
    };

    // Update preview when custom dimensions change
    useEffect(() => {
        const updateCustomPreview = async () => {
            if (!imageData || !customWidth || !customHeight || downloadMode !== 'custom') return;

            const width = parseInt(customWidth);
            const height = parseInt(customHeight);

            if (isNaN(width) || isNaN(height) || width <= 0 || height <= 0) return;

            try {
                const resizedImageData = await resizeImage(imageData, width, height);
                onPreviewSizeChange(resizedImageData, { width, height });
                setSelectedSize({ width, height });
            } catch (error) {
                console.error('Error resizing image for custom preview:', error);
            }
        };

        if (customWidth && customHeight && downloadMode === 'custom') {
            updateCustomPreview();
        }
    }, [customWidth, customHeight, imageData, onPreviewSizeChange, downloadMode]);

    // Listen for back to original events to reset selection
    useEffect(() => {
        const handleResetSelection = () => {
            setSelectedSize(null);
            setCustomWidth('');
            setCustomHeight('');
        };
        
        window.addEventListener('resetDownloadSelection', handleResetSelection);
        
        return () => {
            window.removeEventListener('resetDownloadSelection', handleResetSelection);
        };
    }, []);

    // Handle mode changes - clear selections when switching modes
    const handleModeChange = (mode: 'standard' | 'custom' | 'android' | 'ios') => {
        setDownloadMode(mode);
        // Clear all selections when switching modes
        setCustomWidth('');
        setCustomHeight('');
        setSelectedSize(null);
        setAspectRatioLocked(false);
        onPreviewSizeChange(imageData, null);
    };

    const handleDownloadStandard = async () => {
        if (!imageData) return;

        setIsGenerating(true);
        
        try {
            const zip = new JSZip();
            const imageFolder = zip.folder('image-assets');

            const promises = sizes.map(async (size) => {
                const blob = await resizeImageToBlob(imageData, size.width, size.height);
                const fileName = `${size.width}x${size.height}.png`;
                imageFolder?.file(fileName, blob);
            });

            await Promise.all(promises);

            const zipBlob = await zip.generateAsync({ type: 'blob' });
            const url = URL.createObjectURL(zipBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'image-assets.zip';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

        } catch (error) {
            console.error('Error generating ZIP file:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDownloadAndroid = async () => {
        if (!imageData) return;

        setIsGenerating(true);
        
        try {
            const zip = new JSZip();
            const androidFolder = zip.folder('android-icons');

            const promises = androidSizes.map(async (size) => {
                const blob = await resizeImageToBlob(imageData, size.width, size.height);
                const fileName = `ic_launcher_${size.name}_${size.width}x${size.height}.png`;
                androidFolder?.file(fileName, blob);
            });

            await Promise.all(promises);

            const zipBlob = await zip.generateAsync({ type: 'blob' });
            const url = URL.createObjectURL(zipBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'android-app-icons.zip';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

        } catch (error) {
            console.error('Error generating Android ZIP file:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDownloadIOS = async () => {
        if (!imageData) return;

        setIsGenerating(true);
        
        try {
            const zip = new JSZip();
            const iosFolder = zip.folder('ios-icons');

            const promises = iosSizes.map(async (size) => {
                const blob = await resizeImageToBlob(imageData, size.width, size.height);
                const fileName = `icon_${size.name}_${size.width}x${size.height}.png`;
                iosFolder?.file(fileName, blob);
            });

            await Promise.all(promises);

            const zipBlob = await zip.generateAsync({ type: 'blob' });
            const url = URL.createObjectURL(zipBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'ios-app-icons.zip';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

        } catch (error) {
            console.error('Error generating iOS ZIP file:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDownloadCustom = async () => {
        if (!imageData || !isCustomSizeValid) return;

        setIsGenerating(true);
        
        try {
            const width = parseInt(customWidth);
            const height = parseInt(customHeight);
            const blob = await resizeImageToBlob(imageData, width, height);
            
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `custom-image-${width}x${height}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

        } catch (error) {
            console.error('Error downloading custom image:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    // Reset when imageData changes
    useEffect(() => {
        console.log('DownloadButton useEffect triggered, imageData changed');
        setSelectedSize(null);
        setCustomWidth('');
        setCustomHeight('');
        setDownloadMode('standard');
        setAspectRatioLocked(false);
        if (imageData) {
            onPreviewSizeChange(imageData, null);
        }
    }, [imageData]);

    const getCurrentSizes = () => {
        switch (downloadMode) {
            case 'android':
                return androidSizes;
            case 'ios':
                return iosSizes;
            default:
                return previewSizes;
        }
    };

    const getCurrentDownloadHandler = () => {
        switch (downloadMode) {
            case 'android':
                return handleDownloadAndroid;
            case 'ios':
                return handleDownloadIOS;
            case 'custom':
                return handleDownloadCustom;
            default:
                return handleDownloadStandard;
        }
    };

    const getDownloadButtonText = () => {
        if (isGenerating) return 'Generating...';
        
        switch (downloadMode) {
            case 'android':
                return 'Download Android Icons (ZIP)';
            case 'ios':
                return 'Download iOS Icons (ZIP)';
            case 'custom':
                return `Download Custom ${isCustomSizeValid ? `(${customWidth}×${customHeight})` : ''}`;
            default:
                return 'Download All Sizes (ZIP)';
        }
    };

    const getDownloadIcon = () => {
        if (isGenerating) return '⏳';
        
        switch (downloadMode) {
            case 'android':
                return (
                    <svg width="24" height="24" viewBox="0 0 413.137 413.137" fill="currentColor">
                        <g>
                            <path d="M311.358,136.395H101.779c-4.662,0-8.441,3.779-8.441,8.441v175.749
                                c0,4.662,3.779,8.441,8.441,8.441h37.363v59.228c0,13.742,11.14,24.883,24.883,24.883l0,0c13.742,0,24.883-11.14,24.883-24.883
                                v-59.228h34.803v59.228c0,13.742,11.14,24.883,24.883,24.883l0,0c13.742,0,24.883-11.14,24.883-24.883v-59.228h37.882
                                c4.662,0,8.441-3.779,8.441-8.441V144.836C319.799,140.174,316.02,136.395,311.358,136.395z"/>
                            <path d="M57.856,136.354L57.856,136.354c-13.742,0-24.883,11.14-24.883,24.883v101.065
                                c0,13.742,11.14,24.883,24.883,24.883l0,0c13.742,0,24.883-11.14,24.883-24.883V161.237
                                C82.738,147.495,71.598,136.354,57.856,136.354z"/>
                            <path d="M355.281,136.354L355.281,136.354c-13.742,0-24.883,11.14-24.883,24.883v101.065
                                c0,13.742,11.14,24.883,24.883,24.883l0,0c13.742,0,24.883-11.14,24.883-24.883V161.237
                                C380.164,147.495,369.024,136.354,355.281,136.354z"/>
                            <path d="M103.475,124.069h205.692c5.366,0,9.368-4.943,8.266-10.195
                                c-6.804-32.428-27.45-59.756-55.465-75.543l17.584-31.727c1.19-2.148,0.414-4.855-1.734-6.045
                                c-2.153-1.193-4.856-0.414-6.046,1.734l-17.717,31.966c-14.511-6.734-30.683-10.495-47.734-10.495
                                c-17.052,0-33.224,3.761-47.735,10.495L140.869,2.292c-1.191-2.149-3.898-2.924-6.045-1.734c-2.148,1.19-2.924,3.897-1.734,6.045
                                l17.584,31.727c-28.015,15.788-48.661,43.115-55.465,75.544C94.106,119.126,98.108,124.069,103.475,124.069z M267.697,76.786
                                c0,5.282-4.282,9.565-9.565,9.565c-5.282,0-9.565-4.282-9.565-9.565c0-5.282,4.282-9.565,9.565-9.565
                                C263.415,67.221,267.697,71.504,267.697,76.786z M154.508,67.221c5.282,0,9.565,4.282,9.565,9.565c0,5.282-4.282,9.565-9.565,9.565
                                c-5.282,0-9.565-4.282-9.565-9.565C144.943,71.504,149.225,67.221,154.508,67.221z"/>
                        </g>
                    </svg>
                );
            case 'ios':
                return (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                    </svg>
                );
            case 'custom':
                return '⬇️';
            default:
                return '📦';
        }
    };

    const isCustomSizeValid = customWidth && customHeight && !isNaN(parseInt(customWidth)) && !isNaN(parseInt(customHeight));

    return (
        <div className="download-container">
            {/* Upscale Quality Selector */}
            <div className="upscale-quality-section">
                <h4>🔍 Upscaling Quality:</h4>
                <div className="quality-buttons">
                    <button
                        className={`quality-button ${upscaleQuality === 'standard' ? 'active' : ''}`}
                        onClick={() => setUpscaleQuality('standard')}
                    >
                        Standard
                    </button>
                    <button
                        className={`quality-button ${upscaleQuality === 'high' ? 'active' : ''}`}
                        onClick={() => setUpscaleQuality('high')}
                    >
                        High
                    </button>
                    <button
                        className={`quality-button ${upscaleQuality === 'ultra' ? 'active' : ''}`}
                        onClick={() => setUpscaleQuality('ultra')}
                    >
                        Ultra
                    </button>
                </div>
                <div className="quality-info">
                    <small>
                        {upscaleQuality === 'standard' && 'Fast processing, basic quality'}
                        {upscaleQuality === 'high' && 'Multi-step resizing for better quality'}
                        {upscaleQuality === 'ultra' && 'Advanced algorithms, best quality (slower)'}
                    </small>
                </div>
            </div>
            
            {/* Main toggle with 4 options */}
            <div className="main-download-toggle">
                <button
                    className={`main-toggle-button ${downloadMode === 'standard' ? 'active' : ''}`}
                    onClick={() => handleModeChange('standard')}
                >
                    📦 Standard
                </button>
                <button
                    className={`main-toggle-button ${downloadMode === 'android' ? 'active' : ''}`}
                    onClick={() => handleModeChange('android')}
                >
                    <svg 
                        width="16" 
                        height="16" 
                        viewBox="0 0 413.137 413.137" 
                        fill={downloadMode === 'android' ? 'currentColor' : '#4CAF50'}
                        style={{ marginRight: '6px' }}
                    >
                        <g>
                            <path d="M311.358,136.395H101.779c-4.662,0-8.441,3.779-8.441,8.441v175.749
                                c0,4.662,3.779,8.441,8.441,8.441h37.363v59.228c0,13.742,11.14,24.883,24.883,24.883l0,0c13.742,0,24.883-11.14,24.883-24.883
                                v-59.228h34.803v59.228c0,13.742,11.14,24.883,24.883,24.883l0,0c13.742,0,24.883-11.14,24.883-24.883v-59.228h37.882
                                c4.662,0,8.441-3.779,8.441-8.441V144.836C319.799,140.174,316.02,136.395,311.358,136.395z"/>
                            <path d="M57.856,136.354L57.856,136.354c-13.742,0-24.883,11.14-24.883,24.883v101.065
                                c0,13.742,11.14,24.883,24.883,24.883l0,0c13.742,0,24.883-11.14,24.883-24.883V161.237
                                C82.738,147.495,71.598,136.354,57.856,136.354z"/>
                            <path d="M355.281,136.354L355.281,136.354c-13.742,0-24.883,11.14-24.883,24.883v101.065
                                c0,13.742,11.14,24.883,24.883,24.883l0,0c13.742,0,24.883-11.14,24.883-24.883V161.237
                                C380.164,147.495,369.024,136.354,355.281,136.354z"/>
                            <path d="M103.475,124.069h205.692c5.366,0,9.368-4.943,8.266-10.195
                                c-6.804-32.428-27.45-59.756-55.465-75.543l17.584-31.727c1.19-2.148,0.414-4.855-1.734-6.045
                                c-2.153-1.193-4.856-0.414-6.046,1.734l-17.717,31.966c-14.511-6.734-30.683-10.495-47.734-10.495
                                c-17.052,0-33.224,3.761-47.735,10.495L140.869,2.292c-1.191-2.149-3.898-2.924-6.045-1.734c-2.148,1.19-2.924,3.897-1.734,6.045
                                l17.584,31.727c-28.015,15.788-48.661,43.115-55.465,75.544C94.106,119.126,98.108,124.069,103.475,124.069z M267.697,76.786
                                c0,5.282-4.282,9.565-9.565,9.565c-5.282,0-9.565-4.282-9.565-9.565c0-5.282,4.282-9.565,9.565-9.565
                                C263.415,67.221,267.697,71.504,267.697,76.786z M154.508,67.221c5.282,0,9.565,4.282,9.565,9.565c0,5.282-4.282,9.565-9.565,9.565
                                c-5.282,0-9.565-4.282-9.565-9.565C144.943,71.504,149.225,67.221,154.508,67.221z"/>
                        </g>
                    </svg>
                    Android
                </button>
                <button
                    className={`main-toggle-button ${downloadMode === 'ios' ? 'active' : ''}`}
                    onClick={() => handleModeChange('ios')}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '6px' }}>
                        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                    </svg>
                    iOS
                </button>
                <button
                    className={`main-toggle-button ${downloadMode === 'custom' ? 'active' : ''}`}
                    onClick={() => handleModeChange('custom')}
                >
                    🎯 Custom
                </button>
            </div>

            {/* Standard, Android, and iOS sizes container */}
            {(downloadMode === 'standard' || downloadMode === 'android' || downloadMode === 'ios') && (
                <div className="standard-container">
                    <div className="size-preview">
                        <h3>
                            {downloadMode === 'standard' && '📦 Click size to preview:'}
                            {downloadMode === 'android' && (
                                <>
                                    <svg 
                                        width="20" 
                                        height="20" 
                                        viewBox="0 0 413.137 413.137" 
                                        fill="#4CAF50"
                                        style={{ marginRight: '8px', verticalAlign: 'middle' }}
                                    >
                                        <g>
                                            <path d="M311.358,136.395H101.779c-4.662,0-8.441,3.779-8.441,8.441v175.749
                                                c0,4.662,3.779,8.441,8.441,8.441h37.363v59.228c0,13.742,11.14,24.883,24.883,24.883l0,0c13.742,0,24.883-11.14,24.883-24.883
                                                v-59.228h34.803v59.228c0,13.742,11.14,24.883,24.883,24.883l0,0c13.742,0,24.883-11.14,24.883-24.883v-59.228h37.882
                                                c4.662,0,8.441-3.779,8.441-8.441V144.836C319.799,140.174,316.02,136.395,311.358,136.395z"/>
                                            <path d="M57.856,136.354L57.856,136.354c-13.742,0-24.883,11.14-24.883,24.883v101.065
                                                c0,13.742,11.14,24.883,24.883,24.883l0,0c13.742,0,24.883-11.14,24.883-24.883V161.237
                                                C82.738,147.495,71.598,136.354,57.856,136.354z"/>
                                            <path d="M355.281,136.354L355.281,136.354c-13.742,0-24.883,11.14-24.883,24.883v101.065
                                                c0,13.742,11.14,24.883,24.883,24.883l0,0c13.742,0,24.883-11.14,24.883-24.883V161.237
                                                C380.164,147.495,369.024,136.354,355.281,136.354z"/>
                                            <path d="M103.475,124.069h205.692c5.366,0,9.368-4.943,8.266-10.195
                                                c-6.804-32.428-27.45-59.756-55.465-75.543l17.584-31.727c1.19-2.148,0.414-4.855-1.734-6.045
                                                c-2.153-1.193-4.856-0.414-6.046,1.734l-17.717,31.966c-14.511-6.734-30.683-10.495-47.734-10.495
                                                c-17.052,0-33.224,3.761-47.735,10.495L140.869,2.292c-1.191-2.149-3.898-2.924-6.045-1.734c-2.148,1.19-2.924,3.897-1.734,6.045
                                                l17.584,31.727c-28.015,15.788-48.661,43.115-55.465,75.544C94.106,119.126,98.108,124.069,103.475,124.069z M267.697,76.786
                                                c0,5.282-4.282,9.565-9.565,9.565c-5.282,0-9.565-4.282-9.565-9.565c0-5.282,4.282-9.565,9.565-9.565
                                                C263.415,67.221,267.697,71.504,267.697,76.786z M154.508,67.221c5.282,0,9.565,4.282,9.565,9.565c0,5.282-4.282,9.565-9.565,9.565
                                                c-5.282,0-9.565-4.282-9.565-9.565C144.943,71.504,149.225,67.221,154.508,67.221z"/>
                                        </g>
                                    </svg>
                                    Android App Icon Sizes:
                                </>
                            )}
                            {downloadMode === 'ios' && (
                                <>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '8px', verticalAlign: 'middle' }}>
                                        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                                    </svg>
                                    iOS App Icon Sizes:
                                </>
                            )}
                        </h3>
                        <div className="size-grid">
                            {getCurrentSizes().map((size) => (
                                <div 
                                    key={`${size.width}x${size.height}`}
                                    className={`size-item ${
                                        selectedSize?.width === size.width && selectedSize?.height === size.height
                                            ? 'selected' 
                                            : ''
                                    }`}
                                    onClick={() => handleSizeClick(size)}
                                    title={downloadMode !== 'standard' ? size.name : undefined}
                                >
                                    {size.width}×{size.height}
                                    {downloadMode !== 'standard' && size.name && (
                                        <span className="size-name">{size.name}</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Custom size container */}
            {downloadMode === 'custom' && (
                <div className="custom-container">
                    <div className="custom-form">
                        <h3>🎯 Enter custom dimensions:</h3>
                        
                        {/* Custom inputs and aspect ratio toggle on same line */}
                        <div className="custom-controls-row">
                            <div className="custom-inputs">
                                <input
                                    type="number"
                                    placeholder="Width"
                                    value={customWidth}
                                    onChange={(e) => handleCustomWidthChange(e.target.value)}
                                    className="custom-input no-arrows"
                                />
                                <span className="input-separator">×</span>
                                <input
                                    type="number"
                                    placeholder="Height"
                                    value={customHeight}
                                    onChange={(e) => handleCustomHeightChange(e.target.value)}
                                    className="custom-input no-arrows"
                                />
                            </div>
                            
                            <div className="aspect-ratio-toggle">
                                <button 
                                    className={`aspect-ratio-button ${aspectRatioLocked ? 'locked' : ''}`}
                                    onClick={handleAspectRatioToggle}
                                    title={aspectRatioLocked ? 'Unlock aspect ratio' : 'Lock aspect ratio'}
                                >
                                    {aspectRatioLocked ? '🔒' : '🔓'} 
                                    {aspectRatioLocked ? ' Aspect Ratio Locked' : ' Lock Aspect Ratio'}
                                </button>
                            </div>
                        </div>
                        
                        {aspectRatioLocked && (
                            <div className="aspect-ratio-info">
                                <small>Aspect ratio: {originalAspectRatio.toFixed(3)}</small>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Download button at the bottom */}
            <button 
                className="download-button" 
                onClick={getCurrentDownloadHandler()}
                disabled={!imageData || isGenerating || (downloadMode === 'custom' && !isCustomSizeValid)}
            >
                <span className="download-icon">
                    {getDownloadIcon()}
                </span>
                {getDownloadButtonText()}
            </button>
        </div>
    );
};

export default DownloadButton;