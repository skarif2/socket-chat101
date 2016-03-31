(function(){
	var getNode = function(s){
		return document.querySelector(s);
	},
	status = getNode('.chat-status span'),
	messages = getNode('.chat-messages');
	textarea = getNode('.chat textarea'),
	chatName = getNode('.chat-name'),
	statusDefault = status.textContent,
	setStatus = function(s){
		status.textContent = s;
		if(s !== statusDefault){
			var delay = setTimeout(function(){
				setStatus(statusDefault);
				clearInterval(delay);
			}, 3000);
		}
	};

	try{
		var socket = io.connect('localhost:2743');
	} catch(e) {
		console.log('Error !!!');
	}
	if(socket !== undefined){
		// listen for output
		socket.on('output', function(data){
			if(data.length){
				data.forEach(function(message){
					var newMessage = document.createElement('div');
					newMessage.setAttribute('class', 'chat-message');
					newMessage.textContent = message.name + ': ' + message.message;

					messages.appendChild(newMessage);
					messages.insertBefore(newMessage, messages.firstChild);
				});
			}
		});

		// listen for status
		socket.on('status', function(status){
			setStatus((typeof status === 'object') ? status.message : status);
			if(status.clear === true){
				textarea.value = '';
			}
		});
		// listen for key down
		textarea.addEventListener('keydown', function(event){
			var self = this;
			var name = chatName.value;
			if(event.which === 13 && event.shiftKey === false){
				socket.emit('input', {
					name: name,
					message: self.value
				});
				event.preventDefault();
			}
		});
	}
})();
