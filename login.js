import { auth } from "./firebase-client.js";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  reload,
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

const form = document.getElementById("authForm");
const title = document.getElementById("formTitle");
const intro = document.getElementById("formIntro");
const submit = document.getElementById("submitBtn");
const toggle = document.getElementById("toggleMode");
const forgotPassword = document.getElementById("forgotPassword");
const verificationActions = document.getElementById("verificationActions");
const resendVerification = document.getElementById("resendVerification");
const checkVerification = document.getElementById("checkVerification");
const message = document.getElementById("message");
const emailInput = document.getElementById("email");
const togglePassword = document.getElementById("togglePassword");
const passwordInput = document.getElementById("password");
const signInTab = document.getElementById("signInTab");
let isSignUp = false;
let busy = false;

const showMessage = (text, isError = false) => {
  message.textContent = text;
  message.style.color = isError ? "#ff9c9c" : "#b6ff9f";
};

function showVerificationActions(show = true) {
  verificationActions.style.display = show ? "block" : "none";
}

async function prepareWebsiteAccess(user) {
  const idToken = await user.getIdToken();
  const response = await fetch("/api/bootstrap-user", {
    method: "POST",
    headers: { Authorization: "Bearer " + idToken }
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || "We couldn't finish setting up your secure website access. Please try again.");
  }
  await user.getIdToken(true);
  return true;
}

async function finishLogin(user) {
  if (busy) return;
  busy = true;
  submit.disabled = true;
  showMessage("Securing your account...");
  try {
    await prepareWebsiteAccess(user);
    showMessage("You're in! Opening RHODVICK TECH...");
    window.location.replace("./index.html");
  } catch (error) {
    showMessage(error.message, true);
  } finally {
    busy = false;
    submit.disabled = false;
  }
}

onAuthStateChanged(auth, (user) => {
  if (user?.emailVerified) {
    finishLogin(user);
  } else if (user) {
    showVerificationActions(true);
  }
});

function setAuthMode(signUp) {
  isSignUp = signUp;
  title.textContent = isSignUp ? "Sign Up" : "Sign In";
  intro.textContent = isSignUp
    ? "Create an account to get started."
    : "Welcome back. Sign in to get started.";
  submit.textContent = isSignUp ? "Create Account  →" : "Sign In  →";
  signInTab.classList.toggle("active", !isSignUp);
  toggle.classList.toggle("active", isSignUp);
  document.body.classList.toggle("signup-mode", isSignUp);
  passwordInput.autocomplete = isSignUp ? "new-password" : "current-password";
  forgotPassword.style.display = isSignUp ? "none" : "inline-block";
  showVerificationActions(false);
  showMessage("");
}
signInTab.addEventListener("click", () => setAuthMode(false));
toggle.addEventListener("click", () => setAuthMode(true));

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const email = emailInput.value.trim();
  const password = document.getElementById("password").value;
  submit.disabled = true;
  submit.textContent = isSignUp ? "Creating account..." : "Signing in...";
  showVerificationActions(false);
  showMessage("");

  try {
    if (isSignUp) {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(credential.user);
      isSignUp = false;
      title.textContent = "Check your email.";
      intro.textContent = "Your account is created. Verify your email before accessing the website.";
      signInTab.classList.add("active");
      toggle.classList.remove("active");
      document.body.classList.remove("signup-mode");
      forgotPassword.style.display = "inline-block";
      showVerificationActions(true);
      showMessage("📩 Verification email sent to " + email + ". Open the link in that email, then return and tap “I've verified my email”.");
    } else {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      if (!credential.user.emailVerified) {
        showVerificationActions(true);
        showMessage("Your email isn't verified yet. Check your inbox and Spam folder, then use the buttons below.", true);
      } else {
        await finishLogin(credential.user);
      }
    }
  } catch (error) {
    const messages = {
      "auth/email-already-in-use": "That email already has an account. Try signing in instead.",
      "auth/invalid-credential": "Email or password is incorrect.",
      "auth/weak-password": "Please use a stronger password with at least 6 characters.",
      "auth/invalid-email": "Please enter a valid email address.",
      "auth/too-many-requests": "Too many attempts. Please wait a little and try again."
    };
    showMessage(messages[error.code] || error.message, true);
  } finally {
    submit.disabled = false;
    submit.textContent = isSignUp ? "Create account" : "Sign in";
  }
});

togglePassword.addEventListener("click", () => {
  const showing = passwordInput.type === "text";
  passwordInput.type = showing ? "password" : "text";
  togglePassword.setAttribute("aria-label", showing ? "Show password" : "Hide password");
});

forgotPassword.addEventListener("click", async () => {
  const email = emailInput.value.trim();
  if (!email) {
    showMessage("Enter your email address first, then tap Forgot password again.", true);
    emailInput.focus();
    return;
  }
  try {
    await sendPasswordResetEmail(auth, email);
    showMessage("📩 If an account exists for " + email + ", Firebase has sent a password reset link. Check your inbox and Spam folder.");
  } catch (error) {
    const messages = {
      "auth/invalid-email": "Please enter a valid email address.",
      "auth/too-many-requests": "Too many requests. Please wait a little before trying again."
    };
    showMessage(messages[error.code] || error.message, true);
  }
});

resendVerification.addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user) {
    showMessage("Please sign in with your email and password first so we can resend the verification email.", true);
    return;
  }
  try {
    await sendEmailVerification(user);
    showMessage("📩 A new verification email has been sent. Check your inbox and Spam folder.");
  } catch (error) {
    showMessage(error.message, true);
  }
});

checkVerification.addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user) {
    showMessage("Please sign in again after opening the verification link.", true);
    showVerificationActions(false);
    return;
  }
  try {
    await reload(user);
    if (auth.currentUser.emailVerified) {
      await finishLogin(auth.currentUser);
    } else {
      showMessage("We haven't detected verification yet. Open the email link first, then tap this button again.", true);
    }
  } catch (error) {
    showMessage(error.message, true);
  }
});
