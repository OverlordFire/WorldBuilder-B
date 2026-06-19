const openButton = document.querySelectorAll('.btn-add');

openButton.forEach(button_M => {
  button_M.addEventListener('click', () => {
      const modal = document.getElementById('create-modal');
      modal.classList.add('open');
  })
})

const closeButton = document.querySelectorAll('.modal-btn-cancel');

closeButton.forEach(button_M => {
  button_M.addEventListener('click', () => {
    const modal = document.getElementById('create-modal').classList.remove('open');
  })
})