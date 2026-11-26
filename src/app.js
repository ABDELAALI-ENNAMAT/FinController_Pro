// ==========================================
// 2. APP STATE & GLOBAL HELPERS
// ==========================================
const STATE = {
  section: 'executive-summary',
  entity: 'consolidated',
  period: 'ytd',
  theme: 'light'
};

function showToast(message, type = 'success') {
  const existing = document.querySelectorAll('.toast');
  existing.forEach(e => e.remove());

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  const icon = type === 'success' ? '✓' : type === 'warning' ? '⚠' : '✕';
  toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function navigateTo(id) {
  STATE.section = id;
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  const target = document.getElementById(id);
  if (target) target.classList.add('active');
  
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const nav = document.querySelector(`.nav-item[data-section="${id}"]`);
  if (nav) nav.classList.add('active');
  
  renderCurrentSection();
  if (typeof updateAIContext === 'function') updateAIContext();
}

function toggleTheme() {
  STATE.theme = STATE.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', STATE.theme);
  const btn = document.getElementById('themeToggle');
  if (btn) btn.textContent = STATE.theme === 'dark' ? '○ Light' : '● Dark';
  renderCurrentSection();
}

// ==========================================
// 3. CHART & FORMATTING HELPERS
// ==========================================
const _charts = {};
let _chartLog = [];

// ─── Waterfall connector lines (zebra-chart style) ───
function addWaterfallConnectors(container) {
  try {
    // Remove old connectors
    container.querySelectorAll('.wf-connector').forEach(e => e.remove());
    const svg = container.querySelector('svg');
    if (!svg) return;
    const bars = svg.querySelectorAll('.apexcharts-rangebar-area rect, .apexcharts-bar-area rect');
    if (bars.length < 2) return;
    const ns = 'http://www.w3.org/2000/svg';
    const dark = isDark();
    const lineColor = dark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.25)';
    for (let i = 0; i < bars.length - 1; i++) {
      const curr = bars[i], next = bars[i+1];
      const cX = parseFloat(curr.getAttribute('x')), cW = parseFloat(curr.getAttribute('width')),
            cY = parseFloat(curr.getAttribute('y'));
      const nX = parseFloat(next.getAttribute('x')), nY = parseFloat(next.getAttribute('y')),
            nH = parseFloat(next.getAttribute('height'));
      // Draw dashed connector from top of current bar to top of next bar
      const startX = cX + cW;
      const endX = nX;
      const y = cY; // connect at the top of current bar
      const line = document.createElementNS(ns, 'line');
      line.setAttribute('x1', startX);
      line.setAttribute('y1', y);
      line.setAttribute('x2', endX);
      line.setAttribute('y2', y);
      line.setAttribute('stroke', lineColor);
      line.setAttribute('stroke-width', '1.5');
      line.setAttribute('stroke-dasharray', '4,3');
      line.classList.add('wf-connector');
      svg.appendChild(line);
    }
  } catch(e) { /* silent */ }
}

// ─── Chart.js → ApexCharts Adapter v3 ───
function makeChart(id, config) {
  try {
    if (typeof ApexCharts === 'undefined') {
      _chartLog.push('FAIL ' + id + ': ApexCharts not loaded');
      document.getElementById(id).innerHTML = '<div style="color:red;padding:20px;font-size:12px;">ApexCharts CDN failed to load</div>';
      return null;
    }
    if (_charts[id]) { try { _charts[id].destroy(); } catch(e){} delete _charts[id]; }

    const el = document.getElementById(id);
    if (!el) { _chartLog.push('FAIL ' + id + ': no element'); return null; }

    // Clear container
    el.innerHTML = '';

    const opts     = config.options || {};
    const plugs    = opts.plugins || {};
    const labels   = config.data?.labels || [];
    const datasets = config.data?.datasets || [];
    const firstDs  = datasets[0];
    const cjsType  = config.type || 'bar';

    // Sparkline?
    const isSparkline = (opts.scales?.x?.display === false && opts.scales?.y?.display === false);

    // Chart type detection
    const hasMultiType = datasets.some(ds => ds.type && ds.type !== cjsType);
    const isWaterfall  = cjsType === 'bar' && firstDs?.data?.length && Array.isArray(firstDs.data[0]);
    const isDoughnut   = cjsType === 'doughnut' || cjsType === 'pie';
    const isHorizontal = opts.indexAxis === 'y';

    let apexType = cjsType;
    if (isDoughnut) apexType = 'donut';
    else if (isWaterfall) apexType = 'rangeBar';
    else if (hasMultiType) apexType = 'line';

    // === SERIES ===
    let series, colors;

    if (isDoughnut) {
      series = firstDs?.data || [];
      colors = Array.isArray(firstDs?.backgroundColor) ? firstDs.backgroundColor : [isDark()?'#B0BEC5':'#1A1A1A','#78909C','#B0BEC5','#CFD8DC'];

    } else if (isWaterfall) {
      const bgArr = Array.isArray(firstDs.backgroundColor) ? firstDs.backgroundColor : [];
      series = [{
        name: firstDs.label || 'Value',
        data: labels.map((lbl, i) => {
          const p = firstDs.data[i] || [0,0];
          return { x: lbl, y: [Math.min(p[0],p[1]), Math.max(p[0],p[1])], fillColor: bgArr[i] || getCActual() };
        })
      }];
      colors = [getCActual()];

    } else {
      const isDistrib = !hasMultiType && datasets.length === 1 && Array.isArray(firstDs?.backgroundColor) && firstDs.backgroundColor.length > 1;
      series = datasets.map(ds => {
        const s = { name: ds.label || '', data: ds.data || [] };
        if (hasMultiType) s.type = ds.type || cjsType;
        return s;
      });
      colors = isDistrib ? firstDs.backgroundColor : datasets.map(ds => ds.backgroundColor || ds.borderColor || getCActual());
    }

    // === Y-AXIS ===
    const usedAxisIDs = [...new Set(datasets.map(ds => ds.yAxisID).filter(Boolean))];
    const needsDual = usedAxisIDs.length > 1 || (usedAxisIDs.length === 1 && usedAxisIDs[0] !== 'y');
    const yFmt = v => { try { return typeof v === 'number' ? (Math.abs(v)>=1e6?(v/1e6).toFixed(1)+'M':Math.abs(v)>=1e3?(v/1e3).toFixed(1)+'k':v.toFixed(1)) : ''; } catch(e) { return ''; } };

    let yaxis;
    if (needsDual) {
      const axes = ['y', ...usedAxisIDs.filter(a => a !== 'y')];
      yaxis = axes.map((aid, i) => ({
        opposite: i > 0,
        seriesName: datasets.find(ds => (ds.yAxisID || 'y') === aid)?.label,
        labels: { style: { colors: isDark() ? '#A0A0A0' : '#9E9E9E', fontSize: '11px' }, formatter: yFmt }
      }));
    } else {
      yaxis = { labels: { style: { colors: isDark() ? '#A0A0A0' : '#9E9E9E', fontSize: '11px' }, formatter: yFmt } };
    }

    // === STROKE ===
    let stroke;
    if (hasMultiType) {
      stroke = { width: datasets.map(ds => (ds.type||cjsType)==='line' ? (ds.borderWidth||2.5) : 0), curve: 'smooth' };
    } else if (apexType === 'line') {
      stroke = { width: 2.5, curve: 'smooth' };
    } else {
      stroke = { width: 0 };
    }
    if (datasets.some(ds => ds.borderDash)) {
      stroke.dashArray = datasets.map(ds => ds.borderDash ? (ds.borderDash[0]||4)*2 : 0);
    }

    // === FILL ===
    let fillOpacity = 1;
    if (opts._sparkFill) fillOpacity = 0.35;
    else if (cjsType === 'line' && !hasMultiType && datasets.some(ds => ds.fill)) fillOpacity = 0.12;

    // === DISTRIBUTED ===
    const isDistributed = !hasMultiType && datasets.length === 1 && Array.isArray(firstDs?.backgroundColor) && firstDs.backgroundColor.length > 1 && !isWaterfall;

    // === BUILD OPTIONS ===
    const chartH = isSparkline ? 38 : 320;

    const apexOpts = {
      chart: {
        type: apexType, height: chartH, background: 'transparent',
        toolbar: { show: false }, fontFamily: 'Inter, sans-serif',
        animations: { enabled: false },
        sparkline: { enabled: isSparkline }
      },
      series,
      colors,
      fill: { opacity: fillOpacity },
      stroke,
      dataLabels: {
        enabled: (apexType === 'bar' || apexType === 'rangeBar') && !isSparkline,
        formatter: function(val) {
          if (Array.isArray(val)) { const diff = val[1] - val[0]; return Math.abs(diff) >= 1 ? diff.toFixed(1) : diff.toFixed(2); }
          if (typeof val !== 'number' || val === 0) return '';
          return Math.abs(val) >= 100 ? Math.round(val) : Math.abs(val) >= 1 ? val.toFixed(1) : val.toFixed(2);
        },
        style: { fontSize: '10px', fontWeight: 600, colors: [isDark() ? '#FFFFFF' : '#000000'] },
        offsetY: isHorizontal ? 0 : -12,
        offsetX: isHorizontal ? 6 : 0,
        textAnchor: isHorizontal ? 'start' : 'middle',
        background: { enabled: false },
        dropShadow: { enabled: false }
      },
      legend: {
        show: plugs.legend?.display !== false && !isSparkline && !isDistributed,
        position: 'top', horizontalAlign: 'left',
        labels: { colors: isDark() ? '#A0A0A0' : '#6B6B6B' }, fontSize: '11px',
        markers: { size: 4, shape: 'circle' }
      },
      tooltip: { enabled: plugs.tooltip?.enabled !== false, theme: isDark() ? 'dark' : 'light' },
      grid: {
        show: !isSparkline, borderColor: isDark() ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)', strokeDashArray: 3,
        padding: { left: 4, right: 4, top: 0, bottom: 0 }
      },
      xaxis: Object.assign(
        (isDoughnut || isWaterfall) ? {} : { categories: labels },
        { labels: { show: !isSparkline && !isDoughnut, style: { colors: isDark() ? '#A0A0A0' : '#9E9E9E', fontSize: '10px' }, rotate: labels.length > 8 ? -45 : 0 },
          axisBorder: { show: false }, axisTicks: { show: false } }
      ),
      yaxis,
      plotOptions: {
        bar: Object.assign(
          { borderRadius: 4, columnWidth: datasets.length > 2 ? '70%' : datasets.length > 1 ? '55%' : '45%', distributed: isDistributed, dataLabels: { position: 'top' } },
          isHorizontal ? { horizontal: true, barHeight: '55%' } : {}
        ),
        pie: { donut: { size: '72%', labels: { show: true, total: { show: true, label: 'Total', formatter: w => { try { return w.globals.seriesTotals.reduce((a,b)=>a+b,0).toFixed(1); } catch(e) { return ''; } } } } } }
      },
      theme: { mode: isDark() ? 'dark' : 'light' }
    };

    if (isDoughnut) apexOpts.labels = labels;

    // Strip undefined values — ApexCharts 3.44.0 silently breaks on them
    (function strip(o) { for (const k in o) { if (o[k] === undefined) delete o[k]; else if (o[k] && typeof o[k] === 'object' && !Array.isArray(o[k]) && typeof o[k] !== 'function') strip(o[k]); } })(apexOpts);

    // For waterfall/rangeBar: add connector lines between bars after render
    if (apexType === 'rangeBar' && !isHorizontal) {
      apexOpts.chart.events = {
        animated: function() { addWaterfallConnectors(el); },
        updated: function() { addWaterfallConnectors(el); }
      };
    }

    const chart = new ApexCharts(el, apexOpts);
    chart.render();
    if (apexType === 'rangeBar' && !isHorizontal) {
      setTimeout(function(){ addWaterfallConnectors(el); }, 350);
    }
    _charts[id] = chart;
    _chartLog.push('OK ' + id + ' → ' + apexType);
    return chart;
  } catch(e) {
    _chartLog.push('FAIL ' + id + ': ' + e.message);
    console.error('Chart error:', id, e);
    const el = document.getElementById(id);
    if (el) el.innerHTML = '<div style="color:#E53935;padding:12px;font-size:11px;background:rgba(229,57,53,0.08);border-radius:8px;">Chart error: ' + e.message + '</div>';
    return null;
  }
}

function fmtM(v, d=1) { if (v==null||isNaN(v)) return '—'; const s=v<0?'-':''; const a=Math.abs(v); return `${s}€${a.toFixed(d)}M`; }
function fmtPct(v, d=1) { if (v==null||isNaN(v)) return '—'; return `${v>0?'+':''}${v.toFixed(d)}%`; }
function fmtPctAbs(v, d=1) { if (v==null||isNaN(v)) return '—'; return `${v.toFixed(d)}%`; }
function fmtDays(v) { if (v==null||isNaN(v)) return '—'; return `${v.toFixed(1)}d`; }
function varColor(v, isRevenue=true) { return (isRevenue ? v>=0 : v<=0) ? 'fav' : (Math.abs(v)<2?'watch':'unfav'); }
function varArrow(v, isRevenue=true) { return (isRevenue ? v>=0 : v<=0) ? '▲' : '▼'; }

function makeSparkline(id, data, color='#4CAF50') {
  makeChart(id, {
    type:'line',
    data:{ labels:data.map((_,i)=>i), datasets:[{ data, borderColor:color, backgroundColor:color, fill:true, borderWidth:2, pointRadius:0, tension:0.4 }] },
    options:{ plugins:{legend:{display:false},tooltip:{enabled:false},finDataLabels:false}, scales:{x:{display:false},y:{display:false}}, _sparkFill:true }
  });
}

// Brisko palette chart colors — theme-aware
function isDark() { return STATE.theme === 'dark'; }
function getCActual() { return isDark() ? '#B0BEC5' : '#1A1A1A'; }
function getCBdg() { return isDark() ? 'rgba(176,190,197,0.35)' : 'rgba(156,163,175,0.35)'; }
const cFav = '#66BB6A', cUnfav = '#EF5350';
// Legacy aliases — computed fresh each render
Object.defineProperty(window, 'cActual', { get: getCActual });
Object.defineProperty(window, 'cBdg', { get: getCBdg });

function buildKpiCard(label, val, bdg, py, isRev=true, sparkId=null) {
  const v = val - bdg, p = val - py;
  const vc = varColor(v, isRev), pc = varColor(p, isRev);
  return `
    <div class="kpi-card">
      <div class="kpi-label">${label}</div>
      <div class="kpi-value">${fmtM(val)}</div>
      <div class="kpi-deltas">
        <span class="delta ${vc}">${varArrow(v,isRev)} ${fmtM(v)} vs BDG</span>
        <span class="delta ${pc}">${varArrow(p,isRev)} ${fmtM(p)} vs PY</span>
      </div>
      <div class="kpi-sub">BDG ${fmtM(bdg)} | PY ${fmtM(py)}</div>
      ${sparkId ? `<div class="sparkline-container"><div id="${sparkId}" style="width:100%;height:38px;"></div></div>` : ''}
    </div>
  `;
}

function buildDayCard(label, val, bdg, py, favorableWhenLower=true) {
  const v = val - bdg, p = val - py;
  const fav = favorableWhenLower ? (v <= 0) : (v >= 0);
  const favPy = favorableWhenLower ? (p <= 0) : (p >= 0);
  const vc = fav ? 'fav' : (Math.abs(v) < 1 ? 'watch' : 'unfav');
  const vcp = favPy ? 'fav' : 'unfav';
  return `
    <div class="kpi-card">
      <div class="kpi-label">${label}</div>
      <div class="kpi-value">${val.toFixed(1)}d</div>
      <div class="kpi-deltas">
        <span class="delta ${vc}">${v>0?'▲':'▼'} ${Math.abs(v).toFixed(1)}d vs BDG</span>
        <span class="delta ${vcp}">${p>0?'▲':'▼'} ${Math.abs(p).toFixed(1)}d vs PY</span>
      </div>
      <div class="kpi-sub">BDG ${bdg.toFixed(1)}d | PY ${py.toFixed(1)}d</div>
    </div>`;
}

// ==========================================
// 4. SECTION RENDERING FUNCTIONS
// ==========================================

