const express = require('express');
const router = express.Router();
const { getStore, saveStore } = require('../db');
const { v4: uuidv4 } = require('uuid');

// POST Approve asset -> store in Approved Photos
router.post('/approve', (req, res) => {
  const store = getStore();
  const {
    ticketId,
    colorwayId,
    shotId,
    approvedBy
  } = req.body;

  const ticket = store.tickets.find(t => t.id === ticketId);
  if (!ticket) {
    return res.status(404).json({ success: false, message: 'Ticket not found' });
  }

  const colorway = ticket.colorways.find(c => c.id === colorwayId) || ticket.colorways[0];
  const shot = ticket.shots.find(s => s.id === shotId) || ticket.shots[0];

  const approvedAsset = {
    id: `APP-${500 + store.approvedPhotos.length + 1}`,
    ticketId: ticket.id,
    styleNumber: ticket.styleNumber,
    styleName: ticket.styleName,
    brand: ticket.brand,
    season: ticket.season,
    colorwayName: colorway.name,
    colorwayType: colorway.type,
    pantone: colorway.pantone,
    hex: colorway.hex,
    shotCode: shot.code,
    shotLabel: shot.label,
    originalFile: shot.filename,
    ticketFolder: shot.ticketFolder || 'Ticket 1',
    approvedAt: new Date().toISOString(),
    approvedBy: approvedBy || 'Production Manager',
    clippingPathVerified: true,
    partner: ticket.partner,
    resolution: '4200 x 5600 px',
    fileSize: '12.8 MB',
    downloadUrl: `/api/assets/recolour-case/${shot.ticketFolder || 'Ticket 1'}/${shot.filename}`
  };

  colorway.status = 'Approved';
  store.approvedPhotos.unshift(approvedAsset);

  // Check if all colorways are approved
  const allApproved = ticket.colorways.every(c => c.status === 'Approved');
  if (allApproved) {
    ticket.status = 'Completed';
  }

  ticket.history.push({
    timestamp: new Date().toISOString(),
    event: `Colorway "${colorway.name}" (${shot.code}) Approved & Committed to Library`,
    user: approvedBy || 'Production Manager'
  });

  saveStore(store);

  res.json({
    success: true,
    message: `Photo approved and stored in Approved Library!`,
    data: {
      approvedAsset,
      ticketStatus: ticket.status
    }
  });
});

// POST Reject asset -> return to queue with feedback
router.post('/reject', (req, res) => {
  const store = getStore();
  const {
    ticketId,
    colorwayId,
    reason,
    feedbackNotes,
    rejectedBy
  } = req.body;

  const ticket = store.tickets.find(t => t.id === ticketId);
  if (!ticket) {
    return res.status(404).json({ success: false, message: 'Ticket not found' });
  }

  const colorway = ticket.colorways.find(c => c.id === colorwayId) || ticket.colorways[0];
  colorway.status = 'Rejected';
  ticket.status = 'Rejected';

  ticket.history.push({
    timestamp: new Date().toISOString(),
    event: `QC Rejected by ${rejectedBy || 'Production Manager'}: [${reason || 'Clipping Path / Color Inaccuracy'}] - ${feedbackNotes || 'Please adjust tone and re-verify single clipping path.'}`,
    user: rejectedBy || 'Production Manager'
  });

  saveStore(store);

  res.json({
    success: true,
    message: `Asset rejected. Ticket returned to queue with feedback.`,
    data: ticket
  });
});

module.exports = router;
