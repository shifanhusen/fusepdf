// Simple PDF Tools JavaScript
let currentFiles = {
    merge: [],
    split: null,
    organize: null
};

let pageData = {
    merge: [],
    split: [],
    organize: []
};

let selectionMode = {
    split: false,
    organize: false
};

let draggedElement = null;
let draggedIndex = -1;

// Tab switching functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize PDF.js
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    
    // Initialize theme
    initializeTheme();
    
    setupTabs();
    setupFileUploads();
    setupDragDrop();
});

function setupTabs() {
    const tabs = document.querySelectorAll('.tab');
    const sections = document.querySelectorAll('.tool-section');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs
            tabs.forEach(t => t.classList.remove('active'));
            // Add active class to clicked tab
            tab.classList.add('active');
            
            // Hide all sections
            sections.forEach(section => section.classList.add('hidden'));
            // Show selected section
            const targetSection = document.getElementById(tab.dataset.tab);
            targetSection.classList.remove('hidden');
        });
    });
}

function setupFileUploads() {
    // Merge files
    document.getElementById('merge-files').addEventListener('change', function(e) {
        handleMergeFiles(Array.from(e.target.files));
    });
    
    // Split file
    document.getElementById('split-file').addEventListener('change', function(e) {
        if (e.target.files[0]) {
            handleSplitFile(e.target.files[0]);
        }
    });
    
    // Organize file
    document.getElementById('organize-file').addEventListener('change', function(e) {
        if (e.target.files[0]) {
            handleOrganizeFile(e.target.files[0]);
        }
    });
}

function setupDragDrop() {
    const uploadAreas = document.querySelectorAll('.upload-area');
    
    uploadAreas.forEach(area => {
        area.addEventListener('dragover', (e) => {
            e.preventDefault();
            area.classList.add('drag-over');
        });
        
        area.addEventListener('dragleave', (e) => {
            e.preventDefault();
            area.classList.remove('drag-over');
        });
        
        area.addEventListener('drop', (e) => {
            e.preventDefault();
            area.classList.remove('drag-over');
            
            const files = Array.from(e.dataTransfer.files).filter(file => file.type === 'application/pdf');
            
            if (area.contains(document.getElementById('merge-files'))) {
                handleMergeFiles(files);
            } else if (area.contains(document.getElementById('split-file'))) {
                if (files[0]) handleSplitFile(files[0]);
            } else if (area.contains(document.getElementById('organize-file'))) {
                if (files[0]) handleOrganizeFile(files[0]);
            }
        });
    });
}

// Merge functionality
async function handleMergeFiles(files) {
    for (const file of files) {
        if (file.type === 'application/pdf') {
            currentFiles.merge.push(file);
            await loadPdfThumbnails(file, 'merge');
        }
    }
    
    updateMergeFileList();
    updateThumbnailGrid('merge');
    document.getElementById('merge-btn').disabled = currentFiles.merge.length === 0;
}

function updateMergeFileList() {
    const list = document.getElementById('merge-file-list');
    list.innerHTML = '';
    
    currentFiles.merge.forEach((file, index) => {
        const item = document.createElement('div');
        item.className = 'file-item';
        item.innerHTML = `
            <div class="file-info">
                <span class="file-name">${file.name}</span>
                <span class="file-size">${formatFileSize(file.size)}</span>
            </div>
            <div class="file-actions">
                <button class="btn btn-secondary" onclick="removeMergeFile(${index})">Remove</button>
                ${index > 0 ? `<button class="btn btn-secondary" onclick="moveMergeFile(${index}, -1)">↑</button>` : ''}
                ${index < currentFiles.merge.length - 1 ? `<button class="btn btn-secondary" onclick="moveMergeFile(${index}, 1)">↓</button>` : ''}
            </div>
        `;
        list.appendChild(item);
    });
}

function removeMergeFile(index) {
    currentFiles.merge.splice(index, 1);
    updateMergeFileList();
    document.getElementById('merge-btn').disabled = currentFiles.merge.length === 0;
}

function moveMergeFile(index, direction) {
    const newIndex = index + direction;
    if (newIndex >= 0 && newIndex < currentFiles.merge.length) {
        [currentFiles.merge[index], currentFiles.merge[newIndex]] = [currentFiles.merge[newIndex], currentFiles.merge[index]];
        updateMergeFileList();
    }
}

