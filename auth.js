// ==========================================
// TASKVEXA AUTHENTICATION
// Registration + Login + Forgot Password
// Email confirmation OFF
// ==========================================

const SUPABASE_URL =
  "https://dxtlnrthlpdaobnbazny.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_UUFlTjQiT3osVMRNFYiNuA_UukQ-9kY";


// ------------------------------------------
// START SUPABASE
// ------------------------------------------

if (!window.supabase) {

  console.error(
    "Supabase library did not load."
  );

} else {

  const supabaseClient =
    window.supabase.createClient(
      SUPABASE_URL,
      SUPABASE_KEY
    );


  // ========================================
  // SHOW MESSAGE
  // ========================================

  function showMessage(text) {

    const message =
      document.getElementById(
        "message"
      );

    if (message) {

      message.textContent =
        text;

    } else {

      console.log(text);

    }

  }


  // ========================================
  // REGISTER
  // ========================================

  const registerForm =
    document.getElementById(
      "registerForm"
    );


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


        // --------------------------------
        // VALIDATION
        // --------------------------------

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


        if (
          password.length < 6
        ) {

          showMessage(
            "Password must be at least 6 characters."
          );

          return;

        }


        if (
          accountType !== "worker" &&
          accountType !== "promoter"
        ) {

          showMessage(
            "Please select Worker or Promoter."
          );

          return;

        }


        if (button) {

          button.disabled =
            true;

          button.textContent =
            "Creating Account...";

        }


        try {

          // --------------------------------
          // CREATE AUTH ACCOUNT
          // --------------------------------

          const {
            data,
            error
          } =
            await supabaseClient.auth.signUp({

              email:
                email,

              password:
                password,

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
            !data ||
            !data.user
          ) {

            showMessage(
              "Account could not be created. Please try again."
            );

            if (button) {

              button.disabled =
                false;

              button.textContent =
                "Create Account";

            }

            return;

          }


          // --------------------------------
          // EMAIL CONFIRMATION IS OFF
          // --------------------------------
          //
          // The user should have an active
          // session immediately.
          //
          // Send them to the correct dashboard.
          // --------------------------------


          showMessage(
            "Account created successfully."
          );


          if (
            accountType ===
            "promoter"
          ) {

            window.location.href =
              "promoter-dashboard.html";

          } else {

            window.location.href =
              "dashboard.html";

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


        if (!email || !password) {

          showMessage(
            "Please enter your email and password."
          );

          return;

        }


        if (button) {

          button.disabled =
            true;

          button.textContent =
            "Logging in...";

        }


        try {

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


          // --------------------------------
          // CHECK USER ROLE
          // --------------------------------

          const user =
            data.user;


          if (!user) {

            window.location.href =
              "login.html";

            return;

          }


          const {
            data: profile,
            error: profileError
          } =
            await supabaseClient
              .from("profiles")
              .select("role")
              .eq(
                "id",
                user.id
              )
              .maybeSingle();


          if (profileError) {

            console.error(
              "Profile error:",
              profileError
            );

          }


          // --------------------------------
          // SEND TO CORRECT DASHBOARD
          // --------------------------------

          if (
            profile &&
            profile.role ===
            "promoter"
          ) {

            window.location.href =
              "promoter-dashboard.html";

          } else if (
            profile &&
            profile.role ===
            "admin"
          ) {

            window.location.href =
              "admin-dashboard.html";

          } else {

            window.location.href =
              "dashboard.html";

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

      }

    };

          }
