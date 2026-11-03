const search = document.querySelector('#card-search');
const cards = [...document.querySelectorAll('.entry')];
const filters = [...document.querySelectorAll('[data-filter]')];
let grade = 'all';
function update() {
  const query = search.value.trim().normalize('NFC').toLocaleLowerCase();
  let visible = 0;
  for (const card of cards) {
    card.hidden = !(grade === 'all' || card.dataset.grade === grade) || !card.dataset.search.normalize('NFC').toLocaleLowerCase().includes(query);
    if (!card.hidden) visible++;
  }
  document.querySelector('#result-count').textContent = `${visible} / 64장의 카드`;
  document.querySelector('#empty').hidden = visible !== 0;
}
search.addEventListener('input', update);
for (const button of filters) button.addEventListener('click', () => {
  grade = button.dataset.filter;
  for (const item of filters) item.setAttribute('aria-pressed', String(item === button));
  update();
});
