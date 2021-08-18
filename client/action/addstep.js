import {Action} from './action.js'

var AddStep = function(params)
{
    params.type = Action.AddStep;
    let self = Action(params);
    self.step = params.step;

    self.originalConstruction = null;

    self.act = function() {
        let construction = self.manager.construction;
        self.originalConstruction = self.step.construction;
        self.step.construction = construction;
        construction.steps.push(self.step);
    }

    self.undo = function() {
        self.manager.construction.steps.pop();
        self.step.construction = self.originalConstruction;
    }

    self.serialized = function() {
        let serial = {
            type: Action.AddStep,
            step: self.step.serialized(),
            id: self.id
        };
        return serial;
    }

    return self;
}


export{AddStep};