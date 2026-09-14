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

});

// Link bar submit handler
function handleVisit(inputId) {
  const input = document.getElementById(inputId || 'chat-input');
  if (!input) return;

  let url = input.value.trim();
  if (url === '') return;

  // Allow entering the link with or without a protocol
  if (!/^https?:\/\//i.test(url)) {
    url = 'https://' + url;
  }

  window.open(url, '_blank', 'noopener');
}


// ----------------------------------------------------
// TAB 02: CREDENTIAL CHECK
// Pure client-side string templating. No fetch, no API call, no key value
// ever entered on this page — the commands reference environment variables only.
// ----------------------------------------------------

// The platform difference, which is the point of this block
const CRED_PLATFORMS = {
  mac: {
    label: 'macOS / Linux',
    exe: 'curl',
    cont: '\\',
    ref: v => '$' + v,
    inspect: v => 'echo "${' + v + ':0:4}... (${#' + v + '} chars)"',
    warning: null
  },
  ps: {
    label: 'Windows PowerShell',
    style: 'powershell',
    exe: 'Invoke-WebRequest',
    cont: '`',
    ref: v => '$env:' + v,
    inspect: v => '$env:' + v + '.Substring(0,4)',
    warning: {
      label: 'POWERSHELL: CURL IS NOT CURL',
      text: 'In PowerShell, curl is an ALIAS for Invoke-WebRequest, so a copied curl line fails with ' +
        'confusing errors about parameter names that have nothing to do with your key. Use the native ' +
        'cmdlet below instead. One thing to know: Invoke-WebRequest THROWS on a 401 rather than ' +
        'returning it, so $r.StatusCode never prints on a refused key — you get a red error instead. ' +
        'To read the status of a failure, add -SkipHttpErrorCheck on PowerShell 7 or later, or wrap the ' +
        'call in try/catch and read $_.Exception.Response.StatusCode.value__.'
    }
  },
  cmd: {
    label: 'Windows CMD',
    style: 'cmd',
    exe: 'curl.exe',
    cont: '^',
    ref: v => '%' + v + '%',
    inspect: v => 'echo %' + v + '%',
    warning: {
      label: 'CMD: DOUBLE QUOTES ONLY',
      text: 'In CMD, curl.exe works directly, but single quotes do not. Use double quotes throughout, and ' +
        '%VAR% instead of $VAR.'
    }
  }
};

