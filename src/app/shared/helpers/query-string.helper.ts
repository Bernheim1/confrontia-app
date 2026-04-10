import { HttpParams } from '@angular/common/http';

export class QueryStringHelper {
    public static getFromObject(object: any): string {
        let params = new HttpParams();

        for (const key of Object.keys(object)) {
            const value = object[key];

            if (value !== false && !value) {
                continue;
            }

            if (value instanceof Date) {
                params = params.append(key, value.toDateString());
                continue;
            }

            if (typeof(value) === 'object'){
                for (const [index, item] of value.entries()) {
                    if (typeof(item) === 'object') {
                        for (const internalKey of Object.keys(item)) {
                            params = params.append(`${key}[${index}].${internalKey}`, item[internalKey]);
                        }
                    }
                    else{
                        params = params.append(key, item);
                    }
                }
            }
            else {
                params = params.append(key, value);
            }
        }

        return `?${params.toString()}`;
    }
}