export class HtmlHelper {

    // Reemplaza placeholders {{campo}} con valores desde data.
  // Además elimina comentarios tipo {{# ... }} y limpia los placeholders sin valor.
  public static replacePlaceholders(data: Record<string, string>, html: string): string {
    let result = html;

    // 1) eliminar comentarios Handlebars del tipo {{# ... }} o {{!-- ... --}} si existen
    result = result.replace(/{{#.*?}}/gs, '');
    result = result.replace(/{{!--[\s\S]*?--}}/gs, '');

    // 2) reemplazar claves explícitas
    for (const [key, value] of Object.entries(data)) {
      const safeKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const re = new RegExp(`{{\\s*${safeKey}\\s*}}`, 'g');
      result = result.replace(re, value ?? '');
    }

    // 3) Limpiar cualquier placeholder restante: los dejamos vacíos en lugar de mostrar {{...}}
    result = result.replace(/{{\s*[^}]+\s*}}/g, '');

    return result;
  }
}