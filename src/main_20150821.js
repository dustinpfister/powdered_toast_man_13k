var canvas, 

context,

sheet,


// a simple API
_ = {
	
    // distance formula
    distance : function (x1, y1, x2, y2) {
		
		// return the distance between the two points
        return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
		
    },
    
    // your basic bounding box collision detection
    boundingBox : function (x1, y1, w1, h1, x2, y2, w2, h2) {
		
        // if the two objects do not overlap
        if ((x1 > x2 + w2) || (x1 + w1 < x2) || (y1 + h1 < y2) || (y1 > y2 + h2)) { 
            
			//then they do not overlap
			return false; 
        
		}
		
		// else they do
        return true; 
    
    },
    
    // get the clockwise, and counter clockwise angles
    getAngles : function (obj, point) {
		
        // get the angle that we need to change to
        var angle = Math.atan2(
                point.y - obj.y,
                point.x - obj.x),
        clock,
        counter;

        if (angle < 0) {
            angle += Math.PI * 2;
        }

        // find the clockwise, and counter clockwise angles.
        clock = angle - obj.heading;
        counter = obj.heading - angle;

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
    }
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
    
// Powdered Toast Man!
ptm = {
	
	w:64,h:64,
    x:0,y: 0,                   // map x and y 
	tempX:0,tempY:0,            // temp x and y is sometimes needed
    dx:0,                       // delta x and y
    dy:0,
	
	
	
	target : {                  // the target ptm needs to hit to win. 
		x: -500,
		y: map.horizon - 75,
		w: 75,
		h: 75,
		size:75
	},
	
	radian : 0,                 // used for the toast bar animation during the 'bardrag' flight state
	heading : 0,                // used to set the direction of the ptm sprite, as well as with calculations that have to do with you guessed it... the current heading.
	
	userPress:false,
	userPitch:0,
	flightPower: 50,            // flight power determines how long ptm can stay in the air under power before free falling.
	flightState: 'ready',       // ptms flight states are: 'ready, bardrag, launch, flying, freefall, win, lost';
    viewCentered: true,         // indacates if powdered toast man is attached to the center of the view port, or independent from it
    //ejected:false,
	
	// check to see if ptm has won or lost.
	winLostCheck : function(){
		
		// !Alert this.x and this.y are way off due to adjustment.
		// if collision with target then win
		//if(_.boundingBox(this.x, this.y,this.w,this.h,this.target.x, this.target.y,this.target.w, this.target.h)){
			
		// console.log( _.distance(this.x,this.y, this.target.x,this.target.y) );
			
		if(    _.distance(this.x,this.y, this.target.x,this.target.y) < this.target.size / 2  ){
			
			
			this.flightState = 'win';
			return;
			
		}
		
		// if the ground is hit then the player has lost
		if(this.y >= map.horizon - this.h){
			
			this.flightState = 'lost';
			
			
		}
		
	},
	
	// what to do during the various states that ptm goes threw. on state functions must be used will call
    onState:{
		
		// what to do while waiting for the player to launch powdered toast man
		ready:function(){
			
			
			this.heading = Math.PI * 2 / 4 * 3;
			this.radian = this.heading;
			
			this.x=-130;
            this.y=map.horizon - this.h;
            this.tempX = this.x;
            this.tempY = this.y;
               
            this.dy = -10 * dial.setting;
			this.dx = -5 * dial.setting;
                
            if(toastBar.setting > 0){
                this.flightState = 'bardrag';
            }
			
			
		},
		
		// what to do when the player is dragging the toaster leaver
		bardrag:function(){
			
			this.heading =  -(Math.PI * toastBar.setting);
            this.radian = Math.PI / 2 * 3 - Math.PI * toastBar.setting;
		
		
		
            this.x = Math.cos(this.heading) * 120 + this.tempX-120;
            this.y = Math.sin(this.heading) * 120 + this.tempY;
               
            if(toastBar.setting === 0){
                this.flightState = 'ready';
            }
                
            if(toastBar.started){
                this.flightState = 'launch';
            }
			
		},
		
		// what to do when ptm launches out of the toaster
		launch:function(){
			
			// apply delta y but not x
			this.y += this.dy;
			this.dy += 0.1;
			
			// check if flight state should change to flying
            if(this.dy >= 0){
		        	
			    this.flightState = 'levelout';
			
		    }
		},
		
		levelout:function(){
			
			this.radian -= Math.PI / 50;
			
			if(this.radian <= 0){
			    this.heading = 0;
				this.radian = 0;
			    this.flightState = 'flying';
			
			}
		},
		
		
		
		// what to do while ptm is in the air, and has flight power available
		flying:function(){
			
			//this.radian = this.heading;
			
			// apply delta x, and y
			this.x += this.dx;
			this.y += this.dy;
			
			// win lost check during flying and dead states
			this.winLostCheck();
			
			this.flightPower-= 1;// (this.userPitch + 50) / 100 * 5;
			
			if(this.userPress){
			
			    var pos = viewPort.getVPRelative(this.x,this.y);
			
			
			    this.heading = Math.atan2(pos.y+32 - this.tempY, pos.x+32 - this.tempX); 
				
				if(this.heading > 0.78 ){
					
					this.heading = 0.78;
					
				}
				
				if(this.heading < -0.78 ){
					
					this.heading = -0.78;
					
				}
				
				
			    this.radian = this.heading;
			
			/*
                if(this.tempY < pos.y){
					
					
					
					this.radian+=0.1;
					
				}
				
				if(this.tempY > pos.y){
					
					
					this.radian-=0.1;
					
				}
				*/
			}
			
			// if there is flightPower left changes can be made based on user pitch
		    if(this.flightPower <= 0){
					
			   
                   
				this.flightState = 'freefall';
            }
			
		},
		
		// what hapends when ptm runs out of flight power but is still in there air.
		freefall:function(){
			
			// win lost check during flying and dead states
			this.winLostCheck();
			
			// gravity in effect
			
			if(this.heading > -0.78){
				
				this.heading -= 0.025;
				
			}else{
				
				this.heading = -0.78;
				
			}
			this.radian = this.heading;
			
			this.y += this.dy;
			this.dy += 0.1;
			
			// apply friction to delta x
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
			
		},
		
		win:function(){
			
		},
		
		lost:function(){
			
			
		}
			
	},
	
	// what to do on each frame tick for ptm
	update: function(){
		
		
		this.onState[this.flightState].call(this);
		
		// map bounderies hit?
		// !ALERT yet another reason why this will need to interplay with map
		if(this.x >= -this.w){
			
			//this.x = -10;
			this.x = -this.w;
			
		}
		if(this.x <= -map.width){
			
			this.x = -map.width;
			
		}
		
		if(this.y >= map.horizon - this.h){
			
			this.y  = map.horizon - this.h;
		}
		if(this.y <= -map.height){
			
			this.y  = -map.height;
		}
		
		// center viewport?
		if(this.viewCentered){
	        viewPort.moveViewPort(ptm.x+5,ptm.y+5);
        }
	
	},
	
	pitch:function(x,y){
		
		
		var pos;
		
		if(this.flightState === 'flying' && this.userPress){
		
		    pos = viewPort.getVPRelative(this.x,this.y);
		
		    this.tempX = x;
			this.tempY = y;
		
		    //console.log(x,y);
		
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


toastBar = {
    x : 550,
    y : 190,
    width : 60,
    height : 150,
    press:false,
    
    // a value from 0 to 1 where 0 is off, 1 is on, and any value between is approching off/on
    setting: 0,
    started: false,
    
    update : function(){
    
        if(!this.started && !this.press && this.setting > 0){
            this.setting -= 0.05;
        }
        
        if(this.setting < 0){ this.setting=0;}
    },
    
    getLeaverPos : function(){
    
        var x,y;
        
        x = this.x + 10;
        // y = this.y + 10 + ( ( this.height - 20 ) * this.setting  );
        
        y = this.y + 10 + ( ( this.height - 40 ) * this.setting  );
        
        return {
            x: x,
            y: y,
            w: 40,
            h: 20
        
        };
        
    },
    
    // what to do when the user drags over the toaster bar
    onDrag : function(x,y){
        
        var leaver, 
            ly = y - this.y - 20;
        
        if(this.press && !this.started && _.boundingBox(x,y,1,1,this.x,this.y,this.width,this.height)){
            
            leaver = this.getLeaverPos();
            
            this.setting = ly / (this.height - 40);
            
            if(this.setting < 0){
                this.setting = 0;
            }
            if(this.setting >= 1){
                this.setting = 1;
                this.started = true;
            }
        
        }
        
    }
},

// the toaster dial
dial = {
    
    x : 580,        // center x of dial
    y : 430,        // center y of dial
    radius : 50,    // the radius of the dial
    setting : 1,  // a value from 0 to 1 that repersents a setiing between a min and max
    heading : 0,    // the curent radian value that should line up with current setting
    press : false,  // is the user clicking / touching?

    // set heading from setting
    findHeading : function () {
        this.heading = Math.PI * .8 + (Math.PI * 1.4 * this.setting);

    },

    // set heading based on dirrection
    onPoint : function (x, y) {

        var angles;
        
        // if the user is pressing and they are pointing inside the dial...
        if (!toastBar.started && this.press && _.distance(x, y, this.x, this.y) <= this.radius + 10) {

            // get the angle we need to know
            angles = _.getAngles(this, {
                    x : x,
                    y : y
                });
            
            // if the angle is in the proper range just simply set the heading
            if (angles.angle > Math.PI * .80 || angles.angle < Math.PI * 0.2) {
                
                this.heading = angles.angle;
                
            // else set to min 0 or max 1 depedning on how close the user is pointing to.    
            } else {
                
                // set the heading to min or max
                if (angles.angle > Math.PI * .5) {
                    
                    this.heading = Math.PI * 0.8;
                    
                } else {
                    
                    this.heading = Math.PI * 0.2;
                    
                }
                
            }

            // ajust setting based on heading
            if (this.heading >= Math.PI * 0.8) {
                
                this.setting = (this.heading - Math.PI * 0.8) / (Math.PI * 1.4);
                
            } else {
                
                this.setting = (this.heading + Math.PI * 1.2) / (Math.PI * 1.4);

            }

        }
        
    }
},



    


draw = function(ctx){
    
	var pos,leaver; // used to store a view port relative value
	
	//tx.fillStyle='#ffffff';
    //ctx.fillRect(0,0,viewPort.width,viewPort.height);
	
	
	// draw sky
	var startY = Math.abs(viewPort.y) % 50;
	var startBlue = 255-Math.floor(Math.abs(viewPort.y) / 50) * 12;
	console.log(startBlue);
	
	
	ctx.fillStyle='rgb(0,'+startBlue+','+startBlue+')';
	ctx.fillRect(0,0,640,startY);
	var i=0;
	
	while(i<9){
		
		startBlue += 12;
		ctx.fillStyle='rgb(0,'+startBlue+','+startBlue+')';
	    ctx.fillRect(0,startY + 50 * i,640,50);
		i++;
	}
	
	
		
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
	
	//ctx.fillRect(pos.x,pos.y,ptm.w,ptm.h);
	
	ctx.save();
	ctx.translate(pos.x+ptm.w/2,pos.y+ptm.h/2);
	ctx.rotate(ptm.radian);
	ctx.drawImage(sheet,-32,-16,64,32);
	ctx.restore();
	
	// draw line to target
	
	//ctx.strokeStyle='#000000';
	//ctx.beginPath();
	//ctx.moveTo(pos.x+32,pos.y+32);
	//pos = viewPort.getVPRelative(ptm.target.x+37,ptm.target.y+37);
	//ctx.lineTo(pos.x,pos.y);
	//ctx.stroke();
	
	
	//_.distance(this.x,this.y, this.target.x,this.target.y) );
	
	
	
	// draw dial
	ctx.strokeStyle='#000000';
    //ctx.fillStyle=gradient;
    ctx.fillStyle='#ffffff';
    ctx.beginPath();
    ctx.moveTo(dial.x,dial.y);
    ctx.lineTo(Math.cos( Math.PI*.8 ) * dial.radius + dial.x, Math.sin( Math.PI*.8 ) * dial.radius + dial.y );
    ctx.arc(
        dial.x, 
        dial.y,
        dial.radius,
        Math.PI*.8,
        Math.PI*.2
    );
    ctx.closePath();
    ctx.stroke();
    ctx.fill();
    
    ctx.fillStyle='#000000';
    ctx.beginPath();
    ctx.arc(dial.x,dial.y, 20, 0, Math.PI*2);
	
    ctx.stroke();
    ctx.fill();
    
	// draw toastbar
	leaver = toastBar.getLeaverPos();
    
    ctx.fillStyle = '#808080';
    ctx.fillRect(toastBar.x, toastBar.y, toastBar.width, toastBar.height);
    ctx.fillStyle = '#c0c0c0';
    ctx.fillRect(leaver.x, leaver.y, leaver.w, leaver.h);
	
    
    // draw setting marker
    ctx.fillStyle='#ff0000';
    ctx.beginPath();
    ctx.moveTo(dial.x,dial.y);
    ctx.lineTo(Math.cos(dial.heading+1.57) * 10 + dial.x, Math.sin(dial.heading+1.57) * 10 + dial.y );
    ctx.lineTo(Math.cos(dial.heading) * (dial.radius+10) + dial.x, Math.sin(dial.heading) * (dial.radius+10) + dial.y );
    ctx.lineTo(Math.cos(dial.heading-1.57) * 10 + dial.x, Math.sin(dial.heading-1.57) * 10 + dial.y );
    ctx.closePath();
    ctx.stroke();
    ctx.fill();
    
    // draw setting
    ctx.fillStyle='#000000';
    ctx.textAlign='center';
    ctx.textBaseline='top';
    ctx.font = '20px arial';
    ctx.fillText(dial.setting.toFixed(2), dial.x,dial.y+20);
	
	// debug info
    document.getElementById('out').innerHTML='<br>'+
	    'flight state: ' + ptm.flightState + ', flightPower: ' + ptm.flightPower+'<br>'+
	
	'dy = '+ptm.dy+', y = ' + ptm.y+'<br>'+
	'dx = '+ptm.dx+', x = ' + ptm.x+'<br>'+
	'radian = ' + ptm.radian;
    
},


start = function(){

    
    // setup canvas
    canvas = document.createElement('canvas');
    canvas.width=640;
    canvas.height=480;
    
    context = canvas.getContext('2d');
    
    document.getElementById('game_container').appendChild(canvas);

	// attach events
	canvas.addEventListener('mousedown', function(e){
	
	
	    // !Alert all these booleans should be combine into one shared resource
	    ptm.userPress = true;
		toastBar.press = true;
		dial.press = true;
	
    });
    canvas.addEventListener('mouseup', function(e){
	
	    // !Alert all these booleans should be combine into one shared resource
	    ptm.userPress = false;
		toastBar.press = false;
		dial.press = false;
	
    });
    canvas.addEventListener('mousemove', function(e){
	
	    var box = this.getBoundingClientRect(),
		x=e.clientX - box.left,
		y=e.clientY - box.top;
	
	    
	    
	    
		// !Alert this belongs in ptm, it should be fixed when you chnage your focus to the fligh system
		// change user pich
		
		/*
		
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
		*/
		
		ptm.pitch(x,y);
		dial.onPoint(x,y);
		toastBar.onDrag(x,y);
		
	
	
    });
	
	
	// set default dial heading
	dial.findHeading();
	
	
	sheet = new Image();
	
	sheet.addEventListener('load', function(e){
		
		thread();
		
	});
	
	sheet.src="img/powdered_tost_man_64_32.png";
	
	// start thread
    //thread();
},


update = function(){
    
	ptm.update();
	toastBar.update();
	
},

thread = function(){
	
    setTimeout(thread, 33);
    
    update();
    draw(context);
	
};




/*
document.getElementById('button_eject').addEventListener('click', function(){
    if(!ptm.ejected){
        ptm.dy = -14 * dial.setting;
		ptm.flightPower = 275 * dial.setting;
		
        ptm.ejected=true;
		ptm.flightState = 'launch';
    }
    
});
*/
start();