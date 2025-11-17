/**
 * FusePDF - Browser-based PDF Tools
 * Free PDF Split, Merge, and Compress Tool
 */

class FusePDF {
    constructor() {
        // Initialize PDF-related properties if needed
        if (document.querySelector('.pdf-tools')) {
            this.currentFiles = [];
            this.currentTab = 'split';
            this.isProcessing = false;
            this.selectedPages = new Set();
            this.currentPdfDoc = null;
            this.currentArrayBuffer = null;
            this.currentPageCount = 0;
            this.splitMode = 'range';
            this.processingHistory = this.loadHistory();
            
            // Initialize PDF.js worker
            if (typeof pdfjsLib !== 'undefined') {
                pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
            }

            // Initialize PDF features
            this.initPDFFeatures();
        }
    }

    /**
     * Initialize PDF features
     */
    initPDFFeatures() {
        this.initEventListeners();
        this.initDragAndDrop();
        console.log('FusePDF PDF tools initialized successfully');
    }

    /**
     * Initialize event listeners
     */
    initEventListeners() {
        // Tab switching
        const tabBtns = document.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // File input handlers
        this.initFileInputs();
        
        // Split mode switching
        this.initSplitModes();
        
        // Process buttons
        document.getElementById('splitBtn').addEventListener('click', () => this.handleSplit());
        document.getElementById('mergeBtn').addEventListener('click', () => this.handleMerge());
        document.getElementById('compressBtn').addEventListener('click', () => this.handleCompress());
        document.getElementById('imagesToPdfBtn').addEventListener('click', () => this.handleImagesToPdf());
        document.getElementById('extractBtn').addEventListener('click', () => this.handleExtractImages());
        
        // Result buttons
        document.getElementById('resetBtn').addEventListener('click', () => this.resetAll());
        
        // Keyboard shortcuts
        this.initKeyboardShortcuts();
        
        // Advanced split type change
        const advancedSplitType = document.getElementById('advancedSplitType');
        if (advancedSplitType) {
            advancedSplitType.addEventListener('change', (e) => this.updateAdvancedInput(e.target.value));
        }
        
        // Clear selection
        const clearSelection = document.getElementById('clearSelection');
        if (clearSelection) {
            clearSelection.addEventListener('click', () => this.clearPageSelection());
        }
    }

    /**
     * Initialize file inputs
     */
    initFileInputs() {
        // Split PDF file input
        const splitInput = document.querySelector('#splitUpload input[type="file"]');
        const splitUploadBtn = document.querySelector('#splitUpload .upload-btn');
        
        splitUploadBtn.addEventListener('click', () => splitInput.click());
        splitInput.addEventListener('change', (e) => this.handleSplitFileSelect(e));

        // Merge PDFs file input
        const mergeInput = document.querySelector('#mergeUpload input[type="file"]');
        const mergeUploadBtn = document.querySelector('#mergeUpload .upload-btn');
        
        mergeUploadBtn.addEventListener('click', () => mergeInput.click());
        mergeInput.addEventListener('change', (e) => this.handleMergeFileSelect(e));

        // Compress PDF file input
        const compressInput = document.querySelector('#compressUpload input[type="file"]');
        const compressUploadBtn = document.querySelector('#compressUpload .upload-btn');
        
        compressUploadBtn.addEventListener('click', () => compressInput.click());
        compressInput.addEventListener('change', (e) => this.handleCompressFileSelect(e));

        // Images to PDF file input
        const imagesInput = document.querySelector('#imagesUpload input[type="file"]');
        const imagesUploadBtn = document.querySelector('#imagesUpload .upload-btn');
        
        imagesUploadBtn.addEventListener('click', () => imagesInput.click());
        imagesInput.addEventListener('change', (e) => this.handleImagesFileSelect(e));

        // PDF to Images file input
        const extractInput = document.querySelector('#extractUpload input[type="file"]');
        const extractUploadBtn = document.querySelector('#extractUpload .upload-btn');
        
        extractUploadBtn.addEventListener('click', () => extractInput.click());
        extractInput.addEventListener('change', (e) => this.handleExtractFileSelect(e));
    }

    /**
     * Initialize drag and drop functionality
     */
    initDragAndDrop() {
        const dropAreas = [
            { element: document.getElementById('splitUpload'), handler: (files) => this.handleSplitFiles(files), accept: ['application/pdf'] },
            { element: document.getElementById('mergeUpload'), handler: (files) => this.handleMergeFiles(files), accept: ['application/pdf'] },
            { element: document.getElementById('compressUpload'), handler: (files) => this.handleCompressFiles(files), accept: ['application/pdf'] },
            { element: document.getElementById('imagesUpload'), handler: (files) => this.handleImagesFiles(files), accept: ['image/'] },
            { element: document.getElementById('extractUpload'), handler: (files) => this.handleExtractFiles(files), accept: ['application/pdf'] }
        ];

        dropAreas.forEach(({ element, handler, accept }) => {
            element.addEventListener('dragover', (e) => {
                e.preventDefault();
                element.classList.add('dragover');
            });

            element.addEventListener('dragleave', (e) => {
                e.preventDefault();
                element.classList.remove('dragover');
            });

            element.addEventListener('drop', (e) => {
                e.preventDefault();
                element.classList.remove('dragover');
                
                const files = Array.from(e.dataTransfer.files).filter(file => {
                    return accept.some(type => file.type.startsWith(type) || file.type === type);
                });
                
                if (files.length > 0) {
                    handler(files);
                } else {
                    const expectedType = accept.includes('application/pdf') ? 'PDF' : 'image';
                    this.showError(`Please drop ${expectedType} files only.`);
                }
            });
        });
    }

