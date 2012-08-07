/* Author:
	-*''*-.,,.- no need to type more
*/

(function() {
	// RequestAnimationFrame shim
	var lastTime = 0;
	var vendors = ['ms', 'moz', 'webkit', 'o'];

	for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
		window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
		window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
	}
 
	if (!window.requestAnimationFrame) {
		window.requestAnimationFrame = function(callback, element) {
			var currTime = new Date().getTime();
			var timeToCall = Math.max(0, 16 - (currTime - lastTime));
			var id = window.setTimeout(function() { callback(currTime + timeToCall); }, timeToCall);
			lastTime = currTime + timeToCall;
			return id;
		};
	}
 
	if (!window.cancelAnimationFrame) {
		window.cancelAnimationFrame = function(id) {
			clearTimeout(id);
		};
	}

	var canvas;
	var context;

	var color = [200, 0, 0]
	var layers = [];
	var entities = [];

	var mouseX = 0;
	var mouseY = 0;
	var mouseMoved = true;

	var scene = {
		entity: {
			size: 60,
			deviation: 0.4
		},
		layers: 20, 
		scale: 1.01
	};	

	function initScene() {
		// reset everything
		layers = [];
		entities = [];
		mouseMoved = true;

		initCanvas();
	
		// set starting mouse position
		mouseX = canvas.width / 2;
		mouseY = canvas.height / 2;
		
		// load the desired amount of blocks and start the animation
		initEntities();
		updateScene();
	}

	// Function that creates the layers & blocks
	function initEntities() {
		// Create some layers
		for (var i = 0; i < scene.layers; i++) {
			layers.push(new Layer(i + 1));
		}

		// Calculate how much the blocks should scale per layer & how many blocks each layer should contain
		var bloxScale = Math.log(scene.entity.size) / Math.log(scene.layers);
		var bloxPerLayer = canvas.width / (Math.pow(scene.layers, 2) * (scene.entity.size * 0.2));

		// Fill each layer with the desired amount of blocks
		for (var j = 0; j < layers.length; j++) {
			var bloxAmount = Math.round(Math.pow((scene.layers - j), 2) * bloxPerLayer);

			for (var q = 0; q < bloxAmount; q++) {
				entities.push(new Block(layers[j], bloxScale));
			}
		}		
	}

	// The Block class
	// An object representing a square.
	// layer:     the layer that contains this block.
	// bloxScale: how much this block has to scale, based on the layer it inhabits.
	function Block(layer, bloxScale) {
		// init the block's size and position.
		this.layer = layer;
		this.size = Math.pow(Math.ceil(this.layer.zIndex + 1 - this.layer.zIndex * scene.entity.deviation + this.layer.zIndex * scene.entity.deviation * 2 * Math.random()), bloxScale);
		this.x = this.layer.width * Math.random() - this.size * 0.5;
		this.y = this.layer.height * Math.random() - this.size * 0.5;
		
		// deviate a bit from the set color & transparency
		var colorIncrease = Math.floor(Math.random() * 3);
		this.color = "rgba("+(color[0] + colorIncrease * 17)+", "+(color[1] + colorIncrease * 17)+", "+(color[2] + colorIncrease * 17)+", "+(0.5 + Math.random() * 0.5)+")";
		
		// draw the block on the canvas using the layers position.
		this.draw = function() {
			context.fillStyle = this.color;
			context.fillRect(this.x + this.layer.x, this.y + this.layer.y, this.size, this.size);
		}
	}

	// The Layer class
	// An object that contains several blocks.
	// zIndex: The number indicating how close this layer is to the 'camera'
	function Layer(zIndex) {
		this.zIndex = zIndex;	
		this.width = canvas.width * Math.pow(scene.scale, this.zIndex);
		this.height = canvas.height * Math.pow(scene.scale, this.zIndex);
		this.x = (this.width - canvas.width) * -0.5;
		this.y = (this.height - canvas.height) * -0.5;
		
		// Update the layer's position so that we do not have to update every block.
		this.update = function() {
			this.x = (this.width - canvas.width) * -1 * (1 - mouseX / canvas.width);
			this.y = (this.height - canvas.height) * -1 * (1 - mouseY / canvas.height);
		}
	}

	// Initialize the canvas to 100% of the width & height of the page.
	function initCanvas() {
		canvas = $('canvas#mainCanvas')[0];
		context = canvas.getContext('2d');
		
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
	}

	// Update the position of the layers based on the position of the mouse.
	function updateScene() {
		if(mouseMoved) {
			context.clearRect(0, 0, canvas.width, canvas.height);

			for (var x = 0; x < layers.length; x++) {
				layers[x].update();
			}

			for (var z = 0; z < entities.length; z++) {
				entities[z].draw();
			}
			
			mouseMoved = false;	
		}
		
	  requestAnimationFrame(function() {
	  	updateScene();
	  });		
	}

	// Document ready => initialize everything.
	$(document).ready(function() {
		initScene();
	});

	// Reinitialize on window resize
	$(window).resize(function() {
		initScene();
	});

	$(window).mousemove(function(e) {
		mouseX = e.pageX;
		mouseY = e.pageY;
		mouseMoved = true;
	});
}());