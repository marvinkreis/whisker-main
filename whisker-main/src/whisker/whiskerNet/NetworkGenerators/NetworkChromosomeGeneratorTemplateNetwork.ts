import {List} from "../../utils/List";
import {NodeGene} from "../NetworkNodes/NodeGene";
import {ConnectionGene} from "../ConnectionGene";
import {NetworkChromosomeGenerator} from "./NetworkChromosomeGenerator";
import {NetworkChromosome} from "../NetworkChromosome";
import {InputNode} from "../NetworkNodes/InputNode";
import {ClassificationNode} from "../NetworkNodes/ClassificationNode";
import {RegressionNode} from "../NetworkNodes/RegressionNode";
import {ScratchEvent} from "../../testcase/events/ScratchEvent";
import {HiddenNode} from "../NetworkNodes/HiddenNode";
import {BiasNode} from "../NetworkNodes/BiasNode";
import {ActivationFunction} from "../NetworkNodes/ActivationFunction";

export class NetworkChromosomeGeneratorTemplateNetwork extends NetworkChromosomeGenerator {

    /**
     * The template of the existing Network
     */
    private readonly _networkTemplate: Record<string, (number | string | Record<string, (number | string)>)>

    /**
     * All Scratch-Events the given Scratch project handles.
     */
    private readonly _scratchEvents: List<ScratchEvent>;

    private readonly _numberNetworks: number;

    /**
     * Constructs a new NetworkGenerator which generates copies of an existing network.
     * @param networkTemplate the template of the existing network from which we want to create a population of.
     * @param mutationConfig the configuration parameters for the mutation operator.
     * @param crossoverConfig the configuration parameters for the crossover operator.
     * @param scratchEvents all Scratch-Events found in the project.
     */
    constructor(mutationConfig: Record<string, (string | number)>, crossoverConfig: Record<string, (string | number)>,
                networkTemplate: string,
                scratchEvents: List<ScratchEvent>) {
        super(mutationConfig, crossoverConfig);
        this._networkTemplate = JSON.parse(networkTemplate);
        this._numberNetworks = Object.keys(this._networkTemplate).length;
        this._scratchEvents = scratchEvents;
    }

    /**
     * Creates and returns a random NetworkChromosome with the specified number of input and output nodes
     * and a random set of connections in between them.
     * @return: generated NetworkChromosome
     */
    get(): NetworkChromosome {
        const networkKey = Object.keys(this._networkTemplate)[NetworkChromosome.idCounter % this._numberNetworks];
        const networkTemplate = this._networkTemplate[networkKey];
        const allNodes = new List<NodeGene>();
        for (const nodeKey in networkTemplate['Nodes']) {
            const node = networkTemplate['Nodes'][nodeKey];
            switch (node.type) {
                case "INPUT":
                    allNodes.add(new InputNode(node.id, node.sprite, node.feature));
                    break;
                case "BIAS":
                    allNodes.add(new BiasNode(node.id));
                    break;
                case "HIDDEN":
                    allNodes.add(new HiddenNode(node.id, ActivationFunction.SIGMOID));
                    break;
                case "CLASSIFICATION": {
                    const event = this._scratchEvents.find(event => event.stringIdentifier() === node.event);
                    if(event) {
                        allNodes.add(new ClassificationNode(node.id, event, ActivationFunction.SIGMOID));
                    }
                    break;
                }
                case "REGRESSION": {
                    const event = this._scratchEvents.find(event => event.stringIdentifier() === node.event);
                    if(event) {
                        allNodes.add(new RegressionNode(node.id, event, node.eventParameter, ActivationFunction.NONE));
                    }
                    break;
                }
            }
        }
        const allConnections = new List<ConnectionGene>();
        for (const connectionKey in networkTemplate['Connections']) {
            const connection = networkTemplate['Connections'][connectionKey];
            const sourceNode = allNodes.find(node => node.id === connection.Source);
            const targetNode = allNodes.find(node => node.id === connection.Target);
            const recurrent = connection.Recurrent === `true`;
            if(sourceNode && targetNode) {
                allConnections.add(new ConnectionGene(sourceNode, targetNode, connection.Weight, connection.Enabled,
                    connection.Innovation, recurrent));
            }
        }
        const network = new NetworkChromosome(allConnections, allNodes, this._mutationOp, this._crossoverOp);

        // Only copy the first network. No need to have multiple copies of the same chromosome.
        if(network.id > this._numberNetworks){
            network.mutate();
        }
        NetworkChromosome.idCounter++;
        return network
    }

    /**
     * Creates connections between input and output nodes. Function not required since connections are already defined
     * through template network.
     * @return undefined since connections are defined through template
     */
    createConnections(): List<ConnectionGene> {
        return undefined;
    }
}
