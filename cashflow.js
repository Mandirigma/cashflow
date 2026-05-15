// ─── CashFlow PWA — Data Layer ───────────────────────────────────────────────
const GAS_URL = 'https://script.google.com/macros/s/AKfycbwzin3Y6hvI0ZoXRQR63nRRzu-KmY-TdvixemyelfzASQ9DRTZT5H57_jWkAUE_ujvG/exec';

// ─── Category → group + colour mapping ───────────────────────────────────────
const CAT_MAP = {
  // Housing
  'Rent':               { group: 'Housing',          color: '#378ADD', bgColor: '#E6F1FB', textColor: '#0C447C' },
  'Electricity & Gas':  { group: 'Housing',          color: '#378ADD', bgColor: '#E6F1FB', textColor: '#0C447C' },
  'Water':              { group: 'Housing',          color: '#378ADD', bgColor: '#E6F1FB', textColor: '#0C447C' },
  'Internet':           { group: 'Housing',          color: '#378ADD', bgColor: '#E6F1FB', textColor: '#0C447C' },
  // Phones
  'Nathan Phone':       { group: 'Phones',           color: '#7F77DD', bgColor: '#EEEDFE', textColor: '#3C3489' },
  'Martina Phone':      { group: 'Phones',           color: '#7F77DD', bgColor: '#EEEDFE', textColor: '#3C3489' },
  'Tantan Phone':       { group: 'Phones',           color: '#7F77DD', bgColor: '#EEEDFE', textColor: '#3C3489' },
  // Insurance
  'Car Insurance':      { group: 'Insurance & rego', color: '#85B7EB', bgColor: '#E6F1FB', textColor: '#185FA5' },
  'Car Rego':           { group: 'Insurance & rego', color: '#85B7EB', bgColor: '#E6F1FB', textColor: '#185FA5' },
  'Health Insurance':   { group: 'Insurance & rego', color: '#85B7EB', bgColor: '#E6F1FB', textColor: '#185FA5' },
  // Subscriptions
  'iCloud 2TB':         { group: 'Subscriptions',    color: '#888780', bgColor: '#F1EFE8', textColor: '#444441' },
  'Google One 2TB':     { group: 'Subscriptions',    color: '#888780', bgColor: '#F1EFE8', textColor: '#444441' },
  'Huloga AU':          { group: 'Subscriptions',    color: '#888780', bgColor: '#F1EFE8', textColor: '#444441' },
  'Huloga PH':          { group: 'Subscriptions',    color: '#888780', bgColor: '#F1EFE8', textColor: '#444441' },
  // Family
  'Mommy':              { group: 'Family support',   color: '#D4537E', bgColor: '#FBEAF0', textColor: '#72243E' },
  'Mommy Phone':        { group: 'Family support',   color: '#D4537E', bgColor: '#FBEAF0', textColor: '#72243E' },
  'Bestie Phone':       { group: 'Family support',   color: '#D4537E', bgColor: '#FBEAF0', textColor: '#72243E' },
  // Daily living
  'Groceries':          { group: 'Daily living',     color: '#639922', bgColor: '#EAF3DE', textColor: '#27500A' },
  'Petrol':             { group: 'Daily living',     color: '#639922', bgColor: '#EAF3DE', textColor: '#27500A' },
  'Car Maintenance':    { group: 'Daily living',     color: '#639922', bgColor: '#EAF3DE', textColor: '#27500A' },
  'Dining Out':         { group: 'Daily living',     color: '#EF9F27', bgColor: '#FAEEDA', textColor: '#633806' },
  // Pet
  'Skye - Pet Essentials': { group: 'Pet',           color: '#EF9F27', bgColor: '#FAEEDA', textColor: '#633806' },
  // Health
  'Nathan Medication':  { group: 'Health',           color: '#F09595', bgColor: '#FCEBEB', textColor: '#791F1F' },
  'Tantan Medication':  { group: 'Health',           color: '#F09595', bgColor: '#FCEBEB', textColor: '#791F1F' },
  // Debt
  'Car Loan':           { group: 'Debt',             color: '#E24B4A', bgColor: '#FCEBEB', textColor: '#791F1F' },
  // Income
  'Tantan Income':      { group: 'Income',           color: '#1D9E75', bgColor: '#E1F5EE', textColor: '#085041' },
  'Nathan Income':      { group: 'Income',           color: '#1D9E75', bgColor: '#E1F5EE', textColor: '#085041' },
  'Martina Income':     { group: 'Income',           color: '#7F77DD', bgColor: '#EEEDFE', textColor: '#3C3489' },
  'Other Income':       { group: 'Income',           color: '#1D9E75', bgColor: '#E1F5EE', textColor: '#085041' },
};

function getCatMeta(category) {
  if (!category) return { group: 'Other', color: '#888780', bgColor: '#F1EFE8', textColor: '#444441' };
  // Case-insensitive lookup
  const key = Object.keys(CAT_MAP).find(k => k.toLowerCase() === category.toLowerCase());
  return key ? CAT_MAP[key] : { group: 'Other', color: '#888780', bgColor: '#F1EFE8', textColor: '#444441' };
}

// ─── Group display order ───────────────────────────────────────────────────────
const GROUP_ORDER = [
  'Housing', 'Phones', 'Insurance & rego', 'Subscriptions',
  'Family support', 'Daily living', 'Pet', 'Health', 'Debt', 'Other'
];

// ─── App state ────────────────────────────────────────────────────────────────
const State = {
  raw:        null,   // raw GAS response
  period:     { start: null, end: null },
  filters:    { person: 'all', account: 'all', type: 'all', cat: 'all', search: '' },
  loading:    false,
  lastFetch:  null,
  screen:     'overview',
};

