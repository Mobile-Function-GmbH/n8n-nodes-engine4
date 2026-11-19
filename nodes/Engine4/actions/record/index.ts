import type { INodeProperties } from 'n8n-workflow';

import * as create from './create';
import * as createInView from './createInView';

export { create, createInView };

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
			{
				name: 'Create in View',
				value: 'createInView',
				description: 'Create a record using only the fields of an insert view',
				action: 'Create a record in a view',
			},
		],
		default: 'create',
	},
	...create.description,
	...createInView.description,
];
