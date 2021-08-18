import {Step} from './step.js'
import { MakePoint } from './makepoint.js';
import { Point } from '../geom/point.js';
import { Vector } from '../geom/vector.js';
import { AddStep } from '../action/addstep.js';

var Construction = function()
{
    let self = {
        steps: [],
        editor: null
    };

    self.serialized = function() {
        let steps = [];
        for (let step of self.steps) {
            steps.push(step.serialized());
        }
        return {steps:steps};
    }

    // self.addStep = function(step) {
    //     step.construction = self;
    //     self.steps.push(step);
    // }

    // self.removeStep = function(stepToRemove) {
    //     let i = stepToRemove.getStepNumber();
    //     if (i !== -1) {
    //         let invalidatedSteps = [];
    //         for (let j = i+1; j < self.steps.length; j++) {
    //             let step = self.steps[j];
    //             for (let kIndex = 0; kIndex < step.inputStepIndices.length; kIndex++) {
    //                 let k = step.inputStepIndices[kIndex];
    //                 if (k === i) { invalidatedSteps.push(step); step.inputStepIndices=[]; }  // Mark steps that depended on the step that was just removed. These must also be removed.
    //                 else if (k > i) { step.inputStepIndices[kIndex]--; }  // Some step indices were shifted back one, so update references to these.
    //             }
    //         }
    //         self.steps.splice(i,1);  // Delete step i
    //         for (let step of invalidatedSteps) {
    //             self.removeStep(step);  // Remove steps that depended on the step that was just removed.
    //         }
    //         stepToRemove.construction = null;
    //     }
    // }

    self.getIdsToRemove = function(stepToRemove) {
        let ids = [];
        let i = stepToRemove.getStepNumber();
        if (i !== -1) {
            let invalidatedSteps = [];
            for (let j = i+1; j < self.steps.length; j++) {
                let step = self.steps[j];
                for (let k = 0; k < step.inputStepIds.length; k++) {
                    let id = step.inputStepIds[k];
                    if (id === stepToRemove.id) { invalidatedSteps.push(step); }  // If step depends on stepToRemove.
                }
            }
            for (let step of invalidatedSteps) {
                let otherIds = self.getIdsToRemove(step);  // List of ids should be ordered so invalidated stuff is first.
                for (let id of otherIds) {
                    if (!ids.includes(id)) ids.push(id);
                }
            }
            ids.push(stepToRemove.id);
        }
        return ids;
    }

    self.getStepNumberFromId = function(id) {
        for (let i = 0; i < self.steps.length; i++) {
            let step = self.steps[i];
            if (step.id === id) return i;
        }
        return -1;
    }

    self.getStepFromId = function(id) {
        for (let i = 0; i < self.steps.length; i++) {
            let step = self.steps[i];
            if (step.id === id) return step;
        }
        return null;
    }

    self.pickNearestMakePoint = function(nearPoint, maxDist) {
        let nearest = null;
        let nearestDist = maxDist;
        if (!nearestDist) nearestDist = Infinity;
        for (let step of self.steps) {
            if (step.type !== Step.MakePoint) continue;
            let dist = step.distanceToPoint(nearPoint);
            if (dist < nearestDist) {
                nearestDist = dist;
                nearest = step;
            }
        }
        return nearest;
    }

    self.pickNearestMakeLineOrCircle = function(nearPoint, maxDist) {
        let nearest = null;
        let nearestDist = maxDist;
        if (!nearestDist) nearestDist = Infinity;
        for (let step of self.steps) {
            if (step.type !== Step.MakeLine && step.type !== Step.MakeCircle) continue;
            let dist = step.distanceToPoint(nearPoint);
            if (dist < nearestDist) {
                nearestDist = dist;
                nearest = step;
            }
        }
        return nearest;
    }

    self.pickStep = function(nearPoint, maxDist) {
        let nearestPoint = self.pickNearestMakePoint(nearPoint, maxDist);
        if (nearestPoint) return nearestPoint;

        let nearestLineOrCircle = self.pickNearestMakeLineOrCircle(nearPoint, maxDist);
        return nearestLineOrCircle;
    }

    self.makeMakeIntersect = function(nearPoint, maxDist) {
        let nearest = null;
        let nearestDist = maxDist;
        if (!nearestDist) nearestDist = Infinity;
        for (let i=0; i<self.steps.length; i++) {
            let A = self.steps[i];
            if (A.type !== Step.MakeLine && A.type !== Step.MakeCircle) continue;
            for (let j=i+1; j<self.steps.length; j++) {
                let B = self.steps[j];
                if (B.type !== Step.MakeLine && B.type !== Step.MakeCircle) continue;
                let make0 = MakePoint({constraintType:MakePoint.OnIntersect, inputStepIds:[A.id,B.id], choice:0});
                let make1 = MakePoint({constraintType:MakePoint.OnIntersect, inputStepIds:[A.id,B.id], choice:1});
                make0.construction = self;
                make1.construction = self;
                make0.updateOutput();
                make1.updateOutput();
                if (make0.output) {
                    let dist = Point.dist(nearPoint, make0.output);
                    if (dist < nearestDist) {
                        nearestDist = dist;
                        nearest = make0;
                    }
                }
                if (make1.output) {
                    let dist = Point.dist(nearPoint, make1.output);
                    if (dist < nearestDist) {
                        nearestDist = dist;
                        nearest = make1;
                    }
                }
                make0.construction = null;
                make1.construction = null;
            }
        }
        return nearest;
    }

    self.makeMakePointOnLineOrCircle = function(nearPoint, maxDist) {
        let nearest = null;
        let nearestDist = maxDist;
        if (!nearestDist) nearestDist = Infinity;
        for (let i=0; i<self.steps.length; i++) {
            let A = self.steps[i];
            if (A.type !== Step.MakeLine && A.type !== Step.MakeCircle) continue;
            if (!A.output) continue;
            let pt = A.output.nearestPointTo(nearPoint);
            if (pt) {
                let dist = Point.dist(nearPoint, pt);
                if (dist < nearestDist) {
                    nearestDist = dist;
                    if (A.type === Step.MakeLine) {
                        let disp = A.output.displacement();
                        let t = Vector.dot(disp, Point.disp(A.output.a,pt)) / disp.magSq();
                        nearest = MakePoint({constraintType:MakePoint.OnLine, inputStepIds:[A.id], t:t});
                    }
                    else if (A.type === Step.MakeCircle) {
                        let angle = Vector.angle(Vector({x:0,y:1}), Point.disp(A.output.center,pt));
                        nearest = MakePoint({constraintType:MakePoint.OnCircle, inputStepIds:[A.id], angle:angle});
                    }
                    nearest.construction = self;
                    nearest.updateOutput();  // Make sure there is an output point, so it can be drawn, if picked.
                    nearest.construction = null;
                }
            }
        }
        return nearest;
    }

    self.pickOrMakeMakePoint = function(nearPoint, maxDist) {
        let nearestExisting = self.pickNearestMakePoint(nearPoint, maxDist);
        if (nearestExisting) return nearestExisting;

        let nearestIntersect = self.makeMakeIntersect(nearPoint, maxDist);
        if (nearestIntersect) return nearestIntersect;

        let nearestLineOrCircle = self.makeMakePointOnLineOrCircle(nearPoint, maxDist);
        if (nearestLineOrCircle) return nearestLineOrCircle;

        let free = MakePoint({x:nearPoint.x, y:nearPoint.y});
        free.construction = self;
        free.updateOutput();
        free.construction = null;
        return free;
    }

    self.execute = function() {
        for (let step of self.steps) {
            step.updateOutput();
        }
    }

    return self;
}

Construction.deserialize = function(serial) {
    let construction = Construction();
    for (let stepSerial of serial.steps) {
        // construction.actions.add(AddStep({
        //     manager: construction.actions,
        //     step: Step.deserialize(step)
        // }), true);
        let step = Step.deserialize(stepSerial);
        step.construction = construction;
        construction.steps.push(step);
    }
    //construction.actions.clear();
    return construction;
}


export{Construction};