import nock from 'nock';
import { authUrl, heimdallUrl } from '../../src/lib/constants';
import {
  EmptyObjectLiteral,
  Identity,
  InitializationData,
  KratosFormParams,
  SuccessfulRegistrationData,
} from '../../src/lib/kratos';

export const registrationFlowMockData: InitializationData = {
  id: '1d225d8c-829b-4016-ae04-69b96126efdd',
  type: 'browser',
  expires_at: '2022-07-31T11:29:43.777669965Z',
  issued_at: '2022-07-31T11:19:43.777669965Z',
  request_url: `${authUrl}/self-service/login/browser`,
  ui: {
    action: `${authUrl}/self-service/login?flow=1d225d8c-829b-4016-ae04-69b96126efdd`,
    method: 'POST',
    nodes: [
      {
        type: 'input',
        group: 'default',
        attributes: {
          name: 'csrf_token',
          type: 'hidden',
          value:
            'u1Fk0cvGZr9yUFABSyLmG7kF62h6S6B8MfXpLJdwB1PtaH5J+wTAvdL7pOdlOhGYa/gTyUawNAMi9s0GftjCHw==',
          required: true,
          disabled: false,
          node_type: 'input',
        },
        messages: [],
        meta: {},
      },
      {
        type: 'input',
        group: 'default',
        attributes: {
          name: 'identifier',
          type: 'text',
          value: '',
          required: true,
          disabled: false,
          node_type: 'input',
        },
        messages: [],
        meta: { label: { id: 1070004, text: 'ID', type: 'info' } },
      },
      {
        type: 'input',
        group: 'password',
        attributes: {
          name: 'password',
          type: 'password',
          required: true,
          disabled: false,
          node_type: 'input',
        },
        messages: [],
        meta: { label: { id: 1070001, text: 'Password', type: 'info' } },
      },
      {
        type: 'input',
        group: 'password',
        attributes: {
          name: 'method',
          type: 'submit',
          value: 'password',
          disabled: false,
          node_type: 'input',
        },
        messages: [],
        meta: {
          label: { id: 1010001, text: 'Sign in', type: 'info', context: {} },
        },
      },
    ],
  },
  created_at: '2022-07-31T11:19:43.787514Z',
  updated_at: '2022-07-31T11:19:43.787514Z',
  refresh: false,
  requested_aal: 'aal1',
};

export const errorRegistrationMockData: Partial<InitializationData> = {
  id: '36c396aa-0e1e-4d04-b009-1bb1b6480aa4',
  type: 'browser',
  expires_at: '2022-07-31T15:20:02.759254Z',
  issued_at: '2022-07-31T15:10:02.759254Z',
  request_url: `${authUrl}/self-service/registration/browser`,
  ui: {
    action: `${authUrl}/self-service/registration?flow=36c396aa-0e1e-4d04-b009-1bb1b6480aa4`,
    method: 'POST',
    nodes: [
      {
        type: 'input',
        group: 'default',
        attributes: {
          name: 'csrf_token',
          type: 'hidden',
          value:
            'ya2mcCh6Q20AwiJHY++B1YM+TKgJkeMceE1Y0nRU2kA6lF2Vz/6VKIcxNcV/4wqFWcWHZn8hYvdBixDSf1AwTA==',
          required: true,
          disabled: false,
          node_type: 'input',
        },
        messages: [],
        meta: {},
      },
      {
        type: 'input',
        group: 'password',
        attributes: {
          name: 'traits.email',
          type: 'email',
          value: 'sshanzelz@gmail.com',
          required: true,
          disabled: false,
          node_type: 'input',
        },
        messages: [],
        meta: { label: { id: 1070002, text: 'E-Mail', type: 'info' } },
      },
      {
        type: 'input',
        group: 'password',
        attributes: {
          name: 'password',
          type: 'password',
          required: true,
          disabled: false,
          node_type: 'input',
        },
        messages: [],
        meta: { label: { id: 1070001, text: 'Password', type: 'info' } },
      },
      {
        type: 'input',
        group: 'password',
        attributes: {
          name: 'traits.name',
          type: 'text',
          value: 'asdad',
          required: true,
          disabled: false,
          node_type: 'input',
        },
        messages: [
          {
            id: 4000005,
            text: 'The password can not be used because password length must be at least 8 characters but only got 3.',
            type: 'error',
            context: {
              reason:
                'password length must be at least 8 characters but only got 3',
            },
          },
        ],
        meta: { label: { id: 1070002, text: 'Full name', type: 'info' } },
      },
      {
        type: 'input',
        group: 'password',
        attributes: {
          name: 'traits.username',
          type: 'text',
          disabled: false,
          node_type: 'input',
        },
        messages: [],
        meta: { label: { id: 1070002, text: 'Username', type: 'info' } },
      },
      {
        type: 'input',
        group: 'password',
        attributes: {
          name: 'method',
          type: 'submit',
          value: 'password',
          disabled: false,
          node_type: 'input',
        },
        messages: [],
        meta: {
          label: { id: 1040001, text: 'Sign up', type: 'info', context: {} },
        },
      },
    ],
  },
};

