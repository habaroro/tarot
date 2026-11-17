(() => {
  'use strict';
  const search = document.getElementById('summary-search');
  const filters = [...document.querySelectorAll('[data-group]')];
  const groups = [...document.querySelectorAll('.summary-group')];
  const rows = groups.flatMap(group => [...group.querySelectorAll('tbody tr')].map(row => ({
    row, suit: group.dataset.suit, court: row.dataset.court === 'true', text: normalize(row.textContent)
  })));
  let selected = 'all';
  function normalize(value) { return value.toLowerCase().replace(/\s+/g, ' ').trim(); }
  function render() {
    const terms = normalize(search.value).split(' ').filter(Boolean);
    let count = 0;
    rows.forEach(card => {
      card.row.hidden = !terms.every(term => card.text.includes(term)) ||
        (selected !== 'all' && (selected === 'court' ? !card.court : card.suit !== selected));
      if (!card.row.hidden) count++;
    });
    groups.forEach(group => {
      const visible = [...group.querySelectorAll('tbody tr')].filter(row => !row.hidden).length;
      group.hidden = !visible;
      group.querySelector('h2 span').textContent = `${visible}장`;
    });
    document.getElementById('summary-count').textContent = `${count}장의 카드`;
    document.getElementById('summary-empty').hidden = count > 0;
  }
  filters.forEach(button => button.addEventListener('click', () => {
    selected = button.dataset.group;
    filters.forEach(filter => filter.setAttribute('aria-pressed', String(filter === button)));
    render();
  }));
  search.addEventListener('input', render);
  document.getElementById('summary-reset').addEventListener('click', () => {
    search.value = '';
    selected = 'all';
    filters.forEach(filter => filter.setAttribute('aria-pressed', String(filter.dataset.group === 'all')));
    render();
    search.focus();
  });
  render();
})();