async function mergePDFs() {
    if (currentFiles.merge.length === 0) return;
    
    try {
        showProgress('merge', 0);
        showResult('merge', '');
        
        const mergedPdf = await PDFLib.PDFDocument.create();
        
        // Use selected pages or all pages in order
        const selectedPages = pageData.merge.filter(page => page.selected);
        const pagesToMerge = selectedPages.length > 0 ? selectedPages : pageData.merge;
        
        const fileCache = new Map();
        let processedPages = 0;
        
        for (const pageInfo of pagesToMerge) {
            const fileName = pageInfo.fileName;
            
            if (!fileCache.has(fileName)) {
                const file = currentFiles.merge.find(f => f.name === fileName);
                const arrayBuffer = await file.arrayBuffer();
                const pdf = await PDFLib.PDFDocument.load(arrayBuffer);
                fileCache.set(fileName, pdf);
            }
            
            const sourcePdf = fileCache.get(fileName);
            const [page] = await mergedPdf.copyPages(sourcePdf, [pageInfo.pageNumber - 1]);
            mergedPdf.addPage(page);
            
            processedPages++;
            showProgress('merge', (processedPages / pagesToMerge.length) * 100);
        }
        
        const pdfBytes = await mergedPdf.save();
        downloadFile(pdfBytes, 'merged.pdf');
        
        showResult('merge', `<div class="success">✅ Successfully merged ${pagesToMerge.length} pages from ${currentFiles.merge.length} PDFs!</div>`);
        
    } catch (error) {
        showResult('merge', `<div class="error">❌ Error merging PDFs: ${error.message}</div>`);
    } finally {
        hideProgress('merge');
    }
}

// Split functionality
async function handleSplitFile(file) {
    currentFiles.split = file;
    pageData.split = [];
    await loadPdfThumbnails(file, 'split');
    updateSplitFileInfo();
    updateThumbnailGrid('split');
    document.getElementById('split-btn').disabled = false;
}

function updateSplitFileInfo() {
    const info = document.getElementById('split-file-info');
    if (currentFiles.split) {
        info.innerHTML = `
            <div class="file-item">
                <div class="file-info">
                    <span class="file-name">${currentFiles.split.name}</span>
                    <span class="file-size">${formatFileSize(currentFiles.split.size)}</span>
                </div>
            </div>
        `;
    } else {
        info.innerHTML = '';
    }
}

function updateSplitOptions() {
    const method = document.getElementById('split-method').value;
    const pagesInput = document.getElementById('pages-input');
    const everyNInput = document.getElementById('every-n-input');
    
    if (method === 'pages') {
        pagesInput.classList.remove('hidden');
        everyNInput.classList.add('hidden');
    } else if (method === 'every') {
        pagesInput.classList.add('hidden');
        everyNInput.classList.remove('hidden');
    } else {
        pagesInput.classList.add('hidden');
        everyNInput.classList.add('hidden');
    }
}

