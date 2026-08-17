// ----------------------------------------------------
// GLOBAL TAB AND CHAT SYSTEM
// ----------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  // Tab navigation
  const tabs = document.querySelectorAll('.tab-btn');
  const panels = document.querySelectorAll('.tab-panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetTab = tab.dataset.tab;

      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));

      tab.classList.add('active');
      
      const targetPanel = document.getElementById(`panel-${targetTab}`);
      if (targetPanel) {
        targetPanel.classList.add('active');
      }
    });
  });

  // Initialize tabs features
  initOpportunityTab();
  initSimulationTab();
  initDecisionAnalysisTab();
});

// Chat bar submit handler
function handleChat() {
  const input = document.getElementById('chat-input');
  if (input && input.value.trim() !== '') {
    alert(`[MBAI Chat Assistant Stub] You asked:\n"${input.value}"\n\nThis will be wired to a real backend AI later!`);
    input.value = '';
  }
}

// ----------------------------------------------------
// TAB 01: TOPIC OPPORTUNITY ALGORITHM
// ----------------------------------------------------
function initOpportunityTab() {
  const sliderImp = document.getElementById('slider-importance');
  const sliderSat = document.getElementById('slider-satisfaction');
  const valImp = document.getElementById('val-importance');
  const valSat = document.getElementById('val-satisfaction');
  
  if (!sliderImp || !sliderSat) return;

  // Listen for slider inputs
  sliderImp.addEventListener('input', () => {
    valImp.innerText = sliderImp.value;
    updateOpportunity();
  });

  sliderSat.addEventListener('input', () => {
    valSat.innerText = sliderSat.value;
    updateOpportunity();
  });

  // Render static 11x11 heatmap base structure
  renderOpportunityHeatmap();

  // Run initial calculations
  updateOpportunity();
}

function calculateOpportunityScore(imp, sat) {
  return imp + Math.max(imp - sat, 0);
}

function getOpportunityBand(score) {
  if (score >= 15) return { name: "Ripe Opportunity", color: "#2F9E5B" };
  if (score >= 12) return { name: "High Opportunity", color: "#7CB342" };
  if (score >= 10) return { name: "Moderate", color: "#C9A227" };
  return { name: "Low / Over-served", color: "#C0392B" };
}

function updateOpportunity() {
  const imp = parseInt(document.getElementById('slider-importance').value);
  const sat = parseInt(document.getElementById('slider-satisfaction').value);
  
  const score = calculateOpportunityScore(imp, sat);
  const band = getOpportunityBand(score);

  // Update live score display
  const scoreNum = document.getElementById('opportunity-score');
  const scoreLabel = document.getElementById('opportunity-band');

  scoreNum.innerText = score;
  scoreNum.style.color = band.color;
  scoreLabel.innerText = band.name;
  scoreLabel.style.color = band.color;

  // Update heatmap cell outline highlights
  const cells = document.querySelectorAll('.opp-cell');
  cells.forEach(cell => {
    cell.classList.remove('active-cell');
    if (parseInt(cell.dataset.imp) === imp && parseInt(cell.dataset.sat) === sat) {
      cell.classList.add('active-cell');
    }
  });
}

