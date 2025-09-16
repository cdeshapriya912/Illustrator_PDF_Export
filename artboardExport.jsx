// Adobe Illustrator Script for Exporting Multiple Artboards to Individual PDFs
// This script exports each artboard as a separate PDF file, hiding layers outside the active artboard
// Includes a simple panel interface for folder selection and export controls

// Create the main panel window
function createExportPanel() {
    var panel = new Window("dialog", "Artboard to PDF Exporter");
    panel.orientation = "column";
    panel.alignChildren = "fill";
    panel.spacing = 10;
    panel.margins = 20;
    
    // Title
    var titleGroup = panel.add("group");
    var titleText = titleGroup.add("statictext", undefined, "Export Artboards to Individual PDFs");
    titleText.charactersize = 14;
    
    // Output folder selection
    var folderGroup = panel.add("group");
    folderGroup.orientation = "column";
    folderGroup.alignChildren = "fill";
    folderGroup.spacing = 5;
    
    folderGroup.add("statictext", undefined, "Output Folder:");
    var folderPathGroup = folderGroup.add("group");
    var folderPathText = folderPathGroup.add("edittext", undefined, "Select output folder...");
    folderPathText.characters = 40;
    folderPathText.enabled = false;
    var browseButton = folderPathGroup.add("button", undefined, "Browse");
    
    // Options
    var optionsGroup = panel.add("panel", undefined, "Export Options");
    optionsGroup.orientation = "column";
    optionsGroup.alignChildren = "fill";
    optionsGroup.spacing = 5;
    optionsGroup.margins = 10;
    
    var hideLayersCheck = optionsGroup.add("checkbox", undefined, "Hide layers outside artboard bounds");
    hideLayersCheck.value = true;
    
    var optimizeCheck = optionsGroup.add("checkbox", undefined, "Optimize PDF for web");
    optimizeCheck.value = true;
    
    var thumbnailsCheck = optionsGroup.add("checkbox", undefined, "Generate thumbnails");
    thumbnailsCheck.value = false;
    
    // Artboard info
    var infoGroup = panel.add("panel", undefined, "Document Info");
    infoGroup.orientation = "column";
    infoGroup.alignChildren = "fill";
    infoGroup.spacing = 5;
    infoGroup.margins = 10;
    
    var artboardCountText = infoGroup.add("statictext", undefined, "Artboards: 0");
    var docNameText = infoGroup.add("statictext", undefined, "Document: None");
    
    // Buttons
    var buttonGroup = panel.add("group");
    buttonGroup.alignment = "center";
    var exportButton = buttonGroup.add("button", undefined, "Export PDFs");
    var cancelButton = buttonGroup.add("button", undefined, "Cancel");
    
    // Store references
    panel.folderPathText = folderPathText;
    panel.hideLayersCheck = hideLayersCheck;
    panel.optimizeCheck = optimizeCheck;
    panel.thumbnailsCheck = thumbnailsCheck;
    panel.artboardCountText = artboardCountText;
    panel.docNameText = docNameText;
    
    // Update document info
    function updateDocumentInfo() {
        try {
            if (app.documents.length > 0) {
                var doc = app.activeDocument;
                panel.artboardCountText.text = "Artboards: " + doc.artboards.length;
                panel.docNameText.text = "Document: " + doc.name;
            } else {
                panel.artboardCountText.text = "Artboards: 0";
                panel.docNameText.text = "Document: None";
            }
        } catch (e) {
            panel.artboardCountText.text = "Artboards: 0";
            panel.docNameText.text = "Document: None";
        }
    }
    
    // Browse button event
    browseButton.onClick = function() {
        var selectedFolder = Folder.selectDialog("Select output folder for PDF files:");
        if (selectedFolder) {
            panel.folderPathText.text = selectedFolder.fsName;
        }
    };
    
    // Export button event
    exportButton.onClick = function() {
        if (panel.folderPathText.text === "Select output folder..." || panel.folderPathText.text === "") {
            alert("Please select an output folder first.");
            return;
        }
        
        if (app.documents.length === 0) {
            alert("Please open an Illustrator document first.");
            return;
        }
        
        var outputFolder = new Folder(panel.folderPathText.text);
        if (!outputFolder.exists) {
            alert("Selected folder does not exist. Please select a valid folder.");
            return;
        }
        
        panel.close();
        exportArtboardsToPDF(outputFolder, panel.hideLayersCheck.value, panel.optimizeCheck.value, panel.thumbnailsCheck.value);
    };
    
    // Cancel button event
    cancelButton.onClick = function() {
        panel.close();
    };
    
    // Update info on show
    panel.onShow = function() {
        updateDocumentInfo();
    };
    
    return panel;
}

