import {AddStep} from './addstep.js'
import {DeleteStep} from './deletestep.js'
import {ChangeValue} from './changevalue.js'
import {Step} from '../construction/step.js'

var Action = function(params)
{
    let id = params.id;
    if (!id) id = Math.random();
    let self = {
        manager: params.manager,
        type: params.type,
        id: id  // Need to know if the actions has already been applied
        //socketId: manager.socketId
    };

    // Has act and undo functions. Neither take input.

    return self;
}
Action.AddStep = 1;
Action.DeleteStep = 2;
Action.ChangeValue = 3;

Action.deserialize = function(serial, construction, manager) {
    if (serial.type === Action.AddStep) {
        let step = Step.deserialize(serial.step);
        step.construction = construction;
        return AddStep({
            manager: manager,
            step: step,
            id: serial.id
        });
    }
    else if (serial.type === Action.DeleteStep) {
        return DeleteStep({
            manager: manager,
            idsToDelete: serial.idsToDelete,
            id: serial.id
        });
    }
    else if (serial.type === Action.ChangeValue) {
        return ChangeValue({
            manager: manager,
            stepId: serial.stepId,
            variableName: serial.variableName,
            newValue: serial.newValue,
            id: serial.id
        });
    }
    return null;
}


export{Action};