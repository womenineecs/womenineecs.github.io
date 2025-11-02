const maxEvents = 6;

populateSponsors(SPONSORS_DATA.sponsors);
populateEvents(EVENTS_DATA.events);
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
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Separate events into upcoming and past
  const upcomingEvents = [];
  const pastEvents = [];

  events.forEach(event => {
    const eventDate = new Date(event.date);
    eventDate.setHours(0, 0, 0, 0);

    if (eventDate >= today) {
      upcomingEvents.push(event);
    } else {
      pastEvents.push(event);
    }
  });

  // Sort upcoming events by date (earliest first)
  upcomingEvents.sort((a, b) => new Date(a.date) - new Date(b.date));

  // Sort past events by date (most recent first)
  pastEvents.sort((a, b) => new Date(b.date) - new Date(a.date));

  // Populate upcoming events
  const upcomingContainer = document.querySelector("#upcoming-events .row");
  if (upcomingContainer) {
    upcomingContainer.innerHTML = upcomingEvents.length > 0
      ? upcomingEvents.map(event => createEventCard(event)).join("")
      : '<div class="col-12"><p class="sans" style="text-align: center; padding: 20px; font-size: 1.4em; line-height: 1.8; color: #555; font-weight: 400;">No upcoming events at this time. Check back soon!</p></div>';
  }

  // Populate past events
  const pastContainer = document.querySelector("#past-events .row");
  if (pastContainer) {
    pastContainer.innerHTML = pastEvents.map(event => createEventCard(event)).join("");
  }
}

function createEventCard(event) {
  const calendarUrl = createGoogleCalendarUrl(event);

  return `
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
          <a href="${calendarUrl}" target="_blank" class="add-to-calendar-btn">
            <i class="fa fa-calendar-plus-o"></i> Add to Google Calendar
          </a>
        </div>
      </div>
    </div>
  `;
}

function createGoogleCalendarUrl(event) {
  const eventDate = new Date(event.date);

  // Format: YYYYMMDD
  const dateStr = eventDate.toISOString().split('T')[0].replace(/-/g, '');

  // Create all-day event (00:00 to 23:59)
  const startDateTime = dateStr;
  const endDateTime = dateStr;

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${startDateTime}/${endDateTime}`,
    details: `WiEECS @ MIT Event: ${event.title}`,
    location: 'MIT',
    ctz: 'America/New_York'
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
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
