import { Routes } from '@angular/router';
import { Publico } from './layouts/publico';
import { Portada } from './pages/portada';
import { Disponibilidad } from './pages/publico/disponibilidad';
import { Inicio } from './pages/publico/inicio';
import { NoEncontrada } from './pages/no-encontrada';

export const routes: Routes = [
  { path: '', component: Portada, title: 'Prototipo · Plataforma Hoteles Reloncaví' },
  {
    path: '',
    component: Publico,
    children: [
      { path: 'inicio', component: Inicio, title: 'Hoteles Reloncaví · Hoteles y lodges en Chile' },
      { path: 'reservar/disponibilidad', component: Disponibilidad, title: 'Disponibilidad · Hoteles Reloncaví' },
    ],
  },
  { path: '**', component: NoEncontrada, title: 'Página no encontrada · Hoteles Reloncaví' },
];
