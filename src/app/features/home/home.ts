import { Component } from '@angular/core';
import { Carousel } from '../../shared/components/carousel/carousel';

@Component({
    selector: 'app-home',
    imports: [Carousel],
    standalone: true,
    templateUrl: './home.html',
    styleUrls: ['./home.css'],
})
export class Home {
    //title = 'C';
    //description = 'Co';
}
