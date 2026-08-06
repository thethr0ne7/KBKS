(() => {
  'use strict';

  const root = document.querySelector('#kbks-auto-root');
  if (!root) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const header = root.querySelector('[data-header]');
  const menuButton = root.querySelector('[data-menu-button]');
  const navigation = root.querySelector('[data-navigation]');
  const navLinks = [...root.querySelectorAll('.kbks-auto-nav a[href^="#"]')];

  root.querySelectorAll('[data-year]').forEach((item) => {
    item.textContent = String(new Date().getFullYear());
  });

  const updateHeader = () => {
    header?.classList.toggle('is-scrolled', window.scrollY > 16);
  };

  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  if (menuButton && navigation) {
    menuButton.addEventListener('click', () => {
      const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
      menuButton.setAttribute('aria-expanded', String(!isOpen));
      navigation.classList.toggle('is-open', !isOpen);
      menuButton.querySelector('.kbks-auto-visually-hidden').textContent = isOpen ? 'Открыть меню' : 'Закрыть меню';
    });

    navigation.addEventListener('click', (event) => {
      if (!(event.target instanceof HTMLAnchorElement)) return;
      menuButton.setAttribute('aria-expanded', 'false');
      navigation.classList.remove('is-open');
    });

    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape') return;
      menuButton.setAttribute('aria-expanded', 'false');
      navigation.classList.remove('is-open');
      menuButton.focus();
    });
  }

  const observedSections = navLinks
    .map((link) => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  if ('IntersectionObserver' in window && observedSections.length) {
    const sectionObserver = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (!visible) return;
      navLinks.forEach((link) => {
        link.classList.toggle('is-active', link.getAttribute('href') === `#${visible.target.id}`);
      });
    }, {
      rootMargin: '-25% 0px -60% 0px',
      threshold: [0.05, 0.2, 0.45]
    });

    observedSections.forEach((section) => sectionObserver.observe(section));
  }

  const programs = root.querySelector('[data-programs]');
  if (programs) {
    const tabs = [...programs.querySelectorAll('[role="tab"]')];
    const panels = [...programs.querySelectorAll('[role="tabpanel"]')];

    const activateProgram = (tab, focus = false) => {
      const key = tab.dataset.program;

      tabs.forEach((candidate) => {
        const selected = candidate === tab;
        candidate.setAttribute('aria-selected', String(selected));
        candidate.tabIndex = selected ? 0 : -1;
      });

      panels.forEach((panel) => {
        panel.hidden = panel.dataset.programPanel !== key;
      });

      if (focus) tab.focus();
    };

    tabs.forEach((tab, index) => {
      tab.tabIndex = tab.getAttribute('aria-selected') === 'true' ? 0 : -1;
      tab.addEventListener('click', () => activateProgram(tab));
      tab.addEventListener('keydown', (event) => {
        if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();

        let nextIndex = index;
        if (event.key === 'ArrowRight') nextIndex = (index + 1) % tabs.length;
        if (event.key === 'ArrowLeft') nextIndex = (index - 1 + tabs.length) % tabs.length;
        if (event.key === 'Home') nextIndex = 0;
        if (event.key === 'End') nextIndex = tabs.length - 1;
        activateProgram(tabs[nextIndex], true);
      });
    });
  }

  const route = root.querySelector('[data-route-experience]');
  if (route) {
    const steps = [...route.querySelectorAll('[data-route-step]')];
    const progress = route.querySelector('[data-route-progress]');
    const indexOutput = route.querySelector('[data-route-index]');
    const titleOutput = route.querySelector('[data-route-title]');
    const copyOutput = route.querySelector('[data-route-copy]');

    const routeContent = {
      1: {
        title: 'Консультация',
        copy: 'Пользователь сразу видит контактный сценарий, а интерфейс не обещает автоматическое бронирование или CRM-статусы.'
      },
      2: {
        title: 'Уточнение условий',
        copy: 'Срок, стоимость, набор и требования появляются только после подтверждения ответственным сотрудником КБКС.'
      },
      3: {
        title: 'Подготовка документов',
        copy: 'Перечень документов выводится как редактируемый подтверждённый контент, а не переносится из других разделов автоматически.'
      },
      4: {
        title: 'Начало обучения',
        copy: 'Финальный этап описывается в соответствии с утверждённой программой и реальным внутренним порядком автошколы.'
      }
    };

    const setRouteStep = (number) => {
      const numeric = Number(number);
      steps.forEach((step) => {
        const active = Number(step.dataset.routeStep) === numeric;
        step.classList.toggle('is-active', active);
        step.setAttribute('aria-pressed', String(active));
      });

      if (progress) progress.style.height = `${((numeric - 1) / Math.max(steps.length - 1, 1)) * 100}%`;
      if (indexOutput) indexOutput.textContent = `${String(numeric).padStart(2, '0')} / ${String(steps.length).padStart(2, '0')}`;
      if (titleOutput) titleOutput.textContent = routeContent[numeric].title;
      if (copyOutput) copyOutput.textContent = routeContent[numeric].copy;
    };

    steps.forEach((step) => {
      step.addEventListener('click', () => setRouteStep(step.dataset.routeStep));
    });
  }

  root.querySelectorAll('.kbks-auto-faq-list details').forEach((details) => {
    details.addEventListener('toggle', () => {
      if (!details.open) return;
      root.querySelectorAll('.kbks-auto-faq-list details').forEach((other) => {
        if (other !== details) other.open = false;
      });
    });
  });

  const demoForm = root.querySelector('[data-demo-form]');
  if (demoForm) {
    const fields = [...demoForm.querySelectorAll('[data-field]')];
    const consent = demoForm.querySelector('[data-consent]');
    const submitButton = demoForm.querySelector('[data-submit-button]');
    const submitLabel = demoForm.querySelector('[data-submit-label]');
    const message = demoForm.querySelector('[data-form-message]');

    const validateField = (field) => {
      const input = field.querySelector('input, select');
      const isValid = Boolean(input?.value.trim());
      field.classList.toggle('is-error', !isValid);
      input?.setAttribute('aria-invalid', String(!isValid));
      return isValid;
    };

    fields.forEach((field) => {
      const input = field.querySelector('input, select');
      input?.addEventListener('input', () => validateField(field));
      input?.addEventListener('blur', () => validateField(field));
    });

    demoForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const validFields = fields.map(validateField).every(Boolean);
      const validConsent = Boolean(consent?.checked);

      if (!validConsent) {
        message.textContent = 'Подтвердите демонстрационный режим формы.';
        message.style.color = 'var(--auto-error)';
      }

      if (!validFields || !validConsent) return;

      submitButton.disabled = true;
      submitButton.setAttribute('aria-busy', 'true');
      submitLabel.textContent = 'Проверяем состояние…';
      message.textContent = '';

      window.setTimeout(() => {
        submitButton.disabled = false;
        submitButton.removeAttribute('aria-busy');
        submitLabel.textContent = 'Проверить механику';
        message.style.color = 'var(--auto-success)';
        message.textContent = 'Готово: success-состояние работает. Реальная отправка не выполнялась.';
      }, prefersReducedMotion.matches || root.classList.contains('reduce-motion') ? 20 : 750);
    });
  }

  const motionToggle = root.querySelector('[data-motion-toggle]');
  if (motionToggle) {
    const label = motionToggle.querySelector('[data-motion-label]');
    const initialReduce = prefersReducedMotion.matches;
    root.classList.toggle('reduce-motion', initialReduce);
    motionToggle.setAttribute('aria-pressed', String(initialReduce));
    label.textContent = initialReduce ? 'Движение сокращено' : 'Движение включено';

    motionToggle.addEventListener('click', () => {
      const reduce = motionToggle.getAttribute('aria-pressed') !== 'true';
      motionToggle.setAttribute('aria-pressed', String(reduce));
      root.classList.toggle('reduce-motion', reduce);
      label.textContent = reduce ? 'Движение сокращено' : 'Движение включено';
    });
  }

  root.querySelectorAll('[data-copy-link]').forEach((button) => {
    button.addEventListener('click', async () => {
      const value = button.dataset.copyLink;
      const label = button.querySelector('[data-copy-label]');
      try {
        await navigator.clipboard.writeText(value);
        label.textContent = 'Адрес скопирован';
      } catch {
        const temporary = document.createElement('textarea');
        temporary.value = value;
        temporary.setAttribute('readonly', '');
        temporary.style.position = 'fixed';
        temporary.style.opacity = '0';
        document.body.appendChild(temporary);
        temporary.select();
        document.execCommand('copy');
        temporary.remove();
        label.textContent = 'Адрес скопирован';
      }

      window.setTimeout(() => {
        label.textContent = 'Скопировать адрес';
      }, 1600);
    });
  });

  const focusDemoButton = root.querySelector('[data-accessibility-focus]');
  focusDemoButton?.addEventListener('click', () => {
    root.classList.add('show-focus-demo');
    const primaryButton = root.querySelector('.kbks-auto-button--primary');
    primaryButton?.scrollIntoView({ behavior: root.classList.contains('reduce-motion') ? 'auto' : 'smooth', block: 'center' });
    window.setTimeout(() => root.classList.remove('show-focus-demo'), 2200);
  });

  const parallaxCard = root.querySelector('[data-parallax-card]');
  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (parallaxCard && canHover) {
    parallaxCard.addEventListener('pointermove', (event) => {
      if (prefersReducedMotion.matches || root.classList.contains('reduce-motion')) return;
      const rect = parallaxCard.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      parallaxCard.style.transform = `perspective(1100px) rotateX(${y * -3}deg) rotateY(${x * 4}deg)`;
    });

    parallaxCard.addEventListener('pointerleave', () => {
      parallaxCard.style.transform = '';
    });
  }
})();
