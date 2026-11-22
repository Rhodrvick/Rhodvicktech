import { supabase } from "./auth-client.js";

const form = document.getElementById("authForm");
const title = document.getElementById("formTitle");
const intro = document.getElementById("formIntro");
const submit = document.getElementById("submitBtn");
const toggle = document.getElementById("toggleMode");
const message = document.getElementById("message");
let isSignUp = false;

const showMessage = (text, isError = false) => {
  message.textContent = text;
  message.style.color = isError ? "#ff9c9c" : "#9bdfff";
};

const { data: { session } } = await supabase.auth.getSession();
if (session) window.location.replace("./index.html");

toggle.addEventListener("click", () => {
  isSignUp = !isSignUp;
  title.textContent = isSignUp ? "Create your account." : "Welcome back.";
  intro.textContent = isSignUp
    ? "Create an account to access the RHODVICK TECH website."
    : "Sign in to continue to the RHODVICK TECH website.";
  submit.textContent = isSignUp ? "Create account" : "Sign in";
  toggle.textContent = isSignUp ? "Already registered? Sign in" : "New here? Create an account";
  document.getElementById("password").autocomplete = isSignUp ? "new-password" : "current-password";
  showMessage("");
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  submit.disabled = true;
  submit.textContent = isSignUp ? "Creating account..." : "Signing in...";
  showMessage("");

  const result = isSignUp
    ? await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin + "/index.html" } })
    : await supabase.auth.signInWithPassword({ email, password });

  submit.disabled = false;
  submit.textContent = isSignUp ? "Create account" : "Sign in";

  if (result.error) {
    showMessage(result.error.message, true);
    return;
  }

  if (isSignUp && !result.data.session) {
    showMessage("Account created. Check your email to confirm your address, then sign in here.");
    return;
  }

  showMessage("Success! Opening the website...");
  window.location.replace("./index.html");
});
