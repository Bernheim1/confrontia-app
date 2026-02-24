export const environment = {
  production: true,
  // @ts-ignore
  apiUrl: window.env?.apiUrl || 'https://confrontia.com.ar/api/v1/',
  // @ts-ignore
  basePath: window.env?.apiUrl || 'https://confrontia.com.ar/api/v1/',
  // @ts-ignore
  debug: window.env?.debug || false,
  // @ts-ignore
  sessionName: window.env?.sessionName || 'CONFRONTIA',
};
