import {Point} from './point.js'

var Circle = function(params)
{
    let self = {center:params.center, radius:params.radius};

    self.deepCopy = function() { return Circle({center: self.center.copy(), radius: self.radius}); }
    self.set = function(params) { self.center.set(params.center); self.radius=params.radius; return self; };
    
    self.distanceToPoint = function(pt) {
        return Math.abs(Point.dist(self.center,pt) - self.radius);
    }

    self.nearestPointTo = function(pt) {;
        return self.center.copy().addMul(Point.disp(self.center,pt).normalize(), self.radius);
    }

    return self;
}
Circle.intersect = function(A, B) {
    let d = Point.dist(A.center, B.center);
    if (d === 0) return null;
    let a = (A.radius*A.radius - B.radius*B.radius + d*d) / (2*d);
    if (A.radius*A.radius - a*a < 0) return null;
    let h = Math.sqrt(A.radius*A.radius - a*a);
    let AB = Point.disp(A.center,B.center).normalize();
    return [
        A.center.copy().addMul(AB,a).addMul(AB.copy().turn(),h), 
        A.center.copy().addMul(AB,a).subMul(AB.copy().turn(),h)
    ];
}


export{Circle};