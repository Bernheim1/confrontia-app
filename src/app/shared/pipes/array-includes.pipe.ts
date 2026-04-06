import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'appArrayIncludes'
})
export class ArrayIncludesPipe implements PipeTransform {

  private _arrayToCheck: any[] = [];
  private _value: any;

  public transform(value: any, arrayToCheck: any[]): boolean | undefined {
    this._arrayToCheck = arrayToCheck;
    this._value = value;

    if (this._arrayToCheck) {
      return this._arrayToCheck.includes(this._value);
    }

    return undefined;
  }
}
