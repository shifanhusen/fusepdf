/* ============================================================================
   InnoviQR - Advanced QR Code Generator JavaScript
   Client-side QR generation with advanced styling options
   ============================================================================ */

class QRGenerator {
    constructor() {
        this.currentQR = null;
        this.currentLogo = null;
        this.isAdvancedMode = false;
        this.isGradientEnabled = false;
        this.isTransparentBg = false;
        
        this.init();
    }
    
    init() {
        // Check if QR libraries are loaded
        if (typeof QRious === 'undefined' && typeof QRCode === 'undefined') {
            console.error('QR libraries not loaded. Attempting to reload...');
            this.attemptLibraryReload();
            return;
        }
        
        this.bindEvents();
        this.setupTheme();
        this.generateContentInput();
        this.bindDesignGridEvents();
        
        // Small delay to ensure DOM is ready
        setTimeout(() => {
            this.updatePreview();
        }, 100);
    }
    
    // Event Bindings
    bindEvents() {
        // Mode Toggle
        document.getElementById('basicMode').addEventListener('click', () => this.setMode(false));
        document.getElementById('advancedMode').addEventListener('click', () => this.setMode(true));
        
        // Content Type Change
        document.getElementById('contentType').addEventListener('change', () => {
            this.generateContentInput();
            this.updatePreview();
        });
        
        // Basic Settings
        document.getElementById('qrSize').addEventListener('input', this.updateSize.bind(this));
        document.getElementById('errorCorrection').addEventListener('change', () => this.updatePreview());
        
        // Advanced Settings
        document.getElementById('qrColor').addEventListener('change', () => this.updatePreview());
        document.getElementById('qrColor2').addEventListener('change', () => this.updatePreview());
        document.getElementById('bgColor').addEventListener('change', () => this.updatePreview());
        document.getElementById('gradientType').addEventListener('change', () => this.updatePreview());
        
        // Design Grid Events
        this.bindDesignGridEvents();
        
        // Generate Button
        document.getElementById('generateBtn').addEventListener('click', () => this.updatePreview());
        
        // Color Controls
        document.getElementById('gradientToggle').addEventListener('click', this.toggleGradient.bind(this));
        document.getElementById('transparentBg').addEventListener('click', this.toggleTransparentBg.bind(this));
        
        // Logo Upload
        document.getElementById('logoUpload').addEventListener('change', this.handleLogoUpload.bind(this));
        document.getElementById('logoSize').addEventListener('input', this.updateLogoSize.bind(this));
        document.getElementById('logoMargin').addEventListener('input', this.updateLogoMargin.bind(this));
        
        // Download Buttons
        document.getElementById('downloadPNG').addEventListener('click', () => this.downloadQR('png'));
        document.getElementById('downloadSVG').addEventListener('click', () => this.downloadQR('svg'));
        document.getElementById('downloadPDF').addEventListener('click', () => this.downloadQR('pdf'));
        
        // Theme Toggle - handled in setupTheme method
        // Theme functionality is initialized in setupTheme()
    }
    
    // Mode Management
    setMode(advanced) {
        this.isAdvancedMode = advanced;
        
        // Update UI
        document.getElementById('basicMode').classList.toggle('active', !advanced);
        document.getElementById('advancedMode').classList.toggle('active', advanced);
        document.getElementById('advancedSettings').classList.toggle('hidden', !advanced);
        
        // Update QR generation
        this.updatePreview();
    }
    
    // Theme Management
    setupTheme() {
        const savedTheme = localStorage.getItem('qr-theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        this.updateThemeIcon(savedTheme);
    }
    
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('qr-theme', newTheme);
        this.updateThemeIcon(newTheme);
    }
    
