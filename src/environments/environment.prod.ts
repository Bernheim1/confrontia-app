export const environment = {
  production: true,
  // @ts-ignore
  apiUrl: window.env?.apiUrl || 'http://76.13.229.224/api/',
  // @ts-ignore
  basePath: window.env?.apiUrl || 'http://76.13.229.224/api/',
  // @ts-ignore
  debug: window.env?.debug || false,
  // @ts-ignore
  sessionName: window.env?.sessionName || 'CONFRONTIA',
};