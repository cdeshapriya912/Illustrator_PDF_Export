# Illustrator Artboard to PDF Exporter

A powerful Adobe Illustrator script that exports multiple artboards to individual PDF files with advanced layer management and export options.

## 🚀 Features

- **Individual PDF Export**: Export each artboard as a separate PDF file
- **Smart Layer Management**: Option to hide layers outside artboard bounds for cleaner exports
- **User-Friendly Interface**: Both GUI panel and simple dialog options
- **Export Optimization**: Web-optimized PDF generation
- **Thumbnail Generation**: Optional thumbnail creation for PDFs
- **Debug Mode**: Detailed export information for troubleshooting
- **Fallback Support**: Simple interface if panel creation fails
- **Error Handling**: Comprehensive error handling with user-friendly messages

## 📋 Requirements

- Adobe Illustrator (tested with recent versions)
- JavaScript support enabled in Illustrator
- Sufficient disk space for PDF exports

## 🛠️ Installation

1. Download the `artboardExport.jsx` file
2. Place it in your Illustrator Scripts folder:
   - **Windows**: `C:\Program Files\Adobe\Adobe Illustrator [version]\Presets\[language]\Scripts\`
   - **macOS**: `/Applications/Adobe Illustrator [version]/Presets/[language]/Scripts/`
3. Restart Adobe Illustrator
4. Access the script via `File > Scripts > artboardExport`

## 📖 Usage

### Method 1: GUI Panel (Recommended)

1. Open an Illustrator document with multiple artboards
2. Run the script from `File > Scripts > artboardExport`
3. The export panel will appear with the following options:
   - **Output Folder**: Click "Browse" to select where PDFs will be saved
   - **Hide layers outside artboard bounds**: Cleaner PDFs by hiding irrelevant content
   - **Optimize PDF for web**: Smaller file sizes for web use
   - **Generate thumbnails**: Create PDF thumbnails
4. Click "Export PDFs" to start the export process

### Method 2: Simple Dialog (Fallback)

If the panel interface fails, the script will automatically fall back to a simple dialog system that prompts for:
- Output folder selection
- Export options via confirmation dialogs
- Debug mode activation

## ⚙️ Export Options

| Option | Description | Default |
|--------|-------------|---------|
| **Hide layers outside artboard bounds** | Hides layers that don't intersect with the current artboard | ✅ Enabled |
| **Optimize PDF for web** | Reduces file size for web distribution | ✅ Enabled |
| **Generate thumbnails** | Creates PDF thumbnails for preview | ❌ Disabled |

## 🔧 Technical Details

### File Naming
- PDFs are named based on artboard names
- Special characters are replaced with underscores
- Format: `[ArtboardName].pdf`

### Layer Management
- The script intelligently detects which layers intersect with each artboard
- Layers are temporarily hidden during export if they don't contain content within the artboard bounds
- Original layer visibility is restored after each export

### PDF Settings
- **Compatibility**: Acrobat 7 (PDF 1.6)
- **Artboard Clipping**: Enabled
- **View Clip**: Enabled
- **Preserve Editability**: Disabled (for smaller file sizes)

## 🐛 Troubleshooting

### Common Issues

**"Please open an Illustrator document first"**
- Ensure you have an Illustrator document open before running the script

**"No artboards found in the document"**
- Your document must have artboards. Create them using `Object > Artboards > New Artboard`

**"Panel creation failed"**
- The script will automatically fall back to the simple dialog interface
- This is normal and doesn't affect functionality

**Export fails for specific artboards**
- Check if the artboard has any visible content
- Ensure you have write permissions to the output folder
- Try disabling "Hide layers outside artboard bounds" option

### Debug Mode

Enable debug mode to see detailed information during export:
- Shows which artboard is being exported
- Displays progress information
- Helps identify specific export issues

## 📁 File Structure

```
Illustrator_PDF_Export/
├── artboardExport.jsx    # Main script file
└── README.md            # This documentation
```

## 🔄 Script Functions

### Main Functions
- `createExportPanel()`: Creates the GUI interface
- `exportArtboardsToPDF()`: Core export functionality
- `hideLayersOutsideArtboard()`: Manages layer visibility
- `simpleExport()`: Fallback simple interface
- `main()`: Entry point with error handling

### Helper Functions
- `getAllLayers()`: Recursively collects all layers
- `hasVisibleSublayers()`: Checks for visible content in sublayers
- `isItemInArtboard()`: Determines if an item intersects with artboard
- `restoreLayerVisibility()`: Restores original layer states

## 📝 Version History

- **v1.0**: Initial release with GUI panel and core export functionality
- Features: Individual artboard export, layer management, optimization options

## 🤝 Contributing

Feel free to submit issues, feature requests, or pull requests to improve this script.

## 📄 License

This script is provided as-is for educational and professional use with Adobe Illustrator.

---

**Note**: This script is designed for Adobe Illustrator and requires JavaScript support. Always test with a copy of your document before running on important projects.