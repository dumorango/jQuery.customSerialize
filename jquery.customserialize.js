function TextToString(){}
TextToString.prototype.deserialize = function(e,val){
  e.val(getText(val));
}
TextToString.prototype.serialize = function(e){
	return e.val()
}
function CheckBoxToBoolean(){}
CheckBoxToBoolean.prototype.deserialize = function(e,val){
	e.prop('checked',(val)?true:false)
}
CheckBoxToBoolean.prototype.serialize = function(e){
	return e.prop('checked')
}
function TextAreaToArray(){}
TextAreaToArray.prototype.deserialize = function(e,val){
	$.each(val,function(){ e.val(e.val()+this+'\n')})
}
TextAreaToArray.prototype.serialize = function(e){
	return e.val().split('\n')
}
function SelectToArray(){}
SelectToArray.prototype.deserialize = function(e,val){
	$.each(val,function(){
		var option = e.append('<option value=\''+this+'\'>'+this+'</option>');
	})
}
SelectToArray.prototype.serialize = function(e){
	var val = []
	e.children('option').each(function(){
		val.push($(this).val())
	});
	return val;
}
function SelectToString(){}
SelectToString.prototype.deserialize = function(e,val){
	e.children().each(function(){
		console.log("Option: value: "+$(this).val())
		if($(this).val()==val) $(this).attr('selected','selected')
	})
}
SelectToString.prototype.serialize = function(e){
	var val;
	e.children().each(function(){
		if($(this).attr('selected')=='selected') val = $(this).val();return;
	})
	return val;
}
function ChildrenToJSON(){}
ChildrenToJSON.prototype.deserialize = function(e,val){
	for(key in val){
		var child = e.find("#"+key);
		if(child){
			fillElement(child,val[key]);
		}
	}
}
ChildrenToJSON.prototype.serialize = function(e){
	var json = {};
	e.children().each(function(){
			var e = $(this);
			$.extend(json,toJSON(e))
			//json[e.attr('id')] = toJSON(e);
	});
	return json;
}
function TableToJSONArray(){}
TableToJSONArray.prototype.deserialize = function(e,val){
	var header = e.find('tr:first');
	if(header){
		for(var i=0;i<val.length;i++){
			var json = val[i];
			var tr = e.append("<tr/>").find('tr:last');
			header.find('th').each(function(){
				var id = $(this).attr('id');
				console.log("JSON: "+JSON.stringify(json)+" Header Id: "+id);	
				tr.append("<td>"+(json[id]!=null?json[id]:"")+"</td>")
			});
		}
	}
}
TableToJSONArray.prototype.serialize = function(e){
	var header = e.find('tr:first');
	if(header){
		var array = [];
		var keys = [];
		header.find('th').each(function(){
			var key = $(this).attr('id');
			keys.push(key);
		});
		e.find('tr').each(function(){
			var row = $(this);
			var i = 0;
			var json = {};
			row.find('td').each(function(){
				var key = keys[i++];
				json[key] = $(this).html()
			});
			if(json!={})array.push(json);
		});
		return array;
	}
}
function fillValues(att){
	var json = JSON.parse(att)
	for(key in json){
		console.log("key: "+key+" value: "+JSON.stringify(json[key])+ " tipo:"+ typeof json[key])
		var element = $('#'+key)
		fillElement(element,json[key])
	}	
}
function fillElement(e,val){
	console.log("Fill Element -> Class: "+e.attr('class')+" Type: "+e.attr("type")+ " TagName: "+e.prop('tagName') +" TypeOf: "+typeof(val)+ " Val: "+val +" Converter:"+e.attr("converter"));
	var converterFunction = e.attr("converter");
	if(!converterFunction){
		converterFunction = getDefaultConverter(e,val);
		e.attr("converter",converterFunction);
	}
	console.log("Converter Function: "+converterFunction)
	if(converterFunction){
		var converter = eval("new "+converterFunction+"(e,val);");
		converter.deserialize(e,val)
	}
}
function toJSON(e){
	console.log("toJSON -> Id: "+e.attr('id')+" Type: "+e.attr("type")+ " TagName: "+e.prop('tagName') +" Converter:"+e.attr("converter"));
	var converterFunction = e.attr("converter");
	var json = {};
	if(converterFunction){
		var converter = eval("new "+converterFunction+"();");
		json[e.attr('id')] = converter.serialize(e);
	}else{
		e.children().each(function(){
			console.log("to JSON -> Childen: "+toJSON($(this)));
			$.extend(json,toJSON($(this)));
		});
		console.log("to JSON -> Childen's JSON: "+JSON.stringify(json));
	}
	return json;
}
(function ($) {
    $.serialize = function (options) {
		return toJSON(this);
	}	
}
function getDefaultConverter(e,val){
	var tag = e.prop('tagName');
	var type = typeof(val);
	var etype = e.attr("type")
	if(tag=='INPUT' || tag=='TEXTAREA'){
		if(etype=='checkbox'){
			return "CheckBoxToBoolean"
		}else{
			if($.isArray(val) && tag=='TEXTAREA'){
				return "TextAreaToArray"
			}else{
				return "TextToString"
			}
		}
	}else if(tag=='SELECT'){
		console.log("Select: ")
		if(type=='string'){
			return "SelectToString"
		}else if($.isArray(val)){
			return "SelectToArray"
		}
	}else if(tag=='FIELDSET' && type=='object' && !$.isArray(val)){
		return "ChildrenToJSON"
	}
}
function getText(val){
	return (typeof(val)=='object')?JSON.stringify(val):val;
}
