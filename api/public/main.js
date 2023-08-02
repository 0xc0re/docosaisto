$(document).ready(function () {
  function generateAudio() {
    var text = $('#text-input').val();

    if (!text) {
      alert('Please enter some text.');
      return;
    }

    $('#spinner-overlay').css('display', 'flex'); // Show spinner overlay with flex

    fetch('/generate/audio', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: text }),
    })
      .then((response) => response.blob())
      .then((blob) => {
        var url = window.URL.createObjectURL(blob);
        $('#audio-player').attr('src', url);
        $('#audio-player')[0].play();
        $('#spinner-overlay').hide(); // Hide spinner overlay
      })
      .catch((error) => {
        alert('An error occurred. Please try again.');
        console.error(error);
        $('#spinner-overlay').hide(); // Hide spinner overlay
      });
  }

  $('#generate-button').click(generateAudio);

  $('#text-input').keypress(function (e) {
    if (e.which === 13) {
      generateAudio();
    }
  });
});
