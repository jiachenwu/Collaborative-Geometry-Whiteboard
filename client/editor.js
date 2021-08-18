import {Camera} from './geom/camera.js'
import {Construction} from './construction/construction.js'
import {MakePoint} from './construction/makepoint.js'
import {MakeLine} from './construction/makeline.js'
import {MakeCircle} from './construction/makecircle.js'
import {MoveTool} from './tool/movetool.js'
import {RemoveTool} from './tool/removetool.js'
import {PointTool} from './tool/pointtool.js'
import {LineTool} from './tool/linetool.js'
import {CircleTool} from './tool/circletool.js'
import {ConstructTool} from './tool/constructtool.js'
import {ActionManager} from './action/actionmanager.js'
import {AddStep} from './action/addstep.js'
import {ViewMouseEvent} from './viewmouseevent.js'

var Editor = function(params)
{
    let self = {};

    self.pickDist = 10;
    
    self.toolButtons = params.toolButtons;

    self.tools = {
        move: MoveTool({editor:self, button:self.toolButtons.move}),
        remove: RemoveTool({editor:self, button:self.toolButtons.remove}),
        point: PointTool({editor:self, button:self.toolButtons.point}),
        line: LineTool({editor:self, button:self.toolButtons.line}),
        circle: CircleTool({editor:self, button:self.toolButtons.circle}),
        construct: ConstructTool({editor:self, button:self.toolButtons.construct})
    };

    self.selectedTool = null;

    self.selectTool = function(tool) {
        if (self.selectedTool) self.selectedTool.ondisable({});
        self.selectedTool = tool;
        tool.onenable({});
    }
    self.selectTool(self.tools.move);

    self.toolButtons.move.onclick = function() { self.selectTool(self.tools.move); }
    self.toolButtons.remove.onclick = function() { self.selectTool(self.tools.remove); }
    self.toolButtons.point.onclick = function() { self.selectTool(self.tools.point); }
    self.toolButtons.line.onclick = function() { self.selectTool(self.tools.line); }
    self.toolButtons.circle.onclick = function() { self.selectTool(self.tools.circle); }
    self.toolButtons.construct.onclick = function() { self.selectTool(self.tools.construct); }
    
    self.stage = params.stage;
    self.canvas = params.canvas;
    self.ctx = self.canvas.getContext("2d");
    self.ctx.font = '30px Arial';

    self.camera = Camera({viewWidth:self.canvas.width, viewHeight:self.canvas.height});

    self.worldMouse = {x:0, y:0};

    self.construction = Construction();
    self.construction.editor = self;

    self.actions = ActionManager({construction:self.construction});

    let step0 = MakePoint({x:200, y:200});  self.actions.add(AddStep({manager:self.actions, step:step0}), true);
    let step1 = MakePoint({x:300, y:200});  self.actions.add(AddStep({manager:self.actions, step:step1}), true);
    let step2 = MakeCircle({inputStepIds:[step0.id, step1.id]});  self.actions.add(AddStep({manager:self.actions, step:step2}), true);
    let step3 = MakeCircle({inputStepIds:[step1.id, step0.id]});  self.actions.add(AddStep({manager:self.actions, step:step3}), true);
    let step4 = MakePoint({constraintType:MakePoint.OnIntersect, inputStepIds:[step2.id, step3.id], choice:0});  self.actions.add(AddStep({manager:self.actions, step:step4}), true);
    let step5 = MakePoint({constraintType:MakePoint.OnIntersect, inputStepIds:[step2.id, step3.id], choice:1});  self.actions.add(AddStep({manager:self.actions, step:step5}), true);
    let step6 = MakeLine({inputStepIds:[step0.id, step1.id]});  self.actions.add(AddStep({manager:self.actions, step:step6}), true);
    let step7 = MakeLine({inputStepIds:[step4.id, step5.id]});  self.actions.add(AddStep({manager:self.actions, step:step7}), true);
    self.actions.clear();

    self.resetCamera = function() {
        self.camera.frame.origin.set({x:0,y:0});
        self.camera.frame.u.set({x:1,y:0});
        self.camera.frame.v.set({x:0,y:1});
    }

    self.loadEmptyConstruction = function(data) {
        if (data && !data.preserveCamera) self.resetCamera();

        self.selectTool(self.selectedTool);

        self.actions.clear();

        self.construction = Construction();
        self.construction.editor = self;
        self.actions.construction = self.construction;
    }

    self.loadConstruction = function(data) {
        self.loadEmptyConstruction(data);
        self.construction = Construction.deserialize(data.serial);
        self.construction.editor = self;
        self.actions.construction = self.construction;
    }

    self.onmousedown = function(event) {
        let e = ViewMouseEvent({canvas:self.canvas, camera:self.camera, mouseEvent:event});
        self.selectedTool.onmousedown(e);
    }

    self.onmouseup = function(event) {
        let e = ViewMouseEvent({canvas:self.canvas, camera:self.camera, mouseEvent:event});
        self.selectedTool.onmouseup(e);
    }

    self.onmousemove = function(event) {
        let e = ViewMouseEvent({canvas:self.canvas, camera:self.camera, mouseEvent:event});
        self.selectedTool.onmousemove(e);
        self.worldMouse.x = e.worldMouse.x;
        self.worldMouse.y = e.worldMouse.y;
    }

    self.onwheel = function(event) {
        let e = ViewMouseEvent({canvas:self.canvas, camera:self.camera, wheelEvent:event});
        self.selectedTool.onwheel(e);
    }

    self.onkeydown = function(event) {
        self.selectedTool.onkeydown(event);
    }

    self.onkeyup = function(event) {
        self.selectedTool.onkeyup(event);
    }

    self.render = function() {
        let canvas = self.canvas;
        let ctx = self.ctx;
        let camera = self.camera;
        let construction = self.construction;

        // Clear
        ctx.setTransform(1,0,0,1,0,0);  // Identity transform
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Camera transform
        let m = new DOMMatrix([camera.frame.u.x, camera.frame.u.y, camera.frame.v.x, camera.frame.v.y, camera.frame.origin.x, camera.frame.origin.y]);
        m.invertSelf();
        ctx.setTransform(m.a,m.b,m.c,m.d,m.e,m.f);

        // Update construction
        construction.execute();

        // Draw
        for (var step of construction.steps) {
            step.render({editor:self});
        }

        self.selectedTool.render();
    }

    self.onresize = function(event) {
        let stage = self.stage;
        let canvas = self.canvas;
        let camera = self.camera;

        let rect = stage.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        let styleString = "z-index:0; position:absolute; top:"+rect.top+"px; left:"+rect.left+"px; width:"+rect.width+"px; height:"+rect.height+"px;";
        canvas.setAttribute("style", styleString);
        if (event.adjustCamera) camera.frame.translateLocal({x:(camera.viewWidth-canvas.width)/2, y:(camera.viewHeight-canvas.height)/2});
        camera.viewWidth = canvas.width;
        camera.viewHeight = canvas.height;
        self.render();
    }

    return self;
}



export{Editor};