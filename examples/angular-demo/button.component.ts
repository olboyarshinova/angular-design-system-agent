import {Component, OnInit} from '@angular/core';
import {interval} from 'rxjs';

@Component({
    selector: 'app-button',
    templateUrl: './button.component.html',
})
export class ButtonComponent implements OnInit {
    count: any = 0;

    ngOnInit() {
        interval(1000).subscribe(() => {
            this.count++;
        });
    }
}
