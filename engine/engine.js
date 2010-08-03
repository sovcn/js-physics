var Engine = function(canvasId, fps, canvasWidth, canvasHeight, options){
	
	this._options = options;
	
	var canvasOptions = options.canvas;
	var timerOptions = options.timer;
	
	this._canvas = new Canvas(canvasId, canvasWidth, canvasHeight, canvasOptions);
	
	this._timer = new Timer(fps); // Keeps track of when to draw to maintain FPS
	
	this._sprites = [];
	
	this.init();
};

Engine.prototype.init = function(){
	
};

Engine.prototype.addSprite = function(sprite){
	this._sprites.push(sprite);
	return true;
};

Engine.prototype.start = function(callback){
	this._timer.start(callback);
};

Engine.prototype.stop = function(){
	this._timer.stop();
};

Engine.prototype.updateSprites = function(){
	
	for(var i=0;i<this._sprites.length;i++){
		
		var sprite = this._sprites[i];
		if( sprite._physics ){
			// Perform physics checks for sprite.
			if( this._options.gravity && !sprite._physics._options.ignoreGravity ){
			var gravity = this._options.gravity;

				var dxAdjust = gravity.x * this._timer._interval / 1000;
				var dyAdjust = gravity.y * this._timer._interval / 1000;
				
				sprite._dx -= dxAdjust;
				sprite._dy -= dyAdjust;
				
				
			}
			
			// Prevent super acceleration
			if( sprite._dx > 500 ){
				sprite._dx = 500;
			}
			if( sprite._dy > 500 ){
				sprite._dy = 500;
			}
			
			
			if( !sprite._physics._options.ignoreSprites ){
				for(var j=0;j<this._sprites.length;j++){
					if( i != j ){
						
						var collision = sprite.detectCollision(this._sprites[j], this);
						
						if( collision ){
							
							var analysis = sprite.analyzeCollision(this._sprites[j], this);
							
							var collisionInfo = {
									direction: analysis.direction,
									analysis: analysis,
									object: sprite
							};
							this._sprites[j].handleCollision(collisionInfo, this);
														
						}
					}
				}
			}
			
		}
		
		
		
		// If programmer has opted to enforceCanvasBoundaries, make sure that the sprite is not outside the canvas
		// If the sprite is outside the canvas, use its specific physics properties to handle the collision
		if(this._options.enforceCanvasBoundaries){
			this._sprites[i].enforceBoundary(0, this._canvas._width, 0, this._canvas._height, this);
		}
		
		this._sprites[i].move(this._timer);
		
	}
	
};

Engine.prototype.draw = function(){
	this._canvas.clear();
	
	if( this._timer._draw ){
		for(var i=0;i<this._sprites.length;i++){
			this._sprites[i].draw(this._canvas);
		}
	}else{

	}
};

var Canvas = function(id, width, height){
	this._id = id;
	this._width = width;
	this._height = height;

	this.className = "canvas";
	
	this._ctx = document.getElementById(this._id).getContext("2d");
};

Canvas.prototype.getContext = function(){
	return this._ctx;
};

Canvas.prototype.clear = function(){
	this._ctx.clearRect(0,0,this._width,this._height);
};

var Sprite = function(x, y, width, height, options){
	this._x = x;
	this._y = y;
	this._dx = options.dx;
	this._dy = options.dy;
	this._width = width;
	this._height = height;
	this._imageSrc = options.imageSrc;
	this._color = options.color;
	
	this._enabled = true;
	
	this._physics = options.physics;
};

Sprite.prototype.move = function(timer){

	var dxAdjust = this._dx * timer._interval / 1000;
	var dyAdjust = this._dy * timer._interval / 1000;
	
	this._x += dxAdjust;
	this._y += dyAdjust;

};

Sprite.prototype.draw = function(canvas){
	var ctx = canvas.getContext();
	ctx.fillStyle = this._color;
	ctx.fillRect((this._x), (this._y), this._width, this._height);
};

