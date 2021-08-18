import {Tool} from './tool.js'
import {Point} from '../geom/point.js'
import {MakeLine} from '../construction/makeline.js';
import {MakePoint} from '../construction/makepoint.js';
import {AddStep} from '../action/addstep.js';

var LineTool = function(params)
{
    let self = Tool({
        type: Tool.Line,
        editor: params.editor,
        button: params.button
    });

    self.linePoints = [];

    self.mouse = Point({x:-99999, y:-99999});
    self.toPick = null;

    self.onenable = function(e) { 
        self.button.disabled=true; 
        self.linePoints = [];
    }
    
    self.ondisable = function(e) { 
        self.button.disabled=false;
    }

    self.addPointAndLine = function() {
        if (self.toPick) {
            if (!self.editor.construction.steps.includes(self.toPick)) {
                self.editor.actions.add(AddStep({
                    manager: self.editor.actions,
                    step: self.toPick
                }), true);
            }
            self.linePoints.push(self.toPick);
        }
        
        if (self.linePoints.length == 2) {
            if (self.linePoints[0] !== self.linePoints[1]) {
                let newLineStep = MakeLine({inputStepIds:[self.linePoints[0].id, self.linePoints[1].id]});
                self.editor.actions.add(AddStep({
                    manager: self.editor.actions,
                    step: newLineStep
                }), true);
            }
            self.linePoints = [];
        }
    }

    self.onmousedown = function(e) {
        self.addPointAndLine();
    }

    self.onmouseup = function(e) {
        let pickDist = self.editor.camera.pixelsToWorldUnits(self.editor.pickDist);
        self.toPick = self.editor.construction.pickOrMakeMakePoint(e.worldMouse, pickDist);
        
        if (self.linePoints.length == 1 && self.toPick !== self.linePoints[0]) {
            self.addPointAndLine();
        }
    }

    self.onmousemove = function(e) {
        self.mouse = e.worldMouse.copy();
        let pickDist = self.editor.camera.pixelsToWorldUnits(self.editor.pickDist);
        self.toPick = self.editor.construction.pickOrMakeMakePoint(e.worldMouse, pickDist);
    }

    self.onkeydown = function(e) {

    }

    self.onkeyup = function(e) {
        
    }

    self.render = function() {
        let editor = self.editor;
        let ctx = editor.ctx;
        let pixelsToWorld = editor.camera.pixelsToWorldUnits(1);

        if (self.toPick) self.toPick.renderHighlight({editor:self.editor});

        if (self.linePoints.length == 1) {
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 1*pixelsToWorld;
            ctx.beginPath();
            let a = self.linePoints[0].output;
            let b = (self.toPick)? self.toPick.output : self.mouse; 
            let beforeA = Point.lerp(b,a,9999);
            let afterB = Point.lerp(a,b,9999);
            ctx.moveTo(beforeA.x, beforeA.y);
            ctx.lineTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.lineTo(afterB.x, afterB.y);
            ctx.stroke();
        }
    }

    return self;
}


export{LineTool};