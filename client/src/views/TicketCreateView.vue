<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useTicketStore } from '../stores/tickets';
import {
  PlusCircle,
  Scissors,
  Send,
  Save,
  Check,
  Building2,
  Sparkles,
  ArrowLeft,
  UploadCloud,
  FileImage,
  X,
  CheckCircle2,
  Layers,
  Image as ImageIcon
} from 'lucide-vue-next';

const router = useRouter();
const ticketStore = useTicketStore();

// Form State
const styleNumber = ref('15377500');
const styleName = ref('Fine Gauge Knit Dress');
const brand = ref('SELECTED FEMME');
const season = ref('AW26');
const priority = ref('High');
const partner = ref('Pixelz');
const clippingPath = ref(true);
const guidelineNotes = ref('Please be aware to keep clipping path for all pictures (but only 1 clipping path). Fuchsia Fedora AOP Block Libre and Granita solid.');

// Selected shots
const selectedShots = ref([
  { code: '_001', label: 'Front Angle', selected: true, filename: '15377489_5081878_001.jpg', ticketFolder: 'Ticket 1' },
  { code: '_002', label: 'Back Angle', selected: true, filename: '15377489_5081878_002.jpg', ticketFolder: 'Ticket 1' },
  { code: '_007', label: 'Detail Angle', selected: true, filename: '15377489_5081878_007.jpg', ticketFolder: 'Ticket 1' }
]);

// Colorways
const selectedColorways = ref([
  { id: '1', name: 'Granita', type: 'Solid', pantone: 'PANTONE 18-1649 TCX', hex: '#8B263E' },
  { id: '2', name: 'Fuchsia Fedora (AOP Block Libre)', type: 'AOP', pantone: 'PANTONE 18-2120 TCX', hex: '#D94F70' }
]);

// Preset pantone options for quick selection
const pantonePresets = [
  { name: 'Granita (Solid)', hex: '#8B263E', pantone: 'PANTONE 18-1649 TCX', type: 'Solid' },
  { name: 'Hedge Green (Solid)', hex: '#556B2F', pantone: 'PANTONE 17-0230 TCX', type: 'Solid' },
  { name: 'Navy Blazer (Solid)', hex: '#1B263B', pantone: 'PANTONE 19-3910 TCX', type: 'Solid' },
  { name: 'Night Sky (AOP White Dots)', hex: '#1F2937', pantone: 'PANTONE 19-3923 TCX', type: 'AOP' },
  { name: 'Fuchsia Fedora (AOP Block Libre)', hex: '#D94F70', pantone: 'PANTONE 18-2120 TCX', type: 'AOP' }
];

const selectedPreset = ref(pantonePresets[0]);

// Attached AOP Reference Swatch State
const attachedPattern = ref({
  name: 'Block Libre Pattern',
  filename: 'Block Libre.jpg',
  ticketFolder: 'Ticket 1',
  url: '/api/assets/recolour-case/Ticket 1/Block Libre.jpg',
  size: '12.8 MB',
  isUploaded: false
});

const isUploadingFile = ref(false);
const fileInputRef = ref(null);

// Studio Library Preset Swatches
const studioPatternPresets = [
  {
    name: 'Block Libre (Case Spec 1 & 4)',
    filename: 'Block Libre.jpg',
    ticketFolder: 'Ticket 1',
    url: '/api/assets/recolour-case/Ticket 1/Block Libre.jpg',
    size: '12.8 MB'
  },
  {
    name: 'DOTS CLOUD DANCER (Case Spec 2 & 3)',
    filename: 'DOTS CLOUD DANCER.jpg',
    ticketFolder: 'Ticket 2',
    url: '/api/assets/recolour-case/Ticket 2/DOTS CLOUD DANCER.jpg',
    size: '7.2 MB'
  }
];

function selectPresetPattern(preset) {
  attachedPattern.value = {
    name: preset.name,
    filename: preset.filename,
    ticketFolder: preset.ticketFolder,
    url: preset.url,
    size: preset.size,
    isUploaded: false
  };
}

function removePattern() {
  attachedPattern.value = null;
}

