import {Tool} from './tool.js'
import {Point} from '../geom/point.js'
import { MakePoint } from '../construction/makepoint.js';
import {AddStep} from '../action/addstep.js';

var PointTool = function(params)
{
    let self = Tool({
        type: Tool.Point,
        editor: params.editor,
        button: params.button
    });

    self.selected = [];

    self.mouse = Point({x:-99999, y:-99999});
    self.toPick = null;

    self.dragging = false;

    self.onenable = function(e) {
        self.button.disabled=true; 
    }
    
    self.ondisable = function(e) { 
        self.button.disabled=false;
        self.dragging = false;
        self.selected = [];
    }

    self.onmousedown = function(e) {
        self.dragging = true;
        if (self.toPick) {
            if (!self.editor.construction.steps.includes(self.toPick)) {
                //self.editor.construction.addStep(self.toPick);
                self.editor.actions.add(AddStep({
                    manager: self.editor.actions,
                    step: self.toPick
                }), true);
            }
            self.selected.push(self.toPick);
        }
    }

    self.onmouseup = function(e) {
        self.selected = [];
        self.dragging = false;
        self.toPick = null;
    }

    self.onmousemove = function(e) {
        self.mouse = e.worldMouse.copy();
        if (!self.dragging) {
            let pickDist = self.editor.camera.pixelsToWorldUnits(self.editor.pickDist);
            self.toPick = self.editor.construction.pickOrMakeMakePoint(e.worldMouse, pickDist);
        }
        else {
            for (let step of self.selected) {
                step.tryMoving(e.worldDeltaMouse, e.worldMouse);
            }
        }
    }

    self.onkeydown = function(e) {

    }

    self.onkeyup = function(e) {
        
    }

    self.render = function() {
        if (self.toPick) {
            self.toPick.renderHighlight({editor:self.editor});
        }
    }

    return self;
}


export{PointTool};