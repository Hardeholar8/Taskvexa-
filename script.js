document.addEventListener("DOMContentLoaded", () => {

  const registerForm = document.getElementById("registerForm");

  if (registerForm) {
    registerForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const name = document.getElementById("fullName").value;
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;
      const accountType = document.getElementById("accountType").value;

      const user = {
        name: name,
        email: email,
        password: password,
        accountType: accountType
      };

      localStorage.setItem("taskvexaUser", JSON.stringify(user));

      alert("Account created successfully!");
      window.location.href = "login.html";
    });
  }

  const loginForm = document.getElementById("loginForm");

  if (loginForm) {
    loginForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const email = document.getElementById("loginEmail").value;
      const password = document.getElementById("loginPassword").value;

      const savedUser = JSON.parse(
        localStorage.getItem("taskvexaUser")
      );

      if (
        savedUser &&
        savedUser.email === email &&
        savedUser.password === password
      ) {
        alert("Login successful!");
        window.location.href = "dashboard.html";
      } else {
        alert("Incorrect email or password.");
      }
    });
  }

  const userName = document.getElementById("userName");
  const userType = document.getElementById("userType");

  const savedUser = JSON.parse(
    localStorage.getItem("taskvexaUser")
  );

  if (savedUser) {
    if (userName) userName.textContent = savedUser.name;
    if (userType) userType.textContent = savedUser.accountType;
  }

  const logoutButton = document.getElementById("logoutButton");

  if (logoutButton) {
    logoutButton.addEventListener("click", () => {
      localStorage.removeItem("taskvexaUser");
      window.location.href = "login.html";
    });
  }

});
