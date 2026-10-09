<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { Sparkles, Scissors, Eye, Grid, Palette } from 'lucide-vue-next';

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
  }
});

const sliderPosition = ref(50); // 0 to 100
const isDragging = ref(false);
const zoomLevel = ref(1);
const containerRef = ref(null);

// Background / Mask Inspection Modes: 'white' | 'checkerboard' | 'magenta'
const maskMode = ref('white');

const canvasRef = ref(null);
const isRenderingCanvas = ref(false);

// Generate pixel-perfect recoloured garment on canvas
function renderRecolourCanvas() {
  if (!props.originalSrc) return;
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = props.originalSrc;

  img.onload = () => {
    const canvas = canvasRef.value;
    if (!canvas) return;
    canvas.width = img.naturalWidth || 1200;
    canvas.height = img.naturalHeight || 1600;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw base original image
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // Get pixel data
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;

    // Parse target hex color
    const targetHex = props.colorway.hex || '#8B263E';
    const targetR = parseInt(targetHex.slice(1, 3), 16);
    const targetG = parseInt(targetHex.slice(3, 5), 16);
    const targetB = parseInt(targetHex.slice(5, 7), 16);

    // Process garment pixels (preserve pure white/off-white background)
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];

      // Luminance check for studio background (threshold > 240 is background)
      const isBackground = r > 238 && g > 238 && b > 238;

      if (!isBackground && a > 20) {
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;
        const normalizedLum = lum / 255;

        // Realistic cloth shade tinting
        data[i] = Math.min(255, Math.floor(targetR * normalizedLum * 1.25));
        data[i + 1] = Math.min(255, Math.floor(targetG * normalizedLum * 1.25));
        data[i + 2] = Math.min(255, Math.floor(targetB * normalizedLum * 1.25));
      }
    }

    ctx.putImageData(imgData, 0, 0);
  };
}

watch([() => props.originalSrc, () => props.colorway], () => {
  renderRecolourCanvas();
}, { immediate: true });

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
  renderRecolourCanvas();
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
      :class="[
        'relative flex-1 w-full rounded-2xl overflow-hidden border border-slate-200 select-none cursor-ew-resize flex items-center justify-center min-h-[520px] transition-colors',
        maskMode === 'checkerboard' ? 'bg-[linear-gradient(45deg,#e2e8f0_25%,transparent_25%),linear-gradient(-45deg,#e2e8f0_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#e2e8f0_75%),linear-gradient(-45deg,transparent_75%,#e2e8f0_75%)] bg-[size:20px_20px] bg-[position:0_0,0_10px,10px_-10px,-10px_0px] bg-white' : maskMode === 'magenta' ? 'bg-[#FF00FF]' : 'bg-white'
      ]"
    >
      <!-- Base Layer: ORIGINAL IMAGE (Identical bounding geometry) -->
      <div
        class="absolute inset-0 flex items-center justify-center p-6 overflow-hidden transition-transform duration-150"
        :style="{ transform: `scale(${zoomLevel})` }"
      >
        <img
          :src="originalSrc"
          alt="Original Studio Photo"
          class="w-full h-full object-contain pointer-events-none"
        />
        <span class="absolute top-4 left-4 px-2.5 py-1 rounded bg-slate-900/90 text-white text-[10px] font-bold tracking-wider uppercase backdrop-blur-xs shadow-xs">
          Before (Original)
        </span>
      </div>

      <!-- Top Layer: RECOLOURED CANVAS (Exact 1:1 Pixel Superimposition) -->
      <div
        class="absolute inset-0 flex items-center justify-center p-6 overflow-hidden transition-transform duration-150"
        :style="{
          clipPath: `polygon(${sliderPosition}% 0, 100% 0, 100% 100%, ${sliderPosition}% 100%)`,
          transform: `scale(${zoomLevel})`
        }"
      >
        <canvas
          ref="canvasRef"
          class="w-full h-full object-contain pointer-events-none"
        ></canvas>

        <span class="absolute top-4 right-4 px-2.5 py-1 rounded bg-emerald-600/95 text-white text-[10px] font-bold tracking-wider uppercase backdrop-blur-xs flex items-center gap-1.5 shadow-sm">
          <Sparkles class="w-3 h-3" />
          After ({{ colorway.name }})
        </span>
      </div>

      <!-- Center Divider Line & Handle -->
      <div
        class="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_12px_rgba(0,0,0,0.5)] pointer-events-none z-20"
        :style="{ left: `${sliderPosition}%` }"
      >
        <div class="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white border-2 border-slate-900 shadow-md flex items-center justify-center text-slate-900">
          <div class="flex items-center gap-0.5 text-[9px] font-bold">
            <span>&#9664;</span>
            <span>&#9654;</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Studio Inspection Controls Bar -->
    <div class="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-white rounded-xl border border-slate-200 text-xs shadow-2xs">
      <!-- Zoom Controls -->
      <div class="flex items-center gap-2">
        <span class="text-slate-400 font-semibold text-[11px] uppercase tracking-wider">Zoom:</span>
        <div class="inline-flex rounded-lg bg-slate-100 p-0.5 text-xs font-semibold">
          <button
            @click="setZoom(1)"
            :class="['px-2.5 py-1 rounded-md transition-all', zoomLevel === 1 ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900']"
          >
            100%
          </button>
          <button
            @click="setZoom(1.5)"
            :class="['px-2.5 py-1 rounded-md transition-all', zoomLevel === 1.5 ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900']"
          >
            150%
          </button>
          <button
            @click="setZoom(2)"
            :class="['px-2.5 py-1 rounded-md transition-all', zoomLevel === 2 ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900']"
          >
            200%
          </button>
        </div>
      </div>

      <!-- Studio Mask & Background Modes (Requirement 2.4) -->
      <div class="flex items-center gap-2">
        <span class="text-slate-400 font-semibold text-[11px] uppercase tracking-wider">Canvas Background:</span>
        <div class="inline-flex rounded-lg bg-slate-100 p-0.5 text-xs font-semibold">
          <button
            @click="maskMode = 'white'"
            :class="['px-2.5 py-1 rounded-md transition-all flex items-center gap-1', maskMode === 'white' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900']"
            title="Clean Studio White"
          >
            <span class="w-2.5 h-2.5 rounded-full border border-slate-300 bg-white"></span>
            <span>Studio White</span>
          </button>
          <button
            @click="maskMode = 'checkerboard'"
            :class="['px-2.5 py-1 rounded-md transition-all flex items-center gap-1', maskMode === 'checkerboard' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900']"
            title="Show Transparency Grid"
          >
            <Grid class="w-3 h-3 text-slate-500" />
            <span>Transparency Grid</span>
          </button>
          <button
            @click="maskMode = 'magenta'"
            :class="['px-2.5 py-1 rounded-md transition-all flex items-center gap-1', maskMode === 'magenta' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900']"
            title="Magenta Clipping Path Mask Verification"
          >
            <span class="w-2.5 h-2.5 rounded-full bg-[#FF00FF]"></span>
            <span>Magenta Mask</span>
          </button>
        </div>
      </div>

      <div class="text-[11px] text-slate-400 font-medium">
        Drag slider &bull; Pixel-accurate superimposition
      </div>
    </div>
  </div>
</template>