function renderOpportunityHeatmap() {
  const table = document.getElementById('opportunity-heatmap');
  if (!table) return;

  table.innerHTML = '';

  // Render header row (Satisfaction 0->10)
  const headerRow = document.createElement('tr');
  const emptyTh = document.createElement('th');
  headerRow.appendChild(emptyTh); // Top-left blank space

  for (let sat = 0; sat <= 10; sat++) {
    const th = document.createElement('th');
    th.innerText = sat;
    headerRow.appendChild(th);
  }
  table.appendChild(headerRow);

  // Render rows (Importance 10->0)
  for (let imp = 10; imp >= 0; imp--) {
    const tr = document.createElement('tr');
    
    // Row label header
    const th = document.createElement('th');
    th.className = 'row-label-header';
    th.innerText = imp;
    tr.appendChild(th);

    // Heatmap cells
    for (let sat = 0; sat <= 10; sat++) {
      const td = document.createElement('td');
      td.className = 'opp-cell';
      td.dataset.imp = imp;
      td.dataset.sat = sat;

      const score = calculateOpportunityScore(imp, sat);
      td.innerText = score;

      // Color cell by its band
      if (score >= 15) td.className += ' cell-band-ripe';
      else if (score >= 12) td.className += ' cell-band-high';
      else if (score >= 10) td.className += ' cell-band-moderate';
      else td.className += ' cell-band-low';

      // Cell interaction updates sliders on click
      td.addEventListener('click', () => {
        document.getElementById('slider-importance').value = imp;
        document.getElementById('slider-satisfaction').value = sat;
        document.getElementById('val-importance').innerText = imp;
        document.getElementById('val-satisfaction').innerText = sat;
        updateOpportunity();
      });

      tr.appendChild(td);
    }
    table.appendChild(tr);
  }
}

// ----------------------------------------------------
// TAB 02: DATA SIMULATION LOGIC
// ----------------------------------------------------
let simulatedUsers = [];

const INITIAL_SIM_USERS = [
  { user_id: 'u001', name: 'Alex', interest_tags: 'food, outdoors', session_duration_sec: 510, page_views: 6, scroll_depth_pct: 29, rage_clicks: 0, dead_clicks: 4, click_count: 17 },
  { user_id: 'u002', name: 'Priya', interest_tags: 'language', session_duration_sec: 156, page_views: 6, scroll_depth_pct: 48, rage_clicks: 0, dead_clicks: 3, click_count: 40 },
  { user_id: 'u003', name: 'Wei Ling', interest_tags: 'food', session_duration_sec: 169, page_views: 22, scroll_depth_pct: 42, rage_clicks: 5, dead_clicks: 4, click_count: 12 },
  { user_id: 'u004', name: 'Marcus', interest_tags: 'outdoors, sports', session_duration_sec: 136, page_views: 21, scroll_depth_pct: 75, rage_clicks: 0, dead_clicks: 2, click_count: 4 },
  { user_id: 'u005', name: 'Ines', interest_tags: 'outdoors', session_duration_sec: 229, page_views: 21, scroll_depth_pct: 36, rage_clicks: 4, dead_clicks: 3, click_count: 1 },
  { user_id: 'u006', name: 'Ravi', interest_tags: 'other, sports', session_duration_sec: 492, page_views: 2, scroll_depth_pct: 54, rage_clicks: 3, dead_clicks: 1, click_count: 22 },
  { user_id: 'u007', name: 'Tomo', interest_tags: 'arts, outdoors', session_duration_sec: 124, page_views: 14, scroll_depth_pct: 64, rage_clicks: 5, dead_clicks: 1, click_count: 21 },
  { user_id: 'u008', name: 'Zoe', interest_tags: 'sports, outdoors', session_duration_sec: 498, page_views: 13, scroll_depth_pct: 93, rage_clicks: 4, dead_clicks: 3, click_count: 29 },
  { user_id: 'u009', name: 'Hassan', interest_tags: 'language, sports', session_duration_sec: 452, page_views: 13, scroll_depth_pct: 56, rage_clicks: 0, dead_clicks: 3, click_count: 33 },
  { user_id: 'u010', name: 'Elena', interest_tags: 'sports, arts', session_duration_sec: 72, page_views: 7, scroll_depth_pct: 89, rage_clicks: 1, dead_clicks: 4, click_count: 22 },
  { user_id: 'u011', name: 'Kenji', interest_tags: 'professional', session_duration_sec: 42, page_views: 3, scroll_depth_pct: 38, rage_clicks: 6, dead_clicks: 3, click_count: 17 },
  { user_id: 'u012', name: 'Amara', interest_tags: 'food, outdoors', session_duration_sec: 178, page_views: 24, scroll_depth_pct: 17, rage_clicks: 0, dead_clicks: 2, click_count: 12 },
  { user_id: 'u013', name: 'Liam', interest_tags: 'language, food', session_duration_sec: 332, page_views: 8, scroll_depth_pct: 57, rage_clicks: 5, dead_clicks: 2, click_count: 5 },
  { user_id: 'u014', name: 'Chloe', interest_tags: 'arts', session_duration_sec: 245, page_views: 12, scroll_depth_pct: 45, rage_clicks: 1, dead_clicks: 3, click_count: 18 },
  { user_id: 'u015', name: 'Dave', interest_tags: 'professional, other', session_duration_sec: 90, page_views: 4, scroll_depth_pct: 20, rage_clicks: 0, dead_clicks: 1, click_count: 8 },
  { user_id: 'u016', name: 'Emily', interest_tags: 'food, arts', session_duration_sec: 400, page_views: 18, scroll_depth_pct: 70, rage_clicks: 2, dead_clicks: 3, click_count: 25 },
  { user_id: 'u017', name: 'Frank', interest_tags: 'sports', session_duration_sec: 150, page_views: 5, scroll_depth_pct: 30, rage_clicks: 0, dead_clicks: 2, click_count: 14 },
  { user_id: 'u018', name: 'Grace', interest_tags: 'language, professional', session_duration_sec: 310, page_views: 9, scroll_depth_pct: 60, rage_clicks: 1, dead_clicks: 4, click_count: 19 },
  { user_id: 'u019', name: 'Henry', interest_tags: 'outdoors', session_duration_sec: 280, page_views: 11, scroll_depth_pct: 50, rage_clicks: 0, dead_clicks: 2, click_count: 11 },
  { user_id: 'u020', name: 'Jack', interest_tags: 'other, food', session_duration_sec: 185, page_views: 7, scroll_depth_pct: 35, rage_clicks: 3, dead_clicks: 1, click_count: 15 }
];

