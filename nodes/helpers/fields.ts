/**
 * Reusable UI fields (node properties) for actions.
 * showFor() creates displayOptions for the field from the action its used in
 * needs to be defined since n8n lists all available fields
 */
import type { IDisplayOptions, INodeProperties } from 'n8n-workflow';

export function showFor(resource: string, operations: string[]): IDisplayOptions {
	return {
		show: {
			resource: [resource],
			operation: operations,
		},
	};
}

export function entityField(displayOptions: IDisplayOptions): INodeProperties {
	return {
		displayName: 'Entity',
		name: 'entity',
		type: 'resourceLocator',
		default: { mode: 'list', value: '' },
		required: true,
		description: 'ENGINE4 entity that should be used',
		displayOptions,
		modes: [
			{
				displayName: 'From List',
				name: 'list',
				type: 'list',
				typeOptions: {
					searchListMethod: 'searchEntities',
					searchable: true,
				},
			},
		],
	};
}

export function propertyField(displayOptions: IDisplayOptions): INodeProperties {
	return {
		displayName: 'Fields',
		name: 'fields',
		type: 'resourceMapper',
		default: {
			mappingMode: 'defineBelow',
			value: null,
		},
		noDataExpression: true,
		required: true,
		typeOptions: {
			loadOptionsDependsOn: ['entity.value'],
			resourceMapper: {
				resourceMapperMethod: 'getEntityFields',
				mode: 'add',
				fieldWords: {
					singular: 'field',
					plural: 'fields',
				},
				addAllFields: false,
				supportAutoMap: true,
				multiKeyMatch: false,
			},
		},
		displayOptions,
	};
}

export function optionsCollection(
	displayOptions: IDisplayOptions,
	options: INodeProperties[],
): INodeProperties {
	return {
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add option',
		default: {},
		displayOptions,
		options,
	};
}

export const returnTypeOption: INodeProperties = {
	displayName: 'Return Type',
	name: 'returnType',
	type: 'options',
	options: [
		{
			name: 'Full Record',
			value: 'full',
			description: 'Return the complete saved record',
		},
		{
			name: 'IDs Only',
			value: 'dataId',
			description: 'Return only the DataId and EntityId of the saved record',
		},
		{
			name: 'Nothing',
			value: 'none',
			description: 'Return no data, only a success flag',
		},
	],
	default: 'full',
	description: 'What ENGINE4 returns after saving',
};
