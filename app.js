const menu = document.querySelector('.menu');
const links = document.querySelector('.navlinks');
if (menu && links) {
  menu.addEventListener('click', () => links.classList.toggle('open'));
  links.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => links.classList.remove('open')));
}

// Reuses PR #1's Formspree integration. Both values stay inactive until owner approval.
// Public form ID only; never put mailbox credentials or private API keys here.
const PROJECT_FORM_ENDPOINT = '';
const PROJECT_FORM_ENABLED = false;
const validEndpoint = /^https:\/\/formspree\.io\/f\/[a-zA-Z0-9]+$/.test(PROJECT_FORM_ENDPOINT);
const CABINS = {
  '1': { name: 'Cabin 1', sku: '620-CABIN-1', price: '45000', page: 'https://620fab.com/cabin-1.html' },
  '2': { name: 'Cabin 2', sku: '620-CABIN-2', price: '79000', page: 'https://620fab.com/cabin-2.html' }
};
const recent = new Map();
const DUPLICATE_WINDOW = 10 * 60 * 1000;

document.querySelectorAll('[data-inquiry-form]').forEach((form) => {
  const status = form.querySelector('[data-form-status]');
  const submit = form.querySelector('button[type="submit"]');
  const buttonLabel = submit.textContent;
  const phone = form.elements.phone;
  const email = form.elements.email;
  const cabin = CABINS[form.dataset.cabin];
  const openedAt = Date.now();
  let busy = false;
  let attempt = null;
  const available = PROJECT_FORM_ENABLED && validEndpoint;
  submit.disabled = !available;

  function showStatus(message, state) {
    status.textContent = message;
    status.dataset.state = state;
  }
  if (available) showStatus('', '');
  else showStatus('Online requests are currently unavailable. Please call 620-687-6713.', 'unavailable');

  function validateContact() {
    form.querySelectorAll('[required]').forEach((field) => {
      field.setCustomValidity(field.value.trim() ? '' : 'Please complete this field.');
    });
    phone.setCustomValidity('');
    const number = phone.value.trim();
    if (!number && !email.value.trim()) phone.setCustomValidity('Enter a phone number or email address.');
    else if (number && (!/^\+?[\d\s().-]+$/.test(number) || !/^\d{7,15}$/.test(number.replace(/\D/g, '')))) {
      phone.setCustomValidity('Enter a valid phone number.');
    }
  }
  form.addEventListener('input', () => {
    validateContact();
    if (!busy && status.dataset.state === 'error') showStatus('', '');
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (busy) return;
    if (!available) {
      showStatus('Online requests are currently unavailable. Please call 620-687-6713.', 'unavailable');
      return;
    }
    validateContact();
    if (!form.checkValidity()) {
      showStatus('Please complete the required fields and provide a valid phone number or email.', 'error');
      form.reportValidity();
      return;
    }
    // Provider-recognized honeypot plus a modest automated-fill timing check.
    // These browser checks supplement the provider's server-side spam controls.
    if (form.elements._gotcha.value || Date.now() - openedAt < 2000) {
      showStatus('Please wait a moment and try again, or call 620-687-6713.', 'error');
      return;
    }
    busy = true; // Guard before the asynchronous hash as well as the network request.
    submit.disabled = true;
    submit.textContent = 'Sending…';
    form.setAttribute('aria-busy', 'true');
    showStatus('Sending your request…', 'pending');
    let timer;
    let dispatched = false;
    try {
      const data = new FormData(form);
      form.querySelectorAll('input,textarea').forEach((field) => data.set(field.name, field.value.trim()));
      // Identity comes from the listing, never query strings or an editable form field.
      if (cabin) {
        data.set('cabin', cabin.name);
        data.set('sku', cabin.sku);
        data.set('asking_price_usd', cabin.price);
        data.set('listing_url', cabin.page);
      }
      data.set('_subject', cabin ? `Purchase inquiry: ${cabin.name}` : '620 Fabrication project request');
      const content = JSON.stringify([...data.entries()].filter(([name]) => name !== '_gotcha'));
      const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(content));
      const fingerprint = [...new Uint8Array(bytes)].map((n) => n.toString(16).padStart(2, '0')).join('');
      const key = `620fab-inquiry:${fingerprint}`;
      let acceptedAt = recent.get(key) || 0;
      try { acceptedAt = Number(sessionStorage.getItem(key)) || acceptedAt; } catch (_) { /* memory fallback */ }
      if (acceptedAt && Date.now() - acceptedAt < DUPLICATE_WINDOW) {
        showStatus('This inquiry was already accepted recently. Please call if you need to add anything.', 'success');
        return;
      }
      // Reuse the reference for retries of an unchanged request after an ambiguous network failure.
      if (!attempt || attempt.fingerprint !== fingerprint) attempt = { fingerprint, id: crypto.randomUUID() };
      data.set('inquiry_reference', attempt.id);
      const controller = new AbortController();
      timer = setTimeout(() => controller.abort(), 15000);
      dispatched = true;
      const response = await fetch(PROJECT_FORM_ENDPOINT, {
        method: 'POST', body: data, headers: { Accept: 'application/json' }, signal: controller.signal
      });
      if (!response.ok) {
        dispatched = false;
        throw new Error('Provider rejected request');
      }
      const result = await response.json();
      if (result.ok !== true) throw new Error('Unconfirmed provider response');
      recent.set(key, Date.now());
      try { sessionStorage.setItem(key, String(Date.now())); } catch (_) { /* memory fallback */ }
      form.reset();
      showStatus('Your inquiry was accepted for delivery. We’ll be in touch soon.', 'success');
    } catch (_) {
      showStatus(dispatched
        ? 'We could not confirm delivery. Your details are still here. Please call 620-687-6713 before retrying to avoid a duplicate.'
        : 'We could not send your request. Your details are still here. Please try again or call 620-687-6713.', 'error');
    } finally {
      clearTimeout(timer);
      busy = false;
      submit.disabled = !available;
      submit.textContent = buttonLabel;
      form.removeAttribute('aria-busy');
    }
  });
});
