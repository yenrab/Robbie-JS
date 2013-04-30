/*
 Copyright (c) 2012 Rex Barzee and Lee Barney
 Permission is hereby granted, free of charge, to any person obtaining a 
 copy of this software and associated documentation files (the "Software"), 
 to deal in the Software without restriction, including without limitation the 
 rights to use, copy, modify, merge, publish, distribute, sublicense, 
 and/or sell copies of the Software, and to permit persons to whom the Software 
 is furnished to do so, subject to the following conditions:
 
 The above copyright notice and this permission notice shall be 
 included in all copies or substantial portions of the Software.
 
 
 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, 
 INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A 
 PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT 
 HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF 
 CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE 
 OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

 var arg;
var assignments = [ 'intro', 'select', 'repeat', 'func', 'array' ];
var needFuncHeader =  [ 'intro', 'select', 'repeat', 'array' ];

/** A list of commands used for the array assignment only. */
var commands = [
	'print("Hello!")',
	'print("I am Robbie.")',
	'print("As I move in the robot arena, I am tracing the shape of an English letter.")',
	'print("Try to guess the letter.")',
	'turnRight()',
	'moveForward()',
	'moveForward()',
	'moveForward()',
	'moveForward()',
	'moveBackward()',
	'moveBackward()',
	'turnLeft()',
	'moveForward()',
	'moveForward()',
	'moveForward()',
	'turnRight()',
	'moveBackward()',
	'moveBackward()',
	'moveForward()',
	'moveForward()',
	'moveForward()',
	'moveForward()',
	'print("What did you guess?")',
	'print("\'H\' is correct.")'
];

function $(id){
	return document.getElementById(id);
}

var currentAssignment = null;
function displayAssignment(type){
	// Make the correct instructions visible.
	if(!type){
		type = window.location.search.substring(1);
	}
	if(!type){
		type = 'intro';
	}
	if(currentAssignment != type){
		if (assignments.indexOf(type) != -1) {
			$(type).style.display = 'block';
			if(currentAssignment){
				$(currentAssignment).style.display = 'none';
			}
		}
		var displayFunction = 'inline';
		if (needFuncHeader.indexOf(type) == -1) {
			displayFunction = 'none';
		}
		$("functionStartDiv").style.display = displayFunction;
		$("functionEndDiv").style.display = displayFunction;
		currentAssignment = type;

		resetRobbie();
		clearCode();
		clearOutput();
	}
	return type;
}
function setup(type) {
	displayAssignment(type);
	var arena = $('arena');

	// Create image nodes for the dots and place them in the arena.
	for (var i = 0;  i < 35;  i++) {
		arena.appendChild(createDot());
	}

	// Create the image node for the robot and place it in the arena.
	var robot = createRobot();
	if(robot){
		arena.appendChild(robot);
	}
	// Allow students to type the tab key in the code textarea.
	$('code').onkeydown = keyDown;
}

function createDot() {
	var dot = document.createElement('img');
	dot.className = 'dot';
	dot.src = 'dot.png';
	return dot;
}

function createRobot() {
	var robot = null;
	if(!$('robot')){
		robot = document.createElement('img');
		robot.id = 'robot';
		robot.src = 'robot.png';
		robot.alt = 'Robbie';
		robot.title = 'Robbie';
		robot.bean = new robotBean();
	}
	return robot;
}

function robotBean() {
	this.row = 0;
	this.col = 0;
	this.rotation = 90;
}

// Set desired tab- defaults to four space softtab
var tab = "    ";