Sprite.prototype.detectCollision = function(sprite, engine){
	
		var leftSelf = this._x;
		var leftOther = sprite._x;
		var rightSelf = this._x + this._width;
		var rightOther = sprite._x + sprite._width;
		
		var topSelf = this._y;
		var topOther = sprite._y;
		var bottomSelf = this._y + this._height;
		var bottomOther = sprite._y + sprite._height;
		
		if( bottomSelf < topOther ) return false;
		if( topSelf > bottomOther ) return false;
		
		if( rightSelf < leftOther ) return false;
		if( leftSelf > rightOther ) return false;
		
		var isInside = true;
		
		return true;
	
	/*if( this._dx * sprite._dx > 0 ){
		// Sprites are moving in the same X Direction
	}else{
		// Sprites are moving in the opposite x Direction
	}*/

	/*if( this._x + this._width >= sprite._x && this._x < sprite._x ){
		// cannot be right
		var notRight = true;
		if( this._y < sprite._y ){
			// left or top
			if( this._y + this._height - sprite._y > this._x + this._width - sprite._x ){
				// left
				collision = collisionDirections.LEFT;
			}else{
				// top
				collision = collisionDirections.TOP;
			}
		}else{
			// bottom or left
			if( sprite._y + sprite._height - this._y > this._x + this._width - sprite._x ){
				// left
				collision = collisionDirections.LEFT;
			}else{
				// bottom
				collision = collisionDirections.BOTTOM;
			}
		}
	}*/
	
	/*if( this._x + this._width >= sprite._x && this._x < sprite._x ){
		return 2;
	}
	
	if( this.y + this._height >= sprite._y && this._y < sprite._y){
		return 1;
	}
	
	if( this.y + this._height > sprite._y && this.y <= sprite._y ){
		return 1;
	}*/
	
};

Sprite.prototype.analyzeCollision = function(sprite, engine){
	
	var analysis = {};
	
	var intersectBox = {width: 0, height: 0};
	
	var getIntersectDimension = function(pos1, pos2, length1, length2){
		if( pos1 > pos2 ){
			console.log('first');
			if( pos1 + length1 > pos2 + length2 ){
				return (pos2 + length2) - pos1;
			}else{
				// Sprite completely overlaps this
				return length1;
			}
		}else if( pos1 <= pos2 && pos1 + length1 >= pos2 + length2 ){
			console.log('second');
			// sprite is between vertical boundaries of this
			return length2;
		}else{
			console.log('third');
			// intersection occurs on the right
			return (pos1 + length1) - pos2;
		}
	}
	
	
	intersectBox.width = getIntersectDimension(this._x, sprite._x, this._width, sprite._width);
	intersectBox.height = getIntersectDimension(this._y, sprite._y, this._height, sprite._height);
	
	
	var analyzeDirection = function(d1, d2){
		if( d1 * d2 < 0 ){
			// Approaching eachother horizontally
			analysis.headOn = true;
			if( d1 < 0 ){
				// Collision has occured on the left side of this
				//console.log('left');
				analysis.direction = 4;
			}else{
				// Collision has occured on the right side of this
				//console.log('right');
				analysis.direction = 2;
			}
			
		}else if( d1 * d2 > 0 ){
			// Same direction
			if( d1 > d2 ){
				// this has overtaken sprite
				analysis.overTake = {
					front: sprite,
					back: this
				};
				
				if( d1 < 0 ){
					//console.log('left');
					analysis.direction = 4;
				}else{
					//console.log('right');
					analysis.direction = 2;
				}
			}else if ( d1 < d2 ){
				// sprite has overtaking this
				analysis.overTake = {
						front: this,
						back: sprite
					};
				
				if( d1 < 0 ){
					//console.log('right');
					analysis.direction = 2;
				}else{
					//console.log('left');
					analysis.direction = 4;
				}
			}else{
				// same speed (impossible cuz no collision)
			}
			
		}else{
			// one or both are standing still
		}
		
		
		if( vertical ){
			console.log('vertical');
			if( analysis.direction == 2 ){
				analysis.direciton = 3;
			}else{
				analysis.direction = 1;
			}
		}
	}
	
	console.log(intersectBox.width + " " + intersectBox.height);
		analysis.direction = 1;
	if( intersectBox.width > intersectBox.height ){
		// vertical collision
		var vertical = true;
		//console.log('vertical');
		analyzeDirection(this._dy, sprite._dy);
	}else{
		// horizontal
		//console.log('horizontal');
		analyzeDirection(this._dx, sprite._dx);
	}
	
	
	//console.log('1');
	return analysis;
};

// Detects whether or not a sprite has gone past a boundary.
// If so, a collision event will be triggered based on each sprite's physics
Sprite.prototype.enforceBoundary = function(xMin, xMax, yMin, yMax, engine){
	
	var collisionInfo;
	
	var dxAdjust = this._dx * engine._timer._interval / 1000;
	var dyAdjust = this._dy * engine._timer._interval / 1000;
	
	if( this._x + dxAdjust <= xMin || this._x + this._width + dxAdjust >= xMax ){
		collisionInfo = {
			direction: collisionDirections.RIGHT,
			object: "boundary"
		};
		this.handleCollision(collisionInfo, engine);
	}
	
	if( this._y + dyAdjust <= yMin || this._y + this._height + dyAdjust >= yMax ){
		collisionInfo = {
			direction: collisionDirections.UP,
			object: "boundary"
		};
		this.handleCollision(collisionInfo, engine);
	}
};

