import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, FormGroup, FormGroupDirective, NgForm, Validators  } from '@angular/forms';
import { HttpClient, HttpRequest, HttpEvent, HttpEventType } from '@angular/common/http';

/* Angular Material */
import { MatSnackBar } from '@angular/material';
import { ErrorStateMatcher } from '@angular/material/core';

/* Data Service */
import { DataService } from '../data.service';

/** Error when invalid control is dirty, touched, or submitted. */
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'app-step-04',
  templateUrl: './step-04.component.html',
  styleUrls: ['./step-04.component.scss']
})
export class Step04Component implements OnInit, OnDestroy, AfterViewInit {

	// Variables
	buttonStatus = true;
	healthInsName: string;
	healthInsNumber: string;

	// Flowstep
	flowStep = '3';
	flowStepResults: any = {};
	getFlowStepNumber: string;

	// Form Variables
	healthForm: FormGroup;

	// Results from Survey
	surveyResults: any = {};

  // Variable for Timeout
  timeOut: any;
  timeOut2: any;

	constructor(private data: DataService,
              private http: HttpClient,
              private route: Router,
              public snackBar: MatSnackBar) { }

	ngOnInit() {
		window.scrollTo(0,0);

    // Setting a timeout function to log inactive users out (for privacy protection)
    this.timeOut = setTimeout(() => {
      this.snackBar.open('Need more time? For your security, you\'ve been logged out of your check-in session. To continue your online check-in, simply return to the login screen.', 'Close', {
        duration: 15000,
        extraClasses: ['error-info']
      });

      this.timeOut2 = setTimeout(() => {
        this.data.logOut();
      }, 240000);
    }, 858000);

		// Checking logged in state, and running correct functions
		if (this.data.isLoggedIn() === true && this.data.tokenExpired === false) {
			// console.log('You are logged in!');

			this.getFlowStep();

			// this.dataService.getParticipationType();
		} else if (this.data.storageToken === undefined) {
			this.data.logOut();
      this.snackBar.open('Login session expired, please login again.', 'Close', {
        duration: 3500,
        extraClasses: ['error-info']
      });

		} else {
      // if not logged in, go back to step 1 (login page)
      this.snackBar.open('You are not logged in, please login.', 'Close', {
        duration: 3500,
        extraClasses: ['error-info']
      });
			this.route.navigate(['/step-01']);
		}

		this.healthForm = new FormGroup({
			healthName: new FormControl(''),
			healthNumber: new FormControl('')
		});

		// console.log(this.healthForm.controls.healthName.invalid);
	}

  ngAfterViewInit() { };

  // Clear the timeout function upon entering a new route
  ngOnDestroy() {
    clearTimeout(this.timeOut);
  };

  getSurveyRes() {
    this.data.method = 'CRTeamraiserAPI?method=getSurveyResponses&api_key=cfrca&v=1.0&fr_id=' + this.data.eventID + '&survey_id=' + this.data.surveyID + '&sso_auth_token=' + this.data.ssoToken + '&response_format=json';
    this.http.post(this.data.convioURL + this.data.method, null)
      .subscribe(res => {
        this.surveyResults = res;

        for (const data of this.surveyResults.getSurveyResponsesResponse.responses) {
          // if (data.questionId === this.data.question4) {
          // 	if (this.healthInsName === null || this.healthInsName === undefined) {
          // 		this.healthInsName = data.responseValue;
          // 	}
          // 	// if (Object.keys(data.responseValue).length === 0) {
          // 	// 	this.healthInsName = '';
          // 	// }
          // }

          if (data.questionId === this.data.question4) {
            if (this.healthInsName === undefined) {
              this.healthInsName = '';
            }
            if (data.responseValue !== undefined || data.responseValue !== null) {
              this.healthInsName = data.responseValue;
            }
            if (Object.keys(data.responseValue).length === 0) {
              this.healthInsName = '';
            }
          }


          // if (data.questionId === this.data.question5) {
          //
          // 			if (this.healthInsNumber === null || this.healthInsNumber === undefined) {
          // 				this.healthInsNumber = data.responseValue;
          // 			}
          // 			// if (Object.keys(data.responseValue).length === 0) {
          // 			// 	this.healthInsNumber = '';
          // 			// }
          // 		}

          if (data.questionId === this.data.question5) {
            if (this.healthInsNumber === undefined) {
              this.healthInsNumber = '';
            }
            if (data.responseValue !== undefined || data.responseValue !== null) {
              this.healthInsNumber = data.responseValue;
            }
            if (Object.keys(data.responseValue).length === 0) {
              this.healthInsNumber = '';
            }
          }
        }
      }, (err) => {
        this.snackBar.open('There was an error while trying to save. Please check the form.', 'Close', {
          duration: 3500,
          extraClasses: ['error-info']
        });
      });
  }