    /**
     * Switch between tabs
     */
    switchTab(tabName) {
        if (this.isProcessing) return;

        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        document.getElementById(tabName).classList.add('active');

        this.currentTab = tabName;
        this.resetAll();
    }

    /**
     * Handle split file selection
     */
    handleSplitFileSelect(e) {
        const files = Array.from(e.target.files).filter(file => file.type === 'application/pdf');
        this.handleSplitFiles(files);
    }

    /**
     * Handle split files
     */
    async handleSplitFiles(files) {
        if (files.length !== 1) {
            this.showError('Please select exactly one PDF file for splitting.');
            return;
        }

        try {
            const file = files[0];
            const arrayBuffer = await file.arrayBuffer();
            const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
            const pageCount = pdfDoc.getPageCount();
            
            // Store for reuse to avoid double loading
            this.currentPdfDoc = pdfDoc;
            this.currentArrayBuffer = arrayBuffer;
            this.currentPageCount = pageCount;

            document.getElementById('pageCount').textContent = `Total pages: ${pageCount}`;
            document.getElementById('endPage').max = pageCount;
            document.getElementById('endPage').value = pageCount;
            document.getElementById('splitOptions').style.display = 'block';

            this.currentFiles = [file];
            
            // Generate thumbnails
            await this.generateThumbnails(file);
            
            // Add to recent files
            this.addToRecentFiles(file.name, 'split');
            
        } catch (error) {
            this.showError('Error reading PDF file. Please ensure it\'s a valid PDF.');
            console.error(error);
        }
    }
    
