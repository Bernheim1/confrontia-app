export const environment = {
    // @ts-ignore
    basePath: window.env?.apiUrl || 'https://localhost:7193/',
    // @ts-ignore
    debug: window.env?.debug || true,
    // @ts-ignore
    sessionName: window.env?.sessionName || 'CONFRONTIA',
};
