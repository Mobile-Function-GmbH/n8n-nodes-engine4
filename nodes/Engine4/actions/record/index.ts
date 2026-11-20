import type { INodeProperties } from 'n8n-workflow';

import * as create from './create';
import * as createInView from './createInView';
import * as getMany from './getMany';
import * as update from './update';

export { create, createInView, getMany, update };

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
			{
				name: 'Get Many',
				value: 'getMany',
				description: 'Finds ENGINE4 records by filters and sorting',
				action: 'Get many records',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Updates fields of an existing ENGINE4 record',
				action: 'Update a record',
			},
		],
		default: 'create',
	},
	...create.description,
	...createInView.description,
	...getMany.description,
	...update.description,
];