async function splitPDF() {
    if (!currentFiles.split) return;
    
    try {
        showProgress('split', 0);
        showResult('split', '');
        
        const arrayBuffer = await currentFiles.split.arrayBuffer();
        const pdf = await PDFLib.PDFDocument.load(arrayBuffer);
        const totalPages = pdf.getPageCount();
        
        const method = document.getElementById('split-method').value;
        let pagesToSplit = [];
        
        // Check if we have selected pages for visual selection
        const selectedPages = pageData.split.filter(page => page.selected);
        
        if (selectedPages.length > 0 && method === 'pages') {
            // Use selected pages
            selectedPages.forEach(page => {
                pagesToSplit.push({ 
                    start: page.pageNumber - 1, 
                    end: page.pageNumber - 1, 
                    name: `page_${page.pageNumber}.pdf` 
                });
            });
        } else if (method === 'pages') {
            const ranges = document.getElementById('page-ranges').value;
            pagesToSplit = parsePageRanges(ranges, totalPages);
        } else if (method === 'every') {
            const pagesPerFile = parseInt(document.getElementById('pages-per-file').value) || 1;
            for (let i = 0; i < totalPages; i += pagesPerFile) {
                const end = Math.min(i + pagesPerFile - 1, totalPages - 1);
                pagesToSplit.push({ start: i, end: end, name: `pages_${i + 1}_to_${end + 1}.pdf` });
            }
        } else { // single
            for (let i = 0; i < totalPages; i++) {
                pagesToSplit.push({ start: i, end: i, name: `page_${i + 1}.pdf` });
            }
        }
        
        const results = [];
        
        for (let i = 0; i < pagesToSplit.length; i++) {
            const range = pagesToSplit[i];
            const newPdf = await PDFLib.PDFDocument.create();
            
            for (let pageNum = range.start; pageNum <= range.end; pageNum++) {
                const [page] = await newPdf.copyPages(pdf, [pageNum]);
                newPdf.addPage(page);
            }
            
            const pdfBytes = await newPdf.save();
            results.push({ bytes: pdfBytes, name: range.name });
            
            showProgress('split', ((i + 1) / pagesToSplit.length) * 100);
        }
        
        // Create zip if multiple files
        if (results.length > 1) {
            await createZipDownload(results, 'split_pages.zip');
        } else if (results.length === 1) {
            downloadFile(results[0].bytes, results[0].name);
        }
        
        showResult('split', `<div class="success">✅ Successfully split PDF into ${results.length} file(s)!</div>`);
        
    } catch (error) {
        showResult('split', `<div class="error">❌ Error splitting PDF: ${error.message}</div>`);
    } finally {
        hideProgress('split');
    }
}

// Organize functionality
async function handleOrganizeFile(file) {
    currentFiles.organize = file;
    pageData.organize = [];
    await loadPdfThumbnails(file, 'organize');
    updateOrganizeFileInfo();
    updateThumbnailGrid('organize');
    document.getElementById('organize-btn').disabled = false;
}

function updateOrganizeFileInfo() {
    const info = document.getElementById('organize-file-info');
    if (currentFiles.organize) {
        info.innerHTML = `
            <div class="file-item">
                <div class="file-info">
                    <span class="file-name">${currentFiles.organize.name}</span>
                    <span class="file-size">${formatFileSize(currentFiles.organize.size)}</span>
                </div>
            </div>
        `;
    } else {
        info.innerHTML = '';
    }
}

async function organizePDF() {
    if (!currentFiles.organize) return;
    
    try {
        showProgress('organize', 0);
        showResult('organize', '');
        
        const arrayBuffer = await currentFiles.organize.arrayBuffer();
        const sourcePdf = await PDFLib.PDFDocument.load(arrayBuffer);
        
        // Use the current order from pageData (which may have been reordered by dragging)
        const selectedPages = pageData.organize.filter(page => page.selected);
        const pagesToUse = selectedPages.length > 0 ? selectedPages : pageData.organize;
        
        showProgress('organize', 25);
        
        const newPdf = await PDFLib.PDFDocument.create();
        
        for (let i = 0; i < pagesToUse.length; i++) {
            const pageInfo = pagesToUse[i];
            const [page] = await newPdf.copyPages(sourcePdf, [pageInfo.pageNumber - 1]);
            newPdf.addPage(page);
            
            showProgress('organize', 25 + ((i + 1) / pagesToUse.length) * 50);
        }
        
        showProgress('organize', 75);
        
        const pdfBytes = await newPdf.save();
        downloadFile(pdfBytes, 'organized.pdf');
        
        showResult('organize', `<div class="success">✅ Successfully organized PDF with ${pagesToUse.length} pages!</div>`);
        
    } catch (error) {
        showResult('organize', `<div class="error">❌ Error organizing PDF: ${error.message}</div>`);
    } finally {
        hideProgress('organize');
    }
}

// Utility functions
function parsePageRanges(ranges, totalPages) {
    const result = [];
    const parts = ranges.split(',').map(s => s.trim());
    
    for (const part of parts) {
        if (part.includes('-')) {
            const [start, end] = part.split('-').map(n => parseInt(n.trim()));
            if (start && end && start <= end && start >= 1 && end <= totalPages) {
                result.push({ 
                    start: start - 1, 
                    end: end - 1, 
                    name: `pages_${start}_to_${end}.pdf` 
                });
            }
        } else {
            const page = parseInt(part);
            if (page >= 1 && page <= totalPages) {
                result.push({ 
                    start: page - 1, 
                    end: page - 1, 
                    name: `page_${page}.pdf` 
                });
            }
        }
    }
    
    return result;
}

