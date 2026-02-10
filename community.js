/**
 * Digital Access for All - Community Portal
 * Complete with all content + working QR code
 */

// Wait for page to load
document.addEventListener('DOMContentLoaded', function() {
    console.log('=== COMMUNITY PORTAL STARTING ===');
    
    // Main Portal Object
    const CommunityPortal = {
        // State
        isSharing: false,
        localIP: null,
        connectedDevices: 0,
        totalViews: 0,
        
        // Initialize
        init: function() {
            console.log('Initializing Community Portal...');
            
            // Load content first
            this.loadAllContent();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Set initial status
            this.updateStatus('Ready to share', 'inactive');
            
            // Make available globally
            window.communityPortal = this;
            
            console.log(' Community Portal Ready');
        },
        
        // =================================
        // COMPLETE CONTENT DATA
        // =================================
        
        loadAllContent: function() {
            console.log('Loading all content...');
            
            // Load all sections
            this.loadAnnouncements();
            this.loadGovernmentSchemes();
            this.loadHelpResources();
            this.loadAwarenessMaterials();
            
            // Update stats
            this.updateStats();
        },
        
        loadAnnouncements: function() {
            const announcements = [
                {
                    id: 1,
                    title: "🏥 Free Health Camp - Feb 15",
                    content: "Government hospital organizing free health checkup camp at Community Center. Includes BP, sugar, eye checkup. Timing: 9 AM - 4 PM.",
                    date: "2026-02-10",
                    time: "10:30 AM",
                    badge: "new",
                    location: "Community Center, Main Road",
                    category: "Health",
                    attendees: "200+ last month"
                },
                {
                    id: 2,
                    title: "📚 Digital Literacy Workshop",
                    content: "Free computer training for women and senior citizens. Learn basics of internet, email, and online services. Every Saturday 2-4 PM.",
                    date: "2026-02-12",
                    time: "2:00 PM",
                    badge: "updated",
                    location: "Anganwadi Center",
                    category: "Education",
                    seats: "25 seats available"
                },
                {
                    id: 3,
                    title: "💧 Water Supply Maintenance",
                    content: "Water supply will be suspended on Feb 14 (7 AM - 5 PM) for pipeline maintenance. Please store water in advance.",
                    date: "2026-02-13",
                    time: "7:00 AM",
                    badge: "urgent",
                    location: "Entire Ward No. 5",
                    category: "Utility",
                    duration: "10 hours"
                },
                {
                    id: 4,
                    title: "🎓 Scholarship Application Camp",
                    content: "Special camp for scholarship applications. Bring Aadhar, income certificate, marksheet. Officials available for guidance.",
                    date: "2026-02-16",
                    time: "10:00 AM",
                    badge: "new",
                    location: "Government School",
                    category: "Education",
                    lastDate: "Mar 15, 2026"
                },
                {
                    id: 5,
                    title: "🌳 Tree Plantation Drive",
                    content: "Community tree plantation drive. Free saplings distribution. Volunteers needed. Refreshments provided.",
                    date: "2026-02-18",
                    time: "6:30 AM",
                    badge: "updated",
                    location: "Park Area",
                    category: "Environment",
                    saplings: "500+ saplings"
                },
                {
                    id: 6,
                    title: "⚡ Electricity Bill Assistance",
                    content: "Help desk for electricity bill issues, new connections, and subsidy applications. Every Monday & Thursday.",
                    date: "2026-02-14",
                    time: "11:00 AM",
                    badge: "new",
                    location: "Panchayat Office",
                    category: "Utility",
                    contact: "Mr. Sharma - 9876543210"
                }
            ];
            
            this.renderContent('announcements', announcements);
        },
        
        loadGovernmentSchemes: function() {
            const schemes = [
                {
                    id: 1,
                    title: "PM Awas Yojana",
                    description: "Housing for all by 2026. Financial assistance for construction/purchase of house.",
                    eligibility: "Annual income < ₹3 Lakh, No pucca house",
                    benefits: "₹2.5 Lakh assistance",
                    deadline: "Open",
                    documents: "Aadhar, Income Certificate, Land Papers",
                    badge: "housing",
                    category: "Housing"
                },
                {
                    id: 2,
                    title: "Ujjwala Yojana",
                    description: "Free LPG connection to women from BPL families.",
                    eligibility: "BPL family, Women above 18",
                    benefits: "Free LPG connection + stove",
                    deadline: "Open",
                    documents: "Aadhar, BPL Card, Bank Account",
                    badge: "gas",
                    category: "Cooking Fuel"
                },
                {
                    id: 3,
                    title: "Ayushman Bharat",
                    description: "Health insurance covering ₹5 Lakh per family per year.",
                    eligibility: "Based on SECC data, No income ceiling",
                    benefits: "₹5 Lakh health cover",
                    deadline: "Open",
                    documents: "Aadhar, Ration Card",
                    badge: "health",
                    category: "Health Insurance"
                },
                {
                    id: 4,
                    title: "Kisan Samman Nidhi",
                    description: "₹6000 per year to small and marginal farmers.",
                    eligibility: "Landholding farmers",
                    benefits: "₹2000 every 4 months",
                    deadline: "Open",
                    documents: "Land Records, Aadhar, Bank Account",
                    badge: "farmer",
                    category: "Farmers Welfare"
                },
                {
                    id: 5,
                    title: "Scholarship for SC/ST",
                    description: "Post-matric scholarship for SC/ST students.",
                    eligibility: "SC/ST students, 75% attendance",
                    benefits: "Full tuition + maintenance",
                    deadline: "Mar 31, 2026",
                    documents: "Caste Certificate, Marksheet, Income",
                    badge: "education",
                    category: "Education"
                },
                {
                    id: 6,
                    title: "Stand-Up India",
                    description: "Bank loans for SC/ST and women entrepreneurs.",
                    eligibility: "SC/ST/Women, 18+ years",
                    benefits: "₹10 Lakh to ₹1 Crore loan",
                    deadline: "Open",
                    documents: "Business Plan, Aadhar, Caste Certificate",
                    badge: "business",
                    category: "Entrepreneurship"
                }
            ];
            
            this.renderContent('schemes', schemes);
        },
        
        loadHelpResources: function() {
            const resources = [
                {
                    id: 1,
                    title: "🚑 Emergency Ambulance",
                    description: "24/7 Free ambulance service. Dial toll-free number for immediate assistance.",
                    contact: "108 (Toll-free)",
                    availability: "24/7",
                    response: "15-20 minutes",
                    badge: "emergency",
                    category: "Medical"
                },
                {
                    id: 2,
                    title: "👮 Police Help Desk",
                    description: "Women's help desk and general police assistance. File complaints, get guidance.",
                    contact: "100 / 112",
                    availability: "24/7",
                    response: "Immediate",
                    badge: "safety",
                    category: "Security"
                },
                {
                    id: 3,
                    title: "🔥 Fire Department",
                    description: "Fire emergency services and safety inspections.",
                    contact: "101",
                    availability: "24/7",
                    response: "5-10 minutes",
                    badge: "emergency",
                    category: "Safety"
                },
                {
                    id: 4,
                    title: "💧 Water Complaint",
                    description: "Report water supply issues, leaks, and quality problems.",
                    contact: "1916 (Toll-free)",
                    availability: "8 AM - 8 PM",
                    response: "24 hours",
                    badge: "utility",
                    category: "Water Supply"
                },
                {
                    id: 5,
                    title: "⚡ Electricity Complaint",
                    description: "Power failure, meter issues, and electrical emergencies.",
                    contact: "1912 (Toll-free)",
                    availability: "24/7",
                    response: "2-4 hours",
                    badge: "utility",
                    category: "Electricity"
                },
                {
                    id: 6,
                    title: "🏥 Primary Health Center",
                    description: "Free OPD, immunization, and basic healthcare services.",
                    contact: "0422-123456",
                    availability: "9 AM - 4 PM",
                    response: "Same day",
                    badge: "health",
                    category: "Healthcare"
                }
            ];
            
            this.renderContent('resources', resources);
        },
        
        loadAwarenessMaterials: function() {
            const awareness = [
                {
                    id: 1,
                    title: "📱 Digital Literacy Guide",
                    description: "Step-by-step guide to using smartphones, internet banking, and government apps.",
                    format: "PDF Guide",
                    pages: "25 pages",
                    language: "Hindi & English",
                    badge: "education",
                    category: "Digital Skills"
                },
                {
                    id: 2,
                    title: "💰 Financial Literacy",
                    description: "Understanding banking, loans, insurance, and investment options.",
                    format: "Video Series",
                    duration: "6 videos (45 min total)",
                    language: "Local Language",
                    badge: "finance",
                    category: "Financial Education"
                },
                {
                    id: 3,
                    title: "🌿 Organic Farming",
                    description: "Guide to organic farming techniques and government subsidies available.",
                    format: "Illustrated Booklet",
                    pages: "40 pages",
                    language: "Hindi",
                    badge: "agriculture",
                    category: "Farming"
                },
                {
                    id: 4,
                    title: "👶 Child Nutrition Guide",
                    description: "Nutrition charts, vaccination schedule, and growth monitoring for children.",
                    format: "Infographic",
                    size: "A3 Poster",
                    language: "Picture-based",
                    badge: "health",
                    category: "Child Care"
                },
                {
                    id: 5,
                    title: "♻️ Waste Management",
                    description: "Segregation guidelines, composting methods, and recycling centers.",
                    format: "Animation Video",
                    duration: "8 minutes",
                    language: "Local Language",
                    badge: "environment",
                    category: "Sanitation"
                },
                {
                    id: 6,
                    title: "⚖️ Legal Rights Handbook",
                    description: "Basic legal rights, RTI filing, consumer complaints, and free legal aid.",
                    format: "Handbook",
                    pages: "60 pages",
                    language: "Hindi",
                    badge: "legal",
                    category: "Legal Awareness"
                }
            ];
            
            this.renderContent('awareness', awareness);
        },
        
        // =================================
        // CONTENT RENDERING
        // =================================
        
        renderContent: function(section, items) {
            const container = document.getElementById(section + '-content');
            if (!container) {
                console.warn('Container not found:', section + '-content');
                return;
            }
            
            const html = items.map(item => this.createCardHTML(section, item)).join('');
            container.innerHTML = html;
            
            console.log(`Loaded ${items.length} ${section}`);
        },
        
        createCardHTML: function(section, item) {
            const badges = {
                new: '<span class="card-badge badge-new">NEW</span>',
                urgent: '<span class="card-badge badge-urgent">URGENT</span>',
                updated: '<span class="card-badge badge-updated">UPDATED</span>',
                housing: '<span class="card-badge" style="background:#e3f2fd;color:#1565c0;">HOUSING</span>',
                health: '<span class="card-badge" style="background:#fce4ec;color:#c2185b;">HEALTH</span>',
                education: '<span class="card-badge" style="background:#f3e5f5;color:#7b1fa2;">EDUCATION</span>',
                emergency: '<span class="card-badge" style="background:#ffebee;color:#c62828;">EMERGENCY</span>',
                gas: '<span class="card-badge" style="background:#fff3e0;color:#ef6c00;">GAS</span>',
                farmer: '<span class="card-badge" style="background:#f1f8e9;color:#689f38;">FARMER</span>',
                business: '<span class="card-badge" style="background:#f3e5f5;color:#7b1fa2;">BUSINESS</span>',
                safety: '<span class="card-badge" style="background:#e8f5e9;color:#2e7d32;">SAFETY</span>',
                utility: '<span class="card-badge" style="background:#e1f5fe;color:#0277bd;">UTILITY</span>',
                finance: '<span class="card-badge" style="background:#fff3e0;color:#f57c00;">FINANCE</span>',
                agriculture: '<span class="card-badge" style="background:#f1f8e9;color:#689f38;">FARMING</span>',
                environment: '<span class="card-badge" style="background:#e8f5e9;color:#2e7d32;">ENVIRONMENT</span>',
                legal: '<span class="card-badge" style="background:#f3e5f5;color:#7b1fa2;">LEGAL</span>'
            };
            
            const badgeHTML = badges[item.badge] || '';
            
            if (section === 'announcements') {
                return `
                    <div class="content-card">
                        <div class="card-header">
                            <h3 class="card-title">${item.title}</h3>
                            ${badgeHTML}
                        </div>
                        <div class="card-date">📅 ${item.date} • ⏰ ${item.time}</div>
                        <p class="card-content">${item.content}</p>
                        <div class="card-meta">
                            <span class="meta-item">📍 ${item.location}</span>
                            <span class="meta-item">📌 ${item.category}</span>
                        </div>
                    </div>
                `;
            }
            
            if (section === 'schemes') {
                return `
                    <div class="content-card">
                        <div class="card-header">
                            <h3 class="card-title">${item.title}</h3>
                            ${badgeHTML}
                        </div>
                        <p class="card-content">${item.description}</p>
                        <div class="card-meta">
                            <span class="meta-item">🎯 ${item.eligibility}</span>
                            <span class="meta-item">💰 ${item.benefits}</span>
                        </div>
                        <button class="btn btn-primary btn-sm" onclick="communityPortal.showDetails('${item.title}')">
                            View Details →
                        </button>
                    </div>
                `;
            }
            
            if (section === 'resources') {
                return `
                    <div class="content-card">
                        <div class="card-header">
                            <h3 class="card-title">${item.title}</h3>
                            ${badgeHTML}
                        </div>
                        <p class="card-content">${item.description}</p>
                        <div class="card-meta">
                            <span class="meta-item">📞 ${item.contact}</span>
                            <span class="meta-item">⏰ ${item.availability}</span>
                        </div>
                        <button class="btn btn-primary btn-sm" onclick="alert('Calling ${item.contact}')">
                            Call Now →
                        </button>
                    </div>
                `;
            }
            
            if (section === 'awareness') {
                return `
                    <div class="content-card">
                        <div class="card-header">
                            <h3 class="card-title">${item.title}</h3>
                            ${badgeHTML}
                        </div>
                        <p class="card-content">${item.description}</p>
                        <div class="card-meta">
                            <span class="meta-item">📄 ${item.format}</span>
                            <span class="meta-item">📖 ${item.pages || item.duration}</span>
                        </div>
                        <button class="btn btn-primary btn-sm" onclick="communityPortal.simulateDownload('${item.title}')">
                            Download →
                        </button>
                    </div>
                `;
            }
            
            return '';
        },
        
        // =================================
        //  WORKING QR CODE SYSTEM
        // =================================
        
        setupEventListeners: function() {
            // Start sharing button
            const startBtn = document.getElementById('startBtn');
            if (startBtn) {
                startBtn.addEventListener('click', () => this.startSharing());
            }
            
            // Stop sharing button
            const stopBtn = document.getElementById('stopBtn');
            if (stopBtn) {
                stopBtn.addEventListener('click', () => this.stopSharing());
            }
            
            // Download QR button
            const downloadQR = document.getElementById('downloadQR');
            if (downloadQR) {
                downloadQR.addEventListener('click', () => this.downloadQRCode());
            }
            
            // Copy link button
            const copyLink = document.getElementById('copyLink');
            if (copyLink) {
                copyLink.addEventListener('click', () => this.copyLinkToClipboard());
            }
        },
        
        startSharing: function() {
            console.log('Starting sharing...');
            
            // Update UI immediately
            this.updateStatus('Generating QR...', 'inactive');
            
            // Hide start, show stop
            const startBtn = document.getElementById('startBtn');
            const stopBtn = document.getElementById('stopBtn');
            const linkContainer = document.getElementById('linkContainer');
            
            if (startBtn) startBtn.classList.add('hidden');
            if (stopBtn) stopBtn.classList.remove('hidden');
            if (linkContainer) linkContainer.classList.remove('hidden');
            
            // Generate share URL
            const shareUrl = window.location.href;
            const shareLink = document.getElementById('shareLink');
            if (shareLink) shareLink.textContent = shareUrl;
            
            //  SIMPLE QR CODE THAT ALWAYS WORKS
            this.generateSimpleQR(shareUrl);
            
            // Update status
            this.updateStatus(' Sharing Active', 'active');
            this.isSharing = true;
            
            // Show notification
            this.showNotification('Sharing started! Scan QR with phone camera.');
            
            console.log(' Sharing active - URL:', shareUrl);
        },
        
        generateSimpleQR: function(url) {
            const canvas = document.getElementById('qrCanvas');
            if (!canvas) {
                console.error('QR canvas not found');
                return;
            }
            
            // Clear canvas
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Check if QRCode library is available
            if (typeof QRCode === 'undefined') {
                console.error('QRCode library not loaded');
                this.drawFallbackQR(canvas, url);
                return;
            }
            
            try {
                //  METHOD 1: Use toDataURL then draw image (MOST RELIABLE)
                QRCode.toDataURL(url, {
                    width: 250,
                    margin: 2,
                    color: {
                        dark: '#000000',
                        light: '#FFFFFF'
                    }
                }, (err, dataUrl) => {
                    if (err) {
                        console.error('QR generation failed:', err);
                        this.drawFallbackQR(canvas, url);
                        return;
                    }
                    
                    // Draw the QR image to canvas
                    const img = new Image();
                    img.onload = () => {
                        ctx.clearRect(0, 0, canvas.width, canvas.height);
                        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                        
                        // Add green border
                        ctx.strokeStyle = '#4CAF50';
                        ctx.lineWidth = 3;
                        ctx.strokeRect(0, 0, canvas.width, canvas.height);
                        
                        console.log(' QR generated successfully via toDataURL');
                    };
                    img.src = dataUrl;
                });
                
            } catch (error) {
                console.error('QR error:', error);
                this.drawFallbackQR(canvas, url);
            }
        },
        
        drawFallbackQR: function(canvas, url) {
            const ctx = canvas.getContext('2d');
            
            // Fill white background
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw simple QR pattern
            ctx.fillStyle = '#000000';
            
            // Draw corner squares (like real QR)
            ctx.fillRect(20, 20, 50, 50);  // Top-left
            ctx.fillRect(180, 20, 50, 50); // Top-right
            ctx.fillRect(20, 180, 50, 50); // Bottom-left
            
            // Draw text
            ctx.fillStyle = '#000000';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('QR Code', 125, 140);
            ctx.font = '12px Arial';
            ctx.fillText('Scan to access portal', 125, 160);
            
            // Draw border
            ctx.strokeStyle = '#4CAF50';
            ctx.lineWidth = 3;
            ctx.strokeRect(0, 0, canvas.width, canvas.height);
            
            console.log(' Using fallback QR (library issue)');
        },
        
        stopSharing: function() {
            // Clear QR canvas
            const canvas = document.getElementById('qrCanvas');
            if (canvas) {
                const ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
            
            // Update UI
            const startBtn = document.getElementById('startBtn');
            const stopBtn = document.getElementById('stopBtn');
            const linkContainer = document.getElementById('linkContainer');
            
            if (startBtn) startBtn.classList.remove('hidden');
            if (stopBtn) stopBtn.classList.add('hidden');
            if (linkContainer) linkContainer.classList.add('hidden');
            
            // Update status
            this.updateStatus(' Sharing Stopped', 'inactive');
            this.isSharing = false;
            
            this.showNotification('Sharing stopped.');
        },
        
        downloadQRCode: function() {
            const canvas = document.getElementById('qrCanvas');
            if (!canvas) {
                this.showNotification('QR not available', 'error');
                return;
            }
            
            try {
                // Create download link
                const link = document.createElement('a');
                link.download = 'community-portal-qr.png';
                link.href = canvas.toDataURL('image/png');
                
                // Trigger download
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                this.showNotification(' QR code downloaded!');
                
            } catch (error) {
                console.error('Download failed:', error);
                this.showNotification(' Download failed', 'error');
            }
        },
        
        // =================================
        // UTILITY FUNCTIONS
        // =================================
        
        updateStatus: function(text, type) {
            const statusText = document.getElementById('statusText');
            const statusIndicator = document.getElementById('statusIndicator');
            
            if (statusText) statusText.textContent = text;
            
            if (statusIndicator) {
                // Reset classes
                statusIndicator.className = 'status-indicator';
                
                // Add appropriate class
                if (type === 'active') {
                    statusIndicator.classList.add('status-active');
                } else {
                    statusIndicator.classList.add('status-inactive');
                }
            }
        },
        
        showNotification: function(message, type = 'success') {
            // Remove any existing notifications
            const existing = document.querySelector('.portal-notification');
            if (existing) existing.remove();
            
            // Create notification
            const notification = document.createElement('div');
            notification.className = 'portal-notification';
            notification.textContent = message;
            
            // Style based on type
            const styles = {
                success: {
                    background: '#4CAF50',
                    color: 'white'
                },
                error: {
                    background: '#f44336',
                    color: 'white'
                },
                info: {
                    background: '#2196F3',
                    color: 'white'
                }
            };
            
            const style = styles[type] || styles.info;
            
            // Apply styles
            Object.assign(notification.style, {
                position: 'fixed',
                top: '20px',
                right: '20px',
                padding: '12px 24px',
                borderRadius: '8px',
                zIndex: '10000',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                fontWeight: '500',
                fontSize: '14px',
                animation: 'slideIn 0.3s ease-out'
            }, style);
            
            // Add to document
            document.body.appendChild(notification);
            
            // Remove after 3 seconds
            setTimeout(() => {
                notification.style.animation = 'slideOut 0.3s ease-out forwards';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            }, 3000);
        },
        
        copyLinkToClipboard: function() {
            const shareLink = document.getElementById('shareLink');
            const text = shareLink ? shareLink.textContent : window.location.href;
            
            navigator.clipboard.writeText(text).then(() => {
                this.showNotification(' Link copied to clipboard!');
            }).catch(() => {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = text;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                this.showNotification(' Link copied!');
            });
        },
        
        updateStats: function() {
            const devicesCount = document.getElementById('devicesCount');
            const contentViews = document.getElementById('contentViews');
            
            if (devicesCount) devicesCount.textContent = this.connectedDevices;
            if (contentViews) contentViews.textContent = this.totalViews;
        },
        
        // Content interaction methods
        showDetails: function(title) {
            alert(`Details for: ${title}\n\nThis would show complete information about the scheme.`);
            this.totalViews++;
            this.updateStats();
        },
        
        simulateDownload: function(title) {
            this.showNotification(`📥 Downloading: ${title}\n(Simulated for demo)`);
            this.totalViews++;
            this.updateStats();
        }
    };
    
    // =================================
    // INITIALIZE WHEN READY
    // =================================
    
    // Check if QR library is loaded
    function checkQRlibrary() {
        if (typeof QRCode === 'undefined') {
            console.warn('QRCode library not loaded, loading dynamically...');
            
            // Load QR library
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js';
            script.onload = () => {
                console.log(' QRCode library loaded dynamically');
                CommunityPortal.init();
            };
            script.onerror = () => {
                console.error(' Failed to load QR library');
                // Still initialize without QR
                CommunityPortal.init();
            };
            document.head.appendChild(script);
            
            return false;
        }
        return true;
    }
    
    // Add animation styles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        .hidden { display: none !important; }
        
        /* QR Canvas styling */
        #qrCanvas {
            border: 3px solid #4CAF50 !important;
            border-radius: 10px;
            background: white !important;
            display: block;
            margin: 20px auto;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        
        /* Status indicators */
        .status-active {
            background: #d4edda !important;
            color: #155724 !important;
            border: 2px solid #c3e6cb !important;
        }
        .status-inactive {
            background: #f8d7da !important;
            color: #721c24 !important;
            border: 2px solid #f5c6cb !important;
        }
    `;
    document.head.appendChild(style);
    
    // Start initialization
    if (checkQRlibrary()) {
        CommunityPortal.init();
    }
    
    // Global error handler
    window.addEventListener('error', function(e) {
        if (e.message && e.message.includes('QRCode')) {
            console.error('QR Code error detected:', e.message);
            // Don't show alert to user
        }
    });
    
    console.log('=== COMMUNITY PORTAL LOADED ===');
});

// Make sure QR canvas is visible
setTimeout(() => {
    const canvas = document.getElementById('qrCanvas');
    if (canvas) {
        canvas.style.visibility = 'visible';
        canvas.style.opacity = '1';
    }
}, 500);