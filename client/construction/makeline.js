import {Step} from './step.js'
import {Line} from '../geom/line.js'
import {Point} from '../geom/point.js'

var MakeLine = function(params)
{
    let self = Step({type:Step.MakeLine});

    self.inputStepIds = params.inputStepIds;

    self.distanceToPoint = function(pt) { 
        if (self.output) return self.output.distanceToPoint(pt);
        else return Infinity;
    }

    self.tryMoving = function(delta, newPos) {
        
    }

    self.updateOutput = function() {
        let a = self.construction.getStepFromId(self.inputStepIds[0]).output;
        let b = self.construction.getStepFromId(self.inputStepIds[1]).output;
        if (!a || !b) self.output = null;
        else self.output = Line({a: a, b: b});
    }

    self.render = function(params) {
        if (!self.output) return;

        let editor = params.editor;
        let ctx = editor.ctx;

        let pixelsToWorld = editor.camera.pixelsToWorldUnits(1);
        let line = self.output;
        ctx.strokeStyle = self.color;
        ctx.lineWidth = self.thickness*pixelsToWorld;
        ctx.beginPath();
        let a=line.point(-9999); ctx.moveTo(a.x, a.y);  // TODO: Clip line on screen border, and only draw visible part.
        ctx.lineTo(line.a.x, line.a.y);
        ctx.lineTo(line.b.x, line.b.y);
        let b=line.point(9999).add(Point.disp(line.a,line.b)); ctx.lineTo(b.x, b.y);
        ctx.stroke();
    }

    self.renderHighlight = function(params) {
        if (!self.output) return;

        let editor = params.editor;
        let ctx = editor.ctx;
        let color = '#00ffff';
        if (params.color) color = params.color;

        let pixelsToWorld = editor.camera.pixelsToWorldUnits(1);
        let line = self.output;
        ctx.globalAlpha = .5;
        ctx.strokeStyle = color;
        ctx.lineWidth = self.thickness*1.5*pixelsToWorld;
        ctx.beginPath();
        let a=line.point(-9999); ctx.moveTo(a.x, a.y);  // TODO: Clip line on screen border, and only draw visible part.
        ctx.lineTo(line.a.x, line.a.y);
        ctx.lineTo(line.b.x, line.b.y);
        let b=line.point(9999).add(Point.disp(line.a,line.b)); ctx.lineTo(b.x, b.y);
        ctx.stroke();
        ctx.globalAlpha = 1;
    }

    return self;
}


export{MakeLine};