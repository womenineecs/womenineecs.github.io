const maxEvents = 6;

// ── EVENTS GOOGLE SHEET CONFIG ──────────────────────────────────────────────
const EVENTS_SHEET_ID = '1oswsn0whV1fhBSokfH0ECoEmd7Fl-70bTr6rMD3lmz0';

const EVENTS_SHEET_URL = EVENTS_SHEET_ID
  ? `https://docs.google.com/spreadsheets/d/${EVENTS_SHEET_ID}/gviz/tq?tqx=out:json`
  : '';

// Load events: Google Sheet (if configured) + local data
if (EVENTS_SHEET_URL) {
  loadEventsFromGoogleSheets();
} else {
  populateEvents(EVENTS_DATA.events);
}


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

populateSponsors(SPONSORS_DATA.sponsors);

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
    let html = "";
  
    for (const event of upcomingEvents) {
      try {
        html += createEventCard(event);
      } catch (err) {
        console.warn("Error with event, skipping:", event, err);
        continue;
      }
    }
  
    upcomingContainer.innerHTML =
      html ||
      '<div class="col-12"><p class="sans" style="text-align: center; padding: 20px; font-size: 1.4em; line-height: 1.8; color: #555; font-weight: 400;">No upcoming events at this time. Check back soon!</p></div>';
  }  

  // Populate past events
  const pastContainer = document.querySelector("#past-events .row");
  if (pastContainer) {
    let html = "";
  
    for (const event of pastEvents) {
      try {
        html += createEventCard(event);
      } catch (err) {
        console.error("Error creating past event card, skipping:", event, err);
        continue; // move to the next event
      }
    }
  
    pastContainer.innerHTML = html || `
      <div class="col-12">
        <p class="sans" style="text-align: center; padding: 20px; font-size: 1.4em; line-height: 1.8; color: #555; font-weight: 400;">
          No past events available.
        </p>
      </div>
    `;
  }
}

function createEventCard(event) {
  const isAllYears = event.allYears || (!event.date && !event.startDate);

  // Build time tag
  let timeTag = '';
  if (!isAllYears) {
    if (event.startDate && event.endDate) {
      timeTag = `<span class="tag time-tag"><i class="fa fa-calendar"></i> ${event.startDate} – ${event.endDate}</span>`;
    } else if (event.date) {
      const formattedDate = formatDisplayDate(event.date);
      timeTag = `<span class="tag time-tag"><i class="fa fa-calendar"></i> ${formattedDate}</span>`;
    }
  }

  // Build location tag
  const locationTag = event.location
    ? `<span class="tag location-tag"><i class="fa fa-map-marker"></i> ${event.location}</span>`
    : '';

  // Build all years tag
  const allYearsTag = isAllYears
    ? `<span class="tag all-years-tag"><i class="fa fa-star"></i> All Years</span>`
    : '';

  // Build calendar button (only for events with specific dates)
  let calendarBtn = '';
  if (!isAllYears && event.date) {
    const calendarUrl = createGoogleCalendarUrl(event);
    calendarBtn = `
      <a href="${calendarUrl}" target="_blank" class="add-to-calendar-btn">
        <i class="fa fa-calendar-plus-o"></i> Add to Google Calendar
      </a>`;
  }

  return `
    <div class="col-sm-6 col-md-4">
      <div class="thumbnail">
        <div class="img-wrapper">
          <a class="lightbox" href="${event.image}">
            <img referrerPolicy="no-referrer" src="${event.image}"
                 alt="${event.title}"
                 decoding="async" />
          </a>
          <div class="overlay">
            <div class="text">${event.title}</div>
          </div>
        </div>
        <div class="card-meta">
          <div class="card-tags">
            ${timeTag}${locationTag}${allYearsTag}
          </div>
          ${calendarBtn}
        </div>
      </div>
    </div>
  `;
}

function formatDisplayDate(dateStr) {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
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

// ── EVENTS GOOGLE SHEET LOADER (gviz — same method as Career Board) ─────────
let ECOL = {};

function buildEventColumnMap(cols) {
  ECOL = {};
  cols.forEach((c, i) => {
    const label = (c.label || '').toLowerCase().trim();
    if (label.includes('timestamp'))           ECOL.timestamp = i;
    else if (label.includes('event title'))    ECOL.title     = i;
    else if (label.includes('event date'))     ECOL.date      = i;
    else if (label.includes('location'))       ECOL.location  = i;
    else if (label.includes('image'))          ECOL.image     = i;
  });
}

function getEventVal(cells, idx) {
  if (idx === undefined || !cells[idx]) return '';
  const v = cells[idx].v;
  if (v === null || v === undefined) return '';
  return String(v).trim();
}

function getEventDate(cells, idx) {
  if (idx === undefined || !cells[idx]) return '';
  const c = cells[idx];
  if (c.f) return c.f;
  if (c.v) return String(c.v).trim();
  return '';
}

function driveImgEvent(raw) {
  if (!raw) return '';
  raw = raw.trim();
  if (/\.(jpg|jpeg|png|gif|webp|svg)(\?|$)/i.test(raw)) return raw;
  let m = raw.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (m) return `https://lh3.googleusercontent.com/d/${m[1]}`;
  m = raw.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (m) return `https://lh3.googleusercontent.com/d/${m[1]}`;
  return raw;
}

function parseGvizEvents(txt) {
  const m = txt.match(/google\.visualization\.Query\.setResponse\((.+)\);?\s*$/s);
  if (!m) throw new Error('Could not parse sheet response');
  const d = JSON.parse(m[1]);
  if (d.status === 'error') throw new Error(d.errors?.[0]?.message || 'Sheet error');
  if (d.table?.cols) buildEventColumnMap(d.table.cols);
  return (d.table?.rows || [])
    .filter(r => r.c && r.c[ECOL.title] && r.c[ECOL.title].v)
    .map(r => ({
      title:    getEventVal(r.c, ECOL.title),
      date:     getEventDate(r.c, ECOL.date),
      location: getEventVal(r.c, ECOL.location),
      image:    driveImgEvent(getEventVal(r.c, ECOL.image)),
    }));
}

async function loadEventsFromGoogleSheets() {
  try {
    const res = await fetch(EVENTS_SHEET_URL);
    const txt = await res.text();
    const sheetEvents = parseGvizEvents(txt);
    populateEvents([...EVENTS_DATA.events, ...sheetEvents]);
  } catch (e) {
    console.error('Events sheet load error:', e);
    populateEvents(EVENTS_DATA.events);
  }
}
