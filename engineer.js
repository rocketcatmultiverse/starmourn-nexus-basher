nb.needQPCBoost = false;
nb.degaussed = false;
nb.offense.Engineer = function(){
	if (!nb.configs.no_qpcboost.val && nb.needQPCBoost) return 'qpcboost';
	if (nb.configs.use_shock_rotation.val) {
		//if (nb.configs.degauss_turret.val && !nb.degaussed && nb.tarHealth < 15) return "gadget degauss "+nb.tar+" turret";
		return "gadget shock "+nb.tar;
	}
	return "bot claw "+nb.tar;
}