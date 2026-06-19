const menuItems = document.querySelectorAll('.item-bar');

function setActive() {
    menuItems.forEach(item => item.classList.remove('ativo'));
    this.classList.add('ativo');
}

menuItems.forEach(item => item.addEventListener('click', setActive));

const btnExp = document.querySelector('#btn-exp')
const menuSide = document.querySelector('.Sidebar')

btnExp.addEventListener('click', function(){
    menuSide.classList.toggle('Expand')
})
document.addEventListener("DOMContentLoaded", () => {

  const goRegister = document.getElementById("go-to-register");
  const goLogin = document.getElementById("go-to-login");

  const loginModal = document.getElementById("login-modal");
  const registerModal = document.getElementById("register-modal");

  function clearErrors() {
    document.querySelectorAll(".modal-error").forEach(e => e.innerText = "");
  }

  goRegister?.addEventListener("click", (e) => {
    e.preventDefault();
    clearErrors();
    loginModal.classList.remove("open");
    registerModal.classList.add("open");
  });

  goLogin?.addEventListener("click", (e) => {
    e.preventDefault();
    clearErrors();
    registerModal.classList.remove("open");
    loginModal.classList.add("open");
  });

});