export const successfulRegistrationMockData: SuccessfulRegistrationData = {
  session: {
    id: 'f25ecae3-073f-467c-a3cf-2eebcddb9b66',
    active: true,
    expires_at: new Date('2022-08-01T11:55:35.119392211Z'),
    authenticated_at: new Date('2022-07-31T11:55:35.147947002Z'),
    authenticator_assurance_level: 'aal1',
    authentication_methods: [
      {
        method: 'password',
        aal: 'aal1',
        completed_at: new Date('2022-07-31T11:55:35.119473169Z'),
      },
    ],
    issued_at: new Date('2022-07-31T11:55:35.119392211Z'),
    identity: {
      id: '44cf5b24-48c6-4f85-86ca-35bd4a06b5a9',
      schema_id: 'default',
      schema_url: `${authUrl}/schemas/ZGVmYXVsdA`,
      state: 'active',
      state_changed_at: '2022-07-31T11:55:35.07680546Z',
      traits: {
        email: 'leeeee@daily.dev',
        name: 'Lee Solevilla',
        image: '',
        username: '',
      },
      verifiable_addresses: [
        {
          id: '55ae2268-050d-4427-bea1-b4cd12b09829',
          value: 'leeeee@daily.dev',
          verified: false,
          via: 'email',
          status: 'sent',
          created_at: '2022-07-31T11:55:35.088234Z',
          updated_at: '2022-07-31T11:55:35.088234Z',
        },
      ],
      recovery_addresses: [
        {
          id: 'aa978ac6-578b-41de-9bf6-b2d3b048feda',
          value: 'leeeee@daily.dev',
          via: 'email',
          created_at: '2022-07-31T11:55:35.09292Z',
          updated_at: '2022-07-31T11:55:35.09292Z',
        },
      ],
      metadata_public: null,
      created_at: '2022-07-31T11:55:35.083416Z',
      updated_at: '2022-07-31T11:55:35.083416Z',
    },
  },
  identity: {
    id: '44cf5b24-48c6-4f85-86ca-35bd4a06b5a9',
    schema_id: 'default',
    schema_url: `${authUrl}/schemas/ZGVmYXVsdA`,
    state: 'active',
    state_changed_at: '2022-07-31T11:55:35.07680546Z',
    traits: {
      email: 'leeeee@daily.dev',
      name: 'Lee Solevilla',
      image: '',
      username: '',
    },
    verifiable_addresses: [
      {
        id: '55ae2268-050d-4427-bea1-b4cd12b09829',
        value: 'leeeee@daily.dev',
        verified: false,
        via: 'email',
        status: 'sent',
        created_at: '2022-07-31T11:55:35.088234Z',
        updated_at: '2022-07-31T11:55:35.088234Z',
      },
    ],
    recovery_addresses: [
      {
        id: 'aa978ac6-578b-41de-9bf6-b2d3b048feda',
        value: 'leeeee@daily.dev',
        via: 'email',
        created_at: '2022-07-31T11:55:35.09292Z',
        updated_at: '2022-07-31T11:55:35.09292Z',
      },
    ],
    metadata_public: null,
    created_at: '2022-07-31T11:55:35.083416Z',
    updated_at: '2022-07-31T11:55:35.083416Z',
  },
};

export const passwordLoginFlowMockData: InitializationData = {
  id: '5ce81e66-2c88-42a8-8a88-8371b33d4ce1',
  type: 'browser',
  expires_at: '2022-07-31T16:04:48.357133794Z',
  issued_at: '2022-07-31T15:54:48.357133794Z',
  request_url: `${authUrl}/self-service/login/browser`,
  ui: {
    action: `${authUrl}/self-service/login?flow=5ce81e66-2c88-42a8-8a88-8371b33d4ce1`,
    method: 'POST',
    nodes: [
      {
        type: 'input',
        group: 'default',
        attributes: {
          name: 'csrf_token',
          type: 'hidden',
          value:
            'iquS4bf2O0X87pfs3D21YRE24y5t4dib0qmc7sUJ7095kmkEUHLtAHsdgG7AMT4xy80o4BtRWXDrb9Tuzg0FQw==',
          required: true,
          disabled: false,
          node_type: 'input',
        },
        messages: [],
        meta: {},
      },
      {
        type: 'input',
        group: 'default',
        attributes: {
          name: 'identifier',
          type: 'text',
          value: '',
          required: true,
          disabled: false,
          node_type: 'input',
        },
        messages: [],
        meta: { label: { id: 1070004, text: 'ID', type: 'info' } },
      },
      {
        type: 'input',
        group: 'password',
        attributes: {
          name: 'password',
          type: 'password',
          required: true,
          disabled: false,
          node_type: 'input',
        },
        messages: [],
        meta: { label: { id: 1070001, text: 'Password', type: 'info' } },
      },
      {
        type: 'input',
        group: 'password',
        attributes: {
          name: 'method',
          type: 'submit',
          value: 'password',
          disabled: false,
          node_type: 'input',
        },
        messages: [],
        meta: {
          label: { id: 1010001, text: 'Sign in', type: 'info', context: {} },
        },
      },
    ],
  },
  created_at: '2022-07-31T15:54:48.369835Z',
  updated_at: '2022-07-31T15:54:48.369835Z',
  refresh: false,
  requested_aal: 'aal1',
};

