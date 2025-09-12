import {
    NodeConnectionType,
    IExecuteFunctions,
    INodeExecutionData,
    INodeType,
    INodeTypeDescription,
    IDataObject,
} from 'n8n-workflow';

export class VerificarEmail implements INodeType {
    description: INodeTypeDescription = {
        displayName: 'Verificar Email',
        name: 'verificarEmail',
        icon: 'file:email.svg',
        group: ['transform'],
        version: 1,
        subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
        description: 'Verificar la validez de un correo electrónico usando emailable.com',
        defaults: {
            name: 'Verificar Email',
        },
        inputs: [NodeConnectionType.Main],
        outputs: [NodeConnectionType.Main],
        credentials: [
            {
                name: 'verificarEmailApi',
                required: true,
            },
        ],
        properties: [
            {
                displayName: 'Dirección De Email',
                name: 'email',
                type: 'string',
                placeholder: 'test@domain.com',
                default: '',
            },
            // Operations will go here

        ]
    };

    // The execute method will go here
    async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
        const items = this.getInputData();
        const returnData: Array<{ json: IDataObject }> = [];

        for (let i = 0; i < items.length; i++) {
            const email = this.getNodeParameter('email', i) as string;
            const credentials = await this.getCredentials('verificarEmailApi');
            const apiKey = credentials?.apiKey as string;

            const response = await this.helpers.httpRequest({
                method: 'GET',
                url: 'https://api.emailable.com/v1/verify',
                qs: {
                    email: email,
                    api_key: apiKey
                },
                headers: {
                    Accept: 'application/json',
                },
                json: true,
            });

            const results = Array.isArray(response) ? response : [response];

            for (const result of results) {
                returnData.push({
                    json: {
                        email: result.email,
                        deliverable: result.state === 'deliverable',
                        score: result.score,
                    }
                });
            }
        }
        return this.prepareOutputData(returnData);
    }
}