Sprite.prototype.handleCollision = function(collisionInfo, engine){
	
	if( this._physics ){
		
		this._physics._options.onCollision(this, collisionInfo.object); 
		
		switch(this._physics._options.collision){
		case collisionTypes.BOUNCE:
			
			console.log(collisionInfo.direction);
			
			if( collisionInfo.direction == collisionDirections.RIGHT || collisionInfo.direction == collisionDirections.LEFT ){
				// Collision was horizontal
				if( !this._physics._options.ignoreGravity && engine._options.gravity ){
					this._dx *= this._physics._options.bounceEfficiency * -1;
				}else{
					this._dx *= -1;
				}
				
				if( typeof(collisionInfo.object) == 'object' ){
					var sprite = collisionInfo.object;
					
					this._dx += collisionInfo.object._dx;
					if( collisionInfo.analysis.headOn ){
						
						// Prevent the object from remaining inside the other object
						
						if( collisionInfo.direction == collisionDirections.RIGHT ){
							this._x = sprite._x + sprite._width + 1;
							//collisionInfo.object._x = this._x + this._width + 1;
						}else{
							//collisionInfo.object._x = this._x - 1;
							this._x = sprite._x - this._width - 1;
						}
					}
				}
				
			}else{
				// Collision was vertical
				
				if( !this._physics._options.ignoreGravity && engine._options.gravity ){
					this._dy *= this._physics._options.bounceEfficiency * -1;
				}else{
					this._dy *= -1;
				}
				
				if( typeof(collisionInfo.object) == 'object' ){
					var sprite = collisionInfo.object;
					
					this._dy += collisionInfo.object._dy;
					if( collisionInfo.analysis.headOn ){
						
						// Prevent the object from remaining inside the other object
						
						if( collisionInfo.direction == collisionDirections.DOWN ){
							this._y = sprite._y + sprite._height + 1;
							//collisionInfo.object._x = this._x + this._width + 1;
						}else{
							//collisionInfo.object._x = this._x - 1;
							this._y = sprite._y - this._height - 1;
						}
					}
				}
				
				/*if( !this._physics._options.ignoreGravity && engine._options.gravity ){
					this._dy *= this._physics._options.bounceEfficiency * -1;
				}else{
					this._dy *= -1;
				}
				
				if( typeof(collisionInfo.object) == 'object' ){
					this._dy += collisionInfo.object._dy;
				}*/
			}
			break;
		case collisionTypes.STOP:
			this._dx = 0;
			this._dy = 0;
			break;
		case collisionTypes.PASS_THROUGH:
			// Currently unsupported
			break;
		}
		// event callback
	}else{
		// Default is to stop the object
		this._dx = 0;
		this._dy = 0;
	}
};

var Timer = function(fps){
	this._frameCount = 0;
	this._fps = fps;
	
	this._averageFps = 0;
	this._currentFps = 0;
	
	this._timerIndex; // Unique identifier for javascript setInterval
	
	this._interval = 0;
	this._startTime = new Date().getTime();
	
	this._midTime = new Date().getTime();
	this._midFrameCount = 0;
	
	this._draw = false; // Boolean value for engine to determine whether to draw or not.
	
	this._callback = undefined;
};

// Executed once per frame to keep track of timing information
Timer.prototype.frame = function(){
	this._frameCount++;
	
	this._averageFps = this._frameCount / (new Date().getTime() - this._startTime)*1000;
	
	var midDiff = new Date().getTime() - this._midTime;
	if( midDiff >= 800 ){
		this._currentFps = this._midFrameCount / 800 * 1000;
		this._midTime = new Date().getTime();
		this._midFrameCount = 0;
	}else{
		this._midFrameCount++;
	}
	
	this._draw = true;
	this._callback();
};

Timer.prototype.start = function(callback){
	// every .034 seconds = 34 miliseconds;
	this._interval = 1/this._fps; // ms
	this._interval = Math.floor(this._interval * 1000);
	//console.log(this._interval);
	this._callback = callback;
	
	this.doFrame = function(obj){
		obj.frame();
	};
	
	var func = this.doFrame;
	var obj = this;
	
	this._timerIndex = setInterval(function(){func(obj);}, this._interval);
};

Timer.prototype.stop = function(){
	clearInterval(this._timerIndex);
};

var Physics = function(options){
	/*
	 *   		{
					collision : Physics.collisonTypes.BOUNCE,
					onCollision : function(sprite){

					},
					ignoreClass : ['enemy', 'goal'],
					ignoreGravity: false
					
				}
	 */
	
	this._options = options;
	
};

var collisionTypes = {
	REBOUND: 1,
	STOP: 2,
	PASS_THROUGH: 3
};

var collisionDirections = {
	UP: 1, 
	RIGHT: 2, 
	DOWN: 3,
	LEFT: 4
};


