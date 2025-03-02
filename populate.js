// Move constant outside the event listener
const maxEvents = 6;

// Ensure MDB initialization happens after DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  // Create a function to check for MDB
  const initMDB = () => {
    if (typeof mdb !== "undefined") {
      mdb.init();
    } else {
      // If MDB isn't available yet, try again in 100ms
      setTimeout(initMDB, 100);
    }
  };

  // Start checking for MDB
  initMDB();

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
