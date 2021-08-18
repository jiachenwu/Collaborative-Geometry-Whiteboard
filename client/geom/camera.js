import {Point} from './point.js'
import {Vector} from './vector.js'
import {Frame} from './frame.js'

var Camera = function(params)
{
    let self = {
        viewWidth: params.viewWidth,
        viewHeight: params.viewHeight,
        frame: Frame({
            origin:Point({x:0, y:0}), 
            u:Vector({x:1, y:0}), 
            v:Vector({x:0, y:1})
        })
    };

    self.deepCopy = function() { 
        let c = Camera({viewWidth:self.viewWidth, viewHeight:self.viewHeight});
        c.frame.set(self.frame);
        return c;
    }
    
    self.set = function(params) { 
        self.viewWidth = params.viewWidth;
        self.viewHeight = params.viewHeight;
        self.frame.set(params.frame);
        return self; 
    };

    self.aspectRatio = function() { return self.viewWidth/self.viewHeight; }

    self.worldToView = function() {
        return self.frame.toLocalFrame({
            origin:Point({x:0,y:0}),
            u:Vector({x:1,y:0}),
            v:Vector({x:0,y:1})
        });
    }

    self.viewToClip = function() {
        return Frame({
            origin: Point({x:-1, y:1}),
            u: Vector({x:1.0/(self.viewWidth*.5), y:0}),
            v: Vector({x:0, y:-1.0/(self.viewHeight*.5)})
        });
    }

    self.worldToClip = function() {
        return self.worldToView().transformGlobal(self.viewToClip);
    }

    self.pixelsToWorldUnits = function(pixels) {
        return self.frame.distanceMultiplier() * pixels;
    }

    return self;
}


export{Camera};