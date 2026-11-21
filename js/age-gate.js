(function () {
	var KEY = 'ageConfirmed';
	var DAYS = 30; // сколько дней помнить подтверждение

	// Если уже подтверждали, ничего не показываем
	try {
		var saved = localStorage.getItem(KEY);
		if (saved && Date.now() - Number(saved) < DAYS * 24 * 60 * 60 * 1000) return;
	} catch (e) {}

	document.documentElement.classList.add('age-gate-lock');

	function show() {
		var gate = document.createElement('div');
		gate.className = 'age-gate';
		gate.setAttribute('role', 'dialog');
		gate.setAttribute('aria-modal', 'true');
		gate.innerHTML =
			'<div class="age-gate__box">' +
			'<h2 class="age-gate__title">Adults only (18+)</h2>' +
			'<p class="age-gate__text">This website contains adult content. ' +
			'You must be at least 18 years old to enter.</p>' +
			'<div class="age-gate__buttons">' +
			'<button type="button" class="age-gate__btn age-gate__btn--enter">I am 18 or older - Enter</button>' +
			'<button type="button" class="age-gate__btn age-gate__btn--exit">Exit</button>' +
			'</div></div>';
		document.body.appendChild(gate);

		var enterBtn = gate.querySelector('.age-gate__btn--enter');
		enterBtn.focus();

		enterBtn.addEventListener('click', function () {
			try { localStorage.setItem(KEY, String(Date.now())); } catch (e) {}
			gate.remove();
			document.documentElement.classList.remove('age-gate-lock');
		});
		gate.querySelector('.age-gate__btn--exit').addEventListener('click', function () {
			window.location.href = 'https://www.google.com';
		});
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', show);
	} else {
		show();
	}
})();