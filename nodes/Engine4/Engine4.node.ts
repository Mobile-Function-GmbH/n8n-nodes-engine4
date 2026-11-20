import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	JsonObject,
} from 'n8n-workflow';
import { NodeApiError, NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';

import * as record from './actions/record';
import {
	getEntityFields,
	getEntityFieldsForUpdate,
	getViewFields,
	searchEntities,
	getInsertViews,
} from '../helpers/functions';

export class Engine4 implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'ENGINE4',
		name: 'engine4',
		icon: { light: 'file:engine4.svg', dark: 'file:engine4.dark.svg' },
		group: ['output'],
		version: [1],
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Create and update records in your ENGINE4 entities and views',
		defaults: {
			name: 'ENGINE4',
		},
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		usableAsTool: true,
		credentials: [
			{
				name: 'engine4Api',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Record',
						value: 'record',
					},
				],
				default: 'record',
			},
			...record.description,
		],
	};

	methods = {
		listSearch: {
			searchEntities,
			searchInsertViews: getInsertViews,
		},
		resourceMapping: {
			getEntityFields,
			getEntityFieldsForUpdate,
			getViewFields,
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const resource = this.getNodeParameter('resource', i) as string;
				const operation = this.getNodeParameter('operation', i) as string;

				//selects action
				switch (`${resource}:${operation}`) {
					case 'record:create':
						returnData.push(...(await record.create.execute.call(this, i)));
						break;

					case 'record:createInView':
						returnData.push(...(await record.createInView.execute.call(this, i)));
						break;

					case 'record:update':
						returnData.push(...(await record.update.execute.call(this, i)));
						break;

					default:
						throw new NodeOperationError(
							this.getNode(),
							`The operation "${operation}" for resource "${resource}" is not supported`,
							{ itemIndex: i },
						);
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: { error: (error as Error).message },
						pairedItem: { item: i },
					});
					continue;
				}

				if (error instanceof NodeOperationError) {
					throw new NodeOperationError(this.getNode(), error, { itemIndex: i });
				}

				throw new NodeApiError(this.getNode(), error as JsonObject, { itemIndex: i });
			}
		}

		return [returnData];
	}
}
