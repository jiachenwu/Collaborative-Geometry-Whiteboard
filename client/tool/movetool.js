import {Tool} from './tool.js'

var MoveTool = function(params)
{
    let self = Tool({
        type: Tool.Move, 
        editor: params.editor,
        button: params.button
    });

    self.selected = [];

    self.toPick = null;

    self.dragging = false;

    self.onenable = function(e) { 
        self.button.disabled = true; 
    }

    self.ondisable = function(e) { 
        self.button.disabled = false;
        self.dragging = false;
        self.selected = [];
    }

    self.onmousedown = function(e) {
        self.dragging = true;
        if (self.toPick) {
            self.selected.push(self.toPick);
        }
    }

    self.onmouseup = function(e) {
        self.selected = [];
        self.dragging = false;
    }

    self.onmousemove = function(e) {
        if (!self.dragging) {
            let pickDist = self.editor.camera.pixelsToWorldUnits(self.editor.pickDist);
            self.toPick = self.editor.construction.pickNearestMakePoint(e.worldMouse, pickDist);
        }
        else {
            if (self.selected.length > 0) {
                for (let step of self.selected) {
                    step.tryMoving(e.worldDeltaMouse, e.worldMouse);
                }
            }
            else {
                self.editor.camera.frame.translateGlobal(e.worldDeltaMouse.copy().mul(-1));
            }
        }
    }

    self.onkeydown = function(e) {

    }

    self.onkeyup = function(e) {
        
    }

    self.render = function() {
        if (self.toPick) self.toPick.renderHighlight({editor:self.editor});
    }

    return self;
}


export{MoveTool};