import {Action} from './action.js'

var ChangeValue = function(params)
{
    params.type = Action.ChangeValue;
    let self = Action(params);
    self.stepId = params.stepId;
    self.variableName = params.variableName;
    self.newValue = params.newValue;

    self.originalValue = null;

    self.act = function() {
        let construction = self.manager.construction;
        let step = construction.getStepFromId(self.stepId);
        self.originalValue = step[self.variableName];
        step[self.variableName] = self.newValue;
    }

    self.undo = function() {
        let construction = self.manager.construction;
        let step = construction.getStepFromId(self.stepId);
        step[self.variableName] = self.originalValue;
    }

    self.serialized = function() {
        let serial = {
            type: Action.ChangeValue,
            stepId: self.stepId,
            variableName: self.variableName,
            newValue: self.newValue,
            id: self.id
        };
        return serial;
    }

    return self;
}


export{ChangeValue};