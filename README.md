# 🖼️ Image Asset Generator

A powerful, modern web application for converting images into multiple formats and dimensions. Built with React and TypeScript, this tool is perfect for developers, designers, and anyone who needs to quickly generate image assets for web, mobile, or desktop applications.

## ✨ Features

### 🎯 Core Functionality
- **Multi-format Support**: Upload images in PNG, JPEG, WEBP, and SVG formats
- **Real-time Preview**: See your resized image instantly before downloading
- **Batch Download**: Generate multiple sizes at once in ZIP format
- **Custom Dimensions**: Enter any width and height for your specific needs
- **Aspect Ratio Lock**: Maintain original proportions when resizing

### 📱 Platform-Specific Presets
- **Standard Sizes**: Common web dimensions (16×16 to 512×512)
- **Android Icons**: Complete set of Android app icon sizes with proper naming
- **iOS Icons**: Full range of iOS app icon dimensions for all devices

### ⚙️ Advanced Options
- **Upscaling Quality**: Choose from Standard, High, or Ultra quality algorithms
- **Smart Resizing**: Multi-step resizing for better quality when upscaling
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

## 🚀 Quick Start

### Prerequisites
- Node.js (version 14 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/dragospetrescu/image-asset-generator.git
   ```

2. **Navigate to the project directory**
   ```bash
   cd image-asset-generator
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Open your browser** and go to `http://localhost:3000`

## 📖 Usage Guide

### Basic Workflow

1. **Upload an Image**
   - Click the upload area or drag and drop your image
   - Supported formats: PNG, JPEG, WEBP, SVG
   - Maximum file size: 10MB

2. **Choose Download Mode**
   - **📦 Standard**: Common web dimensions
   - **🤖 Android**: Android app icon sizes
   - **🍎 iOS**: iOS app icon dimensions
   - **🎯 Custom**: Enter your own dimensions

3. **Select Size or Enter Custom Dimensions**
   - Click on predefined sizes to preview
   - For custom mode, enter width and height
   - Use the aspect ratio lock to maintain proportions

4. **Configure Quality Settings**
   - **Standard**: Fast processing, basic quality
   - **High**: Multi-step resizing for better quality
   - **Ultra**: Advanced algorithms, best quality (slower)

5. **Download**
   - Single size: Downloads immediately
   - Multiple sizes: Creates a ZIP file with all variants

### Android Icon Sizes Included
- **Launcher Icons**: 48×48 to 512×512
- **Notification Icons**: 24×24 to 96×96
- **Action Bar Icons**: 32×32 to 96×96
- **And more**: Complete set for all Android densities

### iOS Icon Sizes Included
- **App Icons**: 20×20 to 1024×1024
- **Spotlight Icons**: 40×40 to 120×120
- **Settings Icons**: 29×29 to 87×87
- **And more**: Full range for iPhone, iPad, and Apple Watch

## 🛠️ Technology Stack

- **Frontend Framework**: React 18
- **Language**: TypeScript
- **Styling**: CSS3 with modern features
- **Build Tool**: Create React App
- **Image Processing**: HTML5 Canvas API
- **File Handling**: JSZip for batch downloads

## 🎨 Key Features in Detail

### Smart Image Resizing
The application uses advanced canvas-based resizing algorithms that provide better quality than simple CSS scaling:

- **Multi-step resizing** for upscaling operations
- **Bicubic interpolation** for smooth results
- **Quality preservation** during format conversion

### Responsive Design
- **Mobile-first approach** with touch-friendly interface
- **Adaptive layouts** that work on all screen sizes
- **Progressive enhancement** for better performance

### User Experience
- **Drag & drop support** for easy file uploads
- **Real-time previews** with instant feedback
- **Keyboard shortcuts** for power users
- **Progress indicators** for long operations

## 📂 Project Structure

```
image-asset-generator/
├── public/
│   ├── index.html
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── Footer.tsx
│   │   ├── DownloadButton.tsx
│   │   └── ImageUpload.tsx
│   ├── utils/
│   │   └── imageUtils.ts
│   ├── App.tsx
│   ├── App.css
│   └── index.tsx
├── package.json
└── README.md
```

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### Development Setup
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and test thoroughly
4. Commit your changes: `git commit -m 'Add amazing feature'`
5. Push to the branch: `git push origin feature/amazing-feature`
6. Open a Pull Request

### Contribution Guidelines
- Follow the existing code style and conventions
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting

### Reporting Issues
- Use the GitHub issue tracker
- Provide detailed reproduction steps
- Include browser and OS information
- Add screenshots if applicable

## 🐛 Known Issues & Limitations

- SVG files are converted to raster formats during processing
- Very large images (>50MB) may cause performance issues
- Some browsers may have memory limitations with Ultra quality mode

## 🚀 Future Enhancements

- [ ] WebP and AVIF output format support
- [ ] Batch processing for multiple input files
- [ ] Cloud storage integration
- [ ] API for programmatic access
- [ ] Advanced image filters and effects
- [ ] PWA support for offline usage

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Dragos Petrescu**
- GitHub: [@dragospetrescu](https://github.com/Dragos20Tech)
- LinkedIn: [Dragos Petrescu](https://www.linkedin.com/in/dragospetrescu2001/)

## 🙏 Acknowledgments

- React team for the excellent framework
- TypeScript community for type safety
- Canvas API for image processing capabilities
- All contributors and users who provide feedback

## 📊 Project Stats

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)
![Version](https://img.shields.io/badge/version-1.0.0-orange)
![React](https://img.shields.io/badge/React-18-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-4.9-blue)

---

<div align="center">
  <p>Made with ❤️ by <strong>Dragos Petrescu</strong></p>
  <p>⭐ Star this repo if you find it helpful!</p>
</div>