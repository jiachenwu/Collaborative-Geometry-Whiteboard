import {Scalar} from './scalar.js'
import {Point} from './point.js'

var Vector = function(coords)
{
    let self = {x:coords.x, y:coords.y};

    self.copy = function() { return Vector({x: self.x, y: self.y}); }
    self.set = function(coords) { self.x=coords.x; self.y=coords.y; return self; };
    
    self.neg = function() { self.x=-self.x; self.y=-self.y; return self; };
    self.add = function(coords) { self.x+=coords.x; self.y+=coords.y; return self; };
    self.sub = function(coords) { self.x-=coords.x; self.y-=coords.y; return self; };
    self.mul = function(s) { self.x*=s; self.y*=s; return self; };
    self.div = function(s) { self.x/=s; self.y/=s; return self; };

    self.addMul = function(coords, s) { self.x+=coords.x*s; self.y+=coords.y*s; return self; };
    self.subMul = function(coords, s) { self.x-=coords.x*s; self.y-=coords.y*s; return self; };

    self.magSq = function() { return self.x*self.x + self.y*self.y; }
    self.mag = function() { return Math.sqrt(self.x*self.x + self.y*self.y); }

    self.turn = function() { let tx=self.x; self.x=-self.y; self.y=tx; return self; }
    self.rotate = function(rad) { 
        let c=Math.cos(rad);
        let s=Math.sin(rad); 
        return self.set({x: self.x*c-self.y*s, y: self.y*c+self.x*s});
    }
    self.normalize = function() { let m=self.mag(); if (m != 0)self.div(m); return self; }

    return self;
}

Vector.dot = function(a,b) { return a.x*b.x + a.y*b.y; }
Vector.det = function(a,b) { return -a.y*b.x + a.x*b.y; }
Vector.angle = function(a,b) { return Math.atan2(Vector.det(a,b), Vector.dot(a,b)); }

Vector.isEqual = function(a,b,eps) { 
    return Scalar.isEqual(a.x,b.y,eps) && Scalar.isEqual(a.y,b.y,eps); 
}

export{Vector};