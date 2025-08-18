document.addEventListener('DOMContentLoaded', () => {
  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // Load schedule JSON and render
  renderSchedule();
});

async function renderSchedule() {
  const container = document.getElementById('schedule-grid');
  if (!container) return;

  try {
    const res = await fetch('assets/data/schedule.json', { cache: 'no-store' });
    if (!res.ok) throw new Error(`Failed to load schedule: ${res.status}`);
    const data = await res.json();

    // Expected shape: { headers: ["Week", "Mon", ...], rows: [{ label: "Week 1", items: ["", "Chapter 1", ...] }, ...] }
    if (!Array.isArray(data.headers) || !Array.isArray(data.rows)) {
      throw new Error('Invalid schedule format');
    }

    // Render header row
    for (const h of data.headers) {
      const div = document.createElement('div');
      div.className = 'header';
      div.textContent = h;
      container.appendChild(div);
    }

    // Render rows
    for (const row of data.rows) {
      const label = document.createElement('div');
      const isBreakWeek = row.label.includes('Break');
      label.className = 'cell ' + (isBreakWeek ? 'warn' : 'muted');
      label.textContent = row.label ?? '';
      label.setAttribute('data-role', 'row');
      container.appendChild(label);

      for (const cell of row.items ?? []) {
        const div = document.createElement('div');
        div.className = 'cell item';
        if (typeof cell === 'string') {
          div.textContent = cell;
        } else if (cell && typeof cell === 'object') {
          // Just use the text and note if present, no link
          div.textContent = cell.text ?? '';
          if (cell.note) {
            const small = document.createElement('div');
            const isWarning = cell.note.includes('NO CLASS') || cell.note.includes('Break');
            small.className = 'small' + (isWarning ? ' warn' : ' muted');
            small.textContent = cell.note;
            div.appendChild(small);
          }
        }
        container.appendChild(div);
      }
    }
  } catch (err) {
    const error = document.createElement('div');
    error.className = 'cell';
    error.textContent = `Error loading schedule: ${err.message}`;
    container.appendChild(error);
  }
}

// Future enhancements:
// - Fetch announcements from a JSON or Google Sheet
// - Toggle view (List vs Grid)
// - Save favorite links in localStorage
