API.Plugins.users = {
	element:{
		modal:{
			read:{},
		},
		table:{
			index:{},
		},
	},
	forms:{
		create:{
			0:"username",
			1:"password",
			contact:{
				0:"first_name",
				1:"last_name",
				2:"middle_name",
				3:"client",
				4:"job_title",
				5:"phone",
				6:"mobile",
				7:"office",
				8:"email",
			},
			extra:{
				0:"picture",
				1:"supervisor",
				2:"started_working_on",
				3:"birthday",
				4:"about",
			},
		},
		update:{
			0:"username",
			1:"password",
			contact:{
				0:"first_name",
				1:"last_name",
				2:"middle_name",
				3:"client",
				4:"job_title",
				5:"phone",
				6:"mobile",
				7:"office",
				8:"email",
			},
			extra:{
				0:"about",
				1:"picture",
				2:"supervisor",
				3:"started_working_on",
				4:"birthday",
			},
		},
	},
	options:{
		create:{
			skip:['token','reset_token','location','type','last_login','status','link_to','relationship'],
		},
		update:{
			skip:['token','reset_token','location','type','last_login','status','link_to','relationship'],
		},
	},
	init:function(){
		API.GUI.Sidebar.Nav.add('Users', 'administration');
	},
	load:{
		index:function(){
			API.Builder.card($('#pagecontent'),{ title: 'Users', icon: 'users'}, function(card){
				API.request('users','read',{
					data:{options:{ link_to:'UsersIndex',plugin:'users',view:'index' }},
				},function(result) {
					var dataset = JSON.parse(result);
					if(dataset.success != undefined){
						for(const [key, value] of Object.entries(dataset.output.dom)){ API.Helper.set(API.Contents,['data','dom','users',value.username],value); }
						for(const [key, value] of Object.entries(dataset.output.raw)){ API.Helper.set(API.Contents,['data','raw','users',value.id],value); }
						API.Builder.table(card.children('.card-body'), dataset.output.dom, {
							headers:dataset.output.headers,
							id:'UsersIndex',
							modal:true,
							key:'username',
							set:{
								'status':1,
								'type':'MySQL',
							},
							import:{ key:'username', },
							clickable:{ enable:true, view:'details'},
							controls:{ toolbar:true},
						},function(response){
							API.Plugins.users.element.table.index = response.table;
							response.table.find('button[data-control="Edit"]').each(function(){
								var btn = $(this);
								var data = response.datatable.row($(this).parents('tr')).data();
								if(data.type != "MySQL"){ btn.remove(); }
							});
							response.table.find('button[data-control="Delete"]').each(function(){
								var btn = $(this);
								var data = response.datatable.row($(this).parents('tr')).data();
								if(data.type != "MySQL"){ btn.remove(); }
							});
						});
					}
				});
			});
		},
		details:function(){
			var container = $('div[data-plugin="users"][data-id]').last();
			var url = new URL(window.location.href);
			var id = url.searchParams.get("id");
			API.request(url.searchParams.get("p"),'get',{data:{id:id,key:'id'}},function(result){
				var dataset = JSON.parse(result);
				if(dataset.success != undefined){
					container.attr('data-id',dataset.output.this.raw.id);
					// GUI
					// Adding Layout
					var bgImage = '/plugins/users/dist/img/default.png';
					API.GUI.Layouts.details.build(dataset.output,container,{title:"User Details",image:bgImage},function(data,layout){
						if(layout.main.parents().eq(2).parent('.modal-body').length > 0){
							var modal = layout.main.parents().eq(2).parent('.modal-body').parents().eq(2);
							if(API.Auth.validate('plugin', 'users', 3)){
								modal.find('.modal-header').find('.btn-group').find('[data-control="update"]').off().click(function(){
									API.CRUD.update.show({ container:layout.main.parents().eq(2), keys:data.this.raw });
								});
							} else {
								modal.find('.modal-header').find('.btn-group').find('[data-control="update"]').remove();
							}
						}
						// History
						API.GUI.Layouts.details.tab(data,layout,{icon:"fas fa-history",text:API.Contents.Language["History"]},function(data,layout,tab,content){
							API.Helper.set(API.Contents,['layouts','users',data.this.raw.id,layout.main.attr('id')],layout);
							content.addClass('p-3');
							content.append('<div class="timeline" data-plugin="users"></div>');
							layout.timeline = content.find('div.timeline');
							var today = new Date();
							API.Builder.Timeline.add.date(layout.timeline,today);
							layout.timeline.find('.time-label').first().html('<div class="btn-group"></div>');
							layout.timeline.find('.time-label').first().find('div.btn-group').append('<button class="btn btn-primary" data-table="all">'+API.Contents.Language['All']+'</button>');
							var options = {plugin:"users"}
							// Debug
							if(API.debug){
								API.GUI.Layouts.details.button(data,layout,{icon:"fas fa-stethoscope"},function(data,layout,button){
									button.off().click(function(){
										console.log(data);
										console.log(layout);
									});
								});
							}
							// Clear
							if(API.Auth.validate('custom', 'users_clear', 1)){
								API.GUI.Layouts.details.control(data,layout,{color:"danger",icon:"fas fa-snowplow",text:API.Contents.Language["Clear"]},function(data,layout,button){
									button.off().click(function(){
										API.request('users','clear',{ data:data.this.raw },function(){
											API.Plugins.users.load.details();
										});
									});
								});
							}
							// Useranme
							options.field = "username";
							if(API.Helper.isSet(options,['td'])){ delete options.td; }
							API.GUI.Layouts.details.data(data,layout,options);
							// Name
							options.field = "name";
							if(API.Helper.isSet(options,['td'])){ delete options.td; }
							API.GUI.Layouts.details.data(data,layout,options);
							// Phone
							if(API.Auth.validate('custom', 'users_phone', 1)){
								options.field = "phone";
								options.td = '';
								options.td += '<td>';
									options.td += '<div class="row">';
										if(data.this.dom.phone != ''){
											options.td += '<div class="col-md-6 col-sm-12 p-1">';
												options.td += '<strong><i class="fas fa-phone mr-1"></i></strong><a href="tel:'+data.this.dom.phone+'" data-plugin="users" data-key="phone">'+data.this.dom.phone+'</a>';
											options.td += '</div>';
										}
										if(data.this.dom.mobile != ''){
											options.td += '<div class="col-md-6 col-sm-12 p-1">';
												options.td += '<strong><i class="fas fa-mobile mr-1"></i></strong><a href="tel:'+data.this.dom.mobile+'" data-plugin="users" data-key="mobile">'+data.this.dom.mobile+'</a>';
											options.td += '</div>';
										}
										if(data.this.dom.office_num != ''){
											options.td += '<div class="col-md-6 col-sm-12 p-1">';
												options.td += '<strong><i class="fas fa-phone mr-1"></i></strong><a href="tel:'+data.this.dom.office_num+'" data-plugin="users" data-key="office_num">'+data.this.dom.office_num+'</a>';
											options.td += '</div>';
										}
										if(data.this.dom.other_num != ''){
											options.td += '<div class="col-md-6 col-sm-12 p-1">';
												options.td += '<strong><i class="fas fa-phone mr-1"></i></strong><a href="tel:'+data.this.dom.other_num+'" data-plugin="users" data-key="other_num">'+data.this.dom.other_num+'</a>';
											options.td += '</div>';
										}
									options.td += '</div>';
								options.td += '</td>';
								API.GUI.Layouts.details.data(data,layout,options,function(data,layout,tr){});
							}
							// Email
							options.field = "email";
							options.td = '<td><strong><i class="fas fa-envelope mr-1"></i></strong><a href="mailto:'+data.this.dom.email+'" data-plugin="users" data-key="'+options.field+'">'+data.this.dom.email+'</a></td>';
							API.GUI.Layouts.details.data(data,layout,options,function(data,layout,tr){});
							// Notes
							if(API.Helper.isSet(API.Plugins,['notes']) && API.Auth.validate('custom', 'users_notes', 1)){
								API.GUI.Layouts.details.tab(data,layout,{icon:"fas fa-sticky-note",text:API.Contents.Language["Notes"]},function(data,layout,tab,content){
									layout.timeline.find('.time-label').first().find('div.btn-group').append('<button class="btn btn-secondary" data-table="notes">'+API.Contents.Language['Notes']+'</button>');
									layout.content.notes = content;
									layout.tabs.notes = tab;
									if(API.Auth.validate('custom', 'users_notes', 2)){
										content.append('<div><textarea title="Note" name="note" class="form-control"></textarea></div>');
										content.find('textarea').summernote({
											toolbar: [
												['font', ['fontname', 'fontsize']],
												['style', ['bold', 'italic', 'underline', 'strikethrough', 'superscript', 'subscript', 'clear']],
												['color', ['color']],
												['paragraph', ['style', 'ul', 'ol', 'paragraph', 'height']],
											],
											height: 250,
										});
										var html = '';
										html += '<nav class="navbar navbar-expand-lg navbar-dark bg-dark">';
											html += '<form class="form-inline my-2 my-lg-0 ml-auto">';
												html += '<button class="btn btn-warning my-2 my-sm-0" type="button" data-action="reply"><i class="fas fa-sticky-note mr-1"></i>'+API.Contents.Language['Add Note']+'</button>';
											html += '</form>';
										html += '</nav>';
										content.append(html);
									}
								});
								API.Plugins.users.Events.notes(data,layout);
							}
							// Contacts
							if(API.Helper.isSet(API.Plugins,['contacts']) && API.Auth.validate('custom', 'users_contacts', 1)){
								API.GUI.Layouts.details.tab(data,layout,{icon:"fas fa-address-book",text:API.Contents.Language["Contacts"]},function(data,layout,tab,content){
									layout.timeline.find('.time-label').first().find('div.btn-group').append('<button class="btn btn-secondary" data-table="contacts">'+API.Contents.Language['Contacts']+'</button>');
									layout.content.contacts = content;
									layout.tabs.contacts = tab;
									content.addClass('p-3');
									var html = '';
									html += '<div class="row">';
										html += '<div class="col-md-12 mb-3">';
											html += '<div class="input-group">';
												html += '<input type="text" class="form-control">';
												html += '<div class="input-group-append pointer" data-action="clear">';
													html += '<span class="input-group-text"><i class="fas fa-times" aria-hidden="true"></i></span>';
												html += '</div>';
												html += '<div class="input-group-append">';
													html += '<span class="input-group-text"><i class="icon icon-search mr-1"></i>'+API.Contents.Language["Search"]+'</span>';
												html += '</div>';
											html += '</div>';
										html += '</div>';
									html += '</div>';
									html += '<div class="row"></div>';
									content.append(html);
									area = content.find('div.row').last();
									if(API.Auth.validate('custom', 'users_contacts', 2)){
										var html = '';
										html += '<div class="col-sm-12 col-md-6">';
											html += '<div class="card pointer addContact">';
												html += '<div class="card-body py-4">';
													html += '<div class="text-center p-5">';
														html += '<i class="fas fa-plus-circle fa-10x mt-3 mb-2"></i>';
													html += '</div>';
												html += '</div>';
											html += '</div>';
										html += '</div>';
										area.append(html);
									}
									if(API.Helper.isSet(data,['relations','contacts'])){
										for(var [id, relation] of Object.entries(data.relations.contacts)){
											if(relation.isActive||API.Auth.validate('custom', 'users_contacts_isActive', 1)){
												API.Plugins.users.GUI.contact(relation,layout);
											}
										}
									}
								});
								API.Plugins.users.Events.contacts(data,layout);
							}
							// Created
							options.field = "created";
							options.td = '<td><time class="timeago" datetime="'+data.this.raw.created.replace(/ /g, "T")+'" title="'+data.this.raw.created+'">'+data.this.raw.created+'</time></td>';
							API.GUI.Layouts.details.data(data,layout,options,function(data,layout,tr){ tr.find('time').timeago(); });
							// Subscription
							var icon = "fas fa-bell";
							if(API.Helper.isSet(data,['relations','users',API.Contents.Auth.User.id])){ var icon = "fas fa-bell-slash"; }
							API.GUI.Layouts.details.button(data,layout,{icon:icon},function(data,layout,button){
								button.off().click(function(){
									if(button.find('i').hasClass( "fa-bell" )){
										button.find('i').removeClass("fa-bell").addClass("fa-bell-slash");
										API.request("users",'subscribe',{data:{id:data.this.raw.id}},function(answer){
											var subscription = JSON.parse(answer);
											if(subscription.success != undefined){
												var sub = {};
												for(var [key, value] of Object.entries(API.Contents.Auth.User)){ sub[key] = value; }
												sub.created = subscription.output.relationship.created;
												sub.name = '';
												if((sub.first_name != '')&&(sub.first_name != null)){ if(sub.name != ''){sub.name += ' ';} sub.name += sub.first_name; }
												if((sub.middle_name != '')&&(sub.middle_name != null)){ if(sub.name != ''){sub.name += ' ';} sub.name += sub.middle_name; }
												if((sub.last_name != '')&&(sub.last_name != null)){ if(sub.name != ''){sub.name += ' ';} sub.name += sub.last_name; }
												API.Builder.Timeline.add.subscription(layout.timeline,sub,'bell','lightblue',function(item){
													if((API.Auth.validate('plugin','users',1))&&(API.Auth.validate('view','details',1,'users'))){
														item.find('i').first().addClass('pointer');
														item.find('i').first().off().click(function(){
															API.CRUD.read.show({ key:'username',keys:data.relations.users[item.attr('data-id')], href:"?p=users&v=details&id="+data.relations.users[item.attr('data-id')].username, modal:true });
														});
													}
												});
											}
										});
									} else {
										button.find('i').removeClass("fa-bell-slash").addClass("fa-bell");
										API.request(url.searchParams.get("p"),'unsubscribe',{data:{id:dataset.output.this.raw.id}},function(answer){
											var subscription = JSON.parse(answer);
											if(subscription.success != undefined){
												layout.timeline.find('[data-type="bell"][data-id="'+API.Contents.Auth.User.id+'"]').remove();
											}
										});
									}
								});
							});
							// Timeline
							for(var [rid, relations] of Object.entries(data.relationships)){
								for(var [uid, relation] of Object.entries(relations)){
									if(API.Helper.isSet(API.Plugins,[relation.relationship]) && (API.Auth.validate('custom', 'users_'+relation.relationship, 1) || relation.owner == API.Contents.Auth.User.username) && API.Helper.isSet(data,['relations',relation.relationship,relation.link_to])){
										var details = {};
										for(var [key, value] of Object.entries(data.relations[relation.relationship][relation.link_to])){ details[key] = value; }
										if(typeof relation.statuses !== 'undefined'){ details.status = data.details.statuses.dom[relation.statuses].order; }
										details.created = relation.created;
										details.owner = relation.owner;
										if(!API.Helper.isSet(details,['isActive'])||(API.Helper.isSet(details,['isActive']) && details.isActive)||(API.Helper.isSet(details,['isActive']) && !details.isActive && (API.Auth.validate('custom', 'users_'+relation.relationship+'_isActive', 1)||API.Auth.validate('custom', relation.relationship+'_isActive', 1)))){
											switch(relation.relationship){
												case"notes":
													API.Builder.Timeline.add.card(layout.timeline,details,'sticky-note','warning',function(item){
														item.find('.timeline-footer').remove();
														if(API.Auth.validate('custom', 'users_notes', 4)){
															$('<a class="time bg-warning pointer"><i class="fas fa-trash-alt"></i></a>').insertAfter(item.find('span.time.bg-warning'));
															item.find('a.pointer').off().click(function(){
																API.CRUD.delete.show({ keys:data.relations.notes[item.attr('data-id')],key:'id', modal:true, plugin:'notes' },function(note){
																	item.remove();
																});
															});
														}
													});
													break;
												case"contacts":
													API.Builder.Timeline.add.contact(layout.timeline,details,'address-card','secondary',function(item){
														item.find('i').first().addClass('pointer');
														item.find('i').first().off().click(function(){
															value = item.attr('data-name').toLowerCase();
															layout.content.contacts.find('input').val(value);
															layout.tabs.contacts.find('a').tab('show');
															layout.content.contacts.find('[data-csv]').hide();
															layout.content.contacts.find('[data-csv*="'+value+'"]').each(function(){ $(this).show(); });
														});
													});
													break;
												case"users":
													API.Builder.Timeline.add.subscription(layout.timeline,details,'bell','lightblue',function(item){
														if((API.Auth.validate('plugin','users',1))&&(API.Auth.validate('view','details',1,'users'))){
															item.find('i').first().addClass('pointer');
															item.find('i').first().off().click(function(){
																API.CRUD.read.show({ key:'username',keys:data.details.users.dom[item.attr('data-id')], href:"?p=users&v=details&id="+data.details.users.dom[item.attr('data-id')].username, modal:true });
															});
														}
													});
													break;
											}
										}
									}
								}
							}
							layout.timeline.find('.time-label').first().find('div.btn-group button').off().click(function(){
								var filters = layout.timeline.find('.time-label').first().find('div.btn-group');
								var all = filters.find('button').first();
								if($(this).attr('data-table') != 'all'){
									if(all.hasClass("btn-primary")){ all.removeClass('btn-primary').addClass('btn-secondary'); }
									if($(this).hasClass("btn-secondary")){ $(this).removeClass('btn-secondary').addClass('btn-primary'); }
									else { $(this).removeClass('btn-primary').addClass('btn-secondary'); }
									layout.timeline.find('[data-type]').hide();
									layout.timeline.find('.time-label').first().find('div.btn-group button.btn-primary').each(function(){
										switch($(this).attr('data-table')){
											case"notes":var icon = 'sticky-note';break;
											case"comments":var icon = 'comment';break;
											case"users":var icon = 'bell';break;
										}
										if((icon != '')&&(typeof icon !== 'undefined')){ layout.timeline.find('[data-type="'+icon+'"]').show(); }
									});
								} else {
									filters.find('button').removeClass('btn-primary').addClass('btn-secondary');
									all.removeClass('btn-secondary').addClass('btn-primary');
									layout.timeline.find('[data-type]').show();
								}
							});
						});
					});
				}
			});
		},
	},

	GUI:{
		picture:function(dataset,layout){
			var html = '';
			html += '<div class="col-sm-12 col-md-6 col-lg-4 picture" data-picture="'+dataset.id+'">';
				html += '<div class="card pointer addContact">';
					html += '<div class="card-body p-0">';
						html += '<div class="text-center">';
							html += '<img class="img-fluid" data-picture="'+dataset.id+'" style="border-radius:4px;" src="'+dataset.dirname+'/'+dataset.basename+'" alt="'+dataset.basename+'" />';
							html += '<button class="btn btn-danger collapse align-middle" data-picture="'+dataset.id+'"><i class="fas fa-trash-alt my-4"></i></button>';
						html += '</div>';
					html += '</div>';
				html += '</div>';
			html += '</div>';
			layout.content.galleries.area.prepend(html);
			var picture = layout.content.galleries.area.find('div[data-picture="'+dataset.id+'"]').first();
			picture.find('div.card').off().on({
		    mouseenter:function(){ picture.find('button').collapse('show'); },
		    mouseleave:function(){ picture.find('button').collapse('hide'); }
			});
		},
		contact:function(dataset,layout,plugin = 'contacts'){
			var area = layout.content[plugin].find('div.row').eq(1);
			area.prepend(API.Plugins.users.GUI.card(dataset));
			var card = area.find('div.col-sm-12.col-md-6').first();
			if(API.Helper.isSet(dataset,['users'])){
				if(API.Auth.validate('custom', 'users_'+plugin+'_btn_details', 1)){
					card.find('div.btn-group').append(API.Plugins.users.GUI.button(dataset,{id:'id',color:'primary',icon:'fas fa-user',action:'details',content:API.Contents.Language['Details']}));
				}
			} else {
				if(API.Auth.validate('custom', 'users_'+plugin+'_btn_link', 1)){
					card.find('div.btn-group').append(API.Plugins.users.GUI.button(dataset,{id:'id',color:'navy',icon:'fas fa-link',action:'link',content:API.Contents.Language['Add User']}));
				}
			}
			if(API.Auth.validate('custom', 'users_'+plugin+'_btn_edit', 1)){
				card.find('div.btn-group').append(API.Plugins.users.GUI.button(dataset,{id:'id',color:'warning',icon:'fas fa-edit',action:'edit',content:API.Contents.Language['Edit']}));
			}
			if(API.Auth.validate('custom', 'users_'+plugin+'_btn_delete', 1)){
				card.find('div.btn-group').append(API.Plugins.users.GUI.button(dataset,{id:'id',color:'danger',icon:'fas fa-trash-alt',action:'delete',content:''}));
			}
		},
		button:function(dataset,options = {}){
			var defaults = {
				icon:"fas fa-building",
				action:"details",
				color:"primary",
				key:"name",
				id:"id",
				content:"",
			};
			if(API.Helper.isSet(options,['icon'])){ defaults.icon = options.icon; }
			if(API.Helper.isSet(options,['action'])){ defaults.action = options.action; }
			if(API.Helper.isSet(options,['color'])){ defaults.color = options.color; }
			if(API.Helper.isSet(options,['key'])){ defaults.key = options.key; }
			if(API.Helper.isSet(options,['id'])){ defaults.id = options.id; }
			if(API.Helper.isSet(options,['content'])){ defaults.content = options.content; }
			else { defaults.content = dataset[defaults.key]; }
			if(defaults.content != ''){ defaults.icon += ' mr-1'; }
			return '<button type="button" class="btn btn-sm bg-'+defaults.color+'" data-id="'+dataset[defaults.id]+'" data-action="'+defaults.action+'"><i class="'+defaults.icon+'"></i>'+defaults.content+'</button>';
		},
		buttons:{
			details:function(dataset,options = {}){
				var defaults = {
					icon:{details:"fas fa-building",remove:"fas fa-unlink"},
					action:{details:"details",remove:"unlink"},
					color:{details:"primary",remove:"danger"},
					key:"name",
					id:"id",
					content:"",
					remove:false,
				};
				if(API.Helper.isSet(options,['icon','details'])){ defaults.icon.details = options.icon.details; }
				if(API.Helper.isSet(options,['icon','remove'])){ defaults.icon.remove = options.icon.remove; }
				if(API.Helper.isSet(options,['color','details'])){ defaults.color.details = options.color.details; }
				if(API.Helper.isSet(options,['color','remove'])){ defaults.color.remove = options.color.remove; }
				if(API.Helper.isSet(options,['action','details'])){ defaults.action.details = options.action.details; }
				if(API.Helper.isSet(options,['action','remove'])){ defaults.action.remove = options.action.remove; }
				if(API.Helper.isSet(options,['key'])){ defaults.key = options.key; }
				if(API.Helper.isSet(options,['id'])){ defaults.id = options.id; }
				if(API.Helper.isSet(options,['remove'])){ defaults.remove = options.remove; }
				if(API.Helper.isSet(options,['content'])){ defaults.content = options.content; }
				else { defaults.content = dataset[defaults.key]; }
				var html = '';
				html += '<div class="btn-group m-1" data-id="'+dataset[defaults.id]+'">';
					html += '<button type="button" class="btn btn-xs bg-'+defaults.color.details+'" data-id="'+dataset[defaults.id]+'" data-action="'+defaults.action.details+'"><i class="'+defaults.icon.details+' mr-1"></i>'+defaults.content+'</button>';
					if(defaults.remove){
						html += '<button type="button" class="btn btn-xs bg-'+defaults.color.remove+'" data-id="'+dataset[[defaults.id]]+'" data-action="'+defaults.action.remove+'"><i class="'+defaults.icon.remove+'"></i></button>';
					}
				html += '</div>';
				return html;
			},
		},
		card:function(dataset,options = {}){
			var csv = '';
			for(var [key, value] of Object.entries(dataset)){
				if(value == null){ value = '';dataset[key] = value; };
				if(jQuery.inArray(key,['first_name','middle_name','last_name','name','email','phone','mobile','office_num','other_num','about','job_title']) != -1){
					if(typeof value == 'string'){ csv += value.replace(',','').toLowerCase()+','; }
					else { csv += value+','; }
				}
			}
			var html = '';
			html += '<div class="col-sm-12 col-md-6 contactCard" data-csv="'+csv+'" data-id="'+dataset.id+'">';
			  html += '<div class="card">';
					if(!dataset.isActive){ html += '<div class="ribbon-wrapper ribbon-xl"><div class="ribbon bg-danger text-xl">'+API.Contents.Language['Inactive']+'</div></div>'; }
			    html += '<div class="card-header border-bottom-0">';
			      html += '<b class="mr-1">Title:</b>'+dataset.job_title;
			    html += '</div>';
			    html += '<div class="card-body pt-0">';
			      html += '<div class="row">';
			        html += '<div class="col-7">';
			          html += '<h2 class="lead"><b>'+dataset.name+'</b></h2>';
			          html += '<p class="text-sm"><b>About: </b> '+dataset.about+' </p>';
			          html += '<ul class="ml-4 mb-0 fa-ul">';
			            html += '<li class="small"><span class="fa-li"><i class="fas fa-lg fa-at"></i></span><b class="mr-1">Email:</b><a href="mailto:'+dataset.email+'">'+dataset.email+'</a></li>';
			            html += '<li class="small"><span class="fa-li"><i class="fas fa-lg fa-phone"></i></span><b class="mr-1">Phone #:</b><a href="tel:'+dataset.phone+'">'+dataset.phone+'</a></li>';
			            html += '<li class="small"><span class="fa-li"><i class="fas fa-lg fa-phone"></i></span><b class="mr-1">Office #:</b><a href="tel:'+dataset.office_num+'">'+dataset.office_num+'</a></li>';
			            html += '<li class="small"><span class="fa-li"><i class="fas fa-lg fa-mobile"></i></span><b class="mr-1">Mobile #:</b><a href="tel:'+dataset.mobile+'">'+dataset.mobile+'</a></li>';
			            html += '<li class="small"><span class="fa-li"><i class="fas fa-lg fa-phone"></i></span><b class="mr-1">Other #:</b><a href="tel:'+dataset.other_num+'">'+dataset.other_num+'</a></li>';
			          html += '</ul>';
			        html += '</div>';
			        html += '<div class="col-5 text-center">';
			          html += '<img src="/dist/img/default.png" alt="user-avatar" class="img-circle img-fluid">';
			        html += '</div>';
			      html += '</div>';
			    html += '</div>';
			    html += '<div class="card-footer">';
			      html += '<div class="text-right">';
			        html += '<div class="btn-group"></div>';
			      html += '</div>';
			    html += '</div>';
			  html += '</div>';
			html += '</div>';
			return html;
		},
	},
	Events:{
		users:function(dataset,layout,options = {},callback = null){
			if(options instanceof Function){ callback = options; options = {}; }
			var defaults = {key: "setHosts",remove:false};
			if(API.Helper.isSet(options,['remove'])){ defaults.remove = options.remove; }
			if(API.Helper.isSet(options,['key'])){ defaults.key = options.key; }
			var td = layout.details.find('td[data-plugin="users"][data-key="'+defaults.key+'"]');
			td.find('button').off().click(function(){
				var button = $(this);
				if(button.attr('data-action') != "add"){
					if(API.Helper.isSet(API.Contents,['data','raw','users',button.attr('data-id')])){
						var user = {raw:API.Contents.data.raw.users[button.attr('data-id')],dom:{}};
						user.dom = API.Contents.data.dom.users[user.raw.username];
					} else {
						var user = {
							dom:dataset.details.users.dom[button.attr('data-id')],
							raw:dataset.details.users.raw[button.attr('data-id')],
						};
					}
				}
				switch(button.attr('data-action')){
					case"details":
						API.CRUD.read.show({ key:'username',keys:user.dom, href:"?p=users&v=details&id="+user.raw.username, modal:true });
						break;
					case"remove":
						API.request('users','unlink',{data:{id:dataset.this.raw.id,relationship:{relationship:defaults.key,link_to:button.attr('data-id')}}},function(result){
							var sub_dataset = JSON.parse(result);
							if(sub_dataset.success != undefined){
								td.find('.btn-group[data-id="'+sub_dataset.output.id+'"]').remove();
							}
						});
						break;
					case"add":
						API.Builder.modal($('body'), {
							title:'Add a user',
							icon:'user',
							zindex:'top',
							css:{ header: "bg-gray", body: "p-3"},
						}, function(modal){
							modal.on('hide.bs.modal',function(){ modal.remove(); });
							var dialog = modal.find('.modal-dialog');
							var header = modal.find('.modal-header');
							var body = modal.find('.modal-body');
							var footer = modal.find('.modal-footer');
							header.find('button[data-control="hide"]').remove();
							header.find('button[data-control="update"]').remove();
							API.Builder.input(body, 'user', null, function(input){});
							footer.append('<button class="btn btn-secondary" data-action="add"><i class="fas fa-user-plus mr-1"></i>'+API.Contents.Language['Add']+'</button>');
							footer.find('button[data-action="add"]').off().click(function(){
								if((typeof body.find('select').select2('val') !== "undefined")&&(body.find('select').select2('val') != '')){
									API.request('users','link',{data:{id:dataset.this.dom.id,relationship:{relationship:defaults.key,link_to:body.find('select').select2('val')}}},function(result){
										var sub_dataset = JSON.parse(result);
										if(sub_dataset.success != undefined){
											API.Helper.set(API.Contents,['data','dom','users',sub_dataset.output.dom.id],sub_dataset.output.dom);
											API.Helper.set(API.Contents,['data','raw','users',sub_dataset.output.raw.id],sub_dataset.output.raw);
											API.Helper.set(dataset.details,['users','dom',sub_dataset.output.dom.id],sub_dataset.output.dom);
											API.Helper.set(dataset.details,['users','raw',sub_dataset.output.raw.id],sub_dataset.output.raw);
											API.Helper.set(dataset,['relations','users',sub_dataset.output.dom.id],sub_dataset.output.dom);
											var html = API.Plugins.users.GUI.buttons.details(sub_dataset.output.dom,{
												remove:defaults.remove,
												key: "username",
												icon:{details:"fas fa-user",remove:"fas fa-user-minus"},
												action:{remove:"remove"},
											})
											if(td.find('button[data-action="add"]').length > 0){
												td.find('button[data-action="add"]').before(html);
											} else { td.append(html); }
											sub_dataset.output.dom.owner = sub_dataset.output.timeline.owner;
											sub_dataset.output.dom.created = sub_dataset.output.timeline.created;
											API.Plugins.users.Events.users(dataset,layout,defaults);
										}
									});
									modal.modal('hide');
								} else {
									body.find('.input-group').addClass('is-invalid');
									alert('No organization were selected!');
								}
							});
							modal.modal('show');
						});
						break;
				}
			});
			if(callback != null){ callback(dataset,layout); }
		},
		notes:function(dataset,layout,options = {},callback = null){
			if(options instanceof Function){ callback = options; options = {}; }
			var defaults = {field: "name"};
			if(API.Helper.isSet(options,['field'])){ defaults.field = options.field; }
			if(API.Auth.validate('custom', 'users_notes', 2)){
				layout.content.notes.find('button').off().click(function(){
				  if(!layout.content.notes.find('textarea').summernote('isEmpty')){
				    var note = {
				      by:API.Contents.Auth.User.id,
				      content:layout.content.notes.find('textarea').summernote('code'),
				      relationship:'users',
				      link_to:dataset.this.dom.id,
				      status:dataset.this.raw.status,
				    };
				    layout.content.notes.find('textarea').val('');
				    layout.content.notes.find('textarea').summernote('code','');
				    layout.content.notes.find('textarea').summernote('destroy');
				    layout.content.notes.find('textarea').summernote({
				      toolbar: [
				        ['font', ['fontname', 'fontsize']],
				        ['style', ['bold', 'italic', 'underline', 'strikethrough', 'superscript', 'subscript', 'clear']],
				        ['color', ['color']],
				        ['paragraph', ['style', 'ul', 'ol', 'paragraph', 'height']],
				      ],
				      height: 250,
				    });
				    API.request('users','note',{data:note},function(result){
				      var data = JSON.parse(result);
				      if(data.success != undefined){
				        API.Builder.Timeline.add.card(layout.timeline,data.output.note.dom,'sticky-note','warning',function(item){
				          item.find('.timeline-footer').remove();
				          if(API.Auth.validate('custom', 'users_notes', 4)){
				            $('<a class="time bg-warning pointer"><i class="fas fa-trash-alt"></i></a>').insertAfter(item.find('span.time.bg-warning'));
										item.find('a.pointer').off().click(function(){
											API.CRUD.delete.show({ keys:data.output.note.dom,key:'id', modal:true, plugin:'notes' },function(note){
												item.remove();
											});
										});
				          }
				        });
				      }
				    });
				    layout.tabs.find('a').first().tab('show');
				  } else {
				    layout.content.notes.find('textarea').summernote('destroy');
				    layout.content.notes.find('textarea').summernote({
				      toolbar: [
				        ['font', ['fontname', 'fontsize']],
				        ['style', ['bold', 'italic', 'underline', 'strikethrough', 'superscript', 'subscript', 'clear']],
				        ['color', ['color']],
				        ['paragraph', ['style', 'ul', 'ol', 'paragraph', 'height']],
				      ],
				      height: 250,
				    });
				    alert(API.Contents.Language['Note is empty']);
				  }
				});
			}
		},
		contacts:function(dataset,layout,options = {},callback = null){
			if(options instanceof Function){ callback = options; options = {}; }
			var defaults = {field: "name"};
			if(API.Helper.isSet(options,['field'])){ defaults.field = options.field; }
			var contacts = layout.content.contacts.find('div.row').eq(1);
			var search = layout.content.contacts.find('div.row').eq(0);
			var skeleton = {};
			for(var [field, settings] of Object.entries(API.Contents.Settings.Structure.contacts)){ skeleton[field] = ''; }
			search.find('div[data-action="clear"]').off().click(function(){
				$(this).parent().find('input').val('');
				contacts.find('[data-csv]').show();
			});
			search.find('input').off().on('input',function(){
				if($(this).val() != ''){
					contacts.find('[data-csv]').hide();
					contacts.find('[data-csv*="'+$(this).val().toLowerCase()+'"]').each(function(){ $(this).show(); });
				} else { contacts.find('[data-csv]').show(); }
			});
			if(API.Auth.validate('custom', 'users_contacts', 2)){
				contacts.find('.addContact').off().click(function(){
					API.CRUD.create.show({ plugin:'contacts', keys:skeleton, set:{isActive:'true',relationship:'users',link_to:dataset.this.raw.id} },function(created,user){
						if(created){
							user.dom.name = '';
							if((user.dom.first_name != '')&&(user.dom.first_name != null)){ if(user.dom.name != ''){user.dom.name += ' ';} user.dom.name += user.dom.first_name; }
							if((user.dom.middle_name != '')&&(user.dom.middle_name != null)){ if(user.dom.name != ''){user.dom.name += ' ';} user.dom.name += user.dom.middle_name; }
							if((user.dom.last_name != '')&&(user.dom.last_name != null)){ if(user.dom.name != ''){user.dom.name += ' ';} user.dom.name += user.dom.last_name; }
							API.Helper.set(dataset,['details','contacts','dom',user.dom.id],user.dom);
							API.Helper.set(dataset,['details','contacts','raw',user.raw.id],user.raw);
							API.Helper.set(dataset,['relations','contacts',user.dom.id],user.dom);
							API.Plugins.users.GUI.contact(user.dom,layout);
							API.Plugins.users.Events.contacts(dataset,layout);
							API.Builder.Timeline.add.contact(layout.timeline,user.dom,'address-card','secondary',function(item){
								item.find('i').first().addClass('pointer');
								item.find('i').first().off().click(function(){
									value = item.attr('data-name').toLowerCase();
									layout.content.contacts.find('input').val(value);
									layout.tabs.contacts.find('a').tab('show');
									layout.content.contacts.find('[data-csv]').hide();
									layout.content.contacts.find('[data-csv*="'+value+'"]').each(function(){ $(this).show(); });
								});
							});
						}
					});
				});
			}
			contacts.find('button').off().click(function(){
				var contact = dataset.relations.contacts[$(this).attr('data-id')];
				switch($(this).attr('data-action')){
					case"details":
						API.CRUD.read.show({ key:'username',keys:contact.users[Object.keys(contact.users)[0]], href:"?p=users&v=details&id="+contact.users[Object.keys(contact.users)[0]].username, modal:true });
						break;
					case"link":
						break;
					case"edit":
						API.CRUD.update.show({ keys:contact, modal:true, plugin:'contacts' },function(user){
							user.dom.name = '';
							if((user.dom.first_name != '')&&(user.dom.first_name != null)){ if(user.dom.name != ''){user.dom.name += ' ';} user.dom.name += user.dom.first_name; }
							if((user.dom.middle_name != '')&&(user.dom.middle_name != null)){ if(user.dom.name != ''){user.dom.name += ' ';} user.dom.name += user.dom.middle_name; }
							if((user.dom.last_name != '')&&(user.dom.last_name != null)){ if(user.dom.name != ''){user.dom.name += ' ';} user.dom.name += user.dom.last_name; }
							API.Helper.set(dataset,['relations','contacts',user.dom.id],user.dom);
							contacts.find('[data-id="'+user.raw.id+'"]').remove();
							API.Plugins.users.GUI.contact(user.dom,layout);
							API.Plugins.users.Events.contacts(dataset,layout);
						});
						break;
					case"delete":
						contact.link_to = dataset.this.raw.id;
						API.CRUD.delete.show({ keys:contact,key:'name', modal:true, plugin:'contacts' },function(user){
							if(contacts.find('[data-id="'+contact.id+'"]').find('.ribbon-wrapper').length > 0 || !API.Auth.validate('custom', 'users_contacts_isActive', 1)){
								contacts.find('[data-id="'+contact.id+'"]').remove();
								layout.timeline.find('[data-type="address-card"][data-id="'+contact.id+'"]').remove();
							}
							if(contact.isActive && API.Auth.validate('custom', 'users_contacts_isActive', 1)){
								contact.isActive = user.isActive;
								API.Helper.set(dataset,['relations','contacts',contact.id,'isActive'],contact.isActive);
								contacts.find('[data-id="'+contact.id+'"] .card').prepend('<div class="ribbon-wrapper ribbon-xl"><div class="ribbon bg-danger text-xl">'+API.Contents.Language['Inactive']+'</div></div>');
							}
						});
						break;
				}
			});
			if(callback != null){ callback(dataset,layout); }
		},
	},
}

API.Plugins.users.init();
