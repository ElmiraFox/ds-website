(function () {
	var KEY = 'ageConfirmed';
	var DAYS = 30; // сколько дней помнить подтверждение

	// Если уже подтверждали, ничего не показываем
	try {
		var saved = localStorage.getItem(KEY);
		if (saved && Date.now() - Number(saved) < DAYS * 24 * 60 * 60 * 1000) return;
	} catch (e) {}

	document.documentElement.classList.add('age-gate-lock');

	var pl = (document.documentElement.lang || '').slice(0, 2) === 'pl';
	var L = pl
		? {
			title: 'Tylko dla dorosłych (18+)',
			text: 'Ta strona zawiera treści dla dorosłych. Musisz mieć ukończone 18 lat, aby wejść.',
			enter: 'Mam 18 lat lub więcej - Wchodzę',
			exit: 'Wyjdź'
		}
		: {
			title: 'Adults only (18+)',
			text: 'This website contains adult content. You must be at least 18 years old to enter.',
			enter: 'I am 18 or older - Enter',
			exit: 'Exit'
		};

	function show() {
		var gate = document.createElement('div');
		gate.className = 'age-gate';
		gate.setAttribute('role', 'dialog');
		gate.setAttribute('aria-modal', 'true');
		gate.innerHTML =
			'<div class="age-gate__box">' +
			'<h2 class="age-gate__title">' + L.title + '</h2>' +
			'<p class="age-gate__text">' + L.text + '</p>' +
			'<div class="age-gate__buttons">' +
			'<button type="button" class="age-gate__btn age-gate__btn--enter">' + L.enter + '</button>' +
			'<button type="button" class="age-gate__btn age-gate__btn--exit">' + L.exit + '</button>' +
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