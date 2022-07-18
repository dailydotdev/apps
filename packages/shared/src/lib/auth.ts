export const getAuthInitializationToken = (
  flow?: string,
): Promise<XMLHttpRequest> =>
  new Promise((resolve, reject) => {
    const xhttp = new XMLHttpRequest();
    const params = flow ? new URLSearchParams({ flow }) : '';
    xhttp.onload = () => resolve(xhttp);
    xhttp.onerror = () => reject(xhttp);
    xhttp.open(
      'GET',
      `${process.env.NEXT_PUBLIC_AUTH_URL}/self-service/registration/browser${params}`,
      true,
    );
    xhttp.setRequestHeader('Accept', 'application/json; charset=utf-8');
    xhttp.send();
  });