// 1. Executive Summary
function renderExecutiveSummary() {
  const slice = getDataSlice(STATE.period);
  const a = slice.actual, b = slice.budget, py = slice.priorYear;
  const d = window.NEXOVA_DATA;

  document.getElementById('es-period-subtitle').innerText = `${slice.periodLabel} | Consolidated`;

  const hVar = d.headcount.actual - d.headcount.budget;
  const hPy = d.headcount.actual - d.headcount.priorYear;
  const nwc = d.derived.nwc;

  document.getElementById('es-kpi-container').innerHTML = `
    ${buildKpiCard('Revenue', a.revenue, b.revenue, py.revenue, true, 'spk-rev')}
    ${buildKpiCard('EBITDA', a.ebitda, b.ebitda, py.ebitda, true, 'spk-ebitda')}
    ${buildKpiCard('Net Income', a.netIncome, b.netIncome, py.netIncome, true, 'spk-ni')}
    ${buildKpiCard('Free Cash Flow', a.fcf || 4.5, 4.0, 3.8, true, 'spk-fcf')}
    <div class="kpi-card">
      <div class="kpi-label">Headcount</div>
      <div class="kpi-value">${d.headcount.actual}</div>
      <div class="kpi-deltas">
        <span class="delta ${varColor(hVar,false)}">${varArrow(hVar,false)} ${Math.abs(hVar)} vs BDG</span>
        <span class="delta ${varColor(hPy,false)}">${varArrow(hPy,false)} ${Math.abs(hPy)} vs PY</span>
      </div>
      <div class="kpi-sub">BDG ${d.headcount.budget} | PY ${d.headcount.priorYear}</div>
      <div class="sparkline-container"><div id="spk-hc" style="width:100%;height:38px;"></div></div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">Net Working Capital</div>
      <div class="kpi-value">${fmtM(nwc)}</div>
      <div class="kpi-deltas">
        <span class="delta ${varColor(nwc-64.0,false)}">${varArrow(nwc-64.0,false)} ${fmtM(nwc-64.0)} vs BDG</span>
        <span class="delta ${varColor(nwc-65.3,false)}">${varArrow(nwc-65.3,false)} ${fmtM(nwc-65.3)} vs PY</span>
      </div>
      <div class="kpi-sub">BDG €64.0M | PY €65.3M</div>
      <div class="sparkline-container"><div id="spk-nwc" style="width:100%;height:38px;"></div></div>
    </div>
  `;

  makeSparkline('spk-rev', [35.1,34.8,36.9,37.5,38.4,40.1,36.8,35.7,38.6,40.7,41.2,43.7], '#43A047');
  makeSparkline('spk-ebitda', [5.1,5.0,5.2,5.3,5.5,5.8,5.2,5.1,5.5,5.9,6.0,6.3], '#1E88E5');
  makeSparkline('spk-ni', [1.9,1.9,1.6,2.1,2.1,2.4,2.0,1.9,2.1,2.4,2.5,2.6], '#8E24AA');
  makeSparkline('spk-fcf', [1.8,1.7,1.0,1.9,2.0,2.2,1.8,1.7,2.0,2.3,2.4,2.6], '#00897B');
  makeSparkline('spk-hc', [2750,2765,2780,2791,2800,2810,2820,2831,2839,2842,2845,2847], '#FB8C00');
  makeSparkline('spk-nwc', [63.2,63.8,64.1,64.5,64.9,65.0,65.2,65.3,65.8,66.1,66.4,66.6], '#E53935');

  makeChart('es-rev-waterfall', {
    type: 'bar',
    data: {
      labels: ['Budget', 'Volume Effect', 'Price/Mix', 'FX Impact', 'Cost Save', 'Actual'],
      datasets: [{
        data: [[0, b.revenue], [b.revenue, b.revenue - 2.1], [b.revenue - 2.1, b.revenue - 3.1], [b.revenue - 3.1, b.revenue - 4.5], [b.revenue - 4.5, a.revenue], [0, a.revenue]],
        backgroundColor: [cBdg, cUnfav, cUnfav, cUnfav, cFav, cActual]
      }]
    },
    options: { plugins: { legend: { display: false } } }
  });

  makeChart('es-ebitda-bridge', {
    type: 'bar',
    data: {
      labels: ['PY EBITDA', 'Rev Drop', 'COGS Infl.', 'Opex Overrun', 'Cost Savings', 'Actual EBITDA'],
      datasets: [{
        data: [[0, py.ebitda], [py.ebitda, py.ebitda - 1.7], [py.ebitda - 1.7, py.ebitda - 3.0], [py.ebitda - 3.0, py.ebitda - 3.4], [py.ebitda - 3.4, a.ebitda], [0, a.ebitda]],
        backgroundColor: [cBdg, cUnfav, cUnfav, cUnfav, cFav, cActual]
      }]
    },
    options: { plugins: { legend: { display: false } } }
  });

  const commHtml = (d.commentary || '').split('\n\n').map(p => `<p>${p}</p>`).join('');
  document.getElementById('es-commentary').innerHTML = commHtml || '<p>No commentary available.</p>';

  document.getElementById('es-alerts').innerHTML = d.alerts.filter(al=>al.severity==='HIGH').slice(0,2).map(al => `
    <div class="alert-card">
      <div class="alert-header">
        <div class="severity-badge severity-${al.severity}">${al.severity}</div>
        <span class="priority-badge">Priority: ${triageScore(al)}/10</span>
      </div>
      <div class="alert-title">${al.title}</div>
      <div class="alert-what">${al.what}</div>
    </div>
  `).join('');
}

// 2. KPI Scorecard
function renderKPIScorecard() {
  const slice = getDataSlice(STATE.period);
  const a = slice.actual, b = slice.budget, py = slice.priorYear;
  const d = window.NEXOVA_DATA;
  const wc = d.workingCapital;

  document.getElementById('ksc-period-subtitle').innerText = `Performance Indicators — ${slice.periodLabel}`;

  document.getElementById('ksc-revenue').innerHTML =
    buildKpiCard('Revenue', a.revenue, b.revenue, py.revenue, true) +
    buildKpiCard('Gross Profit', a.grossProfit, b.grossProfit, py.grossProfit || (py.revenue * 0.381), true) +
    buildKpiCard('Order Intake', 120.4, 125.0, 115.2, true) +
    buildKpiCard('Rev per FTE (€k)', (a.revenue / d.headcount.actual) * 1000, (b.revenue / d.headcount.budget) * 1000, (py.revenue / d.headcount.priorYear) * 1000, true);

  document.getElementById('ksc-profit').innerHTML =
    buildKpiCard('EBITDA', a.ebitda, b.ebitda, py.ebitda, true) +
    buildKpiCard('EBIT', a.ebit, b.ebit, a.ebit + 0.8, true) +
    buildKpiCard('Net Income', a.netIncome, b.netIncome, py.netIncome, true) +
    buildKpiCard('Free Cash Flow', a.fcf || 4.5, 4.0, 3.8, true);

  document.getElementById('ksc-margins').innerHTML =
    `<div class="kpi-card"><div class="kpi-label">GROSS MARGIN %</div><div class="kpi-value">${fmtPctAbs(a.grossMargin)}</div>
     <div class="kpi-deltas"><span class="delta ${a.grossMargin>=b.grossMargin?'fav':'unfav'}">${a.grossMargin>=b.grossMargin?'▲':'▼'} ${Math.abs(a.grossMargin - b.grossMargin).toFixed(1)}pp vs BDG</span><span class="delta ${a.grossMargin>=py.grossMargin?'fav':'unfav'}">${a.grossMargin>=py.grossMargin?'▲':'▼'} ${Math.abs(a.grossMargin - py.grossMargin).toFixed(1)}pp vs PY</span></div>
     <div class="kpi-sub">BDG ${fmtPctAbs(b.grossMargin)} | PY ${fmtPctAbs(py.grossMargin)}</div></div>` +
    `<div class="kpi-card"><div class="kpi-label">EBITDA MARGIN %</div><div class="kpi-value">${fmtPctAbs(a.ebitdaMargin)}</div>
     <div class="kpi-deltas"><span class="delta ${a.ebitdaMargin>=b.ebitdaMargin?'fav':'unfav'}">${a.ebitdaMargin>=b.ebitdaMargin?'▲':'▼'} ${Math.abs(a.ebitdaMargin - b.ebitdaMargin).toFixed(1)}pp vs BDG</span><span class="delta ${a.ebitdaMargin>=py.ebitdaMargin?'fav':'unfav'}">${a.ebitdaMargin>=py.ebitdaMargin?'▲':'▼'} ${Math.abs(a.ebitdaMargin - py.ebitdaMargin).toFixed(1)}pp vs PY</span></div>
     <div class="kpi-sub">BDG ${fmtPctAbs(b.ebitdaMargin)} | PY ${fmtPctAbs(py.ebitdaMargin)}</div></div>` +
    `<div class="kpi-card"><div class="kpi-label">NET MARGIN %</div><div class="kpi-value">${fmtPctAbs(a.netMargin)}</div>
     <div class="kpi-deltas"><span class="delta ${a.netMargin>=b.netMargin?'fav':'unfav'}">${a.netMargin>=b.netMargin?'▲':'▼'} ${Math.abs(a.netMargin - b.netMargin).toFixed(1)}pp vs BDG</span></div>
     <div class="kpi-sub">BDG ${fmtPctAbs(b.netMargin)}</div></div>` +
    `<div class="kpi-card"><div class="kpi-label">EBIT MARGIN %</div><div class="kpi-value">${fmtPctAbs(a.ebitMargin)}</div>
     <div class="kpi-deltas"><span class="delta ${a.ebitMargin>=b.ebitMargin?'fav':'unfav'}">${a.ebitMargin>=b.ebitMargin?'▲':'▼'} ${Math.abs(a.ebitMargin - b.ebitMargin).toFixed(1)}pp vs BDG</span></div>
     <div class="kpi-sub">BDG ${fmtPctAbs(b.ebitMargin)}</div></div>`;

  document.getElementById('ksc-liquidity').innerHTML =
    buildDayCard('DSO', wc.current.dso, wc.budget.dso, wc.priorYear.dso, true) +
    buildDayCard('DPO', wc.current.dpo, wc.budget.dpo, wc.priorYear.dpo, false) +
    buildDayCard('CCC', wc.current.ccc, wc.budget.ccc, wc.priorYear.ccc, true) +
    `<div class="kpi-card"><div class="kpi-label">NET DEBT / EBITDA</div><div class="kpi-value">${d.debt.netDebtEbitda}x</div>
     <div class="kpi-deltas"><span class="delta fav">▼ Limit 3.0x | Headroom 1.17x</span></div>
     <div class="kpi-sub">Net Debt €${d.debt.netDebt}M</div></div>`;
}

// 3. Management Dashboard
function renderMgmtDashboard() {
  const d = window.NEXOVA_DATA;
  const lbls = d.actuals.monthly.map(m=>m.m);
  
  makeChart('md-rev-trend', {
    type: 'line',
    data: { labels: lbls, datasets: [
      { label:'Actual', data: d.actuals.monthly.map(m=>m.revenue), borderColor:cActual, tension:0.3 },
      { label:'Budget', data: d.budget.monthly.map(m=>m.revenue), borderColor:cBdg, borderDash:[4,4], tension:0.3 }
    ]},
    options: { scales: { y: { beginAtZero: false } } }
  });

  makeChart('md-ebitda-margin', {
    type: 'bar',
    data: { labels: lbls, datasets: [
      { type:'bar', label:'EBITDA', data: d.actuals.monthly.map(m=>m.ebitda), backgroundColor:cActual, yAxisID:'y' },
      { type:'line', label:'Margin %', data: d.actuals.monthly.map(m=>(m.ebitda/m.revenue)*100), borderColor:cFav, yAxisID:'y1' }
    ]},
    options: { scales: { y1: { position: 'right', ticks: { callback: v => v+'%' } } } }
  });

  makeChart('md-fcf', {
    type: 'bar',
    data: { labels: lbls, datasets: [
      { label:'FCF', data: d.actuals.monthly.map(m=>m.fcf), backgroundColor:cFav }
    ]}
  });

  makeChart('md-cost', {
    type: 'doughnut',
    data: { labels: ['COGS', 'SG&A', 'R&D', 'G&A'], datasets: [{ data: [75.3, 16.6, 4.9, 6.1], backgroundColor: [cActual, '#78909C', '#B0BEC5', '#CFD8DC'], borderWidth:2 }] },
    options: { cutout: '55%', plugins: { legend: { position: 'right' } } }
  });

  const avgEbitdaMargin = (d.actuals.monthly.reduce((s,m)=>s+(m.ebitda/m.revenue*100),0)/12).toFixed(1);

  document.getElementById('md-narrative').innerHTML = `
    <p>Revenue peaked in December at €45.5M (+5.6% vs prior year) before Q1 seasonality pulled it back to €35.8M–€38.5M range. The 12-month EBITDA margin averaged <strong>${avgEbitdaMargin}%</strong> — below the 15.0% annual budget. Free cash flow generation remains positive across all months, with the seasonal trough in March (€1.0M) recovering to €2.6M in December. Cost structure shows COGS at 62.4% of revenue — 80bps above budget — driven by raw material inflation in H2 2024.</p>
  `;
}

// 4. P&L Statement
function renderPnL() {
  const slice = getDataSlice(STATE.period);
  const a = slice.actual, b = slice.budget, p = slice.priorYear;
  
  document.getElementById('pnl-period-subtitle').innerText = `Consolidated Financials — ${slice.periodLabel}`;
  document.getElementById('pnl-th-act').innerText = `Actual ${STATE.period.toUpperCase()}`;
  document.getElementById('pnl-th-bdg').innerText = `Budget ${STATE.period.toUpperCase()}`;
  document.getElementById('pnl-th-py').innerText = `PY ${STATE.period.toUpperCase()}`;

  const r = (label, av, bv, pv, isRev, isSub) => {
    const vBdg = av - bv;
    const vPy = av - pv;
    const pBdg = bv ? (vBdg/bv)*100 : 0;
    return `<tr class="${isSub?'subtotal':''}">
      <td>${label}</td>
      <td>${fmtM(av)}</td><td>${fmtM(bv)}</td>
      <td class="num-${varColor(vBdg,isRev)}">${fmtM(vBdg)}</td>
      <td class="num-${varColor(vBdg,isRev)}">${fmtPct(pBdg)}</td>
      <td>${fmtM(pv)}</td>
      <td class="num-${varColor(vPy,isRev)}">${fmtM(vPy)}</td>
    </tr>`;
  };

  document.querySelector('#pnl-table tbody').innerHTML = `
    ${r('Revenue', a.revenue, b.revenue, p.revenue, true, true)}
    ${r('COGS', a.cogs, b.cogs, a.cogs-1.5, false, false)}
    ${r('Gross Profit', a.grossProfit, b.grossProfit, p.grossProfit || (p.grossMargin?p.revenue*(p.grossMargin/100):0), true, true)}
    ${r('SG&A', a.sgna, b.sgna, a.sgna-0.5, false, false)}
    ${r('R&D', a.rnd, b.rnd, a.rnd-0.2, false, false)}
    ${r('G&A', a.gna, b.gna, a.gna-0.3, false, false)}
    ${r('EBITDA', a.ebitda, b.ebitda, p.ebitda, true, true)}
    ${r('Depreciation & Amortization', a.da, b.da, a.da-0.2, false, false)}
    ${r('EBIT (Operating Income)', a.ebit, b.ebit, a.ebit+0.5, true, true)}
    ${r('Interest & Tax', a.interest+a.tax, b.interest+b.tax, a.interest+a.tax-0.2, false, false)}
    ${r('Net Income', a.netIncome, b.netIncome, p.netIncome, true, true)}
  `;
}

// 5. Balance Sheet (Upgraded with 4 KPIs, Trend Chart & Capital Structure Analysis)
function renderBalanceSheet() {
  const c = window.NEXOVA_DATA.balanceSheet.current;
  const p = window.NEXOVA_DATA.balanceSheet.prior;
  const row = (lbl, val, sub=false) => `<tr class="${sub?'subtotal':''}"><td>${lbl}</td><td>${fmtM(val)}</td></tr>`;
  
  // 4 KPI Cards
  const currRatio = (c.totalCurrentAssets / c.totalCurrentLiabilities).toFixed(2);
  const quickRatio = ((c.cash + c.ar) / c.totalCurrentLiabilities).toFixed(2);
  const netDebt = (c.shortTermDebt + c.longTermDebt - c.cash).toFixed(1);
  const equityRatio = ((c.totalEquity / c.totalAssets) * 100).toFixed(1);

  document.getElementById('bs-kpi-container').innerHTML = `
    <div class="kpi-card">
      <div class="kpi-label">Current Ratio</div>
      <div class="kpi-value">${currRatio}</div>
      <div class="kpi-sub">Target: ≥ 1.50 | Prior: ${(p.totalCurrentAssets/p.totalCurrentLiabilities).toFixed(2)}</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">Quick Ratio (Acid Test)</div>
      <div class="kpi-value">${quickRatio}</div>
      <div class="kpi-sub">Target: ≥ 1.00 | Cash + AR cover</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">Net Debt (€M)</div>
      <div class="kpi-value">€${netDebt}M</div>
      <div class="kpi-sub">Net Gearing: 108% | Limit: ≤ 150%</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">Equity Ratio</div>
      <div class="kpi-value">${equityRatio}%</div>
      <div class="kpi-sub">Total Equity: €${c.totalEquity}M</div>
    </div>
  `;

  document.querySelector('#bs-assets tbody').innerHTML =
    row('Cash & Cash Equivalents', c.cash) + row('Accounts Receivable', c.ar) + row('Inventories', c.inventory) +
    row('Prepayments & Other Current', c.prepayments+c.otherCurrent) + row('Total Current Assets', c.totalCurrentAssets, true) +
    row('Property, Plant & Equipment', c.ppe) + row('Intangibles & Goodwill', c.intangibles+c.goodwill) + row('Investments & Other', c.investments+c.otherNonCurrent) +
    row('Total Non-Current Assets', c.totalNonCurrentAssets, true) + row('Total Assets', c.totalAssets, true);

  document.querySelector('#bs-liabs tbody').innerHTML =
    row('Accounts Payable', c.ap) + row('Accrued Liabilities', c.accruals) + row('Short-Term Debt', c.shortTermDebt) +
    row('Tax & Other Current Liab', c.taxPayable+c.otherCurrentLiab) + row('Total Current Liabilities', c.totalCurrentLiabilities, true) +
    row('Long-Term Debt', c.longTermDebt) + row('Provisions & Deferred Tax', c.provisions+c.deferredTax) +
    row('Total Non-Current Liabilities', c.totalNonCurrentLiabilities, true) + row('Total Liabilities', c.totalLiabilities, true);

  document.querySelector('#bs-equity tbody').innerHTML =
    row('Share Capital', c.shareCapital) + row('Retained Earnings', c.retainedEarnings) + row('Other Reserves', c.otherReserves) +
    row('Total Equity', c.totalEquity, true) + row('Total Liabilities & Equity', c.totalLiabAndEquity, true);
  
  document.getElementById('bs-status').innerHTML = window.NEXOVA_DATA.derived.balanceCheck ?
    '<span class="status-badge posted">✓ BALANCED</span>' : '<span class="status-badge review">⚠ UNBALANCED</span>';

  // Balance sheet trend chart
  const tr = window.NEXOVA_DATA.balanceSheet.trends;
  makeChart('bs-trend-chart', {
    type: 'bar',
    data: {
      labels: tr.map(x=>x.q),
      datasets: [
        { type:'bar', label:'Total Assets', data:tr.map(x=>x.assets), backgroundColor:'rgba(59,130,246,0.7)', yAxisID:'y' },
        { type:'bar', label:'Total Liabilities', data:tr.map(x=>x.liabs), backgroundColor:'rgba(239,68,68,0.5)', yAxisID:'y' },
        { type:'line', label:'Net Debt', data:tr.map(x=>x.netDebt), borderColor:'#66BB6A', borderWidth:2, pointRadius:4, yAxisID:'y' }
      ]
    },
    options: { scales: { y: { beginAtZero: false } } }
  });

  // Capital Structure Commentary
  document.getElementById('bs-analysis-card').innerHTML = `
    <p><strong>Capital Structure & Solvency Overview:</strong> Net gearing stands at <strong>108%</strong> (Net Debt/Equity), down from 111% in Q2 2024. The debt structure is predominantly long-term (<strong>87%</strong> of total debt matures post-2026), providing strong liquidity stability.</p>
    <p style="margin-top:6px;"><strong>Asset Quality:</strong> Goodwill and intangibles represent <strong>17.3%</strong> of total assets (€57.4M). Management should monitor impairment triggers given EBITDA margin pressure in Division A.</p>
  `;
}

// 6. Intercompany Reconciliation (Upgraded with 4x4 Matrix Table & Cycle Timing)
let selectedIntercoIdx = null;

