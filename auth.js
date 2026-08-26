// TaskVexa Authentication
// Uses Supabase Auth

const SUPABASE_URL = "https://dxtlnrthlpdaobnbazny.supabase.co";
const SUPABASE_KEY = sb_publishable_UUFlTjQiT3osVMRNFYiNuA_UukQ-9kY

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);



// ===============================
// REGISTER
// ===============================

const registerForm = document.getElementById("registerForm");

if (registerForm) {

  registerForm.addEventListener("submit", async function(event) {

    event.preventDefault();

    const button = document.getElementById("registerButton");
    const message = document.getElementById("message");

    const fullName = document.getElementById("fullName").value.trim();
    const email = document.getElementById("email").value.trim().toLowerCase();
    const password = document.getElementById("password").value;
    const accountType = document.getElementById("accountType").value;

    message.textContent = "";

    if (!fullName || !email || !password || !accountType) {
      message.textContent = "Please fill in all fields.";
      return;
    }

    button.disabled = true;
    button.textContent = "Creating Account...";

    try {

      const { data, error } = await supabaseClient.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            full_name: fullName,
            account_type: accountType
          }
        }
      });

      console.log("Supabase response:", data, error);

      if (error) {
        message.textContent = error.message;
        button.disabled = false;
        button.textContent = "Create Account";
        return;
      }

      if (data.user) {

        registerForm.style.display = "none";

        const successBox = document.getElementById("successBox");

        if (successBox) {
          successBox.style.display = "block";
        }

        message.textContent =
          "Registration successful. Check your email to confirm your account.";

      } else {

        message.textContent =
          "Registration did not complete. Please try again.";

        button.disabled = false;
        button.textContent = "Create Account";
      }

    } catch (error) {

      console.error("Registration error:", error);

      message.textContent =
        "Connection error: " + error.message;

      button.disabled = false;
      button.textContent = "Create Account";
    }

  });

}


// ===============================
// LOGIN
// ===============================

const loginForm = document.getElementById("loginForm");

if (loginForm) {

  loginForm.addEventListener("submit", async function(event) {

    event.preventDefault();

    const button =
      document.getElementById("loginButton");

    const message =
      document.getElementById("message");

    const email =
      document.getElementById("email").value.trim().toLowerCase();

    const password =
      document.getElementById("password").value;


    message.textContent = "";

    button.disabled = true;
    button.textContent = "Logging in...";


    try {

      const { data, error } =
        await supabaseClient.auth.signInWithPassword({

          email: email,
          password: password

        });


      if (error) {

        message.textContent = error.message;

        button.disabled = false;
        button.textContent = "Login";

        return;
      }


      window.location.href = "dashboard.html";


    } catch (error) {

      console.error(error);

      message.textContent =
        "Login failed. Please try again.";

      button.disabled = false;
      button.textContent = "Login";
    }

  });

}



// ===============================
// FORGOT PASSWORD
// ===============================

const forgotForm =
  document.getElementById("forgotForm");

if (forgotForm) {

  forgotForm.addEventListener("submit", async function(event) {

    event.preventDefault();

    const email =
      document.getElementById("email").value.trim().toLowerCase();

    const message =
      document.getElementById("message");

    const button =
      document.getElementById("forgotButton");


    message.textContent = "";

    button.disabled = true;
    button.textContent = "Sending...";


    try {

      const { error } =
        await supabaseClient.auth.resetPasswordForEmail(
          email,
          {
            redirectTo:
              window.location.origin +
              "/reset-password.html"
          }
        );


      if (error) {

        message.textContent = error.message;

        button.disabled = false;
        button.textContent = "Reset Password";

        return;
      }


      message.textContent =
        "Password reset email sent. Check your inbox.";


      button.disabled = false;
      button.textContent = "Reset Password";


    } catch (error) {

      console.error(error);

      message.textContent =
        "Unable to send reset email.";

      button.disabled = false;
      button.textContent = "Reset Password";
    }

  });

}



// ===============================
// LOGOUT
// ===============================

async function logoutUser() {

  await supabaseClient.auth.signOut();

  window.location.href = "login.html";

}



// ===============================
// PROTECT DASHBOARD
// ===============================

async function requireLogin() {

  const { data } =
    await supabaseClient.auth.getSession();

  if (!data.session) {

    window.location.href = "login.html";

  }

      }
