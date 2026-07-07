document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Scroll reveal ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

  revealEls.forEach((el) => io.observe(el));

  /* ---------- Accordion (FAQ) ---------- */
  const items = document.querySelectorAll('.accordion__item');
  items.forEach((item) => {
    const trigger = item.querySelector('.accordion__trigger');
    const panel = item.querySelector('.accordion__panel');

    trigger.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');

      items.forEach((other) => {
        other.classList.remove('is-open');
        other.querySelector('.accordion__trigger').setAttribute('aria-expanded', 'false');
        other.querySelector('.accordion__panel').style.maxHeight = null;
      });

      if (!isOpen) {
        item.classList.add('is-open');
        trigger.setAttribute('aria-expanded', 'true');
        panel.style.maxHeight = panel.scrollHeight + 'px';
      }
    });
  });

  /* ---------- Mobile nav ---------- */
  const burger = document.getElementById('burger');
  const navLinks = document.getElementById('navLinks');

  if (burger && navLinks) {
    burger.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', String(isOpen));
      navLinks.style.display = isOpen ? 'flex' : '';
    });

    navLinks.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('is-open');
        navLinks.style.display = '';
        burger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- Sticky nav shadow on scroll ---------- */
  const nav = document.getElementById('nav');
  const onScroll = () => {
    if (window.scrollY > 8) {
      nav.style.boxShadow = '0 4px 20px rgba(30,30,30,0.06)';
    } else {
      nav.style.boxShadow = 'none';
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ================= QUOTE FORM ================= */
  /*
   * Optional EmailJS integration.
   * 1. Create a free account at https://www.emailjs.com
   * 2. Replace the three placeholder strings below with your own IDs.
   * 3. Leave them as-is to keep the form frontend-only (no email is sent,
   *    the success modal still displays normally).
   */
  const EMAILJS_PUBLIC_KEY = 'YOUR_EMAILJS_PUBLIC_KEY';
  const EMAILJS_SERVICE_ID = 'YOUR_EMAILJS_SERVICE_ID';
  const EMAILJS_TEMPLATE_ID = 'YOUR_EMAILJS_TEMPLATE_ID';
  const EMAILJS_CONFIGURED =
    EMAILJS_PUBLIC_KEY.indexOf('YOUR_') !== 0 &&
    typeof window.emailjs !== 'undefined';

  if (EMAILJS_CONFIGURED) {
    window.emailjs.init(EMAILJS_PUBLIC_KEY);
  }

  const quoteForm = document.getElementById('quoteForm');
  const quoteSubmit = document.getElementById('quoteSubmit');
  const modal = document.getElementById('successModal');
  const modalClose = document.getElementById('modalClose');
  const modalAgain = document.getElementById('modalAgain');
  let isSubmitting = false;

  const validators = {
    fullName: (v) => v.trim().length >= 2,
    email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
    phone: (v) => /^[0-9+()\-\s]{7,}$/.test(v.trim()),
    address: (v) => v.trim().length >= 4,
    dogs: (v) => v.trim().length > 0,
    frequency: (v) => v.trim().length > 0,
  };

  function setFieldError(fieldEl, hasError) {
    if (!fieldEl) return;
    fieldEl.classList.toggle('has-error', hasError);
  }

  function validateQuoteForm() {
    if (!quoteForm) return true;
    let isValid = true;

    Object.keys(validators).forEach((name) => {
      const input = quoteForm.elements[name];
      const fieldEl = input ? input.closest('.form-field') : null;
      const valid = input ? validators[name](input.value) : true;
      setFieldError(fieldEl, !valid);
      if (!valid) isValid = false;
    });

    const consent = quoteForm.elements.consent;
    const consentField = consent ? consent.closest('.checkbox-field') : null;
    const consentValid = consent ? consent.checked : true;
    if (consentField) consentField.classList.toggle('has-error', !consentValid);
    if (!consentValid) isValid = false;

    return isValid;
  }

  function openModal() {
    if (!modal) return;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    isSubmitting = false;
    if (quoteSubmit) quoteSubmit.disabled = false;
  }

  if (quoteForm) {
    // Clear individual field errors as the person corrects them.
    Object.keys(validators).forEach((name) => {
      const input = quoteForm.elements[name];
      if (!input) return;
      input.addEventListener('input', () => {
        const fieldEl = input.closest('.form-field');
        if (validators[name](input.value)) setFieldError(fieldEl, false);
      });
    });
    const consentInput = quoteForm.elements.consent;
    if (consentInput) {
      consentInput.addEventListener('change', () => {
        const consentField = consentInput.closest('.checkbox-field');
        if (consentInput.checked && consentField) consentField.classList.remove('has-error');
      });
    }

    quoteForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (isSubmitting) return; // prevent duplicate submissions

      if (!validateQuoteForm()) {
        const firstError = quoteForm.querySelector('.has-error');
        if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }

      isSubmitting = true;
      if (quoteSubmit) quoteSubmit.disabled = true;

      const finish = () => {
        quoteForm.reset();
        quoteForm.querySelectorAll('.has-error').forEach((el) => el.classList.remove('has-error'));
        openModal();
      };

      if (EMAILJS_CONFIGURED) {
        window.emailjs
          .sendForm(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, quoteForm)
          .then(finish)
          .catch(() => finish()); // frontend still confirms even if the send fails
      } else {
        finish();
      }
    });
  }

  if (modalClose) modalClose.addEventListener('click', closeModal);
  if (modalAgain) modalAgain.addEventListener('click', closeModal);
  const modalHome = document.getElementById('modalHome');
  if (modalHome) modalHome.addEventListener('click', closeModal);

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && modal.classList.contains('is-open')) {
      closeModal();
    }
  });

});