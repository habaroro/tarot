const categoryToggle = document.querySelector('.category-toggle');
const categoryMenu = document.querySelector('.category-menu');

if (categoryToggle && categoryMenu) {
  function setCategoryMenu(open) {
    categoryToggle.setAttribute('aria-expanded', String(open));
    categoryToggle.setAttribute('aria-label', `카테고리 메뉴 ${open ? '닫기' : '열기'}`);
    categoryMenu.hidden = !open;
  }

  categoryToggle.addEventListener('click', () => {
    setCategoryMenu(categoryMenu.hidden);
  });
  document.addEventListener('click', (event) => {
    if (!event.target.closest('.category-switcher')) setCategoryMenu(false);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !categoryMenu.hidden) {
      setCategoryMenu(false);
      categoryToggle.focus();
    }
  });
  document.addEventListener('focusin', (event) => {
    if (!event.target.closest('.category-switcher')) setCategoryMenu(false);
  });
}
