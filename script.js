
// RHODVICK TECH - Website JavaScript

document.addEventListener("DOMContentLoaded", () => {

  // Automatically update copyright year
  const year = document.getElementById("year");

  if (year) {
    year.textContent = new Date().getFullYear();
  }

});
