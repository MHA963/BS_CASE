import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useAuthStore = defineStore('auth', () => {
  // 'operator' (Studio Operator) or 'manager' (Production Manager / QC Lead)
  const currentRole = ref('manager');
  const currentUser = computed(() => {
    return currentRole.value === 'manager'
      ? { name: 'Sarah Lindqvist', title: 'Studio Production Manager', initials: 'SL', role: 'manager' }
      : { name: 'Jonas Møller', title: 'Digital Studio Operator', initials: 'JM', role: 'operator' };
  });

  const isManager = computed(() => currentRole.value === 'manager');
  const isOperator = computed(() => currentRole.value === 'operator');

  const canApprove = computed(() => isManager.value);
  const canCreateTickets = computed(() => true);
  const canDispatch = computed(() => true);

  function setRole(role) {
    if (role === 'operator' || role === 'manager') {
      currentRole.value = role;
    }
  }

  function toggleRole() {
    currentRole.value = currentRole.value === 'manager' ? 'operator' : 'manager';
  }

  return {
    currentRole,
    currentUser,
    isManager,
    isOperator,
    canApprove,
    canCreateTickets,
    canDispatch,
    setRole,
    toggleRole
  };
});
