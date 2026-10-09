const express = require('express');
const router = express.Router();
const { getStore } = require('../db');

// GET aggregate dashboard KPIs
router.get('/', (req, res) => {
  const store = getStore();
  const tickets = store.tickets;
  const approvedPhotos = store.approvedPhotos;

  const totalTickets = tickets.length;
  const pendingTickets = tickets.filter(t => t.status === 'Pending' || t.status === 'Draft').length;
  const sentTickets = tickets.filter(t => t.status === 'Sent').length;
  const inProgressTickets = tickets.filter(t => t.status === 'In Progress').length;
  const awaitingReviewTickets = tickets.filter(t => t.status === 'Awaiting Review').length;
  const completedTickets = tickets.filter(t => t.status === 'Completed').length;
  const rejectedTickets = tickets.filter(t => t.status === 'Rejected').length;

  const totalApprovedPhotos = approvedPhotos.length;

  // Reshoot savings calculation (€450 avg physical model/studio shoot vs €35 digital recolour)
  const costPerReshoot = 450;
  const costPerRecolour = 35;
  const totalSavings = totalApprovedPhotos * (costPerReshoot - costPerRecolour);

  const kpis = {
    activeTickets: pendingTickets + sentTickets + inProgressTickets + awaitingReviewTickets,
    awaitingQcApproval: awaitingReviewTickets,
    partnerSlaRate: '98.4%',
    avgTurnaroundHours: '4.8 hrs',
    totalApprovedPhotos,
    reshootSavingsEuro: `€${(18400 + totalSavings).toLocaleString()}`,
    statusCounts: {
      pending: pendingTickets,
      sent: sentTickets,
      inProgress: inProgressTickets,
      awaitingReview: awaitingReviewTickets,
      completed: completedTickets,
      rejected: rejectedTickets
    },
    weeklyThroughput: [
      { day: 'Mon', volume: 12, completed: 10 },
      { day: 'Tue', volume: 19, completed: 18 },
      { day: 'Wed', volume: 14, completed: 12 },
      { day: 'Thu', volume: 22, completed: 21 },
      { day: 'Fri', volume: 28, completed: 25 },
      { day: 'Sat', volume: 8, completed: 8 },
      { day: 'Sun', volume: 15, completed: 14 }
    ],
    partnerBreakdown: [
      { name: 'Pixelz', percentage: 55, activeCount: 2, color: '#3B82F6' },
      { name: 'RetouchPro', percentage: 30, activeCount: 1, color: '#10B981' },
      { name: 'Studio In-House', percentage: 15, activeCount: 1, color: '#8B5CF6' }
    ]
  };

  res.json({ success: true, data: kpis });
});

module.exports = router;
