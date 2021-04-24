nb.needQPCBoost = false;
nb.offense.Engineer = function(){
	if (nb.needQPCBoost) return 'qpcboost';
	return "bot claw "+nb.tar;
}