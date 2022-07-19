interface RegistrationInitializationUI {
  action: string;
  method: string;
  nodes: any[];
}

export interface RegistrationInitializationData {
  id: string;
  issued_at: Date;
  expires_at: Date;
  request_url: string;
  type: string;
  ui: RegistrationInitializationUI;
}

export const initializeRegistration =
  (): Promise<RegistrationInitializationData> =>
    new Promise((resolve, reject) => {
      const xhttp = new XMLHttpRequest();
      xhttp.onload = () => resolve(JSON.parse(xhttp.response));
      xhttp.onerror = () => reject(xhttp);
      xhttp.open(
        'GET',
        `${process.env.NEXT_PUBLIC_AUTH_URL}/self-service/registration/browser`,
        true,
      );
      xhttp.setRequestHeader('Accept', 'application/json');
      xhttp.send();
    });

export const validateRegistration = (
  url: string,
  data: string,
): Promise<RegistrationInitializationData> =>
  new Promise((resolve, reject) => {
    const xhttp = new XMLHttpRequest();
    xhttp.onload = () => resolve(JSON.parse(xhttp.response));
    xhttp.onerror = () => reject(xhttp);
    xhttp.open('POST', url, true);
    xhttp.setRequestHeader('Content-Type', 'application/json');
    xhttp.send(data);
  });
