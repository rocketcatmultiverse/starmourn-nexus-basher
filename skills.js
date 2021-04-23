//called from gmcp Char.Skills.List
nb.skillsList = function(r) {
	if (! ( "list" in r) ) return;
	var group = r.group;
	var list = r.list;
}

const skillRegex = /\\nKnown\:\s+(Yes|No)\\n/g;

nb.skillsInfo = function(r) {
	var group = r.group;
	var skill = r.skill;
	var info = r.info;
	var res = skillRegex.exec(info);
	if (res.length !== 2) {
		debug("Length "+res.length+" result in skillsInfo: "+JSON.stringify(r));
		return;
	} else {
		if (res[1] == "Yes") {

		} else if (res[1] === "No") {

		} else {
			debug("Uncaught regex result in skillsInfo r="+JSON.stringify(r)+" and res="+JSON.stringify(res));
			return;
		}
	}

}