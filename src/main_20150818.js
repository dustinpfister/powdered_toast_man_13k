var canvas, context,


dial = {
	
	setting:1
	
},


map = {
	width: 1500,
	height: 1000,
	horizon: -50, // the map relative y value that represents the horizon
},

// wall at start
build1 = {
    x: -45,
    height: 45,
    width: 45
},

// building near start
build2 = {
    x: -180,
    height: 100,
    width: 45
},

// building at end
build3 = {
    x: -500,
    height: 75,
    width: 75
},
    
ptm = {
    x:-105,y: map.horizon - 10, // map x and y (adjusted for width and height)
    dx:0, // need to have x value change as well
    dy:0,
	flightPower: 250,
	
	userPress:false,
	userPitch:0,
	
	flightState: 'ready', // 'ready, launch, flying, dead';
    viewCentered: true, // indacates if powdered toast man is attached to the center of the view port, or independent from it
    ejected:false,
	
	update: function(){
		
		// always update x and y based on current deltaX and deltaY
		if(this.flightState !== 'launch'){
		    this.x += this.dx;
		}
		this.y += this.dy;
		
		// change delta values
		// !ALERT -40 is the horizon minus the height of ptm, thuse ptm might need map as a dependency
		
		if(this.dy >= 0){
			
			this.flightState = 'flying';
			
		}
		
		if(this.y <= map.horizon - 10 && this.ejected){
            
			if(this.flightPower > 0 && this.flightState === 'flying'){
		        
				this.dy = -this.userPitch / 50 * 5;
				this.dx = (this.userPitch + 50) / 100 * 5 * -1;
				this.flightPower-= (this.userPitch + 50) / 100 * 5;
				
				console.log( (this.userPitch + 50) / 100);
				
			}else{
                this.dy += 0.1;
            }
			
        }else{
			
            this.dy = 0;
            this.ejected=false;
        }
		
		if(this.flightState !== 'launch'){
		if(this.dx !== 0){
			
			if(this.dx > 0){
				
				this.dx -= Math.abs(this.dx) / 50;
				
				if(this.dx < 0.01){
					
					this.dx = 0;
					
				}
				
			}else{
				
				this.dx += Math.abs(this.dx) / 50;
				
				if(this.dx > -0.1){
					
					this.dx = 0;
					
				}
				
			}
			
			
		}
		}
		
		// map bounderies hit?
		// !ALERT yet another reason why this will need to interplay with map
		
		if(this.x >= -10){
			
			this.x = -10;
			
		}
		if(this.x <= -map.width){
			
			this.x = -map.width;
			
		}
		
		if(this.y >= map.horizon - 10){
			
			this.y  = map.horizon - 10
		}
		if(this.y <= -map.height){
			
			this.y  = -map.height;
		}
		
		// center viewport?
		if(this.viewCentered){
	        viewPort.moveViewPort(ptm.x+5,ptm.y+5);
        }
	
	}
},

viewPort = {
	
	width: 640,
	height:480,
	x: -640,  // the map relative position of the view ports upper left corner.
	y: -480,
	
	// give a view port relative position, with the given map relative mapx, and and mapy arguments  
    getVPRelative:function(mapX, mapY){
	
	    return {
		
		    x : (this.x - mapX) * -1,
		    y : (this.y - mapY) * -1
		
	    };
	
    },
	
	// move the view port into a map position where mapX, and mapY represents a map position that should end up laying in the center of the view port.
	moveViewPort : function(mapX,mapY){
	    
        this.x = mapX - Math.floor(this.width / 2);
        this.y = mapY - Math.floor(this.height / 2);
		
	}
},



