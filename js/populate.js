const maxEvents = 6;

// Google Sheets CSV URL - replace with your published sheet URL
const GOOGLE_SHEETS_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vSCj2n9VNPuirjkT8gbPdlDZC0HAMszyipQlcu7k5-wNV0tVjOSnlleY9YhMc5-2jA8_eAUgJ_prFXq/pub?output=csv"; // Add your Google Sheets CSV URL here

populateSponsors(SPONSORS_DATA.sponsors);

// Load events from both local data and Google Sheets
if (GOOGLE_SHEETS_CSV_URL) {
  loadEventsFromGoogleSheets();
} else {
  // Only local events if no Google Sheets URL
  populateEvents(EVENTS_DATA.events);
}

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

  events.forEach((event) => {
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
    upcomingContainer.innerHTML =
      upcomingEvents.length > 0
        ? upcomingEvents.map((event) => createEventCard(event)).join("")
        : '<div class="col-12"><p class="sans" style="text-align: center; padding: 20px; font-size: 1.4em; line-height: 1.8; color: #555; font-weight: 400;">No upcoming events at this time. Check back soon!</p></div>';
  }

  // Populate past events
  const pastContainer = document.querySelector("#past-events .row");
  if (pastContainer) {
    pastContainer.innerHTML = pastEvents
      .map((event) => createEventCard(event))
      .join("");
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
  const dateStr = eventDate.toISOString().split("T")[0].replace(/-/g, "");

  // Create all-day event (00:00 to 23:59)
  const startDateTime = dateStr;
  const endDateTime = dateStr;

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${startDateTime}/${endDateTime}`,
    details: `WiEECS @ MIT Event: ${event.title}`,
    location: "MIT",
    ctz: "America/New_York",
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

// Load events from Google Sheets and combine with local data
async function loadEventsFromGoogleSheets() {
  try {
    const response = await fetch(GOOGLE_SHEETS_CSV_URL);
    const csvText = await response.text();
    const googleSheetEvents = parseCSVToEvents(csvText);

    // Google Sheets events are added to the end of the local events
    const allEvents = [...EVENTS_DATA.events, ...googleSheetEvents];

    populateEvents(allEvents);
  } catch (error) {
    // Fallback to local data only
    populateEvents(EVENTS_DATA.events);
  }
}

// Parse CSV to events array
function parseCSVToEvents(csv) {
  const lines = csv.split("\n");
  const events = [];

  // Skip header row (index 0) and start from index 1
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Split by comma, but handle quoted fields
    const fields = parseCSVLine(line);

    if (fields.length >= 3) {
      // Assuming columns: Timestamp, Title, Date, Image URL/Drive URL
      // Adjust indices based on your form structure
      const imageUrl = fields[3].trim();

      events.push({
        title: fields[1].trim(), // Column B: Event Title
        date: formatDate(fields[2].trim()), // Column C: Event Date
        image: convertGoogleDriveUrl(imageUrl), // Column D: Image (convert if Google Drive)
      });
    }
  }

  return events;
}

// Convert Google Drive URL to direct image URL
function convertGoogleDriveUrl(url) {
  if (!url) return "";

  // If it's already a local path, return as-is
  if (url.startsWith("public/")) {
    return url;
  }

  // Handle Google Drive URLs
  // Format 1: https://drive.google.com/open?id=FILE_ID
  // Format 2: https://drive.google.com/file/d/FILE_ID/view
  // Format 3: https://drive.google.com/uc?id=FILE_ID

  let fileId = "";

  // Extract file ID from various Google Drive URL formats
  if (url.includes("drive.google.com")) {
    // Format 1: ?id=FILE_ID (most common from Forms)
    const idMatch = url.match(/[?&]id=([^&]+)/);
    if (idMatch) {
      fileId = idMatch[1];
    }

    // Format 2: /d/FILE_ID/ (if not found yet)
    if (!fileId) {
      const dMatch = url.match(/\/d\/([^/]+)/);
      if (dMatch) {
        fileId = dMatch[1];
      }
    }
  }

  // Convert to direct image URL if we found a file ID
  if (fileId) {
    const directUrl = `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
    console.log(`Converted Drive URL to direct image: ${directUrl}`);
    return directUrl;
  }

  // Return original URL if not a Drive URL
  console.log(`Using original URL (not Drive): ${url}`);
  return url;
}

// Parse a single CSV line handling quoted fields
function parseCSVLine(line) {
  const fields = [];
  let currentField = "";
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      insideQuotes = !insideQuotes;
    } else if (char === "," && !insideQuotes) {
      fields.push(currentField);
      currentField = "";
    } else {
      currentField += char;
    }
  }
  fields.push(currentField); // Add the last field

  return fields;
}

// Format date from Google Sheets format to MM/DD/YYYY
function formatDate(dateString) {
  // Handle various date formats
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return dateString; // Return as-is if not parseable
  }

  const month = date.getMonth() + 1;
  const day = date.getDate();
  const year = date.getFullYear();

  return `${month}/${day}/${year}`;
}
