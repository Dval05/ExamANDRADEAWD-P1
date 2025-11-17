

const SUPABASE_CONFIG = (typeof window !== 'undefined' && window.SUPABASE_CONFIG) || {};
const SUPABASE_URL = SUPABASE_CONFIG.url || 'https://tjpgshemougtrphoomqc.supabase.co';
const SUPABASE_ANON_KEY = SUPABASE_CONFIG.anonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRqcGdzaGVtb3VndHJwaG9vbXFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzNjczODYsImV4cCI6MjA3ODk0MzM4Nn0.94rnU4jBLM-euQUbTzZ36dtVq6LELRhM2njA4JuM-c8';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const searchBtn = document.getElementById('searchBtn');
const nameInput = document.getElementById('name');
const resultsDiv = document.getElementById('results');

function renderResults(items) {
  if (!items || items.length === 0) {
    resultsDiv.innerHTML = '<p class="no-results">No se encontraron productos.</p>';
    return;
  }

  const ul = document.createElement('ul');
  ul.className = 'results-list';
  items.forEach(item => {
    const li = document.createElement('li');
  const price = (item.price !== null && item.price !== undefined) ? Number(item.price).toFixed(2) : '-';
  const priceWithVat = (item.price_with_vat !== null && item.price_with_vat !== undefined) ? Number(item.price_with_vat).toFixed(2) : '-';
  const priceVatAmount = (item.price_vat_amount !== null && item.price_vat_amount !== undefined) ? Number(item.price_vat_amount).toFixed(2) : '-';

  li.innerHTML = `<strong>${escapeHtml(item.name || '')}</strong>` +
           `<div class="meta">ID: ${escapeHtml(item.id ? String(item.id) : '-')}` +
           ` | Precio: $${escapeHtml(String(price))}` +
           ` | IVA (0.15): $${escapeHtml(String(priceVatAmount))}` +
           ` | Precio (con IVA 15%): $${escapeHtml(String(priceWithVat))}</div>`;
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

async function searchProductsByName(name) {
  if (!name) {
    renderResults([]);
    return;
  }

  const { data, error } = await supabaseClient
    .from('products')
    .select('*')
    .ilike('name', `%${name}%`)
    .limit(50);

  if (error) {
    console.error('Error buscando productos:', error);
    resultsDiv.innerHTML = `<p class="error">Error al buscar productos: ${escapeHtml(error.message || String(error))}</p>`;
    return;
  }

  renderResults(data);
}

searchBtn.addEventListener('click', async () => {
  const name = nameInput.value.trim();
  resultsDiv.innerHTML = '<p class="loading">Buscando...</p>';
  await searchProductsByName(name);
});

nameInput.addEventListener('keydown', async (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    searchBtn.click();
  }
});