function renderIntercoRecon() {
  const d = window.NEXOVA_DATA.interco;
  const threshold = parseFloat(document.getElementById('interco-threshold')?.value || 0.01);

  const totalVol = d.matrix.reduce((acc, m) => acc + m.amountFrom, 0);
  const matchedCount = d.matrix.filter(m => m.status === 'matched').length;
  const gapCount = d.matrix.filter(m => m.status === 'gap' || m.status === 'missing').length;
  const totalUnresolved = d.matrix.filter(m => m.status !== 'matched').reduce((acc, m) => acc + Math.abs(m.difference), 0);

  document.getElementById('interco-kpi-container').innerHTML = `
    <div class="kpi-card">
      <div class="kpi-label">Total Interco Volume</div>
      <div class="kpi-value">${fmtM(totalVol)}</div>
      <div class="kpi-sub">${d.matrix.length} transaction pairings</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">Matched Pairs</div>
      <div class="kpi-value" style="color:var(--color-fav)">${matchedCount}</div>
      <div class="kpi-sub">100% agreement on amounts</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">Gaps / Missing Items</div>
      <div class="kpi-value" style="color:${gapCount>0?'var(--color-unfav)':'var(--color-fav)'}">${gapCount}</div>
      <div class="kpi-sub">Unresolved delta: ${fmtM(totalUnresolved, 2)}</div>
    </div>
  `;

  let html = '';
  d.matrix.forEach((row, idx) => {
    if (Math.abs(row.difference) < threshold && row.status === 'matched') return;

    let statusPill = '';
    let actionBtn = '';

    if (row.status === 'matched') {
      statusPill = '<span class="status-badge posted">✓ Matched</span>';
      actionBtn = '<span style="color:var(--text-muted); font-size:11px">No action</span>';
    } else if (row.status === 'gap') {
      statusPill = `<span class="status-badge pending">⚠ Gap €${row.difference.toFixed(2)}M</span>`;
      actionBtn = `<button class="header-btn" style="border-color:var(--color-watch); color:var(--color-watch);" onclick="openIntercoModal(${idx})">Investigate</button>`;
    } else {
      statusPill = '<span class="status-badge review" style="background:var(--color-unfav-bg); color:var(--color-unfav); border-color:var(--color-unfav);">✕ Missing</span>';
      actionBtn = `<button class="header-btn" style="border-color:var(--color-unfav); color:var(--color-unfav); font-weight:600;" onclick="openIntercoModal(${idx})">Urgent — Chase</button>`;
    }

    html += `
      <tr>
        <td style="font-weight:600">${row.from}</td>
        <td>${row.to}</td>
        <td>${row.type}</td>
        <td>${fmtM(row.amountFrom, 2)}</td>
        <td>${fmtM(row.amountTo, 2)}</td>
        <td class="num-${row.difference === 0 ? 'fav' : 'unfav'}">${fmtM(row.difference, 2)}</td>
        <td style="text-align:center">${statusPill}</td>
        <td style="text-align:center">${actionBtn}</td>
      </tr>
    `;
  });

  document.querySelector('#interco-table tbody').innerHTML = html || '<tr><td colspan="8" style="text-align:center; padding:20px; color:var(--text-muted)">All intercompany flows match within specified materiality threshold.</td></tr>';

  // 4x4 Entity Exposure Matrix Table
  const ents = d.entities;
  let thHtml = `<tr><th>Entity Matrix</th>${ents.map(e=>`<th>${e.split(' ')[0]}</th>`).join('')}</tr>`;
  let tbHtml = '';
  ents.forEach(fromEnt => {
    tbHtml += `<tr><td style="font-weight:600">${fromEnt}</td>`;
    ents.forEach(toEnt => {
      if (fromEnt === toEnt) {
        tbHtml += `<td style="background:var(--bg-surface-raised); color:var(--text-muted)">—</td>`;
      } else {
        const item = d.matrix.find(m => m.from === fromEnt && m.to === toEnt);
        if (item) {
          const cls = item.status === 'matched' ? 'num-fav' : item.status === 'gap' ? 'num-watch' : 'num-unfav';
          tbHtml += `<td class="${cls}" style="font-weight:600">€${item.amountFrom.toFixed(2)}M</td>`;
        } else {
          tbHtml += `<td style="color:var(--text-muted)">0.00</td>`;
        }
      }
    });
    tbHtml += `</tr>`;
  });
  document.querySelector('#interco-matrix-table thead').innerHTML = thHtml;
  document.querySelector('#interco-matrix-table tbody').innerHTML = tbHtml;

  // Cycle Timing Card
  document.getElementById('interco-cycle-card').innerHTML = `
    <p><strong>Historical Resolution Benchmark:</strong> Average intercompany reconciliation cycle time across the last 3 closes is <strong>2.3 days</strong>.</p>
    <p style="margin-top:6px;">Current March close is at <strong>D+7</strong>. Longest unresolved transaction: <strong>Treasury Transfer €5.50M</strong> between Finance SAS and HQ (Group SA). Consolidation freeze pending counterpart booking.</p>
  `;

  // Readiness banner
  const bannerEl = document.getElementById('interco-readiness-banner');
  if (gapCount === 0) {
    bannerEl.innerHTML = `
      <div class="commentary-block" style="border-color:var(--color-fav); background:var(--color-fav-bg); color:var(--color-fav);">
        <p><strong>✓ All Intercompany Flows Reconciled.</strong> Zero unreconciled variance detected across legal entities. Group consolidation accounts are ready for close finalization.</p>
      </div>
    `;
  } else {
    bannerEl.innerHTML = `
      <div class="commentary-block" style="border-color:var(--color-unfav); background:var(--color-unfav-bg); color:var(--color-unfav);">
        <p><strong>⚠ Reconciliation Incomplete:</strong> Total unresolved variance of <strong>€${totalUnresolved.toFixed(2)}M</strong> across <strong>${gapCount} items</strong>. Group consolidation cannot be certified until all entity-level discrepancies are resolved.</p>
      </div>
    `;
  }
}

function openIntercoModal(idx) {
  selectedIntercoIdx = idx;
  const row = window.NEXOVA_DATA.interco.matrix[idx];
  const modal = document.getElementById('modal-interco-investigate');
  
  document.getElementById('interco-modal-title').innerHTML = `<span>Investigate: ${row.type}</span><button class="header-btn" onclick="closeIntercoModal()">✕</button>`;
  document.getElementById('interco-modal-details').innerHTML = `
    <strong>Originating Entity:</strong> ${row.from} (${fmtM(row.amountFrom, 2)})<br>
    <strong>Counterpart Entity:</strong> ${row.to} (${fmtM(row.amountTo, 2)})<br>
    <strong>Discrepancy:</strong> ${fmtM(row.difference, 2)} (${row.status.toUpperCase()})<br>
    <strong>Known Context:</strong> ${row.notes || 'None recorded'}
  `;
  document.getElementById('interco-modal-notes').value = row.notes || '';
  modal.classList.remove('hidden');
}

function closeIntercoModal() {
  document.getElementById('modal-interco-investigate').classList.add('hidden');
  selectedIntercoIdx = null;
}

function submitIntercoInvestigation() {
  if (selectedIntercoIdx !== null) {
    const notes = document.getElementById('interco-modal-notes').value;
    window.NEXOVA_DATA.interco.matrix[selectedIntercoIdx].notes = notes;
    showToast(`Inquiry dispatched for ${window.NEXOVA_DATA.interco.matrix[selectedIntercoIdx].type}`, 'warning');
    closeIntercoModal();
    renderIntercoRecon();
  }
}

// 7. Cash Flow (Upgraded with KPIs, Quarterly Stacked Chart & Runway Card)
function renderCashFlow() {
  const cf = window.NEXOVA_DATA.cashFlow.ytd;
  const row = (lbl, val, sub=false) => `<tr class="${sub?'subtotal':''}"><td>${lbl}</td><td>${fmtM(val)}</td></tr>`;
  
  // 4 Top KPIs
  document.getElementById('cf-kpi-container').innerHTML = `
    <div class="kpi-card">
      <div class="kpi-label">Operating Cash Flow</div>
      <div class="kpi-value">${fmtM(cf.operatingCF)}</div>
      <div class="kpi-sub">BDG: €8.5M | Conversion: 52%</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">Investing Cash Flow</div>
      <div class="kpi-value">${fmtM(cf.investingCF)}</div>
      <div class="kpi-sub">CapEx: €4.2M | Disposals: €0.8M</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">Free Cash Flow</div>
      <div class="kpi-value">${fmtM(cf.freeCashFlow)}</div>
      <div class="kpi-sub">BDG: €4.0M | FCF Margin: 3.1%</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">Cash Conversion Cycle</div>
      <div class="kpi-value">59.0d</div>
      <div class="kpi-sub">Prior Year: 54.8d | +4.2d</div>
    </div>
  `;

  document.querySelector('#cf-table tbody').innerHTML =
    row('Net Income', cf.netIncome) + row('Depreciation & Amortization', cf.da) + row('Working Capital Changes', cf.wcChange) + row('Other Operating Items', cf.otherOp) +
    row('Operating Cash Flow', cf.operatingCF, true) + row('Capital Expenditures (CapEx)', cf.capex) + row('Asset Disposals & Other', cf.disposals) +
    row('Investing Cash Flow', cf.investingCF, true) + row('Debt Repayment & Facilities', cf.debtRepayment) +
    row('Financing Cash Flow', cf.financingCF, true) + row('Net Cash Change', cf.netCashChange, true) + row('Free Cash Flow', cf.freeCashFlow, true);
  
  makeChart('cf-bridge', {
    type: 'bar',
    data: {
      labels: ['Operating CF', 'Investing CF', 'Financing CF', 'Net Cash Change'],
      datasets: [{
        data: [[0, cf.operatingCF], [cf.operatingCF, cf.operatingCF + cf.investingCF], [cf.operatingCF + cf.investingCF, cf.netCashChange], [0, cf.netCashChange]],
        backgroundColor: [cFav, cUnfav, cUnfav, cActual]
      }]
    },
    options: { plugins: { legend: { display: false } } }
  });

  // Quarterly CF Chart
  const qData = window.NEXOVA_DATA.cashFlow.quarterly;
  makeChart('cf-quarterly-chart', {
    type: 'bar',
    data: {
      labels: qData.map(q => q.q),
      datasets: [
        { label: 'Operating CF', data: qData.map(q => q.operatingCF), backgroundColor: cFav },
        { label: 'Investing CF', data: qData.map(q => q.investingCF), backgroundColor: cUnfav },
        { label: 'Financing CF', data: qData.map(q => q.financingCF), backgroundColor: 'rgba(156,163,175,0.6)' }
      ]
    }
  });

  // Cash Quality & Liquidity Runway Card
  document.getElementById('cf-quality-card').innerHTML = `
    <p><strong>Cash Quality Analysis:</strong> Operating cash flow of €7.7M covers <strong>183%</strong> of capital expenditure (€4.2M). Working capital absorbed €3.8M YTD, primarily driven by DSO expansion (+4.3 days).</p>
    <p style="margin-top:6px;"><strong>Liquidity Runway:</strong> Total Cash & Facilities Available: <strong>€75.4M</strong> (Cash €28.4M + Undrawn RCF €47.0M). Average monthly net burn: <strong>-€1.2M</strong>. Implied Liquidity Runway: <strong style="color:var(--color-fav)">62 months</strong>.</p>
  `;
}

// 8. Budget vs Actuals (Upgraded with ⬡ AI commentary button)
function renderBudgetActuals() {
  const filter = parseInt(document.getElementById('bva-filter')?.value || 5);
  const slice = getDataSlice(STATE.period);
  const a = slice.actual, b = slice.budget;
  
  document.getElementById('bva-period-subtitle').innerText = `Detailed Variance Commentary — ${slice.periodLabel}`;

  const items = [
    {l:'Revenue', a:a.revenue, b:b.revenue, rev:true, sub:true},
    {l:'└ COGS', a:a.cogs, b:b.cogs, rev:false, sub:false},
    {l:'Gross Profit', a:a.grossProfit, b:b.grossProfit, rev:true, sub:true},
    {l:'└ SG&A', a:a.sgna, b:b.sgna, rev:false, sub:false},
    {l:'└ R&D', a:a.rnd, b:b.rnd, rev:false, sub:false},
    {l:'└ G&A', a:a.gna, b:b.gna, rev:false, sub:false},
    {l:'EBITDA', a:a.ebitda, b:b.ebitda, rev:true, sub:true},
    {l:'└ D&A', a:a.da, b:b.da, rev:false, sub:false},
    {l:'EBIT', a:a.ebit, b:b.ebit, rev:true, sub:true},
    {l:'└ Interest', a:a.interest, b:b.interest, rev:false, sub:false},
    {l:'└ Tax', a:a.tax, b:b.tax, rev:false, sub:false},
    {l:'Net Income', a:a.netIncome, b:b.netIncome, rev:true, sub:true}
  ];

  if (window._bvaSortMagnitude) {
    items.sort((x, y) => Math.abs((y.a - y.b) / (y.b || 1)) - Math.abs((x.a - x.b) / (x.b || 1)));
  }

  let html = '';
  items.forEach(i => {
    const v = i.a - i.b;
    const p = i.b ? (v/i.b)*100 : 0;
    if (Math.abs(p) >= filter || i.sub) {
      const isF = (i.rev ? v>=0 : v<=0);
      const dot = Math.abs(p) < 2 ? 'amber' : (isF ? 'green' : 'red');
      const val = localStorage.getItem('bva_comment_'+i.l) || '';
      
      html += `
        <tr style="${i.sub ? 'font-weight:600;background:var(--bg-surface-raised)' : ''}">
          <td>${i.l}</td>
          <td>${fmtM(i.a)}</td>
          <td>${fmtM(i.b)}</td>
          <td class="num-${varColor(v,i.rev)}">${fmtM(v)}</td>
          <td class="num-${varColor(v,i.rev)}">${fmtPct(p)}</td>
          <td style="text-align:center"><span class="rag ${dot}"></span></td>
          <td><input type="text" id="bva-input-${i.l.replace(/[^a-zA-Z]/g,'')}" class="commentary-input" placeholder="Add variance explanation..." value="${val}" onchange="localStorage.setItem('bva_comment_${i.l}', this.value)"></td>
          <td style="text-align:center"><button class="header-btn" style="padding:2px 6px;" title="Auto-Commentary" onclick="generateRowCommentary('${i.l}', ${i.a}, ${i.b}, ${p.toFixed(1)}, '${dot}')">⬡</button></td>
        </tr>
      `;
    }
  });
  document.querySelector('#bva-table tbody').innerHTML = html;

  makeChart('bva-ebitda-bridge', {
    type: 'bar',
    data: {
      labels: ['Budget EBITDA', 'Volume Delta', 'Price Delta', 'COGS Delta', 'SG&A Overrun', 'Actual EBITDA'],
      datasets: [{
        data: [[0, b.ebitda], [b.ebitda, b.ebitda - 2.1], [b.ebitda - 2.1, b.ebitda - 1.6], [b.ebitda - 1.6, b.ebitda - 0.6], [b.ebitda - 0.6, a.ebitda], [0, a.ebitda]],
        backgroundColor: [cBdg, cUnfav, cFav, cFav, cUnfav, cActual]
      }]
    },
    options: { plugins: { legend: { display: false } } }
  });
}

async function generateRowCommentary(label, actual, budget, varPct, trend) {
  const conf = getAIConfig();
  if (!conf.key) {
    openAIModal();
    return;
  }
  const cleanId = label.replace(/[^a-zA-Z]/g,'');
  const inputEl = document.getElementById('bva-input-' + cleanId);
  if (inputEl) inputEl.value = 'Analyst drafting...';

  const userPrompt = `Write a single professional sentence explaining this variance for a management pack: ${label} was €${actual}M vs budget €${budget}M, a ${varPct}% variance (status: ${trend}). Context: Q1 March close for Nexova Group S.A. Max 25 words.`;
  try {
    const res = await callAI(userPrompt, "You are a senior financial controller writing concise board report variance explanations. Output single sentence only.", null, false);
    if (inputEl) {
      inputEl.value = res.trim();
      localStorage.setItem('bva_comment_' + label, res.trim());
      showToast(`Commentary generated for ${label}`);
    }
  } catch (err) {
    if (inputEl) inputEl.value = '';
    showToast(`Generation failed: ${err.message}`, 'error');
  }
}

