/* Sign-in page: sends the email and password to the dashboard server, which checks them with the website. */
(function () {
  'use strict';
  var form = document.querySelector('form');
  if (!form) return;
  var email = document.getElementById('staff-email');
  var pass = document.getElementById('staff-password');
  var remember = form.querySelector('input[type=checkbox]');
  var button = document.getElementById('submit-auth-btn');
  var box = document.getElementById('login-error');

  // Already signed in? Go straight to Home.
  fetch('/api/me', { credentials: 'same-origin' }).then(function (r) {
    if (r.ok) location.replace(window.matchMedia('(max-width: 1023px)').matches ? '/home_dashboard_mobile/code.html' : '/home_dashboard/code.html');
  }).catch(function () {});

  function fail(text) {
    box.textContent = text;
    box.hidden = false;
    button.disabled = false;
    button.style.opacity = '';
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    box.hidden = true;
    button.disabled = true;
    button.style.opacity = '0.7';
    fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'bvc-dashboard' },
      credentials: 'same-origin',
      body: JSON.stringify({ email: email.value.trim(), password: pass.value, remember: !!(remember && remember.checked) })
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (d) {
        if (r.ok) {
          location.href = window.matchMedia('(max-width: 1023px)').matches ? '/home_dashboard_mobile/code.html' : '/home_dashboard/code.html';
        } else {
          pass.value = '';
          fail(d.message || 'Could not sign in. Please try again.');
        }
      });
    }).catch(function () { fail('Could not reach the server. Please try again.'); });
  });
})();
