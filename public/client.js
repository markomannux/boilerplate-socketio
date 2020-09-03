$( document ).ready(function() {
  

  /*global io*/
  var socket = io();
  
  socket.on('user', function(data) {
    console.log(data);
    $('#num-users').text(`${data.currentUsers} users online`)
    let message = data.name;
    if (data.connected) {
      message += ' has joined the chat.';
    } else {
      message += ' has left the chat.'
    }

    $('#messages').append($('<li>').text('<b>' + message + '<\/b>'));
  });

  socket.on('chat message', function(message) {
    $('#messages').append($('<li>').text(`${message.name}: ${message.message}`));
  });
   
  // Form submittion with new message in field with id 'm'
  $('form').submit(function(){
    var messageToSend = $('#m').val();
    socket.emit('chat message', messageToSend);
    $('#m').val('');
    return false; // prevent form submit from refreshing page
  });
  
  
  
});
