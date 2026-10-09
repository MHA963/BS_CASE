<script setup>
defineProps({
  name: {
    type: String,
    required: true
  },
  hex: {
    type: String,
    default: '#334155'
  },
  type: {
    type: String,
    default: 'Solid' // 'Solid' or 'AOP'
  },
  pantone: {
    type: String,
    default: ''
  }
});
</script>

<template>
  <div class="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-white border border-slate-200 shadow-sm text-xs">
    <!-- Color Swatch Circle -->
    <span
      class="w-3.5 h-3.5 rounded-full border border-slate-300/80 shrink-0 shadow-inner"
      :style="{ backgroundColor: hex }"
    ></span>
    <span class="font-medium text-slate-800">{{ name }}</span>
    <span v-if="type === 'AOP'" class="text-[10px] font-semibold uppercase px-1 py-0.2 bg-purple-50 text-purple-700 rounded border border-purple-200">
      AOP
    </span>
  </div>
</template>
