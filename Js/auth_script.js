document.addEventListener("DOMContentLoaded", () => {

  const loginModal    = document.getElementById("login-modal");
  const registerModal = document.getElementById("register-modal");

  function openModal(modal) {
    modal.classList.add("open");
  }

  function closeModal(modal) {
    modal.classList.remove("open");
  }

  document.getElementById("go-to-register").addEventListener("click", (e) => {
    e.preventDefault();
    closeModal(loginModal);
    openModal(registerModal);
  });

  document.getElementById("go-to-login").addEventListener("click", (e) => {
    e.preventDefault();
    closeModal(registerModal);
    openModal(loginModal);
  });

  document.getElementById("login-confirm").addEventListener("click", async (e) => {
    e.preventDefault();

    const email    = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value;
    const errorEl  = document.getElementById("login-error");

    errorEl.innerText = "";

    if (!email || !password) {
      errorEl.innerText = "Preencha todos os campos.";
      return;
    }

    try {
      console.log("Enviando...");
      const res  = await fetch("https://worldbuilder-b.onrender.com", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (data.success) {
        closeModal(loginModal);
        document.querySelector(".account-name").innerText  = data.username;
        document.querySelector(".account-email").innerText = email;
      } else {
        errorEl.innerText = data.message || "Erro ao entrar.";
      }
    } catch {
      errorEl.innerText = "Não foi possível conectar ao servidor.";
    }
  });

  document.getElementById("register-confirm").addEventListener("click", async (e) => {
    e.preventDefault();

    const username = document.getElementById("register-username").value.trim();
    const email    = document.getElementById("register-email").value.trim();
    const password = document.getElementById("register-password").value;
    const confirm  = document.getElementById("register-confirm-password").value;
    const errorEl  = document.getElementById("register-error");

    errorEl.innerText = "";

    if (!username || !email || !password || !confirm) {
      errorEl.innerText = "Preencha todos os campos.";
      return;
    }

    if (password !== confirm) {
      errorEl.innerText = "As senhas não coincidem.";
      return;
    }

    try {
      console.log("Enviando...");
      const res  = await fetch("https://worldbuilder-b.onrender.com", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password })
      });
      const data = await res.json();

      if (data.success) {
        closeModal(registerModal);
        openModal(loginModal);
        document.getElementById("login-email").value = email;
        document.getElementById("login-error").innerText = "";
      } else {
        if (data.error && data.error.includes("UNIQUE")) {
          errorEl.innerText = "E-mail ou username já cadastrado.";
        } else {
          errorEl.innerText = data.error || "Erro ao criar conta.";
        }
      }
    } catch {
      errorEl.innerText = "Não foi possível conectar ao servidor.";
    }
  });

});
