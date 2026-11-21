(function () {
  var root = document.getElementById('tours-calendar');
  if (!root) return;

  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  var DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  var MAX_MONTHS_AHEAD = 11; // на сколько месяцев вперёд можно листать

  // Сегодняшний день без времени
  var now = new Date();
  var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  var viewYear = today.getFullYear();
  var viewMonth = today.getMonth();
  var tours = [];

  // "2026-12-05" -> дата (вручную, чтобы не было сдвига часовых поясов)
  function parse(s) {
    var p = String(s).split('-');
    return new Date(+p[0], +p[1] - 1, +p[2]);
  }

  function fmt(d) {
    return d.getDate() + ' ' + MONTHS[d.getMonth()];
  }

  function fmtRange(t) {
    var text = t.from.getTime() === t.to.getTime() ? fmt(t.from) : fmt(t.from) + ' – ' + fmt(t.to);
    return text + ' ' + t.to.getFullYear();
  }

  function tourForDay(d) {
    for (var i = 0; i < tours.length; i++) {
      if (d >= tours[i].from && d <= tours[i].to) return tours[i];
    }
    return null;
  }

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  }

  function monthsFromToday() {
    return (viewYear - today.getFullYear()) * 12 + (viewMonth - today.getMonth());
  }

  function render() {
    root.innerHTML = '';

    // Если туров нет, пишем об этом над календарём
    if (!tours.length) {
      root.appendChild(el('p', 'tours-calendar__empty', 'No upcoming tours at the moment. Check back soon or contact me.'));
    }

    // Календарь
    var cal = el('div', 'tours-calendar__cal');
    var head = el('div', 'tours-calendar__head');

    var prev = el('button', 'tours-calendar__nav', '‹');
    prev.type = 'button';
    prev.setAttribute('aria-label', 'Previous month');
    prev.disabled = monthsFromToday() <= 0;
    prev.addEventListener('click', function () {
      viewMonth--;
      if (viewMonth < 0) { viewMonth = 11; viewYear--; }
      render();
    });

    var next = el('button', 'tours-calendar__nav', '›');
    next.type = 'button';
    next.setAttribute('aria-label', 'Next month');
    next.disabled = monthsFromToday() >= MAX_MONTHS_AHEAD;
    next.addEventListener('click', function () {
      viewMonth++;
      if (viewMonth > 11) { viewMonth = 0; viewYear++; }
      render();
    });

    head.appendChild(prev);
    head.appendChild(el('div', 'tours-calendar__title', MONTHS[viewMonth] + ' ' + viewYear));
    head.appendChild(next);
    cal.appendChild(head);

    var grid = el('div', 'tours-calendar__grid');
    DAYS.forEach(function (n) {
      grid.appendChild(el('div', 'tours-calendar__weekday', n));
    });

    var offset = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7; // неделя с понедельника
    for (var i = 0; i < offset; i++) grid.appendChild(el('div', 'tours-calendar__day tours-calendar__day--empty'));

    var daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    for (var n = 1; n <= daysInMonth; n++) {
      var d = new Date(viewYear, viewMonth, n);
      var cell = el('div', 'tours-calendar__day');
      cell.appendChild(el('span', 'tours-calendar__num', String(n)));
      if (d < today) {
        cell.classList.add('tours-calendar__day--past'); // прошедшие дни без туров
      } else {
        if (d.getTime() === today.getTime()) cell.classList.add('tours-calendar__day--today');
        var t = tourForDay(d);
        if (t) {
          cell.classList.add('tours-calendar__day--tour');
          cell.title = t.city;
          cell.appendChild(el('span', 'tours-calendar__label', t.city));
        }
      }
      grid.appendChild(cell);
    }
    cal.appendChild(grid);
    root.appendChild(cal);

		// Список туров выбранного месяца (виден только на телефоне)
		var monthStart = new Date(viewYear, viewMonth, 1);
		var monthEnd = new Date(viewYear, viewMonth + 1, 0);
		var legend = el('div', 'tours-calendar__legend');
		tours.forEach(function (t) {
			if (t.to >= monthStart && t.from <= monthEnd) {
				var row = el('div', 'tours-calendar__legend-item');
				row.appendChild(el('span', 'tours-calendar__legend-city', t.city));
				row.appendChild(el('span', 'tours-calendar__legend-dates', fmtRange(t)));
				legend.appendChild(row);
			}
		});
		if (legend.children.length) root.appendChild(legend);
  }

  fetch('./tours.json?v=' + Date.now())
    .then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    })
    .then(function (data) {
      tours = (data.tours || [])
        .map(function (t) {
          return { city: t.city, from: parse(t.from), to: parse(t.to), note: t.note || '' };
        })
        .filter(function (t) {
          return !isNaN(t.from) && !isNaN(t.to) && t.to >= today; // прошедшие туры отбрасываются
        })
        .sort(function (a, b) { return a.from - b.from; });
      render();
    })
    .catch(function () {
      root.innerHTML = '';
      root.appendChild(el('p', 'tours-calendar__empty', 'Tours cannot be loaded right now. Please try again later.'));
    });
})();