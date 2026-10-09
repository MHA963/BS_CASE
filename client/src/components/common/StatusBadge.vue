<script setup>
import { computed } from 'vue';

const props = defineProps({
  status: {
    type: String,
    required: true
  },
  size: {
    type: String,
    default: 'sm' // 'xs', 'sm', 'md'
  }
});

const config = computed(() => {
  switch (props.status?.toLowerCase()) {
    case 'pending':
    case 'draft':
      return {
        bg: 'bg-slate-100 text-slate-700 border-slate-200',
        dot: 'bg-slate-400',
        label: props.status
      };
    case 'sent':
      return {
        bg: 'bg-blue-50 text-blue-700 border-blue-200',
        dot: 'bg-blue-500 animate-pulse',
        label: 'Sent to Partner'
      };
    case 'in progress':
      return {
        bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        dot: 'bg-indigo-500 animate-pulse',
        label: 'In Progress'
      };
    case 'awaiting review':
      return {
        bg: 'bg-amber-50 text-amber-800 border-amber-300 font-semibold',
        dot: 'bg-amber-500',
        label: 'Awaiting QC'
      };
    case 'completed':
    case 'approved':
      return {
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        dot: 'bg-emerald-500',
        label: 'Completed'
      };
    case 'rejected':
      return {
        bg: 'bg-rose-50 text-rose-700 border-rose-200',
        dot: 'bg-rose-500',
        label: 'Rejected'
      };
    default:
      return {
        bg: 'bg-slate-100 text-slate-700 border-slate-200',
        dot: 'bg-slate-400',
        label: props.status
      };
  }
});

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'xs': return 'text-[10px] px-1.5 py-0.5';
    case 'md': return 'text-xs px-2.5 py-1';
    default: return 'text-[11px] px-2 py-0.5';
  }
});
</script>

<template>
  <span
    :class="[
      'inline-flex items-center gap-1.5 rounded-full border font-medium transition-colors',
      config.bg,
      sizeClasses
    ]"
  >
    <span :class="['w-1.5 h-1.5 rounded-full shrink-0', config.dot]"></span>
    <span>{{ config.label }}</span>
  </span>
</template>
