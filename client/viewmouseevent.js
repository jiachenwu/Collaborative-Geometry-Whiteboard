import {Point} from './geom/point.js'
import {Vector} from './geom/vector.js'

let previousScreenMouse;

var ViewMouseEvent = function(params)
{
    let mouseEvent = params.mouseEvent;
    let wheelEvent = params.wheelEvent;
    if (!mouseEvent) mouseEvent = wheelEvent;

    let self = {
        scrollX: 0,
        scrollY: 0
    };

    if (mouseEvent) {
        let canvas = params.canvas;
        let canvasRect = canvas.getBoundingClientRect();
        let camera = params.camera;
        self.screenMouse = Point({x:mouseEvent.clientX-canvasRect.left, y:mouseEvent.clientY-canvasRect.top});
        self.worldMouse = camera.frame.toGlobalPoint(self.screenMouse);
        if (!previousScreenMouse) previousScreenMouse = self.screenMouse.copy();
        
        self.screenDeltaMouse = Point.disp(previousScreenMouse, self.screenMouse);
        self.worldDeltaMouse = camera.frame.toGlobalVector(self.screenDeltaMouse);
        
        self.screenPreviousMouse = previousScreenMouse;
        self.worldPreviousMouse = self.worldMouse.copy().sub(self.worldDeltaMouse);
        
        previousScreenMouse = self.screenMouse.copy();
    }

    if (wheelEvent) {
        let normalizedWheel = normalizeWheel(wheelEvent);
        self.scrollX = normalizedWheel.spinX;
        self.scrollY = normalizedWheel.spinY;
    }

    return self;
}

function normalizeWheel(event) {
    // From https://github.com/facebookarchive/fixed-data-table/blob/master/src/vendor_upstream/dom/normalizeWheel.js
    var PIXEL_STEP  = 10;
    var LINE_HEIGHT = 40;
    var PAGE_HEIGHT = 800;
  
    var sX = 0, sY = 0,       // spinX, spinY
        pX = 0, pY = 0;       // pixelX, pixelY
  
    // Legacy
    if ('detail'      in event) { sY = event.detail; }
    if ('wheelDelta'  in event) { sY = -event.wheelDelta / 120; }
    if ('wheelDeltaY' in event) { sY = -event.wheelDeltaY / 120; }
    if ('wheelDeltaX' in event) { sX = -event.wheelDeltaX / 120; }
  
    // side scrolling on FF with DOMMouseScroll
    if ( 'axis' in event && event.axis === event.HORIZONTAL_AXIS ) {
      sX = sY;
      sY = 0;
    }
  
    pX = sX * PIXEL_STEP;
    pY = sY * PIXEL_STEP;
  
    if ('deltaY' in event) { pY = event.deltaY; }
    if ('deltaX' in event) { pX = event.deltaX; }
  
    if ((pX || pY) && event.deltaMode) {
      if (event.deltaMode == 1) {          // delta in LINE units
        pX *= LINE_HEIGHT;
        pY *= LINE_HEIGHT;
      } else {                             // delta in PAGE units
        pX *= PAGE_HEIGHT;
        pY *= PAGE_HEIGHT;
      }
    }
  
    // Fall-back if spin cannot be determined
    if (pX && !sX) { sX = (pX < 1) ? -1 : 1; }
    if (pY && !sY) { sY = (pY < 1) ? -1 : 1; }
  
    return { spinX  : sX,
             spinY  : sY,
             pixelX : pX,
             pixelY : pY };
  }


export{ViewMouseEvent};