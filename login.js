import { auth } from "./firebase-client.js";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithRedirect,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

const form = document.getElementById("authForm");
const title = document.getElementById("formTitle");
const intro = document.getElementById("formIntro");
const submit = document.getElementById("submitBtn");
const toggle = document.getElementById("toggleMode");
const googleButton = document.getElementById("googleBtn");
const message = document.getElementById("message");
let isSignUp = false;
let busy = false;

const showMessage = (text, isError = false) => {
  message.textContent = text;
  message.style.color = isError ? "#ff9c9c" : "#b6ff9f";
};

async function prepareWebsiteAccess(user) {
  if (!user.emailVerified) {
    await signOut(auth);
    showMessage("Please verify your email first. Open the verification link we sent you, then return and sign in.", true);
    return false;
  }

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
  googleButton.disabled = true;
  showMessage("Securing your account...");
  try {
    const ready = await prepareWebsiteAccess(user);
    if (ready) {
      showMessage("You're in! Opening RHODVICK TECH...");
      window.location.replace("./index.html");
    }
  } catch (error) {
    showMessage(error.message, true);
  } finally {
    busy = false;
    submit.disabled = false;
    googleButton.disabled = false;
  }
}

onAuthStateChanged(auth, (user) => {
  if (user && user.emailVerified) finishLogin(user);
});

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
  googleButton.disabled = true;
  submit.textContent = isSignUp ? "Creating account..." : "Signing in...";
  showMessage("");

  try {
    if (isSignUp) {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(credential.user);
      await signOut(auth);
      isSignUp = false;
      title.textContent = "Check your email.";
      intro.textContent = "Your account is created. Verify your email before signing in.";
      submit.textContent = "Sign in";
      toggle.textContent = "New here? Create an account";
      showMessage("📩 Verification email sent to " + email + ". Open it and click the verification link, then come back here to sign in.");
    } else {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      if (!credential.user.emailVerified) {
        await signOut(auth);
        showMessage("Your email isn't verified yet. Check your inbox (and Spam folder), open the Firebase verification email, then sign in again.", true);
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
    googleButton.disabled = false;
    submit.textContent = isSignUp ? "Create account" : "Sign in";
  }
});

googleButton.addEventListener("click", async () => {
  showMessage("Opening Google sign-in...");
  googleButton.disabled = true;
  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    await signInWithRedirect(auth, provider);
  } catch (error) {
    googleButton.disabled = false;
    showMessage(error.message, true);
  }
});
