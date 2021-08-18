import {Tool} from './tool.js'

var ConstructTool = function(params)
{
    let self = Tool({
        type: Tool.Construct,
        editor: params.editor,
        button: params.button
    });

    self.onenable = function(e) { self.button.disabled=true; }
    self.ondisable = function(e) { self.button.disabled=false; }

    self.onmousedown = function(e) {}
    self.onmouseup = function(e) {}
    self.onmousemove = function(e) {}
    self.onwheel = function(e) {}

    self.onkeydown = function(e) {

    }

    self.onkeyup = function(e) {
        
    }

    self.render = function() {
        
    }

    return self;
}


export{ConstructTool};