  updateSurveyRes() {

    if (this.healthInsName === undefined) {
      this.healthInsName = '';
    }

    if (this.healthInsNumber === undefined) {
      this.healthInsNumber = '';
    }

    const healthInsName = '&question_' + this.data.question4 + '=' + this.healthInsName;
    const healthInsNum = '&question_' + this.data.question5 + '=' + this.healthInsNumber;

    const updateSurveyResponsesUrl = 'https://secure2.convio.net/cfrca/site/CRTeamraiserAPI?method=updateSurveyResponses&api_key=cfrca&v=1.0&response_format=json&fr_id=' + this.data.eventID;

    this.http.post(updateSurveyResponsesUrl + healthInsName + healthInsNum + '&survey_id=' + this.data.surveyID + '&sso_auth_token=' + this.data.ssoToken, null)
      .subscribe(res => {
        this.surveyResults = res;

        this.snackBar.open('Your information has been saved!', 'Close', {
          duration: 3500,
          extraClasses: ['saved-info']
        });

        this.nextFlowStep();
      }, (error) => {
        this.snackBar.open('There was an error while trying to save your information.', 'Close', {
          duration: 3500,
          extraClasses: ['error-info']
        });
      });
  }

  updateSurveyResSave() {

    if (this.healthInsName === undefined) {
      this.healthInsName = '';
    }

    if (this.healthInsNumber === undefined) {
      this.healthInsNumber = '';
    }

    const healthInsName = '&question_' + this.data.question4 + '=' + this.healthInsName;
    const healthInsNum = '&question_' + this.data.question5 + '=' + this.healthInsNumber;

    const updateSurveyResponsesUrl = 'https://secure2.convio.net/cfrca/site/CRTeamraiserAPI?method=updateSurveyResponses&api_key=cfrca&v=1.0&response_format=json&fr_id=' + this.data.eventID;

    this.http.post(updateSurveyResponsesUrl + healthInsName + healthInsNum + '&survey_id=' + this.data.surveyID + '&sso_auth_token=' + this.data.ssoToken, null)
      .subscribe(res => {
        this.surveyResults = res;

        this.snackBar.open('Your information has been saved!', 'Close', {
          duration: 3500,
          extraClasses: ['saved-info']
        });

        // window.location.reload();
      }, (error) => {

        this.snackBar.open('There was an error while trying to save your information.', 'Close', {
          duration: 3500,
          extraClasses: ['error-info']
        });

      });
  }

  // Update the current Flowstep
  updateFlowStep() {
    this.data.method = 'CRTeamraiserAPI?method=updateRegistration&api_key=cfrca&v=1.0' + '&fr_id=' + this.data.eventID + '&sso_auth_token=' + this.data.ssoToken + '&flow_step=' + this.flowStep + '&response_format=json';
    this.http.post(this.data.convioURL + this.data.method, null)
      .subscribe(res => {
        // console.log('Flow step updated.')
      }, (err) => {
        if (err) {
          // console.log('There was an error updating the flowstep.');

          this.snackBar.open('There was an unknown error.', 'Close', {
            duration: 3500,
            extraClasses: ['error-info']
          });

          this.data.logOut();
        }
      });
  }

