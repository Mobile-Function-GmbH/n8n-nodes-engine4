import type {
	IAuthenticateGeneric,
	ICredentialDataDecryptedObject,
	ICredentialTestRequest,
	ICredentialType,
	IHttpRequestHelper,
	Icon,
	INodeProperties,
} from 'n8n-workflow';

interface Engine4TokenResponse {
	access_token?: string;
	expires_in?: number;
	token_type?: string;
	refresh_token?: string;
	scope?: string;
	error?: string;
	error_description?: string;
}

export class Engine4Api implements ICredentialType {
	name = 'engine4Api';

	displayName = 'ENGINE4 API';

	documentationUrl = 'https://docs.engine4.io/api';

	icon: Icon = {
		light: 'file:../nodes/Engine4/engine4.svg',
		dark: 'file:../nodes/Engine4/engine4.dark.svg',
	};

	properties: INodeProperties[] = [
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'https://prod.engine4.io',
			placeholder: 'https://prod.engine4.io',
			description: 'URL of the ENGINE4 instance, without a trailing slash',
			required: true,
		},
		{
			displayName: 'Client ID',
			name: 'clientId',
			type: 'string',
			default: '',
			description: 'Client ID of the ENGINE4 instance',
			required: true,
		},
		{
			displayName: 'Username',
			name: 'username',
			type: 'string',
			default: '',
			placeholder: 'name@email.com',
			description: 'Email address of the ENGINE4 user',
			required: true,
		},
		{
			displayName: 'Password',
			name: 'password',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
		},
		{
			displayName: 'Access Token',
			name: 'accessToken',
			type: 'hidden',
			typeOptions: {
				expirable: true,
				password: true,
			},
			default: '',
		},
	];

	// Runs when access_token is empty or on 401 response
	async preAuthentication(this: IHttpRequestHelper, credentials: ICredentialDataDecryptedObject) {
		const baseUrl = (credentials.baseUrl as string).replace(/\/+$/, '');
		const response = (await this.helpers.httpRequest({
			method: 'POST',
			url: `${baseUrl}/token`,
			json: true,
			ignoreHttpStatusErrors: true,
			returnFullResponse: true,
			body: {
				client_id: credentials.clientId,
				grant_type: 'password',
				username: credentials.username,
				password: credentials.password,
				with_refresh_token: false,
			},
		})) as { statusCode: number; body: Engine4TokenResponse | undefined };

		const token = response.body;

		if (response.statusCode >= 400 || !token?.access_token) {
			const reason = token?.error_description ?? token?.error ?? `HTTP ${response.statusCode}`;
			throw new Error(`ENGINE4 login failed: ${reason}`);
		}

		return { accessToken: token.access_token };
	}

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.accessToken}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.baseUrl.replace(/\\/+$/, "")}}',
			url: '/webapi/external/GetGenericEntities',
			method: 'GET',
			qs: {
				listAllEntities: false,
			},
		},
	};
}