export const passwordRecoveryFlowMockData = {
  id: '2d8868b9-c720-4379-92ee-b74fcd11a471',
  type: 'browser',
  expires_at: '2022-08-01T06:49:16.558677293Z',
  issued_at: '2022-08-01T05:49:16.558677293Z',
  request_url: `${authUrl}/self-service/recovery/browser`,
  ui: {
    action: `${authUrl}/self-service/recovery?flow=2d8868b9-c720-4379-92ee-b74fcd11a471`,
    method: 'POST',
    nodes: [
      {
        type: 'input',
        group: 'default',
        attributes: {
          name: 'csrf_token',
          type: 'hidden',
          value:
            'fq6ydeV+y18hHNr4tlUz3p66Xa9Hj4VCbn/8NZSh2TuNl0mQAvodGqbvzXqqWbiOREGWYTE/BKlXubQ1n6UzNw==',
          required: true,
          disabled: false,
          node_type: 'input',
        },
        messages: [],
        meta: {},
      },
      {
        type: 'input',
        group: 'link',
        attributes: {
          name: 'email',
          type: 'email',
          required: true,
          disabled: false,
          node_type: 'input',
        },
        messages: [],
        meta: { label: { id: 1070007, text: 'Email', type: 'info' } },
      },
      {
        type: 'input',
        group: 'link',
        attributes: {
          name: 'method',
          type: 'submit',
          value: 'link',
          disabled: false,
          node_type: 'input',
        },
        messages: [],
        meta: { label: { id: 1070005, text: 'Submit', type: 'info' } },
      },
    ],
  },
  state: 'choose_method',
};

export const emailSentRecoveryMockData = {
  id: '2d8868b9-c720-4379-92ee-b74fcd11a471',
  type: 'browser',
  expires_at: '2022-08-01T06:49:16.558677Z',
  issued_at: '2022-08-01T05:49:16.558677Z',
  request_url: `${authUrl}/self-service/recovery/browser`,
  active: 'link',
  ui: {
    action: `${authUrl}/self-service/recovery?flow=2d8868b9-c720-4379-92ee-b74fcd11a471`,
    method: 'POST',
    nodes: [
      {
        type: 'input',
        group: 'default',
        attributes: {
          name: 'csrf_token',
          type: 'hidden',
          value:
            'DNNUE6/TR7m2jdFiyeCHUo3sm2yLSLHOJ6pznz0SlRv/6q/2SFeR/DF+xuDV7AwCVxdQov34MCUebDufNhZ/Fw==',
          required: true,
          disabled: false,
          node_type: 'input',
        },
        messages: [],
        meta: {},
      },
      {
        type: 'input',
        group: 'link',
        attributes: {
          name: 'email',
          type: 'email',
          value: 'sshanzelzzzzzzz@yahoo.com',
          required: true,
          disabled: false,
          node_type: 'input',
        },
        messages: [],
        meta: {},
      },
      {
        type: 'input',
        group: 'link',
        attributes: {
          name: 'method',
          type: 'submit',
          value: 'code',
          disabled: false,
          node_type: 'input',
        },
        messages: [],
        meta: { label: { id: 1070005, text: 'Submit', type: 'info' } },
      },
    ],
    messages: [
      {
        id: 1060002,
        text: 'An email containing a recovery link has been sent to the email address you provided.',
        type: 'info',
        context: {},
      },
    ],
  },
  state: 'sent_email',
};

