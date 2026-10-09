import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useKpiStore = defineStore('kpis', () => {
  const kpis = ref({
    activeTickets: 4,
    awaitingQcApproval: 1,
    partnerSlaRate: '98.4%',
    avgTurnaroundHours: '4.8 hrs',
    totalApprovedPhotos: 2,
    reshootSavingsEuro: '€18,400',
    statusCounts: {
      pending: 1,
      sent: 1,
      inProgress: 1,
      awaitingReview: 1,
      completed: 0,
      rejected: 0
    },
    weeklyThroughput: [],
    partnerBreakdown: []
  });

  const isLoading = ref(false);

  async function fetchKpis() {
    isLoading.value = true;
    try {
      const res = await fetch('/api/kpis');
      const data = await res.json();
      if (data.success) {
        kpis.value = data.data;
      }
    } catch (err) {
      console.error('Failed to fetch KPIs:', err);
    } finally {
      isLoading.value = false;
    }
  }

  return {
    kpis,
    isLoading,
    fetchKpis
  };
});
