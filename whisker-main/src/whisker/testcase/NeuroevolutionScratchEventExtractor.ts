import {ScratchEventExtractor} from "./ScratchEventExtractor";
import VirtualMachine from "scratch-vm/src/virtual-machine";
import {ScratchEvent} from "./events/ScratchEvent";
import {DragSpriteEvent} from "./events/DragSpriteEvent";
import {DynamicScratchEventExtractor} from "./DynamicScratchEventExtractor";
import {StaticScratchEventExtractor} from "./StaticScratchEventExtractor";

export class NeuroevolutionScratchEventExtractor extends ScratchEventExtractor {

    constructor(vm: VirtualMachine) {
        super(vm);
    }

    /**
     * Used for extracting events during the execution of a Scratch program. We exclude DragSpriteEvents in
     * Neuroevolution algorithms.
     * @param vm the state of the Scratch-Project from which events will be extracted.
     */
    public extractEvents(vm:VirtualMachine): ScratchEvent[] {
        const scratchEvents = new DynamicScratchEventExtractor(vm).extractEvents(vm);
        return scratchEvents.filter((event) => !(event instanceof DragSpriteEvent));
    }

    /**
     * Used for extracting events when loading a network from a saved json file. We exclude DragSpriteEvents in
     * Neuroevolution algorithms.
     * @param vm the state of the Scratch-Project from which events will be extracted.
     */
    public extractStaticEvents(vm: VirtualMachine): ScratchEvent[]{
        const scratchEvents = new StaticScratchEventExtractor(vm).extractEvents(vm);
        return scratchEvents.filter((event) => !(event instanceof DragSpriteEvent));
    }
}
