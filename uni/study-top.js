(() => {
  'use strict';
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'arcana-top';
  button.hidden = true;
  button.setAttribute('aria-label', '페이지 맨 위로 이동');
  button.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 12 6-6 6 6M12 6v14"/></svg>';
  document.body.append(button);
  const update = () => { button.hidden = window.scrollY < 400; };
  window.addEventListener('scroll', update, { passive: true });
  update();
  button.addEventListener('click', () => {
    // Move keyboard focus to the top navigation before hiding this button.
    const destination = document.querySelector('.arcana-nav a');
    if (destination) destination.focus({ preventScroll: true });
    window.scrollTo({
      top: 0,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'
    });
  });
})();