export const settingsFlowMockData: InitializationData & { identity: Identity } =
  {
    id: '299542ab-38d9-470c-b9d3-8243a094d08a',
    type: 'browser',
    expires_at: '2022-08-31T12:07:36.046916095Z',
    issued_at: '2022-08-31T11:07:36.046916095Z',
    request_url: `${authUrl}/self-service/settings/browser?`,
    ui: {
      action: `${authUrl}/self-service/settings?flow=299542ab-38d9-470c-b9d3-8243a094d08a`,
      method: 'POST',
      nodes: [
        {
          type: 'input',
          group: 'default',
          attributes: {
            name: 'csrf_token',
            type: 'hidden',
            value:
              'Am0kxGZFeJ5cz0RE8lsOgZTkXsOFVxtQnts0b38KqUv61zRr8Aj8OjZQTOu3AJ8tm7lZnuS3GMJyNMGbfYtIVg==',
            required: true,
            disabled: false,
            node_type: 'input',
          },
          messages: [],
          meta: {},
        },
        {
          type: 'input',
          group: 'profile',
          attributes: {
            name: 'traits.email',
            type: 'email',
            value: 'lee@daily.dev',
            required: true,
            disabled: false,
            node_type: 'input',
          },
          messages: [],
          meta: { label: { id: 1070002, text: 'E-Mail', type: 'info' } },
        },
        {
          type: 'input',
          group: 'profile',
          attributes: {
            name: 'traits.name',
            type: 'text',
            value: 'Lee Hansel Solevilla',
            required: true,
            disabled: false,
            node_type: 'input',
          },
          messages: [],
          meta: { label: { id: 1070002, text: 'Full name', type: 'info' } },
        },
        {
          type: 'input',
          group: 'profile',
          attributes: {
            name: 'traits.username',
            type: 'text',
            value: 'lee',
            required: true,
            disabled: false,
            node_type: 'input',
          },
          messages: [],
          meta: { label: { id: 1070002, text: 'Username', type: 'info' } },
        },
        {
          type: 'input',
          group: 'profile',
          attributes: {
            name: 'traits.image',
            type: 'text',
            value:
              'https://lh3.googleusercontent.com/a-/AFdZucrCRkShFtfp4KDx2ipH0cgIzKmD7fcDYfwLqX8Q=s96-c',
            disabled: false,
            node_type: 'input',
          },
          messages: [],
          meta: { label: { id: 1070002, text: 'Image', type: 'info' } },
        },
        {
          type: 'input',
          group: 'profile',
          attributes: {
            name: 'traits.github',
            type: 'text',
            disabled: false,
            node_type: 'input',
          },
          messages: [],
          meta: { label: { id: 1070002, text: 'Github handle', type: 'info' } },
        },
        {
          type: 'input',
          group: 'profile',
          attributes: {
            name: 'method',
            type: 'submit',
            value: 'profile',
            disabled: false,
            node_type: 'input',
          },
          messages: [],
          meta: { label: { id: 1070003, text: 'Save', type: 'info' } },
        },
        {
          type: 'input',
          group: 'password',
          attributes: {
            name: 'password',
            type: 'password',
            required: true,
            disabled: false,
            node_type: 'input',
          },
          messages: [],
          meta: { label: { id: 1070001, text: 'Password', type: 'info' } },
        },
        {
          type: 'input',
          group: 'password',
          attributes: {
            name: 'method',
            type: 'submit',
            value: 'password',
            disabled: false,
            node_type: 'input',
          },
          messages: [],
          meta: { label: { id: 1070003, text: 'Save', type: 'info' } },
        },
        {
          type: 'input',
          group: 'oidc',
          attributes: {
            name: 'link',
            type: 'submit',
            value: 'apple',
            disabled: false,
            node_type: 'input',
          },
          messages: [],
          meta: {
            label: {
              id: 1050002,
              text: 'Link apple',
              type: 'info',
              context: { provider: 'apple' },
            },
          },
        },
        {
          type: 'input',
          group: 'oidc',
          attributes: {
            name: 'link',
            type: 'submit',
            value: 'facebook',
            disabled: false,
            node_type: 'input',
          },
          messages: [],
          meta: {
            label: {
              id: 1050002,
              text: 'Link facebook',
              type: 'info',
              context: { provider: 'facebook' },
            },
          },
        },
        {
          type: 'input',
          group: 'oidc',
          attributes: {
            name: 'link',
            type: 'submit',
            value: 'github',
            disabled: false,
            node_type: 'input',
          },
          messages: [],
          meta: {
            label: {
              id: 1050002,
              text: 'Link github',
              type: 'info',
              context: { provider: 'github' },
            },
          },
        },
        {
          type: 'input',
          group: 'oidc',
          attributes: {
            name: 'unlink',
            type: 'submit',
            value: 'google',
            disabled: false,
            node_type: 'input',
          },
          messages: [],
          meta: {
            label: {
              id: 1050003,
              text: 'Unlink google',
              type: 'info',
              context: { provider: 'google' },
            },
          },
        },
      ],
    },
    identity: {
      id: '4a1fed11-17f6-42e6-87ee-219bb249c6ba',
      schema_id: 'default',
      schema_url: `${authUrl}/schemas/ZGVmYXVsdA`,
      state: 'active',
      state_changed_at: '2022-08-24T03:30:19.668093Z',
      traits: {
        name: 'Lee Hansel Solevilla',
        email: 'lee@daily.dev',
        image:
          'https://lh3.googleusercontent.com/a-/AFdZucrCRkShFtfp4KDx2ipH0cgIzKmD7fcDYfwLqX8Q=s96-c',
        username: 'lee',
      },
      verifiable_addresses: [
        {
          id: '99a84554-56a8-4a1c-b269-869ddd0b4b8d',
          value: 'lee@daily.dev',
          verified: false,
          via: 'email',
          status: 'sent',
          created_at: '2022-08-24T03:30:19.705492Z',
          updated_at: '2022-08-31T03:48:02.420377Z',
        },
      ],
      recovery_addresses: [
        {
          id: 'a530e776-6a87-4b19-9523-4eef4a01b0dd',
          value: 'lee@daily.dev',
          via: 'email',
          created_at: '2022-08-24T03:30:19.714243Z',
          updated_at: '2022-08-31T03:48:02.423298Z',
        },
      ],
      metadata_public: null,
      created_at: '2022-08-24T03:30:19.690974Z',
      updated_at: '2022-08-24T03:30:19.690974Z',
    },
    state: 'show_form',
  };

