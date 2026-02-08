// mock-server.js - Professional Mock Backend
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

// Enhanced mock data
const mockData = {
    ration: [
        {
            applicationId: 'RAT2024001',
            name: 'Rajesh Kumar',
            category: 'General',
            family_members: 4,
            income: 25000,
            address: 'Mumbai',
            status: 'PENDING',
            created: '2024-01-15'
        },
        {
            applicationId: 'RAT2024002', 
            name: 'Priya Sharma',
            category: 'OBC',
            family_members: 3,
            income: 18000,
            address: 'Delhi',
            status: 'APPROVED',
            created: '2024-01-10'
        }
    ],
    scheme: [
        {
            applicationId: 'SCH2024001',
            name: 'Amit Singh',
            category: 'Farmer',
            state: 'UP',
            schemeType: 'PM-KISAN',
            status: 'PENDING'
        }
    ],
    scholar10: [
        {
            applicationId: 'SC10_2024001',
            name: 'Rahul Verma',
            school: 'DPS Delhi',
            marks: 92,
            status: 'PENDING'
        }
    ],
    scholar12: [
        {
            applicationId: 'SC12_2024001',
            name: 'Vikram Singh',
            college: 'St. Xavier',
            marks: 85,
            status: 'PENDING'
        }
    ]
};

// Routes matching your existing admin.js
app.get('/gov/ration', (req, res) => {
    console.log('📦 Serving ration data');
    res.json(mockData.ration);
});

app.get('/gov/scheme', (req, res) => {
    console.log('🏛️ Serving scheme data');
    res.json(mockData.scheme);
});

app.get('/gov/scholar10', (req, res) => {
    console.log('🎓 Serving scholar10 data');
    res.json(mockData.scholar10);
});

app.get('/gov/scholar12', (req, res) => {
    console.log('📚 Serving scholar12 data');
    res.json(mockData.scholar12);
});

// Update endpoint (for Approve/Reject buttons)
app.patch('/gov/application/:id', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    
    console.log(`🔄 Updating ${id} to ${status}`);
    
    // Update in all arrays
    Object.values(mockData).flat().forEach(app => {
        if (app.applicationId === id) {
            app.status = status;
        }
    });
    
    res.json({ 
        success: true, 
        message: `Updated ${id} to ${status}`,
        applicationId: id,
        status: status
    });
});

// Health endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK',
        service: 'Mock Backend',
        timestamp: new Date().toISOString(),
        endpoints: ['/gov/ration', '/gov/scheme', '/gov/scholar10', '/gov/scholar12']
    });
});

// Serve frontend files (optional - for direct access)
app.use(express.static(__dirname));

app.listen(PORT, () => {
    console.log(`
    ==========================================
    🚀 MOCK BACKEND RUNNING
    ==========================================
    📍 Local:  http://localhost:${PORT}
    📍 Network: http://YOUR_IP:${PORT}
    
    📊 ENDPOINTS:
    ------------
    🔗 http://localhost:${PORT}/gov/ration
    🔗 http://localhost:${PORT}/gov/scheme
    🔗 http://localhost:${PORT}/gov/scholar10
    🔗 http://localhost:${PORT}/gov/scholar12
    🔗 http://localhost:${PORT}/health
    
    🖥️  FRONTEND:
    ------------
    Using Live Server: http://127.0.0.1:5500/admin-login.html
    Direct access: http://localhost:${PORT}/admin-login.html
    
    🔑 LOGIN:
    ---------
    Username: admin
    Password: admin123
    
    ==========================================
    `);
});