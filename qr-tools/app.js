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
        this.isCustomEyeEnabled = false;
        
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
        
        // Initialize color system
        this.initializeColorSystem();
        
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
        
        // Advanced Color Controls with error checking
        const addColorListener = (id, selector, updatePreview = true) => {
            const element = document.getElementById(id);
            const codeElement = document.querySelector(selector);
            if (element && codeElement) {
                element.addEventListener('change', () => {
                    codeElement.textContent = element.value.toUpperCase();
                    if (updatePreview) this.updatePreview();
                });
            }
        };
        
        addColorListener('qrColor', '#singleColorControls .color-code');
        addColorListener('gradientColor1', '#gradientColorControls .color-code:first-of-type');
        addColorListener('gradientColor2', '#gradientColorControls .color-code:last-of-type');
        addColorListener('eyeSquareColor', '#customEyeControls .color-code:first-of-type');
        addColorListener('eyeDotColor', '#customEyeControls .color-code:last-of-type');
        
        if (document.getElementById('bgColor')) {
            document.getElementById('bgColor').addEventListener('change', () => {
                const codeElement = document.querySelector('#bgColor + .color-code');
                if (codeElement) {
                    codeElement.textContent = document.getElementById('bgColor').value.toUpperCase();
                }
                this.updatePreview();
            });
        }
        document.getElementById('gradientType').addEventListener('change', () => this.updatePreview());
        
        // Foreground Type Radio Buttons
        document.querySelectorAll('input[name="foregroundType"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.setForegroundType(e.target.value);
            });
        });
        
        // Gradient Rotation Control
        if (document.getElementById('gradientRotation')) {
            document.getElementById('gradientRotation').addEventListener('input', () => {
                const rotation = document.getElementById('gradientRotation').value;
                document.getElementById('rotationValue').textContent = rotation + '°';
                this.updatePreview();
            });
        }
        
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
    
    // Custom Styling Helpers
    applyGradientToCanvas(canvas, color1, color2, bgColor) {
        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // Create gradient
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, color1);
        gradient.addColorStop(1, color2);
        
        // Apply gradient to non-background pixels
        const color1RGB = this.hexToRgb(color1);
        const color2RGB = this.hexToRgb(color2);
        
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            // If it's not background color (assuming dark pixels are QR code)
            if (r < 128 && g < 128 && b < 128) {
                const progress = (i / 4) / (canvas.width * canvas.height);
                data[i] = Math.round(color1RGB.r + (color2RGB.r - color1RGB.r) * progress);
                data[i + 1] = Math.round(color1RGB.g + (color2RGB.g - color1RGB.g) * progress);
                data[i + 2] = Math.round(color1RGB.b + (color2RGB.b - color1RGB.b) * progress);
            }
        }
        
        ctx.putImageData(imageData, 0, 0);
    }
    
    applyDotStyling(canvas, dotStyle) {
        // This is a simplified version - for full implementation,
        // we would need to analyze and redraw the QR pattern
        console.log('Dot styling applied:', dotStyle);
    }
    
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }
    
    // Check if canvas has gradient colors applied
    checkCanvasForGradient(imageData, color1, color2) {
        const color1RGB = this.hexToRgb(color1);
        const color2RGB = this.hexToRgb(color2);
        
        if (!color1RGB || !color2RGB) return false;
        
        let hasColor1 = false;
        let hasColor2 = false;
        let intermediateColors = 0;
        
        for (let i = 0; i < imageData.data.length; i += 4) {
            const r = imageData.data[i];
            const g = imageData.data[i + 1];
            const b = imageData.data[i + 2];
            
            // Skip transparent/white pixels (background)
            if (r > 200 && g > 200 && b > 200) continue;
            
            // Check for color1 (within tolerance)
            if (Math.abs(r - color1RGB.r) < 30 && Math.abs(g - color1RGB.g) < 30 && Math.abs(b - color1RGB.b) < 30) {
                hasColor1 = true;
            }
            
            // Check for color2 (within tolerance)  
            if (Math.abs(r - color2RGB.r) < 30 && Math.abs(g - color2RGB.g) < 30 && Math.abs(b - color2RGB.b) < 30) {
                hasColor2 = true;
            }
            
            // Check for intermediate gradient colors
            if (!hasColor1 && !hasColor2) {
                const midR = (color1RGB.r + color2RGB.r) / 2;
                const midG = (color1RGB.g + color2RGB.g) / 2;
                const midB = (color1RGB.b + color2RGB.b) / 2;
                
                if (Math.abs(r - midR) < 30 && Math.abs(g - midG) < 30 && Math.abs(b - midB) < 30) {
                    intermediateColors++;
                }
            }
        }
        
        // Consider it a gradient if we found both colors OR multiple intermediate colors
        const hasGradient = (hasColor1 && hasColor2) || intermediateColors > 10;
        
        console.log('🔍 Gradient Detection Analysis:');
        console.log('- Found Color1:', hasColor1);
        console.log('- Found Color2:', hasColor2);
        console.log('- Intermediate Colors:', intermediateColors);
        console.log('- Has Gradient:', hasGradient);
        
        return hasGradient;
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
    
    // Initialize Color System
    initializeColorSystem() {
        // Set default color codes
        if (document.querySelector('#singleColorControls .color-code')) {
            document.querySelector('#singleColorControls .color-code').textContent = '#54BB7D';
        }
        if (document.querySelectorAll('#gradientColorControls .color-code')[0]) {
            document.querySelectorAll('#gradientColorControls .color-code')[0].textContent = '#54BB7D';
            document.querySelectorAll('#gradientColorControls .color-code')[1].textContent = '#0277BD';
        }
        if (document.querySelectorAll('#customEyeControls .color-code')[0]) {
            document.querySelectorAll('#customEyeControls .color-code')[0].textContent = '#000000';
            document.querySelectorAll('#customEyeControls .color-code')[1].textContent = '#000000';
        }
        if (document.querySelector('#bgColor').nextElementSibling) {
            document.querySelector('#bgColor').nextElementSibling.textContent = '#FFFFFF';
        }
        
        // Set initial foreground type
        this.setForegroundType('single');
    }
    
    // Foreground Type Management
    setForegroundType(type) {
        // Hide all color control groups
        document.getElementById('singleColorControls').classList.add('hidden');
        document.getElementById('gradientColorControls').classList.add('hidden');
        document.getElementById('customEyeControls').classList.add('hidden');
        
        // Show the selected control group
        switch(type) {
            case 'single':
                document.getElementById('singleColorControls').classList.remove('hidden');
                this.isGradientEnabled = false;
                this.isCustomEyeEnabled = false;
                break;
            case 'gradient':
                document.getElementById('gradientColorControls').classList.remove('hidden');
                this.isGradientEnabled = true;
                this.isCustomEyeEnabled = false;
                break;
            case 'custom-eye':
                document.getElementById('customEyeControls').classList.remove('hidden');
                this.isGradientEnabled = false;
                this.isCustomEyeEnabled = true;
                break;
        }
        
        this.updatePreview();
    }
    
    // Color Preset Management
    applyColorPreset(color1, color2) {
        // Set gradient mode
        document.querySelector('input[name="foregroundType"][value="gradient"]').checked = true;
        this.setForegroundType('gradient');
        
        // Set colors
        document.getElementById('gradientColor1').value = color1;
        document.getElementById('gradientColor2').value = color2;
        
        // Update color codes
        document.querySelectorAll('#gradientColorControls .color-code')[0].textContent = color1.toUpperCase();
        document.querySelectorAll('#gradientColorControls .color-code')[1].textContent = color2.toUpperCase();
        
        this.updatePreview();
    }
    
    // Logo Management
    handleLogoUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        console.log('🖼️ Logo Upload Started:');
        console.log('- File Name:', file.name);
        console.log('- File Size:', file.size, 'bytes');
        console.log('- File Type:', file.type);
        
        const reader = new FileReader();
        reader.onload = (e) => {
            this.currentLogo = e.target.result;
            document.getElementById('logoSettings').classList.remove('hidden');
            console.log('🖼️ Logo Loaded Successfully');
            console.log('- Data URL Length:', this.currentLogo.length);
            console.log('- Data URL Preview:', this.currentLogo.substring(0, 100) + '...');
            this.updatePreview();
        };
        reader.onerror = (error) => {
            console.error('❌ Logo Upload Failed:', error);
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
        try {
            const size = parseInt(document.getElementById('qrSize').value);
            const errorCorrection = document.getElementById('errorCorrection').value;
            
            // Get current foreground type
            const foregroundType = document.querySelector('input[name="foregroundType"]:checked').value;
            const bgColor = document.getElementById('bgColor').value;
            const gradientType = document.getElementById('gradientType').value;
            
            // Configure colors based on foreground type
            let qrColor1, qrColor2, cornerSquareColor, cornerDotColor;
            
            switch(foregroundType) {
                case 'single':
                    qrColor1 = document.getElementById('qrColor').value;
                    qrColor2 = qrColor1;
                    cornerSquareColor = qrColor1;
                    cornerDotColor = qrColor1;
                    break;
                    
                case 'gradient':
                    qrColor1 = document.getElementById('gradientColor1').value;
                    qrColor2 = document.getElementById('gradientColor2').value;
                    cornerSquareColor = qrColor1;
                    cornerDotColor = qrColor1;
                    break;
                    
                case 'custom-eye':
                    qrColor1 = document.getElementById('qrColor').value;
                    qrColor2 = qrColor1;
                    cornerSquareColor = document.getElementById('eyeSquareColor').value;
                    cornerDotColor = document.getElementById('eyeDotColor').value;
                    break;
            }
            
            // Get styles
            const dotStyle = document.getElementById('dotStyle')?.value || 'square';
            const cornerSquareStyle = document.getElementById('cornerSquareStyle')?.value || 'square';
            const cornerDotStyle = document.getElementById('cornerDotStyle')?.value || 'dot';
            
            // Try QRCodeStyling first, fallback to custom styling
            if (typeof QRCodeStyling !== 'undefined') {
                return this.generateQRCodeStyling(content, container, size, errorCorrection, qrColor1, qrColor2, bgColor, gradientType, dotStyle, cornerSquareStyle, cornerDotStyle, cornerSquareColor, cornerDotColor, foregroundType);
            } else {
                console.warn('QRCodeStyling not available, using custom advanced QR');
                return this.generateCustomAdvancedQR(content, container, size, errorCorrection, qrColor1, qrColor2, bgColor, dotStyle);
            }
        } catch (error) {
            console.error('Advanced QR generation failed:', error);
            // Fallback to basic QR
            return this.generateBasicQR(content, container);
        }
    }
    
    async generateQRCodeStyling(content, container, size, errorCorrection, qrColor1, qrColor2, bgColor, gradientType, dotStyle, cornerSquareStyle, cornerDotStyle, cornerSquareColor, cornerDotColor, foregroundType) {
        // Configure colors based on foreground type
        let dotsColor = qrColor1;
        
        if (foregroundType === 'gradient') {
            // QRCodeStyling gradient format - ensure proper structure
            dotsColor = {
                type: gradientType || 'linear',
                rotation: gradientType === 'linear' ? Math.PI / 4 : 0,
                colorStops: [
                    { offset: 0, color: qrColor1 },
                    { offset: 1, color: qrColor2 }
                ]
            };
            
            console.log('🎨 Gradient Configuration Details:');
            console.log('- Type:', gradientType);
            console.log('- Color 1:', qrColor1);
            console.log('- Color 2:', qrColor2);
            console.log('- Rotation:', dotsColor.rotation);
            console.log('- Color Stops:', dotsColor.colorStops);
        }
        
        // Map shape values to QRCodeStyling format
        const shapeMapping = {
            'square': 'square',
            'dots': 'dots', 
            'rounded': 'rounded',
            'extra-rounded': 'extra-rounded',
            'classy': 'classy',
            'classy-rounded': 'classy-rounded',
            'diamond': 'square', // QRCodeStyling doesn't have diamond, fallback to square
            'star': 'dots', // QRCodeStyling doesn't have star, fallback to dots
            'heart': 'rounded', // QRCodeStyling doesn't have heart, fallback to rounded
            'flower': 'classy' // QRCodeStyling doesn't have flower, fallback to classy
        };
        
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
            dotsOptions: {
                color: dotsColor,
                type: shapeMapping[dotStyle] || 'square'
            },
            backgroundOptions: {
                color: this.isTransparentBg ? 'transparent' : bgColor
            },
            cornersSquareOptions: {
                color: cornerSquareColor,
                type: shapeMapping[cornerSquareStyle] || 'square'
            },
            cornersDotOptions: {
                color: cornerDotColor,
                type: shapeMapping[cornerDotStyle] || 'dot'
            }
        };

        // Add logo if available
        if (this.currentLogo) {
            const logoSize = parseFloat(document.getElementById('logoSize')?.value || '0.3');
            const logoMargin = parseInt(document.getElementById('logoMargin')?.value || '5');
            
            qrOptions.image = this.currentLogo;
            qrOptions.imageOptions = {
                hideBackgroundDots: true,
                imageSize: logoSize,
                margin: logoMargin,
                crossOrigin: 'anonymous',
                saveAsBlob: false
            };
            
            console.log('🖼️ Logo Configuration:');
            console.log('- Logo Size:', logoSize);
            console.log('- Logo Margin:', logoMargin);
            console.log('- Logo URL:', this.currentLogo.substring(0, 50) + '...');
        }

        // Debug QR options
        console.log('🎨 QRCodeStyling Configuration:');
        console.log('- Foreground Type:', foregroundType);
        console.log('- Dots Color:', dotsColor);
        console.log('- Corner Square Color:', cornerSquareColor);
        console.log('- Corner Dot Color:', cornerDotColor);
        console.log('- Background Color:', bgColor);
        console.log('- Full Options:', qrOptions);
        
        // Create QRCodeStyling instance
        const qrCode = new QRCodeStyling(qrOptions);
        
        // If gradient is not working, try to update after creation with proper format
        if (foregroundType === 'gradient' && typeof dotsColor === 'object') {
            console.log('🔄 Attempting to apply gradient after QR creation...');
            
            // Ensure gradient has proper QRCodeStyling format
            const properGradient = {
                type: gradientType === 'radial' ? 'radial' : 'linear',
                rotation: gradientType === 'linear' ? Math.PI / 4 : 0,
                colorStops: [
                    { offset: 0, color: qrColor1 },
                    { offset: 1, color: qrColor2 }
                ]
            };
            
            // Try updating the QR code with corrected gradient
            qrCode.update({
                dotsOptions: {
                    color: properGradient,
                    type: shapeMapping[dotStyle] || 'square'
                }
            });
        }
        
        // QRCodeStyling creates its own canvas element
        await qrCode.append(container);
        
        // Get the generated canvas element
        const canvas = container.querySelector('canvas');
        if (canvas) {
            canvas.classList.add('qr-code-canvas');
            console.log('✅ QR Canvas generated successfully');
            
            // Check if gradient was applied correctly by checking canvas colors
            if (foregroundType === 'gradient') {
                setTimeout(() => {
                    const ctx = canvas.getContext('2d');
                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    const hasGradient = this.checkCanvasForGradient(imageData, qrColor1, qrColor2);
                    
                    if (!hasGradient) {
                        console.log('⚠️ Gradient not detected, applying manual gradient...');
                        this.applyGradientToCanvas(canvas, qrColor1, qrColor2, bgColor, gradientType);
                    } else {
                        console.log('✅ Gradient successfully applied by QRCodeStyling');
                    }
                }, 100);
            }
        } else {
            console.error('❌ QR Canvas not found after generation');
        }
        
        this.currentQR = qrCode;
    }
    
    async generateCustomAdvancedQR(content, container, size, errorCorrection, qrColor1, qrColor2, bgColor, dotStyle) {
        // Create base QR code with QRious
        const canvas = document.createElement('canvas');
        
        if (typeof QRious !== 'undefined') {
            // Generate base QR with custom colors
            const qr = new QRious({
                element: canvas,
                value: content,
                size: size,
                level: errorCorrection,
                foreground: qrColor1,
                background: this.isTransparentBg ? 'transparent' : bgColor
            });
            
            // Apply additional styling if gradient is enabled
            if (this.isGradientEnabled) {
                this.applyGradientToCanvas(canvas, qrColor1, qrColor2, bgColor);
            }
            
        } else {
            // Final fallback to simple QRCode
            await QRCode.toCanvas(canvas, content, {
                width: size,
                margin: 2,
                color: {
                    dark: qrColor1,
                    light: this.isTransparentBg ? '#00000000' : bgColor
                },
                errorCorrectionLevel: errorCorrection
            });
        }
        
        canvas.classList.add('qr-code-canvas');
        container.appendChild(canvas);
        this.currentQR = canvas;
    }

    // Custom Styling Helpers
    applyGradientToCanvas(canvas, color1, color2, bgColor, gradientType = 'linear') {
        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // Create gradient colors
        const color1RGB = this.hexToRgb(color1);
        const color2RGB = this.hexToRgb(color2);
        
        if (!color1RGB || !color2RGB) return;
        
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY);
        
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            // If it's not background color (assuming dark pixels are QR code)
            if (r < 128 && g < 128 && b < 128) {
                const x = (i / 4) % canvas.width;
                const y = Math.floor((i / 4) / canvas.width);
                
                let progress;
                if (gradientType === 'radial') {
                    // Radial gradient from center
                    const distance = Math.sqrt((x - centerX) * (x - centerX) + (y - centerY) * (y - centerY));
                    progress = Math.min(distance / maxDistance, 1);
                } else {
                    // Linear gradient (left to right)
                    progress = x / canvas.width;
                }
                
                data[i] = Math.round(color1RGB.r + (color2RGB.r - color1RGB.r) * progress);
                data[i + 1] = Math.round(color1RGB.g + (color2RGB.g - color1RGB.g) * progress);
                data[i + 2] = Math.round(color1RGB.b + (color2RGB.b - color1RGB.b) * progress);
            }
        }
        
        ctx.putImageData(imageData, 0, 0);
    }
    
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
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
            // Create a temporary container for the download
            const tempContainer = document.createElement('div');
            tempContainer.style.position = 'absolute';
            tempContainer.style.left = '-9999px';
            document.body.appendChild(tempContainer);
            
            // Update QR code size for download
            const originalOptions = this.currentQR._options;
            const downloadQR = new QRCodeStyling({
                ...originalOptions,
                width: size,
                height: size
            });
            
            await downloadQR.append(tempContainer);
            canvas = tempContainer.querySelector('canvas');
            
            // Clean up temp container after getting canvas
            document.body.removeChild(tempContainer);
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
            // Create a temporary container for PDF generation
            const tempContainer = document.createElement('div');
            tempContainer.style.position = 'absolute';
            tempContainer.style.left = '-9999px';
            document.body.appendChild(tempContainer);
            
            const originalOptions = this.currentQR._options;
            const pdfQR = new QRCodeStyling({
                ...originalOptions,
                width: size,
                height: size
            });
            
            await pdfQR.append(tempContainer);
            canvas = tempContainer.querySelector('canvas');
            
            // Clean up temp container
            document.body.removeChild(tempContainer);
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
let qrGen; // Global reference for inline event handlers
document.addEventListener('DOMContentLoaded', () => {
    qrGen = new QRGenerator();
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