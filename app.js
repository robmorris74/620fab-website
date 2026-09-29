const menu = document.querySelector('.menu');
const links = document.querySelector('.navlinks');
if (menu && links) {
  menu.addEventListener('click', () => links.classList.toggle('open'));
  links.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => links.classList.remove('open')));
}

// Set this to the public endpoint supplied by Formspree, e.g. https://formspree.io/f/xxxxxxxx.
// The endpoint ID is public; never put provider API keys or mailbox credentials here.
const PROJECT_FORM_ENDPOINT = '';

const projectForm = document.querySelector('#project-form');
if (projectForm) {
  const status = projectForm.querySelector('#form-status');
  const submit = projectForm.querySelector('button[type="submit"]');
  const phone = projectForm.elements.phone;
  const email = projectForm.elements.email;

  function showStatus(message, state) {
    status.textContent = message;
    status.dataset.state = state;
  }

  function validateContact() {
    phone.setCustomValidity('');
    const number = phone.value.trim();
    if (!number && !email.value.trim()) {
      phone.setCustomValidity('Enter a phone number or email address.');
    } else if (number && !/^\+?[\d\s().-]+$/.test(number)) {
      phone.setCustomValidity('Enter a valid phone number.');
    } else if (number) {
      const digits = number.replace(/\D/g, '');
      if (digits.length < 7 || digits.length > 15) phone.setCustomValidity('Enter a valid phone number.');
    }
  }

  [phone, email].forEach((field) => field.addEventListener('input', () => {
    validateContact();
    if (status.dataset.state === 'error') showStatus('', '');
  }));

  projectForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    validateContact();
    if (!projectForm.checkValidity()) {
      showStatus('Please complete the required fields and provide a valid phone number or email.', 'error');
      projectForm.reportValidity();
      return;
    }

    if (!/^https:\/\/formspree\.io\/f\/[a-zA-Z0-9]+$/.test(PROJECT_FORM_ENDPOINT)) {
      showStatus('Online requests are temporarily unavailable. Please call 620-687-6713.', 'error');
      return;
    }

    if (projectForm.elements.website.value) return;
    submit.disabled = true;
    submit.textContent = 'Sending…';
    showStatus('Sending your request…', 'pending');

    try {
      const response = await fetch(PROJECT_FORM_ENDPOINT, {
        method: 'POST',
        body: new FormData(projectForm),
        headers: { Accept: 'application/json' }
      });
      if (!response.ok) throw new Error('Form provider rejected the submission');
      projectForm.reset();
      showStatus('Your request was sent. We’ll be in touch soon.', 'success');
    } catch (_) {
      showStatus('We could not send your request. Please try again or call 620-687-6713.', 'error');
    } finally {
      submit.disabled = false;
      submit.textContent = 'Send project request';
    }
  });
}
