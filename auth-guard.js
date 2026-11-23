import { auth } from "./firebase-client.js";
import { signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

async function allowAccess(user) {
  if (!user.emailVerified) {
    await signOut(auth);
    window.location.replace("./login.html");
    return;
  }

  try {
    const token = await user.getIdToken();
    const response = await fetch("/api/bootstrap-user", {
      method: "POST",
      headers: { Authorization: "Bearer " + token }
    });
    if (!response.ok) throw new Error("Account setup failed");
    await user.getIdToken(true);

    document.documentElement.classList.add("authenticated");
    const logout = document.getElementById("logoutBtn");
    if (logout) {
      logout.addEventListener("click", async () => {
        logout.disabled = true;
        try {
          await signOut(auth);
          window.location.replace("./login.html");
        } catch {
          alert("Could not log out. Please try again.");
          logout.disabled = false;
        }
      });
    }
  } catch (error) {
    console.error("Authentication setup failed:", error);
    await signOut(auth);
    window.location.replace("./login.html");
  }
}

onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.replace("./login.html");
    return;
  }
  allowAccess(user);
});