function keyDown(evt)
{
	var t = evt.target;
	var kc = evt.which ? evt.which : evt.keyCode, isSafari = navigator.userAgent.toLowerCase().indexOf("safari") != -1;

	if (kc == 9 || (isSafari && kc == 25)){
		t.focus();
		evt.preventDefault();
		var tab = '    ',tablen = tab.length,  tab_regexp = /\n\s\s\s\s/g;
		if(t.value.length == 0){
			t.value = tab;
			return;
		}
		// hack for ie
		if (!t.selectionStart && document.selection)
		{
			var range = document.selection.createRange();
			var stored_range = range.duplicate();
			stored_range.moveToElementText(t);
			stored_range.setEndPoint('EndToEnd', range);
			t.selectionStart = stored_range.text.length - range.text.length;
			t.selectionEnd = t.selectionStart + range.text.length;
			t.setSelectionRange = function(start, end){
				var range = this.createTextRange();
				range.collapse(true);
				range.moveStart("character", start);
				range.moveEnd("character", end - start);
				range.select();
			}
		}
		var tab = '    ',tablen = tab.length,  tab_regexp = /\n\s\s\s\s/g;
		/*if(t.value.length == 0){
			t.value = tab;
			return;
		}*/
		var ss = t.selectionStart, se = t.selectionEnd, ta_val = t.value, sel = ta_val.slice(ss, se); shft = (isSafari && kc == 25) || evt.shiftKey;
		var was_tab = ta_val.slice(ss - tablen, ss) == tab, starts_with_tab = ta_val.slice(ss, ss + tablen) == tab, offset = shft ? 0-tablen : tablen, full_indented_line = false, num_lines = sel.split("\n").length;

		if (ss != se && sel[sel.length-1] == '\n') { se--; sel = ta_val.slice(ss, se); num_lines--; }
		if (num_lines == 1 && starts_with_tab) full_indented_line = true;

		if (!shft || was_tab || num_lines > 1 || full_indented_line)
		{
			// multi-line selection
			if (num_lines > 1)
			{
			// tab each line
				if (shft && (was_tab || starts_with_tab) && sel.split(tab_regexp).length == num_lines)
				{
				if (!was_tab) sel = sel.substring(tablen);
					t.value = ta_val.slice(0, ss - (was_tab ? tablen : 0)).concat(sel.replace(tab_regexp, "\n")).concat(ta_val.slice(se, ta_val.length));
					ss += was_tab ? offset : 0; se += offset * num_lines;
				}
				else if (!shft)
				{
					t.value = ta_val.slice(0, ss).concat(tab).concat(sel.replace(/\n/g, "\n" + tab)).concat(ta_val.slice(se, ta_val.length));
					se += offset * num_lines;
				}
			}

			// single-line selection
			else{
			if (shft)
			t.value = ta_val.slice(0, ss - (full_indented_line ? 0 : tablen)).concat(ta_val.slice(ss + (full_indented_line ? tablen : 0), ta_val.length));
			else
			t.value = ta_val.slice(0, ss).concat(tab).concat(ta_val.slice(ss, ta_val.length));

			if (ss == se)
			ss = se = ss + offset;
			else
			se += offset;
			}
		}
		setTimeout("var t=$('" + t.id + "'); t.focus(); t.setSelectionRange(" + ss + ", " + se + ");", 0);
		return false;
	}
}


function runCode() {
	// Remove the old script tag.
	var script = $('funcScript');
	var scriptParent = script.parentNode;
	scriptParent.removeChild(script);
	script = document.createElement('script');
	script.id = 'funcScript';
	// Get the code the user typed.
	var code = $('code').value;
	if (needFuncHeader.indexOf(currentAssignment) != -1) {
		code = 'function run() {'+code+'}';
	}

	// Copy the code to the script tag.
	script.innerHTML = code;
	scriptParent.appendChild(script);

	// Execute the code insertion to the queue.
	run();

	// Execute the queue.
	runQueue();
}

function runQueue() {
	var aFunction = queue.shift();
	if (aFunction) {
		aFunction();
		setTimeout(runQueue, 1000);
	}
}


function resetRobbie() {
	var robot = $('robot');
	if(robot){
		var bean = robot.bean;
		bean.row = 0;
		bean.col = 0;
		robot.style.left = '0px';
		robot.style.top = '0px';
		robot.style.webkitTransform = '';
		robot.style.MozTransform = 'rotate('+rot+'deg)';
	    robot.style.msTransform = 'rotate('+rot+'deg)';
	    robot.style.OTransform = 'rotate('+rot+'deg)';
		robot.style.transform = 'rotate('+rot+'deg)';
	}
}

function clearCode() {
	$('code').value ='';
}

function clearOutput() {
	$('output').innerHTML = '<h3>Print Messages</h3>';
}


var dotMargin = 25;
var dotDiam = 5;
var cellSize = dotMargin + dotDiam + dotMargin;
var queue = new Array();


function moveForward()  { 
	queue.push(function() {move(1);}); 
}
function moveBackward() { queue.push(function() {move(-1);}); }
function turnRight() { queue.push(function() {rotate(90);}); }
function turnLeft()  { queue.push(function() {rotate(-90);}); }
function print(msg) { queue.push(function() {debug(msg);}); }


function offset(aNode){
	var curleft = 0;
	var curtop = 0;
	var width = aNode.offsetWidth;
	var height = aNode.offsetHeight;
	if (aNode.offsetParent) {
		curleft = aNode.offsetLeft;
		curtop = aNode.offsetTop;
		while (aNode = aNode.offsetParent){
			curleft += aNode.offsetLeft;
			curtop += aNode.offsetTop;
		}
	}
	return {'left':curleft,'top':curtop, 'width':width, 'height':height};
}

