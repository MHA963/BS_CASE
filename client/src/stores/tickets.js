import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useTicketStore = defineStore('tickets', () => {
  const tickets = ref([]);
  const selectedTicket = ref(null);
  const isLoading = ref(false);
  const error = ref(null);

  // Filter states
  const searchQuery = ref('');
  const statusFilter = ref('All');
  const partnerFilter = ref('All');
  const priorityFilter = ref('All');
  const viewMode = ref('kanban'); // 'kanban' or 'table'

  // Fetch tickets from API
  async function fetchTickets() {
    isLoading.value = true;
    error.value = null;
    try {
      const params = new URLSearchParams();
      if (statusFilter.value !== 'All') params.append('status', statusFilter.value);
      if (partnerFilter.value !== 'All') params.append('partner', partnerFilter.value);
      if (priorityFilter.value !== 'All') params.append('priority', priorityFilter.value);
      if (searchQuery.value) params.append('search', searchQuery.value);

      const res = await fetch(`/api/tickets?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        tickets.value = data.data;
      }
    } catch (err) {
      error.value = err.message || 'Failed to fetch tickets';
      console.error(err);
    } finally {
      isLoading.value = false;
    }
  }

  // Fetch single ticket details
  async function fetchTicketById(id) {
    isLoading.value = true;
    try {
      const res = await fetch(`/api/tickets/${id}`);
      const data = await res.json();
      if (data.success) {
        selectedTicket.value = data.data;
        return data.data;
      }
    } catch (err) {
      console.error(err);
    } finally {
      isLoading.value = false;
    }
  }

  // Create new ticket
  async function createTicket(ticketData) {
    isLoading.value = true;
    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ticketData)
      });
      const data = await res.json();
      if (data.success) {
        await fetchTickets();
        return data.data;
      }
    } catch (err) {
      console.error(err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  // Dispatch ticket to partner
  async function dispatchTicket(ticketId) {
    try {
      const res = await fetch(`/api/tickets/${ticketId}/dispatch`, {
        method: 'POST'
      });
      const data = await res.json();
      if (data.success) {
        await fetchTickets();
        return data.data;
      }
    } catch (err) {
      console.error(err);
    }
  }

  // Simulate Partner Retouch Completion
  async function simulatePartnerCompletion(ticketId, targetStatus = 'Awaiting Review') {
    try {
      const res = await fetch(`/api/partners/simulate/${ticketId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetStatus })
      });
      const data = await res.json();
      if (data.success) {
        await fetchTickets();
        return data.data;
      }
    } catch (err) {
      console.error(err);
    }
  }

  // Approve Photo in QC
  async function approvePhoto(payload) {
    try {
      const res = await fetch('/api/approvals/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        await fetchTickets();
        return data.data;
      }
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  // Reject Photo in QC
  async function rejectPhoto(payload) {
    try {
      const res = await fetch('/api/approvals/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        await fetchTickets();
        return data.data;
      }
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  // Reset database to initial case seeds
  async function resetToSeed() {
    try {
      const res = await fetch('/api/tickets/reset-seed', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        await fetchTickets();
      }
    } catch (err) {
      console.error(err);
    }
  }

  // Filtered tickets computed list
  const filteredTickets = computed(() => {
    return tickets.value.filter(t => {
      const matchesSearch = !searchQuery.value ||
        t.styleNumber.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        t.styleName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        t.id.toLowerCase().includes(searchQuery.value.toLowerCase());

      const matchesStatus = statusFilter.value === 'All' ||
        t.status.toLowerCase() === statusFilter.value.toLowerCase();

      const matchesPartner = partnerFilter.value === 'All' ||
        t.partner.toLowerCase() === partnerFilter.value.toLowerCase();

      const matchesPriority = priorityFilter.value === 'All' ||
        t.priority.toLowerCase() === priorityFilter.value.toLowerCase();

      return matchesSearch && matchesStatus && matchesPartner && matchesPriority;
    });
  });

  // Kanban column buckets
  const kanbanColumns = computed(() => {
    return {
      draftPending: filteredTickets.value.filter(t => t.status === 'Draft' || t.status === 'Pending' || t.status === 'Rejected'),
      sent: filteredTickets.value.filter(t => t.status === 'Sent'),
      inProgress: filteredTickets.value.filter(t => t.status === 'In Progress'),
      awaitingReview: filteredTickets.value.filter(t => t.status === 'Awaiting Review'),
      completed: filteredTickets.value.filter(t => t.status === 'Completed'),
      rejected: filteredTickets.value.filter(t => t.status === 'Rejected')
    };
  });

  return {
    tickets,
    selectedTicket,
    isLoading,
    error,
    searchQuery,
    statusFilter,
    partnerFilter,
    priorityFilter,
    viewMode,
    filteredTickets,
    kanbanColumns,
    fetchTickets,
    fetchTicketById,
    createTicket,
    dispatchTicket,
    simulatePartnerCompletion,
    approvePhoto,
    rejectPhoto,
    resetToSeed
  };
});
