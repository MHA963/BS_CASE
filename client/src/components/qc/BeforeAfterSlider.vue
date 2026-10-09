<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { ZoomIn, ZoomOut, Maximize2, Sparkles, Scissors } from 'lucide-vue-next';

const props = defineProps({
  originalSrc: {
    type: String,
    required: true
  },
  colorway: {
    type: Object,
    default: () => ({ name: 'Granita', hex: '#8B263E', type: 'Solid' })
  },
  patternSrc: {
    type: String,
    default: null
  },
  showClippingOverlay: {
    type: Boolean,
    default: true
  }
});

const sliderPosition = ref(50); // percentage 0 to 100
const isDragging = ref(false);
const zoomLevel = ref(1); // 1, 1.5, 2
const containerRef = ref(null);

function startDragging(e) {
  isDragging.value = true;
  updatePosition(e);
}

function stopDragging() {
  isDragging.value = false;
}

function onMouseMove(e) {
  if (!isDragging.value) return;
  updatePosition(e);
}

function updatePosition(e) {
  if (!containerRef.value) return;
  const rect = containerRef.value.getBoundingClientRect();
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const x = clientX - rect.left;
  let pos = (x / rect.width) * 100;
  if (pos < 0) pos = 0;
  if (pos > 100) pos = 100;
  sliderPosition.value = pos;
}

function setZoom(level) {
  zoomLevel.value = level;
}

onMounted(() => {
  window.addEventListener('mouseup', stopDragging);
  window.addEventListener('touchend', stopDragging);
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('touchmove', onMouseMove);
});

onUnmounted(() => {
  window.removeEventListener('mouseup', stopDragging);
  window.removeEventListener('touchend', stopDragging);
  window.removeEventListener('mousemove', onMouseMove);
  window.removeEventListener('touchmove', onMouseMove);
});
</script>

<template>
  <div class="flex flex-col h-full space-y-3">
    <!-- Canvas Area -->
    <div
      ref="containerRef"
      @mousedown="startDragging"
      @touchstart="startDragging"
      class="relative flex-1 w-full bg-slate-100 rounded-xl overflow-hidden border border-slate-200 select-none cursor-ew-resize flex items-center justify-center min-h-[480px]"
    >
      <!-- Base Layer: ORIGINAL IMAGE -->
      <div
        class="absolute inset-0 flex items-center justify-center overflow-hidden transition-transform duration-100"
        :style="{ transform: `scale(${zoomLevel})` }"
      >
        <img
          :src="originalSrc"
          alt="Original Studio Photo"
          class="max-h-[92%] max-w-[92%] object-contain pointer-events-none drop-shadow-md"
        />
        <span class="absolute top-4 left-4 px-2.5 py-1 rounded bg-slate-900/80 text-white text-[11px] font-bold tracking-wider uppercase backdrop-blur-sm">
          Before (Original)
        </span>
      </div>

      <!-- Top Layer: RECOLOURED IMAGE (Clipped by Slider) -->
      <div
        class="absolute inset-0 flex items-center justify-center overflow-hidden transition-transform duration-100"
        :style="{
          clipPath: `polygon(${sliderPosition}% 0, 100% 0, 100% 100%, ${sliderPosition}% 100%)`,
          transform: `scale(${zoomLevel})`
        }"
      >
        <!-- Recoloured rendering preview using color blend / tint simulation -->
        <div class="relative max-h-[92%] max-w-[92%] flex items-center justify-center">
          <img
            :src="originalSrc"
            alt="Recoloured Garment Preview"
            class="max-h-full max-w-full object-contain pointer-events-none drop-shadow-md"
            :style="{
              filter: `sepia(0.3) saturate(1.8) hue-rotate(${colorway.type === 'Solid' ? '290deg' : '330deg'}) contrast(1.05)`
            }"
          />
          <!-- Color Tint Overlay for high realism -->
          <div
            class="absolute inset-0 mix-blend-color opacity-70 pointer-events-none rounded"
            :style="{ backgroundColor: colorway.hex || '#8B263E' }"
          ></div>
        </div>

        <span class="absolute top-4 right-4 px-2.5 py-1 rounded bg-emerald-600/90 text-white text-[11px] font-bold tracking-wider uppercase backdrop-blur-sm flex items-center gap-1.5 shadow-sm">
          <Sparkles class="w-3 h-3" />
          After ({{ colorway.name }})
        </span>
      </div>

      <!-- Clipping Path Verification Box Outline Overlay -->
      <div
        v-if="showClippingOverlay"
        class="absolute inset-8 border border-dashed border-cyan-400/70 rounded-lg pointer-events-none flex items-start justify-end p-2"
      >
        <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-cyan-900/80 text-cyan-200 text-[10px] font-semibold backdrop-blur-sm">
          <Scissors class="w-3 h-3" />
          1 Clipping Path Verified
        </span>
      </div>

      <!-- Center Divider Line & Handle -->
      <div
        class="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_10px_rgba(0,0,0,0.4)] pointer-events-none z-10"
        :style="{ left: `${sliderPosition}%` }"
      >
        <!-- Handle button -->
        <div class="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white border-2 border-slate-900 shadow-lg flex items-center justify-center text-slate-900">
          <div class="flex items-center gap-0.5 text-[10px] font-bold">
            <span>&#9664;</span>
            <span>&#9654;</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Zoom & Inspection Toolbar -->
    <div class="flex items-center justify-between px-3 py-2 bg-white rounded-lg border border-slate-200 text-xs">
      <div class="flex items-center gap-2">
        <span class="text-slate-500 font-medium">Zoom Level:</span>
        <button
          @click="setZoom(1)"
          :class="['px-2 py-1 rounded font-semibold', zoomLevel === 1 ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200']"
        >
          100%
        </button>
        <button
          @click="setZoom(1.5)"
          :class="['px-2 py-1 rounded font-semibold', zoomLevel === 1.5 ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200']"
        >
          150%
        </button>
        <button
          @click="setZoom(2)"
          :class="['px-2 py-1 rounded font-semibold', zoomLevel === 2 ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200']"
        >
          200%
        </button>
      </div>

      <div class="flex items-center gap-3 text-slate-500 text-[11px]">
        <span>Drag slider to compare pixel alignment & color fidelity</span>
      </div>
    </div>
  </div>
</template>
