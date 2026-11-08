import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AvisosHost } from './shared/toast';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AvisosHost],
  template: `<router-outlet /><app-avisos />`,
})
export class App {}
