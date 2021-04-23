nb.mySkills={}
nb.parsingSkills = false;
nb.skillsParsed = 0;

nb.skillParsingDone = function(){
	nb.parsingSkills = false;
	//calcOffense can be used if we want to set a class's offense function based on their skills. Otherwise we just check skills on every balance, which is okay too.
	nb.calcOffense[nb.class]();
}

nb.parseSkills = function(){
	nb.parsingSkills = true;
	nb.skillsParsed = 0;
	nb.debug("Nexus basher is grabbing skills.");
	switch (nb.class) {
		case "BEAST":
			send_GMCP("Char.Skills.Get",{"group":"Suittech"});
			send_GMCP("Char.Skills.Get",{"group":"Plasmacasting"});
			send_GMCP("Char.Skills.Get",{"group":"MWP"});
			break;
		case "Engineer":
			send_GMCP("Char.Skills.Get",{"group":"Bots"});
			send_GMCP("Char.Skills.Get",{"group":"Gadgets"});
			send_GMCP("Char.Skills.Get",{"group":"Turrets"});
			break;
		case "Fury":
			send_GMCP("Char.Skills.Get",{"group":"Battleflow"});
			send_GMCP("Char.Skills.Get",{"group":"Rage"});
			send_GMCP("Char.Skills.Get",{"group":"Fulmination"});
			break;
		case "Nanoseer":
			send_GMCP("Char.Skills.Get",{"group":"Nanotech"});
			send_GMCP("Char.Skills.Get",{"group":"Voidism"});
			send_GMCP("Char.Skills.Get",{"group":"Oblivion"});
			break;
		case "Scoundrel":
			send_GMCP("Char.Skills.Get",{"group":"Gunslinging"});
			send_GMCP("Char.Skills.Get",{"group":"Guile"});
			send_GMCP("Char.Skills.Get",{"group":"Improvisation"});
			break;
		default:
			nb.debug("Invalid class provided to nb.parseSkills "+nb.class);
	}
}

//called from gmcp Char.Skills.List
nb.skillsList = function(r) {
	if (!nb.parsingSkills) return;
	if (! ( "list" in r) ) return;
	var group = r.group;
	var list = r.list;
	nb.mySkills[group] = {"number_of_skills" : list.length};
	list.forEach(function(el){
		send_GMCP("Char.Skills.Get",{"group":group,"name":el});
	});
}

const skillRegex = /Known\:\s+(Yes|No)/;

nb.skillsInfo = function(r) {
	if (!nb.parsingSkills) return;
	var group = r.group;
	var skill = r.skill;
	if (!('info' in r)) {
		nb.setSkill(group, skill, false);
		return;
	}
	var info = r.info;
	var res = skillRegex.exec(info);
	if (res === null) {
		nb.debug("res is null")
		nb.setSkill(group, skill, false);
		return;
	}
	if (res.length !== 2) {
		nb.debug("Length "+res.length+" result in skillsInfo: "+JSON.stringify(r));
		return;
	} else {
		if (res[1] == "Yes") {
			nb.setSkill(group, skill, true);

		} else if (res[1] === "No") {
			nb.setSkill(group, skill, false);

		} else {
			nb.debug("Uncaught regex result in skillsInfo r="+JSON.stringify(r)+" and res="+JSON.stringify(res));
			return;
		}
	}
	if (Object.keys(nb.mySkills[group]).length > nb.mySkills[group].number_of_skills) {
		nb.skillsParsed++;
		if (nb.skillsParsed === 3) {
			nb.debug("Nexus basher done grabbing skills.");
			nb.skillParsingDone();
		}
	}

}

nb.haveSkill = function(group, skill) {
	if (!(group in nb.mySkills)) return false;
	if (!(skill in nb.mySkills[group])) return false;
	return nb.mySkills[group][skill];
}

nb.setSkill = function(group, skill, has) {
	if (!(group in nb.mySkills)) nb.mySkills[group] = {};
	nb.mySkills[group][skill] = has;
}




