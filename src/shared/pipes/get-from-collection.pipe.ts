import { Injectable, Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'appGetFromCollection',
  pure: true,
  standalone: true
})
@Injectable({ providedIn: 'root' })
export class GetFromCollectionPipe implements PipeTransform {

  private _collectionHasSearchKey: boolean = false;
  private _collectionHasResultKey: boolean = false;

  public transform(
    value: unknown,
    args: {collection: any[]; searchKey: any; returnKey: string}
  ): unknown {
    if (args.collection?.length > 0) {
      this._collectionHasSearchKey = args.searchKey in args.collection[0];
      this._collectionHasResultKey = args.returnKey in args.collection[0];

      if (this._collectionHasSearchKey && this._collectionHasResultKey) {
        const findResult = args.collection.find((el: any) => el[`${args.searchKey}`] === value);

        return findResult ? findResult[`${args.returnKey}` as keyof {searchKey: any; returnKey: string}] : undefined;
      }
    }

    return undefined;
  }
}