function exportArtboardsToPDF(outputFolder, hideLayers, optimize, generateThumbnails, debugMode) {
    try {
        // Check if a document is open
        if (app.documents.length === 0) {
            alert("Please open an Illustrator document first.");
            return;
        }
        
        var doc = app.activeDocument;
        var artboards = doc.artboards;
        
        if (artboards.length === 0) {
            alert("No artboards found in the document.");
            return;
        }
        
        // Store original visibility states
        var originalVisibility = {};
        var allLayers = doc.layers;
        
        // Function to get all layers recursively
        function getAllLayers(layerCollection) {
            var layers = [];
            for (var i = 0; i < layerCollection.length; i++) {
                layers.push(layerCollection[i]);
                if (layerCollection[i].layers) {
                    layers = layers.concat(getAllLayers(layerCollection[i].layers));
                }
            }
            return layers;
        }
        
        var allDocLayers = getAllLayers(allLayers);
        
        // Store original visibility
        for (var i = 0; i < allDocLayers.length; i++) {
            originalVisibility[allDocLayers[i].name] = allDocLayers[i].visible;
        }
        
        // Export each artboard
        for (var i = 0; i < artboards.length; i++) {
            try {
                // Set the active artboard
                doc.artboards.setActiveArtboardIndex(i);
                var currentArtboard = artboards[i];
                var artboardName = currentArtboard.name || "Artboard_" + (i + 1);
                
                if (debugMode) {
                    alert("Exporting artboard " + (i + 1) + ": " + artboardName);
                }
                
                // Create PDF export options
                var pdfOptions = new PDFSaveOptions();
                pdfOptions.compatibility = PDFCompatibility.ACROBAT7;
                pdfOptions.preserveEditability = false;
                pdfOptions.optimization = optimize;
                pdfOptions.generateThumbnails = generateThumbnails;
                pdfOptions.artboardClipping = true;
                pdfOptions.viewClip = true;
                
                // Set the artboard range to export only the current artboard
                pdfOptions.artboardRange = (i + 1) + "-" + (i + 1);
                
                // Hide layers that are outside the current artboard if option is enabled
                if (hideLayers) {
                    hideLayersOutsideArtboard(doc, currentArtboard, allDocLayers);
                }
                
                // Create filename
                var fileName = artboardName.replace(/[^a-zA-Z0-9_-]/g, "_") + ".pdf";
                var filePath = new File(outputFolder + "/" + fileName);
                
                // Export the PDF
                try {
                    doc.saveAs(filePath, pdfOptions);
                } catch (e) {
                    // If saveAs fails, try alternative method
                    try {
                        // Create a temporary document with only the current artboard
                        var tempDoc = doc.duplicate();
                        tempDoc.artboards.setActiveArtboardIndex(i);
                        
                        // Remove all other artboards
                        for (var k = artboards.length - 1; k >= 0; k--) {
                            if (k !== i) {
                                tempDoc.artboards[k].remove();
                            }
                        }
                        
                        // Export the temporary document
                        tempDoc.saveAs(filePath, pdfOptions);
                        tempDoc.close(SaveOptions.DONOTSAVECHANGES);
                    } catch (e2) {
                        throw new Error("Failed to export artboard " + (i + 1) + ": " + e2.message);
                    }
                }
                
                // Restore original visibility for next iteration if layers were hidden
                if (hideLayers) {
                    restoreLayerVisibility(allDocLayers, originalVisibility);
                }
                
            } catch (e) {
                alert("Error exporting artboard " + (i + 1) + ": " + e.message);
            }
        }
        
        // Restore all original visibility states if layers were hidden
        if (hideLayers) {
            restoreLayerVisibility(allDocLayers, originalVisibility);
        }
        
        alert("Export completed! " + artboards.length + " artboards exported to: " + outputFolder.fsName);
        
    } catch (e) {
        alert("Error: " + e.message);
    }
}

