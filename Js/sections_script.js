let activeSection = null;

const sectionIcons = {
  Stories:    "bi-feather",
  Characters: "bi-person-fill",
  Locations:  "bi-geo-alt-fill",
  Objects:    "bi-box-fill"
};

document.querySelectorAll('.btn-add').forEach(button => {
  button.addEventListener('click', () => {
    activeSection = button.dataset.section;
    document.getElementById('create-modal').classList.add('open');
  });
});

document.querySelectorAll('.modal-btn-cancel').forEach(button => {
  button.addEventListener('click', () => {
    document.getElementById('create-modal').classList.remove('open');
    document.getElementById('modal-name-input').value = '';
  });
});

document.getElementById('modal-confirm').addEventListener('click', async () => {
  const name    = document.getElementById('modal-name-input').value.trim();
  const userId  = window.currentUserId;

  if (!name) {
    document.getElementById('modal-name-input').placeholder = 'Enter a name...';
    document.getElementById('modal-name-input').style.borderColor = 'red';
    return;
  }

  if (!userId) {
    alert('You must be logged in to create items.');
    return;
  }

  try {
    const res  = await fetch('/create-item', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ section: activeSection, name, user_id: userId })
    });
    const data = await res.json();

    if (data.success) {
      addCardToList(activeSection, data.id, data.name);
      document.getElementById('create-modal').classList.remove('open');
      document.getElementById('modal-name-input').value = '';
      document.getElementById('modal-name-input').style.borderColor = '';
    } else {
      alert(data.error || 'Failed to create item.');
    }
  } catch {
    alert('Unable to connect to the server.');
  }
});

function addCardToList(section, id, name) {
  const sectionMap = {
    Stories:    'B-Stories',
    Characters: 'C-Characters',
    Locations:  'D-Locations',
    Objects:    'E-Objects'
  };

  const sectionEl = document.getElementById(sectionMap[section]);
  if (!sectionEl) return;

  const list = sectionEl.querySelector('.section-list');
  if (!list) return;

  const icon = sectionIcons[section] || 'bi-file';

  const card = document.createElement('div');
  card.className = 'section-card';
  card.dataset.id = id;
  card.innerHTML = `
    <div class="card-thumb"><i class="bi ${icon}"></i></div>
    <div class="card-info">
      <span class="card-name">${name}</span>
    </div>
  `;
  list.appendChild(card);
}