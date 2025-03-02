// Move constant outside the event listener
const maxEvents = 6;

// Ensure MDB initialization happens after DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  // Initialize MDB components if needed
  if (typeof mdb !== "undefined") {
    mdb.init();
  }

  // ... existing code ...
  Promise.all([
    fetch("./data/sponsors.json").then((response) => response.json()),
    fetch("./data/events.json").then((response) => response.json()),
    fetch("./data/people.json").then((response) => response.json()),
  ])
    .then(([sponsorsData, eventsData, peopleData]) => {
      populateSponsors(sponsorsData.sponsors);
      populateEvents(eventsData.events.slice(0, maxEvents));
      populateExecutives(peopleData.executives);
    })
    .catch((error) => console.error("Error loading data:", error));
});
