// Simple PDF Tools JavaScript
let currentFiles = {
    merge: [],
    split: null,
    organize: null
};

// Tab switching functionality
document.addEventListener('DOMContentLoaded', function() {
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
function handleMergeFiles(files) {
    files.forEach(file => {
        if (file.type === 'application/pdf') {
            currentFiles.merge.push(file);
        }
    });
    
    updateMergeFileList();
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
        
        for (let i = 0; i < currentFiles.merge.length; i++) {
            const file = currentFiles.merge[i];
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await PDFLib.PDFDocument.load(arrayBuffer);
            const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
            
            pages.forEach((page) => mergedPdf.addPage(page));
            
            showProgress('merge', ((i + 1) / currentFiles.merge.length) * 100);
        }
        
        const pdfBytes = await mergedPdf.save();
        downloadFile(pdfBytes, 'merged.pdf');
        
        showResult('merge', `<div class="success">✅ Successfully merged ${currentFiles.merge.length} PDFs!</div>`);
        
    } catch (error) {
        showResult('merge', `<div class="error">❌ Error merging PDFs: ${error.message}</div>`);
    } finally {
        hideProgress('merge');
    }
}

// Split functionality
function handleSplitFile(file) {
    currentFiles.split = file;
    updateSplitFileInfo();
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
        
        if (method === 'pages') {
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
function handleOrganizeFile(file) {
    currentFiles.organize = file;
    updateOrganizeFileInfo();
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
        const pdf = await PDFLib.PDFDocument.load(arrayBuffer);
        const totalPages = pdf.getPageCount();
        
        const pageOrderInput = document.getElementById('page-order').value.trim();
        let pageOrder = [];
        
        if (pageOrderInput) {
            // Parse custom page order
            pageOrder = pageOrderInput.split(',')
                .map(num => parseInt(num.trim()) - 1) // Convert to 0-based
                .filter(num => num >= 0 && num < totalPages);
        } else {
            // Keep original order
            pageOrder = Array.from({ length: totalPages }, (_, i) => i);
        }
        
        showProgress('organize', 25);
        
        const newPdf = await PDFLib.PDFDocument.create();
        const pages = await newPdf.copyPages(pdf, pageOrder);
        
        showProgress('organize', 75);
        
        pages.forEach((page) => newPdf.addPage(page));
        
        const pdfBytes = await newPdf.save();
        downloadFile(pdfBytes, 'organized.pdf');
        
        showResult('organize', `<div class="success">✅ Successfully organized PDF with ${pageOrder.length} pages!</div>`);
        
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
        updateMergeFileList();
        document.getElementById('merge-btn').disabled = true;
        document.getElementById('merge-files').value = '';
    } else if (tool === 'split') {
        currentFiles.split = null;
        updateSplitFileInfo();
        document.getElementById('split-btn').disabled = true;
        document.getElementById('split-file').value = '';
    } else if (tool === 'organize') {
        currentFiles.organize = null;
        updateOrganizeFileInfo();
        document.getElementById('organize-btn').disabled = true;
        document.getElementById('organize-file').value = '';
    }
    
    hideProgress(tool);
    showResult(tool, '');
}