// get the clockwise, and counter clockwise angles
getAngles = function (shot, attacker) {
    // get the angle that we need to change to
    var angle = Math.atan2(
        attacker.y - shot.y,
        attacker.x - shot.x
	),clock,counter;
	
    if (angle < 0) {
        angle += Math.PI * 2;
    }

    // find the clockwise, and counter clockwise angles.
    clock = angle - shot.heading;
    counter = shot.heading - angle;

    // adjust them if needed
    if (clock <= 0) {
        clock += Math.PI * 2;
    }
    if (counter <= 0) {
        counter += Math.PI * 2;
    }
    if (clock >= Math.PI * 2) {
        clock -= Math.PI * 2;
    }
    if (counter >= Math.PI * 2) {
        counter -= Math.PI * 2;
    }

    // return all the results in an object.
    return {
        angle : angle,
        clockwise : clock,
        counter : counter
    };
},

    
start = function(){

    

    canvas = document.createElement('canvas');
    canvas.width=640;
    canvas.height=480;
    
    context = canvas.getContext('2d');
    
    document.getElementById('game_container').appendChild(canvas);

	
	canvas.addEventListener('mousedown', function(e){
	
	
	    ptm.userPress = true;
	
    });
    canvas.addEventListener('mouseup', function(e){
	
	    ptm.userPress = false;
	
    });
    canvas.addEventListener('mousemove', function(e){
	
	    var box = this.getBoundingClientRect(),
		x=e.clientX - box.left,
		y=e.clientY - box.top,
	
	    
	    pos = viewPort.getVPRelative(ptm.x,ptm.y);
	    
		
		if(ptm.userPress){
		    ptm.userPitch = pos.y - y + 5;
		
    		if(ptm.userPitch > 50){
	    		ptm.userPitch = 50;
	    	}
	    	if(ptm.userPitch < -50){
		    	ptm.userPitch = -50;
		    }
		}
		
	
	
    });
	
	
    thread();
},
update = function(){
    
	ptm.update();
	
	
	
},
draw = function(ctx){
    
	var pos; // used to store a view port relative value
	
	ctx.fillStyle='#ffffff';
    ctx.fillRect(0,0,viewPort.width,viewPort.height);
	
	// draw horizon
	pos = viewPort.getVPRelative(0,map.horizon);
	ctx.fillStyle='#00ff00';
	ctx.fillRect(0, pos.y, viewPort.width, viewPort.width - pos.y);
	
	// draw building
	
	pos = viewPort.getVPRelative(build1.x, map.horizon - build1.height);
	ctx.fillStyle='#000000';
	ctx .fillRect(pos.x,pos.y, build1.width, build1.height );
	
	pos = viewPort.getVPRelative(build2.x, map.horizon - build2.height);
	ctx.fillStyle='#00ffff';
	ctx .fillRect(pos.x,pos.y, build2.width, build2.height );
	
	pos = viewPort.getVPRelative(build3.x, map.horizon - build3.height);
	ctx.fillStyle='#ff00ff';
	ctx .fillRect(pos.x,pos.y, build3.width, build3.height );
	
    // draw ptm
	pos = viewPort.getVPRelative(ptm.x,ptm.y);
	ctx.fillStyle='#ff0000';
	ctx.fillRect(pos.x,pos.y,10,10);
	
	
    document.getElementById('out').innerHTML=ptm.dy;
    
},
thread = function(){
    setTimeout(thread, 33);
    
    update();
    draw(context);
};





document.getElementById('button_eject').addEventListener('click', function(){
    if(!ptm.ejected){
        ptm.dy = -8;
		
        ptm.ejected=true;
		ptm.flightState = 'launch';
    }
    
});

start();



/*
var canvas, context,

horizon = 0,

viewPort = {
	
	width: 200,
	height:200,
	horizon: 10 // the y value to subtract from viewport height that represents the 0 level horizon
},

build1 = {
    x: 10,
    height: 100,
    width: 45
},
    
ptm = {
    x:95,y:190, // map x and y
    X:95,Y:190, // viewport x and y
    dx:0, // need to have x value change as well
    dy:0,
    viewCentered: false,
    ejected:true
},
    
start = function(){

    canvas = document.createElement('canvas');
    canvas.width=200;
    canvas.height=200;
    
    context = canvas.getContext('2d');
    
    document.getElementById('game_container').appendChild(canvas);

    thread();
},
update = function(){
    
    if(ptm.y <= 180 && ptm.ejected){
        ptm.y += ptm.dy; 
        ptm.x += ptm.dx;
        ptm.dy += .1;
        
    }else{
        ptm.y = 180;
        ptm.dy = 0;
        ptm.ejected=false;
    }
    
      
     ptm.viewCentered = ptm.y <= 100;
    // ptm.viewCentered = true;
    
    ptm.X = ptm.x;
    ptm.Y = ptm.y;
    horizon = 190;
    if(ptm.viewCentered){
        ptm.Y = 95; ptm.X = 95;
        horizon = ptm.Y + (190-ptm.y);
    }
    
},
draw = function(){
    
    context.clearRect(0,0,200,200);
    
    // horizon
    context.fillStyle='#00ff00';
    context.fillRect(0,horizon, 200,200);
    
    // build1
    context.fillStyle='#00ffff';
    context.fillRect(build1.x,horizon-build1.height, build1.width,build1.height);
    
    
    // powdered toast man
    context.fillStyle='#ff0000';
    context.fillRect(ptm.X,ptm.Y,10,10);
    
    document.getElementById('out').innerHTML=ptm.viewCentered + ', ' +ptm.y;
    
},
thread = function(){
    setTimeout(thread, 33);
    
    update();
    draw();
};

document.getElementById('button_eject').addEventListener('click', function(){
    if(!ptm.ejected){
        ptm.dy=-6;
        ptm.ejected=true;
    }
    
});

start();
*/
