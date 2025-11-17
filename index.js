const SUPABASE_CONFIG = (typeof window !== 'undefined' && window.SUPABASE_CONFIG) || {};
const SUPABASE_URL = SUPABASE_CONFIG.url || 'https://tjpgshemougtrphoomqc.supabase.co';
const SUPABASE_ANON_KEY = SUPABASE_CONFIG.anonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRqcGdzaGVtb3VndHJwaG9vbXFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzNjczODYsImV4cCI6MjA3ODk0MzM4Nn0.94rnU4jBLM-euQUbTzZ36dtVq6LELRhM2njA4JuM-c8';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const searchBtn = document.getElementById('searchBtn');
const nameInput = document.getElementById('name');
const resultsDiv = document.getElementById('results');

function renderResults(items) {
  if (!items || items.length === 0) {
    resultsDiv.innerHTML = '<p class="no-results">No results found.</p>';
    return;
  }

  const ul = document.createElement('ul');
  ul.className = 'results-list';
  items.forEach(item => {
    const li = document.createElement('li');

    const price = (item.price !== null && item.price !== undefined) ? Number(item.price).toFixed(2) : '-';
    const priceWithVat = (item.price_with_vat !== null && item.price_with_vat !== undefined) ? Number(item.price_with_vat).toFixed(2) : '-';
    const priceVatAmount = (item.price_vat_amount !== null && item.price_vat_amount !== undefined) ? Number(item.price_vat_amount).toFixed(2) : '-';
    const storage = (item.storage_gb !== null && item.storage_gb !== undefined) ? `${escapeHtml(String(item.storage_gb))} GB` : '-';
    const ram = (item.ram_gb !== null && item.ram_gb !== undefined) ? `${escapeHtml(String(item.ram_gb))} GB` : '-';
    const variant = item.variant ? ` ${escapeHtml(item.variant)}` : '';
    const title = `${escapeHtml(item.brand || '')} ${escapeHtml(item.model || '')}${variant}`.trim();
    const year = item.release_year ? ` | Year: ${escapeHtml(String(item.release_year))}` : '';
    const stock = (item.in_stock === true) ? 'Yes' : (item.in_stock === false ? 'No' : '-');

    li.innerHTML = `<strong>${title}</strong>` +
      `<div class="meta">ID: ${escapeHtml(item.id ? String(item.id) : '-')}` +
      ` | Price: $${escapeHtml(String(price))}` +
      ` | VAT (15%): $${escapeHtml(String(priceVatAmount))}` +
      ` | Price with VAT: $${escapeHtml(String(priceWithVat))}` +
      `${year}` +
      ` | Storage: ${storage}` +
      ` | RAM: ${ram}` +
      ` | In stock: ${stock}` +
      `</div>`;
    ul.appendChild(li);
  });

  resultsDiv.innerHTML = '';
  resultsDiv.appendChild(ul);
}

function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

async function searchCellphonesByQuery(query) {
  if (!query) {
    renderResults([]);
    return;
  }

  const like = `%${query}%`;
  const { data, error } = await supabaseClient
    .from('cellphones')
    .select('*')
    .or(`brand.ilike.${like},model.ilike.${like}`)
    .limit(50);

  if (error) {
    console.error('Error searching cellphones:', error);
    resultsDiv.innerHTML = `<p class="error">Search error: ${escapeHtml(error.message || String(error))}</p>`;
    return;
  }

  renderResults(data);
}

searchBtn.addEventListener('click', async () => {
  const query = nameInput.value.trim();
  resultsDiv.innerHTML = '<p class="loading">Searching...</p>';
  await searchCellphonesByQuery(query);
});

nameInput.addEventListener('keydown', async (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    searchBtn.click();
  }
});
