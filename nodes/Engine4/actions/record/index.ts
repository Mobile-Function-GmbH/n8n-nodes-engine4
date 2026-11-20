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
				description: 'Creates a new record in ENGINE4',
				action: 'Create a record',
			},
			{
				name: 'Create in View',
				value: 'createInView',
				description: 'Creates a new ENGINE4 record using the fields of an insert view',
				action: 'Create a record in a view',
			},
		],
		default: 'create',
	},
	...create.description,
	...createInView.description,
];
