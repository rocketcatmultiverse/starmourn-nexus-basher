nb.error = function(m) {
	display_notice("Error: "+m,"red");
}

nb.debug = function(m) {
	if (nb.debugMode) display_notice('[DEBUG]: '+m);
}