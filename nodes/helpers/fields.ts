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

export function dataIdField(displayOptions: IDisplayOptions): INodeProperties {
	return {
		displayName: 'Data ID',
		name: 'dataId',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. 1bdc7f8a-67c8-4ead-be6a-016722a45c1c',
		description: 'DataId of the ENGINE4 record',
		displayOptions,
	};
}

export function viewField(displayOptions: IDisplayOptions): INodeProperties {
	return {
		displayName: 'View',
		name: 'view',
		type: 'resourceLocator',
		default: { mode: 'list', value: '' },
		required: true,
		description: 'ENGINE4 insert view whose fields should be used',
		displayOptions,
		typeOptions: {
			loadOptionsDependsOn: ['entity.value'],
		},
		modes: [
			{
				displayName: 'From List',
				name: 'list',
				type: 'list',
				typeOptions: {
					searchListMethod: 'searchInsertViews',
					searchable: true,
				},
			},
		],
	};
}

/**
 * Where the field mapping takes its fields from:
 * - entity: all columns of the entity (required fields are mandatory)
 * - view: only the fields of the selected view (needs viewField in the same action)
 * - entityUpdate: all columns of the entity, none mandatory
 */
type PropertySource = 'entity' | 'view' | 'entityUpdate';

const MAPPER_METHODS: Record<PropertySource, string> = {
	entity: 'getEntityFields',
	view: 'getViewFields',
	entityUpdate: 'getEntityFieldsForUpdate',
};

export function propertyField(
	displayOptions: IDisplayOptions,
	source: PropertySource = 'entity',
): INodeProperties {
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
			loadOptionsDependsOn: source === 'view' ? ['entity.value', 'view.value'] : ['entity.value'],
			resourceMapper: {
				resourceMapperMethod: MAPPER_METHODS[source],
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
