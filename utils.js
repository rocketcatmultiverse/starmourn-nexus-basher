nb.error = function(m) {
	display_notice("Error: "+m,"red");
}

nb.debug = function(m) {
	if (nb.debugMode) display_notice('[DEBUG]: '+m);
}

nb.warn = function(m) {
	display_notice("[WARNING]: "+m,"yellow");
}

nb.me = function(who) {
	nb.debug("nb.me called with who = "+who);
	if (who.split(' ')[0] == GMCP.Character.name) { //this is the native Nexus character name from GMCP.
		return true;
	}
	return false;
}

nb.tableReport = function(table) {
    table.setBorder(" ");
    table = table.toString();
    nb.owWrite('#output_main', '<div class="mono">'+ table+'</div>'); 
}

nb.owWrite = function(selector, text) {
    if (text.trim() == "") return;

    // doing these updates asynchronously to minimize reflows when under heavy load
    window.requestAnimationFrame(function() {
        var hooks = $.cssHooks;
        $.cssHooks = {};

        var output = client.document.querySelectorAll(selector + ' .output')[0];
        var newel = document.createElement('div');
        newel.innerHTML = text;
        newel.className = 'line';
        newel.id = 'msg' + num_msgs;
        output.appendChild(newel);
        if(client.logging){append_to_log(newel.innerHTML);}

        var scrollback = client.document.querySelectorAll(selector + ' .output_scrollback')[0];
        newel = document.createElement('div');
        newel.className = 'line';
        newel.innerHTML = text;
        newel.id = 'sb_msg' + num_msgs;
        scrollback.appendChild(newel);

        trim_ow(selector);

        num_msgs++;
        scrollback_num_msgs++;

        if (selector === '#output_main') {
           if (no_prompts || gag_prompts) {
               var el = client.document.querySelectorAll('#output_main .prompt');
               for (var i = 0; i < el.length; i++) el[i].style.display = 'none';
               // last prompt shown?
               if ((!no_prompts) && el.length > 0)
                   el[el.length - 1].style.display = 'block';
           }
           if (show_timestamps) {
               var el = client.document.querySelectorAll('#output_main .output #msg'+(num_msgs-1)+' .timestamp');
               for (var i = 0; i < el.length; i++) el[i].classList.remove('no_out');
           }
           if (show_scroll_timestamps) {
               var el = client.document.querySelectorAll('#output_main .output_scrollback #sb_msg'+(num_msgs-1)+' .timestamp');
               for (var i = 0; i < el.length; i++) el[i].classList.remove('no_out');
           }
        }

        output.scrollTop = output.scrollHeight;

        $.cssHooks = hooks;
    });

}