import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FormsModule } from "@angular/forms";
import { CoreConfigService } from './core/services/config.service';
import { Subject, takeUntil } from 'rxjs';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, FontAwesomeModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  private _unsubscribeAll$: Subject<any>;

  public constructor(private _coreConfigService: CoreConfigService) {
    this._unsubscribeAll$ = new Subject();
  }
  public coreConfig: any;


  public ngOnInit(): void {
    this._coreConfigService.config.pipe(takeUntil(this._unsubscribeAll$)).subscribe((config: any) => {
      this.coreConfig = config;
    });
  }
}