const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const DATA_FILE = path.join(__dirname, '../data/store.json');

// Ensure data directory exists
const dataDir = path.dirname(DATA_FILE);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initial seed data based on the real case files
const initialSeed = {
  tickets: [
    {
      id: 'TCK-1001',
      ticketNumber: '1',
      styleNumber: '15377489',
      styleName: 'Merino Wool Crew Knit',
      brand: 'SELECTED HOMME',
      season: 'AW26',
      priority: 'High',
      partner: 'Pixelz',
      status: 'Awaiting Review', // Ready for QC A/B approval
      clippingPath: true,
      clippingPathCount: 1,
      guidelineNotes: 'Please be aware to keep clipping path for all pictures (but only 1 clipping path). Make Granita - solid and Fuchsia Fedora AOP Block Libre.',
      shots: [
        { id: 'shot-1', code: '_001', label: 'Front Angle', filename: '15377489_5081878_001.jpg', ticketFolder: 'Ticket 1' },
        { id: 'shot-2', code: '_002', label: 'Back Angle', filename: '15377489_5081878_002.jpg', ticketFolder: 'Ticket 1' },
        { id: 'shot-3', code: '_007', label: 'Detail Angle', filename: '15377489_5081878_007.jpg', ticketFolder: 'Ticket 1' }
      ],
      patternAttachment: {
        filename: 'Block Libre.jpg',
        name: 'Block Libre Pattern',
        ticketFolder: 'Ticket 1'
      },
      colorways: [
        {
          id: 'cw-1',
          name: 'Granita',
          type: 'Solid',
          pantone: 'PANTONE 18-1649 TCX',
          hex: '#8B263E',
          status: 'Ready for Review'
        },
        {
          id: 'cw-2',
          name: 'Fuchsia Fedora',
          type: 'AOP',
          pantone: 'PANTONE 18-2120 TCX',
          hex: '#D94F70',
          patternRef: 'Block Libre',
          status: 'Ready for Review'
        }
      ],
      createdAt: '2026-10-08T09:15:00Z',
      sentAt: '2026-10-08T09:30:00Z',
      deliveredAt: '2026-10-08T13:45:00Z',
      slaHours: 4.25,
      history: [
        { timestamp: '2026-10-08T09:15:00Z', event: 'Ticket Created', user: 'Studio Operator' },
        { timestamp: '2026-10-08T09:30:00Z', event: 'Dispatched to Pixelz (Express 6h SLA)', user: 'Studio Operator' },
        { timestamp: '2026-10-08T13:45:00Z', event: 'Partner Callback Received: Assets Retouched', user: 'Pixelz API Webhook' }
      ]
    },
    {
      id: 'TCK-1002',
      ticketNumber: '2',
      styleNumber: '15377486',
      styleName: 'Cotton Rib Cardigan',
      brand: 'VERO MODA',
      season: 'AW26',
      priority: 'Medium',
      partner: 'RetouchPro',
      status: 'In Progress', // Simulates active partner processing
      clippingPath: true,
      clippingPathCount: 1,
      guidelineNotes: 'Please be aware to keep clipping path for all pictures (but only 1 clipping path). Night Sky AOP White Dots, Hedge Green solid, Navy Blazer solid.',
      shots: [
        { id: 'shot-4', code: '_001', label: 'Front Angle', filename: '15377486_5078866_001.jpg', ticketFolder: 'Ticket 2' },
        { id: 'shot-5', code: '_002', label: 'Back Angle', filename: '15377486_5078866_002.jpg', ticketFolder: 'Ticket 2' },
        { id: 'shot-6', code: '_007', label: 'Detail Angle', filename: '15377486_5078866_007.jpg', ticketFolder: 'Ticket 2' }
      ],
      patternAttachment: {
        filename: 'DOTS CLOUD DANCER.jpg',
        name: 'DOTS CLOUD DANCER (Night Sky Base)',
        ticketFolder: 'Ticket 2'
      },
      colorways: [
        {
          id: 'cw-3',
          name: 'Night Sky (AOP White Dots)',
          type: 'AOP',
          pantone: 'PANTONE 19-3923 TCX',
          hex: '#1F2937',
          patternRef: 'DOTS CLOUD DANCER (Night Sky)',
          status: 'Processing'
        },
        {
          id: 'cw-4',
          name: 'Hedge Green',
          type: 'Solid',
          pantone: 'PANTONE 17-0230 TCX',
          hex: '#556B2F',
          status: 'Processing'
        },
        {
          id: 'cw-5',
          name: 'Navy Blazer',
          type: 'Solid',
          pantone: 'PANTONE 19-3910 TCX',
          hex: '#1B263B',
          status: 'Processing'
        }
      ],
      createdAt: '2026-10-08T11:00:00Z',
      sentAt: '2026-10-08T11:15:00Z',
      deliveredAt: null,
      slaHours: null,
      history: [
        { timestamp: '2026-10-08T11:00:00Z', event: 'Ticket Created', user: 'Studio Operator' },
        { timestamp: '2026-10-08T11:15:00Z', event: 'Dispatched to RetouchPro (Standard 12h SLA)', user: 'Studio Operator' },
        { timestamp: '2026-10-08T11:45:00Z', event: 'Retouching Underway by Partner', user: 'RetouchPro System' }
      ]
    },
    {
      id: 'TCK-1003',
      ticketNumber: '3',
      styleNumber: '15377488',
      styleName: 'Structured Knit Pullover',
      brand: 'JACK & JONES',
      season: 'SS26',
      priority: 'High',
      partner: 'Pixelz',
      status: 'Sent', // Dispatched, waiting for partner to accept
      clippingPath: true,
      clippingPathCount: 1,
      guidelineNotes: 'Please be aware to keep clipping path for all pictures (but only 1 clipping path). Hedge Green solid, Navy Blazer solid, Night Sky AOP White Dots.',
      shots: [
        { id: 'shot-7', code: '_001', label: 'Front Angle', filename: '15377488_5078869_001.jpg', ticketFolder: 'Ticket 3' },
        { id: 'shot-8', code: '_002', label: 'Back Angle', filename: '15377488_5078869_002.jpg', ticketFolder: 'Ticket 3' },
        { id: 'shot-9', code: '_007', label: 'Detail Angle', filename: '15377488_5078869_007.jpg', ticketFolder: 'Ticket 3' }
      ],
      patternAttachment: {
        filename: 'DOTS CLOUD DANCER.jpg',
        name: 'DOTS CLOUD DANCER Pattern',
        ticketFolder: 'Ticket 3'
      },
      colorways: [
        {
          id: 'cw-6',
          name: 'Hedge Green',
          type: 'Solid',
          pantone: 'PANTONE 17-0230 TCX',
          hex: '#556B2F',
          status: 'Queued'
        },
        {
          id: 'cw-7',
          name: 'Navy Blazer',
          type: 'Solid',
          pantone: 'PANTONE 19-3910 TCX',
          hex: '#1B263B',
          status: 'Queued'
        },
        {
          id: 'cw-8',
          name: 'Night Sky (AOP White Dots)',
          type: 'AOP',
          pantone: 'PANTONE 19-3923 TCX',
          hex: '#1F2937',
          patternRef: 'DOTS CLOUD DANCER',
          status: 'Queued'
        }
      ],
      createdAt: '2026-10-08T14:30:00Z',
      sentAt: '2026-10-08T14:40:00Z',
      deliveredAt: null,
      slaHours: null,
      history: [
        { timestamp: '2026-10-08T14:30:00Z', event: 'Ticket Created', user: 'Studio Operator' },
        { timestamp: '2026-10-08T14:40:00Z', event: 'Dispatched to Pixelz API', user: 'Studio Operator' }
      ]
    },
    {
      id: 'TCK-1004',
      ticketNumber: '4',
      styleNumber: '15377522',
      styleName: 'Fine Gauge Turtleneck',
      brand: 'ONLY',
      season: 'AW26',
      priority: 'Low',
      partner: 'Pixelz',
      status: 'Pending', // Freshly created, ready to dispatch
      clippingPath: true,
      clippingPathCount: 1,
      guidelineNotes: 'Please be aware to keep clipping path for all pictures (but only 1 clipping path). Granita - solid, Fuchsia Fedora AOP Block Libre.',
      shots: [
        { id: 'shot-10', code: '_001', label: 'Front Angle', filename: '15377522_5081887_001.jpg', ticketFolder: 'Ticket 4' },
        { id: 'shot-11', code: '_002', label: 'Back Angle', filename: '15377522_5081887_002.jpg', ticketFolder: 'Ticket 4' },
        { id: 'shot-12', code: '_007', label: 'Detail Angle', filename: '15377522_5081887_007.jpg', ticketFolder: 'Ticket 4' }
      ],
      patternAttachment: {
        filename: 'Block Libre.jpg',
        name: 'Block Libre Pattern Reference',
        ticketFolder: 'Ticket 4'
      },
      colorways: [
        {
          id: 'cw-9',
          name: 'Granita',
          type: 'Solid',
          pantone: 'PANTONE 18-1649 TCX',
          hex: '#8B263E',
          status: 'Draft'
        },
        {
          id: 'cw-10',
          name: 'Fuchsia Fedora',
          type: 'AOP',
          pantone: 'PANTONE 18-2120 TCX',
          hex: '#D94F70',
          patternRef: 'Block Libre',
          status: 'Draft'
        }
      ],
      createdAt: '2026-10-08T16:00:00Z',
      sentAt: null,
      deliveredAt: null,
      slaHours: null,
      history: [
        { timestamp: '2026-10-08T16:00:00Z', event: 'Ticket Created', user: 'Studio Operator' }
      ]
    }
  ],
  approvedPhotos: [
    {
      id: 'APP-501',
      ticketId: 'TCK-1001',
      styleNumber: '15377489',
      styleName: 'Merino Wool Crew Knit',
      brand: 'SELECTED HOMME',
      season: 'AW26',
      colorwayName: 'Granita',
      colorwayType: 'Solid',
      pantone: 'PANTONE 18-1649 TCX',
      hex: '#8B263E',
      shotCode: '_001',
      shotLabel: 'Front Angle',
      originalFile: '15377489_5081878_001.jpg',
      ticketFolder: 'Ticket 1',
      approvedAt: '2026-10-08T15:00:00Z',
      approvedBy: 'Production Manager',
      clippingPathVerified: true,
      partner: 'Pixelz',
      resolution: '4200 x 5600 px',
      fileSize: '12.5 MB',
      downloadUrl: '/api/assets/recolour-case/Ticket 1/15377489_5081878_001.jpg'
    },
    {
      id: 'APP-502',
      ticketId: 'TCK-1001',
      styleNumber: '15377489',
      styleName: 'Merino Wool Crew Knit',
      brand: 'SELECTED HOMME',
      season: 'AW26',
      colorwayName: 'Fuchsia Fedora (AOP Block Libre)',
      colorwayType: 'AOP',
      pantone: 'PANTONE 18-2120 TCX',
      hex: '#D94F70',
      shotCode: '_002',
      shotLabel: 'Back Angle',
      originalFile: '15377489_5081878_002.jpg',
      ticketFolder: 'Ticket 1',
      approvedAt: '2026-10-08T15:10:00Z',
      approvedBy: 'Production Manager',
      clippingPathVerified: true,
      partner: 'Pixelz',
      resolution: '4200 x 5600 px',
      fileSize: '13.4 MB',
      downloadUrl: '/api/assets/recolour-case/Ticket 1/15377489_5081878_002.jpg'
    }
  ],
  partners: [
    {
      id: 'partner-1',
      name: 'Pixelz',
      serviceTier: '24h Express',
      activeTickets: 2,
      slaRate: '99.1%',
      avgTurnaroundHours: 4.5,
      apiEndpoint: 'https://api.pixelz.com/v3/orders',
      status: 'Connected (Online)'
    },
    {
      id: 'partner-2',
      name: 'RetouchPro',
      serviceTier: 'Standard 48h',
      activeTickets: 1,
      slaRate: '97.4%',
      avgTurnaroundHours: 8.2,
      apiEndpoint: 'https://gateway.retouchpro.io/api',
      status: 'Connected (Online)'
    },
    {
      id: 'partner-3',
      name: 'Studio In-House',
      serviceTier: 'Internal Retouch',
      activeTickets: 1,
      slaRate: '100%',
      avgTurnaroundHours: 2.1,
      apiEndpoint: 'internal://studio-render-cluster',
      status: 'Active'
    }
  ]
};

// Read store or initialize
function getStore() {
  if (!fs.existsSync(DATA_FILE)) {
    saveStore(initialSeed);
    return JSON.parse(JSON.stringify(initialSeed));
  }
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading store, resetting to initial seed:', err);
    saveStore(initialSeed);
    return JSON.parse(JSON.stringify(initialSeed));
  }
}

function saveStore(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

module.exports = {
  getStore,
  saveStore,
  initialSeed
};
