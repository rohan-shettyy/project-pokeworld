
function nowReady(instance){
$("#chatEngine-textbox").keyup(function(event) {
	if (event.keyCode === 13){
		message = document.getElementById("chatEngine-textbox").value;
		instance.socket.emit("new message", {message: message, username: username});
		 
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

function createDialogue(message){
	document.getElementById("chatEngine-textbox").value = '';
	var newMessage = document.createElement("LI");       // Create a <li> node
	var textnode = document.createTextNode(message);  // Create a text node
	newMessage.style.color = 'green';
	newMessage.appendChild(textnode);          

	var list = document.getElementById("chatEngine-list");
	list.insertBefore(newMessage, list.childNodes[0]);
}

function createChoice(message, op1, op2){
	document.getElementById("chatEngine-textbox").value = '';
	var newMessage = document.createElement("LI");       // Create a <li> node
	newMessage.style.color = 'green';
	var textnode = document.createTextNode(message);  // Create a text node
	var option1 = document.createElement("BUTTON");
	var option1text = document.createTextNode(op1);
	option1.appendChild(option1text);
	var option2 = document.createElement("BUTTON");
	var option2text = document.createTextNode(op2);
	option2.appendChild(option2text);
	newMessage.appendChild(textnode); 
	newMessage.appendChild(option1);
	newMessage.appendChild(option2);         

	var list = document.getElementById("chatEngine-list");
	list.insertBefore(newMessage, list.childNodes[0]);
}
