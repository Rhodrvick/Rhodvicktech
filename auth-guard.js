import { supabase } from "./auth-client.js";

const { data: { session }, error } = await supabase.auth.getSession();

if (error || !session) {
  window.location.replace("./login.html");
} else {
  document.documentElement.classList.add("authenticated");
  const logout = document.getElementById("logoutBtn");
  if (logout) {
    logout.addEventListener("click", async () => {
      logout.disabled = true;
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) {
        alert("Could not log out. Please try again.");
        logout.disabled = false;
        return;
      }
      window.location.replace("./login.html");
    });
  }
}