    updateThemeIcon(theme) {
        const icon = document.querySelector('.theme-icon');
        icon.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
    
    // Content Input Generation
    generateContentInput() {
        const contentType = document.getElementById('contentType').value;
        const container = document.getElementById('contentInput');
        
        let html = '';
        
        switch (contentType) {
            case 'text':
                html = `
                    <label class="settings-label">Text Content</label>
                    <textarea id="qrContent" class="settings-textarea" placeholder="Enter your text here...">Hello World! 👋</textarea>
                `;
                break;
                
            case 'url':
                html = `
                    <label class="settings-label">Website URL</label>
                    <input type="url" id="qrContent" class="settings-input" placeholder="https://example.com" value="https://innovitecho.com">
                `;
                break;
                
            case 'email':
                html = `
                    <label class="settings-label">Email Address</label>
                    <input type="email" id="qrContent" class="settings-input" placeholder="contact@example.com">
                    <label class="settings-sublabel">Subject (Optional)</label>
                    <input type="text" id="emailSubject" class="settings-input" placeholder="Email subject">
                    <label class="settings-sublabel">Message (Optional)</label>
                    <textarea id="emailBody" class="settings-textarea" placeholder="Email message"></textarea>
                `;
                break;
                
            case 'phone':
                html = `
                    <label class="settings-label">Phone Number</label>
                    <input type="tel" id="qrContent" class="settings-input" placeholder="+1234567890">
                `;
                break;
                
            case 'wifi':
                html = `
                    <label class="settings-label">Network Name (SSID)</label>
                    <input type="text" id="wifiSSID" class="settings-input" placeholder="WiFi Network Name">
                    <label class="settings-sublabel">Password</label>
                    <input type="password" id="wifiPassword" class="settings-input" placeholder="WiFi Password">
                    <label class="settings-sublabel">Security Type</label>
                    <select id="wifiSecurity" class="settings-select">
                        <option value="WPA">WPA/WPA2</option>
                        <option value="WEP">WEP</option>
                        <option value="nopass">No Password</option>
                    </select>
                `;
                break;
                
            case 'whatsapp':
                html = `
                    <label class="settings-label">Phone Number</label>
                    <input type="tel" id="whatsappPhone" class="settings-input" placeholder="+1234567890">
                    <label class="settings-sublabel">Pre-filled Message</label>
                    <textarea id="whatsappMessage" class="settings-textarea" placeholder="Hello! I found your contact from..."></textarea>
                `;
                break;
                
            case 'vcard':
                html = `
                    <label class="settings-label">Full Name</label>
                    <input type="text" id="vcardName" class="settings-input" placeholder="John Doe">
                    <label class="settings-sublabel">Organization</label>
                    <input type="text" id="vcardOrg" class="settings-input" placeholder="Company Name">
                    <label class="settings-sublabel">Phone</label>
                    <input type="tel" id="vcardPhone" class="settings-input" placeholder="+1234567890">
                    <label class="settings-sublabel">Email</label>
                    <input type="email" id="vcardEmail" class="settings-input" placeholder="john@example.com">
                    <label class="settings-sublabel">Website</label>
                    <input type="url" id="vcardUrl" class="settings-input" placeholder="https://example.com">
                `;
                break;
                
            case 'vevent':
                html = `
                    <label class="settings-label">Event Name</label>
                    <input type="text" id="eventTitle" class="settings-input" placeholder="Annual Conference 2025">
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-top: 1rem;">
                        <div>
                            <label class="settings-sublabel">Start Date</label>
                            <input type="date" id="eventStartDate" class="settings-input">
                        </div>
                        <div>
                            <label class="settings-sublabel">Start Time</label>
                            <input type="time" id="eventStartTime" class="settings-input">
                        </div>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-top: 0.5rem;">
                        <div>
                            <label class="settings-sublabel">End Date (Optional)</label>
                            <input type="date" id="eventEndDate" class="settings-input">
                        </div>
                        <div>
                            <label class="settings-sublabel">End Time (Optional)</label>
                            <input type="time" id="eventEndTime" class="settings-input">
                        </div>
                    </div>
                    
                    <label class="settings-sublabel">Location</label>
                    <input type="text" id="eventLocation" class="settings-input" placeholder="Grand Convention Center, New York">
                    
                    <label class="settings-sublabel">Google Maps Link (Optional)</label>
                    <input type="url" id="eventMapsUrl" class="settings-input" placeholder="https://maps.google.com/...">
                    
                    <label class="settings-sublabel">Description (Optional)</label>
                    <textarea id="eventDescription" class="settings-textarea" rows="3" placeholder="Join us for our annual conference featuring keynote speakers, networking sessions, and workshops..."></textarea>
                    
                    <label class="settings-sublabel">Organizer Email (Optional)</label>
                    <input type="email" id="eventOrganizer" class="settings-input" placeholder="events@company.com">
                    
                    <div class="event-info-box" style="background: var(--bg-tertiary); padding: 1rem; border-radius: 6px; margin-top: 1rem;">
                        <h4 style="margin: 0 0 0.5rem 0; color: var(--text-primary); font-size: 0.9rem;">📱 Event QR Benefits:</h4>
                        <ul style="margin: 0; padding-left: 1.2rem; color: var(--text-secondary); font-size: 0.85rem; line-height: 1.4;">
                            <li>Automatically adds event to calendar apps</li>
                            <li>Works with iPhone, Android, Google Calendar</li>
                            <li>Perfect for exhibitions, weddings, seminars</li>
                            <li>Reduces manual data entry for attendees</li>
                        </ul>
                    </div>
                `;
                break;
        }
        
        container.innerHTML = html;
        
        // Bind events for new inputs
        this.bindContentEvents();
    }
    
    bindContentEvents() {
        const inputs = document.querySelectorAll('#contentInput input, #contentInput textarea, #contentInput select');
        inputs.forEach(input => {
            input.addEventListener('input', () => this.updatePreview());
        });
    }
    
    // Library Loading Fallback
    attemptLibraryReload() {
        const container = document.getElementById('qrCodeContainer');
        container.innerHTML = `
            <div class="error-message" style="color: #ff4757; padding: 2rem; text-align: center;">
                <h3>⚠️ Library Loading Error</h3>
                <p>QR Code library failed to load. Attempting to reload...</p>
                <button onclick="location.reload()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: var(--primary-blue); color: white; border: none; border-radius: 4px; cursor: pointer;">Reload Page</button>
            </div>
        `;
        
        // Try to reload libraries after a delay
        setTimeout(() => {
            if (typeof QRCode !== 'undefined') {
                this.updatePreview();
            }
        }, 2000);
    }
    
    // Library Loading Fallback
    attemptLibraryReload() {
        const container = document.getElementById('qrCodeContainer');
        container.innerHTML = `
            <div class="error-message" style="color: #ff4757; padding: 2rem; text-align: center;">
                <h3>⚠️ Library Loading Error</h3>
                <p>QR Code library failed to load. Attempting to reload...</p>
                <button onclick="location.reload()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: var(--primary-blue); color: white; border: none; border-radius: 4px; cursor: pointer;">Reload Page</button>
            </div>
        `;
        
        // Try to reload libraries after a delay
        setTimeout(() => {
            if (typeof QRCode !== 'undefined') {
                this.updatePreview();
            }
        }, 2000);
    }
    
    bindDesignGridEvents() {
        // Body Shape Grid
        const bodyGrid = document.getElementById('bodyShapeGrid');
        if (bodyGrid) {
            bodyGrid.addEventListener('click', (e) => {
                const option = e.target.closest('.design-option');
                if (option) {
                    // Remove active class from siblings
                    bodyGrid.querySelectorAll('.design-option').forEach(opt => opt.classList.remove('active'));
                    // Add active class to clicked option
                    option.classList.add('active');
                    // Update hidden input
                    document.getElementById('dotStyle').value = option.dataset.value;
                    this.updatePreview();
                }
            });
        }
        
        // Eye Frame Grid
        const eyeFrameGrid = document.getElementById('eyeFrameGrid');
        if (eyeFrameGrid) {
            eyeFrameGrid.addEventListener('click', (e) => {
                const option = e.target.closest('.design-option');
                if (option) {
                    eyeFrameGrid.querySelectorAll('.design-option').forEach(opt => opt.classList.remove('active'));
                    option.classList.add('active');
                    document.getElementById('cornerSquareStyle').value = option.dataset.value;
                    this.updatePreview();
                }
            });
        }
        
        // Eye Ball Grid
        const eyeBallGrid = document.getElementById('eyeBallGrid');
        if (eyeBallGrid) {
            eyeBallGrid.addEventListener('click', (e) => {
                const option = e.target.closest('.design-option');
                if (option) {
                    eyeBallGrid.querySelectorAll('.design-option').forEach(opt => opt.classList.remove('active'));
                    option.classList.add('active');
                    document.getElementById('cornerDotStyle').value = option.dataset.value;
                    this.updatePreview();
                }
            });
        }
    }
    
    // Get Content Based on Type
    getQRContent() {
        const contentType = document.getElementById('contentType').value;
        
        switch (contentType) {
            case 'text':
                return document.getElementById('qrContent')?.value || '';
                
            case 'url':
                return document.getElementById('qrContent')?.value || '';
                
            case 'email':
                const email = document.getElementById('qrContent')?.value || '';
                const subject = document.getElementById('emailSubject')?.value || '';
                const body = document.getElementById('emailBody')?.value || '';
                if (!email) return '';
                let mailto = `mailto:${email}`;
                const params = [];
                if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
                if (body) params.push(`body=${encodeURIComponent(body)}`);
                if (params.length > 0) mailto += '?' + params.join('&');
                return mailto;
                
            case 'phone':
                const phone = document.getElementById('qrContent')?.value || '';
                return phone ? `tel:${phone}` : '';
                
            case 'wifi':
                const ssid = document.getElementById('wifiSSID')?.value || '';
                const password = document.getElementById('wifiPassword')?.value || '';
                const security = document.getElementById('wifiSecurity')?.value || 'WPA';
                if (!ssid) return '';
                return `WIFI:T:${security};S:${ssid};P:${password};;`;
                
            case 'whatsapp':
                const waPhone = document.getElementById('whatsappPhone')?.value || '';
                const waMessage = document.getElementById('whatsappMessage')?.value || '';
                if (!waPhone) return '';
                const cleanPhone = waPhone.replace(/[^0-9]/g, '');
                let url = `https://wa.me/${cleanPhone}`;
                if (waMessage) url += `?text=${encodeURIComponent(waMessage)}`;
                return url;
                
            case 'vcard':
                const name = document.getElementById('vcardName')?.value || '';
                const org = document.getElementById('vcardOrg')?.value || '';
                const vcardPhone = document.getElementById('vcardPhone')?.value || '';
                const vcardEmail = document.getElementById('vcardEmail')?.value || '';
                const vcardUrl = document.getElementById('vcardUrl')?.value || '';
                
                if (!name) return '';
                
                let vcard = 'BEGIN:VCARD\\nVERSION:3.0\\n';
                vcard += `FN:${name}\\n`;
                if (org) vcard += `ORG:${org}\\n`;
                if (vcardPhone) vcard += `TEL:${vcardPhone}\\n`;
                if (vcardEmail) vcard += `EMAIL:${vcardEmail}\\n`;
                if (vcardUrl) vcard += `URL:${vcardUrl}\\n`;
                vcard += 'END:VCARD';
                
                return vcard;
                
            case 'vevent':
                const title = document.getElementById('eventTitle')?.value || '';
                const startDate = document.getElementById('eventStartDate')?.value || '';
                const startTime = document.getElementById('eventStartTime')?.value || '';
                const endDate = document.getElementById('eventEndDate')?.value || '';
                const endTime = document.getElementById('eventEndTime')?.value || '';
                const location = document.getElementById('eventLocation')?.value || '';
                const mapsUrl = document.getElementById('eventMapsUrl')?.value || '';
                const description = document.getElementById('eventDescription')?.value || '';
                const organizer = document.getElementById('eventOrganizer')?.value || '';
                
                if (!title || !startDate || !startTime) {
                    return '';
                }
                
                // Format dates for vEvent (YYYYMMDDTHHMMSS format)
                const formatDateTime = (date, time) => {
                    const dateTime = new Date(`${date}T${time}`);
                    return dateTime.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
                };
                
                const dtStart = formatDateTime(startDate, startTime);
                let dtEnd = '';
                
                if (endDate && endTime) {
                    dtEnd = formatDateTime(endDate, endTime);
                } else {
                    // Default to 1 hour after start time if no end time specified
                    const endDateTime = new Date(`${startDate}T${startTime}`);
                    endDateTime.setHours(endDateTime.getHours() + 1);
                    dtEnd = endDateTime.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
                }
                
                // Generate unique UID
                const uid = 'event-' + Date.now() + '@innoviqr.com';
                const timestamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
                
                let event = 'BEGIN:VCALENDAR\\nVERSION:2.0\\nPRODID:-//InnoviQR//QR Event Generator//EN\\n';
                event += 'BEGIN:VEVENT\\n';
                event += `UID:${uid}\\n`;
                event += `DTSTAMP:${timestamp}\\n`;
                event += `DTSTART:${dtStart}\\n`;
                event += `DTEND:${dtEnd}\\n`;
                event += `SUMMARY:${title}\\n`;
                
                if (location) {
                    event += `LOCATION:${location}\\n`;
                    if (mapsUrl) {
                        event += `URL:${mapsUrl}\\n`;
                    }
                }
                
                if (description) {
                    event += `DESCRIPTION:${description.replace(/\n/g, '\\\\n')}\\n`;
                }
                
                if (organizer) {
                    event += `ORGANIZER:mailto:${organizer}\\n`;
                }
                
                event += 'STATUS:CONFIRMED\\n';
                event += 'TRANSP:OPAQUE\\n';
                event += 'END:VEVENT\\n';
                event += 'END:VCALENDAR';
                
                return event;
                
            default:
                return '';
        }
    }
    
    // Size Management
    updateSize() {
        const size = document.getElementById('qrSize').value;
        document.getElementById('sizeValue').textContent = size + 'px';
        this.updatePreview();
    }
    
    // Color Management
    toggleGradient() {
        this.isGradientEnabled = !this.isGradientEnabled;
        const btn = document.getElementById('gradientToggle');
        const controls = document.getElementById('gradientControls');
        
        btn.classList.toggle('active', this.isGradientEnabled);
        controls.classList.toggle('hidden', !this.isGradientEnabled);
        
        this.updatePreview();
    }
    
    toggleTransparentBg() {
        this.isTransparentBg = !this.isTransparentBg;
        const btn = document.getElementById('transparentBg');
        
        btn.classList.toggle('active', this.isTransparentBg);
        btn.textContent = this.isTransparentBg ? 'Solid' : 'Transparent';
        
        this.updatePreview();
    }
    
    // Logo Management
    handleLogoUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            this.currentLogo = e.target.result;
            document.getElementById('logoSettings').classList.remove('hidden');
            this.updatePreview();
        };
        reader.readAsDataURL(file);
    }
    
    updateLogoSize() {
        const size = document.getElementById('logoSize').value;
        document.getElementById('logoSizeValue').textContent = Math.round(size * 100) + '%';
        this.updatePreview();
    }
    
    updateLogoMargin() {
        const margin = document.getElementById('logoMargin').value;
        document.getElementById('logoMarginValue').textContent = margin + 'px';
        this.updatePreview();
    }
    
    // QR Generation
    async updatePreview() {
        const content = this.getQRContent();
        const container = document.getElementById('qrCodeContainer');
        const info = document.getElementById('qrInfo');
        const downloadBtns = document.querySelectorAll('.download-btn');
        
        // Debug: Check if libraries are loaded
        console.log('QRious available:', typeof QRious !== 'undefined');
        console.log('QRCode available:', typeof QRCode !== 'undefined');
        console.log('QRCodeStyling available:', typeof QRCodeStyling !== 'undefined');
        console.log('Content:', content);
        
        // Clear container
        container.innerHTML = '';
        
        if (!content || content.trim() === '') {
            container.innerHTML = `
                <div class="qr-placeholder">
                    <div class="placeholder-icon">📱</div>
                    <p>Enter content to generate QR code</p>
                </div>
            `;
            info.textContent = 'Ready to generate';
            downloadBtns.forEach(btn => btn.disabled = true);
            return;
        }
        
        try {
            info.textContent = 'Generating...';
            
            // Check if QR libraries are available
            if (typeof QRious === 'undefined' && typeof QRCode === 'undefined') {
                throw new Error('QR libraries not loaded');
            }
            
            if (this.isAdvancedMode) {
                await this.generateAdvancedQR(content, container);
            } else {
                await this.generateBasicQR(content, container);
            }
            
            info.textContent = `QR Code generated (${content.length} characters)`;
            downloadBtns.forEach(btn => btn.disabled = false);
            
        } catch (error) {
            console.error('QR Generation Error:', error);
            container.innerHTML = `
                <div class="error-message">
                    <div style="color: #ff4757; padding: 1rem; text-align: center;">
                        ⚠️ Error: ${error.message}
                    </div>
                </div>
            `;
            info.textContent = 'Generation failed';
            downloadBtns.forEach(btn => btn.disabled = true);
        }
    }
    
    async generateBasicQR(content, container) {
        try {
            const canvas = document.createElement('canvas');
            const size = parseInt(document.getElementById('qrSize').value);
            const errorCorrection = document.getElementById('errorCorrection').value;
            
            // Validate content length
            if (content.length > 4000) {
                throw new Error('Content too long. Please reduce the text size.');
            }
            
            // Try QRious first, fallback to QRCode
            if (typeof QRious !== 'undefined') {
                const qr = new QRious({
                    element: canvas,
                    value: content,
                    size: size,
                    level: errorCorrection
                });
            } else {
                await QRCode.toCanvas(canvas, content, {
                    width: size,
                    margin: 2,
                    color: {
                        dark: '#000000',
                        light: '#ffffff'
                    },
                    errorCorrectionLevel: errorCorrection
                });
            }
            
            canvas.classList.add('qr-code-canvas');
            container.appendChild(canvas);
            this.currentQR = canvas;
        } catch (error) {
            throw new Error(`QR generation failed: ${error.message}`);
        }
    }
    
    async generateAdvancedQR(content, container) {
        const size = parseInt(document.getElementById('qrSize').value);
        const errorCorrection = document.getElementById('errorCorrection').value;
        
        // Get colors
        const qrColor1 = document.getElementById('qrColor').value;
        const qrColor2 = document.getElementById('qrColor2').value;
        const bgColor = document.getElementById('bgColor').value;
        const gradientType = document.getElementById('gradientType').value;
        
        // Get styles
        const dotStyle = document.getElementById('dotStyle').value;
        const cornerSquareStyle = document.getElementById('cornerSquareStyle').value;
        const cornerDotStyle = document.getElementById('cornerDotStyle').value;
        
        // Check if QRCodeStyling is available
        if (typeof QRCodeStyling === 'undefined') {
            console.warn('QRCodeStyling not loaded, falling back to basic QR');
            return this.generateBasicQR(content, container);
        }
        
        // Configure QR options
        const qrOptions = {
            width: size,
            height: size,
            type: 'canvas',
            data: content,
            margin: 10,
            qrOptions: {
                typeNumber: 0,
                mode: 'Byte',
                errorCorrectionLevel: errorCorrection
            },
            imageOptions: {
                hideBackgroundDots: true,
                imageSize: 0.4,
                margin: 5,
                crossOrigin: 'anonymous'
            },
            dotsOptions: {
                color: this.isGradientEnabled ? 
                    { type: gradientType, rotation: 0, colorStops: [{ offset: 0, color: qrColor1 }, { offset: 1, color: qrColor2 }] } : 
                    qrColor1,
                type: dotStyle
            },
            backgroundOptions: {
                color: this.isTransparentBg ? 'transparent' : bgColor
            },
            cornersSquareOptions: {
                color: qrColor1,
                type: cornerSquareStyle
            },
            cornersDotOptions: {
                color: qrColor1,
                type: cornerDotStyle
            }
        };
        
        // Add logo if available
        if (this.currentLogo) {
            const logoSize = parseFloat(document.getElementById('logoSize').value);
            const logoMargin = parseInt(document.getElementById('logoMargin').value);
            
            qrOptions.image = this.currentLogo;
            qrOptions.imageOptions.imageSize = logoSize;
            qrOptions.imageOptions.margin = logoMargin;
        }
        
        // Generate QR code
        const qrCodeStyling = new QRCodeStyling(qrOptions);
        
        const canvas = document.createElement('canvas');
        await qrCodeStyling.append(canvas);
        
        canvas.classList.add('qr-code-canvas');
        container.appendChild(canvas);
        this.currentQR = qrCodeStyling;
    }
    
    // Download Functions
    async downloadQR(format) {
        if (!this.currentQR) return;
        
        const downloadSize = parseInt(document.getElementById('downloadSize').value);
        const contentType = document.getElementById('contentType').value;
        
        try {
            switch (format) {
                case 'png':
                    await this.downloadPNG(downloadSize);
                    break;
                case 'svg':
                    await this.downloadSVG();
                    break;
                case 'pdf':
                    await this.downloadPDF(downloadSize);
                    break;
            }
            
            this.showMessage(`QR code downloaded as ${format.toUpperCase()}!`, 'success');
        } catch (error) {
            console.error('Download Error:', error);
            this.showMessage(`Failed to download: ${error.message}`, 'error');
        }
    }
    
    async downloadPNG(size) {
        let canvas;
        
        if (this.isAdvancedMode && this.currentQR instanceof QRCodeStyling) {
            // Create a temporary canvas with the desired size
            canvas = document.createElement('canvas');
            
            // Update QR code size for download
            const originalOptions = this.currentQR._options;
            this.currentQR.update({
                ...originalOptions,
                width: size,
                height: size
            });
            
            await this.currentQR.append(canvas);
        } else {
            // Basic QR - resize canvas
            canvas = this.currentQR;
            if (canvas.width !== size) {
                const tempCanvas = document.createElement('canvas');
                const ctx = tempCanvas.getContext('2d');
                tempCanvas.width = size;
                tempCanvas.height = size;
                ctx.drawImage(canvas, 0, 0, size, size);
                canvas = tempCanvas;
            }
        }
        
        // Download
        const link = document.createElement('a');
        link.download = `qr-code-${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    }
    
    async downloadSVG() {
        if (this.isAdvancedMode && this.currentQR instanceof QRCodeStyling) {
            const blob = await this.currentQR.getRawData('svg');
            const url = URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.download = `qr-code-${Date.now()}.svg`;
            link.href = url;
            link.click();
            
            URL.revokeObjectURL(url);
        } else {
            this.showMessage('SVG export only available in Advanced mode', 'error');
        }
    }
    
    async downloadPDF(size) {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF();
        
        let canvas;
        
        if (this.isAdvancedMode && this.currentQR instanceof QRCodeStyling) {
            canvas = document.createElement('canvas');
            
            const originalOptions = this.currentQR._options;
            this.currentQR.update({
                ...originalOptions,
                width: size,
                height: size
            });
            
            await this.currentQR.append(canvas);
        } else {
            canvas = this.currentQR;
        }
        
        const imgData = canvas.toDataURL('image/png');
        
        // Calculate dimensions to fit in PDF
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const qrSize = Math.min(pdfWidth - 40, pdfHeight - 40); // 20px margin on each side
        
        const x = (pdfWidth - qrSize) / 2;
        const y = (pdfHeight - qrSize) / 2;
        
        pdf.addImage(imgData, 'PNG', x, y, qrSize, qrSize);
        pdf.save(`qr-code-${Date.now()}.pdf`);
    }
    
    // Utility Functions
    showMessage(text, type = 'success') {
        // Remove existing message
        const existing = document.querySelector('.success-message, .error-message');
        if (existing) existing.remove();
        
        // Create new message
        const message = document.createElement('div');
        message.className = `${type}-message`;
        message.textContent = text;
        
        // Insert at top of preview panel
        const previewPanel = document.querySelector('.preview-panel');
        previewPanel.insertBefore(message, previewPanel.firstChild);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            if (message.parentNode) {
                message.remove();
            }
        }, 3000);
    }
}

// Initialize the QR Generator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new QRGenerator();
});

// Service Worker Registration for PWA support
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