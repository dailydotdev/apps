export class HttpError extends Error {
  public url: string;

  public statusCode: number;

  public response: string;

  constructor(url: string, status: number, response: string) {
    super(`Unexpected status code: ${status}`);

    this.name = 'HttpError';
    this.url = url;
    this.statusCode = status;
    this.response = response;
  }
}
