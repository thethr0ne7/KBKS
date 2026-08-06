(() => {
  'use strict';

  const body = document.body;
  const menuButton = document.querySelector('[data-mf-menu-button]');
  const drawer = document.querySelector('[data-mf-drawer]');
  const backdrop = document.querySelector('[data-mf-backdrop]');
  const stickyCta = document.querySelector('[data-mf-sticky-cta]');
  const hero = document.querySelector('[data-mf-hero]');
  const contact = document.querySelector('#mf-contact');
  const form = document.querySelector('[data-mf-form]');

  const setMenu = (open) => {
    if (!menuButton || !drawer || !backdrop) return;
    menuButton.setAttribute('aria-expanded', String(open));
    drawer.classList.toggle('is-open', open);
    backdrop.classList.toggle('is-open', open);
    drawer.setAttribute('aria-hidden', String(!open));
    body.classList.toggle('mf-menu-open', open);
  };

  menuButton?.addEventListener('click', () => {
    setMenu(menuButton.getAttribute('aria-expanded') !== 'true');
  });

  backdrop?.addEventListener('click', () => setMenu(false));

  drawer?.addEventListener('click', (event) => {
    if (event.target.closest('a')) setMenu(false);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setMenu(false);
  });

  if (stickyCta && hero && contact && 'IntersectionObserver' in window) {
    let heroVisible = true;
    let contactVisible = false;

    const updateSticky = () => {
      stickyCta.classList.toggle('is-hidden', heroVisible || contactVisible);
    };

    new IntersectionObserver(([entry]) => {
      heroVisible = entry.isIntersecting;
      updateSticky();
    }, { threshold: 0.16 }).observe(hero);

    new IntersectionObserver(([entry]) => {
      contactVisible = entry.isIntersecting;
      updateSticky();
    }, { threshold: 0.12 }).observe(contact);
  }

  form?.addEventListener('submit', (event) => {
    event.preventDefault();
    const message = form.querySelector('[data-mf-form-message]');

    if (!form.checkValidity()) {
      form.reportValidity();
      if (message) message.textContent = 'Заполните обязательные поля.';
      return;
    }

    if (message) message.textContent = 'Демонстрация успешного состояния: данные не отправлены.';
    form.reset();
  });
})();
