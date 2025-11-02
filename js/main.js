// // $(document).ready(function() {

// //   var $body = $('html, body');
// //   var $tags = $('#index.html, #goto-facts, #goto-programs, #goto-events, #goto-exec, #goto-sponsors, #goto-resources, #goto-connect');

// //   $tags.click(function(e) {
// //     var elementName = e.target.id.substr(5);
// //     $body.animate({
// //       scrollTop: $('#'+elementName).offset().top - 60
// //     }, 800);
// //   });
// // });

// $(document).ready(function() {
//   $('#navbar .item').click(function(e) {
//     e.preventDefault(); // Prevent default anchor behavior
//     var page = $(this).attr('id');
//     window.location.href = page; // Navigate to the page
//   });
// });

// Show upcoming events alert on home page
document.addEventListener("DOMContentLoaded", () => {
  showUpcomingEventsAlert();
});

function showUpcomingEventsAlert() {
  const alertDiv = document.getElementById('upcoming-events-alert');
  if (!alertDiv) return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Get upcoming events
  const upcomingEvents = EVENTS_DATA.events.filter(event => {
    const eventDate = new Date(event.date);
    eventDate.setHours(0, 0, 0, 0);
    return eventDate >= today;
  }).sort((a, b) => new Date(a.date) - new Date(b.date));

  if (upcomingEvents.length > 0) {
    const alertText = document.getElementById('alert-text');
    const nextEvent = upcomingEvents[0];

    if (upcomingEvents.length === 1) {
      alertText.textContent = `Upcoming Event: ${nextEvent.title} on ${nextEvent.date}`;
    } else {
      alertText.textContent = `${upcomingEvents.length} Upcoming Events! Next: ${nextEvent.title} on ${nextEvent.date}`;
    }

    alertDiv.style.display = 'block';
  }
}
