const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { getStore, saveStore, initialSeed } = require('../db');
const { v4: uuidv4 } = require('uuid');

// Configure Multer storage for uploaded reference swatches
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `pattern-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 } // 25MB limit
});

// POST upload pattern reference file
router.post('/upload', upload.single('patternFile'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }

  const fileData = {
    filename: req.file.filename,
    originalName: req.file.originalname,
    name: req.body.patternName || req.file.originalname.replace(/\.[^/.]+$/, ''),
    size: (req.file.size / (1024 * 1024)).toFixed(2) + ' MB',
    mimetype: req.file.mimetype,
    url: `/api/assets/uploads/${req.file.filename}`,
    isUploaded: true
  };

  res.json({
    success: true,
    message: 'Pattern reference file uploaded successfully',
    data: fileData
  });
});

// GET all tickets (with filters)
router.get('/', (req, res) => {
  const { status, partner, priority, search } = req.query;
  const store = getStore();
  let tickets = [...store.tickets];

  if (status && status !== 'All') {
    tickets = tickets.filter(t => t.status.toLowerCase() === status.toLowerCase());
  }

  if (partner && partner !== 'All') {
    tickets = tickets.filter(t => t.partner.toLowerCase() === partner.toLowerCase());
  }

  if (priority && priority !== 'All') {
    tickets = tickets.filter(t => t.priority.toLowerCase() === priority.toLowerCase());
  }

  if (search) {
    const q = search.toLowerCase();
    tickets = tickets.filter(t =>
      t.styleNumber.toLowerCase().includes(q) ||
      t.styleName.toLowerCase().includes(q) ||
      t.id.toLowerCase().includes(q) ||
      t.brand.toLowerCase().includes(q)
    );
  }

  res.json({ success: true, count: tickets.length, data: tickets });
});

// GET single ticket by ID
router.get('/:id', (req, res) => {
  const store = getStore();
  const ticket = store.tickets.find(t => t.id === req.params.id || t.ticketNumber === req.params.id);
  if (!ticket) {
    return res.status(404).json({ success: false, message: 'Ticket not found' });
  }
  res.json({ success: true, data: ticket });
});

// POST create new ticket
router.post('/', (req, res) => {
  const store = getStore();
  const {
    styleNumber,
    styleName,
    brand,
    season,
    priority,
    partner,
    clippingPath,
    guidelineNotes,
    colorways,
    shots,
    patternAttachment,
    dispatchImmediately
  } = req.body;

  if (!styleNumber) {
    return res.status(400).json({ success: false, message: 'Style Number is required' });
  }

  const nextTicketNum = (store.tickets.length + 1).toString();
  const newTicket = {
    id: `TCK-${1000 + store.tickets.length + 1}`,
    ticketNumber: nextTicketNum,
    styleNumber: styleNumber || '15377000',
    styleName: styleName || 'New Season Garment',
    brand: brand || 'SELECTED HOMME',
    season: season || 'AW26',
    priority: priority || 'Medium',
    partner: partner || 'Pixelz',
    status: dispatchImmediately ? 'Sent' : 'Pending',
    clippingPath: clippingPath !== undefined ? clippingPath : true,
    clippingPathCount: 1,
    guidelineNotes: guidelineNotes || 'Keep 1 clipping path for all pictures.',
    shots: shots && shots.length > 0 ? shots : [
      { id: uuidv4(), code: '_001', label: 'Front Angle', filename: '15377489_5081878_001.jpg', ticketFolder: 'Ticket 1' },
      { id: uuidv4(), code: '_002', label: 'Back Angle', filename: '15377489_5081878_002.jpg', ticketFolder: 'Ticket 1' },
      { id: uuidv4(), code: '_007', label: 'Detail Angle', filename: '15377489_5081878_007.jpg', ticketFolder: 'Ticket 1' }
    ],
    patternAttachment: patternAttachment || null,
    colorways: colorways && colorways.length > 0 ? colorways : [
      { id: uuidv4(), name: 'Granita', type: 'Solid', pantone: 'PANTONE 18-1649 TCX', hex: '#8B263E', status: 'Pending' }
    ],
    createdAt: new Date().toISOString(),
    sentAt: dispatchImmediately ? new Date().toISOString() : null,
    deliveredAt: null,
    slaHours: null,
    history: [
      { timestamp: new Date().toISOString(), event: 'Ticket Created', user: 'Studio Operator' },
      ...(patternAttachment ? [{ timestamp: new Date().toISOString(), event: `Attached AOP Swatch Reference: ${patternAttachment.name || patternAttachment.filename}`, user: 'Studio Operator' }] : []),
      ...(dispatchImmediately ? [{ timestamp: new Date().toISOString(), event: `Dispatched to ${partner || 'Pixelz'} API with reference payloads`, user: 'Studio Operator' }] : [])
    ]
  };

  store.tickets.unshift(newTicket);
  saveStore(store);

  res.status(201).json({ success: true, message: 'Ticket created successfully', data: newTicket });
});

// POST dispatch ticket to partner
router.post('/:id/dispatch', (req, res) => {
  const store = getStore();
  const ticketIndex = store.tickets.findIndex(t => t.id === req.params.id);
  if (ticketIndex === -1) {
    return res.status(404).json({ success: false, message: 'Ticket not found' });
  }

  const ticket = store.tickets[ticketIndex];
  ticket.status = 'Sent';
  ticket.sentAt = new Date().toISOString();
  ticket.history.push({
    timestamp: new Date().toISOString(),
    event: `Dispatched to ${ticket.partner} API with high-res shots and reference attachments`,
    user: 'Studio Operator'
  });

  saveStore(store);
  res.json({ success: true, message: `Ticket ${ticket.id} dispatched to ${ticket.partner}`, data: ticket });
});

// POST Reset store to initial seed
router.post('/reset-seed', (req, res) => {
  saveStore(initialSeed);
  res.json({ success: true, message: 'Database reset to initial case seeds (Tickets 1-4)', data: initialSeed });
});

module.exports = router;
