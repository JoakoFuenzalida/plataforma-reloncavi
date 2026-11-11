import { Routes } from '@angular/router';
import { Publico } from './layouts/publico';
import { Portada } from './pages/portada';
import { Disponibilidad } from './pages/publico/disponibilidad';
import { Inicio } from './pages/publico/inicio';
import { NoEncontrada } from './pages/no-encontrada';
import { DatosReserva } from './pages/publico/datos';
import { Pago } from './pages/publico/pago';
import { Registro } from './pages/publico/registro';
import { Operacion } from './pages/operacion';
import { Tablero } from './pages/tablero';
import { Mantenimiento } from './pages/mantenimiento';

export const routes: Routes = [
  { path: 'personal/mantenimiento', component: Mantenimiento, title: 'Mantenimiento · Hoteles Reloncaví' },
  { path: '', component: Portada, title: 'Prototipo · Plataforma Hoteles Reloncaví' },
  { path: 'personal/recepcion', component: Operacion, title: 'Recepción · Hoteles Reloncaví' },
  { path: 'personal/tablero', component: Tablero, title: 'Tablero · Hoteles Reloncaví' },
  { path: 'terreno', component: Operacion, data: { terreno: true }, title: 'Housekeeping · Hoteles Reloncaví' },
  {
    path: '',
    component: Publico,
    children: [
      { path: 'inicio', component: Inicio, title: 'Hoteles Reloncaví · Hoteles y lodges en Chile' },
      { path: 'reservar/disponibilidad', component: Disponibilidad, title: 'Disponibilidad · Hoteles Reloncaví' },
      { path: 'reservar/datos', component: DatosReserva, title: 'Tus datos · Hoteles Reloncaví',},
      { path: 'reservar/pago', component: Pago, title: 'Pago · Hoteles Reloncaví' },
      { path: 'registro/:id', component: Registro, title: 'Registro previo · Hoteles Reloncaví' },
      { path: 'reservar/confirmacion/:id', component: Pago, data: { confirmacion: true }, title: 'Confirmación · Hoteles Reloncaví' },
    ],
  },
  { path: '**', component: NoEncontrada, title: 'Página no encontrada · Hoteles Reloncaví' },
];