    /**
     * Generate PDF page thumbnails
     */
    async generateThumbnails(file) {
        if (!window.pdfjsLib) {
            console.warn('PDF.js not loaded, thumbnails disabled');
            return;
        }
        
        try {
            // Reuse stored arrayBuffer to avoid double loading
            const arrayBuffer = this.currentArrayBuffer || await file.arrayBuffer();
            const loadingTask = pdfjsLib.getDocument({data: arrayBuffer});
            const pdf = await loadingTask.promise;
            
            const thumbnailsContainer = document.getElementById('thumbnailsContainer');
            const thumbnailsGrid = document.getElementById('thumbnailsGrid');
            
            // Clear existing thumbnails
            thumbnailsGrid.innerHTML = '';
            
            // Generate thumbnails for each page
            for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                const page = await pdf.getPage(pageNum);
                const viewport = page.getViewport({scale: 0.3});
                
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;
                
                const renderContext = {
                    canvasContext: context,
                    viewport: viewport
                };
                
                await page.render(renderContext).promise;
                
                // Create thumbnail item
                const thumbnailItem = document.createElement('div');
                thumbnailItem.className = 'thumbnail-item';
                thumbnailItem.dataset.page = pageNum;
                
                const thumbnailCanvas = canvas.cloneNode();
                thumbnailCanvas.className = 'thumbnail-canvas';
                thumbnailCanvas.getContext('2d').drawImage(canvas, 0, 0);
                
                const label = document.createElement('div');
                label.className = 'thumbnail-label';
                label.textContent = `Page ${pageNum}`;
                
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.className = 'thumbnail-checkbox';
                checkbox.dataset.page = pageNum;
                
                thumbnailItem.appendChild(thumbnailCanvas);
                thumbnailItem.appendChild(label);
                thumbnailItem.appendChild(checkbox);
                
                // Add click handler
                thumbnailItem.addEventListener('click', (e) => {
                    if (e.target !== checkbox) {
                        checkbox.checked = !checkbox.checked;
                    }
                    this.togglePageSelection(pageNum, checkbox.checked);
                });
                
                checkbox.addEventListener('change', (e) => {
                    this.togglePageSelection(pageNum, e.target.checked);
                });
                
                thumbnailsGrid.appendChild(thumbnailItem);
            }
            
            thumbnailsContainer.style.display = 'block';
            
        } catch (error) {
            console.error('Error generating thumbnails:', error);
            this.showError('Could not generate page thumbnails');
        }
    }
    
    /**
     * Initialize split mode switching
     */
    initSplitModes() {
        const modeBtns = document.querySelectorAll('.split-mode-btn');
        modeBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const mode = e.target.dataset.mode;
                this.switchSplitMode(mode);
            });
        });
    }
    
    /**
     * Switch split mode
     */
    switchSplitMode(mode) {
        this.splitMode = mode;
        
        // Update active button
        document.querySelectorAll('.split-mode-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-mode="${mode}"]`).classList.add('active');
        
        // Update active content
        document.querySelectorAll('.split-mode-content').forEach(content => content.classList.remove('active'));
        document.getElementById(`${mode}Mode`).classList.add('active');
        
        // Show/hide thumbnails based on mode
        const thumbnailsContainer = document.getElementById('thumbnailsContainer');
        if (mode === 'selection') {
            thumbnailsContainer.style.display = 'block';
        } else if (mode === 'range' && this.currentFiles.length > 0) {
            thumbnailsContainer.style.display = 'block';
        }
    }
    
    /**
     * Toggle page selection
     */
    togglePageSelection(pageNum, selected) {
        const thumbnailItem = document.querySelector(`[data-page="${pageNum}"]`);
        
        if (selected) {
            this.selectedPages.add(pageNum);
            thumbnailItem.classList.add('selected');
        } else {
            this.selectedPages.delete(pageNum);
            thumbnailItem.classList.remove('selected');
        }
        
        this.updateSelectedPagesDisplay();
    }
    
    /**
     * Update selected pages display
     */
    updateSelectedPagesDisplay() {
        const selectedPagesElement = document.getElementById('selectedPages');
        if (this.selectedPages.size === 0) {
            selectedPagesElement.textContent = 'No pages selected';
        } else {
            const sortedPages = Array.from(this.selectedPages).sort((a, b) => a - b);
            selectedPagesElement.textContent = `Selected pages: ${sortedPages.join(', ')}`;
        }
    }
    
    /**
     * Clear page selection
     */
    clearPageSelection() {
        this.selectedPages.clear();
        document.querySelectorAll('.thumbnail-checkbox').forEach(cb => cb.checked = false);
        document.querySelectorAll('.thumbnail-item').forEach(item => item.classList.remove('selected'));
        this.updateSelectedPagesDisplay();
    }
    
    /**
     * Update advanced input based on split type
     */
    updateAdvancedInput(type) {
        const advancedInput = document.getElementById('advancedInput');
        const advancedLabel = document.getElementById('advancedLabel');
        const advancedValue = document.getElementById('advancedValue');
        
        switch (type) {
            case 'pages':
                advancedLabel.textContent = 'Pages per file:';
                advancedValue.style.display = 'block';
                advancedValue.min = 1;
                advancedValue.value = 1;
                break;
            case 'size':
                advancedLabel.textContent = 'Max file size (MB):';
                advancedValue.style.display = 'block';
                advancedValue.min = 1;
                advancedValue.value = 10;
                break;
            case 'equal':
                advancedLabel.textContent = 'Number of parts:';
                advancedValue.style.display = 'block';
                advancedValue.min = 2;
                advancedValue.value = 2;
                break;
            case 'odd-even':
                advancedInput.style.display = 'none';
                break;
        }
    }
    
    /**
     * Initialize keyboard shortcuts
     */
    initKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Only handle shortcuts when not typing in input fields
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case '1':
                        e.preventDefault();
                        this.switchTab('split');
                        break;
                    case '2':
                        e.preventDefault();
                        this.switchTab('merge');
                        break;
                    case '3':
                        e.preventDefault();
                        this.switchTab('compress');
                        break;
                    case '4':
                        e.preventDefault();
                        this.switchTab('images');
                        break;
                    case '5':
                        e.preventDefault();
                        this.switchTab('extract');
                        break;
                    case 'Enter':
                        e.preventDefault();
                        this.handleCurrentTabProcess();
                        break;
                }
            }
            
            // ESC to reset
            if (e.key === 'Escape') {
                this.resetAll();
            }
        });
    }
    
    /**
     * Handle process for current tab
     */
    handleCurrentTabProcess() {
        switch (this.currentTab) {
            case 'split':
                this.handleSplit();
                break;
            case 'merge':
                this.handleMerge();
                break;
            case 'compress':
                this.handleCompress();
                break;
            case 'images':
                this.handleImagesToPdf();
                break;
            case 'extract':
                this.handleExtractImages();
                break;
        }
    }

    // ============ IMAGE CONVERSION METHODS ============

    /**
     * Handle images file selection
     */
    handleImagesFileSelect(e) {
        const files = Array.from(e.target.files).filter(file => file.type.startsWith('image/'));
        this.handleImagesFiles(files);
    }

    /**
     * Handle images files
     */
    handleImagesFiles(files) {
        if (files.length === 0) {
            this.showError('Please select at least one image file.');
            return;
        }

        this.currentFiles = files;
        this.displayImagePreviews();
        document.getElementById('imagesOptions').style.display = 'block';
    }

    /**
     * Display image previews
     */
    displayImagePreviews() {
        const imagesGrid = document.getElementById('imagesGrid');
        imagesGrid.innerHTML = '';

        this.currentFiles.forEach((file, index) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const previewItem = document.createElement('div');
                previewItem.className = 'image-preview-item';
                previewItem.innerHTML = `
                    <img src="${e.target.result}" alt="Preview">
                    <div class="image-preview-label">${file.name}</div>
                    <button class="image-remove-btn" onclick="fusePDF.removeImageFile(${index})">×</button>
                `;
                imagesGrid.appendChild(previewItem);
            };
            reader.readAsDataURL(file);
        });
    }

    /**
     * Remove image file
     */
    removeImageFile(index) {
        this.currentFiles.splice(index, 1);
        if (this.currentFiles.length > 0) {
            this.displayImagePreviews();
        } else {
            document.getElementById('imagesOptions').style.display = 'none';
        }
    }

    /**
     * Handle images to PDF conversion
     */
    async handleImagesToPdf() {
        if (this.currentFiles.length === 0) {
            this.showError('Please select at least one image file.');
            return;
        }

        const pageSize = document.getElementById('pageSize').value;
        const quality = document.getElementById('imageQuality').value;

        try {
            this.setProcessing(true, 'imagesProgress');
            const result = await this.convertImagesToPdf(this.currentFiles, pageSize, quality);
            this.showResult(`Created PDF from ${this.currentFiles.length} images`, result.size, result.blob);
            this.addToRecentFiles(`${this.currentFiles.length} images`, 'images-to-pdf');
        } catch (error) {
            this.showError('Error converting images to PDF: ' + error.message);
        } finally {
            this.setProcessing(false, 'imagesProgress');
        }
    }

    /**
     * Convert images to PDF
     */
    async convertImagesToPdf(imageFiles, pageSize, quality) {
        const pdfDoc = await PDFLib.PDFDocument.create();
        
        for (const file of imageFiles) {
            const arrayBuffer = await file.arrayBuffer();
            let image;
            
            // Determine image type and embed accordingly
            if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
                image = await pdfDoc.embedJpg(arrayBuffer);
            } else if (file.type === 'image/png') {
                image = await pdfDoc.embedPng(arrayBuffer);
            } else {
                // Convert other formats to PNG using canvas
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                const img = new Image();
                
                await new Promise((resolve, reject) => {
                    img.onload = resolve;
                    img.onerror = reject;
                    img.src = URL.createObjectURL(file);
                });
                
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                
                const pngData = canvas.toDataURL('image/png');
                const pngArrayBuffer = this.dataURLToArrayBuffer(pngData);
                image = await pdfDoc.embedPng(pngArrayBuffer);
                
                URL.revokeObjectURL(img.src);
            }
            
            let pageWidth, pageHeight;
            
            // Determine page dimensions
            if (pageSize === 'auto') {
                pageWidth = image.width;
                pageHeight = image.height;
            } else {
                const dimensions = this.getPageDimensions(pageSize);
                pageWidth = dimensions.width;
                pageHeight = dimensions.height;
            }
            
            const page = pdfDoc.addPage([pageWidth, pageHeight]);
            
            // Calculate scaling to fit image on page
            const scaleX = pageWidth / image.width;
            const scaleY = pageHeight / image.height;
            const scale = Math.min(scaleX, scaleY);
            
            const scaledWidth = image.width * scale;
            const scaledHeight = image.height * scale;
            
            // Center the image on the page
            const x = (pageWidth - scaledWidth) / 2;
            const y = (pageHeight - scaledHeight) / 2;
            
            page.drawImage(image, {
                x: x,
                y: y,
                width: scaledWidth,
                height: scaledHeight,
            });
        }
        
        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        
        return {
            blob: blob,
            size: blob.size
        };
    }

    /**
     * Get page dimensions for standard page sizes
     */
    getPageDimensions(pageSize) {
        const dimensions = {
            'a4': { width: 595, height: 842 },
            'letter': { width: 612, height: 792 },
            'legal': { width: 612, height: 1008 }
        };
        return dimensions[pageSize] || dimensions.a4;
    }

    /**
     * Convert data URL to array buffer
     */
    dataURLToArrayBuffer(dataURL) {
        const base64 = dataURL.split(',')[1];
        const binaryString = atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;
    }

    // ============ PDF TO IMAGES METHODS ============

    /**
     * Handle extract file selection
     */
    handleExtractFileSelect(e) {
        const files = Array.from(e.target.files).filter(file => file.type === 'application/pdf');
        this.handleExtractFiles(files);
    }

    /**
     * Handle extract files
     */
    async handleExtractFiles(files) {
        if (files.length !== 1) {
            this.showError('Please select exactly one PDF file for image extraction.');
            return;
        }

        try {
            const file = files[0];
            const arrayBuffer = await file.arrayBuffer();
            const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
            const pageCount = pdfDoc.getPageCount();

            // Store for reuse to avoid double loading
            this.currentArrayBuffer = arrayBuffer;
            this.currentPageCount = pageCount;

            document.getElementById('extractPageCount').textContent = `Total pages: ${pageCount}`;
            document.getElementById('extractEndPage').max = pageCount;
            document.getElementById('extractEndPage').value = pageCount;
            document.getElementById('extractOptions').style.display = 'block';

            this.currentFiles = [file];
            this.addToRecentFiles(file.name, 'pdf-to-images');
        } catch (error) {
            this.showError('Error reading PDF file. Please ensure it\'s a valid PDF.');
        }
    }

    /**
     * Handle extract images
     */
    async handleExtractImages() {
        if (this.currentFiles.length === 0) {
            this.showError('Please select a PDF file first.');
            return;
        }

        const startPage = parseInt(document.getElementById('extractStartPage').value);
        const endPage = parseInt(document.getElementById('extractEndPage').value);
        const outputFormat = document.getElementById('outputFormat').value;
        const resolution = parseFloat(document.getElementById('outputResolution').value);

        if (startPage > endPage || startPage < 1) {
            this.showError('Invalid page range.');
            return;
        }

        try {
            this.setProcessing(true, 'extractProgress');
            const results = await this.extractPdfToImages(this.currentFiles[0], startPage, endPage, outputFormat, resolution);
            
            if (results.length === 1) {
                this.showResult(`Extracted page ${startPage} as ${outputFormat.toUpperCase()}`, results[0].size, results[0].blob);
            } else {
                this.showMultipleResults(results);
            }
        } catch (error) {
            this.showError('Error extracting images from PDF: ' + error.message);
        } finally {
            this.setProcessing(false, 'extractProgress');
        }
    }

    /**
     * Extract PDF pages to images
     */
    async extractPdfToImages(file, startPage, endPage, outputFormat, resolution) {
        if (!window.pdfjsLib) {
            throw new Error('PDF.js library not loaded');
        }

        // Reuse stored arrayBuffer to avoid double loading
        const arrayBuffer = this.currentArrayBuffer || await file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({data: arrayBuffer});
        const pdf = await loadingTask.promise;
        
        const results = [];
        
        for (let pageNum = startPage; pageNum <= endPage; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const viewport = page.getViewport({scale: resolution});
            
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            
            const renderContext = {
                canvasContext: context,
                viewport: viewport
            };
            
            await page.render(renderContext).promise;
            
            // Convert canvas to blob
            const blob = await new Promise(resolve => {
                if (outputFormat === 'png') {
                    canvas.toBlob(resolve, 'image/png');
                } else {
                    canvas.toBlob(resolve, 'image/jpeg', 0.95);
                }
            });
            
            results.push({
                message: `Page ${pageNum}`,
                size: blob.size,
                blob: blob,
                filename: `page-${pageNum}.${outputFormat}`
            });
        }
        
        return results;
    }

    /**
     * Handle merge file selection
     */
    handleMergeFileSelect(e) {
        const files = Array.from(e.target.files).filter(file => file.type === 'application/pdf');
        this.handleMergeFiles(files);
    }

    /**
     * Handle merge files
     */
    handleMergeFiles(files) {
        if (files.length < 2) {
            this.showError('Please select at least 2 PDF files for merging.');
            return;
        }

        this.currentFiles = files;
        this.displayMergeFiles();
        document.getElementById('mergeFileList').style.display = 'block';
    }

    /**
     * Display files for merging
     */
    displayMergeFiles() {
        const container = document.getElementById('filesContainer');
        container.innerHTML = '';

        this.currentFiles.forEach((file, index) => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            fileItem.innerHTML = `
                <div class="file-info">
                    <div class="file-name">${file.name}</div>
                    <div class="file-size">${this.formatFileSize(file.size)}</div>
                </div>
                <button class="remove-file" onclick="fusePDF.removeFile(${index})">×</button>
            `;
            container.appendChild(fileItem);
        });
    }

    /**
     * Remove file from merge list
     */
    removeFile(index) {
        this.currentFiles.splice(index, 1);
        if (this.currentFiles.length > 0) {
            this.displayMergeFiles();
        } else {
            document.getElementById('mergeFileList').style.display = 'none';
        }
    }

    /**
     * Handle compress file selection
     */
    handleCompressFileSelect(e) {
        const files = Array.from(e.target.files).filter(file => file.type === 'application/pdf');
        this.handleCompressFiles(files);
    }

    /**
     * Handle compress files
     */
    handleCompressFiles(files) {
        if (files.length !== 1) {
            this.showError('Please select exactly one PDF file for compression.');
            return;
        }

        const file = files[0];
        this.currentFiles = [file];
        
        document.getElementById('originalSize').textContent = `Original size: ${this.formatFileSize(file.size)}`;
        document.getElementById('compressOptions').style.display = 'block';
    }

    /**
     * Handle PDF splitting
     */
    async handleSplit() {
        if (this.currentFiles.length === 0) {
            this.showError('Please select a PDF file first.');
            return;
        }

        try {
            this.setProcessing(true, 'splitProgress');
            let results = [];
            
            switch (this.splitMode) {
                case 'range':
                    results = await this.splitByRange();
                    break;
                case 'selection':
                    results = await this.splitBySelection();
                    break;
                case 'advanced':
                    results = await this.splitByAdvanced();
                    break;
            }
            
            if (results.length === 1) {
                this.showResult(results[0].message, results[0].size, results[0].blob);
            } else {
                this.showMultipleResults(results);
            }
            
        } catch (error) {
            this.showError('Error splitting PDF: ' + error.message);
        } finally {
            this.setProcessing(false, 'splitProgress');
        }
    }
    
    /**
     * Split by page range
     */
    async splitByRange() {
        const startPage = parseInt(document.getElementById('startPage').value);
        const endPage = parseInt(document.getElementById('endPage').value);

        if (startPage > endPage || startPage < 1) {
            throw new Error('Invalid page range.');
        }
        
        const result = await this.splitPDF(this.currentFiles[0], startPage, endPage);
        return [{
            message: `Extracted pages ${startPage}-${endPage}`,
            size: result.size,
            blob: result.blob,
            filename: `pages-${startPage}-${endPage}.pdf`
        }];
    }
    
    /**
     * Split by page selection
     */
    async splitBySelection() {
        if (this.selectedPages.size === 0) {
            throw new Error('Please select at least one page.');
        }
        
        const sortedPages = Array.from(this.selectedPages).sort((a, b) => a - b);
        const result = await this.splitPDFByPages(this.currentFiles[0], sortedPages);
        
        return [{
            message: `Extracted ${sortedPages.length} selected pages`,
            size: result.size,
            blob: result.blob,
            filename: `selected-pages.pdf`
        }];
    }
    
    /**
     * Split by advanced options
     */
    async splitByAdvanced() {
        const advancedType = document.getElementById('advancedSplitType').value;
        const advancedValue = parseInt(document.getElementById('advancedValue').value);
        const totalPages = this.currentPdfDoc.getPageCount();
        
        switch (advancedType) {
            case 'pages':
                return await this.splitEveryNPages(advancedValue);
            case 'equal':
                return await this.splitIntoEqualParts(advancedValue);
            case 'odd-even':
                return await this.splitOddEvenPages();
            case 'size':
                // For size-based splitting, we'll use a simple page-based approximation
                return await this.splitByApproximateSize(advancedValue);
        }
    }
    
    /**
     * Split every N pages
     */
    async splitEveryNPages(pagesPerFile) {
        const totalPages = this.currentPdfDoc.getPageCount();
        const results = [];
        
        for (let start = 1; start <= totalPages; start += pagesPerFile) {
            const end = Math.min(start + pagesPerFile - 1, totalPages);
            const result = await this.splitPDF(this.currentFiles[0], start, end);
            results.push({
                message: `Part ${Math.ceil(start / pagesPerFile)} (pages ${start}-${end})`,
                size: result.size,
                blob: result.blob,
                filename: `part-${Math.ceil(start / pagesPerFile)}.pdf`
            });
        }
        
        return results;
    }
    
    /**
     * Split into equal parts
     */
    async splitIntoEqualParts(numParts) {
        const totalPages = this.currentPdfDoc.getPageCount();
        const pagesPerPart = Math.ceil(totalPages / numParts);
        
        return await this.splitEveryNPages(pagesPerPart);
    }
    
    /**
     * Split odd and even pages
     */
    async splitOddEvenPages() {
        const totalPages = this.currentPdfDoc.getPageCount();
        const oddPages = [];
        const evenPages = [];
        
        for (let i = 1; i <= totalPages; i++) {
            if (i % 2 === 1) {
                oddPages.push(i);
            } else {
                evenPages.push(i);
            }
        }
        
        const results = [];
        
        if (oddPages.length > 0) {
            const oddResult = await this.splitPDFByPages(this.currentFiles[0], oddPages);
            results.push({
                message: `Odd pages (${oddPages.length} pages)`,
                size: oddResult.size,
                blob: oddResult.blob,
                filename: 'odd-pages.pdf'
            });
        }
        
        if (evenPages.length > 0) {
            const evenResult = await this.splitPDFByPages(this.currentFiles[0], evenPages);
            results.push({
                message: `Even pages (${evenPages.length} pages)`,
                size: evenResult.size,
                blob: evenResult.blob,
                filename: 'even-pages.pdf'
            });
        }
        
        return results;
    }
    
    /**
     * Split PDF by specific pages
     */
    async splitPDFByPages(file, pages) {
        // Reuse stored arrayBuffer to avoid double loading
        const arrayBuffer = this.currentArrayBuffer || await file.arrayBuffer();
        const pdfDoc = this.currentPdfDoc || await PDFLib.PDFDocument.load(arrayBuffer);
        const newPdfDoc = await PDFLib.PDFDocument.create();

        // Copy selected pages (PDF-lib uses 0-based indexing)
        const indices = pages.map(page => page - 1);
        const copiedPages = await newPdfDoc.copyPages(pdfDoc, indices);
        
        copiedPages.forEach(page => newPdfDoc.addPage(page));

        const pdfBytes = await newPdfDoc.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        
        return {
            blob: blob,
            size: blob.size
        };
    }

    /**
     * Handle PDF merging
     */
    async handleMerge() {
        if (this.currentFiles.length < 2) {
            this.showError('Please select at least 2 PDF files.');
            return;
        }

        try {
            this.setProcessing(true, 'mergeProgress');
            const result = await this.mergePDF(this.currentFiles);
            this.showResult(`Merged ${this.currentFiles.length} PDFs`, result.size, result.blob);
        } catch (error) {
            this.showError('Error merging PDFs: ' + error.message);
        } finally {
            this.setProcessing(false, 'mergeProgress');
        }
    }

    /**
     * Handle PDF compression
     */
    async handleCompress() {
        if (this.currentFiles.length === 0) {
            this.showError('Please select a PDF file first.');
            return;
        }

        const quality = document.getElementById('compressionLevel').value;

        try {
            this.setProcessing(true, 'compressProgress');
            const result = await this.compressPDF(this.currentFiles[0], quality);
            const savings = ((this.currentFiles[0].size - result.size) / this.currentFiles[0].size * 100).toFixed(1);
            this.showResult(`Compressed PDF (${savings}% smaller)`, result.size, result.blob);
        } catch (error) {
            this.showError('Error compressing PDF: ' + error.message);
        } finally {
            this.setProcessing(false, 'compressProgress');
        }
    }

    /**
     * Split PDF function
     */
    async splitPDF(file, startPage, endPage) {
        // Reuse stored arrayBuffer to avoid double loading
        const arrayBuffer = this.currentArrayBuffer || await file.arrayBuffer();
        const pdfDoc = this.currentPdfDoc || await PDFLib.PDFDocument.load(arrayBuffer);
        const newPdfDoc = await PDFLib.PDFDocument.create();

        // Copy pages (PDF-lib uses 0-based indexing)
        const indices = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage - 1 + i);
        const copiedPages = await newPdfDoc.copyPages(pdfDoc, indices);
        
        copiedPages.forEach(page => newPdfDoc.addPage(page));

        const pdfBytes = await newPdfDoc.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        
        return {
            blob: blob,
            size: blob.size
        };
    }

    /**
     * Merge PDF function
     */
    async mergePDF(files) {
        const mergedPdf = await PDFLib.PDFDocument.create();

        for (const file of files) {
            const arrayBuffer = await file.arrayBuffer();
            const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
            const copiedPages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
            copiedPages.forEach(page => mergedPdf.addPage(page));
        }

        const pdfBytes = await mergedPdf.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        
        return {
            blob: blob,
            size: blob.size
        };
    }

    /**
     * Compress PDF function
     */
    async compressPDF(file, quality) {
        // Load arrayBuffer (will use stored one if available from previous operations)
        const arrayBuffer = this.currentArrayBuffer || await file.arrayBuffer();
        const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);

        // Basic compression by re-saving the PDF
        // Note: This is a simple approach. For more advanced compression,
        // you might need additional libraries or server-side processing
        let compressionOptions = {};
        
        switch (quality) {
            case 'low':
                compressionOptions = { useObjectStreams: false };
                break;
            case 'medium':
                compressionOptions = { useObjectStreams: true };
                break;
            case 'high':
                compressionOptions = { useObjectStreams: true, addDefaultPage: false };
                break;
        }

        const pdfBytes = await pdfDoc.save(compressionOptions);
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        
        return {
            blob: blob,
            size: blob.size
        };
    }

    /**
     * Download blob as file
     */
    downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    /**
     * Show processing state
     */
    setProcessing(isProcessing, progressElementId) {
        this.isProcessing = isProcessing;
        const progressBar = document.getElementById(progressElementId);
        
        if (isProcessing) {
            progressBar.style.display = 'block';
            progressBar.querySelector('.progress-fill').style.width = '100%';
            
            // Disable all buttons
            document.querySelectorAll('button').forEach(btn => btn.disabled = true);
        } else {
            setTimeout(() => {
                progressBar.style.display = 'none';
                progressBar.querySelector('.progress-fill').style.width = '0%';
                
                // Re-enable buttons
                document.querySelectorAll('button').forEach(btn => btn.disabled = false);
            }, 500);
        }
    }

    /**
     * Show result
     */
    showResult(message, size, blob) {
        const resultSection = document.getElementById('resultSection');
        const resultInfo = document.getElementById('resultInfo');
        const downloadBtn = document.getElementById('downloadBtn');
        
        resultInfo.textContent = `${message} • Final size: ${this.formatFileSize(size)}`;
        resultSection.style.display = 'block';
        
        // Set up download
        downloadBtn.onclick = () => {
            const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
            const filename = `fusepdf-result-${timestamp}.pdf`;
            this.downloadBlob(blob, filename);
        };

        // Scroll to result
        resultSection.scrollIntoView({ behavior: 'smooth' });
    }

    /**
     * Show error message
     */
    showError(message) {
        // Create temporary error toast
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--danger-color);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: var(--border-radius);
            z-index: 1000;
            animation: fadeIn 0.3s ease;
        `;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 5000);
    }

    /**
     * Load processing history from localStorage
     */
    loadHistory() {
        try {
            return JSON.parse(localStorage.getItem('fusepdf_history') || '[]');
        } catch {
            return [];
        }
    }
    
    /**
     * Save processing history to localStorage
     */
    saveHistory() {
        try {
            localStorage.setItem('fusepdf_history', JSON.stringify(this.processingHistory));
        } catch (error) {
            console.warn('Could not save history to localStorage:', error);
        }
    }
    
    /**
     * Add file to recent files
     */
    addToRecentFiles(filename, operation) {
        const historyItem = {
            filename,
            operation,
            timestamp: new Date().toISOString(),
            id: Date.now()
        };
        
        this.processingHistory.unshift(historyItem);
        
        // Keep only last 10 items
        if (this.processingHistory.length > 10) {
            this.processingHistory = this.processingHistory.slice(0, 10);
        }
        
        this.saveHistory();
    }
    
    /**
     * Show multiple results for batch operations
     */
    showMultipleResults(results) {
        const resultSection = document.getElementById('resultSection');
        const resultInfo = document.getElementById('resultInfo');
        
        let totalSize = results.reduce((sum, result) => sum + result.size, 0);
        resultInfo.innerHTML = `
            <div>Generated ${results.length} files • Total size: ${this.formatFileSize(totalSize)}</div>
            <div class="multiple-downloads">
                ${results.map((result, index) => 
                    `<button class="download-btn small" onclick="fusePDF.downloadSpecificResult(${index})">${result.filename}</button>`
                ).join('')}
            </div>
        `;
        
        // Store results for download
        this.currentResults = results;
        
        resultSection.style.display = 'block';
        resultSection.scrollIntoView({ behavior: 'smooth' });
    }
    
    /**
     * Download specific result
     */
    downloadSpecificResult(index) {
        const result = this.currentResults[index];
        if (result) {
            this.downloadBlob(result.blob, result.filename);
        }
    }
    
    /**
     * Enhanced error messages with suggestions
     */
    showError(message, suggestion = null) {
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--danger-color);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: var(--border-radius);
            z-index: 1000;
            animation: fadeIn 0.3s ease;
            max-width: 350px;
            box-shadow: var(--shadow-lg);
        `;
        
        let content = `<strong>Error:</strong> ${message}`;
        if (suggestion) {
            content += `<br><small><strong>Suggestion:</strong> ${suggestion}</small>`;
        }
        
        toast.innerHTML = content;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 7000);
    }
    
    /**
     * Reset all forms and states
     */
    resetAll() {
        this.currentFiles = [];
        this.selectedPages.clear();
        this.currentPdfDoc = null;
        this.currentArrayBuffer = null;
        this.currentPageCount = 0;
        this.currentResults = null;
        
        // Hide all option sections
        document.getElementById('splitOptions').style.display = 'none';
        document.getElementById('mergeFileList').style.display = 'none';
        document.getElementById('compressOptions').style.display = 'none';
        document.getElementById('imagesOptions').style.display = 'none';
        document.getElementById('extractOptions').style.display = 'none';
        document.getElementById('resultSection').style.display = 'none';
        document.getElementById('thumbnailsContainer').style.display = 'none';
        
        // Reset form inputs
        document.querySelectorAll('input[type="file"]').forEach(input => input.value = '');
        document.getElementById('startPage').value = 1;
        document.getElementById('endPage').value = 1;
        document.getElementById('compressionLevel').value = 'medium';
        
        // Reset split mode
        this.switchSplitMode('range');
        
        // Reset file containers
        document.getElementById('filesContainer').innerHTML = '';
        document.getElementById('thumbnailsGrid').innerHTML = '';
        document.getElementById('imagesGrid').innerHTML = '';
        
        // Clear page selection
        this.clearPageSelection();
        
        // Remove dragover classes
        document.querySelectorAll('.file-upload-area').forEach(area => {
            area.classList.remove('dragover');
        });
    }

    /**
     * Format file size for display
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.fusePDF = new FusePDF();
});

// Service Worker Registration (for offline functionality)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// Analytics tracking (Google Analytics 4)
function gtag_report_conversion(url) {
    const callback = function () {
        if (typeof(url) !== 'undefined') {
            window.location = url;
        }
    };
    
    if (typeof gtag !== 'undefined') {
        gtag('event', 'conversion', {
            'send_to': 'GA_MEASUREMENT_ID/CONVERSION_ID',
            'event_callback': callback
        });
    }
    
    return false;
}

// Track PDF processing events
function trackPDFEvent(action, category = 'PDF Processing') {
    if (typeof gtag !== 'undefined') {
        gtag('event', action, {
            'event_category': category,
            'event_label': 'FusePDF Tool'
        });
    }
}

// Export for use in HTML onclick handlers
window.fusePDF = null; // Will be set when class is instantiated