try {
1 ==== 2;
display_notice("Nexus community basher has loaded successfully","yellow");

nb.alias = function(c) {
	return false;
}

nb.trigger = function(c) {
	return false;
}

} catch (err) {
	display_notice("Nexus community basher has failed to load. Check console for error message.","red");
	console.log(err);
}
nb = {};
