import type {
	IDataObject,
	IExecuteFunctions,
	IHttpRequestMethods,
	IHttpRequestOptions,
	ILoadOptionsFunctions,
	JsonObject,
} from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';

import type { Engine4Entity, Engine4Property, Engine4ReturnType } from './types';

type Engine4Context = IExecuteFunctions | ILoadOptionsFunctions;

async function engine4ApiRequest(
	this: Engine4Context,
	method: IHttpRequestMethods,
	endpoint: string,
	body?: IDataObject,
	qs?: IDataObject,
): Promise<unknown> {
	const credentials = await this.getCredentials('engine4Api');
	const baseUrl = (credentials.baseUrl as string).replace(/\/+$/, '');

	const options: IHttpRequestOptions = {
		method,
		url: `${baseUrl}/webapi/external${endpoint}`,
		json: true,
	};

	if (body !== undefined) {
		options.body = body;
	}
	if (qs !== undefined) {
		options.qs = qs;
	}

	try {
		return await this.helpers.httpRequestWithAuthentication.call(this, 'engine4Api', options);
	} catch (error) {
		throw new NodeApiError(this.getNode(), error as JsonObject);
	}
}

export async function getGenericEntities(this: Engine4Context): Promise<Engine4Entity[]> {
	const response = await engine4ApiRequest.call(this, 'GET', '/GetGenericEntities', undefined, {
		listAllEntities: false,
	});

	return (response as Engine4Entity[] | undefined) ?? [];
}

export async function getGenericProperties(
	this: Engine4Context,
	entityId: string,
): Promise<Engine4Property[]> {
	const response = await engine4ApiRequest.call(this, 'GET', '/GetGenericProperties', undefined, {
		entityId,
	});

	return (response as Engine4Property[] | undefined) ?? [];
}

export async function saveAll(
	this: Engine4Context,
	records: IDataObject[],
	returnType: Engine4ReturnType,
): Promise<IDataObject | IDataObject[] | undefined> {
	const response = await engine4ApiRequest.call(this, 'POST', '/saveAll', {
		items: records,
		returnType,
	});

	if (response === undefined || response === null || response === '') {
		return undefined;
	}

	return response as IDataObject | IDataObject[];
}