const getWhoamiMockData = (email = 'lee@daily.dev') => ({
  verified: true,
  session: {
    id: 'c005cab5-e770-4337-a3b3-7903b79abc61',
    active: true,
    expires_at: '2022-09-01T06:19:36.095759Z',
    authenticated_at: '2022-08-31T06:19:36.095759Z',
    authenticator_assurance_level: 'aal1',
    authentication_methods: [
      {
        method: 'password',
        aal: 'aal1',
        completed_at: '2022-08-31T06:19:36.095757137Z',
      },
    ],
    issued_at: '2022-08-31T06:19:36.095759Z',
    identity: {
      id: '4a1fed11-17f6-42e6-87ee-219bb249c6ba',
      schema_id: 'default',
      schema_url: `${authUrl}/schemas/ZGVmYXVsdA`,
      state: 'active',
      state_changed_at: '2022-08-24T03:30:19.668093Z',
      traits: {
        name: 'Lee Hansel Solevilla',
        email,
        image:
          'https://lh3.googleusercontent.com/a-/AFdZucrCRkShFtfp4KDx2ipH0cgIzKmD7fcDYfwLqX8Q=s96-c',
        username: 'lee',
      },
      verifiable_addresses: [
        {
          id: '99a84554-56a8-4a1c-b269-869ddd0b4b8d',
          value: email,
          verified: false,
          via: 'email',
          status: 'sent',
          created_at: '2022-08-24T03:30:19.705492Z',
          updated_at: '2022-08-31T03:48:02.420377Z',
        },
      ],
      recovery_addresses: [
        {
          id: 'a530e776-6a87-4b19-9523-4eef4a01b0dd',
          value: email,
          via: 'email',
          created_at: '2022-08-24T03:30:19.714243Z',
          updated_at: '2022-08-31T03:48:02.423298Z',
        },
      ],
      metadata_public: null,
      created_at: '2022-08-24T03:30:19.690974Z',
      updated_at: '2022-08-24T03:30:19.690974Z',
    },
  },
});

export const mockWhoAmIFlow = (email?: string): void => {
  nock(heimdallUrl).get('/api/whoami').reply(200, getWhoamiMockData(email));
};

export const socialProviderRedirectMock = {
  error: {
    id: 'browser_location_change_required',
    code: 422,
    status: 'Unprocessable Entity',
    reason:
      'In order to complete this flow please redirect the browser to: https://accounts.google.com/o/oauth2/v2/auth?claims=%7B%22id_token%22%3A%7B%22email%22%3A%7B%22essential%22%3Atrue%7D%2C%22email_verified%22%3A%7B%22essential%22%3Atrue%7D%2C%22name%22%3A%7B%22essential%22%3Atrue%7D%2C%22picture%22%3A%7B%22essential%22%3Atrue%7D%7D%7D\u0026client_id=234794427174-3uu0mjstrrrstvnjaabp5vmamftmb7gu.apps.googleusercontent.com\u0026redirect_uri=http%3A%2F%2F127.0.0.1%3A4433%2Fself-service%2Fmethods%2Foidc%2Fcallback%2Fgoogle\u0026response_type=code\u0026scope=email+profile+openid\u0026state=9fb75a8e-6461-45c8-bfa5-922ce7839a04',
    message: 'browser location change required',
  },
  redirect_browser_to:
    'https://accounts.google.com/o/oauth2/v2/auth?claims=%7B%22id_token%22%3A%7B%22email%22%3A%7B%22essential%22%3Atrue%7D%2C%22email_verified%22%3A%7B%22essential%22%3Atrue%7D%2C%22name%22%3A%7B%22essential%22%3Atrue%7D%2C%22picture%22%3A%7B%22essential%22%3Atrue%7D%7D%7D\u0026client_id=234794427174-3uu0mjstrrrstvnjaabp5vmamftmb7gu.apps.googleusercontent.com\u0026redirect_uri=http%3A%2F%2F127.0.0.1%3A4433%2Fself-service%2Fmethods%2Foidc%2Fcallback%2Fgoogle\u0026response_type=code\u0026scope=email+profile+openid\u0026state=9fb75a8e-6461-45c8-bfa5-922ce7839a04',
};

export const requireVerificationSettingsMock = {
  error: {
    id: 'session_refresh_required',
    code: 403,
    status: 'Forbidden',
    reason:
      'The login session is too old and thus not allowed to update these fields. Please re-authenticate.',
    message: 'The requested action was forbidden',
  },
  redirect_browser_to: `${authUrl}/self-service/login/browser?refresh=true\u0026return_to=http%3A%2F%2F127.0.0.1%3A4433%2Fself-service%2Fsettings%3Fflow%3D4254d8bc-502b-498e-94c5-80891f49beb6`,
};

