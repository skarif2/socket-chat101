var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/socket-chat101');
var Schema = mongoose.Schema;
var messageSchema = new Schema({
	name: String,
	message: String
});
var Message = mongoose.model('Message', messageSchema);

io.on('connection', function(socket){
	var sendStatus = function(status){
		socket.emit('status', status);
	}
	// Emit all messages
	Message.find({}).sort({_id: 1}).limit(100).exec(function(err, messages){
		if(err) console.log(err);
		socket.emit('output', messages);
	});

	//Wait for input
	socket.on('input', function(data){
		var whitespacePattern = /^\s*$/;
		if(whitespacePattern.test(data.name)){
			sendStatus('Please enter your name');
		} else if (whitespacePattern.test(data.message)) {
			sendStatus('Please enter your message');
		} else {
			var newMessage = new Message({
				name: data.name,
				message : data.message
			});
			newMessage.save(function(err, message){
				if(err) console.log(err);
				else {
					io.emit('output', [data]);
					sendStatus({
						message: 'Success',
						clear: true
					});
				}
			});
		}
	});
});
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/bower_components'));
app.get('/', function(req, res,next) {
    res.render('index.html');
});

server.listen(2743);
console.log("Listening to port 2743...");