// 9. Variance Analysis (Upgraded with Top KPIs & Detailed Decomposition Table)
function renderVarianceAnalysis() {
  const d = window.NEXOVA_DATA;
  const a = d.actuals.ytd, b = d.budget.ytd;
  const totalRevVar = a.revenue - b.revenue;
  const totalGpVar = a.grossProfit - b.grossProfit;
  const totalEbVar = a.ebitda - b.ebitda;
  const totalHcVar = d.headcount.actual - d.headcount.budget;

  // 4 Top KPI Cards
  document.getElementById('var-kpi-container').innerHTML = `
    <div class="kpi-card">
      <div class="kpi-label">Revenue Variance</div>
      <div class="kpi-value" style="color:var(--color-unfav)">${fmtM(totalRevVar)}</div>
      <div class="kpi-sub">${fmtPct(totalRevVar/b.revenue*100)} vs Q1 Budget</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">Gross Profit Variance</div>
      <div class="kpi-value" style="color:var(--color-unfav)">${fmtM(totalGpVar)}</div>
      <div class="kpi-sub">${fmtPct(totalGpVar/b.grossProfit*100)} vs Q1 Budget</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">EBITDA Variance</div>
      <div class="kpi-value" style="color:var(--color-unfav)">${fmtM(totalEbVar)}</div>
      <div class="kpi-sub">${fmtPct(totalEbVar/b.ebitda*100)} vs Q1 Budget</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">Headcount Variance</div>
      <div class="kpi-value" style="color:var(--color-fav)">${totalHcVar} FTE</div>
      <div class="kpi-sub">Favorable cost absorption</div>
    </div>
  `;

  // Commentary block
  document.getElementById('var-commentary').innerHTML = `
    <p><strong>Revenue Variance: –€4.0M (–3.4% vs budget)</strong> decomposed as: Volume –€2.1M (delayed Heidelberg order, now confirmed Q2), Price/Mix –€1.4M (temporary concessions to retain Renault contract), FX –€0.5M (EUR strengthened vs USD). <strong>COGS Variance: +€1.0M unfavourable</strong> — materials inflation +1.2pp, partially offset by volume savings. <strong>SG&A: +€0.4M over budget</strong> — HR consulting fees (€0.3M, one-off) and trade show costs (€0.1M).</p>
  `;

  // VPM Table
  const vpmEl = document.getElementById('var-vpm-table');
  if (vpmEl) {
    const volVar = -2.1, priceVar = 0.5, mixVar = -2.4;
    vpmEl.querySelector('tbody').innerHTML = `
      <tr><td>Volume Effect</td><td class="num-unfav">${fmtM(volVar)}</td><td class="num-unfav">${fmtPct(volVar/b.revenue*100)}</td><td>Delayed Heidelberg order pushed to Q2</td></tr>
      <tr><td>Price Effect</td><td class="num-fav">${fmtM(priceVar)}</td><td class="num-fav">${fmtPct(priceVar/b.revenue*100)}</td><td>Spot pricing improvements across Division B Services</td></tr>
      <tr><td>Mix Effect</td><td class="num-unfav">${fmtM(mixVar)}</td><td class="num-unfav">${fmtPct(mixVar/b.revenue*100)}</td><td>Higher proportion of lower-margin service contracts</td></tr>
      <tr class="subtotal"><td>Total Revenue Variance</td><td class="num-unfav">${fmtM(totalRevVar)}</td><td class="num-unfav">${fmtPct(totalRevVar/b.revenue*100)}</td><td>Net shortfall vs Q1 Operating Plan</td></tr>
    `;
  }

  makeChart('var-rev-walk', {
    type: 'bar',
    data: {
      labels: ['Budget', 'Volume', 'Price', 'Mix', 'Actual'],
      datasets: [{
        data: [[0,116.5],[116.5,114.4],[114.4,114.9],[114.9,112.5],[0,112.5]],
        backgroundColor: [cBdg, cUnfav, cFav, cUnfav, cActual]
      }]
    },
    options: { plugins: { legend: { display: false } } }
  });

  makeChart('var-cost-walk', {
    type: 'bar',
    data: {
      labels: ['Budget COGS', 'Materials Infl.', 'Labor Savings', 'Freight', 'Actual COGS'],
      datasets: [{
        data: [[0,71.2],[71.2,72.4],[72.4,71.0],[71.0,70.2],[0,70.2]],
        backgroundColor: [cBdg, cUnfav, cFav, cFav, cActual]
      }]
    },
    options: { plugins: { legend: { display: false } } }
  });

  // Detailed P&L Variance Decomposition Table
  const decompRows = [
    {line:'Revenue', act:a.revenue, bdg:b.revenue, varE:-4.0, varP:-3.4, vol:-2.1, pm:-1.4, fx:-0.5, struct:0.0},
    {line:'COGS', act:a.cogs, bdg:b.cogs, varE:1.0, varP:1.4, vol:-1.3, pm:1.8, fx:0.2, struct:0.3},
    {line:'Gross Profit', act:a.grossProfit, bdg:b.grossProfit, varE:-3.0, varP:-6.6, vol:-0.8, pm:-1.9, fx:-0.3, struct:0.0},
    {line:'SG&A', act:a.sgna, bdg:b.sgna, varE:0.4, varP:2.3, vol:0.0, pm:0.1, fx:0.0, struct:0.3},
    {line:'R&D', act:a.rnd, bdg:b.rnd, varE:0.2, varP:5.7, vol:0.0, pm:0.0, fx:0.0, struct:0.2},
    {line:'G&A', act:a.gna, bdg:b.gna, varE:0.3, varP:5.0, vol:0.0, pm:0.0, fx:0.0, struct:0.3},
    {line:'EBITDA', act:a.ebitda, bdg:b.ebitda, varE:-1.5, varP:-9.3, vol:-0.8, pm:-0.4, fx:-0.3, struct:0.0}
  ];

  document.querySelector('#var-decomp-table tbody').innerHTML = decompRows.map(r => `
    <tr class="${r.line==='Revenue'||r.line==='Gross Profit'||r.line==='EBITDA'?'subtotal':''}">
      <td>${r.line}</td>
      <td>${fmtM(r.act)}</td><td>${fmtM(r.bdg)}</td>
      <td class="num-${r.varE>=0&&r.line!=='COGS'&&r.line!=='SG&A'?'fav':'unfav'}">${fmtM(r.varE)}</td>
      <td class="num-${r.varP>=0&&r.line!=='COGS'&&r.line!=='SG&A'?'fav':'unfav'}">${fmtPct(r.varP)}</td>
      <td>${fmtM(r.vol)}</td>
      <td>${fmtM(r.pm)}</td>
      <td>${fmtM(r.fx)}</td>
      <td>${fmtM(r.struct)}</td>
    </tr>
  `).join('');
}

// 10. Margin Analysis (Upgraded with 4 KPIs, Operating Leverage & Margin Waterfall)
function renderMarginAnalysis() {
  const d = window.NEXOVA_DATA;
  const a = d.actuals.ytd, b = d.budget.ytd;
  const months = d.actuals.monthly.map(m => m.m);
  const grossMargins = d.actuals.monthly.map(m => ((m.grossProfit / m.revenue) * 100));
  const ebitdaMargins = d.actuals.monthly.map(m => ((m.ebitda / m.revenue) * 100));
  const budgetGM = months.map(() => d.budget.ytd.grossMargin);
  const budgetEM = months.map(() => d.budget.ytd.ebitdaMargin);

  // 4 Top KPI Cards
  document.getElementById('ma-kpi-container').innerHTML = `
    <div class="kpi-card">
      <div class="kpi-label">Gross Margin %</div>
      <div class="kpi-value">${a.grossMargin.toFixed(1)}%</div>
      <div class="kpi-sub">BDG: ${b.grossMargin.toFixed(1)}% | <span class="delta unfav">-130 bps</span></div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">EBITDA Margin %</div>
      <div class="kpi-value">${a.ebitdaMargin.toFixed(1)}%</div>
      <div class="kpi-sub">BDG: ${b.ebitdaMargin.toFixed(1)}% | <span class="delta unfav">-80 bps</span></div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">EBIT Margin %</div>
      <div class="kpi-value">${a.ebitMargin.toFixed(1)}%</div>
      <div class="kpi-sub">BDG: ${b.ebitMargin.toFixed(1)}% | <span class="delta unfav">-310 bps</span></div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">Net Margin %</div>
      <div class="kpi-value">${a.netMargin.toFixed(1)}%</div>
      <div class="kpi-sub">BDG: ${b.netMargin.toFixed(1)}% | <span class="delta unfav">-260 bps</span></div>
    </div>
  `;

  makeChart('ma-gross', {
    type:'line',
    data:{ labels:months, datasets:[
      {label:'Actual GM%', data:grossMargins, borderColor:getCActual(), tension:0.3, pointRadius:3},
      {label:'Budget', data:budgetGM, borderColor:'rgba(156,163,175,0.5)', borderDash:[4,4]}
    ]},
    options:{ scales:{ y:{ ticks:{ callback: v => v.toFixed(1)+'%' } } } }
  });

  makeChart('ma-ebitda', {
    type:'line',
    data:{ labels:months, datasets:[
      {label:'Actual EBITDA%', data:ebitdaMargins, borderColor:'#66BB6A', tension:0.3, pointRadius:3},
      {label:'Budget', data:budgetEM, borderColor:'rgba(156,163,175,0.5)', borderDash:[4,4]}
    ]},
    options:{ scales:{ y:{ ticks:{ callback: v => v.toFixed(1)+'%' } } } }
  });

  // Operating Leverage Chart (Revenue on X, EBITDA on Y)
  const sortedMonths = [...d.actuals.monthly].sort((x,y) => x.revenue - y.revenue);
  makeChart('ma-leverage-chart', {
    type: 'line',
    data: {
      labels: sortedMonths.map(m => `€${m.revenue.toFixed(1)}M (${m.m})`),
      datasets: [{
        label: 'EBITDA (€M)',
        data: sortedMonths.map(m => m.ebitda),
        borderColor: cActual,
        backgroundColor: 'rgba(59,130,246,0.2)',
        fill: true,
        tension: 0.2,
        pointRadius: 5
      }]
    },
    options: {
      plugins: { legend: { display: false } },
      scales: {
        x: { title: { display: true, text: 'Monthly Revenue (€M)' } },
        y: { title: { display: true, text: 'Monthly EBITDA (€M)' }, beginAtZero: false }
      }
    }
  });

  // Margin Waterfall Horizontal Bar Chart
  makeChart('ma-waterfall-chart', {
    type: 'bar',
    data: {
      labels: ['Gross Margin', '-SG&A', '-R&D', '-G&A', 'EBIT Margin', '-Interest', '-Tax', 'Net Margin'],
      datasets: [{
        data: [
          [0, 37.6],
          [37.6, 22.0],
          [22.0, 18.7],
          [18.7, 13.1],
          [0, 8.2],
          [8.2, 6.6],
          [6.6, 4.8],
          [0, 4.8]
        ],
        backgroundColor: [cFav, cUnfav, cUnfav, cUnfav, cActual, cUnfav, cUnfav, cFav]
      }]
    },
    options: {
      indexAxis: 'y',
      plugins: { legend: { display: false } },
      scales: { x: { ticks: { callback: v => v + '%' } } }
    }
  });
}

// 11. Cost Centers
function renderCostCenters() {
  const selectedEntity = document.getElementById('cc-entity-filter')?.value || 'all';
  let ccList = window.NEXOVA_DATA.costCenters;

  if (selectedEntity !== 'all') {
    ccList = ccList.filter(c => c.id === selectedEntity);
  }

  let html = '';
  ccList.forEach(c => {
    html += `
      <tr class="tree-row parent">
        <td>▼ ${c.name}</td>
        <td>${fmtM(c.actual)}</td>
        <td>${fmtM(c.budget)}</td>
        <td class="num-${c.variance<=0?'fav':'unfav'}">${fmtM(c.variance)}</td>
        <td class="num-${c.varPct<=0?'fav':'unfav'}">${fmtPct(c.varPct)}</td>
        <td>${c.fte}</td>
        <td>${c.budgetFte}</td>
        <td style="text-align:center"><span class="rag ${c.rag}"></span></td>
      </tr>
    `;
    (c.children || []).forEach(ch => {
      html += `
        <tr class="tree-row child">
          <td>${ch.name}</td>
          <td>${fmtM(ch.actual)}</td>
          <td>${fmtM(ch.budget)}</td>
          <td class="num-${ch.variance<=0?'fav':'unfav'}">${fmtM(ch.variance)}</td>
          <td class="num-${ch.varPct<=0?'fav':'unfav'}">${fmtPct(ch.varPct)}</td>
          <td>${ch.fte}</td>
          <td>${ch.budgetFte}</td>
          <td style="text-align:center"><span class="rag ${ch.rag}"></span></td>
        </tr>
      `;
    });
  });

  document.querySelector('#cc-table tbody').innerHTML = html;

  makeChart('cc-spend', {
    type: 'bar',
    data: {
      labels: ccList.map(c => c.name.split(' — ')[0]),
      datasets: [
        {label:'Actual', data:ccList.map(c=>c.actual), backgroundColor:cActual},
        {label:'Budget', data:ccList.map(c=>c.budget), backgroundColor:cBdg}
      ]
    }
  });

  makeChart('cc-fte', {
    type: 'bar',
    data: {
      labels: ccList.map(c => c.name.split(' — ')[0]),
      datasets: [
        { label:'Actual FTE', data: ccList.map(c=>c.fte), backgroundColor:getCActual() },
        { label:'Budget FTE', data: ccList.map(c=>c.budgetFte), backgroundColor:'rgba(156,163,175,0.4)' }
      ]
    }
  });
}

// 12. Commentary Workshop
function openCommentaryWorkshop(scope = 'Executive Summary') {
  navigateTo('commentary-workshop');
  const r = document.querySelector(`input[name="cw-scope"][value="${scope}"]`);
  if (r) r.checked = true;
}

function renderCommentaryHistory() {
  const raw = localStorage.getItem('commentary_history');
  const hist = raw ? JSON.parse(raw) : [];
  const listEl = document.getElementById('cw-history-list');
  if (!listEl) return;

  if (hist.length === 0) {
    listEl.innerHTML = '<div style="color:var(--text-muted); font-size:12px; text-align:center; padding:16px;">No saved commentaries yet.</div>';
    return;
  }

  listEl.innerHTML = hist.map((item, idx) => `
    <div class="history-item">
      <div class="history-meta">
        <span style="font-weight:600; color:var(--accent)">${item.scope}</span>
        <span>${item.time}</span>
      </div>
      <div style="color:var(--text-primary); margin-bottom:6px; max-height:45px; overflow:hidden; text-overflow:ellipsis;">
        ${item.text.substring(0, 100)}...
      </div>
      <button class="header-btn" style="font-size:10px; padding:2px 6px;" onclick="restoreCommentary(${idx})">Restore</button>
    </div>
  `).join('');
}

function restoreCommentary(idx) {
  const raw = localStorage.getItem('commentary_history');
  const hist = raw ? JSON.parse(raw) : [];
  if (hist[idx]) {
    const card = document.getElementById('cw-preview-card');
    const paras = hist[idx].text.split('\n\n').map(p => `<p>${p}</p>`).join('');
    card.innerHTML = paras;
    window._lastGeneratedCommentary = hist[idx].text;
    showToast(`Restored commentary from ${hist[idx].time}`);
  }
}

async function generateCommentaryWorkshop() {
  const conf = getAIConfig();
  if (!conf.key) {
    openAIModal();
    return;
  }

  const scope = document.querySelector('input[name="cw-scope"]:checked')?.value || 'Executive Summary';
  const audience = document.getElementById('cw-audience').value;
  const highlights = document.getElementById('cw-highlights').value;
  const incPy = document.getElementById('cw-opt-py').checked;
  const incFwd = document.getElementById('cw-opt-fwd').checked;

  const d = window.NEXOVA_DATA;
  const a = d.actuals.ytd, b = d.budget.ytd;
  const revVar = (a.revenue - b.revenue).toFixed(1);
  const ebVar = (a.ebitda - b.ebitda).toFixed(1);
  const alertsSummary = d.alerts.map(al => `${al.title} (${al.what})`).join('; ');

  const systemPrompt = `You are a senior management controller writing the monthly financial commentary for Nexova Group S.A.
Write in a direct, professional register appropriate for ${audience}.
Structure: 1 headline sentence, then P&L section (revenue, gross margin, EBITDA), then key variances, then ${incPy ? 'prior year comparisons' : ''}, then ${incFwd ? 'forward-looking outlook paragraph' : ''}.
Use these actual numbers:
- Scope: ${scope}
- Revenue Actual: €${a.revenue}M vs Budget €${b.revenue}M (Var: €${revVar}M)
- EBITDA Actual: €${a.ebitda}M vs Budget €${b.ebitda}M (Var: €${ebVar}M, Margin: ${a.ebitdaMargin}%)
- Net Income: €${a.netIncome}M vs Budget €${b.netIncome}M
- Working Capital DSO: ${d.workingCapital.current.dso}d vs Budget ${d.workingCapital.budget.dso}d
- Headcount: ${d.headcount.actual} vs Budget ${d.headcount.budget}
- Active Alerts: ${alertsSummary}
${highlights ? 'Additional controller notes to incorporate: ' + highlights : ''}

Be specific. Never say "results were impacted by market conditions" without naming specific drivers. Use exact figures.
Output maximum 350 words. No markdown headers or bullet points — flowing paragraphs with key numbers in bold only.`;

  const previewCard = document.getElementById('cw-preview-card');
  const loadingBadge = document.getElementById('cw-loading-badge');
  loadingBadge.style.display = 'block';
  previewCard.innerHTML = '<p class="streaming">Synthesizing financials and drafting narrative...</p>';

  try {
    const fullText = await callAI(`Generate management commentary for ${scope}`, systemPrompt, (chunk, full) => {
      let formatted = full.replace(/\n\n/g, '</p><p>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      previewCard.innerHTML = `<p>${formatted}</p>`;
    }, false);

    loadingBadge.style.display = 'none';
    window._lastGeneratedCommentary = fullText;

    const raw = localStorage.getItem('commentary_history');
    let hist = raw ? JSON.parse(raw) : [];
    hist.unshift({
      scope,
      time: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}),
      text: fullText
    });
    if (hist.length > 5) hist = hist.slice(0, 5);
    localStorage.setItem('commentary_history', JSON.stringify(hist));
    renderCommentaryHistory();
    showToast("Commentary generated successfully");
  } catch (err) {
    loadingBadge.style.display = 'none';
    previewCard.innerHTML = `<p style="color:var(--color-unfav)">Error generating commentary: ${escapeHTML(err.message)}</p>`;
    showToast("Generation failed", "error");
  }
}

function copyCommentaryToClipboard() {
  const text = window._lastGeneratedCommentary || document.getElementById('cw-preview-card').innerText;
  navigator.clipboard.writeText(text).then(() => {
    showToast("Commentary copied to clipboard");
  });
}

function insertCommentaryIntoReport() {
  const text = window._lastGeneratedCommentary || document.getElementById('cw-preview-card').innerText;
  window.NEXOVA_DATA.commentary = text;
  renderExecutiveSummary();
  showToast("Commentary inserted into Executive Summary");
}

// 13. Working Capital Dashboard
function renderWCDashboard() {
  const w = window.NEXOVA_DATA.workingCapital;
  const d = window.NEXOVA_DATA;

  const banners = [];
  const annualRev = d.budget.fullYear.revenue || 480.0;
  const revPerDay = annualRev / 365.0;

  if (w.current.dso > w.budget.dso + 3.0) {
    const excessDays = (w.current.dso - w.budget.dso).toFixed(1);
    const cashImpact = (excessDays * revPerDay).toFixed(1);
    banners.push(`
      <div class="wc-alert-banner">
        <span>⚠</span>
        <span><strong>DSO Deterioration Alert:</strong> DSO is ${excessDays}d above target. At current revenue run-rate (€${revPerDay.toFixed(2)}M/day), each additional day of DSO = €${cashImpact}M of incremental receivables tied up.</span>
      </div>
    `);
  }

  if (w.current.dpo < w.priorYear.dpo - 5.0) {
    const dpoGap = (w.priorYear.dpo - w.current.dpo).toFixed(1);
    const cashRel = (dpoGap * (d.budget.fullYear.cogs / 365.0)).toFixed(1);
    banners.push(`
      <div class="wc-alert-banner" style="background:var(--color-fav-bg); border-color:var(--color-fav); color:var(--color-fav);">
        <span>ℹ</span>
        <span><strong>Payables Acceleration:</strong> Payments are accelerating vs prior year (-${dpoGap}d). Stretching AP terms to prior year level would release ~€${cashRel}M of cash flow.</span>
      </div>
    `);
  }

  document.getElementById('wc-alert-banners').innerHTML = banners.join('');

  document.getElementById('wc-kpi-container').innerHTML =
    buildDayCard('DSO (days)', w.current.dso, w.budget.dso, w.priorYear.dso, true) +
    buildDayCard('DPO (days)', w.current.dpo, w.budget.dpo, w.priorYear.dpo, false) +
    buildDayCard('DIO (days)', w.current.dio, w.budget.dio, w.priorYear.dio, true) +
    buildDayCard('CCC (days)', w.current.ccc, w.budget.ccc, w.priorYear.ccc, true);

  makeChart('wc-ccc-trend', {
    type: 'line',
    data: {
      labels: w.quarterly.map(q=>q.q),
      datasets: [{ label:'CCC', data: w.quarterly.map(q=>q.ccc), borderColor:cActual, tension:0.3, pointRadius:4 }]
    }
  });

  makeChart('wc-nwc-bridge', {
    type: 'bar',
    data: {
      labels: ['Prior NWC', 'AR Delta', 'Inventory Delta', 'AP Delta', 'Current NWC'],
      datasets: [{
        data: [[0,65.3], [65.3,67.8], [67.8,68.7], [68.7,66.6], [0,66.6]],
        backgroundColor: [cBdg, cUnfav, cUnfav, cFav, cActual]
      }]
    },
    options: { plugins: { legend: { display: false } } }
  });
}

