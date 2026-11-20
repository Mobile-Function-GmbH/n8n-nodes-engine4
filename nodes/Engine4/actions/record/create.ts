import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';

import {
	entityField,
	optionsCollection,
	propertyField,
	returnTypeOption,
	showFor,
} from '../../../helpers/fields';
import { saveRecordFromParameters } from '../../../helpers/records';

const displayOptions = showFor('record', ['create']);

export const description: INodeProperties[] = [
	entityField(displayOptions),
	propertyField(displayOptions),
	optionsCollection(displayOptions, [returnTypeOption]),
];

export async function execute(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData[]> {
	return await saveRecordFromParameters.call(this, itemIndex);
}
