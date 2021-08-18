
var Tool = function(params)
{
    let self = {
        type: params.type,
        editor: params.editor,
        button: params.button
    };

    self.onwheel = function(e) {
        let sensitivity = .1;
        let scale = Math.abs(e.scrollY) * sensitivity + 1;
        if (e.scrollY < 0) scale = 1.0/scale;
        self.editor.camera.frame.dilateGlobal(scale, e.worldMouse);
    }
    
    return self;
}
Tool.Move = 1;
Tool.Point = 2;
Tool.Line = 3;
Tool.Circle = 4;
Tool.Construct = 5;

export{Tool};