// 14. Aging Detail
function renderAgingDetail() {
  const activeTab = document.querySelector('.tab[data-tab^="aging-"].active')?.dataset.tab || 'aging-ar';
  document.querySelectorAll('.tab[data-tab^="aging-"]').forEach(t => {
    t.addEventListener('click', e => {
      document.querySelectorAll('.tab[data-tab^="aging-"]').forEach(x=>x.classList.remove('active'));
      e.target.classList.add('active');
      renderAgingDetail();
    }, {once:true});
  });

  const w = window.NEXOVA_DATA.workingCapital;
  
  if (activeTab === 'aging-ar') {
    document.querySelector('#aging-table thead').innerHTML = `<tr><th>Customer</th><th>Invoice</th><th>Due Date</th><th>Days</th><th>Amount</th><th>Status</th></tr>`;
    document.querySelector('#aging-table tbody').innerHTML = w.ar_customers.map(c => `
      <tr>
        <td>${c.name}</td><td>${c.invoice}</td><td>${c.due}</td><td>${c.days}</td><td>${fmtM(c.amount)}</td>
        <td><span class="severity-badge severity-${c.status==='Legal'?'HIGH':'MEDIUM'}">${c.status}</span></td>
      </tr>
    `).join('');
    makeChart('aging-chart', { type:'bar', data:{labels:w.ar_aging.map(x=>x.bucket),datasets:[{label:'AR Amount',data:w.ar_aging.map(x=>x.amount),backgroundColor:cActual}]} });
  } else if (activeTab === 'aging-ap') {
    document.querySelector('#aging-table thead').innerHTML = `<tr><th>Bucket</th><th>Amount</th><th>% of Total</th></tr>`;
    document.querySelector('#aging-table tbody').innerHTML = w.ap_aging.map(c => `<tr><td>${c.bucket}</td><td>${fmtM(c.amount)}</td><td>${fmtPct(c.pct)}</td></tr>`).join('');
    makeChart('aging-chart', { type:'bar', data:{labels:w.ap_aging.map(x=>x.bucket),datasets:[{label:'AP Amount',data:w.ap_aging.map(x=>x.amount),backgroundColor:cFav}]} });
  } else {
    document.querySelector('#aging-table thead').innerHTML = `<tr><th>SKU</th><th>Category</th><th>Closing</th><th>Days Cover</th><th>Flag</th></tr>`;
    document.querySelector('#aging-table tbody').innerHTML = w.inventory.map(c => `
      <tr>
        <td>${c.sku}</td><td>${c.category}</td><td>${fmtM(c.closing)}</td><td>${c.daysCover}</td>
        <td><span class="rag ${c.flag==='obsolete'?'red':c.flag==='watch'?'amber':'green'}"></span></td>
      </tr>
    `).join('');
    makeChart('aging-chart', { type:'bar', data:{labels:w.inventory.map(x=>x.sku.substring(0,8)),datasets:[{label:'Closing',data:w.inventory.map(x=>x.closing),backgroundColor:cActual}]} });
  }
}

// 15. Rolling Forecast (Upgraded with Trajectory Card & Gap Tracker Table)
function recomputeForecast() {
  const vg = parseFloat(document.getElementById('rf-vol')?.value || 0) / 100;
  const pc = parseFloat(document.getElementById('rf-price')?.value || 0) / 100;
  const oi = parseFloat(document.getElementById('rf-opex')?.value || 0) / 100;
  const fx = parseFloat(document.getElementById('rf-fx')?.value || 1.0);

  document.getElementById('rf-vol-val').innerText = fmtPct(vg * 100, 0);
  document.getElementById('rf-price-val').innerText = fmtPct(pc * 100, 0);
  document.getElementById('rf-opex-val').innerText = fmtPct(oi * 100, 0);
  document.getElementById('rf-fx-val').innerText = fx.toFixed(2) + 'x';

  const base = window.NEXOVA_DATA.forecast.base;
  const actuals = window.NEXOVA_DATA.actuals.monthly;
  const bdg = window.NEXOVA_DATA.budget.monthly;

  const revs = [actuals[0].revenue, actuals[1].revenue, actuals[2].revenue];
  const ebits = [actuals[0].ebitda, actuals[1].ebitda, actuals[2].ebitda];

  let html = '<tr><td>Revenue</td>';
  for(let i=0; i<3; i++) html += `<td class="locked-cell">${fmtM(revs[i])}</td>`;
  for(let i=0; i<6; i++) {
    const adjRev = base[i].revenue * (1 + vg) * (1 + pc) * fx;
    revs.push(adjRev);
    html += `<td><input type="text" value="${adjRev.toFixed(1)}"></td>`;
  }
  html += '</tr><tr><td>EBITDA</td>';
  for(let i=0; i<3; i++) html += `<td class="locked-cell">${fmtM(ebits[i])}</td>`;
  for(let i=0; i<6; i++) {
    const adjEb = (base[i].ebitda + base[i].revenue * vg * 0.40) * (1 - oi * 0.30) * fx;
    ebits.push(adjEb);
    html += `<td><input type="text" value="${adjEb.toFixed(1)}"></td>`;
  }
  html += '</tr>';

  document.querySelector('#rf-table tbody').innerHTML = html;

  const lbls = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep'];
  makeChart('rf-chart-rev', {
    type:'line',
    data:{ labels:lbls, datasets:[{label:'Revenue (€M)', data:revs, borderColor:cActual, backgroundColor:cActual+'22', fill:true, tension:0.3 }] }
  });
  makeChart('rf-chart-ebitda', {
    type:'line',
    data:{ labels:lbls, datasets:[{label:'EBITDA (€M)', data:ebits, borderColor:cFav, backgroundColor:cFav+'22', fill:true, tension:0.3 }] }
  });

  // Full-year Trajectory calculation
  const q1Act = 112.5;
  const fAprSep = revs.slice(3, 9).reduce((a,b)=>a+b, 0);
  const q4Bdg = bdg[9].revenue + bdg[10].revenue + bdg[11].revenue; // Oct, Nov, Dec
  const projFy = q1Act + fAprSep + q4Bdg;
  const fyBudget = window.NEXOVA_DATA.budget.fullYear.revenue;

  document.getElementById('rf-trajectory-card').innerHTML = `
    <p><strong>Full-Year Revenue Trajectory:</strong> Based on Q1 actuals (€${q1Act.toFixed(1)}M) + current forecast Apr–Sep (€${fAprSep.toFixed(1)}M) + Q4 budget reference (€${q4Bdg.toFixed(1)}M) = <strong>Projected Full Year: €${projFy.toFixed(1)}M</strong> vs Budget €${fyBudget.toFixed(1)}M (Delta: <span class="delta ${projFy>=fyBudget?'fav':'unfav'}">${fmtM(projFy-fyBudget)}</span>).</p>
    <p style="margin-top:6px;">Implied H2 run-rate required to meet annual guidance: <strong>€41.2M/mo</strong>.</p>
  `;

  // Gap Tracker Table
  let gapHtml = '';
  let cumGap = 0;
  for(let i=0; i<6; i++) {
    const mIdx = i + 3; // Apr is index 3
    const mName = lbls[mIdx];
    const fcVal = revs[mIdx];
    const bgVal = bdg[mIdx].revenue;
    const gap = fcVal - bgVal;
    cumGap += gap;
    gapHtml += `
      <tr>
        <td style="font-weight:600">${mName}</td>
        <td>${fmtM(fcVal)}</td>
        <td>${fmtM(bgVal)}</td>
        <td class="num-${gap>=0?'fav':'unfav'}">${fmtM(gap)}</td>
        <td class="num-${cumGap>=0?'fav':'unfav'}">${fmtM(cumGap)}</td>
      </tr>
    `;
  }
  document.querySelector('#rf-gap-table tbody').innerHTML = gapHtml;
}

function renderRollingForecast() {
  recomputeForecast();
}

// 16. Forecast Accuracy Scorecard
function renderForecastAccuracy() {
  const d = window.NEXOVA_DATA.forecastAccuracy.months;
  
  let totalRevAcc = 0, totalEbAcc = 0, worstMonth = null, maxMiss = -1;
  let signedRevErrorSum = 0, signedEbErrorSum = 0;

  d.forEach(m => {
    const revErrAbs = Math.abs(m.forecastRevenue - m.actualRevenue);
    const revAcc = (1 - (revErrAbs / m.actualRevenue)) * 100;
    totalRevAcc += revAcc;

    const ebErrAbs = Math.abs(m.forecastEbitda - m.actualEbitda);
    const ebAcc = (1 - (ebErrAbs / m.actualEbitda)) * 100;
    totalEbAcc += ebAcc;

    signedRevErrorSum += (m.actualRevenue - m.forecastRevenue);
    signedEbErrorSum += (m.actualEbitda - m.forecastEbitda);

    if (revErrAbs > maxMiss) {
      maxMiss = revErrAbs;
      worstMonth = { month: m.m, miss: revErrAbs, act: m.actualRevenue, fc: m.forecastRevenue };
    }
  });

  const avgRevAcc = totalRevAcc / d.length;
  const avgEbAcc = totalEbAcc / d.length;
  const avgSignedRev = signedRevErrorSum / d.length;
  const avgSignedEb = signedEbErrorSum / d.length;

  document.getElementById('fa-kpi-container').innerHTML = `
    <div class="kpi-card">
      <div class="kpi-label">Avg Revenue Forecast Accuracy</div>
      <div class="kpi-value" style="color:${avgRevAcc>=95?'var(--color-fav)':avgRevAcc>=90?'var(--color-watch)':'var(--color-unfav)'}">${avgRevAcc.toFixed(1)}%</div>
      <div class="kpi-sub">Target: >95% accuracy threshold</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">Avg EBITDA Forecast Accuracy</div>
      <div class="kpi-value" style="color:${avgEbAcc>=95?'var(--color-fav)':avgEbAcc>=90?'var(--color-watch)':'var(--color-unfav)'}">${avgEbAcc.toFixed(1)}%</div>
      <div class="kpi-sub">Target: >92% accuracy threshold</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">Worst Variance Month</div>
      <div class="kpi-value" style="color:var(--color-unfav)">${worstMonth.month}</div>
      <div class="kpi-sub">Miss of -€${worstMonth.miss.toFixed(1)}M (${fmtM(worstMonth.act)} vs ${fmtM(worstMonth.fc)})</div>
    </div>
  `;

  let html = '';
  d.forEach(m => {
    const rErr = m.actualRevenue - m.forecastRevenue;
    const rErrPct = (rErr / m.forecastRevenue) * 100;
    const ebErr = m.actualEbitda - m.forecastEbitda;
    const ebErrPct = (ebErr / m.forecastEbitda) * 100;
    const score = ((1 - Math.abs(rErr)/m.actualRevenue) * 0.5 + (1 - Math.abs(ebErr)/m.actualEbitda) * 0.5) * 100;

    const rClass = Math.abs(rErrPct) < 2 ? 'num-fav' : Math.abs(rErrPct) <= 5 ? 'num-watch' : 'num-unfav';
    const ebClass = Math.abs(ebErrPct) < 2 ? 'num-fav' : Math.abs(ebErrPct) <= 5 ? 'num-watch' : 'num-unfav';

    html += `
      <tr>
        <td style="font-weight:600">${m.m}</td>
        <td>${fmtM(m.forecastRevenue)}</td>
        <td>${fmtM(m.actualRevenue)}</td>
        <td class="${rClass}">${fmtM(rErr)}</td>
        <td class="${rClass}">${fmtPct(rErrPct)}</td>
        <td>${fmtM(m.forecastEbitda)}</td>
        <td>${fmtM(m.actualEbitda)}</td>
        <td class="${ebClass}">${fmtM(ebErr)}</td>
        <td class="${ebClass}">${fmtPct(ebErrPct)}</td>
        <td style="font-weight:600">${score.toFixed(1)}%</td>
      </tr>
    `;
  });

  html += `
    <tr class="total">
      <td>Rolling 6M Average</td>
      <td>—</td><td>—</td>
      <td>${fmtM(avgSignedRev)}</td>
      <td>—</td>
      <td>—</td><td>—</td>
      <td>${fmtM(avgSignedEb)}</td>
      <td>—</td>
      <td style="color:var(--accent)">${((avgRevAcc+avgEbAcc)/2).toFixed(1)}%</td>
    </tr>
  `;
  document.querySelector('#fa-table tbody').innerHTML = html;

  makeChart('fa-rev-chart', {
    type: 'line',
    data: {
      labels: d.map(x=>x.m),
      datasets: [
        { label:'Forecast Revenue', data:d.map(x=>x.forecastRevenue), borderColor:'rgba(59,130,246,0.6)', borderDash:[5,5], tension:0.3 },
        { label:'Actual Revenue', data:d.map(x=>x.actualRevenue), borderColor:getCActual(), tension:0.3, pointRadius:4 }
      ]
    }
  });

  makeChart('fa-ebitda-chart', {
    type: 'bar',
    data: {
      labels: d.map(x=>x.m),
      datasets: [{
        label:'EBITDA Error (€M)',
        data: d.map(x => x.actualEbitda - x.forecastEbitda),
        backgroundColor: d.map(x => (x.actualEbitda - x.forecastEbitda) >= 0 ? cFav : cUnfav)
      }]
    }
  });

  const revBiasText = avgSignedRev < 0 ?
    `⚠ <strong>Revenue Bias:</strong> You tend to over-forecast revenue by an average of <strong>€${Math.abs(avgSignedRev).toFixed(2)}M</strong> per month. Consider applying a <strong>${(Math.abs(avgSignedRev)/40*100).toFixed(1)}% haircut</strong> to your next rolling cycle.` :
    `✓ <strong>Revenue Bias:</strong> Slight tendency to under-forecast (+€${avgSignedRev.toFixed(2)}M/mo). Revenue forecasts are prudent and conservative.`;

  const ebBiasText = avgSignedEb < 0 ?
    `⚠ <strong>EBITDA Bias:</strong> Forecasted EBITDA exceeded actual results by an average of <strong>€${Math.abs(avgSignedEb).toFixed(2)}M</strong> per month. Review OpEx escalation assumptions.` :
    `✓ <strong>EBITDA Bias:</strong> EBITDA targets are disciplined with minor positive upside realization.`;

  document.getElementById('fa-bias-card').innerHTML = `
    <div style="font-weight:600; text-transform:uppercase; font-size:11px; letter-spacing:0.06em; margin-bottom:6px; color:var(--accent)">Systematic Forecast Bias Diagnosis</div>
    <p style="margin-bottom:6px;">${revBiasText}</p>
    <p>${ebBiasText}</p>
  `;
}

// 17. Scenario Planning
function renderScenarioPlanning() {
  const volSteps = [-10, -5, 0, 5, 10];
  const priceSteps = [-5.0, -2.5, 0.0, 2.5, 5.0];
  const baseEb = 72.0;
  const cmRate = 0.40;

  const currentVol = parseFloat(document.getElementById('rf-vol')?.value || 0);
  const currentPrice = parseFloat(document.getElementById('rf-price')?.value || 0);

  document.querySelector('#sp-heatmap thead').innerHTML =
    `<tr><th>Vol \\ Price</th>${priceSteps.map(p => `<th>${p>0?'+':''}${p.toFixed(1)}%</th>`).join('')}</tr>`;

  let html = '';
  volSteps.forEach(v => {
    html += `<tr><td style="font-weight:bold; text-align:left">${v>0?'+':''}${v}%</td>`;
    priceSteps.forEach(p => {
      const computedEb = baseEb * (1 + (v/100)*cmRate) * (1 + (p/100)*0.95);
      const isCurrent = Math.abs(v - currentVol) < 3 && Math.abs(p - currentPrice) < 1.5;
      
      let bg = 'rgba(255,255,255,0.02)';
      if (computedEb > baseEb + 3.0) bg = 'rgba(16,185,129,0.22)';
      else if (computedEb > baseEb) bg = 'rgba(16,185,129,0.10)';
      else if (computedEb < baseEb - 3.0) bg = 'rgba(239,68,68,0.22)';
      else if (computedEb < baseEb) bg = 'rgba(239,68,68,0.10)';

      html += `<td class="heatmap-cell ${isCurrent?'active-cell':''}" style="background:${bg};">${computedEb.toFixed(1)}M</td>`;
    });
    html += '</tr>';
  });

  document.querySelector('#sp-heatmap tbody').innerHTML = html;

  makeChart('sp-covenant', {
    type: 'line',
    data: {
      labels: ['Q1 25','Q2 25','Q3 25','Q4 25'],
      datasets: [
        {label:'Base Plan', data:[1.83, 1.90, 2.05, 1.95], borderColor:cActual, tension:0.3},
        {label:'Stress Case', data:[1.83, 2.25, 2.68, 2.92], borderColor:cUnfav, tension:0.3},
        {label:'Bank Covenant Ceiling', data:[3.0, 3.0, 3.0, 3.0], borderColor:cUnfav, borderDash:[4,4]}
      ]
    }
  });

  document.getElementById('sp-scenario-cards').innerHTML = [
    { name:'Bear Case', color:'#EF5350', rev:510, ebitda:86.7, margin:17.0, ni:42.0, drivers:'Volume -12%, Price -3%, Opex inflation +4%' },
    { name:'Base Case', color: getCActual(), rev:610, ebitda:126.4, margin:20.7, ni:67.2, drivers:'Budget plan. No change.' },
    { name:'Bull Case', color:'#66BB6A', rev:695, ebitda:152.9, margin:22.0, ni:82.5, drivers:'Volume +8%, Price +4%, Cost efficiency -3%' }
  ].map(s => `
    <div class="kpi-card" style="border-color:${s.color}30; border-top: 2px solid ${s.color}">
      <div class="kpi-label" style="color:${s.color}">${s.name}</div>
      <div style="font-size:11px; color:var(--text-muted); margin-bottom:8px">${s.drivers}</div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; font-size:12px">
        <div><div class="kpi-label">Revenue</div><div style="font-weight:600">${fmtM(s.rev)}</div></div>
        <div><div class="kpi-label">EBITDA</div><div style="font-weight:600">${fmtM(s.ebitda)}</div></div>
        <div><div class="kpi-label">Margin</div><div style="font-weight:600">${s.margin}%</div></div>
        <div><div class="kpi-label">Net Income</div><div style="font-weight:600">${fmtM(s.ni)}</div></div>
      </div>
    </div>
  `).join('');
}

