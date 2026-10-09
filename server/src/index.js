const express = require('express');
const cors = require('cors');
const path = require('path');

const ticketsRouter = require('./routes/tickets');
const partnersRouter = require('./routes/partners');
const approvalsRouter = require('./routes/approvals');
const libraryRouter = require('./routes/library');
const kpisRouter = require('./routes/kpis');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static images from recolour-case
const recolourCasePath = path.join(__dirname, '../../recolour-case');
app.use('/api/assets/recolour-case', express.static(recolourCasePath));

// Also serve root logos if needed
const rootAssetsPath = path.join(__dirname, '../../');
app.use('/api/assets/brand', express.static(rootAssetsPath));

// API Routes
app.use('/api/tickets', ticketsRouter);
app.use('/api/partners', partnersRouter);
app.use('/api/approvals', approvalsRouter);
app.use('/api/library', libraryRouter);
app.use('/api/kpis', kpisRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'BESTSELLER Recolour Studio OS - API Server',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`🚀 BESTSELLER Recolour API Server listening on http://localhost:${PORT}`);
  console.log(`📁 Static assets served from: ${recolourCasePath}`);
});