//This is a modification of the native handle_gmcp function. We want to parse Skills.Info in the background without the annoying dialog boxes. To do so, we make a minor modification which still preserves native functionality.
client.handle_GMCP = function(data)
{
    var gmcp_fire_event = false;
    var gmcp_event_param = '';

    if (data.GMCP)
    {
        if (client.echo_gmcp)
            print('[GMCP]: ' + data.GMCP.method + ' ' + data.GMCP.args, client.color_gmcpecho);

        var gmcp_method = data.GMCP.method;
        var gmcp_args = data.GMCP.args;
        if (gmcp_args.length == 0) gmcp_args = "\"\"";  // because JSON can't handle an empty string
        gmcp_args = JSON.parse(gmcp_args);

        if (gmcp_method == "Core.Goodbye")
        {
            client.disconnect_reason = gmcp_args;
            //cm_alert(gmcp_args, {title:"Connection Closed"});
        }

        if (gmcp_method == "Core.Ping")
        {
            if (GMCP.PingStart)
                GMCP.PingTime = new Date().getTime() - GMCP.PingStart;
            GMCP.PingStart = null;
        }

        if (gmcp_method == "Char.Name")
        {
            GMCP.Character = gmcp_args;
            logged_in = true;

            // Set the window title //
            document.title = GMCP.Character.name + " - " + game;

            $("#character_module_name").html(GMCP.Character.name);

            request_avatar();

            setTimeout(function () {
                if (client.load_settings)
                    gmcp_import_system();
            }, 1000);
        }

        if (gmcp_method == "Char.StatusVars")
        {
            GMCP.StatusVars = gmcp_args;
        }

        if (gmcp_method == "Char.Status")
        {
            // the data can be partial, so don't replace what we have
            if (GMCP.Status == null) GMCP.Status = {};
            var s = gmcp_args;
            for (v in s)
                GMCP.Status[v] = s[v];
            var status = GMCP.Status;
            client.draw_affdef_tab();
        }

        if (gmcp_method == "Char.Vitals")
        {
            // Handled by each game's character_module.php include
            if (gmcp_args.charstats) {
                GMCP.CharStats = gmcp_args.charstats;
                client.update_affdef_stats();
            }
            var vote_display = gmcp_args.vote ? 'block' : 'none';
            if (vote_display != $('#vote').css('display')) {
                $('#vote').css('display', vote_display);
                relayout_status_bar();
            }

            GMCP.gauge_data = gmcp_args;
            // put all the info to variables
            for (v in gmcp_args)
            {
                if (v == 'charstats') continue;
                client.set_variable('my_'+v, gmcp_args[v]);
            }

            parse_gauges(gmcp_args);
            if (client.game == 'Lusternia') parse_lusternia_wounds(gmcp_args);

            gmcp_fire_event = true;
            gmcp_event_param = '';
        }

        if (gmcp_method == "Char.Skills.Groups")
        {
            $("#tbl_skills").html("<table><tbody></tbody></table>");
            var skills = $("#tbl_skills tbody");

            for (var i in gmcp_args)
            {
                skills.append("<tr><td class=\"skill_group\" style=\"padding: 1px; font-weight:bolder;\" group=\"" + gmcp_args[i].name + "\">" + gmcp_args[i].name + "&nbsp;</td><td style=\"padding: 1px;\">" + gmcp_args[i].rank + "</td></tr>");
            }

            $("#tbl_skills tr").css("cursor","pointer").click(function() {
                send_GMCP("Char.Skills.Get", {"group":$(this).find('.skill_group').attr("group")});
                GMCP.WaitingForSkills = true;
            });
        }

        if (gmcp_method == "Char.Skills.List")
        {
            if (GMCP.WaitingForSkills == true)
            {
                var dsl = $("<div/>");

                var div = "<div id=\"group_skills\" class=\"\" title=\"Abilities in " + ucfirst(gmcp_args.group) + "\" style=\"font-size:.8em;\">";

                div += '<table id="skill_listing">';
                for (var i = 0; i < gmcp_args.list.length; ++i)
                {
                    var desc = '';
                    if (gmcp_args.descs && (gmcp_args.descs.length > i)) desc = gmcp_args.descs[i];
                    div += "<tr class=\"skill_name\" group=\"" + gmcp_args.group + "\" skill=\"" + gmcp_args.list[i] + "\"><td>" + gmcp_args.list[i] + "</td><td>" + desc + '</td></tr>';
                }
                div += '</table>';

                dsl.append(div).find(".skill_name").click(function() {
                    send_GMCP("Char.Skills.Get", {"group":$(this).attr("group"), "name":$(this).attr("skill")});
                });

                cm_dialog("#", {id: "skill_list", top_align: 40, title: "Abilities in " + ucfirst(gmcp_args.group), width: ($("#container").width() * .4), height: ($("#container").height() * .5), content: dsl});

                GMCP.WaitingForSkills = false;
            }
        }

        if (gmcp_method == "Char.Skills.Info" && !nb.parsingSkills) //here is our minor edit in nb.
        {
            var dsl = $("<div/>");

            var div = "<div id=\"group_skills_skill\" class=\"\" title=\"" + ucfirst(gmcp_args.skill) + "\" style=\"font-size:.8em;\">";

            if(gmcp_args.info != "")
            {
                div += "<p>" + client.escape_html(gmcp_args.info).replace(/\n/g,"<br />") + "</p>";
            } else {

                div += "<p>You have not yet learned that ability.</p>";

            }

            dsl.append(div);

            cm_dialog("#", {id: "skill_info", top_align: 40, title: ucfirst(gmcp_args.skill), width: ($("#container").width() * .5), height: ($("#container").height() * .5), content: dsl});
        }

        if (gmcp_method == "Char.Afflictions.List") {
            GMCP.Afflictions = {};
            for (var i = 0; i < gmcp_args.length; ++i) {
                var aff = gmcp_args[i];  // this has keys: name, cure, desc
                GMCP.Afflictions[aff.name] = aff;
            }
            client.draw_affdef_tab();
        }

        if (gmcp_method == "Char.Afflictions.Add") {
            var aff = gmcp_args;
            GMCP.Afflictions[aff.name] = aff;
            client.draw_affdef_tab();

            gmcp_fire_event = true;
            gmcp_event_param = aff;
        }

        if (gmcp_method == "Char.Afflictions.Remove") {
            for (var i = 0; i < gmcp_args.length; ++i)
              delete GMCP.Afflictions[gmcp_args[i]];
            client.draw_affdef_tab();

            gmcp_fire_event = true;
            gmcp_event_param = aff;
        }

        if (gmcp_method == "Char.Defences.List") {
            GMCP.Defences = {};
            for (var i = 0; i < gmcp_args.length; ++i) {
                var def = gmcp_args[i];  // this has keys: name, desc
                GMCP.Defences[def.name] = def;
            }
            client.draw_affdef_tab();
        }

        if (gmcp_method == "Char.Defences.Add") {
            var def = gmcp_args;
            GMCP.Defences[def.name] = def;
            client.draw_affdef_tab();

            gmcp_fire_event = true;
            gmcp_event_param = def;
        }

        if (gmcp_method == "Char.Defences.Remove") {
            for (var i = 0; i < gmcp_args.length; ++i)
              delete GMCP.Defences[gmcp_args[i]];
            client.draw_affdef_tab();

            gmcp_fire_event = true;
            gmcp_event_param = def;
        }


        if (gmcp_method == "Room.AddPlayer")
        {
            if (gmcp_args.name != GMCP.Character.name)
            {
                var name = gmcp_args.name.toLowerCase();
                $("#div_room_players #" + name).remove();  // because the remove msg sometimes isn't sent
                $("#div_room_players").append("<p class=\"no_border item\" id=\"" + name + "\"><span class=\"item_icon\"></span><span class=\"player_name\">" + gmcp_args.fullname + "</span></p>");
            
                gmcp_fire_event = true;
                gmcp_event_param = gmcp_args.name;
            }
        }

        if (gmcp_method == "Room.RemovePlayer")
        {
            var name = gmcp_args.toLowerCase();
            $("#div_room_players #" + name).remove();
            gmcp_fire_event = true;
            gmcp_event_param = gmcp_args;
        }

        if (gmcp_method == "Room.Players")
        {
            setTimeout(function () {
                $("#div_room_players").html("");

                for (var i in gmcp_args)
                {
                    if (gmcp_args[i].name.toLowerCase() != GMCP.Character.name.toLowerCase()) {
                        var html = "<p class=\"no_border item\" id=\"" + gmcp_args[i].name.toLowerCase() + "\"><span class=\"item_icon\"></span><span class=\"player_name\">" + gmcp_args[i].fullname + '</span>';
                        html += "</p>";
                        $("#div_room_players").append(html);
                     }
                }
            }, 0);
        }

        if (gmcp_method == "Char.Items.Add")
        {
            var div_id = itemlist_divid(gmcp_args.location, gmcp_args.item);
            if (div_id == null) return;
            $(div_id).append(itemlist_entry(gmcp_args.item));
            itemlist_events(gmcp_args.item);
            update_item_visibility();
        }

        if (gmcp_method == "Char.Items.Update")
        {
            var div_id = itemlist_divid(gmcp_args.location, gmcp_args.item);
            if (div_id == null) return;

            var orig = $(div_id + " #" + gmcp_args.item.id);
            var orig_crosstype = $("#div_inventory #" + gmcp_args.item.id);
            // if the item moves to another tab, remove it from the original one
            if (orig_crosstype.length > orig.length)
            {
                orig_crosstype.remove();
                crossbuttons = true;
                orig = new Array();
            }
            // hide buttons, but remember that they existed, if they did
            var buttons = $("#div_inventory .buttons_" + gmcp_args.item.id);
            buttons.remove();

            var newtext = itemlist_entry(gmcp_args.item);
            if (orig.length)
                orig.replaceWith(newtext);
            else
                $(div_id).append(newtext);
            itemlist_events(gmcp_args.item);

            // if the buttons were shown, show them again
            // we go with this hide-show thing because the item could have moved from one list to another
            var room = (gmcp_args.location == "room");
            var parentid = room ? "#container_room_contents" : "#tab_content_inventory";
            if (buttons.length)
                item_button_click($(parentid + " #" + gmcp_args.item.id), !room);
            update_item_visibility();
        }

        if (gmcp_method == "Char.Items.Remove")
        {
            if (typeof gmcp_args.item.id != "undefined")
                temp_item_id = gmcp_args.item.id;
            else
                temp_item_id = gmcp_args.item;

            if (gmcp_args.location == "room")
            {
                div_id = "#container_room_contents";

                $(div_id + " #" + temp_item_id).remove();
                $(div_id + " .buttons_" + temp_item_id).remove();
            } else
            {
                $("#div_inventory #" + temp_item_id).remove();
                $("#div_inventory .buttons_" + temp_item_id).remove();
            }
        }

        if (gmcp_method == "Char.Items.List")
        {
            setTimeout(function () {
                if (gmcp_args.location == "room")
                    $("#div_room_items, #div_room_mobs").html("");
                else if (gmcp_args.location == "inv")
                    $("#div_inventory").html('<div class="subsection"><div class="heading">Wielded</div><div class="section_content" id="div_inv_wielded"></div></div><div class="hrule"></div><div class="subsection"><div class="heading">Worn</div><div class="section_content" id="div_inv_worn"></div></div><div class="hrule"></div><div class="subsection"><div class="heading">Other</div><div class="section_content" id="div_inv_items"></div></div>');
                else if (gmcp_args.location.substr(0, 3) == "rep") {
                    var id = gmcp_args.location.substr(3);
                    var container = "div_inv_container" + id;
                    $("#"+container).remove();

                    $("#" + id + " > .fa.fa-plus-circle").removeClass("fa-plus-circle").addClass("fa-minus-circle");
                    $("#" + id + ", .buttons_" + id).addClass('open_container');
                    // if buttons exist, display the container after them
                    var after = $(".buttons_" + id);
                    if (after.length == 0) after = $("#" + id);
                    after.after("<div id=\"" + container + "\" class=\"item-container open_container\"></div>");
                }

                for (var i in gmcp_args.items)
                {
                    var div_id = itemlist_divid(gmcp_args.location, gmcp_args.items[i]);
                    if (div_id == null) continue;
                    $(div_id).append(itemlist_entry(gmcp_args.items[i]));
                    itemlist_events(gmcp_args.items[i]);
                }
                update_item_visibility();
            }, 0);
        }

        if (gmcp_method == "Redirect.Content")
        {
            var name = gmcp_args.name;
            if (!name) name = 'Information';
            var type = gmcp_args.type;
            if (!type) type = 'text';
            var windowid = gmcp_args.windowid;
            if (!windowid) windowid = type;
            var id = 'content_window_' + windowid;
            var width = parseInt(gmcp_args.width);
            if (isNaN(width)) width = 0;
            var height = parseInt(gmcp_args.height);
            if (isNaN(height)) height = 0;
            var content = gmcp_args.content;

            client.create_content_window (id, name, type, content, width, height);
            return;
        }
        if (gmcp_method == "Redirect.Content.Close")
        {
            var windowid = gmcp_args;
            if (!windowid) return;
            var id = 'content_window_' + windowid;
            client.close_content_window (id);
            return;
        }

        if (gmcp_method == "IRE.Display.Help" && client.popups_help === true)
        {
            var res = {};
            res.display_help = true;
            res.start = (gmcp_args == "start");
            return res;
        }

        if (gmcp_method == "IRE.Display.Window" && client.popups_help === true)
        {
            var res = {};
            res.display_window = true;
            res.start = (parseInt(gmcp_args.start) == 1);
            res.cmd = gmcp_args.cmd;
            return res;
        }

        if (gmcp_method == "IRE.Display.FixedFont")
        {
            var res = {};
            res.display_fixed_font = true;
            res.start = (gmcp_args == "start");
            return res;
        }

        if (gmcp_method == "IRE.Display.AutoFill")
        {
            $("#user_input").val(gmcp_args.command);

            if (gmcp_args.highlight && (gmcp_args.highlight === true || gmcp_args.highlight == "true"))
                document.getElementById("user_input").setSelectionRange(0,document.getElementById("user_input").value.length);

            $("#user_input").focus();
        }

        if (gmcp_method == "IRE.Display.HidePopup")
        {
            $("#" + gmcp_args.id).fadeOut({
                complete: function () {$(this).remove()}
            });
        }

        if (gmcp_method == "IRE.Display.HideAllPopups")
        {
            $(".popup").fadeOut({
                complete: function () {$(this).remove()}
            });
        }

        if (gmcp_method == "IRE.Display.Popup")
        {
            //{"id":"test","src":"/games/images/arrow-down-animated.gif","element":"#user_input","options":{}}

            var id = gmcp_args.id,
                element = gmcp_args.element,
                src = gmcp_args.src,
                content = $("<p/>").html(gmcp_args.text),
                options = gmcp_args.options,
                commands = gmcp_args.commands,
                allow_noshow = gmcp_args.allow_noshow;

            //print(gmcp_method + ":<br/>" + JSON.stringify(gmcp_args));

            client.display_gmcp_popup(id, element, src, content, options, commands, allow_noshow);
        }

        if ((gmcp_method == "IRE.Display.Ohmap") && client.map_enabled())
        {
            var res = {};
            res.ohmap = true;
            res.start = (gmcp_args == "start");
            return res;
        }

        if (gmcp_method == "IRE.Display.ButtonActions")
        {
            bottom_buttons_set_defaults(gmcp_args);
        }

        if (gmcp_method == "Comm.Channel.Start")
        {
            var res = {};
            res.channel = gmcp_args;
            res.start = true;
            return res;
        }
        if (gmcp_method == "Comm.Channel.End")
        {
            var res = {};
            res.channel = gmcp_args;
            res.start = false;
            return res;
        }

        if (gmcp_method == "Comm.Channel.Text")
        {
            var channel = gmcp_args.channel;
            var text = gmcp_args.text;
            text = parse_and_format_line(text);
            write_channel(channel, text);
            notifications_channel_text(channel, text, gmcp_args.talker);
        }

        if (gmcp_method == "Comm.Channel.List")
        {
            GMCP.ChannelList = gmcp_args;

            setTimeout(function() {
                $("#div_channels").html("");

                for (var i in GMCP.ChannelList)
                {
                    $("#div_channels").append("<p class=\"no_border item\" style=\"padding: 5px; cursor:pointer\" name=\"" + GMCP.ChannelList[i].name + "\" caption=\"" + GMCP.ChannelList[i].caption + "\" command=\"" + GMCP.ChannelList[i].command + "\">" + ucfirst(GMCP.ChannelList[i].caption) + "</p>");
                }

                $("#div_channels > .item").click(function() {
                    if ($(this).hasClass("bg_medium")) clear = true; else clear = false;

                    $("#div_channels > .item").removeClass("bg_medium");
                    $("#div_channels > .buttons").remove();

                    if (!clear)
                    {
                        $(this).addClass("bg_medium");

                        var name = $(this).attr("name");
                        var caption = $(this).attr("caption");
                        var command = $(this).attr("command");

                        $(this).after("<p class=\"buttons txt_center\" style=\"font-size: .9em;\">" +
                                        "<button class=\"open_channel\" name=\"" + name + "\" caption=\"" + caption + "\" command=\"" + command + "\">Open Channel</button>" +
                                      "</p>");
                        $("#div_channels > .buttons > button.open_channel").button().click(function() {open_channel($(this).attr("name"),$(this).attr("caption"),$(this).attr("command"));});
                    }
                });
            },0);
        }

        if (gmcp_method == "Comm.Channel.Players")
        {
            setTimeout(function () {
                GMCP.WhoList = gmcp_args;

                GMCP.WhoList.sort(function (a,b) {
                    if (a.name < b.name)
                        return -1;
                    if (a.name > b.name)
                        return 1;
                    return 0;
                });

                $("#div_who_channels").html("<p class=\"no_border bg_medium who_channel\" style=\"padding: 5px; cursor:pointer\">All Players</p>");
                $("#div_who_players").html("");

                var channels = [];

                for (var i in GMCP.WhoList)
                {
                    if (GMCP.WhoList[i].channels)
                    {
                        for (var j in GMCP.WhoList[i].channels)
                        {
                            if ($.inArray(GMCP.WhoList[i].channels[j], channels) == -1)
                                channels.push(GMCP.WhoList[i].channels[j])
                        }
                    }

                    $("#div_who_players").append("<p class=\"no_border who_name\" style=\"padding: 2px 5px; cursor:pointer\">" + GMCP.WhoList[i].name + "</p>");
                }

                $("#div_who_players > .who_name").click(function() {
                    var name = $(this).html();
                    send_direct('honours ' + name);
/*
                    if ($(this).hasClass("bg_medium")) clear = true; else clear = false;

                    $("#div_who_players > .who_name").removeClass("bg_medium");
                    $("#div_who_players > .buttons").remove();

                    if (!clear)
                    {
                        $(this).addClass("bg_medium");
                        var name = $(this).html();

                        $(this).after("<p class=\"buttons txt_center\">" +
                                        "<button class=\"send\" rel=\"honours " + name + "\">Honors</button>" +
                                        //"<button class=\"open_channel\"  name=\"Chat with " + name + "\" caption=\"Chat with " + name + "\" command=\"tell " + name + "\">Chat</button>" +
                                      "</p>");
                        $("#div_who_players > .buttons > button.send").button().click(function() {send_direct($(this).attr("rel"), true);});
                        $("#div_who_players > .buttons > button.open_channel").button().click(function() {open_channel($(this).attr("name"),$(this).attr("caption"),$(this).attr("command"));});
                    }
*/
                });

                channels.sort();

                for (var i in channels)
                {
                    $("#div_who_channels").append("<p class=\"no_border who_channel\" style=\"padding: 5px; cursor:pointer\" who_channel=\"" + channels[i] + "\">" + ucfirst(channels[i]) + "</p>");
                }

                $("#div_who_channels > .who_channel").click(function() {

                    if ($(this).hasClass("bg_medium")) clear = true; else clear = false;

                    $("#div_who_channels > .who_channel").removeClass("bg_medium");

                    $(this).addClass("bg_medium");

                    $("#div_who_players").html("");

                    for (var i in GMCP.WhoList)
                    {
                        if ($(this).html() == "All Players" || (GMCP.WhoList[i].channels && $.inArray($(this).attr("who_channel"), GMCP.WhoList[i].channels) > -1))
                        {
                            $("#div_who_players").append("<p class=\"no_border who_name\" style=\"padding: 2px 5px; cursor:pointer\">" + GMCP.WhoList[i].name + "</p>");
                        }
                    }

                    // TODO: don't duplicate things here ...
                    $("#div_who_players > .who_name").click(function() {
                        var name = $(this).html();
                        send_direct('honours ' + name);
/*
                        if ($(this).hasClass("bg_medium")) clear = true; else clear = false;

                        $("#div_who_players > .who_name").removeClass("bg_medium");
                        $("#div_who_players > .buttons").remove();

                        if (!clear)
                        {
                            $(this).addClass("bg_medium");
                            var name = $(this).html();

                            $(this).after("<p class=\"buttons txt_center\">" +
                                            "<button class=\"send\" rel=\"honours " + name + "\">Honors</button>" +
                                            //"<button class=\"open_channel\"  name=\"Chat with " + name + "\" caption=\"Chat with " + name + "\" command=\"tell " + name + "\">Chat</button>" +
                                          "</p>");
                            $("#div_who_players > .buttons > button.send").button().click(function() {send_direct($(this).attr("rel"), true);});
                            $("#div_who_players > .buttons > button.open_channel").button().click(function() {open_channel($(this).attr("name"),$(this).attr("caption"),$(this).attr("command"));});
                        }
*/
                    });
                });

            }, 0);
        }

        if (gmcp_method == "IRE.Rift.Change")
        {
            var name = gmcp_args.name;
            if (gmcp_args.amount)
                GMCP.Rift[name] = { amount: gmcp_args.amount, desc: gmcp_args.desc };
            else
                delete GMCP.Rift[name];

            // update the rift, but only once per 20ms to avoid too much updating
            if (GMCP.rift_update_timeout) window.clearTimeout (GMCP.rift_update_timeout);
            GMCP.rift_update_timeout = window.setTimeout(function () {
                GMCP.rift_update_timeout = null;
                client.render_rift();
            }, 20);
        }

        if (gmcp_method == "IRE.Rift.List")
        {
            GMCP.Rift = {};
            for (var i in gmcp_args) {
                var name = gmcp_args[i].name;
                GMCP.Rift[name] = { amount: gmcp_args[i].amount, desc: gmcp_args[i].desc };
            }
            setTimeout(function () {
                client.render_rift();
            },0);
        }

        if (gmcp_method == "IRE.FileStore.Content")
        {
            var file = gmcp_args;

            if (file.name && file.name == "raw_refresh")
            {
                //console.log(file);
                if (file.text != "")
                {
                    import_system(file.text);
                }

                $.colorbox.close();
            } else if (file.name && file.name == "raw") {
                if (file.text != "")
                {
                    import_system(file.text);
                }
            }
        }

        if (gmcp_method == "IRE.FileStore.List")
        {
            var list = gmcp_args;
            if (client.settings_window && client.settings_window.process_filelist)
                client.settings_window.process_filelist (list);
        }

        if (gmcp_method == "IRE.Tasks.List")
        {
            GMCP.TaskList = {};

            setTimeout(function () {
                /*gmcp_args.sort(function (a,b) {
                    if (a.group < b.group)
                        return -1;
                    if (a.group > b.group)
                        return 1;
                    return 0;
                });*/

                var types = [ "task", "quest", "achievement" ];
                for (var tt = 0; tt < types.length; ++tt) {
                    var type = types[tt];

                    var groups = {};
                    var grouporder = new Array();   // groups in the order in which they were encountered
                    // the "Active" group always exists on the top (only shown if we have such tasks)
                    grouporder.push("Active");
                    // Similarly, the Completed one always exists at the bottom
                    var lastgroups = new Array();
                    lastgroups.push("Completed");
                    for (var i in gmcp_args)
                    {
                        if (gmcp_args[i].type.toLowerCase().indexOf(type) < 0) continue;

                        GMCP.TaskList[type + gmcp_args[i].id] = gmcp_args[i];

                        var group = gmcp_args[i].group;
                        if (groups[group] == null) groups[group] = new Array();

                        groups[group].push(i);
                        if ((grouporder.indexOf(group) < 0) && (lastgroups.indexOf(group) < 0))
                            grouporder.push(group);
                    }

                    for (var g = 0; g < lastgroups.length; ++g)
                        grouporder.push(lastgroups[g]);

                    var tbl = $("#tbl_"+type+"s");
                    tbl.html("");
                    var count = 0;
                    var gid = 0;
                    for (var g = 0; g < grouporder.length; ++g) {
                        var group = grouporder[g];
                        if ((groups[group] == null) || (groups[group].length == 0)) continue;
                        var section = '';
                        gid++;
                        for (var idx = 0; idx < groups[group].length; ++idx) {
                            var i = groups[group][idx];

                            var html = task_html(type, gmcp_args[i]);
                            section += "<div id=\""+type+gmcp_args[i].id+"\" class=\"task_group_" + type + gid + "\">" + html + "</div>";
                        }
                        section = '<div class="subsection"><div class="heading">' + client.escape_html(group) + '</div><div class="section_content">' + section + '</div>';

                        if (count > 0)  tbl.append ('<div class="hrule"></div>');
                        tbl.append (section);
                        for (var idx = 0; idx < groups[group].length; ++idx) {
                            var i = groups[group][idx];
                            task_html_add_handler(type, gmcp_args[i]);
                        }
                        count++;
                    }
                }
            },0);
        }

        if (gmcp_method == "IRE.Tasks.Update")
        {
            setTimeout(function () {

                var types = [ "task", "quest", "achievement" ];
                for (var tt = 0; tt < types.length; ++tt) {
                    var type = types[tt];

                    for (var i in gmcp_args)
                    {
                        if (gmcp_args[i].type.toLowerCase().indexOf(type) < 0) continue;

                        GMCP.TaskList[type + gmcp_args[i].id] = gmcp_args[i];

                        var html = task_html(type, gmcp_args[i]);

                        $("div#"+type+gmcp_args[i].id).html(html);
                        task_html_add_handler(type, gmcp_args[i]);
                    }
                }
            },0);
        }

        if (gmcp_method == "IRE.Time.List")
        {
            GMCP.Time = {};

            //setTimeout(function () {
                for (var i in gmcp_args)
                {
                    GMCP.Time[i] = gmcp_args[i];
                }
            //},0);
        }

        if (gmcp_method == "IRE.Time.Update")
        {
            //setTimeout(function () {
                for (var i in gmcp_args)
                {
                    GMCP.Time[i] = gmcp_args[i]
                }
            //},0);
        }

        if (gmcp_method == "Room.Info")
        {
            setTimeout(function() {

                var map = client.mapper;
                $("#div_room_description").html(gmcp_args.desc.replace(/\n/g,"<br>"))

                map.roomName = gmcp_args.name;
                map.roomExits = gmcp_args.exits;

                // these need to be before the actual map updating
                map.set_map_background(gmcp_args.background);
                map.set_map_linecolor(gmcp_args.linecolor);

                map.cID = gmcp_args.num;
                // if this is not an ohmap room, disable the mode
                if (!gmcp_args.ohmap) map.overhead = false;

                var coords = gmcp_args.coords.split(/,/g);
                var coords_okay = false;
                var area_id = undefined;
                var x = undefined;
                var y = undefined;
                var z = undefined;
                var building = undefined;

                if (coords && coords.length >= 4) {
                    area_id = coords[0];
                    x = coords[1];
                    y = coords[2];
                    z = coords[3];
                    building = (coords.length >= 5) ? coords[4] : 0;

                    if ($.isNumeric(area_id) && $.isNumeric(x) && $.isNumeric(y) && $.isNumeric(z)) coords_okay = true;
                }
                if (!coords_okay)
                    // Coords can't be parsed -- show the supplied area name instead, if any.
                    map.set_area_name(gmcp_args.area);

                last_x = map.cX;
                last_y = map.cY;
                last_z = map.cZ;
                last_building = map.cB;

                map.cX = x;
                map.cY = y;
                map.cZ = z;
                map.cB = building;

                GMCP.CurrentArea.id = area_id;
                GMCP.CurrentArea.level = z;

                if (coords_okay && (map.cArea != area_id))
                {
                    map.cArea = area_id;
                    map.load_map_data();
                } else {
                    if ((map.cZ != last_z) || (map.cB != last_building))
                    {
                        map.draw_map();
                    } else {
                        map.draw_player();
                    }
                }

                client.update_movement_compass(gmcp_args.exits);
            }, 0);

            gmcp_fire_event = true;
            gmcp_event_param = gmcp_args.num;
        }

        if (gmcp_method == "IRE.Composer.Edit")
        {
            //print(JSON.stringify(gmcp_args));

            var composer_edit = gmcp_args;

            if (composer_edit.title != "")
            {
                $("#composer_title").html(composer_edit.title);
            }

            $.colorbox({width: "700px", open:true, inline:true, href:"#m_composer"});

            $("#composer_text").val(composer_edit.text).focus();
        }

        if (gmcp_method == "IRE.Sound.Preload")
        {
            preload_sound('library/' + gmcp_args.name);
        }

        if (gmcp_method == "IRE.Sound.Play")
        {
            fadein = fadeout = loop = false;

            if (typeof gmcp_args.fadein_csec != "undefined")
                fadein = gmcp_args.fadein_csec * 1000; // GMCP provides in seconds, sound lib needs milliseconds //

            if (typeof gmcp_args.fadeout_csec != "undefined")
                fadeout = gmcp_args.fadeout_csec * 1000;

            if (typeof gmcp_args.loop != "undefined" && (gmcp_args.loop == "true" || gmcp_args.loop == true))
                loop = true;

            play_sound('library/' + gmcp_args.name, fadein, fadeout, loop);
        }

        if (gmcp_method == "IRE.Sound.Stop")
        {
            fadeout = false;

            if (typeof gmcp_args.fadeout_csec != "undefined")
                fadeout = gmcp_args.fadeout_csec * 1000;

            stop_sound(gmcp_args.name, fadeout);
        }

        if (gmcp_method == "IRE.Sound.StopAll")
        {
            fadeout = false;

            if (typeof gmcp_args.fadeout_csec != "undefined")
                fadeout = gmcp_args.fadeout_csec * 1000;

            stop_all_sounds(fadeout);
        }

        if (gmcp_method == "IRE.Target.Set")
        {
            var target = gmcp_args;
            var ntarget = parseInt(target);
            if (!isNaN(ntarget)) target = ntarget;
            client.set_current_target(target, false);

            gmcp_fire_event = true;
            gmcp_event_param = target;
        }

        if (gmcp_method == "IRE.Target.Request")
        {
            client.send_GMCP("IRE.Target.Set", (GMCP.Target != undefined) ? GMCP.Target: 0);
        }

        if (gmcp_method == "IRE.Target.Info")
        {
            var tg = parseInt(gmcp_args.id);
            var is_player = (tg == -1);
            if ((!is_player) && (tg != client.current_target())) return;   // nothing if the target has since changed - eliminates race conds. Bypassed for player targets.
            var desc = gmcp_args.short_desc;
            var hp = is_player ? undefined : gmcp_args.hpperc;
            client.set_current_target_info(desc, hp, is_player);
        }

        // used to upload the drupal avatar
        if (gmcp_method == "IRE.Misc.OneTimePassword")
        {
            var pwd = gmcp_args;
            dropzone_kickoff(pwd);
        }

        // Fire bound behaviors //
        $(document).trigger('onGMCP', [gmcp_method, gmcp_args]);
        run_function("onGMCP", {"gmcp_method":gmcp_method, "gmcp_args":gmcp_args}, 'ALL');
        if (gmcp_fire_event) client.handle_event('GMCP', gmcp_method, gmcp_event_param);
    }
}