// 18. Alerts (Triage Scoring 1-10)
function triageScore(alert) {
  let score = 0;
  if (alert.severity === 'HIGH') score += 5;
  if (alert.severity === 'MEDIUM') score += 2;
  if (alert.title.toLowerCase().includes('revenue') || alert.title.toLowerCase().includes('ebitda')) score += 3;
  if (alert.status === 'Open') score += 2;
  return Math.min(score, 10);
}

function renderAlerts() {
  const alerts = [...window.NEXOVA_DATA.alerts];
  alerts.sort((a, b) => triageScore(b) - triageScore(a));

  document.getElementById('alerts-container').innerHTML = alerts.map(a => {
    const score = triageScore(a);
    return `
      <div class="alert-card">
        <div class="alert-header">
          <div style="display:flex; align-items:center;">
            <div class="severity-badge severity-${a.severity}">${a.severity}</div>
            <span class="priority-badge">Priority: ${score}/10</span>
          </div>
          <select class="alert-status-select" onchange="updateAlertStatus(${a.id}, this.value)">
            <option ${a.status==='Open'?'selected':''}>Open</option>
            <option ${a.status==='In Review'?'selected':''}>In Review</option>
            <option ${a.status==='Resolved'?'selected':''}>Resolved</option>
          </select>
        </div>
        <div class="alert-title">${a.title}</div>
        <div class="alert-what"><strong>Impact:</strong> ${a.what}</div>
        <div class="alert-why"><strong>Root Cause:</strong> ${a.why}</div>
        <div class="alert-action"><strong>Action:</strong> ${a.action}</div>
      </div>
    `;
  }).join('');
}

function updateAlertStatus(id, newStatus) {
  const al = window.NEXOVA_DATA.alerts.find(a => a.id === id);
  if (al) {
    al.status = newStatus;
    showToast(`Alert status updated to ${newStatus}`);
    renderAlerts();
  }
}

// 19. Accruals Register
function renderAccrualsRegister() {
  const filterCat = document.getElementById('accruals-filter-cat')?.value || 'All';
  const filterEnt = document.getElementById('accruals-filter-ent')?.value || 'All';
  const data = window.NEXOVA_DATA.accruals;

  const totalLiability = data.reduce((acc, x) => acc + (x.amount * 3), 0);
  const pendingCount = data.filter(x => x.mar === 'Pending').length;
  const reviewCount = data.filter(x => x.mar === 'Review').length;

  document.getElementById('accruals-kpi-container').innerHTML = `
    <div class="kpi-card">
      <div class="kpi-label">Total Accruals Liability (Q1 YTD)</div>
      <div class="kpi-value">${fmtM(totalLiability, 2)}</div>
      <div class="kpi-sub">${data.length} active accrual lines</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label"># Pending This Month</div>
      <div class="kpi-value" style="color:var(--color-watch)">${pendingCount}</div>
      <div class="kpi-sub">Requires confirmation before D+7</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label"># Under Review</div>
      <div class="kpi-value" style="color:var(--color-unfav)">${reviewCount}</div>
      <div class="kpi-sub">Estimation basis to be revalidated</div>
    </div>
  `;

  const categories = ['Personnel', 'Premises', 'Commercial', 'Operations', 'Finance', 'Provisions'];
  let html = '';

  const renderStatus = (st) => {
    if (st === 'Posted') return '<span class="status-badge posted">✓ Posted</span>';
    if (st === 'Pending') return '<span class="status-badge pending">● Pending</span>';
    if (st === 'Review') return '<span class="status-badge review">⚠ Review</span>';
    if (st === 'Not Required') return '<span class="status-badge notreq">Not Required</span>';
    if (st === 'Reversed') return '<span class="status-badge reversed">Reversed</span>';
    return st;
  };

  categories.forEach(cat => {
    if (filterCat !== 'All' && filterCat !== cat) return;
    const catRows = data.filter(r => r.cat === cat && (filterEnt === 'All' || r.entity === filterEnt));
    if (catRows.length === 0) return;

    html += `<tr class="category-header"><td colspan="11">${cat}</td></tr>`;
    catRows.forEach(row => {
      html += `
        <tr>
          <td style="font-family:monospace; font-weight:600">${row.id}</td>
          <td style="font-weight:500">${row.desc}</td>
          <td>${row.cat}</td>
          <td>${row.entity}</td>
          <td>${fmtM(row.amount, 2)}</td>
          <td>${row.basis}</td>
          <td>${row.owner}</td>
          <td style="text-align:center">${renderStatus(row.jan)}</td>
          <td style="text-align:center">${renderStatus(row.feb)}</td>
          <td style="text-align:center">${renderStatus(row.mar)}</td>
          <td style="color:var(--text-secondary)">${row.notes}</td>
        </tr>
      `;
    });
  });

  document.querySelector('#accruals-table tbody').innerHTML = html || '<tr><td colspan="11" style="text-align:center; padding:20px;">No accruals found matching filter criteria.</td></tr>';
}

function openNewAccrualModal() {
  document.getElementById('modal-new-accrual').classList.remove('hidden');
}
function closeNewAccrualModal() {
  document.getElementById('modal-new-accrual').classList.add('hidden');
}

function submitNewAccrual() {
  const desc = document.getElementById('na-desc').value.trim();
  const cat = document.getElementById('na-cat').value;
  const entity = document.getElementById('na-entity').value;
  const amount = parseFloat(document.getElementById('na-amount').value);
  const owner = document.getElementById('na-owner').value.trim() || 'Controller';
  const basis = document.getElementById('na-basis').value.trim() || 'Manual entry';

  if (!desc || isNaN(amount)) {
    alert("Please enter a description and valid amount.");
    return;
  }

  const prefixMap = { 'Personnel':'PC', 'Premises':'PR', 'Commercial':'CM', 'Operations':'OP', 'Finance':'FN', 'Provisions':'PV' };
  const newId = (prefixMap[cat] || 'AC') + '-' + String(Math.floor(100 + Math.random() * 900));

  window.NEXOVA_DATA.accruals.push({
    id: newId, desc, cat, entity, amount, basis, owner,
    jan: "Posted", feb: "Posted", mar: "Pending", notes: "Newly created entry"
  });

  closeNewAccrualModal();
  renderAccrualsRegister();
  showToast(`Accrual ${newId} recorded`);
}

// 20. Debt Tracker (Upgraded with Interest Cost & Maturity Alert Cards)
function renderDebtTracker() {
  const d = window.NEXOVA_DATA.debt;
  document.getElementById('debt-covenants').innerHTML = d.covenants.map(c => `
    <div class="covenant-card">
      <div class="covenant-light ${c.status}"></div>
      <div>
        <div class="kpi-label">${c.name}</div>
        <div style="font-size:16px; font-weight:600">${c.actual}</div>
        <div class="check-meta">Limit: ${c.threshold} | Headroom: ${c.headroom}</div>
      </div>
    </div>
  `).join('');

  document.querySelector('#debt-table tbody').innerHTML = d.facilities.map(f => `
    <tr><td>${f.name}</td><td>${f.lender}</td><td>${fmtM(f.limit)}</td><td>${fmtM(f.drawn)}</td><td>${f.rate}</td><td>${f.maturity}</td></tr>
  `).join('');

  makeChart('debt-maturity', {
    type:'bar',
    data:{ labels:['2025','2026','2027','2028','2029'], datasets:[{label:'Facility Maturity (€M)', data:[0, 65, 95, 28, 0], backgroundColor:cActual}]}
  });

  // Interest cost tracker card
  document.getElementById('debt-interest-card').innerHTML = `
    <p><strong>Annual Interest Burden:</strong> Projected at <strong>€7.2M</strong> (blended all-in rate: <strong>4.8%</strong>). Structure is <strong>72% floating</strong> (Term Loan A + RCF, EURIBOR-linked) and <strong>28% fixed</strong> (Schuldschein).</p>
    <p style="margin-top:6px;"><strong>Rate Sensitivity:</strong> Each <strong>50bps ECB rate increase</strong> adds <strong>€0.77M</strong> to annual financing cash flow.</p>
  `;

  // Refinancing Watch card
  document.getElementById('debt-urgency-card').innerHTML = `
    <p style="color:var(--color-watch);"><strong>⚠ Refinancing Alert — RCF Facility:</strong> The Syndicate RCF (€100M limit, €53M drawn) matures in <strong>June 2026 (14 months)</strong>.</p>
    <p style="margin-top:6px;">Management recommends initiating syndicate bank negotiations in <strong>Q3 2025</strong> to lock in favorable margins and preserve liquidity buffer.</p>
  `;
}

// 21. Month-End Close Checklist (Upgraded Enterprise Close Management Workspace)
function isTaskBlocked(task) {
  if (!task.blockedBy || task.blockedBy.length === 0) return { blocked: false };
  const allTasks = window.NEXOVA_DATA.closeChecklist.flatMap(g => g.items);
  for (const bId of task.blockedBy) {
    const isDone = localStorage.getItem('checklist_' + bId) === 'true';
    if (!isDone) {
      const parentTask = allTasks.find(t => t.id === bId);
      return { blocked: true, blockerName: parentTask ? parentTask.task : bId, blockerId: bId };
    }
  }
  return { blocked: false };
}

function isOverdueTask(task) {
  if (task.status === 'Complete') return false;
  const isDone = localStorage.getItem('checklist_' + task.id) === 'true';
  if (isDone) return false;
  
  const dueMap = {
    'Apr 1': new Date('2025-04-01'), 'Apr 2': new Date('2025-04-02'), 
    'Apr 3': new Date('2025-04-03'), 'Apr 4': new Date('2025-04-04'),
    'Apr 5': new Date('2025-04-05'), 'Apr 7': new Date('2025-04-07'),
    'Apr 8': new Date('2025-04-08'), 'Apr 9': new Date('2025-04-09'),
    'Apr 10': new Date('2025-04-10'), 'Apr 11': new Date('2025-04-11'),
    'Apr 14': new Date('2025-04-14')
  };
  const dueDate = dueMap[task.due];
  if (!dueDate) return false;
  const demoToday = new Date('2025-04-08'); // Current close day (D+7)
  return demoToday > dueDate;
}

function sendTaskReminder(id, owner, taskName, due) {
  localStorage.setItem('reminder_' + id, Date.now());
  showToast(`Reminder sent to ${owner}: "${taskName}" is due ${due}`);
  renderCloseChecklist();
}

function renderCloseChecklist() {
  const chk = window.NEXOVA_DATA.closeChecklist;
  const allTasks = chk.flatMap(g => g.items);
  let total = allTasks.length, done = 0, blockedCount = 0, overdueCount = 0;

  allTasks.forEach(t => {
    const isDone = localStorage.getItem('checklist_' + t.id) === 'true' || t.status === 'Complete';
    if (isDone) done++;
    else {
      if (isTaskBlocked(t).blocked) blockedCount++;
      if (isOverdueTask(t)) overdueCount++;
    }
  });

  // Close Health Dashboard KPIs
  const pct = Math.round((done/total)*100);
  document.getElementById('close-health-kpis').innerHTML = `
    <div class="kpi-card">
      <div class="kpi-label">Tasks Complete</div>
      <div class="kpi-value" style="color:${pct>=80?'var(--color-fav)':pct>=60?'var(--color-watch)':'var(--color-unfav)'}">${done} / ${total}</div>
      <div class="kpi-sub">${pct}% closed | ${total-done} remaining</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">Blocking Issues</div>
      <div class="kpi-value" style="color:${blockedCount>0?'var(--color-watch)':'var(--color-fav)'}">${blockedCount}</div>
      <div class="kpi-sub">Tasks awaiting upstream dependency</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">Overdue Tasks</div>
      <div class="kpi-value" style="color:${overdueCount>0?'var(--color-unfav)':'var(--color-fav)'}">${overdueCount}</div>
      <div class="kpi-sub">Past target deadline</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">Estimated Close Finalization</div>
      <div class="kpi-value" style="color:var(--accent)">D+10</div>
      <div class="kpi-sub">Pace: ~0.5 days per phase</div>
    </div>
  `;

  // Upgraded Critical Path Flow
  const pathSteps = [
    { name: "AP/AR Cutoff", taskIds: ["pc1", "pc2"] },
    { name: "Accruals Posted", taskIds: ["pc4"] },
    { name: "Interco Cleared", taskIds: ["cl2"] },
    { name: "Journals Reviewed", taskIds: ["cl1", "cl3", "cl4"] },
    { name: "Management Pack", taskIds: ["rp1", "rp2", "rp5", "rp6", "rp3", "rp4"] },
    { name: "CFO Sign-Off", taskIds: ["so1", "so2", "so3", "so4", "so5"] }
  ];

  let pathHtml = '';
  pathSteps.forEach((step, idx) => {
    let stepDone = 0;
    step.taskIds.forEach(id => {
      if (localStorage.getItem('checklist_' + id) === 'true' || allTasks.find(t=>t.id===id)?.status === 'Complete') {
        stepDone++;
      }
    });

    const isComplete = stepDone === step.taskIds.length;
    const isInProgress = stepDone > 0 && !isComplete;
    const isOverdue = !isComplete && step.taskIds.some(id => isOverdueTask(allTasks.find(t=>t.id===id) || {}));

    const statusClass = isComplete ? 'complete' : isOverdue ? 'overdue' : isInProgress ? 'in-progress' : 'not-started';
    const statusIcon = isComplete ? '✓' : isInProgress ? '●' : '○';

    pathHtml += `
      <div class="path-step ${statusClass}">
        <div class="path-step-title">${statusIcon} ${step.name}</div>
        <div class="path-step-sub">${stepDone}/${step.taskIds.length} tasks done</div>
      </div>
    `;
    if (idx < pathSteps.length - 1) {
      pathHtml += `<div class="path-arrow">——▶</div>`;
    }
  });
  document.getElementById('critical-path-container').innerHTML = pathHtml;

  // Close Issues Action Panel
  const openIssues = allTasks.filter(t => {
    const isDone = localStorage.getItem('checklist_' + t.id) === 'true' || t.status === 'Complete';
    return !isDone && (isOverdueTask(t) || t.status === 'In Progress' || isTaskBlocked(t).blocked);
  });

  if (openIssues.length > 0) {
    document.getElementById('close-issues-panel').innerHTML = `
      <div class="chart-card" style="min-height:auto; border-left: 4px solid var(--color-watch);">
        <div class="chart-title" style="color:var(--color-watch);">Open Issues Requiring Action (${openIssues.length})</div>
        <div class="table-wrap">
          <table class="data-table">
            <thead><tr><th>Task</th><th>Owner</th><th>Due</th><th>Issue Flag</th><th>Action</th></tr></thead>
            <tbody>
              ${openIssues.map(i => {
                const isOver = isOverdueTask(i);
                const blockInfo = isTaskBlocked(i);
                return `
                  <tr>
                    <td style="font-weight:500">${i.task}</td>
                    <td>${i.owner}</td>
                    <td>${i.due}</td>
                    <td>${isOver ? '<span class="overdue-tag">OVERDUE</span>' : ''} ${blockInfo.blocked ? `<span class="blocked-tag">Blocked by ${blockInfo.blockerName}</span>` : '<span class="status-badge pending">In Progress</span>'}</td>
                    <td><button class="header-btn" style="font-size:10px; padding:2px 6px;" onclick="sendTaskReminder('${i.id}', '${i.owner}', '${i.task.replace(/'/g,"")}', '${i.due}')">↗ Remind Owner</button></td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  } else {
    document.getElementById('close-issues-panel').innerHTML = '';
  }

  // Days to Close Live Counter
  const closeDate = new Date('2025-04-01');
  const demoToday = new Date('2025-04-08');
  const daysSinceClose = Math.floor((demoToday - closeDate) / (1000 * 60 * 60 * 24));
  const dBadge = document.getElementById('close-d-badge');
  if (dBadge) {
    dBadge.innerText = `D+${daysSinceClose}`;
    dBadge.style.background = daysSinceClose <= 5 ? 'var(--color-fav)' : daysSinceClose <= 8 ? 'var(--color-watch)' : 'var(--color-unfav)';
    dBadge.style.color = '#fff';
  }

  // Task checklist groups
  let html = chk.map(g => {
    let gHtml = `<div class="check-group"><div class="check-group-title">${g.group}</div>`;
    gHtml += g.items.map(i => {
      const isDone = localStorage.getItem('checklist_' + i.id) === 'true' || i.status === 'Complete';
      const blockInfo = isTaskBlocked(i);
      const isOver = isOverdueTask(i);
      const reminderTime = localStorage.getItem('reminder_' + i.id);
      const hasNote = i.notes && i.notes.trim().length > 0;

      let reminderBtn = `<button class="header-btn" style="font-size:10px; padding:2px 6px;" onclick="sendTaskReminder('${i.id}', '${i.owner}', '${i.task.replace(/'/g,"")}', '${i.due}')">↗ Remind</button>`;
      if (reminderTime) {
        reminderBtn = `<span style="font-size:10px; color:var(--accent);">✓ Reminded</span>`;
      }

      return `
        <div class="check-item ${isDone?'done':''} ${blockInfo.blocked?'blocked':''}">
          <input type="checkbox" ${isDone?'checked':''} ${blockInfo.blocked?'disabled':''} onchange="localStorage.setItem('checklist_${i.id}', this.checked); renderCloseChecklist()">
          <div class="check-label">
            ${blockInfo.blocked ? '🔒 ' : ''}${i.task}
            ${blockInfo.blocked ? `<span class="blocked-tag">Blocked by: ${blockInfo.blockerName}</span>` : ''}
            ${isOver ? `<span class="overdue-tag">OVERDUE</span>` : ''}
            <div class="check-meta">
              <span>Owner: ${i.owner}</span>
              <span>Due: ${i.due}</span>
              ${reminderBtn}
            </div>
          </div>
          <select class="check-status" onchange="updateTaskStatus('${i.id}', this.value)">
            <option ${i.status==='Not Started'?'selected':''}>Not Started</option>
            <option ${i.status==='In Progress'?'selected':''}>In Progress</option>
            <option ${i.status==='Complete'?'selected':''}>Complete</option>
          </select>
          <div style="position:relative; flex:3; display:flex; align-items:center;">
            <input type="text" class="check-notes" style="width:100%;" value="${i.notes}" placeholder="Notes..." onchange="updateTaskNotes('${i.id}', this.value)">
            ${hasNote ? '<span style="position:absolute; right:6px; width:5px; height:5px; border-radius:50%; background:var(--accent);" title="Has notes"></span>' : ''}
          </div>
        </div>
      `;
    }).join('');
    return gHtml + '</div>';
  }).join('');

  document.getElementById('checklist-container').innerHTML = html;
  document.getElementById('chk-progress-pct').innerText = `${pct}% (${done}/${total} tasks)`;
  document.getElementById('chk-progress-bar').style.width = `${pct}%`;
}

