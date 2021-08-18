import {Action} from './action.js'

var DeleteStep = function(params)
{
    params.type = Action.DeleteStep;
    let self = Action(params);
    self.idsToDelete = params.idsToDelete;

    self.deleted = [];
    self.indicesOfDeleted = [];

    self.act = function() {
        self.deleted = [];
        self.indicesOfDeleted = [];
        let construction = self.manager.construction;
        for (let id of self.idsToDelete) {
            let i = construction.getStepNumberFromId(id);
            let d = construction.steps.splice(i, 1);
            self.indicesOfDeleted.push(i);
            self.deleted.push(d[0]);
        }
    }

    self.undo = function() {
        for (let i = self.deleted.length-1; i >= 0; i--) {
            let index = self.indicesOfDeleted[i];
            let d = self.deleted[i];
            self.splice(index, 0, d);
        }
    }

    self.serialized = function() {
        let serial = {
            type: Action.DeleteStep,
            idsToDelete: self.idsToDelete,
            id: self.id
        };
        return serial;
    }

    return self;
}


export{DeleteStep};