// Per service: how the key is passed, what a good answer looks like, what each failure means
const CRED_SERVICES = {
  lta: {
    label: 'LTA DataMall',
    env: 'LTA_ACCOUNT_KEY',
    passing: 'a header named exactly AccountKey',
    rowsKey: 'value',
    endpoint: 'https://datamall2.mytransport.sg/ltaodataservice/CarParkAvailabilityv2',
    cache: 's-maxage=20, stale-while-revalidate=40',
    header: 'AccountKey',
    reads: [
      { state: 'ok', chip: '200', text: 'A body starting with a "value" array. That is a good answer.' },
      { state: 'bad', chip: '401', text: 'A value arrived and was rejected — a wrong key, or the variable is unset and JavaScript sent the string "undefined".' },
      { state: 'bad', chip: '404', text: 'The header never arrived. Check the capitalisation of AccountKey, and that you used https.' },
      { state: 'warn', chip: 'empty body', text: 'LTA returns NOTHING on 401, which is why response.ok must be checked BEFORE calling .json().' }
    ],
    traps: [
      'Guard BEFORE the fetch: if LTA_ACCOUNT_KEY is missing or empty, return 503 and do not call LTA at all. An unset variable is sent as the word "undefined" and LTA answers 401 exactly as it would for a wrong key.',
      'LTA returns an empty body on 401, so response.json() on a failed reply throws. Check response.ok BEFORE reading any body.',
      'The header name is exactly AccountKey. Any other capitalisation produces a 404, not a 401.'
    ]
  },
  datagov: {
    label: 'data.gov.sg',
    env: null,
    passing: 'nothing — there is no key at all',
    rowsKey: 'data',
    endpoint: 'https://api-open.data.gov.sg/v2/real-time/api/two-hr-forecast',
    cache: 's-maxage=300, stale-while-revalidate=600',
    reads: [
      { state: 'ok', chip: '200', text: 'A body wrapped as {"code":0,"data":{...},"errorMsg":""}. That is a good answer.' },
      { state: 'warn', chip: 'keyless', text: 'No key, so this can be UNREACHABLE but never REFUSED. Those are different states and must not share a sentence.' },
      { state: 'bad', chip: '429', text: 'Rate limited — roughly six calls per ten seconds FOR THE WHOLE CAMPUS, not per user.' }
    ],
    traps: [
      'There is no credential here, and therefore no refused state. Do not write key-handling code, and do not emit a "refused" sentence — this feed can be unreachable, never refused.',
      'The payload is wrapped: the data you want is under "data", and a failure is signalled in "code" and "errorMsg", not only in the HTTP status.',
      'Rate limit is roughly six calls per ten seconds shared across everyone on the same network. Cache accordingly.'
    ]
  },
  meteo: {
    label: 'Open-Meteo',
    env: null,
    passing: 'nothing — there is no key',
    endpoint: 'https://api.open-meteo.com/v1/forecast?latitude=1.29&longitude=103.85&current=temperature_2m',
    cache: 's-maxage=900, stale-while-revalidate=1800',
    reads: [
      { state: 'ok', chip: '200', text: 'A forecast body. That is a good answer.' },
      { state: 'warn', chip: 'licence', text: 'The free tier is CC-BY 4.0 and non-commercial. Credit Open-Meteo in your footer with a link.' },
      { state: 'warn', chip: 'keyless', text: 'No key, so this can be UNREACHABLE but never REFUSED. Those are different states and must not share a sentence.' }
    ],
    traps: [
      'There is no credential here, and therefore no refused state. Do not write key-handling code, and do not emit a "refused" sentence — this feed can be unreachable, never refused.',
      'The free tier is CC-BY 4.0 and non-commercial. Credit Open-Meteo in the footer with a link, and say in the write-up that the licence is non-commercial.',
      'A geocoding query of fewer than two characters returns nothing. That is an empty state with its own sentence, not an error.'
    ]
  },
  guardian: {
    label: 'Guardian',
    env: 'GUARDIAN_API_KEY',
    passing: 'a query parameter, api-key=',
    rowsKey: 'response',
    endpoint: 'https://content.guardianapis.com/search?q=singapore&show-fields=body&api-key=',
    cache: 's-maxage=600, stale-while-revalidate=1200',
    query: 'api-key',
    reads: [
      { state: 'ok', chip: '200', text: 'A body nested under "response" with a "total". That is a good answer.' },
      { state: 'bad', chip: '401 / 403', text: 'The key was rejected, or it has not been activated yet after signup.' },
      { state: 'warn', chip: 'quota', text: '500 calls a day, non-commercial. Ask for "body", not "trailText".' }
    ],
    traps: [
      'The key travels in the query string as api-key=, so the whole URL is a secret. Build it inside api/ and never log the full URL.',
      'A freshly issued key can 403 until it is activated after signup — that is not the same as a wrong key.',
      'Ask for show-fields=body, not trailText. The quota is 500 calls a day and the licence is non-commercial.'
    ]
  },
  nasa: {
    label: 'NASA',
    env: 'NASA_API_KEY',
    passing: 'a query parameter, api_key=',
    endpoint: 'https://api.nasa.gov/planetary/apod?api_key=',
    cache: 's-maxage=3600, stale-while-revalidate=7200',
    query: 'api_key',
    reads: [
      { state: 'ok', chip: '200', text: 'A picture-of-the-day body. That is a good answer.' },
      { state: 'bad', chip: '403', text: 'API_KEY_INVALID, OVER_RATE_LIMIT, or API_KEY_MISSING — read the body, it says which.' },
      { state: 'warn', chip: 'timeout', text: 'The Earth imagery endpoints (earth/assets, earth/imagery) have a history of timing out while apod returns 200 on the same key. Test apod first to tell a dead service from a dead key.' }
    ],
    traps: [
      'A 403 body names the actual cause — API_KEY_INVALID, OVER_RATE_LIMIT or API_KEY_MISSING. Read it and map each to a different sentence on screen.',
      'earth/assets and earth/imagery time out regularly while apod answers 200 on the same key. Treat a timeout as unreachable, not as refused.',
      'The key travels in the query string as api_key=, so the whole URL is a secret. Build it inside api/ and never log it.'
    ]
  },
  alphavantage: {
    label: 'Alpha Vantage',
    env: 'ALPHAVANTAGE_API_KEY',
    passing: 'a query parameter, apikey=',
    endpoint: 'https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=IBM&apikey=',
    cache: 's-maxage=60, stale-while-revalidate=120',
    query: 'apikey',
    reads: [
      { state: 'ok', chip: '200', text: 'A body with a "Meta Data" key. That is a good answer.' },
      { state: 'bad', chip: 'the trap', text: 'When rate-limited it returns 200 OK with an "Information" key and NO data. response.ok is true. Nothing throws.' },
      { state: 'warn', chip: 'rate', text: 'Roughly one request per second on the free tier. Check for "Information" or "Note" BEFORE looking for data.' }
    ],
    traps: [
      'THE TRAP: when rate-limited Alpha Vantage returns 200 OK with an "Information" key and no data. response.ok is true and nothing throws. Check for "Information" or "Note" BEFORE looking for data, and render that as its own sentence.',
      'Roughly one request per second on the free tier. Cache and debounce rather than retrying.',
      'The key travels in the query string as apikey=, so the whole URL is a secret. Build it inside api/ and never log it.'
    ]
  }
};

