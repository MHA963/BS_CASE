const express = require('express');
const router = express.Router();
const { getStore, saveStore } = require('../db');

// GET all partners & operational metrics
router.get('/', (req, res) => {
  const store = getStore();
  res.json({ success: true, data: store.partners });
});

// POST simulate partner receiving & processing ticket
router.post('/simulate/:ticketId', (req, res) => {
  const store = getStore();
  const ticket = store.tickets.find(t => t.id === req.params.ticketId);
  if (!ticket) {
    return res.status(404).json({ success: false, message: 'Ticket not found' });
  }

  const { targetStatus } = req.body; // 'In Progress' or 'Awaiting Review'
  const nextStatus = targetStatus || 'Awaiting Review';

  ticket.status = nextStatus;
  if (nextStatus === 'Awaiting Review') {
    ticket.deliveredAt = new Date().toISOString();
    ticket.slaHours = 3.8;
    ticket.colorways.forEach(c => c.status = 'Ready for Review');
    ticket.history.push({
      timestamp: new Date().toISOString(),
      event: `Partner ${ticket.partner} completed digital recolour & delivered assets`,
      user: `${ticket.partner} Automated Webhook`
    });
  } else {
    ticket.history.push({
      timestamp: new Date().toISOString(),
      event: `Partner ${ticket.partner} started retouching queue`,
      user: `${ticket.partner} System`
    });
  }

  saveStore(store);
  res.json({ success: true, message: `Ticket status updated to ${nextStatus}`, data: ticket });
});

module.exports = router;
