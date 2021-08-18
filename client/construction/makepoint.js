import {Step} from './step.js'
import {Point} from '../geom/point.js'
import {Vector} from '../geom/vector.js'
import {Line} from '../geom/line.js'
import {Circle} from '../geom/circle.js'
import {ChangeValue} from '../action/changevalue.js'

var MakePoint = function(params)
{
    let self = Step({type:Step.MakePoint});

    if (!params.constraintType) self.constraintType = MakePoint.Free;
    else self.constraintType = params.constraintType;

    let super_serialized = self.serialized;

    if (self.constraintType === MakePoint.Free)
    {
        self.color = '#0000aa';
        self.thickness = 2.5;

        self.x = 0;
        self.y = 0;
        if (params.x) self.x = params.x;
        if (params.y) self.y = params.y;
    
        self.serialized = function() {
            let s = super_serialized();
            s.constraintType = self.constraintType;
            s.x = self.x;
            s.y = self.y;
            return s;
        }

        self.tryMoving = function(delta, newPos) {
            self.construction.editor.actions.add(ChangeValue({
                manager: self.construction.editor.actions,
                stepId: self.id,
                variableName: "x",
                newValue: self.x + delta.x
            }), true);
            self.construction.editor.actions.add(ChangeValue({
                manager: self.construction.editor.actions,
                stepId: self.id,
                variableName: "y",
                newValue: self.y + delta.y
            }), true);
        }
    
        self.updateOutput = function() {
            self.output = Point({x:self.x,y:self.y});
        }
    }
    else if (self.constraintType === MakePoint.OnLine)
    {
        self.color = '#00aa00';
        self.thickness = 2.5;

        self.inputStepIds = params.inputStepIds;
        self.t = params.t;

        self.serialized = function() {
            let s = super_serialized();
            s.constraintType = self.constraintType;
            s.t = self.t;
            return s;
        }

        self.tryMoving = function(delta, newPos) {
            let line = self.construction.getStepFromId(self.inputStepIds[0]).output;
            self.construction.editor.actions.add(ChangeValue({
                manager: self.construction.editor.actions,
                stepId: self.id,
                variableName: "t",
                newValue: Vector.dot(line.displacement(), Point.disp(line.a,newPos)) / Point.distSq(line.a,line.b)
            }), true);
        }
    
        self.updateOutput = function() {
            let lineStep = self.construction.getStepFromId(self.inputStepIds[0]);
            let p = lineStep.output.point(self.t);
            self.output = Point({x:p.x, y:p.y});
        }
    }
    else if (self.constraintType === MakePoint.OnCircle)
    {
        self.color = '#00aa00';
        self.thickness = 2.5;

        self.inputStepIds = params.inputStepIds;
        self.angle = params.angle;

        self.serialized = function() {
            let s = super_serialized();
            s.constraintType = self.constraintType;
            s.angle = self.angle;
            return s;
        }

        self.tryMoving = function(delta, newPos) {
            let circle = self.construction.getStepFromId(self.inputStepIds[0]).output;
            self.construction.editor.actions.add(ChangeValue({
                manager: self.construction.editor.actions,
                stepId: self.id,
                variableName: "angle",
                newValue: Vector.angle(Vector({x:0,y:1}), Point.disp(circle.center, newPos))
            }), true);
        }
    
        self.updateOutput = function() {
            let circle = self.construction.getStepFromId(self.inputStepIds[0]).output;
            let p = circle.center.copy().add(Vector({x:0, y:circle.radius}).rotate(self.angle));
            self.output = Point({x:p.x, y:p.y});
        }
    }
    else if (self.constraintType === MakePoint.OnIntersect)
    {
        self.color = '#aa0000';
        self.thickness = 2;

        self.inputStepIds = params.inputStepIds;
        self.choice = params.choice;

        self.serialized = function() {
            let s = super_serialized();
            s.constraintType = self.constraintType;
            s.choice = self.choice;
            return s;
        }
        
        self.tryMoving = function(delta, newPos) {
            // Can't move
        }
    
        self.updateOutput = function() {
            let stepA = self.construction.getStepFromId(self.inputStepIds[0]);
            let stepB = self.construction.getStepFromId(self.inputStepIds[1]);
            let objA = stepA.output;
            let objB = stepB.output;
            if (!objA || !objB) return null;
            if (stepA.type === Step.MakeLine && stepB.type === Step.MakeLine) {
                self.output = Line.intersect(objA, objB);
            }
            else if (stepA.type === Step.MakeCircle && stepB.type === Step.MakeCircle) {
                let intersects = Circle.intersect(objA, objB);
                if (!intersects) self.output = null;
                else self.output = intersects[self.choice];
            }
            else if (stepA.type === Step.MakeLine && stepB.type === Step.MakeCircle) {
                let intersects = objA.intersectCircle(objB);
                if (!intersects) self.output = null;
                else self.output = intersects[self.choice];
            }
            else if (stepA.type === Step.MakeCircle && stepB.type === Step.MakeLine) {
                let intersects = objB.intersectCircle(objA);
                if (!intersects) self.output = null;
                else self.output = intersects[self.choice];
            }
            else {
                self.output = null;
            }
        }
    }

    if (params.color) self.color=params.color;
    if (params.thickness) self.thickness=params.thickness;


    self.distanceToPoint = function(pt) { 
        if (self.output) return Point.dist(self.output, pt);
        else return Infinity;
    }

    self.render = function(params) {
        if (!self.output) return;
        let editor = params.editor;
        let ctx = editor.ctx;

        let pixelsToWorld = editor.camera.pixelsToWorldUnits(1);
        let p = self.output;
        ctx.fillStyle = self.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, self.thickness*2*pixelsToWorld, 0, Math.PI*2);
        ctx.fill();
    }

    self.renderHighlight = function(params) {
        if (!self.output) return;
        let editor = params.editor;
        let ctx = editor.ctx;
        let color = '#00ffff';
        if (params.color) color = params.color;

        let pixelsToWorld = editor.camera.pixelsToWorldUnits(1);
        let p = self.output;
        ctx.globalAlpha = .5;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, self.thickness*3*pixelsToWorld, 0, Math.PI*2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }

    return self;
}
MakePoint.Free = 1;
MakePoint.OnLine = 2;
MakePoint.OnCircle = 3;
MakePoint.OnIntersect = 4;


export{MakePoint};