// Show upcoming events alert on home page
document.addEventListener("DOMContentLoaded", () => {
  showUpcomingEventsAlert();
  initMobileMenu();
  initExecSection();
  initAlumniSection();
});

/* =========================
   Utility: HTML escaping
========================= */

function escapeHtml(str) {
  if (str == null) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeAttribute(str) {
  return escapeHtml(str);
}

/* =========================
   Upcoming Events Alert
========================= */

function showUpcomingEventsAlert() {
  const alertDiv = document.getElementById("upcoming-events-alert");
  if (!alertDiv) return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingEvents = EVENTS_DATA.events
    .filter((event) => {
      const eventDate = new Date(event.date);
      eventDate.setHours(0, 0, 0, 0);
      return eventDate >= today;
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  if (upcomingEvents.length > 0) {
    const alertText = document.getElementById("alert-text");
    const nextEvent = upcomingEvents[0];
    if (upcomingEvents.length === 1) {
      alertText.textContent = `Upcoming Event: ${nextEvent.title} on ${nextEvent.date}`;
    } else {
      alertText.textContent = `${upcomingEvents.length} Upcoming Events! Next: ${nextEvent.title} on ${nextEvent.date}`;
    }
    alertDiv.style.display = "block";
  }
}

/* =========================
   Mobile Menu
========================= */

function initMobileMenu() {
  const mobileToggle = document.querySelector(".mobile-menu-toggle");
  const menu = document.querySelector("#navbar .menu");

  if (mobileToggle && menu) {
    mobileToggle.addEventListener("click", () => {
      const isOpen = menu.classList.toggle("mobile-open");
      const icon = mobileToggle.querySelector("i");
      icon.className = isOpen ? "fa fa-times" : "fa fa-bars";
    });

    document.querySelectorAll("#navbar .menu .item").forEach((item) => {
      item.addEventListener("click", () => {
        menu.classList.remove("mobile-open");
        const icon = mobileToggle.querySelector("i");
        icon.className = "fa fa-bars";
      });
    });
  }
}

/* =========================
   Executive Board
========================= */

// Lower number = shown first. Unknown roles fall to 99.
function execRolePriority(role) {
  const r = (role || "").toLowerCase();
  if (r.includes("president")) return 0;   // catches both "President" and "Co-President"
  if (r.includes("treasurer")) return 1;
  return 99;
}

function initExecSection() {
  const container = document.getElementById("exec-container");
  if (!container) return;
  if (typeof PEOPLE_DATA === "undefined" || !PEOPLE_DATA.executives) return;

  const executives = PEOPLE_DATA.executives;
  if (!executives.length) return;

  // Stable-sort into tiers: Presidents → Treasurer → Everyone else
  const presidents = executives.filter((p) => execRolePriority(p.role) === 0);
  const treasurers = executives.filter((p) => execRolePriority(p.role) === 1);
  const rest       = executives.filter((p) => execRolePriority(p.role) === 99);

  container.innerHTML = "";

  // Presidents row — up to 2, large cards, centered
  if (presidents.length) {
    const row = document.createElement("div");
    row.className = "row justify-content-center mb-4";
    presidents.forEach((p) => {
      row.appendChild(createExecCol(p, "col-10 col-sm-8 col-md-5 exec-member mb-4", "95%", "400px"));
    });
    container.appendChild(row);
  }

  // Treasurer row — centered, slightly smaller
  if (treasurers.length) {
    const row = document.createElement("div");
    row.className = "row justify-content-center mb-4";
    treasurers.forEach((p) => {
      row.appendChild(createExecCol(p, "col-10 col-sm-8 col-md-4 exec-member mb-4", "90%", "360px"));
    });
    container.appendChild(row);
  }

  // Everyone else — 2 cols on mobile, 3 on desktop
  for (let i = 0; i < rest.length; i += 3) {
    const row = document.createElement("div");
    row.className = "row justify-content-center mb-4";
    rest.slice(i, i + 3).forEach((p) => {
      row.appendChild(createExecCol(p, "col-6 col-sm-6 col-md-4 exec-member mb-3", "90%", "320px"));
    });
    container.appendChild(row);
  }

  // Modal trigger
  $(document).on("click", ".exec-card", function() {
    const name   = $(this).data("name");
    const role   = $(this).data("role");
    const image  = $(this).data("image");
    const person = PEOPLE_DATA.executives.find((p) => p.name === name);

    $("#execModalName").text(name);
    $("#execModalRole").text(role);
    $("#execModalImage").attr("src", image);
    $("#execModalBio").text(person && person.bio ? person.bio : "Bio coming soon!");

    if (person && person.linkedin && person.linkedin.trim()) {
      $("#execModalLinkedIn").attr("href", person.linkedin).show();
    } else {
      $("#execModalLinkedIn").hide();
    }

    if (person && person.email && person.email.trim()) {
      const email = person.email.trim();
      $("#execModalEmail").off("click").on("click", function(e) {
        e.preventDefault();
        navigator.clipboard.writeText(email).then(() => {
          showCopiedNotif();
        }).catch((err) => console.error("Clipboard copy failed", err));
      }).show();
    } else {
      $("#execModalEmail").hide();
    }

    $("#execModal").modal("show");
  });
}

function createExecCol(person, colClass, imgWidth, imgMaxWidth) {
  const col = document.createElement("div");
  col.className = colClass;
  col.innerHTML = `
    <div class="exec-card"
         data-name="${escapeAttribute(person.name)}"
         data-role="${escapeAttribute(person.role)}"
         data-image="${escapeAttribute(person.image || "")}">
      ${person.image
        ? `<img src="${escapeAttribute(person.image)}"
               class="img-fluid mb-3 shadow exec-card-img"
               style="width:${imgWidth};max-width:${imgMaxWidth};"
               loading="lazy"
               decoding="async"
               fetchpriority="low"
               alt="${escapeAttribute(person.name || "Executive")}">`
        : `<div class="exec-placeholder-img mb-3" style="width:${imgWidth};max-width:${imgMaxWidth};"><i class="fa fa-user"></i></div>`
      }
      <h3 class="font-weight-bold">${escapeHtml(person.name || "Executive")}</h3>
      <p class="text-muted">${escapeHtml(person.role || "")}</p>
    </div>`;
  return col;
}

function showCopiedNotif() {
  const notif = $("<div></div>")
    .text("📋 Email copied to clipboard!")
    .css({
      position: "fixed", bottom: "20px", right: "20px",
      background: "#28a745", color: "white", padding: "14px 20px",
      borderRadius: "10px", fontSize: "1rem", fontWeight: "500",
      zIndex: 9999, opacity: 0, transition: "opacity 0.3s",
    }).appendTo("body");
  setTimeout(() => notif.css("opacity", 1), 50);
  setTimeout(() => notif.fadeOut(400, () => notif.remove()), 1500);
}

/* =========================
   Alumni
========================= */

function initAlumniSection() {
  const alumniContainer = document.getElementById("alumni-container");
  if (!alumniContainer || typeof PEOPLE_DATA === "undefined" || !PEOPLE_DATA.alumni) return;

  populateAlumniFilters(PEOPLE_DATA.alumni);
  bindAlumniFilterEvents();
  renderAlumni();
}

function bindAlumniFilterEvents() {
  const searchInput     = document.getElementById("alumni-search");
  const yearFilter      = document.getElementById("alumni-year-filter");
  const committeeFilter = document.getElementById("alumni-committee-filter");

  if (searchInput)     searchInput.addEventListener("input",  renderAlumni);
  if (yearFilter)      yearFilter.addEventListener("change",  renderAlumni);
  if (committeeFilter) committeeFilter.addEventListener("change", renderAlumni);
}

function populateAlumniFilters(alumni) {
  const yearSelect      = document.getElementById("alumni-year-filter");
  const committeeSelect = document.getElementById("alumni-committee-filter");
  if (!yearSelect || !committeeSelect) return;

  const years      = getUniqueYears(alumni);
  const committees = getUniqueCommittees(alumni);

  yearSelect.innerHTML = `<option value="">All years</option>` +
    years.map((y) => `<option value="${escapeAttribute(y)}">${escapeHtml(y)}</option>`).join("");

  committeeSelect.innerHTML = `<option value="">All committees</option>` +
    committees.map((c) => `<option value="${escapeAttribute(c)}">${escapeHtml(c)}</option>`).join("");
}

// Role priority for sorting alumni within a cohort year.
// Mirrors execRolePriority but works from the terms array.
function alumniRolePriority(person) {
  const leadershipOrder = [
    ["president"],        // 0 — catches President and Co-President
    ["treasurer"],        // 1
    ["chair", "director", "lead", "head"],  // 2
  ];
  const terms = person.terms || [];
  let best = 99;
  for (const term of terms) {
    const r = (term.role || "").toLowerCase();
    for (let rank = 0; rank < leadershipOrder.length; rank++) {
      if (leadershipOrder[rank].some((k) => r.includes(k))) {
        best = Math.min(best, rank);
      }
    }
  }
  return best;
}

function renderAlumni() {
  const container = document.getElementById("alumni-container");
  if (!container) return;

  const searchValue       = (document.getElementById("alumni-search")?.value || "").trim().toLowerCase();
  const selectedYear      = document.getElementById("alumni-year-filter")?.value || "";
  const selectedCommittee = document.getElementById("alumni-committee-filter")?.value || "";

  const currentExecNames = new Set((PEOPLE_DATA.executives || []).map((p) => p.name));

  const filtered = (PEOPLE_DATA.alumni || [])
    .filter((person) => !currentExecNames.has(person.name))
    .filter((person) => matchesAlumniFilters(person, {
      search:    searchValue,
      year:      selectedYear,
      committee: selectedCommittee,
    }))
    .sort(comparePeopleByLatestYearThenName);

  if (!filtered.length) {
    container.innerHTML = `<div class="alumni-empty">No alumni match those filters yet.</div>`;
    return;
  }

  const grouped = groupAlumniByLatestYear(filtered);
  const years   = Object.keys(grouped).sort(compareAcademicYearsDesc);

  container.innerHTML = years.map((year, i) => {
    const cards = grouped[year]
      .sort((a, b) => {
        const pa = alumniRolePriority(a);
        const pb = alumniRolePriority(b);
        if (pa !== pb) return pa - pb;
        return a.name.localeCompare(b.name);
      })
      .map(createAlumniCard)
      .join("");

    return `
      <div class="alumni-cohort" style="animation-delay:${i * 0.05}s;">
        <div class="alumni-year-header">
          <span class="alumni-year-label">${escapeHtml(year)}</span>
          <div class="alumni-year-line"></div>
        </div>
        <div class="alumni-grid">${cards}</div>
      </div>`;
  }).join("");

  bindAlumniCardClicks();
}

// Card/modal subtitle: show the most prominent role title only — never the committee name.
// Suppress generic "Executive Board" since it adds no info.
function getDisplayRole(person) {
  const leadershipKeywords = ["president", "co-president", "treasurer", "chair", "director", "lead", "head"];
  const terms = getSortedTerms(person);

  // 1. Prefer a named leadership role
  for (const term of terms) {
    const r = (term.role || "").toLowerCase();
    if (leadershipKeywords.some((k) => r.includes(k))) return term.role;
  }

  // 2. Fall back to latest term's role, but suppress "Executive Board"
  const latestRole = (terms[0]?.role || "").trim();
  if (latestRole.toLowerCase() === "executive board") return "";
  return latestRole;
}

function createAlumniCard(person) {
  const displayRole = getDisplayRole(person);

  const imageHtml = person.image
    ? `<img src="${escapeAttribute(person.image)}"
            class="img-fluid mb-3 shadow alumni-card-img"
            loading="lazy"
            decoding="async"
            fetchpriority="low"
            alt="${escapeAttribute(person.name || "Alumni")}">`
    : `<div class="alumni-placeholder-img mb-3"><i class="fa fa-user"></i></div>`;

  return `
    <div class="alumni-exec-card" data-id="${escapeAttribute(person.id || person.name)}">
      ${imageHtml}
      <h3 class="font-weight-bold">${escapeHtml(person.name || "Alumni")}</h3>
      ${displayRole ? `<p>${escapeHtml(displayRole)}</p>` : ""}
    </div>`;
}

$(document).ready(function () {
  $("#execModal").on("hidden.bs.modal", function () {
    $("#execModalImage").attr("src", "");
  });

  $("#alumniModal").on("hidden.bs.modal", function () {
    $("#alumniModalImage").attr("src", "").hide();
    $("#alumniModalPlaceholder").show();
  });
});

function bindAlumniCardClicks() {
  document.querySelectorAll(".alumni-exec-card").forEach((card) => {
    card.addEventListener("click", function() {
      const personId = this.dataset.id;
      const person   = (PEOPLE_DATA.alumni || []).find((p) => (p.id || p.name) === personId);
      if (!person) return;
      openAlumniModal(person);
    });
  });
}

function openAlumniModal(person) {
  const displayRole = getDisplayRole(person);

  const imgEl         = document.getElementById("alumniModalImage");
  const placeholderEl = document.getElementById("alumniModalPlaceholder");
  if (person.image) {
    imgEl.src = person.image;
    imgEl.style.display = "block";
    if (placeholderEl) placeholderEl.style.display = "none";
  } else {
    imgEl.style.display = "none";
    if (placeholderEl) placeholderEl.style.display = "flex";
  }

  document.getElementById("alumniModalName").textContent = person.name || "";
  document.getElementById("alumniModalRole").textContent = displayRole;
  document.getElementById("alumniModalRole").style.display = displayRole ? "" : "none";
  document.getElementById("alumniModalBio").textContent   = person.bio || "";
  document.getElementById("alumniModalBio").style.display = person.bio ? "" : "none";

  const linkedInEl = document.getElementById("alumniModalLinkedIn");
  const emailEl    = document.getElementById("alumniModalEmail");

  if (person.linkedin && person.linkedin.trim()) {
    linkedInEl.href = person.linkedin;
    linkedInEl.style.display = "";
  } else {
    linkedInEl.style.display = "none";
  }

  if (person.email && person.email.trim()) {
    emailEl.style.display = "";
    emailEl.onclick = function(e) {
      e.preventDefault();
      navigator.clipboard.writeText(person.email.trim()).then(showCopiedNotif);
    };
  } else {
    emailEl.style.display = "none";
  }

  const timelineEl = document.getElementById("alumniModalTimeline");
  const terms = getSortedTerms(person);
  if (terms.length) {
    timelineEl.innerHTML = terms.map((term) => {
      const role       = term.role || "";
      const committee  = term.committee || "";
      const roleL      = role.toLowerCase();
      const committeeL = committee.toLowerCase();

      let label;
      if (!role) {
        // No role — just show committee
        label = committee;
      } else if (committeeL === "executive") {
        // Executive roles: always show "Role · Executive" (e.g. "Co-President · Executive")
        label = `${role} · Executive`;
      } else if (roleL.includes(committeeL)) {
        // Role already names the committee (e.g. "Director of Professional Development"
        // with committee "Professional Development") — role alone is enough
        label = role;
      } else {
        // Role and committee are meaningfully different — show both
        label = `${role} · ${committee}`;
      }

      return `<li>
        <span class="alumni-tl-year">${escapeHtml(term.year)}</span>
        <span class="alumni-tl-role">${escapeHtml(label)}</span>
      </li>`;
    }).join("");
    timelineEl.style.display = "";
  } else {
    timelineEl.innerHTML = "";
    timelineEl.style.display = "none";
  }

  $("#alumniModal").modal("show");
}

function matchesAlumniFilters(person, filters) {
  const matchesSearch    = !filters.search    || person.name.toLowerCase().includes(filters.search);
  const matchesYear      = !filters.year      || person.terms.some((t) => t.year === filters.year);
  const matchesCommittee = !filters.committee || person.terms.some((t) => t.committee === filters.committee);
  return matchesSearch && matchesYear && matchesCommittee;
}

function groupAlumniByLatestYear(alumni) {
  return alumni.reduce((acc, person) => {
    const term = getLatestLeadershipTerm(person) || getLatestTerm(person);
    if (!term) return acc;
    if (!acc[term.year]) acc[term.year] = [];
    acc[term.year].push(person);
    return acc;
  }, {});
}

function getLatestTerm(person) {
  const sorted = getSortedTerms(person);
  return sorted.length ? sorted[0] : null;
}

// Returns the latest term that is Executive or a named leadership role.
// Falls back to null if no such term exists (caller should then use getLatestTerm).
function getLatestLeadershipTerm(person) {
  const leadershipKeywords = ["president", "treasurer", "chair", "director", "lead", "head"];
  const execOrLeadership = getSortedTerms(person).filter((t) => {
    const r = (t.role || "").toLowerCase();
    const c = (t.committee || "").toLowerCase();
    return c === "executive" || leadershipKeywords.some((k) => r.includes(k));
  });
  return execOrLeadership.length ? execOrLeadership[0] : null;
}

function getSortedTerms(person) {
  return [...(person.terms || [])].sort((a, b) => compareAcademicYearsDesc(a.year, b.year));
}

function getYearRange(person) {
  const years = [...new Set((person.terms || []).map((t) => t.year))].sort(compareAcademicYearsAsc);
  if (!years.length) return "";
  if (years.length === 1) return years[0];
  return `${years[0]} – ${years[years.length - 1]}`;
}

function getUniqueYears(alumni) {
  const years = new Set();
  alumni.forEach((p) => (p.terms || []).forEach((t) => { if (t.year) years.add(t.year); }));
  return [...years].sort(compareAcademicYearsDesc);
}

function getUniqueCommittees(alumni) {
  const committees = new Set();
  alumni.forEach((p) => (p.terms || []).forEach((t) => { if (t.committee) committees.add(t.committee); }));
  return [...committees].sort((a, b) => a.localeCompare(b));
}

function comparePeopleByLatestYearThenName(a, b) {
  const termA = getLatestLeadershipTerm(a) || getLatestTerm(a);
  const termB = getLatestLeadershipTerm(b) || getLatestTerm(b);
  const yearCmp = compareAcademicYearsDesc(termA?.year || "", termB?.year || "");
  return yearCmp !== 0 ? yearCmp : a.name.localeCompare(b.name);
}

function compareAcademicYearsDesc(a, b) { return academicYearStart(b) - academicYearStart(a); }
function compareAcademicYearsAsc(a, b)  { return academicYearStart(a) - academicYearStart(b); }

function academicYearStart(year) {
  if (!year) return 0;
  const match = String(year).match(/^(\d{4})/);
  return match ? Number(match[1]) : 0;
}