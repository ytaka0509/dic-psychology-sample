(function () {
  'use strict';

  const ALL = [
    ...COGNITION_DATA.map(r => Object.assign({}, r, { genre: '認知' })),
    ...EMOTION_DATA.map(r => Object.assign({}, r, { genre: '感情' })),
    ...BEHAVIOR_DATA.map(r => Object.assign({}, r, { genre: '行動' })),
  ];

  let currentGenre    = null;
  let currentCategory = null;
  let currentSearch   = '';

  const input        = document.getElementById('index-search');
  const countEl      = document.getElementById('index-result-count');
  const gridEl       = document.getElementById('index-result-grid');
  const hintEl       = document.getElementById('search-hint');
  const genreCards   = document.querySelectorAll('.genre-card[data-genre]');
  const catContainer = document.getElementById('index-category-buttons');

  // ── カテゴリボタン生成 ─────────────────────────────────────────
  function buildCategoryButtons() {
    catContainer.innerHTML = '';

    const source = currentGenre ? ALL.filter(r => r.genre === currentGenre) : ALL;
    const categories = [...new Set(source.map(r => r.category))];

    if (categories.length <= 1) return;

    const makeBtn = (label, cat) => {
      const btn = document.createElement('button');
      btn.className = 'filter-btn' + (cat === null ? ' active' : '');
      btn.textContent = label;
      btn.addEventListener('click', () => {
        currentCategory = cat;
        catContainer.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        render();
      });
      return btn;
    };

    catContainer.appendChild(makeBtn('すべて', null));
    categories.forEach(cat => catContainer.appendChild(makeBtn(cat, cat)));
  }

  // ── カード描画 ────────────────────────────────────────────────
  function render() {
    let filtered = ALL;

    if (currentGenre)    filtered = filtered.filter(r => r.genre === currentGenre);
    if (currentCategory) filtered = filtered.filter(r => r.category === currentCategory);
    if (currentSearch) {
      const q = currentSearch.toLowerCase();
      filtered = filtered.filter(r =>
        r.term.toLowerCase().includes(q) || r.desc.toLowerCase().includes(q)
      );
    }

    countEl.textContent = filtered.length + ' 件';

    if (currentSearch) {
      hintEl.textContent = '"' + currentSearch + '" の検索結果';
    } else if (currentCategory) {
      hintEl.textContent = currentCategory + ' の用語一覧';
    } else if (currentGenre) {
      hintEl.textContent = currentGenre + ' の用語一覧';
    } else {
      hintEl.textContent = 'カテゴリカードをクリックして絞り込めます';
    }

    gridEl.innerHTML = '';

    if (filtered.length === 0) {
      const empty = document.createElement('div');
      empty.className   = 'empty-state';
      empty.textContent = '該当する用語が見つかりませんでした。';
      gridEl.appendChild(empty);
      return;
    }

    const frag = document.createDocumentFragment();
    filtered.forEach(r => frag.appendChild(createCard(r)));
    gridEl.appendChild(frag);
  }

  function createCard(r) {
    const card = document.createElement('article');
    card.className = 'card';

    const genre = document.createElement('span');
    genre.className   = 'card__genre';
    genre.textContent = r.genre;

    const badge = document.createElement('span');
    badge.className   = 'card__badge';
    badge.textContent = r.category;

    const term = document.createElement('h2');
    term.className   = 'card__term';
    term.textContent = r.term;

    const desc = document.createElement('p');
    desc.className   = 'card__desc';
    desc.textContent = r.desc;

    card.appendChild(genre);
    card.appendChild(badge);
    card.appendChild(term);
    card.appendChild(desc);

    if (r.detail) {
      card.classList.add('has-detail');
      card.addEventListener('click', () => openModal(r));
    }

    return card;
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

  // ── イベント ──────────────────────────────────────────────────
  genreCards.forEach(card => {
    card.addEventListener('click', function (e) {
      e.preventDefault();
      const genre = card.dataset.genre;
      if (currentGenre === genre) {
        currentGenre = null;
        card.classList.remove('active');
      } else {
        currentGenre = genre;
        genreCards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');
      }
      currentCategory = null;
      buildCategoryButtons();
      render();
    });
  });

  input.addEventListener('input', function (e) {
    currentSearch = e.target.value.trim();
    render();
  });

  // 初期表示：全件表示（認知→感情→行動の順）
  buildCategoryButtons();
  render();
})();
