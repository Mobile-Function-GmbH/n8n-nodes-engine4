/**
 * Resource "Record": the Operation dropdown and all record actions.
 * To add an action: create its file next to create.ts, add it to the
 * Operation options, the description array and the export below.
 */
import type { INodeProperties } from 'n8n-workflow';

import * as create from './create';

export { create };

export const description: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['record'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a record',
				action: 'Create a record',
			},
		],
		default: 'create',
	},
	...create.description,
];
