import {
  InitializationData,
  SuccessfulRegistrationData,
} from '../../src/lib/auth';

export const registrationFlowMockData: InitializationData = {
  id: '1d225d8c-829b-4016-ae04-69b96126efdd',
  type: 'browser',
  expires_at: '2022-07-31T11:29:43.777669965Z',
  issued_at: '2022-07-31T11:19:43.777669965Z',
  request_url: 'http://127.0.0.1:4433/self-service/login/browser',
  ui: {
    action:
      'http://127.0.0.1:4433/self-service/login?flow=1d225d8c-829b-4016-ae04-69b96126efdd',
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
  request_url: 'http://127.0.0.1:4433/self-service/registration/browser',
  ui: {
    action:
      'http://127.0.0.1:4433/self-service/registration?flow=36c396aa-0e1e-4d04-b009-1bb1b6480aa4',
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
        meta: { label: { id: 1070001, text: 'Password', type: 'info' } },
      },
      {
        type: 'input',
        group: 'password',
        attributes: {
          name: 'traits.fullname',
          type: 'text',
          value: 'asdad',
          required: true,
          disabled: false,
          node_type: 'input',
        },
        messages: [],
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
      schema_url: 'http://127.0.0.1:4433/schemas/ZGVmYXVsdA',
      state: 'active',
      state_changed_at: new Date('2022-07-31T11:55:35.07680546Z'),
      traits: { email: 'leeeee@daily.dev', fullname: 'Lee Solevilla' },
      verifiable_addresses: [
        {
          id: '55ae2268-050d-4427-bea1-b4cd12b09829',
          value: 'leeeee@daily.dev',
          verified: false,
          via: 'email',
          status: 'sent',
          created_at: new Date('2022-07-31T11:55:35.088234Z'),
          updated_at: new Date('2022-07-31T11:55:35.088234Z'),
        },
      ],
      recovery_addresses: [
        {
          id: 'aa978ac6-578b-41de-9bf6-b2d3b048feda',
          value: 'leeeee@daily.dev',
          via: 'email',
          created_at: new Date('2022-07-31T11:55:35.09292Z'),
          updated_at: new Date('2022-07-31T11:55:35.09292Z'),
        },
      ],
      metadata_public: null,
      created_at: new Date('2022-07-31T11:55:35.083416Z'),
      updated_at: new Date('2022-07-31T11:55:35.083416Z'),
    },
  },
  identity: {
    id: '44cf5b24-48c6-4f85-86ca-35bd4a06b5a9',
    schema_id: 'default',
    schema_url: 'http://127.0.0.1:4433/schemas/ZGVmYXVsdA',
    state: 'active',
    state_changed_at: new Date('2022-07-31T11:55:35.07680546Z'),
    traits: { email: 'leeeee@daily.dev', fullname: 'Lee Solevilla' },
    verifiable_addresses: [
      {
        id: '55ae2268-050d-4427-bea1-b4cd12b09829',
        value: 'leeeee@daily.dev',
        verified: false,
        via: 'email',
        status: 'sent',
        created_at: new Date('2022-07-31T11:55:35.088234Z'),
        updated_at: new Date('2022-07-31T11:55:35.088234Z'),
      },
    ],
    recovery_addresses: [
      {
        id: 'aa978ac6-578b-41de-9bf6-b2d3b048feda',
        value: 'leeeee@daily.dev',
        via: 'email',
        created_at: new Date('2022-07-31T11:55:35.09292Z'),
        updated_at: new Date('2022-07-31T11:55:35.09292Z'),
      },
    ],
    metadata_public: null,
    created_at: new Date('2022-07-31T11:55:35.083416Z'),
    updated_at: new Date('2022-07-31T11:55:35.083416Z'),
  },
};

export const passwordLoginFlowMockData: InitializationData = {
  id: '5ce81e66-2c88-42a8-8a88-8371b33d4ce1',
  type: 'browser',
  expires_at: '2022-07-31T16:04:48.357133794Z',
  issued_at: '2022-07-31T15:54:48.357133794Z',
  request_url: 'http://127.0.0.1:4433/self-service/login/browser',
  ui: {
    action:
      'http://127.0.0.1:4433/self-service/login?flow=5ce81e66-2c88-42a8-8a88-8371b33d4ce1',
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
