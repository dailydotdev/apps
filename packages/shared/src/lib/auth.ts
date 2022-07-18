export const getAuthInitializationToken = (): Promise<string> =>
  new Promise((resolve) => {
    const xhttp = new XMLHttpRequest();
    xhttp.onload = () => resolve(xhttp.responseText);
    xhttp.open(
      'GET',
      `${process.env.NEXT_PUBLIC_AUTH_URL}/self-service/registration/browser`,
      true,
    );
    xhttp.setRequestHeader('Accept', 'application/json; charset=utf-8');
    xhttp.send();
  });
