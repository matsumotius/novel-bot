
/**
 * Module dependencies.
 */

var express = require('express');
var routes  = require('novel-bot/routes');
var http    = require('http');
var path    = require('path');
var app     = express();
var scraper = require('novel-bot/service/scraper');
  

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser('novel-bot'));
  app.use(express.session());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/room/:id', routes.chat.room);

var isNotNull = function(obj){
  return obj !== undefined && obj != null;
};
var isNotNullAndHasKey = function(obj, key){
  return (isNotNull(obj) && key in obj && isNotNull(obj[key]));
};
var isNovelCommand = function(str){
  return str.match(/http:\/\/ncode\.syosetu\.com\/n[\d]+.*\/[\d]+[\/]?/i);
};

var server = http.createServer(app);

var io = require('socket.io').listen(server);

io.sockets.on('connection', function(socket) {

  socket.on('message', function(message) {
    if (isNotNullAndHasKey(message, 'content')) {
      socket.get('name', function(error, name) {
        if (!error && name) {
          emitMessageHandler.onGetName(socket, name, message);
        }
      });
    }
  });

  socket.on('join', function(data){
    if (isNotNullAndHasKey(data, 'name') &&
        isNotNullAndHasKey(data, 'room')) {
      socket.join(data.room);
      joinRoomEventHandler.onJoin(socket, data);
    }
  });

});

var novelPlaying = {};

var escapeHTML = function(str) {
  return str ? String(str).replace(/</g, '&lt;').replace(/>/g, '&gt;') : "";
};

var emitMessageHandler = {
  onGetName : function(socket, name, message) {
    socket.get('room', function(error, room) {
      if (!error && room) {
        emitMessageHandler.onGetRoom(socket, name, room, message);
      }
    });
  },
  onGetRoom : function(socket, name, room, message){
    if (isNovelCommand(message.content) && !novelPlaying[room]) {
      novelPlaying[room] = true;
      emitMessageHandler.onLoadCommanded(socket, name, room, message);
      io.sockets.in(room).emit('novel-content', { 
        author  : 'novel-bot',
        content : '小説URLがリクエストされました。まもなく小説が開始されます。'
      });
    } else if (isNovelCommand(message.content)) {
      io.sockets.in(room).emit('novel-content', { 
        author  : 'novel-bot',
        content : '現在別の小説を読み込み中です。終了までお待ちください。'
      });
    } else {
      io.sockets.in(room).emit('message', { 
        author  : '匿名さん(' + name.substring(0, 6) + ')',
        content : escapeHTML(message.content)
      });
    }
  },
  onLoadCommanded : function(socket, name, room, message){
    scraper.scrapeContent(message.content, function(lines){
      emitMessageHandler.onLoadFinished(socket, room, lines);
    });
  },
  onLoadFinished : function(socket, room, lines){
    var count = 0;
    var timer = setInterval(function(){
      if (count >= lines.length - 1) {
        clearInterval(timer);
        novelPlaying[room] = false;
        io.sockets.in(room).emit('novel-content', { 
          author  : 'novel-bot',
          content : '指定された章の表示が完了しました'
        });
      }
      io.sockets.in(room).emit('novel-content', { 
        author  : 'novel-bot',
        content : lines[count]
      });
      count++;
    }, 6000);
  }
};

var crypto = require('crypto');

var joinRoomEventHandler = {
  onJoin    : function(socket, data){
    var hashed = crypto.createHash('md5').update(data.name).digest("hex")
    socket.set('name', hashed, function(){
      joinRoomEventHandler.onNameSet(socket, data);
    });
  },
  onNameSet : function(socket, data){
    socket.set('room', data.room, function(){
      joinRoomEventHandler.onRoomSet(socket, data); 
    });
  },
  onRoomSet : function(socket, data){
    io.sockets.in(data.room).emit('join', data.author);
    socket.emit('message', { 
      author  : 'novel-bot',
      content : 'こんにちは。「小説家になろう」の小説URLを貼ると自動で流します' 
    });
  }
};

server.listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
})
