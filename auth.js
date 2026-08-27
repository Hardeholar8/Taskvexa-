// ==========================================
// TASKVEXA AUTHENTICATION
// Registration + Login + Forgot Password
// Role-based Dashboard Routing
// ==========================================

const SUPABASE_URL =
  "https://dxtlnrthlpdaobnbazny.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_UUFlTjQiT3osVMRNFYiNuA_UukQ-9kY";

// ------------------------------------------
// START SUPABASE
// ------------------------------------------

if (!window.supabase) {

  console.error("Supabase library did not load.");

} else {

  const supabaseClient =
    window.supabase.createClient(
      SUPABASE_URL,
      SUPABASE_KEY
    );


  // ========================================
  // HELPER: SHOW MESSAGE
  // ========================================

  function showMessage(text) {

    const message =
      document.getElementById("message");

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

    registerForm.addEventListener(
      "submit",
      async function(event) {

        event.preventDefault();

        const button =
          document.getElementById(
            "registerButton"
          );

        const fullName =
          document.getElementById(
            "fullName"
          ).value.trim();

        const email =
          document.getElementById(
            "email"
          ).value.trim().toLowerCase();

        const password =
          document.getElementById(
            "password"
          ).value;

        const accountType =
          document.getElementById(
            "accountType"
          ).value;


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


        if (password.length < 6) {

          showMessage(
            "Password must be at least 6 characters."
          );

          return;

        }


        if (button) {

          button.disabled = true;

          button.textContent =
            "Creating Account...";

        }


        try {

          const {
            data,
            error
          } =
            await supabaseClient.auth.signUp({

              email: email,

              password: password,

              options: {

                data: {

                  full_name:
                    fullName,

                  account_type:
                    accountType

                }

              }

            });


          console.log(
            "Registration response:",
            data,
            error
          );


          if (error) {

            showMessage(
              error.message
            );


            if (button) {

              button.disabled =
                false;

              button.textContent =
                "Create Account";

            }

            return;

          }


          if (
            data &&
            data.user
          ) {

            registerForm.style.display =
              "none";


            const successBox =
              document.getElementById(
                "successBox"
              );


            if (successBox) {

              successBox.style.display =
                "block";

            } else {

              showMessage(
                "Account created successfully."
              );

            }

            return;

          }


          showMessage(
            "Registration could not be completed. Please try again."
          );


          if (button) {

            button.disabled =
              false;

            button.textContent =
              "Create Account";

          }


        } catch (error) {

          console.error(
            "Registration error:",
            error
          );


          showMessage(
            "Registration error: " +
            error.message
          );


          if (button) {

            button.disabled =
              false;

            button.textContent =
              "Create Account";

          }

        }

      }
    );

  }


  // ========================================
  // LOGIN
  // ========================================

  const loginForm =
    document.getElementById(
      "loginForm"
    );


  if (loginForm) {

    loginForm.addEventListener(
      "submit",
      async function(event) {

        event.preventDefault();


        const email =
          document.getElementById(
            "loginEmail"
          ).value.trim().toLowerCase();


        const password =
          document.getElementById(
            "loginPassword"
          ).value;


        const button =
          document.getElementById(
            "loginButton"
          );


        if (button) {

          button.disabled =
            true;

          button.textContent =
            "Logging in...";

        }


        try {

          // --------------------------------
          // SIGN IN
          // --------------------------------

          const {
            data,
            error
          } =
            await supabaseClient.auth
              .signInWithPassword({

                email:
                  email,

                password:
                  password

              });


          if (error) {

            showMessage(
              error.message
            );


            if (button) {

              button.disabled =
                false;

              button.textContent =
                "Login";

            }

            return;

          }


          if (
            !data ||
            !data.user
          ) {

            throw new Error(
              "Login could not be completed."
            );

          }


          // --------------------------------
          // GET USER PROFILE
          // --------------------------------

          const {
            data: profile,
            error: profileError
          } =
            await supabaseClient
              .from("profiles")
              .select("role")
              .eq(
                "id",
                data.user.id
              )
              .maybeSingle();


          if (profileError) {

            console.error(
              "PROFILE ERROR:",
              profileError
            );

            await supabaseClient.auth
              .signOut();

            throw profileError;

          }


          if (!profile) {

            await supabaseClient.auth
              .signOut();

            showMessage(
              "Account profile not found. Please contact support."
            );


            if (button) {

              button.disabled =
                false;

              button.textContent =
                "Login";

            }

            return;

          }


          // --------------------------------
          // ROLE-BASED REDIRECT
          // --------------------------------

          const role =
            String(
              profile.role || ""
            ).toLowerCase();


          console.log(
            "Logged in role:",
            role
          );


          // PROMOTER
          if (
            role ===
            "promoter"
          ) {

            window.location.href =
              "promoter-dashboard.html";

            return;

          }


          // ADMIN
          if (
            role ===
            "admin"
          ) {

            window.location.href =
              "admin.html";

            return;

          }


          // WORKER
          if (
            role ===
            "worker"
          ) {

            window.location.href =
              "dashboard.html";

            return;

          }


          // UNKNOWN ROLE
          await supabaseClient.auth
            .signOut();


          showMessage(
            "Your account type is not recognized. Please contact support."
          );


          if (button) {

            button.disabled =
              false;

            button.textContent =
              "Login";

          }


        } catch (error) {

          console.error(
            "Login error:",
            error
          );


          showMessage(
            "Login error: " +
            error.message
          );


          if (button) {

            button.disabled =
              false;

            button.textContent =
              "Login";

          }

        }

      }
    );

  }


  // ========================================
  // FORGOT PASSWORD
  // ========================================

  const forgotButton =
    document.getElementById(
      "forgotPassword"
    );


  if (forgotButton) {

    forgotButton.addEventListener(
      "click",
      async function(event) {

        event.preventDefault();


        const email =
          prompt(
            "Enter your registered email:"
          );


        if (!email) {

          return;

        }


        try {

          forgotButton.disabled =
            true;

          forgotButton.textContent =
            "Sending...";


          const {
            error
          } =
            await supabaseClient.auth
              .resetPasswordForEmail(

                email
                  .trim()
                  .toLowerCase(),

                {

                  redirectTo:
                    window.location.origin +
                    "/reset-password.html"

                }

              );


          if (error) {

            showMessage(
              error.message
            );

            return;

          }


          showMessage(
            "Password reset link sent. Please check your email."
          );


        } catch (error) {

          console.error(
            "Password reset error:",
            error
          );


          showMessage(
            "Password reset error: " +
            error.message
          );


        } finally {

          forgotButton.disabled =
            false;

          forgotButton.textContent =
            "Forgot Password?";

        }

      }
    );

  }


  // ========================================
  // LOGOUT
  // ========================================

  window.logoutUser =
    async function() {

      try {

        await supabaseClient.auth
          .signOut();

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

  window.requireLogin =
    async function() {

      const {
        data
      } =
        await supabaseClient.auth
          .getSession();


      if (
        !data.session
      ) {

        window.location.href =
          "login.html";

        return false;

      }


      return true;

    };


  // ========================================
  // GET CURRENT USER ROLE
  // ========================================

  window.getCurrentUserRole =
    async function() {

      try {

        const {
          data: {
            user
          }
        } =
          await supabaseClient.auth
            .getUser();


        if (!user) {

          return null;

        }


        const {
          data: profile,
          error
        } =
          await supabaseClient
            .from("profiles")
            .select("role")
            .eq(
              "id",
              user.id
            )
            .maybeSingle();


        if (error) {

          console.error(
            "ROLE CHECK ERROR:",
            error
          );

          return null;

        }


        return profile
          ? profile.role
          : null;


      } catch (error) {

        console.error(
          "GET ROLE ERROR:",
          error
        );

        return null;

      }

    };

}
