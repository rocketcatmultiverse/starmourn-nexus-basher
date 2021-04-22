nb.error = function(m) {
	display_notice("Error: "+m,"red");
}

nb.debug = function(m) {
	if (nb.debugMode) display_notice('[DEBUG]: '+m);
}

nb.me = function(who) {
	nb.debug("nb.me called with who = "+who);
	if (who.split(' ')[0] == GMCP.Character.name) { //this is the native Nexus character name from GMCP.
		return true;
	}
	return false;
}