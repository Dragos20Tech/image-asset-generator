export const convertImageFormat = (file: File, targetFormat: string): Promise<Blob> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.drawImage(img, 0, 0);
                    canvas.toBlob((blob) => {
                        if (blob) {
                            resolve(blob);
                        } else {
                            reject(new Error('Conversion failed'));
                        }
                    }, targetFormat);
                } else {
                    reject(new Error('Canvas context not available'));
                }
            };
            img.src = event.target?.result as string;
        };
        reader.onerror = () => {
            reject(new Error('File reading failed'));
        };
        reader.readAsDataURL(file);
    });
};

export const isFormatSupported = (file: File): boolean => {
    const supportedFormats = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'];
    return supportedFormats.includes(file.type);
};