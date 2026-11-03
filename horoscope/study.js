(() => {
  const search = document.getElementById('search');
  if (!search) return;
  const cards = [...document.querySelectorAll('.entry')];
  const filters = [...document.querySelectorAll('[data-pol][aria-pressed]')];
  const count = document.getElementById('result-count');
  const empty = document.getElementById('empty');
  let polarity = 'all';
  function apply() {
    const terms = search.value.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
    let visible = 0;
    cards.forEach(card => {
      const text = card.dataset.search.toLocaleLowerCase();
      card.hidden = !((polarity === 'all' || card.dataset.pol === polarity) && terms.every(term => text.includes(term)));
      if (!card.hidden) visible++;
    });
    count.textContent = `${visible}장의 카드${visible === cards.length ? '' : ` / 전체 ${cards.length}장`}`;
    empty.hidden = visible > 0;
  }
  search.addEventListener('input', apply);
  filters.forEach(button => button.addEventListener('click', () => {
    polarity = button.dataset.pol;
    filters.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    apply();
  }));
  document.getElementById('clear-search').addEventListener('click', () => {
    search.value = '';
    filters[0].click();
    search.focus();
  });
  apply();
})();
