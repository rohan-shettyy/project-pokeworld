
function nowReady(instance){
$("#chatEngine-textbox").keyup(function(event) {
	if (event.keyCode === 13){
		message = document.getElementById("chatEngine-textbox").value;
		instance.socket.emit("new message", {message: message, username: username});
		document.getElementById("chatEngine-textbox").value = '';
		var newMessage = document.createElement("LI");       // Create a <li> node
		var textnode = document.createTextNode(username + ': ' + message);  // Create a text node
		newMessage.appendChild(textnode);          

		var list = document.getElementById("chatEngine-list");
		list.insertBefore(newMessage, list.childNodes[0]); 
	}
})

instance.socket.on('new message', function(messageData){
	var newMessage = document.createElement("LI");       // Create a <li> node
	var textnode = document.createTextNode(messageData.username + ': ' + messageData.message);  // Create a text node
	newMessage.appendChild(textnode);          

	var list = document.getElementById("chatEngine-list");
	list.insertBefore(newMessage, list.childNodes[0]); 
});
}