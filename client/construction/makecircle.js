import {Step} from './step.js'
import {Circle} from '../geom/circle.js'
import { Point } from '../geom/point.js';

var MakeCircle = function(params)
{
    let self = Step({type:Step.MakeCircle});

    self.inputStepIds = params.inputStepIds;

    self.distanceToPoint = function(pt) { 
        if (self.output) return self.output.distanceToPoint(pt);
        else return Infinity;
    }

    self.tryMoving = function(delta, newPos) {
        
    }

    self.updateOutput = function() {
        let center = self.construction.getStepFromId(self.inputStepIds[0]).output;
        let radialPoint = self.construction.getStepFromId(self.inputStepIds[1]).output;
        if (!center || !radialPoint) self.output = null;
        else self.output = Circle({center: center, radius: Point.dist(center,radialPoint)});
    }

    self.render = function(params) {
        if (!self.output) return;

        let editor = params.editor;
        let ctx = editor.ctx;

        let pixelsToWorld = editor.camera.pixelsToWorldUnits(1);
        let circle = self.output;
        ctx.strokeStyle = self.color;
        ctx.lineWidth = self.thickness*pixelsToWorld;
        ctx.beginPath();
        ctx.arc(circle.center.x, circle.center.y, circle.radius, 0, Math.PI*2);
        ctx.stroke();
    }

    self.renderHighlight = function(params) {
        if (!self.output) return;

        let editor = params.editor;
        let ctx = editor.ctx;
        let color = '#00ffff';
        if (params.color) color = params.color;

        let pixelsToWorld = editor.camera.pixelsToWorldUnits(1);
        let circle = self.output;
        ctx.globalAlpha = .5;
        ctx.strokeStyle = color;
        ctx.lineWidth = self.thickness*1.5*pixelsToWorld;
        ctx.beginPath();
        ctx.arc(circle.center.x, circle.center.y, circle.radius, 0, Math.PI*2);
        ctx.stroke();
        ctx.globalAlpha = 1;
    }

    return self;
}


export{MakeCircle};