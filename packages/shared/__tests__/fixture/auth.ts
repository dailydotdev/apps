import nock from 'nock';
import { authUrl, heimdallUrl } from '../../src/lib/constants';
import {
  Identity,
  InitializationData,
  SuccessfulRegistrationData,
} from '../../src/lib/kratos';

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
      schema_url: 'http://127.0.0.1:4433/schemas/ZGVmYXVsdA',
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
    schema_url: 'http://127.0.0.1:4433/schemas/ZGVmYXVsdA',
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

export const passwordRecoveryFlowMockData = {
  id: '2d8868b9-c720-4379-92ee-b74fcd11a471',
  type: 'browser',
  expires_at: '2022-08-01T06:49:16.558677293Z',
  issued_at: '2022-08-01T05:49:16.558677293Z',
  request_url: 'http://127.0.0.1:4433/self-service/recovery/browser',
  ui: {
    action:
      'http://127.0.0.1:4433/self-service/recovery?flow=2d8868b9-c720-4379-92ee-b74fcd11a471',
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
  request_url: 'http://127.0.0.1:4433/self-service/recovery/browser',
  active: 'link',
  ui: {
    action:
      'http://127.0.0.1:4433/self-service/recovery?flow=2d8868b9-c720-4379-92ee-b74fcd11a471',
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
          value: 'link',
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
    id: 'e6927ed7-538f-4f92-83e6-bf993dbfcf75',
    type: 'browser',
    expires_at: '2022-08-25T11:50:31.305144345Z',
    issued_at: '2022-08-25T10:50:31.305144345Z',
    request_url: 'http://127.0.0.1:4433/self-service/settings/browser?',
    ui: {
      action:
        'http://127.0.0.1:4433/self-service/settings?flow=e6927ed7-538f-4f92-83e6-bf993dbfcf75',
      method: 'POST',
      nodes: [
        {
          type: 'input',
          group: 'default',
          attributes: {
            name: 'csrf_token',
            type: 'hidden',
            value:
              'ciEKdSgoZprj0Ati51AMyP0ENvrW19wmrS+l6kAlcZvRzooYNJbnK2kwGjNr1lmT3w17oYPbY4FYqUwqCafVVw==',
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
      schema_url: 'http://127.0.0.1:4433/schemas/ZGVmYXVsdA',
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
          updated_at: '2022-08-25T10:36:11.275861Z',
        },
      ],
      recovery_addresses: [
        {
          id: 'a530e776-6a87-4b19-9523-4eef4a01b0dd',
          value: 'lee@daily.dev',
          via: 'email',
          created_at: '2022-08-24T03:30:19.714243Z',
          updated_at: '2022-08-25T10:36:11.280364Z',
        },
      ],
      metadata_public: null,
      created_at: '2022-08-24T03:30:19.690974Z',
      updated_at: '2022-08-24T03:30:19.690974Z',
    },
    state: 'show_form',
  };

export const mockLoginFlow = (result = passwordLoginFlowMockData): void => {
  nock(authUrl, { reqheaders: { Accept: 'application/json' } })
    .get('/self-service/login/browser?')
    .reply(200, result);
};

export const mockRegistraitonFlow = (
  result = registrationFlowMockData,
): void => {
  nock(authUrl, { reqheaders: { Accept: 'application/json' } })
    .get('/self-service/registration/browser?')
    .reply(200, result);
};

export const mockEmailCheck = (email: string, result = false): void => {
  nock(heimdallUrl).post(`/api/check_email?email_address=${email}`).reply(200, {
    ok: true,
    result,
  });
};
