// Client → Seat → Sheet hierarchy. Each sheet declares its own column schema.

export const TYPE_OPS = {
  T:  ['contains','is','is not','starts with','is empty','is not empty'],
  '#':['=','≠','>','≥','<','≤','is empty'],
  D:  ['is','before','after','within last 7d','within last 30d'],
  S:  ['is','is not','is any of'],
  M:  ['contains','does not contain','is empty'],
  P:  ['is','is not'],
  U:  ['contains','is empty'],
  E:  ['contains','is empty'],
  C:  ['is checked','is not checked'],
  F:  ['=','≠','>','≥','<','≤'],
  R:  ['has any','is empty'],
  St: ['is','is not','is any of'],
  AI: ['=','≠','>','≥','<','≤'],
};

export const OWNERS = [
  { id: 'AK', name: 'Alok Singh',  color: 'ak' },
  { id: 'JR', name: 'Jess Rivera', color: 'jr' },
  { id: 'MS', name: 'Maya Sato',   color: 'ms' },
  { id: 'SM', name: 'Sam Müller',  color: 'sm' },
  { id: '—',  name: 'Unassigned',  color: '' },
];

function rng(seed) {
  let s = seed;
  return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
}
const pickFn = (rand) => (arr) => arr[Math.floor(rand() * arr.length)];

