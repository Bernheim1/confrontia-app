export const environment = {
  production: true,
  // @ts-ignore
  apiUrl: window.env?.apiUrl || 'https://confrontia.com.ar/api/',
  // @ts-ignore
  basePath: window.env?.apiUrl || 'https://confrontia.com.ar/api/',
  // @ts-ignore
  debug: window.env?.debug || false,
  // @ts-ignore
  sessionName: window.env?.sessionName || 'CONFRONTIA',
};
