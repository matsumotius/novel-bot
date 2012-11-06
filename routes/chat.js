var chat = module.exports = {
  room : function(req, res) {
    res.render('room', {
      roomId : req.query.roomId
    });
  }
};
