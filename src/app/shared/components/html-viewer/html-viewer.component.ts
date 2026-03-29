import { Component, Inject } from '@angular/core';
import { DialogRef } from '../../services/modal/dialog-ref';
import { DIALOG_DATA } from '../../services/modal/dialog-token';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-html-viewer',
  standalone: true,
  imports: [],
  templateUrl: './html-viewer.component.html',
  styleUrl: './html-viewer.component.scss'
})
export class HtmlViewerComponent {
  constructor(
    private dialogRef: DialogRef,
    @Inject(DIALOG_DATA) public data: string, private toastr: ToastrService
  ) {}

  close() {
    this.dialogRef.close();
  }

  public copyToClipboard() {
    navigator.clipboard.writeText(this.data).then(() => {
        const message = `El escrito fue copiado correctamente`
        this.toastr.success(message, 'Exito');
    });
  }
}
