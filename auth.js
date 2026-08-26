// ==========================================
// TASKVEXA AUTHENTICATION
// Registration + Login + Forgot Password
// ==========================================

const SUPABASE_URL = "https://dxtlnrthlpdaobnbazny.supabase.co";

const SUPABASE_KEY =  "sb_publishable_UUFlTjQiT3osVMRNFYiNuA_UukQ-9kY";


// ------------------------------------------
// START SUPABASE
// ------------------------------------------

if (!window.supabase) {
  console.error("Supabase library did not load.");
  showMessage("Unable to load authentication. Please refresh the page.");
} else {

  const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
  );


  // ========================================
  // HELPER: SHOW MESSAGE
  // ========================================

  function showMessage(text) {

    const message = document.getElementById("message");

    if (message) {
      message.textContent = text;
    } else {
      console.log(text);
    }

  }


  // ========================================
  // REGISTER
  // ========================================

  const registerForm =
    document.getElementById("registerForm");

  if (registerForm) {

    registerForm.addEventListener("submit", async function(event) {

      event.preventDefault();

      const button =
        document.getElementById("registerButton");

      const fullName =
        document.getElementById("fullName").value.trim();

      const email =
        document.getElementById("email").value.trim().toLowerCase();

      const password =
        document.getElementById("password").value;

      const accountType =
        document.getElementById("accountType").value;


      showMessage("");


      // Check fields

      if (
        !fullName ||
        !email ||
        !password ||
        !accountType
      ) {

        showMessage(
          "Please complete all fields."
        );

        return;
      }


      // Check password

      if (password.length < 6) {

        showMessage(
          "Password must be at least 6 characters."
        );

        return;
      }


      button.disabled = true;
      button.textContent = "Creating Account...";


      try {

        const { data, error } =
          await supabaseClient.auth.signUp({

            email: email,

            password: password,

            options: {

              data: {
                full_name: fullName,
                account_type: accountType
              }

            }

          });


        console.log(
          "Registration response:",
          data,
          error
        );


        // Supabase error

        if (error) {

          showMessage(
            error.message
          );

          button.disabled = false;
          button.textContent = "Create Account";

          return;
        }


        // Successful registration

        if (data && data.user) {

          registerForm.style.display = "none";


          const successBox =
            document.getElementById("successBox");


          if (successBox) {

            successBox.style.display = "block";

          } else {

            showMessage(
              "Account created successfully. Please check your email to confirm your account."
            );

          }

          return;
        }


        // Unexpected response

        showMessage(
          "Registration could not be completed. Please try again."
        );

        button.disabled = false;
        button.textContent = "Create Account";


      } catch (error) {

        console.error(
          "Registration error:",
          error
        );

        showMessage(
          "Registration error: " +
          error.message
        );

        button.disabled = false;
        button.textContent = "Create Account";

      }

    });

  }



  // ========================================
  // LOGIN
  // ========================================
  
document.getElementById("loginForm").addEventListener("submit", async function(event) {

  event.preventDefault();

  const email = document.getElementById("loginEmail").value.trim().toLowerCase();
  const password = document.getElementById("loginPassword").value;
  const button = document.getElementById("loginButton");

  button.disabled = true;
  button.textContent = "Logging in...";

  const { error } = await supabaseClient.auth.signInWithPassword({
    email: email,
    password: password
  });

  if (error) {
    alert(error.message);
    button.disabled = false;
    button.textContent = "Login";
    return;
  }

  window.location.href = "dashboard.html";

});

  }



  // ========================================
// FORGOT PASSWORD
// ========================================

const forgotButton = document.getElementById("forgotPassword");

if (forgotButton) {

  forgotButton.addEventListener("click", async function(event) {

    event.preventDefault();

    const email = prompt("Enter your registered email:");

    if (!email) return;

    try {

      forgotButton.textContent = "Sending...";
      forgotButton.style.pointerEvents = "none";

      const { error } =
        await supabaseClient.auth.resetPasswordForEmail(
          email.trim().toLowerCase(),
          {
            redirectTo:
              window.location.origin + "/reset-password.html"
          }
        );

      if (error) {
        alert(error.message);
        return;
      }

      alert("Password reset link sent. Please check your email.");

    } catch (error) {

      console.error("Password reset error:", error);
      alert("Password reset error: " + error.message);

    } finally {

      forgotButton.textContent = "Forgot Password?";
      forgotButton.style.pointerEvents = "auto";

    }

  });

}



  // ========================================
  // LOGOUT
  // ========================================

  window.logoutUser = async function() {

    try {

      await supabaseClient.auth.signOut();

    } catch (error) {

      console.error(
        "Logout error:",
        error
      );

    }

    window.location.href =
      "login.html";

  };


  // ========================================
  // CHECK LOGIN
  // ========================================

  window.requireLogin = async function() {

    const { data } =
      await supabaseClient.auth.getSession();


    if (!data.session) {

      window.location.href =
        "login.html";

    }

  };

              }
