var Namegenerator=function e(t){var o={};o.options={nodeType:"Alter",edgeType:"Dyad",targetEl:$(".container"),variables:[],heading:"This is a default heading",subheading:"And this is a default subheading"},extend(o.options,t);var a=!1,n=!1,i=network.getNodes({type_t0:"Alter"}).length,l={Friend:["Best Friend","Friend","Ex-friend","Other type"],"Family / Relative":["Parent/Guardian","Brother/Sister","Grandparent","Other Family","Chosen Family"],"Romantic / Sexual Partner":["Boyfriend/Girlfriend","Ex-Boyfriend/Ex-Girlfriend","Booty Call/Fuck Buddy/Hook Up","One Night Stand","Other type of Partner"],"Acquaintaince / Associate":["Coworker-Colleague","Classmate","Roommate","Friend of a Friend","Neighbor","Other"],"Other Support / Source of Advice":["Teacher/Professor","Counselor/Therapist","Community Agency Staff","Religious Leader","Mentor","Coach","Other"],"Drug Use":["Someone you use drugs with","Someone you buy drugs from"],Other:[]},r=function(e){13===e.keyCode&&(e.preventDefault(),a===!1?o.openNodeBox():a===!0&&$(".submit-1").click()),27===e.keyCode&&o.closeNodeBox(),8!==e.keyCode||$(e.target).is("input, textarea")||e.preventDefault()},s=function(){var e;$(this).data("selected")===!0?($(this).data("selected",!1),$(this).removeClass("selected"),e={type:"Role",from:network.getNodes({type_t0:"Ego"})[0].id,to:n,reltype_main_t0:$(this).parent(".relationship-type").data("main-relationship"),reltype_sub_t0:$(this).data("sub-relationship")},console.log(e),network.removeEdge(network.getEdges(e))):($(this).data("selected",!0),$(this).addClass("selected"),e={type:"Role",from:network.getNodes({type_t0:"Ego"})[0].id,to:n,reltype_main_t0:$(this).parent(".relationship-type").data("main-relationship"),reltype_sub_t0:$(this).data("sub-relationship")},console.log(e),network.addEdge(e))},d=function(e){if(a===!0&&13!==e.keyCode&&$("#fname_t0").val().length>0&&$("#fname_t0").val().length>0){var t=$("#fname_t0").val()+" "+$("#lname_t0").val().charAt(0);$("#lname_t0").val().length>0&&(t+=".");var o=function(){$("#nname_t0").val(t)};setTimeout(o,0)}},p=function(){o.destroy()},c=function(){var e=$(this).data("index"),t=network.getEdges({from:network.getNodes({type_t0:"Ego"})[0].id,to:e,type:"Dyad"})[0];n=e;var a=network.getEdges({from:network.getNodes({type_t0:"Ego"})[0].id,to:n,type:"Role"}).length;$(".relationship-button").html(a+" roles selected."),$.each(o.options.variables,function(e,a){a.private===!1&&("relationship"===a.type?$("select[name='"+a.variable+"']").val(t[a.variable]):$("#"+a.variable).val(t[a.variable]),$(".delete-button").show(),o.openNodeBox())})},u=function(){$(".delete-button").hide(),o.closeNodeBox()},h=function(){return""===$("select[name='reltype_main_t0']").val()?($("select[name='reltype_sub_t0']").prop("disabled",!0),!1):($("select[name='reltype_sub_t0']").prop("disabled",!1),$("select[name='reltype_sub_t0']").children().remove(),$("select[name='reltype_sub_t0']").append('<option value="">Choose a specific relationship</option>'),void $.each(l[$("select[name='reltype_main_t0']").val()],function(e,t){$("select[name='reltype_sub_t0']").append('<option value="'+t+'">'+t+"</option>")}))},v=function(){"Other"===$("select[name='reltype_sub_t0']").val()?$(".reltype_oth_t0").show():($(".reltype_oth_t0").val(""),$(".reltype_oth_t0").hide())},b=function(e){e.preventDefault();var t={},a={};$(".delete-button").hide(),$.each(o.options.variables,function(e,o){"edge"===o.target?t[o.variable]=o.private===!0?o.value:"relationship"===o.type||"subrelationship"===o.type?$("select[name='"+o.variable+"']").val():$("#"+o.variable).val():"node"===o.target&&(a[o.variable]=o.private===!0?o.value:"relationship"===o.type||"subrelationship"===o.type?$("select[name='"+o.variable+"']").val():$("#"+o.variable).val())});var l={},r={};if(n===!1){extend(l,a);var s=network.addNode(l),d;$.each(o.options.edgeTypes,function(e,t){var a={},n=t;$.each(o.options.variables,function(e,t){"edge"===t.target&&t.edge===n&&(a[t.variable]=t.private===!0?t.value:"relationship"===t.type||"subrelationship"===t.type?$("select[name='"+t.variable+"']").val():$("#"+t.variable).val())}),r={from:network.getNodes({type_t0:"Ego"})[0].id,to:s,type:n},extend(r,a),d=network.addEdge(r)});var p=network.getEdges({to:s,type:"Dyad"})[0];o.addToList(p),i++,$(".alter-count-box").html(i)}else{var c=function(){var e=$("div[data-index="+n+"]");e.stop().transition({background:"rgba(51, 160, 117, 1)"},400,"ease"),setTimeout(function(){e.stop().transition({background:"rgba(238,238,238, 1)"},800,"ease")},1500)},u=n;$.each(o.options.edgeTypes,function(e,t){var a=t,i={};$.each(o.options.variables,function(e,t){"edge"===t.target&&t.edge===a&&(i[t.variable]=t.private===!0?t.value:"relationship"===t.type||"subrelationship"===t.type?$("select[name='"+t.variable+"']").val():$("#"+t.variable).val())});var l=network.getEdges({from:network.getNodes({type_t0:"Ego"})[0].id,to:n,type:t});$.each(l,function(e,t){network.updateEdge(t.id,i,c)})}),network.updateNode(u,a);var h=extend(t,a);$("div[data-index="+n+"]").html(""),$("div[data-index="+n+"]").append("<h4>"+h.nname_t0+"</h4>");var v=$("<ul></ul>");$.each(o.options.variables,function(e,t){t.private===!1&&void 0!==h[t.variable]&&""!==h[t.variable]&&v.append('<li class="'+h[t.variable]+'"><strong>'+t.label+"</strong>: "+h[t.variable]+"</li>")}),$("div[data-index="+n+"]").append(v),n=!1}o.closeNodeBox()};return o.openNodeBox=function(){$(".content").addClass("blurry"),$(".newNodeBox").transition({scale:1,opacity:1},300),$("#ngForm input:text").first().focus(),a=!0},o.closeNodeBox=function(){$(".content").removeClass("blurry"),$(".newNodeBox").transition({scale:.1,opacity:0},500),a=!1,$("#ngForm").trigger("reset"),$(".reltype_oth_t0").hide(),n=!1},o.destroy=function(){notify("Destroying namegenerator.",0),$(document).off("keydown",r),$(".cancel").off("click",u),$("#fname_t0, #lname_t0").off("keyup",d),$(document).off("click",".card",c),$(".add-button").off("click",o.openNodeBox),$(".delete-button").off("click",o.removeFromList),$("select[name='reltype_main_t0']").off("change",h),$("select[name='reltype_sub_t0']").off("change",v),$("#ngForm").off("submit",b),window.removeEventListener("changeStageStart",p,!1),$(".newNodeBox").remove(),$(".relationship-types-container").remove(),$(document).off("click",".relationship",s),$(document).off("click",".relationship-button",o.toggleRelationshipBox),$(document).off("click",".relationship-close-button",o.toggleRelationshipBox)},o.init=function(){var e=$('<h1 class="text-center"></h1>').html(o.options.heading);o.options.targetEl.append(e);var t=$('<p class="lead text-center"></p>').html(o.options.subheading);o.options.targetEl.append(t);var a=$('<span class="hi-icon hi-icon-user add-button">Add</span>');o.options.targetEl.append(a);var n=$('<div class="alter-count-box"></div>');o.options.targetEl.append(n);var m=$('<div class="newNodeBox"><form role="form" id="ngForm" class="form"><div class="col-sm-6 left"><h2 style="margin-top:0">Adding a Node</h2><ul><li>Try to be as accurate as you can, but don\'t worry if you aren\'t sure.</li><li>We are interested in your perceptions, so there are no right answers!</li><li>You can use the tab key to quickly move between the fields.</li><li>You can use the enter key to submit the form.</li></ul><button type="button" class="btn btn-danger btn-block delete-button">Delete this Node</button></div><div class="col-sm-6 right"></div></form></div>');$("body").append(m),$.each(o.options.variables,function(e,t){if(t.private!==!0){var o;switch(t.type){case"text":o=$('<div class="form-group '+t.variable+'"><label class="sr-only" for="'+t.variable+'">'+t.label+'</label><input type="text" class="form-control '+t.variable+'" id="'+t.variable+'" placeholder="'+t.label+'"></div></div>');break;case"number":o=$('<div class="form-group '+t.variable+'"><label class="sr-only" for="'+t.variable+'">'+t.label+'</label><input type="number" class="form-control '+t.variable+'" id="'+t.variable+'" placeholder="'+t.label+'"></div></div>');break;case"relationship":o=$('<input type="hidden" class="form-control '+t.variable+'" id="'+t.variable+'" placeholder="'+t.label+'">');break;case"subrelationship":o=$('<input type="hidden" class="form-control '+t.variable+'" id="'+t.variable+'" placeholder="'+t.label+'">')}$(".newNodeBox .form .right").append(o),t.required===!0&&("relationship"===t.type?$("select[name='"+t.variable+"']").prop("required",!0):$("#"+t.variable).prop("required",!0))}}),$(".newNodeBox .form .right").append('<div class="form-group"><button type="button" class="btn btn-primary btn-block relationship-button">Set Relationship Roles</div></div>'),$("select[name='reltype_sub_t0']").prop("disabled",!0);var y=$('<div class="col-sm-6 text-center"><button type="submit" class="btn btn-success btn-block submit-1">Add</button></div><div class="col-sm-6"><span class="btn btn-danger btn-block cancel">Cancel</span></div>');$(".newNodeBox .form .right").append(y),$(".reltype_oth_t0").hide(),n=$('<div class="relationship-types-container"><h1>Select this Individual\'s Relationship Roles from the List Below</h1><p class="lead">Tap each role to select as many as you think apply, then click the close button (above) to continue.</p><button class="btn btn-primary relationship-close-button">Close</button></div>'),$(".newNodeBox").after(n);var f=0;$.each(l,function(e){$(".relationship-types-container").append('<div class="relationship-type rel-'+f+" c"+f+'" data-main-relationship="'+f+'"><h1>'+e+"</h1></div>"),$.each(l[e],function(e,t){$(".rel-"+f).append('<div class="relationship" data-sub-relationship="'+t+'">'+t+"</div>")}),f++});var g=$('<div class="node-container"></div>');o.options.targetEl.append(g);var _=$('<div class="table nameList"></div>');$(".node-container").append(_),window.addEventListener("changeStageStart",p,!1),$(document).on("keydown",r),$(".cancel").on("click",u),$(".add-button").on("click",o.openNodeBox),$(".delete-button").on("click",o.removeFromList),$("#fname_t0, #lname_t0").on("keyup",d),$(document).on("click",".card",c),$("select[name='reltype_main_t0']").on("change",h),$("select[name='reltype_sub_t0']").on("change",v),$("#ngForm").on("submit",b),$(document).on("click",".relationship",s),$(document).on("click",".relationship-button",o.toggleRelationshipBox),$(document).on("click",".relationship-close-button",o.toggleRelationshipBox),$(".alter-count-box").html(i)},o.toggleRelationshipBox=function(){if($(".relationship-types-container").hasClass("open")){if(n){var e=network.getEdges({from:network.getNodes({type_t0:"Ego"})[0].id,to:n,type:"Role"}).length;$(".relationship-button").html(e+" roles selected.")}$.each($(".relationship-type"),function(e,t){setTimeout(function(){console.log(t),$(t).transition({opacity:0,top:"-1000px"},800),$.each($(t).children(".relationship"),function(e,t){setTimeout(function(){$(t).transition({opacity:0,top:"-200px"},800)},400+100*e)})},100*e)}),setTimeout(function(){$(".newNodeBox").show(),$(".relationship-types-container").removeClass("open")},1500)}else{if($(".relationship").removeClass("selected"),n){var t=network.getEdges({from:network.getNodes({type_t0:"Ego"})[0].id,to:n,type:"Role"});$.each(t,function(e,t){$(".rel-"+t.reltype_main_t0).find('div[data-sub-relationship="'+t.reltype_sub_t0+'"]').addClass("selected").data("selected",!0)})}$(".relationship-types-container").addClass("open"),$(".relationship").css({position:"relative",opacity:0,top:"-200px"}),$(".relationship-type").css({position:"relative",opacity:0,top:"-1000px"}),$.each($(".relationship-type"),function(e,t){setTimeout(function(){console.log(t),$(t).transition({opacity:1,top:"0px"},800),$.each($(t).children(".relationship"),function(e,t){setTimeout(function(){$(t).transition({opacity:1,top:0},800)},400+100*e)})},100*e)}),$(".newNodeBox").hide()}},o.addToList=function(e){var t;t=$('<div class="card" data-index="'+e.to+'"><h4>'+e.nname_t0+"</h4></div>");var a=$("<ul></ul>");$.each(o.options.variables,function(t,o){o.private===!1&&void 0!==e[o.variable]&&""!==e[o.variable]&&a.append('<li class="'+e[o.variable]+'"><strong>'+o.label+"</strong>: "+e[o.variable]+"</li>")}),t.append(a),$(".nameList").append(t)},o.removeFromList=function(){$(".delete-button").hide();var e=n;network.removeNode(e),$("div[data-index="+n+"]").remove(),n=!1,o.closeNodeBox()},o.init(),o};