export const successfulSettingsFlowData = {
  id: '299542ab-38d9-470c-b9d3-8243a094d08a',
  type: 'browser',
  expires_at: '2022-08-31T12:07:36.046916Z',
  issued_at: '2022-08-31T11:07:36.046916Z',
  request_url: `${authUrl}/self-service/settings/browser?`,
  ui: {
    action: `${authUrl}/self-service/settings?flow=e60c9fca-7113-4966-ad9e-83c21371093b`,
    method: 'POST',
    nodes: [
      {
        type: 'input',
        group: 'default',
        attributes: {
          name: 'csrf_token',
          type: 'hidden',
          value:
            'kv9MpLtMzXy1ymRD/aYv60jNC7oUJxF02R4KBgfIfhJqRVwLLQFJ2N9VbOy4/b5HR5AM53XHEuY18f/yBUmfDw==',
          required: true,
          disabled: false,
          node_type: 'input',
        },
        messages: [],
        meta: {},
      },
      {
        type: 'input',
        group: 'profile',
        attributes: {
          name: 'traits.email',
          type: 'email',
          value: 'lee@daily.dev',
          required: true,
          disabled: false,
          node_type: 'input',
        },
        messages: [],
        meta: { label: { id: 1070002, text: 'E-Mail', type: 'info' } },
      },
      {
        type: 'input',
        group: 'profile',
        attributes: {
          name: 'traits.name',
          type: 'text',
          value: 'Lee Hansel Solevilla',
          required: true,
          disabled: false,
          node_type: 'input',
        },
        messages: [],
        meta: { label: { id: 1070002, text: 'Full name', type: 'info' } },
      },
      {
        type: 'input',
        group: 'profile',
        attributes: {
          name: 'traits.username',
          type: 'text',
          value: 'lee',
          required: true,
          disabled: false,
          node_type: 'input',
        },
        messages: [],
        meta: { label: { id: 1070002, text: 'Username', type: 'info' } },
      },
      {
        type: 'input',
        group: 'profile',
        attributes: {
          name: 'traits.image',
          type: 'text',
          value:
            'https://lh3.googleusercontent.com/a-/AFdZucrCRkShFtfp4KDx2ipH0cgIzKmD7fcDYfwLqX8Q=s96-c',
          disabled: false,
          node_type: 'input',
        },
        messages: [],
        meta: { label: { id: 1070002, text: 'Image', type: 'info' } },
      },
      {
        type: 'input',
        group: 'profile',
        attributes: {
          name: 'traits.github',
          type: 'text',
          disabled: false,
          node_type: 'input',
        },
        messages: [],
        meta: { label: { id: 1070002, text: 'Github handle', type: 'info' } },
      },
      {
        type: 'input',
        group: 'profile',
        attributes: {
          name: 'method',
          type: 'submit',
          value: 'profile',
          disabled: false,
          node_type: 'input',
        },
        messages: [],
        meta: { label: { id: 1070003, text: 'Save', type: 'info' } },
      },
      {
        type: 'input',
        group: 'password',
        attributes: {
          name: 'password',
          type: 'password',
          required: true,
          disabled: false,
          node_type: 'input',
        },
        messages: [],
        meta: { label: { id: 1070001, text: 'Password', type: 'info' } },
      },
      {
        type: 'input',
        group: 'password',
        attributes: {
          name: 'method',
          type: 'submit',
          value: 'password',
          disabled: false,
          node_type: 'input',
        },
        messages: [],
        meta: { label: { id: 1070003, text: 'Save', type: 'info' } },
      },
      {
        type: 'input',
        group: 'oidc',
        attributes: {
          name: 'link',
          type: 'submit',
          value: 'apple',
          disabled: false,
          node_type: 'input',
        },
        messages: [],
        meta: {
          label: {
            id: 1050002,
            text: 'Link apple',
            type: 'info',
            context: { provider: 'apple' },
          },
        },
      },
      {
        type: 'input',
        group: 'oidc',
        attributes: {
          name: 'link',
          type: 'submit',
          value: 'facebook',
          disabled: false,
          node_type: 'input',
        },
        messages: [],
        meta: {
          label: {
            id: 1050002,
            text: 'Link facebook',
            type: 'info',
            context: { provider: 'facebook' },
          },
        },
      },
      {
        type: 'input',
        group: 'oidc',
        attributes: {
          name: 'link',
          type: 'submit',
          value: 'github',
          disabled: false,
          node_type: 'input',
        },
        messages: [],
        meta: {
          label: {
            id: 1050002,
            text: 'Link github',
            type: 'info',
            context: { provider: 'github' },
          },
        },
      },
      {
        type: 'input',
        group: 'oidc',
        attributes: {
          name: 'unlink',
          type: 'submit',
          value: 'google',
          disabled: false,
          node_type: 'input',
        },
        messages: [],
        meta: {
          label: {
            id: 1050003,
            text: 'Unlink google',
            type: 'info',
            context: { provider: 'google' },
          },
        },
      },
    ],
    messages: [
      { id: 1050001, text: 'Your changes have been saved!', type: 'info' },
    ],
  },
  identity: {
    id: '4a1fed11-17f6-42e6-87ee-219bb249c6ba',
    schema_id: 'default',
    schema_url: `${authUrl}/schemas/ZGVmYXVsdA`,
    state: 'active',
    state_changed_at: '2022-08-24T03:30:19.668093Z',
    traits: {
      name: 'Lee Hansel Solevilla',
      email: 'lee@daily.dev',
      image:
        'https://lh3.googleusercontent.com/a-/AFdZucrCRkShFtfp4KDx2ipH0cgIzKmD7fcDYfwLqX8Q=s96-c',
      username: 'lee',
    },
    verifiable_addresses: [
      {
        id: '99a84554-56a8-4a1c-b269-869ddd0b4b8d',
        value: 'lee@daily.dev',
        verified: false,
        via: 'email',
        status: 'sent',
        created_at: '2022-08-24T03:30:19.705492Z',
        updated_at: '2022-08-31T11:07:50.829902Z',
      },
    ],
    recovery_addresses: [
      {
        id: 'a530e776-6a87-4b19-9523-4eef4a01b0dd',
        value: 'lee@daily.dev',
        via: 'email',
        created_at: '2022-08-24T03:30:19.714243Z',
        updated_at: '2022-08-31T11:07:50.832295Z',
      },
    ],
    metadata_public: null,
    created_at: '2022-08-24T03:30:19.690974Z',
    updated_at: '2022-08-24T03:30:19.690974Z',
  },
  state: 'success',
};