function initSimulationTab() {
  simulatedUsers = JSON.parse(JSON.stringify(INITIAL_SIM_USERS)); // Deep copy seed users

  // Toolbar events
  document.getElementById('btn-rand-all').addEventListener('click', randomizeAllUsers);
  document.getElementById('btn-add-user').addEventListener('click', addSimulatedUser);
  document.getElementById('btn-export-json').addEventListener('click', exportSimulatedUsers);

  // Render initial table rows
  renderSimTable();
}

function renderSimTable() {
  const tbody = document.querySelector('#sim-table tbody');
  if (!tbody) return;

  tbody.innerHTML = '';

  simulatedUsers.forEach((user, index) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${index + 1}</td>
      <td><input type="text" value="${user.user_id}" style="width: 55px;" oninput="updateSimField(${index}, 'user_id', this.value)"></td>
      <td><input type="text" value="${user.name}" style="width: 85px;" oninput="updateSimField(${index}, 'name', this.value)"></td>
      <td><input type="text" value="${user.interest_tags}" oninput="updateSimField(${index}, 'interest_tags', this.value)"></td>
      <td><input type="number" value="${user.session_duration_sec}" style="width: 70px;" oninput="updateSimField(${index}, 'session_duration_sec', parseInt(this.value)||0)"></td>
      <td><input type="number" value="${user.page_views}" style="width: 50px;" oninput="updateSimField(${index}, 'page_views', parseInt(this.value)||0)"></td>
      <td><input type="number" value="${user.scroll_depth_pct}" style="width: 50px;" oninput="updateSimField(${index}, 'scroll_depth_pct', parseInt(this.value)||0)"></td>
      <td><input type="number" value="${user.rage_clicks}" style="width: 50px;" oninput="updateSimField(${index}, 'rage_clicks', parseInt(this.value)||0)"></td>
      <td><input type="number" value="${user.dead_clicks}" style="width: 50px;" oninput="updateSimField(${index}, 'dead_clicks', parseInt(this.value)||0)"></td>
      <td><input type="number" value="${user.click_count}" style="width: 50px;" oninput="updateSimField(${index}, 'click_count', parseInt(this.value)||0)"></td>
      <td><button class="btn-remove-user" title="Remove User" onclick="removeSimUser(${index})">×</button></td>
    `;
    tbody.appendChild(tr);
  });

  // Update status label
  document.getElementById('sim-status').innerText = `${simulatedUsers.length} users in table.`;
}

function updateSimField(index, field, value) {
  if (simulatedUsers[index]) {
    simulatedUsers[index][field] = value;
  }
}

function removeSimUser(index) {
  simulatedUsers.splice(index, 1);
  renderSimTable();
}

function addSimulatedUser() {
  const nextIdx = simulatedUsers.length + 1;
  const newId = 'u' + String(nextIdx).padStart(3, '0');
  
  const newUser = {
    user_id: newId,
    name: `User ${nextIdx}`,
    interest_tags: 'food, other',
    session_duration_sec: Math.floor(Math.random() * 450) + 60,
    page_views: Math.floor(Math.random() * 20) + 2,
    scroll_depth_pct: Math.floor(Math.random() * 80) + 15,
    rage_clicks: Math.floor(Math.random() * 3),
    dead_clicks: Math.floor(Math.random() * 4),
    click_count: Math.floor(Math.random() * 30) + 5
  };

  simulatedUsers.push(newUser);
  renderSimTable();
}

function randomizeAllUsers() {
  const TAGS_POOL = ['food', 'outdoors', 'arts', 'sports', 'professional', 'language', 'other'];
  const NAMES_POOL = ['Alex', 'Priya', 'Wei Ling', 'Marcus', 'Ines', 'Ravi', 'Tomo', 'Zoe', 'Hassan', 'Elena', 'Kenji', 'Amara', 'Liam', 'Chloe', 'Dave', 'Emily', 'Frank', 'Grace', 'Henry', 'Jack'];

  simulatedUsers = simulatedUsers.map((u, i) => {
    // Select 1-3 random interest tags
    const numTags = Math.floor(Math.random() * 3) + 1;
    const shuffledTags = [...TAGS_POOL].sort(() => 0.5 - Math.random());
    const tags = shuffledTags.slice(0, numTags).join(', ');

    return {
      user_id: u.user_id,
      name: NAMES_POOL[i % NAMES_POOL.length] || `User ${i + 1}`,
      interest_tags: tags,
      session_duration_sec: Math.floor(Math.random() * 550) + 30,
      page_views: Math.floor(Math.random() * 25) + 1,
      scroll_depth_pct: Math.floor(Math.random() * 90) + 10,
      rage_clicks: Math.floor(Math.random() * 6),
      dead_clicks: Math.floor(Math.random() * 8),
      click_count: Math.floor(Math.random() * 40) + 2
    };
  });

  renderSimTable();
}

function exportSimulatedUsers() {
  // Map simulatedUsers, splitting interest_tags string into an array on export
  const exportList = simulatedUsers.map(user => {
    const tagsArr = user.interest_tags
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);
    return {
      ...user,
      interest_tags: tagsArr
    };
  });

  const jsonStr = JSON.stringify(exportList, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(jsonStr);

  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataUri);
  downloadAnchor.setAttribute('download', 'simulated_users.json');
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

// ----------------------------------------------------
// TAB 03: DECISION ANALYSIS (COSINE SIMILARITY)
// ----------------------------------------------------
let MATCH_NAMES = [
  "Tang", "Chow", "Alissa", "Wong", "Ling", "Emma", "Ethan", "Er", "Lim", "Ng",
  "Loh", "Ong", "Dai", "Valerie", "Qu", "Loh2", "Poh", "Koh", "Eric", "Ng2",
  "Bibi", "Chew", "Lee", "Low", "Agnes"
];

// Assigned groups to guarantee some clustering structure
let USER_GROUPS = [0, 1, 2, 3, 4, 5, 6, 7, 0, 1, 2, 3, 4, 5, 6, 7, 0, 1, 2, 3, 4, 5, 6, 7, 0];

let customerVectors = [];
let capitalVectors = [];
let activeDatasetName = 'customer'; // 'customer' or 'capital'
let activeOrderingMode = 'default'; // 'default', 'similarity', 'group'

let activeDisplayOrder = []; // Array of indices (0 to 24) representing ordering of rendered rows

function initDecisionAnalysisTab() {
  // Generate reproducible vector datasets using seed logic
  customerVectors = generatePrefVectors(100);
  capitalVectors = generatePrefVectors(200);

  // Setup buttons
  document.getElementById('btn-mode-customer').addEventListener('click', () => setAnalysisDataset('customer'));
  document.getElementById('btn-mode-capital').addEventListener('click', () => setAnalysisDataset('capital'));
  document.getElementById('btn-mode-similarity').addEventListener('click', () => setAnalysisOrdering('similarity'));
  document.getElementById('btn-mode-group').addEventListener('click', () => setAnalysisOrdering('group'));

  // JSON import
  document.getElementById('json-import-input').addEventListener('change', handleJsonFileImport);

  // Default display initialization
  setAnalysisDataset('customer');
}

// ----------------------------------------------------
// TAB 03: JSON FILE IMPORT
// ----------------------------------------------------
function buildVectorsFromImportedRecords(records) {
  const excludeKeys = new Set(['user_id', 'id', 'name', 'group', 'interest_tags']);
  const sampleRecord = records[0];
  const numericKeys = Object.keys(sampleRecord).filter(k => !excludeKeys.has(k) && !isNaN(parseFloat(sampleRecord[k])));

  // Union of all interest tags across records, one-hot encoded as extra dimensions
  const tagSet = new Set();
  records.forEach(r => {
    const tags = r.interest_tags;
    if (Array.isArray(tags)) tags.forEach(t => tagSet.add(String(t).trim().toLowerCase()));
    else if (typeof tags === 'string') tags.split(',').forEach(t => {
      const v = t.trim().toLowerCase();
      if (v) tagSet.add(v);
    });
  });
  const tagList = Array.from(tagSet);

  const vectors = records.map(r => {
    const vec = numericKeys.map(k => parseFloat(r[k]) || 0);
    if (tagList.length > 0) {
      let recTags = [];
      if (Array.isArray(r.interest_tags)) recTags = r.interest_tags.map(t => String(t).trim().toLowerCase());
      else if (typeof r.interest_tags === 'string') recTags = r.interest_tags.split(',').map(t => t.trim().toLowerCase());
      tagList.forEach(tag => vec.push(recTags.includes(tag) ? 1 : 0));
    }
    return vec;
  });

  return vectors;
}

function setImportStatus(message, statusClass) {
  const status = document.getElementById('json-import-status');
  status.innerText = message;
  status.classList.remove('import-status-ok', 'import-status-error');
  if (statusClass) status.classList.add(statusClass);
}

function handleJsonFileImport(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      if (!Array.isArray(data) || data.length < 2) {
        throw new Error('JSON must be an array of at least 2 records.');
      }

      const vectors = buildVectorsFromImportedRecords(data);
      if (vectors[0].length === 0) {
        throw new Error('No numeric or interest_tags fields found to build preference vectors.');
      }

      const names = data.map((r, i) => r.name || r.user_id || r.id || `Person ${i + 1}`);
      const groups = data.map(r => (typeof r.group === 'number' ? r.group : 0));

      MATCH_NAMES = names;
      USER_GROUPS = groups;
      customerVectors = vectors;
      capitalVectors = vectors;

      setImportStatus(`Loaded ${file.name} · ${names.length} people · ${vectors[0].length}-dim vectors`, 'import-status-ok');

      setAnalysisDataset('customer');
    } catch (err) {
      setImportStatus(`Import failed: ${err.message}`, 'import-status-error');
    }
  };
  reader.readAsText(file);
}

// LCG seed-based deterministic pseudo-random generator
function makeSeededRandom(seed) {
  let s = seed;
  return function() {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function generatePrefVectors(seedVal) {
  const rand = makeSeededRandom(seedVal);
  const dimensions = 6;
  const numGroups = 8;
  
  // Generate 8 group preference templates
  const groupTemplates = [];
  for (let g = 0; g < numGroups; g++) {
    const template = [];
    for (let d = 0; d < dimensions; d++) {
      template.push(rand() * 10);
    }
    groupTemplates.push(template);
  }

  // Create 25 vectors based on group assignment + minor noise
  const vectors = [];
  for (let i = 0; i < MATCH_NAMES.length; i++) {
    const groupNum = USER_GROUPS[i];
    const template = groupTemplates[groupNum];
    const personalVector = [];
    for (let d = 0; d < dimensions; d++) {
      const noise = (rand() - 0.5) * 1.8; // Minor deviation
      personalVector.push(Math.max(0.1, template[d] + noise));
    }
    vectors.push(personalVector);
  }
  return vectors;
}

// Vector algebra helper functions
function computeCosineSimilarity(a, b) {
  let dotProd = 0;
  let magA = 0;
  let magB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProd += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  if (magA === 0 || magB === 0) return 0;
  return dotProd / (Math.sqrt(magA) * Math.sqrt(magB));
}

// Nearest-neighbour chain ordering logic
function getSimilarityChainOrder(vectors) {
  const visited = new Set();
  const orderChain = [0];
  visited.add(0);

  while (orderChain.length < MATCH_NAMES.length) {
    const lastIdx = orderChain[orderChain.length - 1];
    let maxSim = -Infinity;
    let closestNeighborIdx = -1;

    for (let j = 0; j < MATCH_NAMES.length; j++) {
      if (!visited.has(j)) {
        const sim = computeCosineSimilarity(vectors[lastIdx], vectors[j]);
        if (sim > maxSim) {
          maxSim = sim;
          closestNeighborIdx = j;
        }
      }
    }

    if (closestNeighborIdx !== -1) {
      orderChain.push(closestNeighborIdx);
      visited.add(closestNeighborIdx);
    } else {
      break;
    }
  }
  return orderChain;
}

// Set active dataset and update view
function setAnalysisDataset(datasetName) {
  activeDatasetName = datasetName;
  activeOrderingMode = 'default';

  // Toggle button highlighting
  document.querySelectorAll('.toggle-btn').forEach(btn => btn.classList.remove('active', 'similarity-active'));
  
  if (datasetName === 'customer') {
    document.getElementById('btn-mode-customer').classList.add('active');
  } else {
    document.getElementById('btn-mode-capital').classList.add('active');
  }

  // Set active vectors and order
  activeDisplayOrder = Array.from({ length: MATCH_NAMES.length }, (_, i) => i);
  updateDecisionAnalysisView();
}

// Set active ordering mode and update view
function setAnalysisOrdering(orderMode) {
  activeOrderingMode = orderMode;
  
  document.querySelectorAll('.toggle-btn').forEach(btn => btn.classList.remove('active', 'similarity-active'));

  if (orderMode === 'similarity') {
    const simBtn = document.getElementById('btn-mode-similarity');
    simBtn.classList.add('active', 'similarity-active');

    // Nearest neighbour order
    const vectors = activeDatasetName === 'customer' ? customerVectors : capitalVectors;
    activeDisplayOrder = getSimilarityChainOrder(vectors);
  } else if (orderMode === 'group') {
    document.getElementById('btn-mode-group').classList.add('active');

    // Order by cluster group number
    activeDisplayOrder = Array.from({ length: MATCH_NAMES.length }, (_, i) => i);
    activeDisplayOrder.sort((a, b) => USER_GROUPS[a] - USER_GROUPS[b]);
  }

  updateDecisionAnalysisView();
}

function updateDecisionAnalysisView() {
  const vectors = activeDatasetName === 'customer' ? customerVectors : capitalVectors;
  
  // 1. Calculate similarity boundaries (excluding self-pairs along diagonal)
  let minSim = 1.0;
  let maxSim = 0.0;
  
  for (let i = 0; i < MATCH_NAMES.length; i++) {
    for (let j = i + 1; j < MATCH_NAMES.length; j++) {
      const sim = computeCosineSimilarity(vectors[i], vectors[j]);
      if (sim < minSim) minSim = sim;
      if (sim > maxSim) maxSim = sim;
    }
  }

  // Update scale legend labels
  document.getElementById('legend-min').innerText = minSim.toFixed(2);
  document.getElementById('legend-max').innerText = maxSim.toFixed(2);

  // 2. Render NxN Heatmap grid
  renderMatrixGrid(vectors, minSim, maxSim);

  // 3. Render top 4 closest pair cards
  renderClosestPairs(vectors);
}

function renderMatrixGrid(vectors, minSim, maxSim) {
  const matrix = document.getElementById('similarity-matrix');
  if (!matrix) return;

  matrix.innerHTML = '';

  // Header row (rotated vertical labels)
  const headerRow = document.createElement('tr');
  const emptyCell = document.createElement('th');
  emptyCell.className = 'row-label'; // Blank corner
  headerRow.appendChild(emptyCell);

  activeDisplayOrder.forEach(colIdx => {
    const th = document.createElement('th');
    th.className = 'col-header';
    const textDiv = document.createElement('div');
    textDiv.className = 'col-header-text';
    textDiv.innerText = MATCH_NAMES[colIdx];
    th.appendChild(textDiv);
    headerRow.appendChild(th);
  });
  matrix.appendChild(headerRow);

  // Grid content rows
  activeDisplayOrder.forEach(rowIdx => {
    const tr = document.createElement('tr');
    
    // Left row label
    const labelTd = document.createElement('td');
    labelTd.className = 'row-label';
    labelTd.innerText = MATCH_NAMES[rowIdx];
    labelTd.addEventListener('click', () => {
      alert(`Open profile for: ${MATCH_NAMES[rowIdx]}`);
    });
    tr.appendChild(labelTd);

    // Heatmap cells
    activeDisplayOrder.forEach(colIdx => {
      const td = document.createElement('td');
      td.className = 'similarity-cell';

      const sim = computeCosineSimilarity(vectors[rowIdx], vectors[colIdx]);
      
      // Set cell metadata tooltip
      td.title = `${MATCH_NAMES[rowIdx]} · ${MATCH_NAMES[colIdx]}\nSimilarity: ${sim.toFixed(3)}\nGroups: ${USER_GROUPS[rowIdx]} and ${USER_GROUPS[colIdx]}`;

      if (rowIdx === colIdx) {
        // Self-pair highlights
        td.style.backgroundColor = 'var(--accent)';
      } else {
        // Interpolate colors relative to present min/max values
        const normalized = (sim - minSim) / (maxSim - minSim);
        td.style.backgroundColor = `color-mix(in srgb, var(--primary) ${normalized * 100}%, var(--grey-light))`;
      }

      tr.appendChild(td);
    });

    matrix.appendChild(tr);
  });
}

function renderClosestPairs(vectors) {
  const container = document.getElementById('closest-pairs');
  if (!container) return;

  container.innerHTML = '';

  const uniquePairs = [];
  for (let i = 0; i < MATCH_NAMES.length; i++) {
    for (let j = i + 1; j < MATCH_NAMES.length; j++) {
      const sim = computeCosineSimilarity(vectors[i], vectors[j]);
      uniquePairs.push({
        p1: MATCH_NAMES[i],
        p2: MATCH_NAMES[j],
        sim: sim,
        g1: USER_GROUPS[i],
        g2: USER_GROUPS[j]
      });
    }
  }

  // Sort descending and slice top 4
  uniquePairs.sort((a, b) => b.sim - a.sim);
  const topPairs = uniquePairs.slice(0, 4);

  topPairs.forEach(pair => {
    const card = document.createElement('div');
    card.className = 'pair-card';
    card.innerHTML = `
      <div class="pair-names">${pair.p1} · ${pair.p2}</div>
      <div class="pair-cosine">cosine ${pair.sim.toFixed(3)}</div>
      <div class="pair-groups">Group ${pair.g1} and Group ${pair.g2}</div>
    `;
    container.appendChild(card);
  });
}
