
// RHODVICK TECH - Website JavaScript

document.addEventListener("DOMContentLoaded", () => {

  // Automatically update copyright year
  const year = document.getElementById("year");

  if (year) {
    year.textContent = new Date().getFullYear();
  }

  // RHODVICK TECH poster showcase: one poster every 15 seconds
  const posterTrack = document.getElementById("posterTrack");
  const posterCounter = document.getElementById("posterCounter");
  const posterProgress = document.getElementById("posterProgress");

  if (posterTrack) {
    const posterSlides = posterTrack.querySelectorAll(".poster-slide");
    const totalPosters = posterSlides.length;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let currentPoster = 0;

    const showPoster = (index) => {
      currentPoster = index;
      posterTrack.style.transform = `translateX(-${currentPoster * 100}%)`;
      if (posterCounter) {
        posterCounter.textContent = `${String(currentPoster + 1).padStart(2, "0")} / ${String(totalPosters).padStart(2, "0")}`;
      }
      if (posterProgress) {
        posterProgress.classList.remove("playing");
        void posterProgress.offsetWidth;
        posterProgress.classList.add("playing");
      }
    };

    showPoster(0);
    if (totalPosters > 1 && !reducedMotion) {
      window.setInterval(() => {
        showPoster((currentPoster + 1) % totalPosters);
      }, 15000);
    }
  }


});