export const loginVerificationMockData = {
  id: 'e9716552-632f-4b9b-a1ce-c1f844ff5b98',
  type: 'browser',
  expires_at: '2022-08-31T11:17:42.324836417Z',
  issued_at: '2022-08-31T11:07:42.324836417Z',
  request_url: `${authUrl}/self-service/login/browser?refresh=true`,
  ui: {
    action: `${authUrl}/self-service/login?flow=e9716552-632f-4b9b-a1ce-c1f844ff5b98`,
    method: 'POST',
    nodes: [
      {
        type: 'input',
        group: 'oidc',
        attributes: {
          name: 'provider',
          type: 'submit',
          value: 'apple',
          disabled: false,
          node_type: 'input',
        },
        messages: [],
        meta: {
          label: {
            id: 1010002,
            text: 'Sign in with apple',
            type: 'info',
            context: { provider: 'apple' },
          },
        },
      },
      {
        type: 'input',
        group: 'oidc',
        attributes: {
          name: 'provider',
          type: 'submit',
          value: 'facebook',
          disabled: false,
          node_type: 'input',
        },
        messages: [],
        meta: {
          label: {
            id: 1010002,
            text: 'Sign in with facebook',
            type: 'info',
            context: { provider: 'facebook' },
          },
        },
      },
      {
        type: 'input',
        group: 'oidc',
        attributes: {
          name: 'provider',
          type: 'submit',
          value: 'github',
          disabled: false,
          node_type: 'input',
        },
        messages: [],
        meta: {
          label: {
            id: 1010002,
            text: 'Sign in with github',
            type: 'info',
            context: { provider: 'github' },
          },
        },
      },
      {
        type: 'input',
        group: 'oidc',
        attributes: {
          name: 'provider',
          type: 'submit',
          value: 'google',
          disabled: false,
          node_type: 'input',
        },
        messages: [],
        meta: {
          label: {
            id: 1010002,
            text: 'Sign in with google',
            type: 'info',
            context: { provider: 'google' },
          },
        },
      },
      {
        type: 'input',
        group: 'default',
        attributes: {
          name: 'csrf_token',
          type: 'hidden',
          value:
            'm2PxoVHHfA08F+6CAN6WbCqjdpkQCLlLMSvIfS4ILUdj2eEOx4r4qVaI5i1FhQfAJf5xxHHoutndxD2JLInMWg==',
          required: true,
          disabled: false,
          node_type: 'input',
        },
        messages: [],
        meta: {},
      },
      {
        type: 'input',
        group: 'default',
        attributes: {
          name: 'identifier',
          type: 'hidden',
          value: 'lee@daily.dev',
          disabled: false,
          node_type: 'input',
        },
        messages: [],
        meta: {},
      },
      {
        type: 'input',
        group: 'password',
        attributes: {
          name: 'password',
          type: 'password',
          required: true,
          disabled: false,
          node_type: 'input',
        },
        messages: [],
        meta: { label: { id: 1070001, text: 'Password', type: 'info' } },
      },
      {
        type: 'input',
        group: 'password',
        attributes: {
          name: 'method',
          type: 'submit',
          value: 'password',
          disabled: false,
          node_type: 'input',
        },
        messages: [],
        meta: {
          label: { id: 1010001, text: 'Sign in', type: 'info', context: {} },
        },
      },
    ],
    messages: [
      {
        id: 1010003,
        text: 'Please confirm this action by verifying that it is you.',
        type: 'info',
        context: {},
      },
    ],
  },
  created_at: '2022-08-31T11:07:42.351884Z',
  updated_at: '2022-08-31T11:07:42.351884Z',
  refresh: true,
  requested_aal: 'aal1',
};