// ─── Period helpers ───────────────────────────────────────────────────────────
function currentMonthPeriod() {
  const now   = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end   = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return { start: fmtDate(start), end: fmtDate(end) };
}

function fmtDate(d) {
  return d.toISOString().split('T')[0];
}

function fmtDisplay(isoStr) {
  if (!isoStr) return '';
  const d = new Date(isoStr + 'T00:00:00');
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
}

function fmtDateShort(isoStr) {
  if (!isoStr) return '';
  const d = new Date(isoStr + 'T00:00:00');
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });
}

function fmtCurrency(n) {
  return '$' + Math.abs(n).toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtCurrencyShort(n) {
  const abs = Math.abs(n);
  if (abs >= 1000) return '$' + (abs / 1000).toFixed(1) + 'k';
  return '$' + Math.round(abs);
}

// ─── JSONP fetch ──────────────────────────────────────────────────────────────
function fetchData(start, end) {
  return new Promise((resolve, reject) => {
    const cbName = 'cfCallback_' + Date.now();
    const script = document.createElement('script');
    const timeout = setTimeout(() => {
      delete window[cbName];
      script.remove();
      reject(new Error('Request timed out'));
    }, 15000);

    window[cbName] = (data) => {
      clearTimeout(timeout);
      delete window[cbName];
      script.remove();
      if (data.ok === false) reject(new Error(data.error || 'Unknown error'));
      else resolve(data);
    };

    script.src = `${GAS_URL}?action=pwaDashboard&callback=${cbName}&start=${start}&end=${end}`;
    script.onerror = () => {
      clearTimeout(timeout);
      delete window[cbName];
      reject(new Error('Network error'));
    };
    document.head.appendChild(script);
  });
}

// ─── Derived data helpers ─────────────────────────────────────────────────────
function getTransactions() {
  if (!State.raw) return [];
  return State.raw.transactions || [];
}

function filteredTransactions() {
  const f = State.filters;
  return getTransactions().filter(t => {
    if (f.person  !== 'all' && t.person  !== f.person)  return false;
    if (f.account !== 'all' && t.account !== f.account) return false;
    if (f.type    !== 'all' && t.type    !== f.type)    return false;
    if (f.cat     !== 'all' && getCatMeta(t.category).group !== f.cat) return false;
    if (f.search) {
      const q = f.search.toLowerCase();
      if (!t.name?.toLowerCase().includes(q) && !t.category?.toLowerCase().includes(q)) return false;
    }
    return true;
  });
}

function getBudgetRows() {
  if (!State.raw?.budgets) return [];
  return State.raw.budgets.map(b => {
    const meta  = getCatMeta(b.category);
    const spent = Math.abs(b.spent || 0);
    const budget = b.budget || 0;
    const pct   = budget > 0 ? spent / budget : 0;
    return { ...b, spent, budget, pct, meta,
             over: spent > budget,
             remaining: Math.max(0, budget - spent),
             overspend: Math.max(0, spent - budget) };
  });
}

function getSummary() {
  const txns = filteredTransactions();
  const spent  = txns.filter(t => t.type === 'expense').reduce((s, t) => s + Math.abs(t.amount), 0);
  const income = txns.filter(t => t.type === 'income').reduce((s, t)  => s + Math.abs(t.amount), 0);
  const allTxns = getTransactions();
  const spentNathan  = allTxns.filter(t => t.type === 'expense' && t.person === (State.raw?.meta?.nameA || 'Nathan')).reduce((s,t)=>s+Math.abs(t.amount),0);
  const spentMartina = allTxns.filter(t => t.type === 'expense' && t.person === (State.raw?.meta?.nameB || 'Martina')).reduce((s,t)=>s+Math.abs(t.amount),0);
  const budgets = getBudgetRows();
  const totalBudget = budgets.filter(b => b.meta.group !== 'Income').reduce((s,b)=>s+b.budget,0);
  const period = State.raw?.period || {};
  const start  = new Date((period.start || fmtDate(new Date())) + 'T00:00:00');
  const end    = new Date((period.end   || fmtDate(new Date())) + 'T00:00:00');
  const totalDays   = Math.round((end - start) / 86400000) + 1;
  const elapsedDays = Math.min(totalDays, Math.ceil((new Date() - start) / 86400000));
  return { spent, income, spentNathan, spentMartina, totalBudget, totalDays, elapsedDays };
}

// ─── Group budget rows by group ───────────────────────────────────────────────
function groupedBudgets() {
  const rows  = getBudgetRows().filter(b => b.meta.group !== 'Income');
  const groups = {};
  rows.forEach(b => {
    const g = b.meta.group;
    if (!groups[g]) groups[g] = { name: g, rows: [], totalBudget: 0, totalSpent: 0 };
    groups[g].rows.push(b);
    groups[g].totalBudget += b.budget;
    groups[g].totalSpent  += b.spent;
  });
  return GROUP_ORDER.map(g => groups[g]).filter(Boolean);
}

// ─── Expected income breakdown ────────────────────────────────────────────────
function getIncome() {
  const inc = State.raw?.income || {};
  return {
    nathan:  inc.nathan  || 0,
    martina: inc.martina || 0,
    other:   inc.other   || 0,
    total:   (inc.nathan || 0) + (inc.martina || 0) + (inc.other || 0),
  };
}

navigator.serviceWorker.getRegistrations().then(r => r.forEach(sw => sw.unregister()))
