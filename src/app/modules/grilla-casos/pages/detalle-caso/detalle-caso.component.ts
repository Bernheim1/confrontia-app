import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { CasoService } from '../../../../../services/caso/caso.service';
import { CasoDto } from '../../../../../shared/models/caso-dto';
import { TipoSalidaEnum } from '../../../../../shared/enums/tipo-salida-enum';

@Component({
  selector: 'app-detalle-caso',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './detalle-caso.component.html',
  styleUrls: ['./detalle-caso.component.scss']
})
export class DetalleCasoComponent implements OnInit {
  faArrowLeft = faArrowLeft;
  caso?: CasoDto;
  casoId!: string;
  loading: boolean = false;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private casoService: CasoService
  ) {}

  ngOnInit(): void {
    // Obtener el ID del caso desde la ruta
    this.route.params.subscribe(params => {
      this.casoId = params['id'];
      this.cargarCaso();
    });
  }

  cargarCaso(): void {
    this.loading = true;
    this.error = null;

    this.casoService.getCasoById(this.casoId).subscribe({
      next: (caso) => {
        this.caso = caso;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar el caso:', err);
        this.error = 'Error al cargar el caso';
        this.loading = false;
      }
    });
  }

  volver(): void {
    this.router.navigate(['/casos']);
  }

  getTipoSalidaTexto(tipo: TipoSalidaEnum): string {
    switch (tipo) {
      case TipoSalidaEnum.Cedula:
        return 'Cédula';
      case TipoSalidaEnum.Mandamiento:
        return 'Mandamiento';
      default:
        return 'Sin Asignar';
    }
  }
}