export const verifiedLoginData = {
  session: {
    id: '1ee3591b-db3d-4f5d-ae52-571da88d486c',
    active: true,
    expires_at: '2022-09-03T05:20:46.587518802Z',
    authenticated_at: '2022-09-02T05:20:46.587518802Z',
    authenticator_assurance_level: 'aal1',
    authentication_methods: [
      {
        method: 'password',
        aal: 'aal1',
        completed_at: '2022-09-01T08:03:05.236219507Z',
      },
      {
        method: 'password',
        aal: 'aal1',
        completed_at: '2022-09-02T05:20:46.587512719Z',
      },
    ],
    issued_at: '2022-09-02T05:20:46.587518802Z',
    identity: {
      id: '318b8590-135a-42d0-8c50-6820784ad869',
      schema_id: 'default',
      schema_url: `${authUrl}/schemas/ZGVmYXVsdA`,
      state: 'active',
      state_changed_at: '2022-08-25T03:32:25.542997Z',
      traits: {
        name: 'Lee Hansel Solevilla',
        email: 'sshanzel@yahoo.com',
        username: 'abc123',
      },
      verifiable_addresses: [
        {
          id: '0aa85371-7e37-4c00-aa85-24e2ae617715',
          value: 'sshanzel@yahoo.com',
          verified: false,
          via: 'email',
          status: 'sent',
          created_at: '2022-08-25T03:32:25.562374Z',
          updated_at: '2022-08-25T03:35:25.5825Z',
        },
      ],
      recovery_addresses: [
        {
          id: 'c29fc594-d6f3-44dc-bf26-3b8425f9d2ac',
          value: 'sshanzel@yahoo.com',
          via: 'email',
          created_at: '2022-08-25T03:32:25.569222Z',
          updated_at: '2022-08-25T03:35:25.585227Z',
        },
      ],
      metadata_public: null,
      created_at: '2022-08-25T03:32:25.548644Z',
      updated_at: '2022-08-25T03:32:25.548644Z',
    },
  },
};

export const mockVerificationValidation = (
  params: Partial<EmptyObjectLiteral>,
  result: unknown = successfulSettingsFlowData,
  code = 200,
): void => {
  nock(authUrl)
    .post(
      `/self-service/verification?flow=1d225d8c-829b-4016-ae04-69b96126efdd`,
      params,
    )
    .reply(code, result);
};

export const mockSettingsValidation = (
  params: Partial<EmptyObjectLiteral>,
  result: unknown = successfulSettingsFlowData,
  code = 200,
): nock.Scope => {
  const url = new URL(settingsFlowMockData.ui.action);
  return nock(authUrl, {
    reqheaders: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': params.csrf_token,
      Accept: 'application/json',
    },
  })
    .post(url.pathname + url.search, params)
    .reply(code, result);
};

export const mockKratosPost = <T = EmptyObjectLiteral>(
  { params, action }: KratosFormParams<Partial<T> & { csrf_token: string }>,
  result: unknown,
  code = 200,
): void => {
  const url = new URL(action);
  nock(authUrl, {
    reqheaders: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': params.csrf_token,
      Accept: 'application/json',
    },
  })
    .post(url.pathname + url.search, params)
    .reply(code, result);
};

export const mockSettingsFlow = (result = settingsFlowMockData): void => {
  nock(authUrl, { reqheaders: { Accept: 'application/json' } })
    .get('/self-service/settings/browser?')
    .reply(200, result);
};

export const mockLoginFlow = (result = passwordLoginFlowMockData): void => {
  nock(authUrl, { reqheaders: { Accept: 'application/json' } })
    .get('/self-service/login/browser?')
    .reply(200, result);
};

export const mockLoginReverifyFlow = (
  result = loginVerificationMockData,
): void => {
  nock(authUrl, { reqheaders: { Accept: 'application/json' } })
    .get('/self-service/login/browser?refresh=true')
    .reply(200, result);
};

export const mockRegistrationFlow = (
  result = registrationFlowMockData,
): void => {
  nock(authUrl, { reqheaders: { Accept: 'application/json' } })
    .get('/self-service/registration/browser?')
    .reply(200, result);
};

export const mockVerificationFlow = (
  result = registrationFlowMockData,
): void => {
  nock(authUrl, { reqheaders: { Accept: 'application/json' } })
    .get('/self-service/verification/browser?')
    .reply(200, result);
};

export const mockEmailCheck = (email: string, result = false): void => {
  nock(heimdallUrl).post(`/api/check_email?email_address=${email}`).reply(200, {
    ok: true,
    result,
  });
};

export const mockApiVerificationFlow = (): void => {
  nock(heimdallUrl).get(`/api/get_verification_flow`).reply(200, {});
};

export const mockListProviders = (
  result: string[] = ['facebook', 'github', 'apple', 'password'],
): void => {
  nock(heimdallUrl)
    .post('/api/list_providers?')
    .reply(200, { ok: true, result });
};