async function handleFileUpload(e) {
  const file = e.target.files?.[0];
  if (!file) return;

  isUploadingFile.value = true;
  const formData = new FormData();
  formData.append('patternFile', file);
  formData.append('patternName', file.name.replace(/\.[^/.]+$/, ''));

  try {
    const res = await fetch('/api/tickets/upload', {
      method: 'POST',
      body: formData
    });
    const data = await res.json();
    if (data.success) {
      attachedPattern.value = {
        name: data.data.name,
        filename: data.data.filename,
        originalName: data.data.originalName,
        url: data.data.url,
        size: data.data.size,
        isUploaded: true
      };
    } else {
      alert('Upload failed: ' + data.message);
    }
  } catch (err) {
    alert('Failed to upload pattern: ' + err.message);
  } finally {
    isUploadingFile.value = false;
  }
}

function addColorway() {
  selectedColorways.value.push({
    id: Date.now().toString(),
    name: selectedPreset.value.name,
    type: selectedPreset.value.type,
    pantone: selectedPreset.value.pantone,
    hex: selectedPreset.value.hex
  });
}

function removeColorway(index) {
  selectedColorways.value.splice(index, 1);
}

const isSubmitting = ref(false);

async function handleSubmit(dispatchImmediately = false) {
  if (!styleNumber.value) {
    alert('Please enter a Style Number');
    return;
  }

  isSubmitting.value = true;
  try {
    const activeShots = selectedShots.value
      .filter(s => s.selected)
      .map(s => ({
        id: s.code,
        code: s.code,
        label: s.label,
        filename: s.filename,
        ticketFolder: s.ticketFolder
      }));

    await ticketStore.createTicket({
      styleNumber: styleNumber.value,
      styleName: styleName.value,
      brand: brand.value,
      season: season.value,
      priority: priority.value,
      partner: partner.value,
      clippingPath: clippingPath.value,
      guidelineNotes: guidelineNotes.value,
      shots: activeShots,
      colorways: selectedColorways.value,
      patternAttachment: attachedPattern.value,
      dispatchImmediately
    });

    router.push('/queue');
  } catch (err) {
    alert('Failed to create ticket: ' + err.message);
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<template>
  <div class="max-w-4xl mx-auto space-y-6 pb-12">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <router-link
          to="/queue"
          class="w-8 h-8 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-600 transition-colors shadow-2xs"
        >
          <ArrowLeft class="w-4 h-4" />
        </router-link>
        <div>
          <h1 class="text-xl font-bold text-slate-900">Create Recolour Ticket</h1>
          <p class="text-xs text-slate-500">Configure photoshoot work order, attach AOP pattern assets, and dispatch to retouch partners.</p>
        </div>
      </div>
    </div>

    <!-- Main Creation Form Card -->
    <div class="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-6">
      <!-- Section 1: Garment & Metadata -->
      <div class="space-y-4">
        <h2 class="text-xs font-bold uppercase tracking-wider text-slate-400">1. Garment & Style Metadata</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- Style Number -->
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-slate-700">Style Number</label>
            <input
              v-model="styleNumber"
              type="text"
              placeholder="e.g. 15377489"
              class="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-slate-900/10 focus:outline-none"
            />
          </div>

          <!-- Style Name -->
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-slate-700">Style / Item Name</label>
            <input
              v-model="styleName"
              type="text"
              placeholder="e.g. Crew Knit"
              class="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-slate-900/10 focus:outline-none"
            />
          </div>

          <!-- Brand -->
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-slate-700">Brand</label>
            <select
              v-model="brand"
              class="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-slate-900/10 focus:outline-none bg-white"
            >
              <option value="SELECTED HOMME">SELECTED HOMME</option>
              <option value="SELECTED FEMME">SELECTED FEMME</option>
              <option value="VERO MODA">VERO MODA</option>
              <option value="JACK & JONES">JACK & JONES</option>
              <option value="ONLY">ONLY</option>
            </select>
          </div>

          <!-- Season -->
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-slate-700">Season</label>
            <select
              v-model="season"
              class="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-slate-900/10 focus:outline-none bg-white"
            >
              <option value="AW26">AW26</option>
              <option value="SS26">SS26</option>
              <option value="AW25">AW25</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Section 2: Studio Shot Selection -->
      <div class="space-y-3 pt-4 border-t border-slate-100">
        <div class="flex items-center justify-between">
          <h2 class="text-xs font-bold uppercase tracking-wider text-slate-400">2. Photo Angles & Shots to Recolour</h2>
          <span class="text-[11px] text-slate-400">Standard angles: Front (_001), Back (_002), Detail (_007)</span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div
            v-for="shot in selectedShots"
            :key="shot.code"
            @click="shot.selected = !shot.selected"
            :class="[
              'p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-3',
              shot.selected ? 'bg-slate-900/5 border-slate-900 ring-1 ring-slate-900' : 'bg-white border-slate-200 hover:border-slate-300'
            ]"
          >
            <div class="w-14 h-14 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
              <img
                :src="`/api/assets/recolour-case/${shot.ticketFolder}/${shot.filename}`"
                :alt="shot.label"
                class="w-full h-full object-cover"
              />
            </div>
            <div class="flex flex-col flex-1">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-slate-900">{{ shot.code }}</span>
                <span
                  :class="[
                    'w-4 h-4 rounded flex items-center justify-center text-[10px]',
                    shot.selected ? 'bg-slate-900 text-white' : 'border border-slate-300'
                  ]"
                >
                  <Check v-if="shot.selected" class="w-3 h-3" />
                </span>
              </div>
              <span class="text-[11px] text-slate-500">{{ shot.label }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Section 3: Target Colorways -->
      <div class="space-y-3 pt-4 border-t border-slate-100">
        <div class="flex items-center justify-between">
          <h2 class="text-xs font-bold uppercase tracking-wider text-slate-400">3. Target Pantone / AOP Colorways</h2>
          <span class="text-[11px] text-slate-400">Add requested solid colors or All-Over-Prints</span>
        </div>

        <!-- Add Colorway Bar -->
        <div class="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
          <select
            v-model="selectedPreset"
            class="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-xs font-medium bg-white focus:outline-none"
          >
            <option v-for="p in pantonePresets" :key="p.name" :value="p">
              {{ p.name }} — {{ p.pantone }}
            </option>
          </select>
          <button
            @click="addColorway"
            type="button"
            class="px-3.5 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
          >
            + Add Colorway
          </button>
        </div>

        <!-- Selected Colorways List -->
        <div class="space-y-2">
          <div
            v-for="(cw, index) in selectedColorways"
            :key="cw.id"
            class="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between gap-3 shadow-2xs"
          >
            <div class="flex items-center gap-3">
              <span
                class="w-6 h-6 rounded-full border border-slate-300 shadow-inner shrink-0"
                :style="{ backgroundColor: cw.hex }"
              ></span>
              <div class="flex flex-col">
                <span class="text-xs font-bold text-slate-800">{{ cw.name }}</span>
                <span class="text-[10px] text-slate-400 font-mono">{{ cw.pantone }}</span>
              </div>
            </div>

            <button
              @click="removeColorway(index)"
              type="button"
              class="text-xs text-rose-600 hover:text-rose-800 font-semibold px-2 py-1"
            >
              Remove
            </button>
          </div>
        </div>
      </div>

      <!-- Section 4: AOP Reference Asset Upload & Swatch Attachment -->
      <div class="space-y-4 pt-4 border-t border-slate-100">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <ImageIcon class="w-4 h-4 text-purple-600" />
              4. AOP Pattern Reference Attachment (Sent to Partner)
            </h2>
            <p class="text-[11px] text-slate-500">
              Attach the high-resolution pattern swatch (e.g. Block Libre.jpg) for the partner to render exact motif scale.
            </p>
          </div>
        </div>

        <!-- If Pattern is Attached -->
        <div
          v-if="attachedPattern"
          class="p-4 rounded-xl bg-purple-50/60 border border-purple-200 flex items-center justify-between gap-4"
        >
          <div class="flex items-center gap-3.5">
            <div class="w-14 h-14 rounded-lg bg-white border border-purple-200 overflow-hidden shrink-0 shadow-2xs">
              <img :src="attachedPattern.url" :alt="attachedPattern.name" class="w-full h-full object-cover" />
            </div>
            <div class="flex flex-col">
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold text-purple-950">{{ attachedPattern.name }}</span>
                <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-200 text-purple-900">
                  {{ attachedPattern.filename }}
                </span>
              </div>
              <span class="text-[11px] text-purple-700">
                Size: {{ attachedPattern.size || '12.8 MB' }} &bull; Status: <strong class="text-emerald-700">Ready for Partner Dispatch Payload</strong>
              </span>
            </div>
          </div>

          <button
            @click="removePattern"
            type="button"
            class="px-2.5 py-1.5 rounded-lg border border-purple-300 bg-white hover:bg-rose-50 text-rose-600 text-xs font-semibold transition-colors flex items-center gap-1"
          >
            <X class="w-3.5 h-3.5" />
            <span>Remove</span>
          </button>
        </div>

        <!-- Uploader & Studio Swatch Presets -->
        <div v-else class="space-y-3">
          <!-- File Input Dropzone -->
          <div
            @click="$refs.fileInputRef.click()"
            class="p-6 border-2 border-dashed border-slate-300 hover:border-purple-500 rounded-2xl bg-slate-50/60 hover:bg-purple-50/30 cursor-pointer transition-all text-center space-y-2 group"
          >
            <input
              ref="fileInputRef"
              type="file"
              accept="image/*"
              @change="handleFileUpload"
              class="hidden"
            />
            <UploadCloud class="w-8 h-8 text-slate-400 group-hover:text-purple-600 mx-auto transition-colors" />
            <div class="text-xs font-bold text-slate-700 group-hover:text-purple-900">
              Click or drag to upload custom AOP pattern file (.jpg, .png, .tif)
            </div>
            <div class="text-[10px] text-slate-400">
              Maximum file size: 25MB &bull; High-res RGB or CMYK reference swatch
            </div>
          </div>

          <!-- Studio Case Presets -->
          <div class="space-y-1.5">
            <span class="text-[11px] font-semibold text-slate-500">Or quick-attach from Studio Case Library:</span>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                v-for="preset in studioPatternPresets"
                :key="preset.name"
                @click="selectPresetPattern(preset)"
                type="button"
                class="p-2.5 rounded-xl border border-slate-200 hover:border-purple-300 bg-white hover:bg-purple-50/40 text-left flex items-center gap-2.5 transition-all text-xs"
              >
                <div class="w-8 h-8 rounded bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                  <img :src="preset.url" :alt="preset.name" class="w-full h-full object-cover" />
                </div>
                <div class="flex flex-col flex-1 truncate">
                  <span class="font-bold text-slate-800 truncate">{{ preset.name }}</span>
                  <span class="text-[10px] text-slate-400 font-mono">{{ preset.filename }}</span>
                </div>
                <span class="text-[10px] font-bold text-purple-600 shrink-0">+ Attach</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Section 5: Partner, Priority & Clipping Rules -->
      <div class="space-y-4 pt-4 border-t border-slate-100">
        <h2 class="text-xs font-bold uppercase tracking-wider text-slate-400">5. Partner Dispatch & Clipping Rules</h2>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <!-- Partner -->
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-slate-700">Retouching Partner</label>
            <select
              v-model="partner"
              class="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-slate-900/10 focus:outline-none bg-white"
            >
              <option value="Pixelz">Pixelz (Express 24h)</option>
              <option value="RetouchPro">RetouchPro (Standard 48h)</option>
              <option value="Studio In-House">Studio In-House</option>
            </select>
          </div>

          <!-- Priority -->
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-slate-700">Priority</label>
            <select
              v-model="priority"
              class="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-slate-900/10 focus:outline-none bg-white"
            >
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <!-- Clipping Path Mandatory Rule -->
          <div class="space-y-1.5 flex flex-col justify-end">
            <label class="flex items-center gap-2 p-2.5 rounded-lg border border-emerald-200 bg-emerald-50/50 cursor-pointer">
              <input type="checkbox" v-model="clippingPath" class="rounded text-emerald-600 focus:ring-0" />
              <div class="flex items-center gap-1.5 text-xs font-semibold text-emerald-900">
                <Scissors class="w-3.5 h-3.5 text-emerald-600" />
                <span>Enforce 1 Clipping Path</span>
              </div>
            </label>
          </div>
        </div>

        <!-- Notes -->
        <div class="space-y-1.5">
          <label class="text-xs font-semibold text-slate-700">Special Guideline Instructions</label>
          <textarea
            v-model="guidelineNotes"
            rows="2"
            class="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-slate-900/10 focus:outline-none"
            placeholder="e.g. Please be aware to keep clipping path for all pictures (but only 1 clipping path)."
          ></textarea>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
        <button
          @click="handleSubmit(false)"
          :disabled="isSubmitting || isUploadingFile"
          type="button"
          class="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors shadow-2xs"
        >
          <Save class="w-4 h-4 text-slate-400" />
          <span>Save as Draft</span>
        </button>

        <button
          @click="handleSubmit(true)"
          :disabled="isSubmitting || isUploadingFile"
          type="button"
          class="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors shadow-sm"
        >
          <Send class="w-4 h-4" />
          <span>Dispatch to Partner Now</span>
        </button>
      </div>
    </div>
  </div>
</template>
