const maxEvents = 6;

populateSponsors(SPONSORS_DATA.sponsors);
populateEvents(EVENTS_DATA.events.slice(0, maxEvents));
populateExecutives(PEOPLE_DATA.executives);

function populateSponsors(sponsors) {
  const tiers = ["gold", "silver", "bronze", "past"];

  tiers.forEach((tier) => {
    const container = document.getElementById(`${tier}-sponsor-container`);
    const heading = document.getElementById(`${tier}-heading`);
    if (!container) return;

    // Filter sponsors for this tier
    const tierSponsors = sponsors.filter((s) => s.tier === tier);

    // Hide both heading + container if empty
    if (tierSponsors.length === 0) {
      if (heading) heading.style.display = "none";
      container.style.display = "none";
      return;
    }

    // Otherwise, populate normally
    container.innerHTML = tierSponsors
      .map(
        (s) => `
        <div class="sponsor">
          <a href="${s.url}" target="_blank">
            <img src="${s.image}" alt="${s.name}" loading="lazy" decoding="async">
          </a>
        </div>
      `
      )
      .join("");
  });
}

document.addEventListener("DOMContentLoaded", () => {
  populateSponsors(SPONSORS_DATA.sponsors);
});

document.addEventListener("DOMContentLoaded", () => {
  populateSponsors(SPONSORS_DATA.sponsors);
});

function populateEvents(events) {
  const galleryContainer = document.querySelector(".tz-gallery .row");
  galleryContainer.innerHTML =
    events
      .map(
        (event) => `
        <div class="col-sm-6 col-md-4">
            <div class="thumbnail">
                <a class="lightbox" href="${event.image}">
                    <img src="${event.image}" alt="${event.title}" decoding="async">
                </a>
                <div class="overlay">
                    <div class="text">${event.title}</div>
                </div>
                <div class="caption">
                    <h3>${event.date}</h3>
                </div>
            </div>
        </div>
    `
      )
      .join("") +
    `
        <div class="col-sm-6 col-md-4">
            <div class="thumbnail">
                <img src="public/images/events/def.png" style="opacity:0;">
                <div class="text more">
                    <a href="https://calendar.google.com/calendar/u/0?cid=MjZhNWJhY2I0MTI0MTc2Zjc5YTRmMWM3NjJiZGUzMjU5MmU2MDU1MmFkNmE4ZTk4NjhiMDIwMTdlMmVkODc5YkBncm91cC5jYWxlbmRhci5nb29nbGUuY29t">...and more!</a>
                </div>
            </div>
        </div>
    `;
}

function populateExecutives(executives) {
  const execContainer = document.getElementById("exec-positions");
  let html = "";

  // Group executives into pairs for rows
  for (let i = 0; i < executives.length; i += 2) {
    html += '<div class="row">';
    html += createExecutiveProfile(executives[i]);
    if (executives[i + 1]) {
      html += createExecutiveProfile(executives[i + 1]);
    }
    html += "</div>";
  }

  execContainer.innerHTML = html;
}

function createExecutiveProfile(executive) {
  return `
        <div class="profile">
            <img src="${executive.image}" decoding="async">
            <div class="name">
                <h2>${executive.name}</h2>
            </div>
            <h3>${executive.role}</h3>
        </div>
    `;
}