function updateTaskStatus(id, st) {
  const allTasks = window.NEXOVA_DATA.closeChecklist.flatMap(g => g.items);
  const t = allTasks.find(x => x.id === id);
  if (t) {
    t.status = st;
    if (st === 'Complete') localStorage.setItem('checklist_' + id, 'true');
    else localStorage.setItem('checklist_' + id, 'false');
    renderCloseChecklist();
  }
}

function updateTaskNotes(id, note) {
  const allTasks = window.NEXOVA_DATA.closeChecklist.flatMap(g => g.items);
  const t = allTasks.find(x => x.id === id);
  if (t) {
    t.notes = note;
    renderCloseChecklist();
  }
}

function openBlockersModal() {
  const allTasks = window.NEXOVA_DATA.closeChecklist.flatMap(g => g.items);
  const blockedTasks = allTasks.filter(t => isTaskBlocked(t).blocked);

  let html = '';
  if (blockedTasks.length === 0) {
    html = '<div style="padding:20px; text-align:center; color:var(--color-fav)">✓ No active task blockers detected. All dependency paths are clear!</div>';
  } else {
    html = `
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>Blocked Task</th><th>Upstream Blocker Task</th><th>Blocker Owner</th><th>Blocker Status</th><th>Action</th></tr></thead>
          <tbody>
            ${blockedTasks.map(t => {
              const bInfo = isTaskBlocked(t);
              const blocker = allTasks.find(x => x.id === bInfo.blockerId);
              return `
                <tr>
                  <td style="font-weight:600; color:var(--color-watch);">🔒 ${t.task}</td>
                  <td>${bInfo.blockerName}</td>
                  <td>${blocker ? blocker.owner : '—'}</td>
                  <td><span class="status-badge ${blocker?.status==='In Progress'?'pending':'notreq'}">${blocker?.status || 'Open'}</span></td>
                  <td><button class="header-btn primary" style="font-size:10px; padding:2px 8px;" onclick="sendTaskReminder('${blocker?.id}', '${blocker?.owner}', '${blocker?.task.replace(/'/g,"")}', '${blocker?.due}')">Chase Owner</button></td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  }
  document.getElementById('blockers-report-content').innerHTML = html;
  document.getElementById('modal-blockers-report').classList.remove('hidden');
}

function closeBlockersModal() {
  document.getElementById('modal-blockers-report').classList.add('hidden');
}

function exportChecklistToExcel() {
  const wb = XLSX.utils.book_new();
  const rows = [['Phase', 'Task ID', 'Task Description', 'Owner', 'Due Date', 'Status', 'Blocked By', 'Notes']];
  
  window.NEXOVA_DATA.closeChecklist.forEach(g => {
    g.items.forEach(i => {
      const isDone = localStorage.getItem('checklist_' + i.id) === 'true' || i.status === 'Complete';
      rows.push([
        g.group,
        i.id,
        i.task,
        i.owner,
        i.due,
        isDone ? 'Complete' : i.status,
        (i.blockedBy || []).join(', '),
        i.notes || ''
      ]);
    });
  });

  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = [{wch:15},{wch:10},{wch:45},{wch:15},{wch:12},{wch:15},{wch:15},{wch:30}];
  XLSX.utils.book_append_sheet(wb, ws, 'Close Checklist');
  XLSX.writeFile(wb, 'Nexova-Close-Checklist-March2025.xlsx');
  showToast("Checklist exported to Excel");
}

// ==========================================
// 5. DATA IMPORT ENGINE
// ==========================================
let _uploadedRows = [];
let _uploadedCols = [];
let _uploadedFileName = '';

function handleFileUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  _uploadedFileName = file.name;
  const ext = file.name.split('.').pop().toLowerCase();

  if (ext === 'csv') {
    const reader = new FileReader();
    reader.onload = (e) => {
      parseCSVData(e.target.result);
    };
    reader.readAsText(file);
  } else if (ext === 'xlsx' || ext === 'xls') {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, {type: 'array'});
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(firstSheet, {defval: ''});
      processImportedTable(json);
    };
    reader.readAsArrayBuffer(file);
  } else {
    showToast("Format not supported. Please upload a CSV or Excel file.", "error");
  }
}

