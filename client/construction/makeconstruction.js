import {Step} from './step.js'

var MakeConstruction = function(params)
{
    let self = Step({type:Step.MakeConstruction});

    
    self.distanceToPoint = function(pt) { 
        return Infinity;
    }

    self.tryMoving = function(delta, newPos) {
        
    }

    self.updateOutput = function() {
        
    }

    self.render = function(params) {
        
    }

    return self;
}


export{MakeConstruction};