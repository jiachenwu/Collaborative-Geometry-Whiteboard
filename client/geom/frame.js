import {Point} from './point.js'
import {Vector} from './vector.js'

var Frame = function(params)
{
    let self = {origin:params.origin, u:params.u, v:params.v};

    self.deepCopy = function() { 
        return Frame({origin:self.origin.copy(), u:self.u.copy(), v:self.v.copy()}); 
    }
    
    self.set = function(params) { 
        self.origin=params.origin; self.u=params.u; self.v=params.v; return self; 
    };
    
    self.areaMultiplier = function() { return Vector.det(self.u,self.v); }
    self.distanceMultiplier = function() { return Math.sqrt(self.areaMultiplier()); }

    self.toGlobalPoint = function(p) {
        return self.origin.copy().addMul(self.u,p.x).addMul(self.v,p.y);
    }

    self.toGlobalVector = function(p) {
        return self.u.copy().mul(p.x).addMul(self.v,p.y);
    }

    self.toGlobalFrame = function(p) {
        return Frame({
            origin: self.toGlobalPoint(p.origin), 
            u: self.toGlobalVector(p.u),
            v: self.toGlobalVector(p.v)
        });
    }

    self.toLocalPoint = function(p) {
        let offset = Point2.disp(self.origin, p);
        let areaMul = self.areaMultiplier();
        return Point({x:Vector.det(offset,self.v)/areaMul, y:-Vector.det(offset,self.u)/areaMul});
    }

    self.toLocalVector = function(p) {
        return Vector(self.toLocalPoint(self.origin.copy().add(p)));
    }

    self.toLocalFrame = function(p) {
        return Frame({
            origin: self.toLocalPoint(p.origin),
            u: self.toLocalVector(p.u),
            v: self.toLocalVector(p.v)
        });
    }

    self.transform = function(transform, reference) {
        return self.set(reference.toGlobalFrame(transform.toGlobalFrame(reference.toLocalFrame(self))));
    }

    self.transformLocal = function(transform) {
        return self.set(self.toGlobalFrame(transform));
    }
    
    self.transformGlobal = function(transform) {
        return self.set(transform.toGlobalFrame(self));
    }

    self.translateGlobal = function(vec) { self.origin.add(vec); return self; }

    self.dilateGlobal = function(factor, fixedPoint) {
        self.origin.sub(fixedPoint); self.origin.mul(factor); self.origin.add(fixedPoint);
        self.u.mul(factor);
        self.v.mul(factor);
        return self;
    }

    self.rotateGlobal = function(rad, fixedPoint) {
        self.origin.rotate(rad, fixedPoint);
        self.u.rotate(rad);
        self.v.rotate(rad);
        return self;
    }

    self.translateLocal = function(vec) {
        self.origin.add(self.u.copy().mul(vec.x).addMul(self.v,vec.y));
        return self;
    }

    self.dilateLocal = function(factor) {
        self.u.mul(factor); self.v.mul(factor);
        return self;
    }

    self.rotateLocal = function(rad) {
        self.u.rotate(rad);
        self.v.rotate(rad);
        return self;
    }

    return self;
}


export{Frame};