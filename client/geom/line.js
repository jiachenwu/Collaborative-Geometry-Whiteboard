import {Point} from './point.js'
import {Vector} from './vector.js'

var Line = function(params)
{
    let self = {a:params.a, b:params.b};  // a and b are any two points on the line.

    self.deepCopy = function() { return Line({a: self.a.copy(), b: self.b.copy()}); }
    self.set = function(params) { self.a.set(params.a); self.b.set(params.b); return self; };
    
    self.displacement = function() { return Point.disp(self.a,self.b); }
    self.direction = function() { return Point.disp(self.a,self.b).normalize(); }

    self.point = function(t) { return self.a.copy().addMul(self.displacement(), t); }
    self.pointNormalized = function(t) { return self.a.copy().addMul(self.direction(), t); }

    self.distanceToPoint = function(pt) {
        return Math.abs(Vector.dot(self.direction().turn(), Point.disp(self.a,pt)));
    }

    self.nearestPointTo = function(pt) {
        let dir = self.direction();
        return self.a.copy().addMul(dir, Vector.dot(dir, Point.disp(self.a,pt)));
    }

    self.intersectCircle = function(circle) {
        let P = self.nearestPointTo(circle.center);
        let r = circle.radius;
        let C = circle.center;
        let D = self.direction();
        let N = Point.disp(C, P);
        let d = N.mag();
        let discriminant = r*r - d*d;
        if (discriminant < 0) return null;
        let h = Math.sqrt(discriminant);
        return [
            C.copy().add(N).addMul(D,h), 
            C.copy().add(N).subMul(D,h)
        ];
    }

    return self;
}
Line.intersectTime = function(p1, v1, p2, v2) {
    if (Vector.det(v1,v2) == 0) return Infinity;
    let tv2 = v2.copy().turn();
    return Vector.dot(Point.disp(p1,p2),tv2) / Vector.dot(v1,tv2);
}
Line.intersect = function(A, B) {
    let v1 = A.displacement();
    let t = Line.intersectTime(A.a,v1, B.a,B.displacement());
    if (t === Infinity) return null;
    return A.a.copy().addMul(v1,t);
}



export{Line};