function parseCSVData(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  if (lines.length < 2) {
    showToast("Not enough data rows — minimum 2 months required", "error");
    return;
  }
  const headers = lines[0].split(',').map(h => h.replace(/^["']|["']$/g, '').trim());
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.replace(/^["']|["']$/g, '').trim());
    const row = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx] || '';
    });
    rows.push(row);
  }
  processImportedTable(rows);
}

function processImportedTable(rows) {
  if (!rows || rows.length < 2) {
    showToast("Not enough data rows — minimum 2 months required", "error");
    return;
  }
  _uploadedRows = rows;
  _uploadedCols = Object.keys(rows[0]);

  const modal = document.getElementById('modal-data-import');
  modal.classList.remove('hidden');

  const thead = `<tr>${_uploadedCols.map(c => `<th>${c}</th>`).join('')}</tr>`;
  const tbody = rows.slice(0, 5).map(r => `<tr>${_uploadedCols.map(c => `<td>${r[c]}</td>`).join('')}</tr>`).join('');
  document.querySelector('#import-preview-table thead').innerHTML = thead;
  document.querySelector('#import-preview-table tbody').innerHTML = tbody;

  const fields = ['period', 'revenue', 'cogs', 'ebitda', 'netincome', 'headcount'];
  fields.forEach(f => {
    const sel = document.getElementById('map-col-' + f);
    if (!sel) return;
    sel.innerHTML = `<option value="">None / Skip</option>` + _uploadedCols.map(c => `<option value="${c}">${c}</option>`).join('');

    const match = _uploadedCols.find(c => {
      const cl = c.toLowerCase();
      if (f === 'period' && (cl.includes('month') || cl.includes('period') || cl === 'm')) return true;
      if (f === 'revenue' && (cl.includes('rev') || cl.includes('sales') || cl.includes('turnover'))) return true;
      if (f === 'cogs' && (cl.includes('cogs') || cl.includes('cost of') || cl.includes('direct cost'))) return true;
      if (f === 'ebitda' && cl.includes('ebitda')) return true;
      if (f === 'netincome' && (cl.includes('net') || cl.includes('profit') || cl.includes('ni'))) return true;
      if (f === 'headcount' && (cl.includes('fte') || cl.includes('headcount') || cl.includes('hc'))) return true;
      return false;
    });
    if (match) sel.value = match;
  });
}

function closeImportModal() {
  document.getElementById('modal-data-import').classList.add('hidden');
}

function confirmDataMapping() {
  const colPeriod = document.getElementById('map-col-period').value;
  const colRev = document.getElementById('map-col-revenue').value;
  const colCogs = document.getElementById('map-col-cogs').value;
  const colEbitda = document.getElementById('map-col-ebitda').value;
  const colNi = document.getElementById('map-col-netincome').value;
  const colHc = document.getElementById('map-col-headcount').value;

  if (!colPeriod || !colRev || !colEbitda) {
    alert("Please map at least Period, Revenue, and EBITDA columns.");
    return;
  }

  const cleanNum = (v) => {
    if (typeof v === 'number') return v;
    if (!v) return 0;
    const clean = String(v).replace(/[^0-9.-]/g, '');
    return parseFloat(clean) || 0;
  };

  const newMonthly = _uploadedRows.map(r => {
    const rev = cleanNum(r[colRev]);
    const cogs = colCogs ? cleanNum(r[colCogs]) : rev * 0.62;
    const ebitda = cleanNum(r[colEbitda]);
    const netIncome = colNi ? cleanNum(r[colNi]) : ebitda * 0.35;
    const headcount = colHc ? parseInt(cleanNum(r[colHc])) : 2847;

    return {
      m: String(r[colPeriod]).substring(0, 3),
      revenue: rev,
      cogs: cogs,
      grossProfit: rev - cogs,
      sgna: (rev - cogs - ebitda) * 0.7,
      rnd: (rev - cogs - ebitda) * 0.15,
      gna: (rev - cogs - ebitda) * 0.15,
      da: ebitda * 0.38,
      ebit: ebitda * 0.62,
      interest: 0.6,
      tax: 0.7,
      netIncome: netIncome,
      ebitda: ebitda,
      fcf: ebitda * 0.3,
      headcount: headcount
    };
  });

  window.NEXOVA_DATA.actuals.monthly = newMonthly;
  
  const sum = (arr, key) => arr.reduce((acc, x) => acc + (x[key] || 0), 0);
  const nMonths = newMonthly.length;
  const ytdRev = sum(newMonthly, 'revenue');
  const ytdCogs = sum(newMonthly, 'cogs');
  const ytdGp = sum(newMonthly, 'grossProfit');
  const ytdEb = sum(newMonthly, 'ebitda');
  const ytdNi = sum(newMonthly, 'netIncome');

  window.NEXOVA_DATA.actuals.ytd = {
    revenue: ytdRev, cogs: ytdCogs, grossProfit: ytdGp, sgna: sum(newMonthly, 'sgna'),
    rnd: sum(newMonthly, 'rnd'), gna: sum(newMonthly, 'gna'), da: sum(newMonthly, 'da'),
    ebit: sum(newMonthly, 'ebit'), interest: 0.6 * nMonths, tax: 0.7 * nMonths,
    netIncome: ytdNi, ebitda: ytdEb, fcf: sum(newMonthly, 'fcf'),
    grossMargin: (ytdGp/ytdRev)*100, ebitdaMargin: (ytdEb/ytdRev)*100,
    ebitMargin: (sum(newMonthly, 'ebit')/ytdRev)*100, netMargin: (ytdNi/ytdRev)*100
  };

  recomputeDerived();

  const badge = document.getElementById('monthEndBadge');
  badge.className = 'status-dot live';
  badge.innerText = `LIVE DATA — ${_uploadedFileName} — ${nMonths} mo`;
  badge.style.color = 'var(--color-fav)';

  closeImportModal();
  renderCurrentSection();
  showToast(`✓ Data loaded — ${nMonths} months imported from ${_uploadedFileName}`, 'success');
}

// ==========================================
// 6. EXPORT FUNCTIONS
// ==========================================
function exportPDF() {
  window.print();
}
window.exportPDF = exportPDF;

function exportExcel() {
  const wb = XLSX.utils.book_new();
  const d = window.NEXOVA_DATA;
  
  const plRows = [
    ['Line Item','Actual YTD','Budget YTD','Variance €','Variance %'],
    ['Revenue', d.actuals.ytd.revenue, d.budget.ytd.revenue, d.derived.revenueVsBudgetAbs, d.derived.revenueVsBudgetPct],
    ['COGS', d.actuals.ytd.cogs, d.budget.ytd.cogs, d.actuals.ytd.cogs - d.budget.ytd.cogs, 0],
    ['Gross Profit', d.actuals.ytd.grossProfit, d.budget.ytd.grossProfit, d.actuals.ytd.grossProfit - d.budget.ytd.grossProfit, 0],
    ['EBITDA', d.actuals.ytd.ebitda, d.budget.ytd.ebitda, d.derived.ebitdaVsBudgetAbs, 0],
    ['Net Income', d.actuals.ytd.netIncome, d.budget.ytd.netIncome, d.actuals.ytd.netIncome - d.budget.ytd.netIncome, 0]
  ];
  const ws1 = XLSX.utils.aoa_to_sheet(plRows);
  ws1['!cols'] = [{wch:28},{wch:12},{wch:12},{wch:12},{wch:10}];
  XLSX.utils.book_append_sheet(wb, ws1, 'P&L YTD');

  const wc = d.workingCapital.current;
  const wcRows = [
    ['Metric','Actual','Budget','Variance','Status'],
    ['DSO (days)', wc.dso, d.workingCapital.budget.dso, wc.dso - d.workingCapital.budget.dso, wc.dso > d.workingCapital.budget.dso ? 'Unfavorable' : 'Favorable'],
    ['DPO (days)', wc.dpo, d.workingCapital.budget.dpo, wc.dpo - d.workingCapital.budget.dpo, wc.dpo < d.workingCapital.budget.dpo ? 'Unfavorable' : 'Favorable'],
    ['DIO (days)', wc.dio, d.workingCapital.budget.dio, wc.dio - d.workingCapital.budget.dio, wc.dio > d.workingCapital.budget.dio ? 'Unfavorable' : 'Favorable'],
    ['CCC (days)', wc.ccc, d.workingCapital.budget.ccc, wc.ccc - d.workingCapital.budget.ccc, wc.ccc > d.workingCapital.budget.ccc ? 'Unfavorable' : 'Favorable']
  ];
  const ws2 = XLSX.utils.aoa_to_sheet(wcRows);
  XLSX.utils.book_append_sheet(wb, ws2, 'Working Capital');

  const accRows = [['ID', 'Description', 'Category', 'Entity', 'Monthly €M', 'Basis', 'Owner', 'Jan', 'Feb', 'Mar', 'Notes']];
  d.accruals.forEach(a => {
    accRows.push([a.id, a.desc, a.cat, a.entity, a.amount, a.basis, a.owner, a.jan, a.feb, a.mar, a.notes]);
  });
  const ws3 = XLSX.utils.aoa_to_sheet(accRows);
  XLSX.utils.book_append_sheet(wb, ws3, 'Accruals Register');

  XLSX.writeFile(wb, 'Nexova-Management-Report-March2025.xlsx');
  showToast("Excel Exported successfully");
}
window.exportExcel = exportExcel;

async function exportPPT() {
  const pptx = new PptxGenJS();
  pptx.defineLayout({ name:'WS', width:13.33, height:7.5 });
  const NAV = '0A0E1A', WHITE = 'F9FAFB', BLUE = '3B82F6', GREY = '9CA3AF', RED = 'EF4444', AMBER = 'F59E0B';
  const d = window.NEXOVA_DATA;

  function addSlide(title) {
    const s = pptx.addSlide();
    s.background = { color: NAV };
    s.addText(title, { x:0.4, y:0.2, w:12, h:0.5, fontSize:16, color:WHITE, bold:true });
    s.addText(`${d.company.name} | ${d.company.period} | CONFIDENTIAL`, { x:0.4, y:7.1, w:12, h:0.3, fontSize:9, color:GREY });
    return s;
  }

  const s1 = pptx.addSlide(); s1.background = { color: NAV };
  s1.addText('FinController Pro', { x:1, y:1.5, w:11, h:1, fontSize:40, color:WHITE, bold:true, align:'center' });
  s1.addText('Management Controller Board Report', { x:1, y:2.8, w:11, h:0.5, fontSize:20, color:BLUE, align:'center' });
  s1.addText(`${d.company.name} | ${d.company.period} | CONFIDENTIAL`, { x:1, y:3.5, w:11, h:0.4, fontSize:14, color:GREY, align:'center' });

  const s2 = addSlide(`Executive Summary — ${d.company.period}`);
  s2.addTable([
    [{text:'Metric',options:{bold:true,color:GREY}},{text:'Actual',options:{bold:true,color:GREY}},{text:'Budget',options:{bold:true,color:GREY}},{text:'Variance',options:{bold:true,color:GREY}}],
    ['Revenue',fmtM(d.actuals.ytd.revenue),fmtM(d.budget.ytd.revenue),fmtM(d.derived.revenueVsBudgetAbs)],
    ['EBITDA',fmtM(d.actuals.ytd.ebitda),fmtM(d.budget.ytd.ebitda),fmtM(d.derived.ebitdaVsBudgetAbs)],
    ['EBITDA Margin',fmtPctAbs(d.actuals.ytd.ebitdaMargin),fmtPctAbs(d.budget.ytd.ebitdaMargin),fmtPct(d.actuals.ytd.ebitdaMargin - d.budget.ytd.ebitdaMargin)],
    ['Net Income',fmtM(d.actuals.ytd.netIncome),fmtM(d.budget.ytd.netIncome),fmtM(d.actuals.ytd.netIncome - d.budget.ytd.netIncome)],
    ['Headcount',d.headcount.actual,d.headcount.budget,d.headcountVsBudget],
    ['DSO',fmtDays(d.workingCapital.current.dso),fmtDays(d.workingCapital.budget.dso),fmtDays(d.workingCapital.current.dso - d.workingCapital.budget.dso)],
    ['Net Debt / EBITDA',d.debt.netDebtEbitda+'x','3.0x max','Within covenant']
  ], { x:0.4, y:1.0, w:12.5, h:5.5, fontSize:11, color:WHITE, border:{color:'1C2333',pt:1}, fill:{color:'111827'}, align:'left' });

  const s3 = addSlide('Variance Alerts — Active Issues');
  d.alerts.filter(a=>a.severity==='HIGH'||a.severity==='MEDIUM').forEach((a,i) => {
    s3.addText(`[${a.severity}] ${a.title}`, { x:0.4, y:0.9+i*2.2, w:12, h:0.4, fontSize:13, color:a.severity==='HIGH'?RED:AMBER, bold:true });
    s3.addText(a.what, { x:0.4, y:1.35+i*2.2, w:12, h:0.4, fontSize:11, color:WHITE });
    s3.addText('Action: '+a.action, { x:0.4, y:1.75+i*2.2, w:12, h:0.4, fontSize:10, color:GREY });
  });

  await pptx.writeFile({ fileName: `Nexova-Board-Report-${d.company.period.replace(' ','')}.pptx` });
  showToast("PPT Presentation exported successfully");
}
window.exportPPT = exportPPT;

// ==========================================
// 7. FINANCIAL ANALYST INTELLIGENCE ENGINE
// ==========================================
function getAIConfig() {
  return {
    key: localStorage.getItem('fc_ai_key'),
    orKey: localStorage.getItem('fc_ai_or_key'),
    provider: localStorage.getItem('fc_ai_provider')
  };
}

function saveAIKey() {
  const provider = document.getElementById('ai-provider-select').value;
  let key = document.getElementById('ai-key-input').value.trim();
  const orKeyInput = document.getElementById('ai-or-key-input');
  let orKey = orKeyInput ? orKeyInput.value.trim() : '';

  if (key.includes('=')) key = key.split('=').pop().replace(/['"]/g, '').trim();
  if (orKey.includes('=')) orKey = orKey.split('=').pop().replace(/['"]/g, '').trim();

  if (!key) {
    alert("Please enter a valid API key.");
    return;
  }
  if (provider === 'voice' && !orKey) {
    alert("Please enter a valid OpenRouter API key for TTS.");
    return;
  }

  localStorage.setItem('fc_ai_provider', provider);
  localStorage.setItem('fc_ai_key', key);
  if (provider === 'voice') localStorage.setItem('fc_ai_or_key', orKey);

  closeAIModal();
  updateAIStatus();
  showToast(`Successfully connected to ${getProviderName(provider)}`);
  updateAIContext();
}

function removeAIKey() {
  if (confirm("Are you sure you want to remove your API key from this browser?")) {
    localStorage.removeItem('fc_ai_key');
    localStorage.removeItem('fc_ai_provider');
    localStorage.removeItem('fc_ai_or_key');
    updateAIStatus();
    buildWelcomeHTML();
    showToast("API key removed successfully");
  }
}

function getProviderName(val) {
  const map = {
    'openrouter_glm5': 'GLM 5.2 (OpenRouter)',
    'nvidia_nemotron': 'NVIDIA Nemotron',
    'voice': 'Voice AI',
    'zai5': 'GLM-5.2',
    'zai': 'z.ai',
    'glm': 'GLM-4-Flash',
    'claude': 'Claude Sonnet',
    'openai': 'GPT-4o-mini'
  };
  return map[val] || 'Analyst';
}

function updateAIStatus() {
  const btn = document.getElementById('ai-header-status');
  const title = document.getElementById('ai-panel-title');
  const removeBtn = document.getElementById('ai-remove-btn');
  const connectBtn = document.getElementById('ai-connect-btn');
  const conf = getAIConfig();
  
  if (conf.key && conf.provider) {
    if (btn) { btn.className = 'connected'; btn.innerHTML = `⬡ Analyst ●`; }
    if (title) { title.className = 'ai-title'; title.innerText = 'Financial Analyst'; }
    if (removeBtn) removeBtn.style.display = 'inline-block';
    if (connectBtn) connectBtn.style.display = 'none';
  } else {
    if (btn) { btn.className = ''; btn.innerHTML = '⬡ Analyst'; }
    if (title) { title.className = 'ai-title disconnected'; title.innerText = 'Financial Analyst'; }
    if (removeBtn) removeBtn.style.display = 'none';
    if (connectBtn) connectBtn.style.display = 'inline-block';
  }
}

function openAIModal() {
  const overlay = document.getElementById('ai-modal-overlay');
  if (overlay) overlay.classList.remove('hidden');
  const conf = getAIConfig();
  if (conf.provider) document.getElementById('ai-provider-select').value = conf.provider;
  document.getElementById('ai-key-input').value = '';
  const orKeyInput = document.getElementById('ai-or-key-input');
  if (orKeyInput) orKeyInput.value = '';
  updateProviderHint();
}

function closeAIModal() {
  const overlay = document.getElementById('ai-modal-overlay');
  if (overlay) overlay.classList.add('hidden');
}

function updateProviderHint() {
  const provider = document.getElementById('ai-provider-select').value;
  const hint = document.getElementById('ai-key-hint');
  const orContainer = document.getElementById('ai-or-key-container');
  if (orContainer) orContainer.style.display = provider === 'voice' ? 'block' : 'none';
  
  if (provider === 'openrouter_glm5') {
    hint.innerHTML = 'OpenRouter API key starts with <code>sk-or-v1-</code>. Connects to <code>z-ai/glm-5.2:free</code> (Direct connection with <code>max_tokens: 2048</code> to prevent credit reservation errors).';
  } else if (provider === 'nvidia_nemotron') {
    hint.innerHTML = 'NVIDIA API key starts with <code>nvapi-</code>. Connects to <code>nvidia/nemotron-3-ultra-550b-a55b</code> with thinking enabled. <strong>Works via cloud proxy — no local setup needed.</strong>';
  } else if (provider === 'voice') {
    hint.innerHTML = 'Voice AI uses GLM-5.2 (NVIDIA) and TTS (OpenRouter). <strong>Works via cloud proxy — no local setup needed.</strong> Paste NVIDIA NIM key above, OpenRouter key below.';
  } else if (provider === 'zai' || provider === 'zai5') {
    hint.innerHTML = 'Connects to GLM models. <strong>Works via cloud proxy — no local setup needed.</strong>';
  } else if (provider === 'glm') {
    hint.innerHTML = 'Zhipu API keys look like: <code>abc...xyz.123...456</code>. Direct browser request.';
  } else if (provider === 'claude') {
    hint.innerHTML = 'Anthropic Claude API key starts with <code>sk-ant-</code>. <strong>Works via cloud proxy — no local setup needed.</strong>';
  } else if (provider === 'openai') {
    hint.innerHTML = 'OpenAI API keys start with <code>sk-</code>.';
  }
}

function toggleAIPanel() {
  const panel = document.getElementById('ai-panel');
  const toggle = document.getElementById('ai-toggle');
  if (panel.classList.contains('hidden')) {
    panel.classList.remove('hidden');
    toggle.classList.add('active');
    updateAIContext();
    const input = document.getElementById('ai-input');
    if (input) input.focus();
  } else {
    panel.classList.add('hidden');
    toggle.classList.remove('active');
  }
}

function updateAIContext() {
  const bar = document.getElementById('ai-context-bar');
  if (!bar) return;
  let sec = STATE.section || 'Dashboard';
  sec = sec.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const company = window.NEXOVA_DATA.company.name;
  const period = window.NEXOVA_DATA.company.period;
  bar.innerText = `Context: ${sec} | ${company} | ${period} (${STATE.period.toUpperCase()})`;
}

function buildSystemPrompt() {
  const ctx = {
    companyContext: window.NEXOVA_DATA.company,
    currentSection: STATE.section,
    periodSlice: getDataSlice(STATE.period),
    fullData: window.NEXOVA_DATA
  };
  return `You are a Senior Financial Analyst and Management Controller embedded inside FinController Pro for Nexova Group S.A.
You are assisting the executive leadership team by analyzing financial performance.

CRITICAL RULES:
1. Be precise, data-driven, concise, and action-oriented.
2. Flag risks proactively.
3. Use exact figures from the supplied context ONLY.
4. NEVER invent financial figures or causes not in the data.
5. Distinguish clearly between facts, analysis, and recommendations.

FINANCIAL CONTEXT:
${JSON.stringify(ctx, null, 2)}`;
}

async function callAI(userMessage, systemPrompt, onChunk, expectJSON = false, abortSignal = null) {
  const conf = getAIConfig();
  if (!conf.key || !conf.provider) {
    openAIModal();
    throw new Error("No AI connected.");
  }

  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userMessage }
  ];

  let targetUrl = '';
  let url = '';
  let headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${conf.key}`
  };
  let body = {};

  if (conf.provider === 'openrouter_glm5') {
    url = 'https://openrouter.ai/api/v1/chat/completions';
    headers['HTTP-Referer'] = window.location.href;
    headers['X-Title'] = 'FinController Pro';
    body = {
      model: 'z-ai/glm-5.2:free',
      messages: messages,
      max_tokens: 2048,
      stream: !expectJSON
    };
    if (expectJSON) body.response_format = { type: "json_object" };
  } else if (conf.provider === 'nvidia_nemotron') {
    targetUrl = 'https://integrate.api.nvidia.com/v1/chat/completions';
    body = {
      model: 'nvidia/nemotron-3-ultra-550b-a55b',
      messages: messages,
      temperature: 0.7,
      top_p: 0.95,
      max_tokens: 2048,
      chat_template_kwargs: { enable_thinking: true },
      stream: !expectJSON
    };
    if (expectJSON) body.response_format = { type: "json_object" };
  } else if (conf.provider === 'zai' || conf.provider === 'zai5' || conf.provider === 'glm' || conf.provider === 'voice') {
    if (conf.provider === 'zai') targetUrl = 'https://api.z.ai/api/paas/v4/chat/completions';
    else if (conf.provider === 'zai5' || conf.provider === 'voice') targetUrl = 'https://integrate.api.nvidia.com/v1/chat/completions';
    else url = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';

    let modelName = 'glm-4-flash';
    if (conf.provider === 'zai') modelName = 'glm-4.7-flash';
    if (conf.provider === 'zai5' || conf.provider === 'voice') modelName = 'z-ai/glm-5.2';

    body = { model: modelName, messages: messages, stream: !expectJSON };
    if (expectJSON) body.response_format = { type: "json_object" };
  } else if (conf.provider === 'openai') {
    url = 'https://api.openai.com/v1/chat/completions';
    body = { model: 'gpt-4o-mini', messages: messages, stream: !expectJSON };
    if (expectJSON) body.response_format = { type: "json_object" };
  } else if (conf.provider === 'claude') {
    targetUrl = 'https://api.anthropic.com/v1/messages';
    headers = { 'Content-Type': 'application/json', 'x-api-key': conf.key, 'anthropic-version': '2023-06-01' };
    body = { model: 'claude-3-5-sonnet-20240620', system: systemPrompt, max_tokens: 1024, messages: [ { role: "user", content: userMessage } ], stream: !expectJSON };
  }

  if (targetUrl) {
    url = '/api/proxy';
    headers['X-Target-Url'] = targetUrl;
  }

  let response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(body),
      signal: abortSignal
    });
  } catch (fetchErr) {
    if (targetUrl && (fetchErr.name === 'TypeError' || String(fetchErr).includes('Failed to fetch') || String(fetchErr).includes('NetworkError'))) {
      throw new Error("Could not reach the AI cloud proxy (/api/proxy). Please verify your network connection or deployment, then try again.");
    }
    throw fetchErr;
  }

  if (!response.ok) {
    let errText = await response.text().catch(()=>'');
    let errDetail = errText;
    try {
      const j = JSON.parse(errText);
      if (j.error && j.error.message) errDetail = j.error.message;
    } catch(e){}
    if (response.status === 401) throw new Error("API Key Error (401): Please check your API key.");
    if (response.status === 402) throw new Error("Token Limit (402): Token limit reached. Capped to 2048 tokens.");
    if (response.status === 429) throw new Error("Rate limit (429): Endpoint is busy. Please wait a few seconds and try again.");
    throw new Error(`AI request failed (${response.status}): ${errDetail || response.statusText}`);
  }

  if (expectJSON) {
    const jsonResponse = await response.json();
    let content = jsonResponse.choices[0].message.content;
    content = content.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    return JSON.parse(content);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let fullText = "";
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    let boundary = buffer.indexOf('\n');
    while (boundary !== -1) {
      const line = buffer.slice(0, boundary).trim();
      buffer = buffer.slice(boundary + 1);

      if (line.startsWith('data: ')) {
        const dataStr = line.slice(6);
        if (dataStr === '[DONE]') break;
        try {
          const data = JSON.parse(dataStr);
          if (data.choices && data.choices[0].delta) {
            const delta = data.choices[0].delta;
            const chunk = delta.content || '';
            const reasoning = delta.reasoning_content || '';
            
            if (reasoning) {
              fullText += reasoning;
              if (onChunk) onChunk(reasoning, fullText);
            } else if (chunk) {
              fullText += chunk;
              if (onChunk) onChunk(chunk, fullText);
            }
          }
        } catch (e) {}
      }
      boundary = buffer.indexOf('\n');
    }
  }
  return fullText;
}

function buildWelcomeHTML() {
  const msgs = document.getElementById('ai-messages');
  if (!msgs) return;
  msgs.innerHTML = `
    <div class="ai-welcome">
      <div style="font-size:11px; font-weight:700; letter-spacing:0.12em; text-transform:uppercase; color:var(--accent); margin-bottom:12px;">NEXOVA · FINANCIAL ANALYST</div>
      <p style="font-size:12px; color:var(--text-secondary); line-height:1.6;">Ask me about variance drivers, draft management commentary, interpret KPIs, or explain any number in this report.</p>
      <div class="ai-quick-prompts">
        <button class="ai-quick-btn" onclick="sendQuickPrompt('Why did revenue miss budget?')">Why did revenue miss budget?</button>
        <button class="ai-quick-btn" onclick="sendQuickPrompt('Draft EBITDA commentary for CFO')">Draft EBITDA commentary for CFO</button>
        <button class="ai-quick-btn" onclick="sendQuickPrompt('What is driving the DSO increase?')">What is driving the DSO increase?</button>
        <button class="ai-quick-btn" onclick="sendQuickPrompt('Summarise the close checklist status')">Summarise the close checklist status</button>
        <button class="ai-quick-btn" onclick="sendQuickPrompt('Which alerts need immediate action?')">Which alerts need immediate action?</button>
      </div>
    </div>
  `;
}

function sendQuickPrompt(text) {
  const input = document.getElementById('ai-input');
  if (input) {
    input.value = text;
    sendAIMessage();
  }
}

function escapeHTML(str) {
  const div = document.createElement('div');
  div.innerText = str;
  return div.innerHTML;
}

let aiAbortController = null;

async function sendAIMessage() {
  const sendBtn = document.getElementById('ai-send-btn');
  if (aiAbortController) {
    aiAbortController.abort();
    aiAbortController = null;
    sendBtn.innerText = 'Send';
    sendBtn.style.background = 'var(--accent)';
    return;
  }

  const input = document.getElementById('ai-input');
  const msgs = document.getElementById('ai-messages');
  const text = input.value.trim();
  if (!text) return;

  if (!getAIConfig().key) {
    openAIModal();
    return;
  }

  const welcome = msgs.querySelector('.ai-welcome');
  if (welcome) welcome.remove();

  const userDiv = document.createElement('div');
  userDiv.className = 'ai-msg user';
  userDiv.innerHTML = `<div class="ai-msg-bubble">${escapeHTML(text)}</div><div class="ai-msg-time">Just now</div>`;
  msgs.appendChild(userDiv);

  input.value = '';
  input.style.height = 'auto';

  sendBtn.innerText = 'Stop';
  sendBtn.style.background = 'var(--color-unfav)';
  msgs.scrollTop = msgs.scrollHeight;

  const astDiv = document.createElement('div');
  astDiv.className = 'ai-msg assistant';
  const astBubble = document.createElement('div');
  astBubble.className = 'ai-msg-bubble streaming';
  astDiv.appendChild(astBubble);
  msgs.appendChild(astDiv);
  msgs.scrollTop = msgs.scrollHeight;

  aiAbortController = new AbortController();

  try {
    const sysPrompt = buildSystemPrompt();
    await callAI(text, sysPrompt, (chunk, full) => {
      let formatted = escapeHTML(full)
        .replace(/\n/g, '<br>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      astBubble.innerHTML = formatted;
      msgs.scrollTop = msgs.scrollHeight;
    }, false, aiAbortController.signal);

    astBubble.classList.remove('streaming');
    const timeDiv = document.createElement('div');
    timeDiv.className = 'ai-msg-time';
    timeDiv.innerText = 'Just now';
    astDiv.appendChild(timeDiv);
  } catch (err) {
    astBubble.classList.remove('streaming');
    if (err.name === 'AbortError') {
      astBubble.innerHTML += '<br><br><em style="color:var(--color-watch)">[Request cancelled]</em>';
    } else {
      astBubble.innerHTML = `<span style="color:var(--color-unfav)">${escapeHTML(err.message)}</span>`;
    }
  } finally {
    aiAbortController = null;
    sendBtn.innerText = 'Send';
    sendBtn.style.background = 'var(--accent)';
    msgs.scrollTop = msgs.scrollHeight;
  }
}

// ==========================================
// 8. INITIAL ROUTER & EVENT LISTENERS
// ==========================================
function renderCurrentSection() {
  const map = {
    'executive-summary': renderExecutiveSummary,
    'kpi-scorecard': renderKPIScorecard,
    'mgmt-dashboard': renderMgmtDashboard,
    'pnl-statement': renderPnL,
    'balance-sheet': renderBalanceSheet,
    'interco-recon': renderIntercoRecon,
    'cash-flow': renderCashFlow,
    'budget-actuals': renderBudgetActuals,
    'variance-analysis': renderVarianceAnalysis,
    'margin-analysis': renderMarginAnalysis,
    'cost-centers': renderCostCenters,
    'commentary-workshop': () => { renderCommentaryHistory(); },
    'wc-dashboard': renderWCDashboard,
    'aging-detail': renderAgingDetail,
    'rolling-forecast': renderRollingForecast,
    'forecast-accuracy': renderForecastAccuracy,
    'scenario-planning': renderScenarioPlanning,
    'alerts': renderAlerts,
    'accruals-register': renderAccrualsRegister,
    'debt-tracker': renderDebtTracker,
    'close-checklist': renderCloseChecklist
  };
  if (map[STATE.section]) map[STATE.section]();
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.nav-item').forEach(el => {
    el.addEventListener('click', () => navigateTo(el.dataset.section));
  });

  document.querySelectorAll('[data-period]').forEach(el => {
    el.addEventListener('click', () => {
      document.querySelectorAll('[data-period]').forEach(e=>e.classList.remove('active'));
      el.classList.add('active');
      STATE.period = el.dataset.period;
      renderCurrentSection();
      updateAIContext();
    });
  });

  document.getElementById('bva-filter')?.addEventListener('input', (e) => {
    document.getElementById('bva-filter-val').innerText = `${e.target.value}%`;
    renderBudgetActuals();
  });

  document.getElementById('bva-sort-btn')?.addEventListener('click', () => {
    window._bvaSortMagnitude = !window._bvaSortMagnitude;
    document.getElementById('bva-sort-btn').textContent =
      window._bvaSortMagnitude ? 'Sort: Default' : 'Sort by Magnitude';
    renderBudgetActuals();
  });

  // Initialize theme on load
  document.documentElement.setAttribute('data-theme', STATE.theme);
  const themeBtn = document.getElementById('themeToggle');
  if (themeBtn) themeBtn.textContent = STATE.theme === 'dark' ? '○ Light' : '● Dark';
  themeBtn?.addEventListener('click', toggleTheme);
  document.getElementById('sidebarToggle')?.addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('collapsed');
  });

  updateAIStatus();
  updateAIContext();
  navigateTo('executive-summary');

  // Diagnostic: show chart status
  setTimeout(() => {
    console.log('[FC] Chart log:', _chartLog);
    const ok = _chartLog.filter(l => l.startsWith('OK')).length;
    const fail = _chartLog.filter(l => l.startsWith('FAIL')).length;
    console.log('[FC] OK:', ok, 'FAIL:', fail, 'ApexCharts:', typeof ApexCharts !== 'undefined' ? (ApexCharts.version||'loaded') : 'MISSING');
  }, 2000);
});
