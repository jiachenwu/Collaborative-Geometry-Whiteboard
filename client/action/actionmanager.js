import {Action} from './action.js'

var ActionManager = function(params)
{
    let self = {
        actions: [],
        construction: params.construction,
        sentUpTo: -1,
        officialActionsToAdd: []
    };

    self.actionIsValid = function(action) {
        if (action.type === Action.AddStep) {
            let stepIds = action.step.inputStepIds;
            for (let id of stepIds) {
                if (self.construction.getStepNumberFromId(id) === -1) {
                    //console.log("fail AddStep "+id);
                    return false;
                }
            }
        }
        else if (action.type === Action.ChangeValue) {
            if (self.construction.getStepNumberFromId(action.stepId) === -1) {
                //console.log("fail ChangeValue "+action.id);
                return false;
            }
        }
        return true;
    }

    self.containsAction = function(id) {
        for (let action of self.actions) {
            if (action.id === id) return true;
        }
        return false;
    }

    self.addOfficial = function(action) {
        while (!self.actionIsValid(action)) self.undo();
        //self.actions.push(action);  // No need to track action if its official. We don't want to undo it.
        //self.sentUpTo++;  //TODO: don't want to send an action to the server that it sent to us... need to do anything?
                          //      For now, assume addOfficial is only called when all actions have been sent. No... Yes. We can remove once sent. In fact, we can remove before sending.
                          //      If something sent is rejected, we need to know. right?
                          //      I think it is fine to not know. However, we need to be careful to possibly delete extra steps if needed. So, when removing, still check for dependencies, that are not already marked to be removed.
        action.act();  // If the action was created by this user, then it probably already contains the action.
    }

    self.addAllOfficial = function() {
        for (let action of self.officialActionsToAdd) {
            if (!self.containsAction(action.id))  self.addOfficial(action);
        }
        self.officialActionsToAdd = [];
    }

    self.add = function(action, act) {
        // Return true if action is valid. Otherwise, return false.
        if (!self.actionIsValid(action)) return false;

        let merged = false;
        // for (let i = self.actions.length-1; i > self.sentUpTo; i--) {
        //     let other = self.actions[i];
        //     if (other.type !== Action.ChangeValue) break;
        //     if (other.stepId === action.stepId && other.variableName === action.variableName) {
        //         other.newValue = action.newValue;
        //         merged = true;
        //         break;
        //     }
        // }

        if (!merged) self.actions.push(action);

        if (act) action.act();
        return true;
    }

    self.undo = function() {
        if (self.actions.length > 0) {
            self.actions[self.actions.length-1].undo();
            self.actions.pop();
        }
    }

    self.removeFront = function() {
        if (self.actions.length > 0) {
            self.actions.splice(0,1);
            self.sentUpTo--;
        }
    }

    self.clear = function() {
        self.actions = [];
        self.officialActionsToAdd = [];
        self.sentUpTo = -1;
    }

    self.serializedActions = function() {
        let serial = [];
        for (let action of self.actions) {
            serial.push(action.serialized());
        }
        return serial;
    }

    return self;
}
ActionManager.deserializeActions = function(serial, construction, manager) {
    let actions = [];
    for (let actionSerial of serial) {
        actions.push(Action.deserialize(actionSerial, construction, manager));
    }
    return actions;
}


export{ActionManager};