import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';

import {
	dataIdField,
	entityField,
	optionsCollection,
	propertyField,
	returnTypeOption,
	showFor,
} from '../../../helpers/fields';
import { saveRecordFromParameters } from '../../../helpers/records';

const displayOptions = showFor('record', ['update']);

export const description: INodeProperties[] = [
	entityField(displayOptions),
	dataIdField(displayOptions),
	propertyField(displayOptions, 'entityUpdate'),
	optionsCollection(displayOptions, [returnTypeOption]),
];

export async function execute(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData[]> {
	return await saveRecordFromParameters.call(this, itemIndex, { withDataId: true });
}
