(() => {
  const button = document.createElement('button');
  button.className = 'color-top';
  button.type = 'button';
  button.hidden = true;
  button.setAttribute('aria-label', '페이지 맨 위로 이동');
  button.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 12 6-6 6 6M12 6v14"/></svg>';
  document.body.append(button);
  const update = () => {
    button.hidden = window.scrollY < 400 || !!document.querySelector('.viewer.on');
  };
  window.addEventListener('scroll', update, { passive: true });
  const viewer = document.getElementById('viewer');
  if (viewer) new MutationObserver(update).observe(viewer, { attributes: true, attributeFilter: ['class'] });
  button.addEventListener('click', () => {
    const heading = document.querySelector('.cover h1');
    if (heading) {
      heading.setAttribute('tabindex', '-1');
      heading.focus({ preventScroll: true });
    }
    window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  });
  update();
})();
