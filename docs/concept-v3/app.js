(() => {
  'use strict';

  const densityStyles = document.createElement('link');
  densityStyles.rel = 'stylesheet';
  densityStyles.href = './density.css';
  densityStyles.dataset.densityPass = 'v3.1';
  document.head.append(densityStyles);

  const menuButton = document.querySelector('[data-menu-button]');
  const nav = document.querySelector('[data-nav]');
  if (menuButton && nav) {
    menuButton.addEventListener('click', () => {
      const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
      menuButton.setAttribute('aria-expanded', String(!isOpen));
      nav.classList.toggle('is-open', !isOpen);
    });
    nav.addEventListener('click', (event) => {
      if (event.target.closest('a')) {
        menuButton.setAttribute('aria-expanded', 'false');
        nav.classList.remove('is-open');
      }
    });
  }

  document.querySelectorAll('[data-demo-form]').forEach((form) => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const message = form.querySelector('[data-form-message]');
      if (!form.checkValidity()) {
        form.reportValidity();
        if (message) message.textContent = 'Заполните обязательные поля.';
        return;
      }
      if (message) message.textContent = 'Демонстрация успешного состояния: данные не отправлены.';
      form.reset();
    });
  });
})();
