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
            this.selectionAction = 'extract';
            this.splitMode = 'range';
            this.processingHistory = this.loadHistory();
            this.mergePages = []; // Store pages for merge with ordering
            this.mergePdfData = []; // Store loaded PDF data
            
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
        this.initSplitEnhancements();
        
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
                    return accept.some(type => this.fileMatchesType(file, type));
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

    fileMatchesType(file, acceptType) {
        if (acceptType === 'application/pdf') {
            return this.isPdfFile(file);
        }
        if (acceptType === 'image/') {
            return this.isImageFile(file);
        }
        return file.type === acceptType;
    }

    isPdfFile(file) {
        if (!file) return false;
        if (file.type === 'application/pdf') return true;
        return file.name?.toLowerCase().endsWith('.pdf');
    }

    isImageFile(file) {
        if (!file) return false;
        if (file.type && file.type.startsWith('image/')) return true;
        return /\.(png|jpe?g|webp|gif|bmp|tiff?)$/i.test(file.name || '');
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
        const files = Array.from(e.target.files).filter(file => this.isPdfFile(file));
        this.handleSplitFiles(files);
        e.target.value = '';
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
            this.selectedPages.clear();
            this.selectionAction = 'extract';
            const extractOption = document.querySelector('input[name="selectionAction"][value="extract"]');
            if (extractOption) extractOption.checked = true;
            const customInput = document.getElementById('customRangesInput');
            if (customInput) customInput.value = '';
            this.updateSelectedPagesDisplay();
            
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

    initSplitEnhancements() {
        const selectionInputs = document.querySelectorAll('input[name="selectionAction"]');
        selectionInputs.forEach(input => {
            input.addEventListener('change', (e) => {
                this.selectionAction = e.target.value;
            });
        });

        const invertBtn = document.getElementById('invertSelection');
        if (invertBtn) {
            invertBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.invertSelectedPages();
            });
        }

        const quickButtons = document.querySelectorAll('[data-quick-split]');
        quickButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const action = e.currentTarget.dataset.quickSplit;
                this.handleQuickSplitAction(action);
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

    handleQuickSplitAction(action) {
        if (!this.currentPageCount) {
            this.showError('Upload a PDF first to use quick actions.');
            return;
        }

        const typeSelect = document.getElementById('advancedSplitType');
        const valueInput = document.getElementById('advancedValue');
        const customWrapper = document.getElementById('customRangesWrapper');
        const customInput = document.getElementById('customRangesInput');

        const setAdvanced = (type) => {
            typeSelect.value = type;
            this.updateAdvancedInput(type);
        };

        switch (action) {
            case 'single':
                this.switchSplitMode('advanced');
                setAdvanced('pages');
                valueInput.value = 1;
                break;
            case 'pairs':
                this.switchSplitMode('advanced');
                setAdvanced('pages');
                valueInput.value = 2;
                break;
            case 'halves':
                this.switchSplitMode('advanced');
                setAdvanced('custom');
                if (customWrapper) customWrapper.style.display = 'block';
                if (customInput) {
                    const half = Math.ceil(this.currentPageCount / 2);
                    customInput.value = `1-${half},${half + 1}-${this.currentPageCount}`;
                }
                break;
            case 'selection':
                this.switchSplitMode('selection');
                const extractOption = document.querySelector('input[name="selectionAction"][value="extract"]');
                if (extractOption) extractOption.checked = true;
                this.selectionAction = 'extract';
                break;
            default:
                break;
        }
    }
    
    /**
     * Toggle page selection
     */
    togglePageSelection(pageNum, selected) {
        const thumbnailItem = document.querySelector(`[data-page="${pageNum}"]`);
        
        if (selected) {
            this.selectedPages.add(pageNum);
            thumbnailItem?.classList.add('selected');
        } else {
            this.selectedPages.delete(pageNum);
            thumbnailItem?.classList.remove('selected');
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

    invertSelectedPages() {
        if (!this.currentPageCount) return;
        const newSelection = new Set();
        for (let i = 1; i <= this.currentPageCount; i++) {
            if (!this.selectedPages.has(i)) {
                newSelection.add(i);
            }
        }
        this.selectedPages = newSelection;

        document.querySelectorAll('.thumbnail-checkbox').forEach(checkbox => {
            const page = parseInt(checkbox.dataset.page, 10);
            const isSelected = this.selectedPages.has(page);
            checkbox.checked = isSelected;
            const thumbnail = checkbox.closest('.thumbnail-item');
            if (thumbnail) {
                thumbnail.classList.toggle('selected', isSelected);
            }
        });

        this.updateSelectedPagesDisplay();
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
        const customWrapper = document.getElementById('customRangesWrapper');
        if (advancedInput) advancedInput.style.display = 'block';
        if (customWrapper) customWrapper.style.display = 'none';
        if (advancedValue) advancedValue.style.display = 'block';
        
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
            case 'custom':
                advancedInput.style.display = 'block';
                advancedLabel.textContent = 'Use the field below:';
                advancedValue.style.display = 'none';
                if (customWrapper) customWrapper.style.display = 'block';
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
        const files = Array.from(e.target.files).filter(file => this.isImageFile(file));
        this.handleImagesFiles(files);
        e.target.value = '';
    }

    /**
     * Handle images files
     */
    handleImagesFiles(files) {
        if (files.length === 0) {
            this.showError('Please select at least one image file.');
            return;
        }

        const uniqueNewFiles = files.filter(file => {
            return !this.currentFiles.some(existing =>
                existing.name === file.name &&
                existing.size === file.size &&
                existing.lastModified === file.lastModified
            );
        });

        if (uniqueNewFiles.length === 0) {
            this.showError('Those images are already added. Choose different files.');
            return;
        }

        this.currentFiles = [...this.currentFiles, ...uniqueNewFiles];
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
        const files = Array.from(e.target.files).filter(file => this.isPdfFile(file));
        this.handleExtractFiles(files);
        e.target.value = '';
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
        const files = Array.from(e.target.files).filter(file => this.isPdfFile(file));
        this.handleMergeFiles(files);
        e.target.value = '';
    }

    /**
     * Handle merge files
     */
    async handleMergeFiles(files) {
        if (files.length < 1) {
            this.showError('Please select at least 1 PDF file for merging.');
            return;
        }

        // Add new files to existing ones
        const newFiles = Array.from(files);
        this.currentFiles = [...this.currentFiles, ...newFiles];
        
        // Load and preview all pages
        await this.loadMergePDFs(newFiles);
        
        document.getElementById('mergeFileList').style.display = 'block';
    }

    /**
     * Load PDFs and generate page thumbnails for merge
     */
    async loadMergePDFs(files) {
        if (!window.pdfjsLib) {
            console.warn('PDF.js not loaded, using basic merge');
            return;
        }

        for (const file of files) {
            try {
                const arrayBuffer = await file.arrayBuffer();
                const loadingTask = pdfjsLib.getDocument({data: arrayBuffer});
                const pdf = await loadingTask.promise;
                
                // Store PDF data for merging without reloading
                this.mergePdfData.push({
                    file: file,
                    arrayBuffer: arrayBuffer,
                    pageCount: pdf.numPages
                });
                
                // Generate thumbnails for each page
                for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                    const page = await pdf.getPage(pageNum);
                    const viewport = page.getViewport({scale: 0.3});
                    
                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d');
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;
                    
                    await page.render({
                        canvasContext: context,
                        viewport: viewport
                    }).promise;
                    
                    this.mergePages.push({
                        fileName: file.name,
                        fileIndex: this.mergePdfData.length - 1,
                        pageNum: pageNum,
                        canvas: canvas,
                        thumbnail: canvas.toDataURL('image/png')
                    });
                }
            } catch (error) {
                console.error(`Error loading ${file.name}:`, error);
                this.showError(`Error loading ${file.name}`);
            }
        }
        
        this.displayMergePages();
    }

    /**
     * Display all pages with drag-and-drop reordering
     */
    displayMergePages() {
        const container = document.getElementById('mergePagesContainer');
        if (!container) return;
        
        container.innerHTML = '';
        
        this.mergePages.forEach((pageData, index) => {
            const pageItem = document.createElement('div');
            pageItem.className = 'merge-page-item';
            pageItem.dataset.index = index;
            
            pageItem.innerHTML = `
                <div class="merge-page-number">${index + 1}</div>
                <img src="${pageData.thumbnail}" alt="Page ${pageData.pageNum}">
                <div class="merge-page-info">
                    <div class="merge-page-label" title="${pageData.fileName}">${pageData.fileName}</div>
                    <div class="merge-page-original">Page ${pageData.pageNum}</div>
                </div>
                <div class="merge-page-actions">
                    <button class="merge-page-action" aria-label="Move to top" onclick="fusePDF.moveMergePage(${index}, 'top')">⤒</button>
                    <button class="merge-page-action" aria-label="Move up" onclick="fusePDF.moveMergePage(${index}, 'up')">↑</button>
                    <button class="merge-page-action" aria-label="Move down" onclick="fusePDF.moveMergePage(${index}, 'down')">↓</button>
                    <button class="merge-page-action" aria-label="Move to bottom" onclick="fusePDF.moveMergePage(${index}, 'bottom')">⤓</button>
                </div>
                <button class="merge-page-remove" onclick="fusePDF.removeMergePage(${index})" title="Remove page">×</button>
            `;
            
            container.appendChild(pageItem);
        });
        
        // Update page count display
        const pageCountEl = document.getElementById('mergePageCount');
        if (pageCountEl) {
            pageCountEl.textContent = `Total pages: ${this.mergePages.length}`;
        }
    }

    /**
     * Remove page from merge list
     */
    removeMergePage(index) {
        this.mergePages.splice(index, 1);
        if (this.mergePages.length > 0) {
            this.displayMergePages();
        } else {
            this.clearMergeData();
        }
    }

    /**
     * Clear all merge data
     */
    clearMergeData() {
        this.currentFiles = [];
        this.mergePages = [];
        this.mergePdfData = [];
        const listEl = document.getElementById('mergeFileList');
        if (listEl) listEl.style.display = 'none';
        const pagesContainer = document.getElementById('mergePagesContainer');
        if (pagesContainer) pagesContainer.innerHTML = '';
        const pageCountEl = document.getElementById('mergePageCount');
        if (pageCountEl) pageCountEl.textContent = 'Total pages: 0';
    }

    /**
     * Move page using action buttons
     */
    moveMergePage(index, direction) {
        if (this.mergePages.length === 0) return;
        const page = this.mergePages[index];
        if (!page) return;

        let targetIndex = index;
        switch (direction) {
            case 'up':
                targetIndex = Math.max(0, index - 1);
                break;
            case 'down':
                targetIndex = Math.min(this.mergePages.length - 1, index + 1);
                break;
            case 'top':
                targetIndex = 0;
                break;
            case 'bottom':
                targetIndex = this.mergePages.length - 1;
                break;
            default:
                return;
        }

        if (targetIndex === index) return;

        this.mergePages.splice(index, 1);
        this.mergePages.splice(targetIndex, 0, page);
        this.displayMergePages();
    }

    /**
     * Handle compress file selection
     */
    handleCompressFileSelect(e) {
        const files = Array.from(e.target.files).filter(file => this.isPdfFile(file));
        this.handleCompressFiles(files);
        e.target.value = '';
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
        if (this.selectionAction === 'remove') {
            const result = await this.removePagesFromPdf(this.currentFiles[0], sortedPages);
            return [{
                message: `Removed ${sortedPages.length} page(s)` ,
                size: result.size,
                blob: result.blob,
                filename: 'pages-removed.pdf'
            }];
        } else {
            const result = await this.splitPDFByPages(this.currentFiles[0], sortedPages);
            return [{
                message: `Extracted ${sortedPages.length} selected pages`,
                size: result.size,
                blob: result.blob,
                filename: `selected-pages.pdf`
            }];
        }
    }
    
    /**
     * Split by advanced options
     */
    async splitByAdvanced() {
        const typeSelect = document.getElementById('advancedSplitType');
        const advancedType = typeSelect?.value || 'pages';
        const valueInput = document.getElementById('advancedValue');
        const rawValue = valueInput?.value ?? '';
        const advancedValue = rawValue === '' ? NaN : Number(rawValue);
        const totalPages = this.currentPdfDoc?.getPageCount() ?? 0;

        if (totalPages === 0) {
            throw new Error('Could not determine page count for this PDF.');
        }

        const requirePositiveInteger = (label, min = 1) => {
            if (!Number.isFinite(advancedValue) || advancedValue < min) {
                throw new Error(`Enter a value of at least ${min} for ${label}.`);
            }
            return Math.floor(advancedValue);
        };

        const requirePositiveNumber = (label, min = 0.1) => {
            if (!Number.isFinite(advancedValue) || advancedValue < min) {
                throw new Error(`Enter a value of at least ${min} for ${label}.`);
            }
            return advancedValue;
        };
        
        switch (advancedType) {
            case 'pages': {
                const pagesPerFile = requirePositiveInteger('pages per file');
                return await this.splitEveryNPages(pagesPerFile);
            }
            case 'equal': {
                const parts = requirePositiveInteger('number of parts', 2);
                if (parts > totalPages) {
                    throw new Error('Number of parts cannot exceed total pages.');
                }
                return await this.splitIntoEqualParts(parts);
            }
            case 'odd-even':
                return await this.splitOddEvenPages();
            case 'size': {
                const maxSizeMb = requirePositiveNumber('max file size (MB)');
                return await this.splitByApproximateSize(maxSizeMb);
            }
            case 'custom': {
                const customInput = document.getElementById('customRangesInput')?.value || '';
                if (!customInput.trim()) {
                    throw new Error('Enter at least one custom range before splitting.');
                }
                return await this.splitByCustomRanges(customInput);
            }
            default:
                throw new Error('Select a valid advanced split type.');
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
     * Split based on an approximate size target
     */
    async splitByApproximateSize(maxSizeMb) {
        const totalPages = this.currentPdfDoc?.getPageCount() ?? 0;
        if (totalPages === 0) {
            throw new Error('Cannot split a PDF with no pages loaded.');
        }

        const maxSizeBytes = maxSizeMb * 1024 * 1024;
        if (!Number.isFinite(maxSizeBytes) || maxSizeBytes <= 0) {
            throw new Error('Enter a positive size limit in MB.');
        }

        const fileSizeBytes = this.currentFiles?.[0]?.size || this.currentArrayBuffer?.byteLength;
        if (!fileSizeBytes) {
            throw new Error('Could not read the current file size for size-based splitting.');
        }

        const approxBytesPerPage = Math.max(1, Math.round(fileSizeBytes / totalPages));
        let targetPagesPerChunk = Math.floor(maxSizeBytes / approxBytesPerPage);
        if (targetPagesPerChunk < 1) {
            targetPagesPerChunk = 1;
        }

        const results = [];
        let pageStart = 1;
        let chunkIndex = 1;
        let hadOversizedChunk = false;

        while (pageStart <= totalPages) {
            let pageEnd = Math.min(totalPages, pageStart + targetPagesPerChunk - 1);
            let chunkResult = await this.splitPDF(this.currentFiles[0], pageStart, pageEnd);

            while (chunkResult.size > maxSizeBytes && pageEnd > pageStart) {
                pageEnd--;
                chunkResult = await this.splitPDF(this.currentFiles[0], pageStart, pageEnd);
            }

            const exceedsLimit = chunkResult.size > maxSizeBytes;
            hadOversizedChunk = hadOversizedChunk || exceedsLimit;
            const rangeLabel = pageStart === pageEnd ? `page ${pageStart}` : `pages ${pageStart}-${pageEnd}`;
            const messageSuffix = exceedsLimit ? ' (exceeds limit)' : '';
            results.push({
                message: `Part ${chunkIndex} (${rangeLabel})${messageSuffix}`,
                size: chunkResult.size,
                blob: chunkResult.blob,
                filename: `part-${chunkIndex}-${pageStart}-${pageEnd}.pdf`
            });

            pageStart = pageEnd + 1;
            chunkIndex++;
        }

        if (hadOversizedChunk) {
            console.warn('Some chunks exceed the requested size limit. Consider choosing a larger limit or splitting fewer pages.');
        }

        return results;
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

    async splitByCustomRanges(rangeInput) {
        const totalPages = this.currentPageCount || (this.currentPdfDoc?.getPageCount() ?? 0);
        if (!rangeInput.trim()) {
            throw new Error('Enter at least one range in the custom field.');
        }

        const ranges = this.parseCustomRanges(rangeInput, totalPages);
        if (ranges.length === 0) {
            throw new Error('Could not parse the provided ranges. Use formats like 1-3,5,7-9.');
        }

        const results = [];
        let part = 1;
        for (const range of ranges) {
            const result = await this.splitPDF(this.currentFiles[0], range.start, range.end);
            results.push({
                message: `Custom part ${part} (pages ${range.start}-${range.end})`,
                size: result.size,
                blob: result.blob,
                filename: `custom-${part}.pdf`
            });
            part++;
        }

        return results;
    }

    parseCustomRanges(input, totalPages) {
        if (!input) return [];
        return input.split(',').map(part => part.trim()).filter(Boolean).map(part => {
            if (part.includes('-')) {
                const [startStr, endStr] = part.split('-');
                let start = parseInt(startStr, 10);
                let end = parseInt(endStr, 10);
                if (isNaN(start) || isNaN(end)) return null;
                if (start > end) [start, end] = [end, start];
                start = Math.max(1, Math.min(start, totalPages));
                end = Math.max(1, Math.min(end, totalPages));
                return { start, end };
            }
            const single = parseInt(part, 10);
            if (isNaN(single)) return null;
            const page = Math.max(1, Math.min(single, totalPages));
            return { start: page, end: page };
        }).filter(Boolean);
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
        const hasCustomPages = this.mergePages.length > 0;
        if (!hasCustomPages && this.currentFiles.length < 2) {
            this.showError('Please add at least 2 PDF files.');
            return;
        }

        try {
            this.setProcessing(true, 'mergeProgress');
            const result = await this.mergePDF(this.currentFiles);
            this.showResult(`Merged ${this.currentFiles.length} PDFs`, result.size, result.blob);
            this.clearMergeData();
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

    async removePagesFromPdf(file, pagesToRemove) {
        const removeSet = new Set(pagesToRemove);
        const arrayBuffer = this.currentArrayBuffer || await file.arrayBuffer();
        const pdfDoc = this.currentPdfDoc || await PDFLib.PDFDocument.load(arrayBuffer);
        const totalPages = pdfDoc.getPageCount();

        const keepIndices = [];
        for (let i = 0; i < totalPages; i++) {
            if (!removeSet.has(i + 1)) {
                keepIndices.push(i);
            }
        }

        if (keepIndices.length === 0) {
            throw new Error('Remove fewer pages so at least one page remains.');
        }

        const newPdfDoc = await PDFLib.PDFDocument.create();
        const copiedPages = await newPdfDoc.copyPages(pdfDoc, keepIndices);
        copiedPages.forEach(page => newPdfDoc.addPage(page));

        const pdfBytes = await newPdfDoc.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        return {
            blob,
            size: blob.size
        };
    }

    /**
     * Merge PDF function
     */
    async mergePDF(files) {
        const mergedPdf = await PDFLib.PDFDocument.create();
        const pdfLibCache = {};

        // If we have page ordering data, use it
        if (this.mergePages.length > 0) {
            console.log(`Merging ${this.mergePages.length} pages in custom order`);
            
            for (const pageData of this.mergePages) {
                const pdfData = this.mergePdfData[pageData.fileIndex];
                if (!pdfData) continue;
                
                if (!pdfLibCache[pageData.fileIndex]) {
                    pdfLibCache[pageData.fileIndex] = await PDFLib.PDFDocument.load(pdfData.arrayBuffer);
                }
                const pdfDoc = pdfLibCache[pageData.fileIndex];
                
                const pageIndex = Math.max(0, Math.min(pageData.pageNum - 1, pdfDoc.getPageCount() - 1));
                const [copiedPage] = await mergedPdf.copyPages(pdfDoc, [pageIndex]);
                mergedPdf.addPage(copiedPage);
            }
        } else {
            // Fallback: merge all files in order
            console.log('Merging files in default order');
            for (const file of files) {
                if (!file) continue;
                if (!pdfLibCache[file.name]) {
                    const arrayBuffer = await file.arrayBuffer();
                    pdfLibCache[file.name] = await PDFLib.PDFDocument.load(arrayBuffer);
                }
                const pdfDoc = pdfLibCache[file.name];
                const copiedPages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
                copiedPages.forEach(page => mergedPdf.addPage(page));
            }
        }

        const pdfBytes = await mergedPdf.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        
        return {
            blob: blob,
            size: blob.size
        };
    }

    /**
     * Compress PDF function with advanced compression techniques
     */
    async compressPDF(file, quality) {
        try {
            // Load PDF using both PDF.js (for rendering) and PDF-lib (for manipulation)
            const arrayBuffer = this.currentArrayBuffer || await file.arrayBuffer();
            
            // Determine compression settings based on quality level
            let imageQuality, scale;
            switch (quality) {
                case 'low':
                    // Low compression: 90% quality, no scaling
                    imageQuality = 0.9;
                    scale = 1.0;
                    break;
                case 'medium':
                    // Medium compression: 70% quality, slight scaling
                    imageQuality = 0.7;
                    scale = 0.9;
                    break;
                case 'high':
                    // High compression: 50% quality, more scaling
                    imageQuality = 0.5;
                    scale = 0.75;
                    break;
            }

            // Use PDF.js to render pages and recompress images
            if (window.pdfjsLib) {
                return await this.compressWithImageRecompression(arrayBuffer, imageQuality, scale);
            } else {
                // Fallback: Basic PDF-lib compression
                return await this.basicPdfCompression(arrayBuffer);
            }
        } catch (error) {
            console.error('Compression error:', error);
            // Fallback to basic compression
            return await this.basicPdfCompression(this.currentArrayBuffer || await file.arrayBuffer());
        }
    }

    /**
     * Advanced compression with image recompression
     */
    async compressWithImageRecompression(arrayBuffer, imageQuality, scale) {
        const loadingTask = pdfjsLib.getDocument({data: arrayBuffer});
        const pdfDoc = await loadingTask.promise;
        
        console.log(`🗜️ Compressing PDF: ${pdfDoc.numPages} pages`);
        console.log(`📊 Settings: Quality=${imageQuality * 100}%, Scale=${scale * 100}%`);
        
        // Create new PDF document
        const newPdfDoc = await PDFLib.PDFDocument.create();
        
        // Process each page
        for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
            console.log(`Processing page ${pageNum}/${pdfDoc.numPages}...`);
            
            const page = await pdfDoc.getPage(pageNum);
            const viewport = page.getViewport({scale: scale});
            
            // Render page to canvas
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            
            await page.render({
                canvasContext: context,
                viewport: viewport
            }).promise;
            
            // Convert canvas to compressed JPEG
            const imageData = canvas.toDataURL('image/jpeg', imageQuality);
            const imageBytes = this.dataURLToArrayBuffer(imageData);
            
            // Embed compressed image as new page
            const img = await newPdfDoc.embedJpg(imageBytes);
            const newPage = newPdfDoc.addPage([viewport.width, viewport.height]);
            newPage.drawImage(img, {
                x: 0,
                y: 0,
                width: viewport.width,
                height: viewport.height
            });
        }
        
        console.log('✅ All pages processed, saving compressed PDF...');
        
        // Save with compression options
        const pdfBytes = await newPdfDoc.save({
            useObjectStreams: true,
            addDefaultPage: false,
            objectsPerTick: 50
        });
        
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        
        // Check if compression was effective (at least 5% reduction)
        const originalSize = arrayBuffer.byteLength;
        const compressionRatio = (originalSize - blob.size) / originalSize;
        
        console.log(`📉 Compression result: ${(compressionRatio * 100).toFixed(1)}% reduction`);
        console.log(`   Original: ${this.formatFileSize(originalSize)}`);
        console.log(`   Compressed: ${this.formatFileSize(blob.size)}`);
        
        // If image recompression didn't help much, try basic compression
        if (compressionRatio < 0.05) {
            console.log('⚠️ Image recompression not effective, trying basic compression...');
            return await this.basicPdfCompression(arrayBuffer);
        }
        
        return {
            blob: blob,
            size: blob.size
        };
    }

    /**
     * Basic PDF compression fallback
     */
    async basicPdfCompression(arrayBuffer) {
        const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
        
        // Remove metadata to reduce size
        pdfDoc.setTitle('');
        pdfDoc.setAuthor('');
        pdfDoc.setSubject('');
        pdfDoc.setKeywords([]);
        pdfDoc.setProducer('');
        pdfDoc.setCreator('');
        
        // Save with maximum compression
        const pdfBytes = await pdfDoc.save({
            useObjectStreams: true,
            addDefaultPage: false,
            objectsPerTick: 50
        });
        
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
        this.selectionAction = 'extract';
        this.mergePages = [];
        this.mergePdfData = [];
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