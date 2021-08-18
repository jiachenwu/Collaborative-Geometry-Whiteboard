import { MakePoint } from './makepoint.js';
import { MakeLine } from './makeline.js';
import { MakeCircle } from './makecircle.js';

//TODO: Make inputStepIndices into inputStepIds. Get steps by searching, instead of indexing.

var Step = function(params)
{
    let self = {
        id: Math.random(),
        construction: params.construction,
        type: params.type,
        isInput: false,
        //inputStepIndices: [],  //TODO: Can't simply be indices. But instead needs to be a path, referencing unique IDs
        inputStepIds: [],
        output: null,
        color: '#000000',
        thickness: 2,
        isPublic: false,
        outputName: ''
    };

    if (params.color) self.color=params.color;
    if (params.thickness) self.thickness=params.thickness;

    self.serialized = function() {
        let s = {
            id: self.id,
            type: self.type,
            isInput: self.isInput,
            inputStepIds: self.inputStepIds.slice(),
            color: self.color,
            thickness: self.thickness,
            isPublic: self.isPublic,
            outputName: self.outputName
        };
        return s;
    }

    self.getStepNumber = function() {
        if (self.construction) {
            for (let i = 0; i < self.construction.steps.length; i++) {
                if (self.construction.steps[i] === self) return i;
            }
        }
        return -1;
    }

    // Has:
    // - Input array
    // - Output object
    // - Output name, so other constructions may refer to a particular step output
    // - Style (color and thickness/size)
    // - Whether the step is an output of the construction (like a public variable)
    // - Render function

    return self;
}
Step.MakePoint = 1;
Step.MakeLine = 2;
Step.MakeCircle = 3;
Step.Intersect = 4;
Step.MakeConstruction = 5;

Step.deserialize = function(serial) {
    let step = null;
    if (serial.type === Step.MakePoint) step = MakePoint(serial);
    else if (serial.type === Step.MakeLine) step = MakeLine(serial);
    else if (serial.type === Step.MakeCircle) step = MakeCircle(serial); 
    step.id = serial.id;
    step.inputStepIds = serial.inputStepIds;
    step.isInput = serial.isInput;
    step.color = serial.color;
    step.thickness = serial.thickness;
    step.isPublic = serial.isPublic;
    step.outputName = serial.outputName;
    return step;
}

export{Step};