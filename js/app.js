/**
 * FusePDF - Browser-based PDF Tools
 * Free PDF Split, Merge, and Compress Tool
 */

class FusePDF {
    constructor() {
        this.currentFiles = [];
        this.currentTab = 'split';
        this.isProcessing = false;
        
        // Initialize the application
        this.init();
    }

    /**
     * Initialize the application
     */
    init() {
        this.initTheme();
        this.initEventListeners();
        this.initDragAndDrop();
        
        console.log('FusePDF initialized successfully');
    }

    /**
     * Initialize theme system
     */
    initTheme() {
        const themeToggle = document.getElementById('themeToggle');
        const savedTheme = localStorage.getItem('theme') || 'light';
        
        this.setTheme(savedTheme);
        
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            this.setTheme(newTheme);
            localStorage.setItem('theme', newTheme);
        });
    }

    /**
     * Set theme
     */
    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        const themeToggle = document.getElementById('themeToggle');
        themeToggle.textContent = theme === 'light' ? '🌙' : '☀️';
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
        
        // Process buttons
        document.getElementById('splitBtn').addEventListener('click', () => this.handleSplit());
        document.getElementById('mergeBtn').addEventListener('click', () => this.handleMerge());
        document.getElementById('compressBtn').addEventListener('click', () => this.handleCompress());
        
        // Result buttons
        document.getElementById('resetBtn').addEventListener('click', () => this.resetAll());
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
    }

    /**
     * Initialize drag and drop functionality
     */
    initDragAndDrop() {
        const dropAreas = [
            { element: document.getElementById('splitUpload'), handler: (files) => this.handleSplitFiles(files) },
            { element: document.getElementById('mergeUpload'), handler: (files) => this.handleMergeFiles(files) },
            { element: document.getElementById('compressUpload'), handler: (files) => this.handleCompressFiles(files) }
        ];

        dropAreas.forEach(({ element, handler }) => {
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
                const files = Array.from(e.dataTransfer.files).filter(file => file.type === 'application/pdf');
                if (files.length > 0) {
                    handler(files);
                } else {
                    this.showError('Please drop PDF files only.');
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

            document.getElementById('pageCount').textContent = `Total pages: ${pageCount}`;
            document.getElementById('endPage').max = pageCount;
            document.getElementById('endPage').value = pageCount;
            document.getElementById('splitOptions').style.display = 'block';

            this.currentFiles = [file];
        } catch (error) {
            this.showError('Error reading PDF file. Please ensure it\'s a valid PDF.');
            console.error(error);
        }
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

        const startPage = parseInt(document.getElementById('startPage').value);
        const endPage = parseInt(document.getElementById('endPage').value);

        if (startPage > endPage || startPage < 1) {
            this.showError('Invalid page range.');
            return;
        }

        try {
            this.setProcessing(true, 'splitProgress');
            const result = await this.splitPDF(this.currentFiles[0], startPage, endPage);
            this.showResult(`Extracted pages ${startPage}-${endPage}`, result.size, result.blob);
        } catch (error) {
            this.showError('Error splitting PDF: ' + error.message);
        } finally {
            this.setProcessing(false, 'splitProgress');
        }
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
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
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
        const arrayBuffer = await file.arrayBuffer();
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
     * Reset all forms and states
     */
    resetAll() {
        this.currentFiles = [];
        
        // Hide all option sections
        document.getElementById('splitOptions').style.display = 'none';
        document.getElementById('mergeFileList').style.display = 'none';
        document.getElementById('compressOptions').style.display = 'none';
        document.getElementById('resultSection').style.display = 'none';
        
        // Reset form inputs
        document.querySelectorAll('input[type="file"]').forEach(input => input.value = '');
        document.getElementById('startPage').value = 1;
        document.getElementById('endPage').value = 1;
        document.getElementById('compressionLevel').value = 'medium';
        
        // Reset file containers
        document.getElementById('filesContainer').innerHTML = '';
        
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