export const CLIENTS = [
  {
    id: 'trifecta',
    name: 'Trifecta Life',
    color: '#c54a2c',
    industry: 'Health & Wellness',
    seats: [
      {
        id: 'tl-sales', name: 'Sales',
        sheets: [
          {
            id: 'tl-sales-pipeline', name: 'Pipeline', icon: '▦',
            columns: [
              { key: 'company',     label: 'Company',      type: 'T',  width: 200, sticky: true, editable: true },
              { key: 'contact',     label: 'Contact',      type: 'T',  width: 160, editable: true },
              { key: 'stage',       label: 'Stage',        type: 'S',  width: 120, options: ['Lead','Qualified','Demo','Proposal','Closed-Won','Closed-Lost'] },
              { key: 'value',       label: 'Deal Value',   type: '#',  width: 110, editable: true, prefix: '$' },
              { key: 'probability', label: 'Probability',  type: '#',  width: 110, suffix: '%' },
              { key: 'closeDate',   label: 'Close Date',   type: 'D',  width: 120 },
              { key: 'owner',       label: 'Owner',        type: 'P',  width: 130, options: OWNERS.map(o=>o.id) },
              { key: 'enrich',      label: '✦ Enrichment', type: 'AI', width: 150 },
              { key: 'tags',        label: 'Tags',         type: 'M',  width: 180 },
            ],
            seedKind: 'sales-pipeline',
          },
          {
            id: 'tl-sales-targets', name: 'Targets', icon: '▦',
            columns: [
              { key: 'rep',      label: 'Rep',        type: 'P',  width: 140, sticky: true, options: OWNERS.map(o=>o.id) },
              { key: 'quota',    label: 'Q2 Quota',   type: '#',  width: 110, prefix: '$' },
              { key: 'attained', label: 'Attained',   type: '#',  width: 110, prefix: '$' },
              { key: 'pct',      label: '% to quota', type: 'F',  width: 110, suffix: '%' },
              { key: 'forecast', label: 'Forecast',   type: 'St', width: 110, options: ['On track','At risk','Off'] },
            ],
            seedKind: 'sales-targets',
          },
        ],
      },
      {
        id: 'tl-cs', name: 'Customer Success',
        sheets: [
          {
            id: 'tl-cs-accounts', name: 'Accounts', icon: '▦',
            columns: [
              { key: 'account',     label: 'Account',    type: 'T',  width: 200, sticky: true },
              { key: 'plan',        label: 'Plan',       type: 'S',  width: 120, options: ['Free','Pro','Team','Enterprise'] },
              { key: 'mrr',         label: 'MRR',        type: '#',  width: 100, prefix: '$' },
              { key: 'health',      label: 'Health',     type: 'St', width: 110, options: ['Green','Yellow','Red'] },
              { key: 'csm',         label: 'CSM',        type: 'P',  width: 130, options: OWNERS.map(o=>o.id) },
              { key: 'renewalDate', label: 'Renewal',    type: 'D',  width: 120 },
              { key: 'lastTouch',   label: 'Last Touch', type: 'D',  width: 120 },
              { key: 'risk',        label: '✦ Churn Risk', type: 'AI', width: 150 },
            ],
            seedKind: 'cs-accounts',
          },
          {
            id: 'tl-cs-tickets', name: 'Tickets', icon: '▦',
            columns: [
              { key: 'ticketId', label: 'Ticket',   type: 'T',  width: 90,  sticky: true },
              { key: 'subject',  label: 'Subject',  type: 'T',  width: 240 },
              { key: 'priority', label: 'Priority', type: 'S',  width: 100, options: ['P0','P1','P2','P3'] },
              { key: 'status',   label: 'Status',   type: 'St', width: 110, options: ['Open','In Progress','Waiting','Closed'] },
              { key: 'assignee', label: 'Assignee', type: 'P',  width: 130, options: OWNERS.map(o=>o.id) },
              { key: 'opened',   label: 'Opened',   type: 'D',  width: 110 },
            ],
            seedKind: 'tickets',
          },
        ],
      },
      {
        id: 'tl-ops', name: 'Operations',
        sheets: [
          {
            id: 'tl-ops-inventory', name: 'Inventory', icon: '▦',
            columns: [
              { key: 'sku',       label: 'SKU',         type: 'T',  width: 110, sticky: true },
              { key: 'product',   label: 'Product',     type: 'T',  width: 200 },
              { key: 'onHand',    label: 'On hand',     type: '#',  width: 90 },
              { key: 'reorder',   label: 'Reorder at',  type: '#',  width: 90 },
              { key: 'warehouse', label: 'Warehouse',   type: 'S',  width: 110, options: ['SEA-1','PDX-1','LAX-2'] },
              { key: 'restock',   label: 'Next Restock',type: 'D',  width: 120 },
              { key: 'lowStock',  label: 'Low?',        type: 'C',  width: 70 },
            ],
            seedKind: 'inventory',
          },
        ],
      },
    ],
  },
  {
    id: 'omni',
    name: 'Omni Life',
    color: '#2d6c5a',
    industry: 'Insurance & Benefits',
    seats: [
      {
        id: 'om-policies', name: 'Policies',
        sheets: [
          {
            id: 'om-policies-active', name: 'Active Policies', icon: '▦',
            columns: [
              { key: 'policy',        label: 'Policy #',        type: 'T',  width: 130, sticky: true },
              { key: 'holder',        label: 'Policy Holder',   type: 'T',  width: 200 },
              { key: 'product',       label: 'Product',         type: 'S',  width: 130, options: ['Term Life','Whole Life','Universal','Critical Illness'] },
              { key: 'face',          label: 'Face Value',      type: '#',  width: 120, prefix: '$' },
              { key: 'premium',       label: 'Annual Premium',  type: '#',  width: 130, prefix: '$' },
              { key: 'beneficiaries', label: 'Beneficiaries',   type: '#',  width: 100 },
              { key: 'agent',         label: 'Agent',           type: 'P',  width: 130, options: OWNERS.map(o=>o.id) },
              { key: 'effective',     label: 'Effective',       type: 'D',  width: 110 },
              { key: 'status',        label: 'Status',          type: 'St', width: 110, options: ['Active','Lapsed','Pending','Cancelled'] },
            ],
            seedKind: 'policies',
          },
        ],
      },
      {
        id: 'om-claims', name: 'Claims',
        sheets: [
          {
            id: 'om-claims-queue', name: 'Claims Queue', icon: '▦',
            columns: [
              { key: 'claim',    label: 'Claim #',      type: 'T',  width: 110, sticky: true },
              { key: 'claimant', label: 'Claimant',     type: 'T',  width: 180 },
              { key: 'type',     label: 'Type',         type: 'S',  width: 130, options: ['Death','Disability','Critical','Surrender'] },
              { key: 'amount',   label: 'Amount',       type: '#',  width: 110, prefix: '$' },
              { key: 'filed',    label: 'Filed',        type: 'D',  width: 110 },
              { key: 'adjuster', label: 'Adjuster',     type: 'P',  width: 130, options: OWNERS.map(o=>o.id) },
              { key: 'state',    label: 'State',        type: 'St', width: 130, options: ['Filed','Reviewing','Approved','Paid','Denied'] },
              { key: 'docs',     label: 'Docs Complete',type: 'C',  width: 120 },
            ],
            seedKind: 'claims',
          },
        ],
      },
      {
        id: 'om-broker', name: 'Broker Network',
        sheets: [
          {
            id: 'om-broker-list', name: 'Brokers', icon: '▦',
            columns: [
              { key: 'broker',      label: 'Broker',          type: 'T',  width: 200, sticky: true },
              { key: 'license',     label: 'License #',       type: 'T',  width: 130 },
              { key: 'states',      label: 'Licensed States', type: 'M',  width: 200 },
              { key: 'tier',        label: 'Tier',            type: 'S',  width: 100, options: ['Platinum','Gold','Silver','Bronze'] },
              { key: 'ytdPolicies', label: 'YTD Policies',    type: '#',  width: 110 },
              { key: 'ytdPremium',  label: 'YTD Premium',     type: '#',  width: 130, prefix: '$' },
              { key: 'ce',          label: 'CE Current',      type: 'C',  width: 100 },
            ],
            seedKind: 'brokers',
          },
        ],
      },
    ],
  },
  {
    id: 'popcloud',
    name: 'Pop Cloud Tech',
    color: '#4a5d8a',
    industry: 'B2B SaaS · Infra',
    seats: [
      {
        id: 'pc-eng', name: 'Engineering',
        sheets: [
          {
            id: 'pc-eng-incidents', name: 'Incidents', icon: '▦',
            columns: [
              { key: 'incident',   label: 'Incident',    type: 'T',  width: 110, sticky: true },
              { key: 'service',    label: 'Service',     type: 'S',  width: 140, options: ['api','auth','db','workers','dashboard'] },
              { key: 'severity',   label: 'Severity',    type: 'S',  width: 100, options: ['SEV1','SEV2','SEV3','SEV4'] },
              { key: 'status',     label: 'Status',      type: 'St', width: 110, options: ['Investigating','Mitigating','Resolved'] },
              { key: 'commander',  label: 'Commander',   type: 'P',  width: 130, options: OWNERS.map(o=>o.id) },
              { key: 'opened',     label: 'Opened',      type: 'D',  width: 110 },
              { key: 'mttrMin',    label: 'MTTR (min)',  type: '#',  width: 100 },
              { key: 'postmortem', label: 'Postmortem',  type: 'C',  width: 110 },
            ],
            seedKind: 'incidents',
          },
          {
            id: 'pc-eng-deploys', name: 'Deploys', icon: '▦',
            columns: [
              { key: 'sha',       label: 'SHA',         type: 'T',  width: 110, sticky: true },
              { key: 'service',   label: 'Service',     type: 'S',  width: 130, options: ['api','auth','db','workers','dashboard'] },
              { key: 'env',       label: 'Env',         type: 'S',  width: 100, options: ['prod','staging','canary'] },
              { key: 'author',    label: 'Author',      type: 'P',  width: 130, options: OWNERS.map(o=>o.id) },
              { key: 'shippedAt', label: 'Shipped',     type: 'D',  width: 120 },
              { key: 'rollback',  label: 'Rolled back', type: 'C',  width: 110 },
            ],
            seedKind: 'deploys',
          },
        ],
      },
      {
        id: 'pc-prod', name: 'Product',
        sheets: [
          {
            id: 'pc-prod-roadmap', name: 'Roadmap', icon: '▦',
            columns: [
              { key: 'feature',  label: 'Feature',   type: 'T',  width: 220, sticky: true },
              { key: 'theme',    label: 'Theme',     type: 'S',  width: 130, options: ['Performance','Onboarding','Pricing','Reliability','Mobile'] },
              { key: 'status',   label: 'Status',    type: 'St', width: 130, options: ['Backlog','Discovery','Building','Beta','Shipped'] },
              { key: 'pm',       label: 'PM',        type: 'P',  width: 130, options: OWNERS.map(o=>o.id) },
              { key: 'targetQ',  label: 'Target',    type: 'S',  width: 110, options: ['2026 Q2','2026 Q3','2026 Q4','2027 Q1'] },
              { key: 'effort',   label: 'Effort',    type: 'S',  width: 100, options: ['XS','S','M','L','XL'] },
              { key: 'icpFit',   label: '✦ ICP Fit', type: 'AI', width: 140 },
            ],
            seedKind: 'roadmap',
          },
        ],
      },
      {
        id: 'pc-mkt', name: 'Marketing',
        sheets: [
          {
            id: 'pc-mkt-campaigns', name: 'Campaigns', icon: '▦',
            columns: [
              { key: 'campaign', label: 'Campaign', type: 'T',  width: 200, sticky: true },
              { key: 'channel',  label: 'Channel',  type: 'S',  width: 110, options: ['Email','LinkedIn','Search','Display','Webinar'] },
              { key: 'spend',    label: 'Spend',    type: '#',  width: 100, prefix: '$' },
              { key: 'leads',    label: 'Leads',    type: '#',  width: 90 },
              { key: 'cpl',      label: 'CPL',      type: 'F',  width: 90,  prefix: '$' },
              { key: 'live',     label: 'Live',     type: 'C',  width: 70 },
              { key: 'owner',    label: 'Owner',    type: 'P',  width: 130, options: OWNERS.map(o=>o.id) },
            ],
            seedKind: 'campaigns',
          },
        ],
      },
    ],
  },
];

