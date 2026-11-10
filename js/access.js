/* access.js — kode masuk (gerbang ringan, bukan pengamanan). */
(function () {
  'use strict';

  // Ganti kode masuk di sini saja.
  var ACCESS_CODE = '3016';
  var CODE_LENGTH = ACCESS_CODE.length;

  var WRONG_MESSAGES = [
    'Ups, kodenya belum pas. Coba lagi, ya!',
    'Hampir! Minta bantuan Ayah atau Bunda, yuk.',
    'Belum cocok. Ayo coba sekali lagi!'
  ];

  var entered = '';
  var wrongCount = 0;
  var els = {};
  var onSuccess = function () {};

  function render() {
    els.slots.forEach(function (slot, i) {
      slot.textContent = entered[i] || '';
      slot.classList.toggle('filled', !!entered[i]);
      slot.classList.toggle('active', i === entered.length);
    });
  }

  function setMessage(text, kind) {
    els.msg.textContent = text;
    els.msg.className = 'code-msg' + (kind ? ' ' + kind : '');
  }

  function press(digit) {
    if (entered.length >= CODE_LENGTH) return;
    entered += digit;
    setMessage('');
    render();
    if (entered.length === CODE_LENGTH) check();
  }

  function backspace() {
    entered = entered.slice(0, -1);
    render();
  }

  function check() {
    if (entered === ACCESS_CODE) {
      WK.Storage.setAccess(true);
      setMessage('Yeay! Kode benar!', 'ok');
      els.box.classList.add('success');
      setTimeout(function () {
        els.box.classList.remove('success');
        entered = '';
        render();
        setMessage('');
        onSuccess();
      }, 700);
    } else {
      setMessage(WRONG_MESSAGES[wrongCount % WRONG_MESSAGES.length], 'bad');
      wrongCount++;
      els.box.classList.remove('shake');
      void els.box.offsetWidth; // ulang animasi
      els.box.classList.add('shake');
      setTimeout(function () { entered = ''; render(); }, 450);
    }
  }

  function onKey(e) {
    if (!els.box || els.box.offsetParent === null) return; // layar kode tidak tampil
    if (/^[0-9]$/.test(e.key)) { press(e.key); e.preventDefault(); }
    else if (e.key === 'Backspace') { backspace(); e.preventDefault(); }
  }

  function init(options) {
    onSuccess = options.onSuccess || onSuccess;
    els.box = document.getElementById('code-box');
    els.slots = Array.prototype.slice.call(els.box.querySelectorAll('.slot'));
    els.msg = document.getElementById('code-msg');

    document.getElementById('keypad').addEventListener('click', function (e) {
      var btn = e.target.closest('button');
      if (!btn) return;
      if (btn.dataset.key) press(btn.dataset.key);
      else if (btn.dataset.action === 'back') backspace();
    });
    document.addEventListener('keydown', onKey);
    render();
  }

  function reset() { entered = ''; setMessage(''); render(); }

  window.WK = window.WK || {};
  window.WK.Access = { init: init, reset: reset, CODE_LENGTH: CODE_LENGTH };
})();
