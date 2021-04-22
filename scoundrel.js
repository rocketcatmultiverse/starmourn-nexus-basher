nb.offense.Scoundrel = function(){
	if (nb.bullets === 0 ) {
		return "gun quickload";
	} 
	return "gun crackshot "+pve.tar;
}