import {Tool} from './tool.js'
import {Point} from '../geom/point.js'
import {MakeCircle} from '../construction/makecircle.js';
import {MakePoint} from '../construction/makepoint.js';
import {AddStep} from '../action/addstep.js';

var CircleTool = function(params)
{
    let self = Tool({
        type: Tool.Circle,
        editor: params.editor,
        button: params.button
    });

    self.circlePoints = [];

    self.mouse = Point({x:-99999, y:-99999});
    self.toPick = null;

    self.onenable = function(e) { 
        self.button.disabled=true; 
        self.circlePoints = [];
    }
    
    self.ondisable = function(e) { 
        self.button.disabled=false; 
    }

    self.addPointAndCircle = function() {
        if (self.toPick) {
            if (!self.editor.construction.steps.includes(self.toPick)) {
                self.editor.actions.add(AddStep({
                    manager: self.editor.actions,
                    step: self.toPick
                }), true);
            }
            self.circlePoints.push(self.toPick);
        }
        
        if (self.circlePoints.length == 2) {
            if (self.circlePoints[0] !== self.circlePoints[1]) {
                let newLineStep = MakeCircle({inputStepIds:[self.circlePoints[0].id, self.circlePoints[1].id]});
                self.editor.actions.add(AddStep({
                    manager: self.editor.actions,
                    step: newLineStep
                }), true);
            }
            self.circlePoints = [];
        }
    }

    self.onmousedown = function(e) {
        self.addPointAndCircle();
    }

    self.onmouseup = function(e) {
        let pickDist = self.editor.camera.pixelsToWorldUnits(self.editor.pickDist);
        self.toPick = self.editor.construction.pickOrMakeMakePoint(e.worldMouse, pickDist);
        
        if (self.circlePoints.length == 1 && self.toPick !== self.circlePoints[0]) {
            self.addPointAndCircle();
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

        if (self.circlePoints.length == 1) {
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 1*pixelsToWorld;
            let p = (self.toPick)? self.toPick.output : self.mouse;
            ctx.beginPath();
            ctx.arc(self.circlePoints[0].output.x, self.circlePoints[0].output.y, Point.dist(self.circlePoints[0].output, p), 0, 2*Math.PI)
            ctx.stroke();
        }
    }

    return self;
}


export{CircleTool};