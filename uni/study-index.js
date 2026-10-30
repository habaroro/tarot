(() => {
  'use strict';
  const search = document.getElementById('search');
  let element = 'all';
  const filters = [...document.querySelectorAll('[data-element]')];
  const groups = [...document.querySelectorAll('section.grid')];
  const normalize = text => text.toLowerCase().replace(/\s+/g, ' ').trim();
  const cards = [...document.querySelectorAll('a.entry')].map(link => {
    const image = link.querySelector('img');
    image.loading = 'lazy';
    image.decoding = 'async';
    const suit = ['wand', 'cup', 'sword', 'pent'].find(prefix => link.getAttribute('href').startsWith(prefix + '-')) || 'major';
    const court = /^(wand|cup|sword|pent)-(king|queen|knight|page)-/.test(link.getAttribute('href'));
    return { link, suit, court, text: normalize(link.textContent) };
  });
  function render() {
    const query = normalize(search.value);
    let total = 0;
    cards.forEach(card => {
      card.link.hidden = !card.text.includes(query) || (element !== 'all' && (element === 'court' ? !card.court : card.suit !== element));
      if (!card.link.hidden) total++;
    });
    groups.forEach(grid => {
      const count = [...grid.children].filter(card => !card.hidden).length;
      grid.hidden = !count;
      grid.previousElementSibling.hidden = !count;
      grid.previousElementSibling.querySelector('.sec-count').textContent = `${count}장`;
    });
    document.getElementById('result-count').textContent = `${total}장의 카드`;
    document.getElementById('empty').hidden = total > 0;
  }
  filters.forEach(button => button.addEventListener('click', () => {
    element = button.dataset.element;
    filters.forEach(filter => filter.setAttribute('aria-pressed', String(filter === button)));
    render();
  }));
  search.addEventListener('input', render);
  document.getElementById('clear-search').addEventListener('click', () => {
    search.value = '';
    element = 'all';
    filters.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.element === 'all')));
    render();
    search.focus();
  });
  render();
})();