/* Moves the robot one cell
 * forward if direction == 1
 * and backward if direction == -1. */
function move(direction) {

	// Get the rotation and normalize it to be between [0, 360)
	var robot = $('robot');
	var bean = robot.bean;
	var rot = bean.rotation;
	while (rot < 0) {
		rot += 360;
	}
	while (rot >= 360) {
		rot -= 360;
	}

	var direc = direction;
	if (rot == 0 || rot == 270) {
		direc *= -1;
	}

	var arena = $('arena');
	var arenaOffset = offset(arena);
	var robotOffset = offset(robot);
	if (rot == 90 || rot == 270) {
		var nextColumn = bean.col + direc;
		var cols = Math.floor(arenaOffset.width / cellSize);
		if (0 <= nextColumn && nextColumn < cols) {
			bean.col = nextColumn;
			//robotOffset.left = Math.round(arenaOffset.left + c * cellSize);
			robotOffset.left = Math.round(nextColumn * cellSize);
			robot.style.left = robotOffset.left+'px';
		}
		else {
			debug("Robbie: 'Unable to move " +
					(direction == 1 ? "forward" : "backward") +
					". Terminating movement.'");
			queue = new Array();
			return;
		}
	}
	else {  // 0 or 180 degrees
		var nextRow = bean.row + direc;
		var rows = Math.floor(arenaOffset.height / cellSize);
		if (0 <= nextRow && nextRow < rows) {
			bean.row = nextRow;
			//robotOffset.top = Math.round(arenaOffset.top + r * cellSize * 1.09);
			robotOffset.top = Math.round(nextRow * cellSize * 1.09);
			robot.style.top = robotOffset.top+'px';
		}
		else {
			debug("Robbie: 'Unable to move " +
					(direction == 1 ? "forward" : "backward") +
					". Terminating movement.'");
			queue = new Array();
			return;
		}
	}
	//robot.offset(robotOffset);
}


function rotate(degrees) {
	var robot = $('robot');
	var bean = robot.bean;
	var rot = bean.rotation;
	rot += degrees;
	bean.rotation = rot;
	robot.style.webkitTransform = 'rotate('+rot+'deg)';
	robot.style.MozTransform = 'rotate('+rot+'deg)';
    robot.style.msTransform = 'rotate('+rot+'deg)';
    robot.style.OTransform = 'rotate('+rot+'deg)';
	robot.style.transform = 'rotate('+rot+'deg)';
}


function debug(msg) {
	var output = $('output');
	output.innerHTML += msg + '<br>';
}

/*
 * Store the current instructions to local storage.
 */
var htPrefix = 'h_t_';
var curFileName = null;
function saveFile(shouldSaveAs) {
	if(curFileName == null || shouldSaveAs){
		var fileName=window.prompt("Save File: ");
		if(fileName == null){
			return;
		}
		curFileName = fileName;
	}
	var dataToStore = [currentAssignment,escape(document.getElementById('code').value)];
	localStorage.setItem(htPrefix+curFileName, JSON.stringify(dataToStore));
}

function openFile(){
	
	var selector = document.getElementById('fileList');
	var defaultSet = false;
	for(var retrievedFileName in localStorage){
		if(retrievedFileName.indexOf(htPrefix) == 0){
			retrievedFileName = retrievedFileName.substring(4);
			var anOption = document.createElement('option');
			anOption.value = retrievedFileName;
			anOption.innerHTML = retrievedFileName;
			if(!defaultSet){
				anOption.selected = 'selected';
				defaultSet = true;
			}
			selector.appendChild(anOption);
		}
	}
	document.getElementById('openDialog').style.display = 'block';
}

function readFile(aButton) {
	var selector = $('fileList');
	$('openDialog').style.display = 'none';
	if(aButton.value == 'Open'){
		resetRobbie();
		clearCode();
		clearOutput();
		/*
		*	get the name of the selected file
		*/
		if(selector.selectedIndex >=0){
			var name = selector.options[selector.selectedIndex].value;
			curFileName = name;
			var rawData = localStorage[htPrefix+curFileName];
			var selectedData = JSON.parse(localStorage[htPrefix+curFileName]);
			setup(selectedData[0]);
			$('code').value = unescape(selectedData[1]);
		}
	}
	selector.innerHTML = '';
}
