// Move constant outside the event listener
const maxEvents = 6;

// Wait for DOM and resources to be fully loaded
window.addEventListener("load", function () {
  // Initialize MDB components if needed
  if (typeof mdb !== "undefined" && mdb.init) {
    try {
      mdb.init();
    } catch (error) {
      console.warn("MDB initialization failed:", error);
    }
  }

  // Load all JSON data with error handling for each request
  const loadData = async () => {
    try {
      const [sponsorsRes, eventsRes, peopleRes] = await Promise.all([
        fetch("./data/sponsors.json"),
        fetch("./data/events.json"),
        fetch("./data/people.json"),
      ]);

      // Check if responses are ok before parsing
      if (!sponsorsRes.ok)
        throw new Error(`Sponsors data failed to load: ${sponsorsRes.status}`);
      if (!eventsRes.ok)
        throw new Error(`Events data failed to load: ${eventsRes.status}`);
      if (!peopleRes.ok)
        throw new Error(`People data failed to load: ${peopleRes.status}`);

      const sponsorsData = await sponsorsRes.json();
      const eventsData = await eventsRes.json();
      const peopleData = await peopleRes.json();

      // Populate the page sections
      populateSponsors(sponsorsData.sponsors);
      populateEvents(eventsData.events.slice(0, maxEvents));
      populateExecutives(peopleData.executives);
    } catch (error) {
      console.error("Error loading data:", error);
      // Optionally show user-friendly error message on the page
      handleLoadError(error);
    }
  };

  loadData();
});

// Add error handling function
function handleLoadError(error) {
  const sections = ["sponsor-container", "exec-positions"];
  sections.forEach((id) => {
    const container = document.getElementById(id);
    if (container) {
      container.innerHTML = `<div class="error-message">Unable to load content. Please try again later.</div>`;
    }
  });

  const galleryContainer = document.querySelector(".tz-gallery .row");
  if (galleryContainer) {
    galleryContainer.innerHTML = `<div class="error-message">Unable to load events. Please try again later.</div>`;
  }
}