function initCredentialCheck() {
  const showBtn = document.getElementById('btn-cred-show');
  if (!showBtn) return;

  const serviceGroup = document.getElementById('cred-services');
  const platformGroup = document.getElementById('cred-platforms');
  const output = document.getElementById('cred-output');
  const errLine = document.getElementById('err-cred');

  let serviceKey = null;
  let platformKey = null;
  let modeKey = 'full';
  const modeGroup = document.getElementById('cred-modes');

  function singleSelect(group, attr, current, clicked) {
    const key = clicked.dataset[attr];
    const clearing = (current === key);
    group.querySelectorAll('.toggle-btn').forEach(b => {
      const on = !clearing && b.dataset[attr] === key;
      b.classList.toggle('active', on);
      b.setAttribute('aria-pressed', String(on));
    });
    return clearing ? null : key;
  }

  serviceGroup.addEventListener('click', e => {
    const btn = e.target.closest('.toggle-btn');
    if (btn) serviceKey = singleSelect(serviceGroup, 'service', serviceKey, btn);
  });

  platformGroup.addEventListener('click', e => {
    const btn = e.target.closest('.toggle-btn');
    if (btn) platformKey = singleSelect(platformGroup, 'platform', platformKey, btn);
  });

  modeGroup.addEventListener('click', e => {
    const btn = e.target.closest('.toggle-btn');
    if (!btn) return;
    modeKey = btn.dataset.mode;          // one is always selected; Full is the default
    modeGroup.querySelectorAll('.toggle-btn').forEach(b => {
      const on = b.dataset.mode === modeKey;
      b.classList.toggle('active', on);
      b.setAttribute('aria-pressed', String(on));
    });
  });

  showBtn.addEventListener('click', () => {
    if (!serviceKey || !platformKey) {
      errLine.hidden = false;
      output.hidden = true;
      return;
    }
    errLine.hidden = true;

    const svc = CRED_SERVICES[serviceKey];
    const plat = CRED_PLATFORMS[platformKey];

    renderWarning(plat);
    document.getElementById('cred-command').textContent = buildCredCommand(svc, plat, modeKey);
    document.getElementById('cred-reads').innerHTML = buildCredReads(svc);
    document.getElementById('cred-checks').innerHTML = buildCredChecks(svc, plat);
    document.getElementById('cred-rgogc').textContent = buildCredPrompt(svc, plat);

    output.hidden = false;
    output.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

function renderWarning(plat) {
  const box = document.getElementById('cred-warning');
  if (!plat.warning) {
    box.hidden = true;
    return;
  }
  document.getElementById('cred-warning-label').textContent = plat.warning.label;
  document.getElementById('cred-warning-text').textContent = plat.warning.text;
  box.hidden = false;
}

function buildCredCommand(svc, plat, mode) {
  if (plat.style === 'powershell') return buildPowerShellCommand(svc, plat, mode);
  if (plat.style === 'cmd') return buildCmdCommand(svc, plat, mode);
  return buildCurlCommand(svc, plat, mode);
}

// The URL, however the key travels
function credUrl(svc, plat) {
  return svc.endpoint + (svc.env && !svc.header ? plat.ref(svc.env) : '');
}

// curl, on macOS and Linux
function buildCurlCommand(svc, plat, mode) {
  const flags = mode === 'headers' ? '-4 -sI' : (mode === 'truncated' ? '-4 -s' : '-4 -is');
  const head = svc.header
    ? 'curl ' + flags + ' -H "' + svc.header + ': ' + plat.ref(svc.env) + '" \\\n  "' + credUrl(svc, plat) + '"'
    : 'curl ' + flags + ' "' + credUrl(svc, plat) + '"';

  return mode === 'truncated' ? head + ' \\\n' + pythonTruncate(svc, 'python3') : head;
}

// curl.exe on CMD: double quotes only, %VAR%, and a one-line python
function buildCmdCommand(svc, plat, mode) {
  const flags = mode === 'headers' ? '-4 -sI' : (mode === 'truncated' ? '-4 -s' : '-4 -is');
  const head = svc.header
    ? 'curl.exe ' + flags + ' -H "' + svc.header + ': ' + plat.ref(svc.env) + '" ^\n  "' + credUrl(svc, plat) + '"'
    : 'curl.exe ' + flags + ' "' + credUrl(svc, plat) + '"';

  if (mode !== 'truncated') return head;

  // CMD cannot carry a multi-line quoted string, so this one is a single statement
  const key = svc.rowsKey ? "d=d.get('" + svc.rowsKey + "',d) if isinstance(d,dict) else d;" : '';
  return head + ' ^\n| python -c "import sys,json;d=json.load(sys.stdin);' + key +
    'd=next((v for v in d.values() if isinstance(v,list)),d) if isinstance(d,dict) else d;' +
    'rows=d if isinstance(d,list) else [d];print(json.dumps(rows[:3],indent=2));' +
    'print(\'... %d more records on this page\' % max(len(rows)-3,0))"';
}

// Shared python step — resolves the envelope without assuming a shape it has not been told
function pythonTruncate(svc, exe) {
  const lines = [];
  lines.push('| ' + exe + ' -c "');
  lines.push('import sys, json');
  lines.push('d = json.load(sys.stdin)');
  if (svc.rowsKey) lines.push("d = d.get('" + svc.rowsKey + "', d) if isinstance(d, dict) else d");
  lines.push('if isinstance(d, dict):');
  lines.push('    d = next((v for v in d.values() if isinstance(v, list)), d)');
  lines.push('rows = d if isinstance(d, list) else [d]');
  lines.push('print(json.dumps(rows[:3], indent=2))');
  lines.push("print(f'... {max(len(rows) - 3, 0)} more records on this page')");
  lines.push('"');
  return lines.join('\n');
}

// PowerShell uses its own cmdlet, not a curl line with the arguments swapped
function buildPowerShellCommand(svc, plat, mode) {
  const headerArg = svc.header
    ? ' `\n  -Headers @{ "' + svc.header + '" = ' + plat.ref(svc.env) + ' }'
    : '';
  const uri = '"' + credUrl(svc, plat) + '"';

  if (mode === 'headers') {
    return '$r = Invoke-WebRequest -Method Head -Uri ' + uri + headerArg + '\n' +
      '$r.StatusCode\n' +
      '$r.Headers | Format-Table -AutoSize';
  }

  const call = '$r = Invoke-WebRequest -Uri ' + uri + headerArg;

  if (mode === 'truncated') {
    // No python needed — PowerShell parses JSON natively
    const path = svc.rowsKey ? '.' + svc.rowsKey : '';
    return call + '\n' +
      '$d = ($r.Content | ConvertFrom-Json)' + path + '\n' +
      '$d | Select-Object -First 3 | ConvertTo-Json -Depth 4\n' +
      '"... $($d.Count - 3) more records on this page"';
  }

  return call + '\n$r.StatusCode\n$r.Content.Substring(0, 400)';
}

function buildCredReads(svc) {
  return svc.reads.map(r =>
    '<div class="rule-card state-' + r.state + ' cred-read">' +
    '<span class="status-chip">' + r.chip + '</span>' +
    '<p>' + r.text + '</p>' +
    '</div>'
  ).join('');
}

function buildCredChecks(svc, plat) {
  const varLine = svc.env
    ? 'Is the variable actually set? <code>' + plat.inspect(svc.env) + '</code>'
    : 'There is no variable to check — this service takes no key, so an empty response means the service, not your setup.';

  return [
    '<p>' + varLine + '</p>',
    '<p>Use <code>-i</code> or <code>-is</code> to see the status line. The browser console hides the headers you need.</p>',
    '<p>A length of zero means the variable is unset — which produces the same 401 as a wrong key. That is the whole reason <code>/api/health</code> exists.</p>'
  ].join('');
}

function buildCredPrompt(svc, plat) {
  const keyed = Boolean(svc.env);
  const out = [];

  out.push('ROLE: You are a senior full-stack developer working on a static site deployed to');
  out.push('  Vercel from GitHub, with serverless functions in api/.');
  out.push('');
  out.push('GOAL: One function that calls ' + svc.label + ':');
  out.push('  ' + svc.endpoint + (svc.query ? '<key>' : ''));
  out.push('  Plus api/health.js, reporting keyConfigured without revealing the value.');
  out.push('');
  out.push('OUTPUT:');
  out.push('  The handler at the project root in api/, a sibling of package.json. Never inside src/.');
  out.push('  package.json needs "type": "module", or name the file .mjs.');
  out.push('  The four screen states as four distinct sentences — loading, empty, refused,');
  out.push('  unreachable — never a blank space where a value belongs.');
  out.push('');
  out.push('GUARDRAILS:');
  svc.traps.forEach(t => out.push('  - ' + t));
  if (keyed) {
    out.push('  - Read ' + svc.env + ' via process.env inside api/ only. Never in browser code.');
    out.push('  - No variable name starts with VITE_.');
    out.push('  - Never print the key, or any part of it, in a response or a log.');
    out.push('  - Guard BEFORE the fetch: no key, no call.');
  } else {
    out.push('  - There is no credential for this service, so there is no refused state. Do not');
    out.push('    write key-handling code, do not add an environment variable, and do not emit a');
    out.push('    "refused" sentence — it can be unreachable, never refused.');
    out.push('  - No variable name starts with VITE_.');
  }
  out.push('  - Check response.ok BEFORE reading any body.');
  out.push('  - Cast every number at the boundary. Never render NaN, null or undefined as a value.');
  out.push('  - No new npm packages. No database. No login.');
  out.push('');
  out.push('CONTEXT:');
  out.push(keyed
    ? '  The key lives only in a Vercel environment variable named ' + svc.env + ', passed as ' + svc.passing + '.'
    : '  There is no environment variable. The service takes ' + svc.passing + '.');
  out.push('  Cache-Control on the data route: ' + svc.cache);
  out.push('  Verified from ' + plat.label + ' with ' + plat.exe + ' before any code was written.');
  out.push('');
  out.push('  PASTE 15-25 LINES OF THE REAL RESPONSE HERE — I called this endpoint by hand first.');
  out.push('  [paste here]');

  return out.join('\n');
}

document.addEventListener('DOMContentLoaded', initCredentialCheck);


// ----------------------------------------------------
// TAB 02: EXPANDABLE BREAK CARDS
// Each card head is a real button controlling its own region.
// Expand downward — a flip would force the back face to match the front's height,
// and these back faces carry a code block plus two paragraphs.
// ----------------------------------------------------
function initBreakCards() {
  const toggles = document.querySelectorAll('.break-toggle');
  if (!toggles.length) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  toggles.forEach(btn => {
    const panel = document.getElementById(btn.getAttribute('aria-controls'));
    if (!panel) return;

    // Leaving one open does not close the others
    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      if (open) {
        collapse(panel, reduceMotion.matches);
      } else {
        expand(panel, reduceMotion.matches);
      }
    });

    // Once open, let the panel grow with its content instead of staying pinned
    panel.addEventListener('transitionend', e => {
      if (e.propertyName === 'height' && panel.classList.contains('is-open')) {
        panel.style.height = 'auto';
      }
    });
  });
}

function expand(panel, instant) {
  panel.classList.add('is-open');
  if (instant) {
    panel.style.height = 'auto';
    return;
  }
  panel.style.height = panel.scrollHeight + 'px';
}

function collapse(panel, instant) {
  if (instant) {
    panel.classList.remove('is-open');
    panel.style.height = '';
    return;
  }
  // From auto to a measured height, so the transition has somewhere to travel from
  panel.style.height = panel.scrollHeight + 'px';
  requestAnimationFrame(() => {
    panel.classList.remove('is-open');
    panel.style.height = '';
  });
}

document.addEventListener('DOMContentLoaded', initBreakCards);


// ----------------------------------------------------
// TAB BAR: keep the selected tab visible when five tabs overflow
// ----------------------------------------------------
function initTabScroll() {
  const bar = document.querySelector('.tab-bar');
  if (!bar) return;

  bar.addEventListener('click', e => {
    const btn = e.target.closest('.tab-btn');
    if (!btn) return;
    // after the existing handler has set .active
    requestAnimationFrame(() => {
      btn.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    });
  });
}

document.addEventListener('DOMContentLoaded', initTabScroll);
