import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})

export class HeaderComponent implements OnInit {

	logoUrl = '/cfrca/va18_oci/assets/images/ridelogo_2018_va-newsw-r2.svg';

	constructor(private data: DataService) {}

	ngOnInit() {}
	// Calling on the isLoggedIn() function from the global data service to check the logged in state
  isLoggedIn() {
	  return this.data.isLoggedIn();
	}

}