function buildRow(kind, i, r, pick) {
  const tags = ['Q2','priority','renewal','expansion','enterprise','mid-market','smb','referral'];
  switch (kind) {
    case 'sales-pipeline': return {
      id: i + 1,
      company: pick(['Pinegrove','Mossbrook & Co.','Halcyon','Northwind','Tessera','Vellum','Atlas','Beacon','Linden','Cedar Group','Brook & Sons','Vyoo','Lantern','Bramble Studio']) + (r() > 0.6 ? ' ' + pick(['Labs','Holdings','Co']) : ''),
      contact: pick(['Avery Park','Casey Lopez','Drew Kim','Emery Patel','Sage Tanaka','Reese Cohen','Quinn Chen']),
      stage: pick(['Lead','Qualified','Demo','Proposal','Closed-Won','Closed-Lost']),
      value: Math.round((1500 + r() * 95000) / 100) * 100,
      probability: [10,25,50,70,90][Math.floor(r()*5)],
      closeDate: '2026-' + String(5 + Math.floor(r()*4)).padStart(2,'0') + '-' + String(1 + Math.floor(r()*27)).padStart(2,'0'),
      owner: pick(OWNERS.slice(0,4)).id,
      enrich: Math.floor(r() * 100),
      enrichPending: false,
      tags: [pick(tags), pick(tags)].filter((v,j,a)=>a.indexOf(v)===j),
    };
    case 'sales-targets': return {
      id: i + 1,
      rep: OWNERS[i % 4].id,
      quota: 250000,
      attained: Math.round(50000 + r() * 250000),
      pct: 0, // computed after
      forecast: pick(['On track','At risk','Off']),
    };
    case 'cs-accounts': return {
      id: i + 1,
      account: pick(['Pinegrove','Mossbrook','Halcyon','Tessera','Vellum','Atlas','Beacon']) + ' ' + pick(['Health','Wellness','Co','Group']),
      plan: pick(['Free','Pro','Team','Enterprise']),
      mrr: Math.round((100 + r() * 9800) / 50) * 50,
      health: pick(['Green','Yellow','Red']),
      csm: pick(OWNERS.slice(0,4)).id,
      renewalDate: '2026-' + String(5 + Math.floor(r()*5)).padStart(2,'0') + '-' + String(1 + Math.floor(r()*27)).padStart(2,'0'),
      lastTouch: '2026-04-' + String(1 + Math.floor(r()*27)).padStart(2,'0'),
      risk: Math.floor(r() * 100),
      enrichPending: false,
    };
    case 'tickets': return {
      id: i + 1,
      ticketId: 'TL-' + String(2400 + i).padStart(4, '0'),
      subject: pick(['Login fails on iOS','Export hanging','Billing discrepancy','API 5xx burst','Webhook delay','SSO error after upgrade','Workspace switcher slow','PDF render missing image']),
      priority: pick(['P0','P1','P2','P3']),
      status: pick(['Open','In Progress','Waiting','Closed']),
      assignee: pick(OWNERS.slice(0,4)).id,
      opened: '2026-04-' + String(1 + Math.floor(r()*27)).padStart(2,'0'),
    };
    case 'inventory': return {
      id: i + 1,
      sku: 'SKU-' + String(1000 + i).padStart(4,'0'),
      product: pick(['Vita Bar','Sleep Tonic','Adaptogen Pack','Glow Powder','Iron+ Capsules','Greens Daily','Hydration Sticks']),
      onHand: Math.floor(r() * 1200),
      reorder: 200,
      warehouse: pick(['SEA-1','PDX-1','LAX-2']),
      restock: '2026-' + String(5 + Math.floor(r()*3)).padStart(2,'0') + '-' + String(1 + Math.floor(r()*27)).padStart(2,'0'),
      lowStock: false, // computed after
    };
    case 'policies': return {
      id: i + 1,
      policy: 'OL-' + String(74000 + i).padStart(6,'0'),
      holder: pick(['Avery Park','Casey Lopez','Drew Kim','Emery Patel','Sage Tanaka','Reese Cohen']),
      product: pick(['Term Life','Whole Life','Universal','Critical Illness']),
      face: 100000 * (1 + Math.floor(r() * 10)),
      premium: Math.round((400 + r() * 8000) / 50) * 50,
      beneficiaries: 1 + Math.floor(r() * 4),
      agent: pick(OWNERS.slice(0,4)).id,
      effective: '202' + (3 + Math.floor(r()*3)) + '-' + String(1 + Math.floor(r()*12)).padStart(2,'0') + '-' + String(1 + Math.floor(r()*27)).padStart(2,'0'),
      status: pick(['Active','Active','Active','Lapsed','Pending','Cancelled']),
    };
    case 'claims': return {
      id: i + 1,
      claim: 'C-' + String(5400 + i).padStart(5,'0'),
      claimant: pick(['Avery Park','Casey Lopez','Drew Kim','Emery Patel','Sage Tanaka','Reese Cohen']),
      type: pick(['Death','Disability','Critical','Surrender']),
      amount: Math.round((10000 + r() * 480000) / 100) * 100,
      filed: '2026-04-' + String(1 + Math.floor(r()*27)).padStart(2,'0'),
      adjuster: pick(OWNERS.slice(0,4)).id,
      state: pick(['Filed','Reviewing','Approved','Paid','Denied']),
      docs: r() > 0.4,
    };
    case 'brokers': return {
      id: i + 1,
      broker: pick(['Acme Brokers','Trident Risk','Linden & Co','Crestline Insurance','Birch Wealth','Atlas Risk','Hearth Group']),
      license: 'LIC-' + (100000 + Math.floor(r() * 900000)),
      states: [pick(['WA','OR','CA','TX','NY']), pick(['FL','IL','MA','GA'])].filter((v,j,a)=>a.indexOf(v)===j),
      tier: pick(['Platinum','Gold','Silver','Bronze']),
      ytdPolicies: Math.floor(r() * 240),
      ytdPremium: Math.round(r() * 1800000 / 100) * 100,
      ce: r() > 0.3,
    };
    case 'incidents': return {
      id: i + 1,
      incident: 'INC-' + String(820 + i).padStart(4,'0'),
      service: pick(['api','auth','db','workers','dashboard']),
      severity: pick(['SEV1','SEV2','SEV3','SEV4']),
      status: pick(['Investigating','Mitigating','Resolved','Resolved','Resolved']),
      commander: pick(OWNERS.slice(0,4)).id,
      opened: '2026-04-' + String(1 + Math.floor(r()*27)).padStart(2,'0'),
      mttrMin: Math.floor(5 + r() * 240),
      postmortem: r() > 0.5,
    };
    case 'deploys': return {
      id: i + 1,
      sha: Math.floor(r() * 0xfffffff).toString(16).padStart(7,'0'),
      service: pick(['api','auth','db','workers','dashboard']),
      env: pick(['prod','prod','staging','canary']),
      author: pick(OWNERS.slice(0,4)).id,
      shippedAt: '2026-04-' + String(1 + Math.floor(r()*27)).padStart(2,'0'),
      rollback: r() > 0.85,
    };
    case 'roadmap': return {
      id: i + 1,
      feature: pick(['Bulk import wizard','Snapshot restore','Read-only mirrors','Granular permissions','Mobile dashboards','Real-time sync','SSO via SAML 2.0','Audit log export','API rate-limit tiers']),
      theme: pick(['Performance','Onboarding','Pricing','Reliability','Mobile']),
      status: pick(['Backlog','Discovery','Building','Beta','Shipped']),
      pm: pick(OWNERS.slice(0,4)).id,
      targetQ: pick(['2026 Q2','2026 Q3','2026 Q4','2027 Q1']),
      effort: pick(['XS','S','M','L','XL']),
      icpFit: Math.floor(r() * 100),
      enrichPending: false,
    };
    case 'campaigns': return {
      id: i + 1,
      campaign: pick(['Q2 Webinar Series','Always-On LinkedIn','Brand Search','Lookalikes','April Newsletter','Retargeting Pool A','Partner Co-Marketing']),
      channel: pick(['Email','LinkedIn','Search','Display','Webinar']),
      spend: Math.round((500 + r() * 38000) / 50) * 50,
      leads: Math.floor(r() * 480),
      cpl: 0, // computed after
      live: r() > 0.4,
      owner: pick(OWNERS.slice(0,4)).id,
    };
    default: return { id: i + 1 };
  }
}

function seedRows(kind, n, seed) {
  const r = rng(seed);
  const pick = pickFn(r);
  const rows = [];
  for (let i = 0; i < n; i++) {
    const row = buildRow(kind, i, r, pick);
    // Fix computed fields
    if (kind === 'sales-targets') row.pct = Math.round(row.attained / row.quota * 100);
    if (kind === 'inventory') row.lowStock = row.onHand < row.reorder;
    if (kind === 'campaigns') row.cpl = row.leads ? Math.round(row.spend / row.leads) : 0;
    rows.push(row);
  }
  return rows;
}

const COUNTS = {
  'sales-pipeline': 24, 'sales-targets': 4, 'cs-accounts': 22, 'tickets': 28,
  'inventory': 18, 'policies': 30, 'claims': 24, 'brokers': 14, 'incidents': 20,
  'deploys': 24, 'roadmap': 16, 'campaigns': 12,
};

export const ROW_DATA = {};
let seed = 7;
for (const c of CLIENTS) {
  for (const s of c.seats) {
    for (const sh of s.sheets) {
      ROW_DATA[sh.id] = seedRows(sh.seedKind, COUNTS[sh.seedKind] || 12, seed++);
    }
  }
}