function hideLayersOutsideArtboard(doc, artboard, allLayers) {
    var artboardRect = artboard.artboardRect;
    var artboardLeft = Math.min(artboardRect[0], artboardRect[2]);
    var artboardRight = Math.max(artboardRect[0], artboardRect[2]);
    var artboardTop = Math.max(artboardRect[1], artboardRect[3]);
    var artboardBottom = Math.min(artboardRect[1], artboardRect[3]);
    
    for (var i = 0; i < allLayers.length; i++) {
        var layer = allLayers[i];
        var hasVisibleContent = false;
        
        // Check if layer has any visible content within the artboard
        if (layer.pageItems && layer.pageItems.length > 0) {
            for (var j = 0; j < layer.pageItems.length; j++) {
                var item = layer.pageItems[j];
                if (item.visible && isItemInArtboard(item, artboardLeft, artboardRight, artboardTop, artboardBottom)) {
                    hasVisibleContent = true;
                    break;
                }
            }
        }
        
        // Also check sublayers recursively
        if (!hasVisibleContent && layer.layers && layer.layers.length > 0) {
            hasVisibleContent = hasVisibleSublayers(layer.layers, artboardLeft, artboardRight, artboardTop, artboardBottom);
        }
        
        // Show layer if it has visible content within the artboard, otherwise hide it
        layer.visible = hasVisibleContent;
    }
}

function hasVisibleSublayers(layers, artboardLeft, artboardRight, artboardTop, artboardBottom) {
    for (var i = 0; i < layers.length; i++) {
        var layer = layers[i];
        var hasContent = false;
        
        // Check page items in this layer
        if (layer.pageItems && layer.pageItems.length > 0) {
            for (var j = 0; j < layer.pageItems.length; j++) {
                var item = layer.pageItems[j];
                if (item.visible && isItemInArtboard(item, artboardLeft, artboardRight, artboardTop, artboardBottom)) {
                    hasContent = true;
                    break;
                }
            }
        }
        
        // Check sublayers recursively
        if (!hasContent && layer.layers && layer.layers.length > 0) {
            hasContent = hasVisibleSublayers(layer.layers, artboardLeft, artboardRight, artboardTop, artboardBottom);
        }
        
        if (hasContent) {
            return true;
        }
    }
    return false;
}

function isItemInArtboard(item, artboardLeft, artboardRight, artboardTop, artboardBottom) {
    try {
        var itemBounds = item.visibleBounds;
        var itemLeft = itemBounds[0];
        var itemRight = itemBounds[2];
        var itemTop = itemBounds[1];
        var itemBottom = itemBounds[3];
        
        // Check if item intersects with artboard bounds
        return !(itemRight < artboardLeft || itemLeft > artboardRight || itemBottom > artboardTop || itemTop < artboardBottom);
    } catch (e) {
        return false;
    }
}

function restoreLayerVisibility(allLayers, originalVisibility) {
    for (var i = 0; i < allLayers.length; i++) {
        var layer = allLayers[i];
        if (originalVisibility.hasOwnProperty(layer.name)) {
            layer.visible = originalVisibility[layer.name];
        }
    }
}

// Alternative simple execution without panel (fallback)
function simpleExport() {
    try {
        // Check if a document is open
        if (app.documents.length === 0) {
            alert("Please open an Illustrator document first.");
            return;
        }
        
        var doc = app.activeDocument;
        var artboards = doc.artboards;
        
        if (artboards.length === 0) {
            alert("No artboards found in the document.");
            return;
        }
        
        // Get output folder from user
        var outputFolder = Folder.selectDialog("Select output folder for PDF files:");
        if (!outputFolder) {
            return; // User cancelled
        }
        
        // Ask user for options
        var hideLayers = confirm("Hide layers outside artboard bounds?\n(Click OK for cleaner PDFs, Cancel to keep all layers visible)");
        var optimize = confirm("Optimize PDF for web?");
        var generateThumbnails = confirm("Generate thumbnails?");
        var debugMode = confirm("Enable debug mode?\n(Shows detailed information during export)");
        
        exportArtboardsToPDF(outputFolder, hideLayers, optimize, generateThumbnails, debugMode);
        
    } catch (e) {
        alert("Error: " + e.message);
    }
}

// Main execution - try panel first, fallback to simple version
function main() {
    try {
        var panel = createExportPanel();
        panel.show();
    } catch (e) {
        alert("Panel creation failed, using simple interface.\nError: " + e.message);
        simpleExport();
    }
}

// Run the main function
main();