  // Update the current Flowstep
  nextFlowStep() {
    this.flowStep = '4';
    this.data.method = 'CRTeamraiserAPI?method=updateRegistration&api_key=cfrca&v=1.0' + '&fr_id=' + this.data.eventID + '&sso_auth_token=' + this.data.ssoToken + '&flow_step=' + this.flowStep + '&response_format=json';
    this.http.post(this.data.convioURL + this.data.method, null)
      .subscribe(res => {
        // Update the flowStep to the next flowstep once everything checks out properly
        this.route.navigate(['/step-05']);
      }, (err) => {
        if (err) {
          // console.log('There was an error updating the flowstep.');
          this.snackBar.open('There was an unknown error.', 'Close', {
            duration: 3500,
            extraClasses: ['error-info']
          });
          this.data.logOut();
        }
      });
  }

  // Update the current Flowstep
  previousFlowStep() {
    this.flowStep = '2';
    this.data.method = 'CRTeamraiserAPI?method=updateRegistration&api_key=cfrca&v=1.0' + '&fr_id=' + this.data.eventID + '&sso_auth_token=' + this.data.ssoToken + '&flow_step=' + this.flowStep + '&response_format=json';
    this.http.post(this.data.convioURL + this.data.method, null)
      .subscribe(res => {
        // console.log('Flow step updated.')
        this.route.navigate(['/step-03']);
      }, (err) => {
        if (err) {
          this.snackBar.open('There was an unknown error.', 'Close', {
            duration: 3500,
            extraClasses: ['error-info']
          });
          this.data.logOut();
        }
      });
  }

  // Get the current Flowstep
  getFlowStep() {
    const token = localStorage.getItem('token');
    this.data.method = 'CRTeamraiserAPI?method=getFlowStep&api_key=cfrca&v=1.0&response_format=json&fr_id=' + this.data.eventID + '&sso_auth_token=' + token;
    this.http.post(this.data.convioURL + this.data.method, null)
      .subscribe(res => {
        this.flowStepResults = res;
        this.getFlowStepNumber = this.flowStepResults.getFlowStepResponse.flowStep;

        // Checking the participants flow step to prevent user from skipping a flowstep
        if (this.getFlowStepNumber === this.flowStep) {
          // If the flow step matches to where they are supposed to be, then run the functions for the page below
          this.getSurveyRes();
          this.data.getRegInfo();
          this.updateFlowStep();
        } else {

          // If flowstep does not match, show error message and send them back to the previous page/flowstep.
          this.snackBar.open('You have been redirected to your previously saved location.', 'Close', {
            duration: 3500,
            extraClasses: ['routing-info']
          });

          // Check the Flowstep, if matched, send them to the proper route
          if (this.getFlowStepNumber === '0') {
            this.route.navigate(['/step-02']);
          }
          if (this.getFlowStepNumber === '1') {
            this.route.navigate(['/step-02']);
          }
          if (this.getFlowStepNumber === '2') {
            this.route.navigate(['/step-03']);
          }
          if (this.getFlowStepNumber === '3') {
            this.route.navigate(['/step-04']);
          }
          if (this.getFlowStepNumber === '4') {
            this.route.navigate(['/step-05']);
          }
          if (this.getFlowStepNumber === '5') {
            this.route.navigate(['/step-06']);
          }
          if (this.getFlowStepNumber === '6') {
            this.route.navigate(['/step-07']);
          }
          if (this.getFlowStepNumber === '7') {
            this.route.navigate(['/step-08']);
          }
          if (this.getFlowStepNumber === '8') {
            this.route.navigate(['/step-09']);
          }
        }

      }, (err) => {
        // console.log(err);
        this.snackBar.open('There was an unknown error.', 'Close', {
          duration: 3500,
          extraClasses: ['error-info']
        });
        this.data.logOut();
      });
  }

}
