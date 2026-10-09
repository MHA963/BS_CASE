<script setup>
import { ref, onMounted } from 'vue';
import ColorSwatchChip from '../components/common/ColorSwatchChip.vue';
import {
  Download,
  FolderDown,
  CheckCircle,
  Scissors,
  Search,
  Filter,
  Layers,
  Sparkles,
  ExternalLink
} from 'lucide-vue-next';

const assets = ref([]);
const isLoading = ref(false);
const searchQuery = ref('');
const selectedBrand = ref('All');
const selectedSeason = ref('All');

const brands = ['All', 'SELECTED HOMME', 'VERO MODA', 'JACK & JONES', 'ONLY'];
const seasons = ['All', 'AW26', 'SS26'];

async function fetchLibrary() {
  isLoading.value = true;
  try {
    const params = new URLSearchParams();
    if (selectedBrand.value !== 'All') params.append('brand', selectedBrand.value);
    if (selectedSeason.value !== 'All') params.append('season', selectedSeason.value);
    if (searchQuery.value) params.append('search', searchQuery.value);

    const res = await fetch(`/api/library?${params.toString()}`);
    const data = await res.json();
    if (data.success) {
      assets.value = data.data;
    }
  } catch (err) {
    console.error('Failed to fetch library:', err);
  } finally {
    isLoading.value = false;
  }
}

function handleBatchExport() {
  alert(`Exporting ${assets.value.length} approved studio assets as ZIP archive with color profiles & clipping paths.`);
}

function downloadSingle(asset) {
  const link = document.createElement('a');
  link.href = asset.downloadUrl;
  link.download = `${asset.styleNumber}_${asset.colorwayName.replace(/\s+/g, '_')}_${asset.shotCode}.jpg`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

onMounted(async () => {
  await fetchLibrary();
});
</script>

<template>
  <div class="space-y-6 pb-12">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-xl font-bold text-slate-900">Approved Digital Asset Library</h1>
        <p class="text-xs text-slate-500">
          Production-ready product imagery with verified clipping paths and approved Pantone colorways.
        </p>
      </div>

      <button
        @click="handleBatchExport"
        class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm transition-colors"
      >
        <FolderDown class="w-4 h-4" />
        <span>Batch Export All (ZIP)</span>
      </button>
    </div>

    <!-- Filter Bar -->
    <div class="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
      <div class="flex flex-wrap items-center gap-3">
        <!-- Search -->
        <div class="relative w-64">
          <Search class="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            v-model="searchQuery"
            @input="fetchLibrary"
            type="text"
            placeholder="Filter by style # or color..."
            class="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs focus:bg-white focus:outline-none"
          />
        </div>

        <!-- Brand Filter -->
        <div class="flex items-center gap-1.5">
          <span class="text-slate-400 font-medium">Brand:</span>
          <select
            v-model="selectedBrand"
            @change="fetchLibrary"
            class="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 font-medium text-xs focus:bg-white focus:outline-none"
          >
            <option v-for="b in brands" :key="b" :value="b">{{ b }}</option>
          </select>
        </div>

        <!-- Season Filter -->
        <div class="flex items-center gap-1.5">
          <span class="text-slate-400 font-medium">Season:</span>
          <select
            v-model="selectedSeason"
            @change="fetchLibrary"
            class="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 font-medium text-xs focus:bg-white focus:outline-none"
          >
            <option v-for="s in seasons" :key="s" :value="s">{{ s }}</option>
          </select>
        </div>
      </div>

      <div class="text-[11px] text-slate-400 font-medium">
        {{ assets.length }} approved assets in library
      </div>
    </div>

    <!-- Assets Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
      <div
        v-for="asset in assets"
        :key="asset.id"
        class="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden hover:shadow-md transition-all flex flex-col justify-between group"
      >
        <!-- Asset Preview Image -->
        <div class="aspect-4/5 bg-slate-100 relative overflow-hidden flex items-center justify-center">
          <img
            :src="asset.downloadUrl"
            :alt="asset.styleNumber"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />

          <!-- Verified Badges -->
          <div class="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
            <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-600/90 text-white text-[10px] font-bold uppercase tracking-wider backdrop-blur-xs shadow-xs">
              <CheckCircle class="w-3 h-3" />
              Approved
            </span>
            <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900/80 text-white text-[10px] font-bold backdrop-blur-xs shadow-xs">
              <Scissors class="w-3 h-3 text-cyan-400" />
              Verified 1 Path
            </span>
          </div>

          <!-- Angle Badge -->
          <span class="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded bg-black/60 text-white text-[10px] font-mono backdrop-blur-xs">
            {{ asset.shotCode }}
          </span>
        </div>

        <!-- Asset Info & Details -->
        <div class="p-4 space-y-3">
          <div class="flex items-start justify-between gap-2">
            <div class="flex flex-col">
              <div class="flex items-center gap-1.5">
                <span class="text-xs font-bold text-slate-900">#{{ asset.styleNumber }}</span>
                <span class="text-[10px] text-slate-400">({{ asset.brand }})</span>
              </div>
              <span class="text-[11px] text-slate-600 font-medium truncate max-w-[170px]">{{ asset.styleName }}</span>
            </div>
            <span class="text-[10px] text-slate-400 font-mono">{{ asset.season }}</span>
          </div>

          <!-- Colorway Pill -->
          <ColorSwatchChip
            :name="asset.colorwayName"
            :hex="asset.hex"
            :type="asset.colorwayType"
          />

          <div class="text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-100">
            <span>By: {{ asset.approvedBy }}</span>
            <span>{{ asset.fileSize }}</span>
          </div>

          <!-- Action Download Button -->
          <button
            @click="downloadSingle(asset)"
            class="w-full py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
          >
            <Download class="w-3.5 h-3.5" />
            <span>Download Hi-Res Asset</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-if="assets.length === 0 && !isLoading"
      class="p-12 text-center rounded-2xl bg-white border border-dashed border-slate-300 space-y-3"
    >
      <CheckCircle class="w-8 h-8 text-slate-300 mx-auto" />
      <h3 class="text-sm font-bold text-slate-700">No approved assets matching filters</h3>
      <p class="text-xs text-slate-500">Go to the QC Studio to approve photos from active tickets.</p>
    </div>
  </div>
</template>
