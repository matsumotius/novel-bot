$(function(){
  var AUTHOR_ID = String(Math.random());
  var chat = nvbt.chat = {};

  chat.socket = io.connect('http://localhost');
  chat.socket.on('message', function(message){
    chat.addMessage(message);
  })
  chat.socket.emit('join', { name : AUTHOR_ID, room : '1' });

  chat.timeline       = $('#timeline'); 
  chat.latestTimeline = $('#latest-timeline');

  chat.inputText = $('#message-input');

  chat.addMessage = function(message) {
    var messageDom = chat.createMessageView(message);
    chat.addTimeline(messageDom);
  };

  chat.addNovelLine = function(message) {
    var novelLineDom = chat.createNovelLineView(message);
    chat.addTimeline(novelLineDom);
  };

  chat.requiredAutoScroll = false;

$('#timeline').scroll(function(e){
  var scrolltop    = chat.timeline.attr('scrollTop');
  var scrollheight = chat.timeline.attr('scrollHeight');
  var windowheight = chat.timeline.attr('clientHeight');
  var scrolloffset = 10;
  chat.requiredAutoScroll = scrolltop >= (scrollheight - (windowheight + scrolloffset));
});

  chat.addTimeline = function(dom) {
    chat.latestTimeline.before(dom);
    if (chat.requiredAutoScroll) {
      chat.timeline.scrollTop(chat.timeline.height());
    } 
  };

  chat.createMessageView = function(message) {
    return $('<p />').append(message.author + ' : ' + message.content);
  };

  chat.createNovelLineView = function(message) {
    return $('<p />').append(message.author + ' : ' + message.content).css({
      'color'       : '#191970',
      'font-weight' : 'bold'
    });
  };

  chat.socket.on('novel-content', function(message) {
    chat.addNovelLine(message);
  }); 

  chat.inputText.smartenter(function() {
    chat.socket.emit('message', { content : chat.inputText.val() });
    chat.inputText.val('');
  });

});

