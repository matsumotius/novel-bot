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

  chat.requiredAutoScroll = true;

  chat.autoScrollButton = $('#autoscroll-button');
  chat.autoScrollButton.click(function(e){
    if (chat.requiredAutoScroll) {
      chat.autoScrollButton.text('自動でスクロールする')
    } else {
      chat.autoScrollButton.text('自動スクロールをやめる')
    }
    chat.requiredAutoScroll = !chat.requiredAutoScroll;
  });

  chat.addTimeline = function(dom) {
    chat.latestTimeline.before(dom);
    if (chat.requiredAutoScroll) {
      chat.timeline.scrollTop(chat.timeline.height() + 999999);
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

