<script setup>
import { computed } from 'vue';

const props = defineProps({
  priority: {
    type: String,
    default: 'Medium'
  }
});

const config = computed(() => {
  switch (props.priority?.toLowerCase()) {
    case 'high':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    case 'medium':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'low':
      return 'bg-slate-100 text-slate-600 border-slate-200';
    default:
      return 'bg-slate-100 text-slate-600 border-slate-200';
  }
});
</script>

<template>
  <span
    :class="[
      'inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider border',
      config
    ]"
  >
    {{ priority }}
  </span>
</template>
