import type {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
} from 'n8n-workflow';

import { saveAll } from '../../../helpers/api';
import type { Engine4ReturnType } from '../../types';
import {
	entityField,
	optionsCollection,
	recordFieldsMapper,
	returnTypeOption,
	showFor,
} from '../fields';

const displayOptions = showFor('record', ['create']);

// ----------------------------------
//         UI fields (shared definitions in ../fields.ts)
// ----------------------------------

export const description: INodeProperties[] = [
	entityField(displayOptions, 'The ENGINE4 entity to create the record in'),
	recordFieldsMapper(displayOptions),
	optionsCollection(displayOptions, [returnTypeOption]),
];

// ----------------------------------
//         Logic (one input item)
// ----------------------------------

export async function execute(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData[]> {
	const entityId = this.getNodeParameter('entity', itemIndex, '', {
		extractValue: true,
	}) as string;
	const mappingMode = this.getNodeParameter('fields.mappingMode', itemIndex) as string;
	const options = this.getNodeParameter('options', itemIndex, {}) as {
		returnType?: Engine4ReturnType;
	};
	const returnType: Engine4ReturnType = options.returnType ?? 'full';

	// "Map automatically" uses the input item as-is, otherwise the fields defined in the node
	const values =
		mappingMode === 'autoMapInputData'
			? this.getInputData()[itemIndex].json
			: ((this.getNodeParameter('fields.value', itemIndex, {}) as IDataObject | null) ?? {});

	// Leave out empty fields, ENGINE4 keeps its defaults for them
	const record: IDataObject = { EntityId: entityId };
	for (const [key, value] of Object.entries(values)) {
		if (value !== undefined && value !== null && value !== '') record[key] = value;
	}

	const response = await saveAll.call(this, [record], returnType);

	// returnType "none" answers without a body
	if (response === undefined) {
		return [{ json: { success: true }, pairedItem: { item: itemIndex } }];
	}

	const records = Array.isArray(response) ? response : [response];
	return records.map((json) => ({ json, pairedItem: { item: itemIndex } }));
}
