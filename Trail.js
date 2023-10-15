class Trail {
    constructor(colourPalette, isHighlight) {
      this.create();
      
      // colour
      this.colourPalette = colourPalette;
      this.isHighlight = isHighlight;
      
      ////////////////
      // Trail display
      this.bodyLength = int(this.maxWidth);
      this.body = new Array(this.bodyLength * 2).fill({ ...this.pos });
      ////////////////

    }
    
    create() {
      // motion
      this.dir = createVector(0, 0);
      this.vel = createVector(0, 0);
      this.pos = createVector(random(-10, width + 10), random(-10, height + 10))
      this.speed = random(0.1, 0.8); // TODO: speed
      
      // size
      // TODO: size range?
      this.minWidth = random();
      this.size = this.minWidth;
      this.maxWidth = random(SCREEN_SIZE/80, SCREEN_SIZE/150) //random(5, 10);
      
      // life cycle
      // TODO: max life range?
      this.maxLife = floor(random (100, 700));
      this.life = 0;
      this.growRate = 255/ (this.maxLife);
      
      // colour
      // TODO: if is highlighted, implement the attractor?
      this.colour = random(this.colourPalette);
      this.a = 0;
      
      this.isFaded = false;
    }
  
    
    update(closestPt) {
      if(!this.isFaded) {
        // position
        // 3D noise space gradually changes over time frameCount/80000
        var angle = noise(this.pos.x / noiseScale , this.pos.y / noiseScale) * TWO_PI; // TODO: noise scale?
        this.dir.x = cos(angle);
        this.dir.y = sin(angle);
        
        if(closestPt == null){
          this.vel = this.dir.copy();
          this.vel = this.dir.mult(this.speed)
          this.pos.add(this.vel);
        }
        
        else{
          if(this.isHighlight){
            
            let attractor = closestPt.copy();
            attractor.sub(this.pos);
            let mag = 1.5;
            
            if(attractor.x < width/5) {
              mag = map (attractor.x, 0, width/5, 0, 1.5)
            }
            else if(attractor.x > 4 * width/5) {
              mag = map (attractor.x, 4*width/5,width, 1.5, 0)
            }
            
            attractor.setMag(mag);
    
            this.dir.add(attractor)
            this.vel = this.dir;   
            this.vel.limit(2);
          
          
          
          }else{

            let attractor = closestPt.copy();
            attractor.sub(this.pos);
            let mag = 0.7;
            
            // if(attractor.x < width/5) {
            //   mag = map (attractor.x, 0, width/5, 0, 0.7)
            // }
            // else if(attractor.x > 4 * width/5) {
            //   mag = map (attractor.x, 4*width/5,width, 0.7, 0)
            // }

            attractor.setMag(mag);
            
            this.dir.add(attractor)
            this.vel = this.dir;   
            this.vel.limit(1);
            
          }
        }
        
        
        this.pos.add(this.vel);
        
        ////////////////
        // Trail display
        if(frameCount%2 == 0) {
          this.body.unshift({ ...this.pos });
          this.body.pop();
        }
        ////////////////
  
        // reveal
        if(this.life < 0.4 * this.maxLife) {
          this.a += this.growRate; 
          // TODO: replace lerp rate
          this.size = lerp(this.size, this.maxWidth, 0.01);
        }
        // fade out
        else if((this.life > 0.6 * this.maxLife)){
          this.a -= this.growRate;
          this.size = lerp(this.size, this.minWidth, 0.005);
        }
        this.life ++;
        
        // check if the trail is already faded
        if(this.life > this.maxLife) {
          this.isFaded = true;
        }
      }
      
    }
  
    checkRecreate() {
      if ( // outside boundary
        this.pos.x > width + 10 ||
        this.pos.x < -10 ||
        this.pos.y > height + 10||
        this.pos.y < -10 ||
        // faded
        this.isFaded
      ) {
        this.pos.x = random(0, width);
        this.pos.y = random(0, height);
        this.create();
        
      }
    }
  
    display() {
    ////////////////
    // Trail display
      this.body.forEach((b, index) => {
        let size;
        let aValue;
        if (index < this.bodyLength / 6) {
            size = map(index, 0, this.bodyLength / 6, 0, this.maxWidth);
            aValue = this.a;
        } else {
            size = map(index, this.bodyLength / 6, this.bodyLength * 2, this.maxWidth, 0);
            aValue = map(index, this.bodyLength / 6, this.bodyLength * 2, this.a, this.a/2);
        }
        fill(this.colour[0], this.colour[1], this.colour[2], aValue);
        ellipse(b.x, b.y, size, size);
    });
    ////////////////

      // fill(this.colour[0], this.colour[1], this.colour[2], this.a);
  
      // ellipse(this.pos.x, this.pos.y, this.size);
  
    }
  }
  