function formatFileSize(bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
}

function downloadFile(bytes, filename) {
    const blob = new Blob([bytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

async function createZipDownload(files, zipName) {
    // Simple zip creation using JSZip
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
    document.head.appendChild(script);
    
    await new Promise(resolve => {
        script.onload = resolve;
    });
    
    const zip = new JSZip();
    
    files.forEach(file => {
        zip.file(file.name, file.bytes);
    });
    
    const zipBytes = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(zipBytes);
    const a = document.createElement('a');
    a.href = url;
    a.download = zipName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function showProgress(tool, percent) {
    document.getElementById(`${tool}-progress`).style.display = 'block';
    document.getElementById(`${tool}-progress-bar`).style.width = `${percent}%`;
}

function hideProgress(tool) {
    document.getElementById(`${tool}-progress`).style.display = 'none';
}

function showResult(tool, html) {
    const result = document.getElementById(`${tool}-result`);
    result.innerHTML = html;
    result.classList.add('show');
}

function clearFiles(tool) {
    if (tool === 'merge') {
        currentFiles.merge = [];
        pageData.merge = [];
        updateMergeFileList();
        updateThumbnailGrid('merge');
        document.getElementById('merge-btn').disabled = true;
        document.getElementById('merge-files').value = '';
    } else if (tool === 'split') {
        currentFiles.split = null;
        pageData.split = [];
        updateSplitFileInfo();
        updateThumbnailGrid('split');
        document.getElementById('split-btn').disabled = true;
        document.getElementById('split-file').value = '';
    } else if (tool === 'organize') {
        currentFiles.organize = null;
        pageData.organize = [];
        updateOrganizeFileInfo();
        updateThumbnailGrid('organize');
        document.getElementById('organize-btn').disabled = true;
        document.getElementById('organize-file').value = '';
    }
    
    hideProgress(tool);
    showResult(tool, '');
}

// PDF Thumbnail Generation
async function loadPdfThumbnails(file, tool) {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
        const totalPages = pdf.numPages;
        
        const filePages = [];
        
        for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const viewport = page.getViewport({ scale: 0.5 });
            
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            
            await page.render({
                canvasContext: context,
                viewport: viewport
            }).promise;
            
            filePages.push({
                pageNumber: pageNum,
                canvas: canvas,
                selected: false,
                fileIndex: tool === 'merge' ? currentFiles.merge.length - 1 : 0,
                fileName: file.name
            });
        }
        
        if (tool === 'merge') {
            pageData.merge.push(...filePages);
        } else {
            pageData[tool] = filePages;
        }
        
    } catch (error) {
        console.error('Error loading PDF thumbnails:', error);
    }
}

// Thumbnail Grid Management
function updateThumbnailGrid(tool) {
    const grid = document.getElementById(`${tool}-thumbnails`);
    const controls = document.getElementById(`${tool}-selection-controls`);
    
    if (pageData[tool].length === 0) {
        grid.style.display = 'none';
        controls.style.display = 'none';
        return;
    }
    
    grid.style.display = 'grid';
    controls.style.display = 'flex';
    grid.innerHTML = '';
    
    pageData[tool].forEach((page, index) => {
        const item = document.createElement('div');
        item.className = 'thumbnail-item';
        item.draggable = true;
        item.dataset.index = index;
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'page-checkbox';
        checkbox.checked = page.selected;
        checkbox.addEventListener('change', () => togglePageSelection(tool, index));
        
        const pageNumber = document.createElement('div');
        pageNumber.className = 'page-number';
        pageNumber.textContent = page.pageNumber;
        
        const canvas = page.canvas.cloneNode();
        canvas.className = 'thumbnail-canvas';
        const ctx = canvas.getContext('2d');
        ctx.drawImage(page.canvas, 0, 0);
        
        const info = document.createElement('div');
        info.className = 'thumbnail-info';
        info.textContent = tool === 'merge' ? `${page.fileName} - Page ${page.pageNumber}` : `Page ${page.pageNumber}`;
        
        const dropIndicator = document.createElement('div');
        dropIndicator.className = 'drop-indicator';
        
        item.appendChild(checkbox);
        item.appendChild(pageNumber);
        item.appendChild(canvas);
        item.appendChild(info);
        item.appendChild(dropIndicator);
        
        // Drag and Drop Events
        item.addEventListener('dragstart', (e) => handleDragStart(e, tool, index));
        item.addEventListener('dragover', (e) => handleDragOver(e));
        item.addEventListener('drop', (e) => handleDrop(e, tool, index));
        item.addEventListener('dragenter', (e) => handleDragEnter(e));
        item.addEventListener('dragleave', (e) => handleDragLeave(e));
        
        grid.appendChild(item);
    });
    
    updateSelectionInfo(tool);
}

// Drag and Drop Functionality
function handleDragStart(e, tool, index) {
    draggedElement = e.target;
    draggedIndex = index;
    e.target.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
}

function handleDragEnter(e) {
    e.preventDefault();
    e.target.closest('.thumbnail-item').classList.add('drop-target');
}

function handleDragLeave(e) {
    e.target.closest('.thumbnail-item').classList.remove('drop-target');
}

function handleDrop(e, tool, dropIndex) {
    e.preventDefault();
    
    const draggedItem = draggedElement;
    draggedItem.classList.remove('dragging');
    e.target.closest('.thumbnail-item').classList.remove('drop-target');
    
    if (draggedIndex !== dropIndex && draggedIndex !== -1) {
        // Reorder pages
        const draggedPage = pageData[tool][draggedIndex];
        pageData[tool].splice(draggedIndex, 1);
        pageData[tool].splice(dropIndex, 0, draggedPage);
        
        updateThumbnailGrid(tool);
    }
    
    draggedElement = null;
    draggedIndex = -1;
}

// Page Selection Functions
function togglePageSelection(tool, index) {
    pageData[tool][index].selected = !pageData[tool][index].selected;
    updateSelectionInfo(tool);
    
    // Update visual state
    const grid = document.getElementById(`${tool}-thumbnails`);
    const item = grid.children[index];
    if (pageData[tool][index].selected) {
        item.classList.add('selected');
    } else {
        item.classList.remove('selected');
    }
}

function selectAllPages(tool) {
    pageData[tool].forEach(page => page.selected = true);
    updateThumbnailGrid(tool);
}

function deselectAllPages(tool) {
    pageData[tool].forEach(page => page.selected = false);
    updateThumbnailGrid(tool);
}

function toggleSelectionMode(tool) {
    selectionMode[tool] = !selectionMode[tool];
    const grid = document.getElementById(`${tool}-thumbnails`);
    const checkboxes = grid.querySelectorAll('.page-checkbox');
    
    checkboxes.forEach(checkbox => {
        checkbox.style.display = selectionMode[tool] ? 'block' : 'none';
    });
    
    updateSelectionInfo(tool);
}

function resetOrder(tool) {
    if (tool === 'organize') {
        pageData[tool].sort((a, b) => a.pageNumber - b.pageNumber);
        updateThumbnailGrid(tool);
    }
}

function updateSelectionInfo(tool) {
    const selectedCount = pageData[tool].filter(page => page.selected).length;
    const totalCount = pageData[tool].length;
    const info = document.getElementById(`${tool}-selection-info`);
    
    if (tool === 'organize') {
        info.textContent = `${totalCount} pages - Drag to reorder`;
    } else {
        info.textContent = `${selectedCount} of ${totalCount} pages selected`;
    }
}

// Theme Management
function initializeTheme() {
    // Check for saved theme preference or default to dark mode
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
}

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    
    // Update theme toggle icons
    const lightIcon = document.getElementById('light-icon');
    const darkIcon = document.getElementById('dark-icon');
    
    if (theme === 'light') {
        lightIcon.classList.add('active');
        darkIcon.classList.remove('active');
    } else {
        lightIcon.classList.remove('active');
        darkIcon.classList.add('active');
    }
}