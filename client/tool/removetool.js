import {Tool} from './tool.js'
import {DeleteStep} from '../action/deletestep.js'

var RemoveTool = function(params)
{
    let self = Tool({
        type: Tool.Move, 
        editor: params.editor,
        button: params.button
    });

    self.toPick = null;

    self.dragging = false;

    self.onenable = function(e) { 
        self.button.disabled = true; 
    }

    self.ondisable = function(e) { 
        self.button.disabled = false;
        self.dragging = false;
    }

    self.onmousedown = function(e) {
        if (self.toPick) {
            //self.editor.construction.removeStep(self.toPick);
            self.editor.actions.add(DeleteStep({
                manager: self.editor.actions,
                idsToDelete: self.editor.construction.getIdsToRemove(self.toPick)
            }), true);
            self.toPick = null;
        }
        else {
            self.dragging = true;
        }
    }

    self.onmouseup = function(e) {
        self.dragging = false;
    }

    self.onmousemove = function(e) {
        if (!self.dragging) {
            let pickDist = self.editor.camera.pixelsToWorldUnits(self.editor.pickDist);
            self.toPick = self.editor.construction.pickStep(e.worldMouse, pickDist);
        }
        else {
            self.editor.camera.frame.translateGlobal(e.worldDeltaMouse.copy().mul(-1));
        }
    }

    self.onkeydown = function(e) {

    }

    self.onkeyup = function(e) {
        
    }

    self.render = function() {
        if (self.toPick) self.toPick.renderHighlight({editor:self.editor, color:'#ff0000'});
    }

    return self;
}


export{RemoveTool};