import {Scalar} from './scalar.js'
import {Vector} from './vector.js'

var Point = function(coords)
{
    let self = {x:coords.x, y:coords.y};

    self.copy = function() { return Point({x: self.x, y: self.y}); }
    self.set = function(coords) { self.x=coords.x; self.y=coords.y; return self; };
    
    self.add = function(coords) { self.x+=coords.x; self.y+=coords.y; return self; };
    self.sub = function(coords) { self.x-=coords.x; self.y-=coords.y; return self; };
    self.mul = function(s) { self.x*=s; self.y*=s; return self; };
    self.div = function(s) { self.x/=s; self.y/=s; return self; };

    self.addMul = function(coords, s) { self.x+=coords.x*s; self.y+=coords.y*s; return self; };
    self.subMul = function(coords, s) { self.x-=coords.x*s; self.y-=coords.y*s; return self; };

    self.rotate = function(rad, fixedPoint) { 
        self.sub(fixedPoint);
        let c=Math.cos(rad);
        let s=Math.sin(rad); 
        return self.set({
            x: self.x*c-self.y*s + fixedPoint.x, 
            y: self.y*c+self.x*s + fixedPoint.y
        });
    }

    return self;
}

Point.disp = function(a,b) { return Vector({x: b.x-a.x, y: b.y-a.y}); }
Point.distSq = function(a,b) { let dx=b.x-a.x; let dy=b.y-a.y; return dx*dx+dy*dy; }
Point.dist = function(a,b) { return Math.sqrt(Point.distSq(a,b)); }
Point.lerp = function(a,b,t) { return a.copy().addMul(Point.disp(a,b), t); }
Point.lerpAdjusted = function(a,A,b,B,t) { return Point.lerp(A,B,(t-a)/(b-a)); }

Point.isEqual = function(a,b,eps) { 
    return Scalar.isEqual(a.x,b.y,eps) && Scalar.isEqual(a.y,b.y,eps); 
}

export{Point};