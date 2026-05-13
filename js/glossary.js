// GLOSSARY_DATA は各ページで data/*-data.js として事前に読み込まれる

(function () {
  'use strict';

  let currentCategory = null;
  let currentSearch = '';

  function filterAndRender(category, search) {
    currentCategory = category;
    currentSearch = search;

    let filtered = GLOSSARY_DATA;
    if (category) filtered = filtered.filter(r => r.category === category);
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(r =>
        r.term.toLowerCase().includes(q) || r.desc.toLowerCase().includes(q)
      );
    }
    buildCards(filtered);
  }

  function buildCards(rows) {
    const grid = document.getElementById('card-grid');
    if (!grid) return;
    grid.innerHTML = '';

    if (rows.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'empty-state';
      empty.textContent = '該当する用語が見つかりませんでした。';
      grid.appendChild(empty);
    } else {
      const fragment = document.createDocumentFragment();
      rows.forEach(row => fragment.appendChild(createCard(row)));
      grid.appendChild(fragment);
    }

    const countEl = document.getElementById('result-count');
    if (countEl) countEl.textContent = rows.length + ' 件';
  }

  function createCard(row) {
    const article = document.createElement('article');
    article.className = 'card';
    article.dataset.category = row.category;

    const badge = document.createElement('span');
    badge.className = 'card__badge';
    badge.textContent = row.category;

    const term = document.createElement('h2');
    term.className = 'card__term';
    term.textContent = row.term;

    const desc = document.createElement('p');
    desc.className = 'card__desc';
    desc.textContent = row.desc;

    article.appendChild(badge);
    article.appendChild(term);
    article.appendChild(desc);

    if (row.detail) {
      article.classList.add('has-detail');
      article.addEventListener('click', () => openModal(row));
    }

    return article;
  }

  // ── モーダル ──────────────────────────────────────────────────
  let modalEl = null;

  function buildModal() {
    const modal = document.createElement('div');
    modal.id = 'term-modal';
    modal.className = 'modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'modal-term');
    modal.innerHTML = `
      <div class="modal__overlay"></div>
      <div class="modal__panel">
        <button class="modal__close" aria-label="閉じる">✕</button>
        <div class="modal__header">
          <span class="modal__badge" id="modal-badge"></span>
          <h2 class="modal__term" id="modal-term"></h2>
        </div>
        <p class="modal__desc" id="modal-desc"></p>
        <p class="modal__detail-label">詳細説明</p>
        <p class="modal__detail" id="modal-detail"></p>
      </div>
    `;
    document.body.appendChild(modal);

    modal.querySelector('.modal__overlay').addEventListener('click', closeModal);
    modal.querySelector('.modal__close').addEventListener('click', closeModal);
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

    modalEl = modal;
  }

  function openModal(row) {
    if (!modalEl) buildModal();
    modalEl.querySelector('#modal-badge').textContent  = row.category;
    modalEl.querySelector('#modal-term').textContent   = row.term;
    modalEl.querySelector('#modal-desc').textContent   = row.desc;
    modalEl.querySelector('#modal-detail').textContent = row.detail || '';
    modalEl.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    if (!modalEl) return;
    modalEl.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  function init() {
    const categories = [...new Set(GLOSSARY_DATA.map(r => r.category))];

    const container = document.getElementById('filter-buttons');
    if (container) {
      const makeBtn = (label, cat) => {
        const btn = document.createElement('button');
        btn.className = 'filter-btn' + (cat === null ? ' active' : '');
        btn.textContent = label;
        btn.dataset.cat = cat ?? '';
        btn.addEventListener('click', () => {
          container.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          filterAndRender(cat, currentSearch);
        });
        return btn;
      };

      container.appendChild(makeBtn('すべて', null));
      categories.forEach(cat => container.appendChild(makeBtn(cat, cat)));
    }

    const searchInput = document.getElementById('search');
    if (searchInput) {
      searchInput.addEventListener('input', e => {
        filterAndRender(currentCategory, e.target.value.trim());
      });
    }

    filterAndRender(null, '');
  }

  document.addEventListener('DOMContentLoaded', init);
})();
