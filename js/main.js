$(document).ready(function() {

  

  var $body = $('html, body');
  var $tags = $('#goto-mission, #goto-facts, #goto-programs, #goto-events, #goto-exec, #goto-sponsors, #goto-resources, #goto-connect');

  $tags.click(function(e) {
    var elementName = e.target.id.substr(5);
    $body.animate({
      scrollTop: $('#'+elementName).offset().top - 60
    }, 800);
  });
});

