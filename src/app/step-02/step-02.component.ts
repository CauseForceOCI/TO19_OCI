import { Component, OnInit, OnDestroy, Inject, AfterViewInit } from '@angular/core';

/* FormGroup and Validators */
import { FormGroup, FormControl, FormGroupDirective, NgForm, Validators } from '@angular/forms';

/* Router */
import { Router } from '@angular/router';

/* HTTP Client */
import { HttpClient, HttpRequest, HttpEvent, HttpEventType } from '@angular/common/http';

/* Angular Material Compnents */
import { ErrorStateMatcher } from '@angular/material/core';
import { MatSnackBar, MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

/* Data Service */
import { DataService } from '../data.service';

/** Error when invalid control is dirty, touched, or submitted. */
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'app-step-02',
  templateUrl: './step-02.component.html',
  styleUrls: ['./step-02.component.scss']
})
export class Step02Component implements OnInit, OnDestroy, AfterViewInit {

  step02Form: FormGroup;

  matcher = new MyErrorStateMatcher();

  // Variables
  updateRegRes: any= {};
  flowStep= '1';
  method: string;
  checkInStatus = 'started';

  firstName: string;
  lastName: string;
  primaryAddress1: string;
  primaryAddress2: string;
  primaryCity: string;
  primaryState: string;
  primaryZip: string;
  gender: string;

  // Flowstep
  flowStepResults: any = {};
  getFlowStepNumber: string;


  // Gender select
  genderSelecter = [
    {value: 'MALE', viewValue: 'Male'},
    {value: 'FEMALE', viewValue: 'Female'}
  ];

  // genderSelectSurvey = [
  //   {value: 'Male', viewValue: 'Male'},
  //   {value: 'Female', viewValue: 'Female'},
  //   {value: 'Prefer not to say', viewValue: 'Prefer not to say'},
  // ];

  // Get Survey for Gender Question
  surveyResults: any = {};
  // Gender
  genderRes: string;

  // Setting a variable for getUserInfo()'s response as any Object
  consData: any = {};

  updateUserResults: any = {};

  // Variable for Timeout
  timeOut: any;
  timeOut2: any;

  // Invalidator
  invalidOnLoad = false;

  constructor (private dataService: DataService,
               private router: Router,
               private http: HttpClient,
               public snackBar: MatSnackBar,
               public dialog: MatDialog) {

    if (this.primaryAddress2 === null) {
      this.primaryAddress2 = '';
    }
  }

  ngOnInit() {

    // this.dataService.loginTest();

    window.scrollTo(0, 0);

    // Setting a timeout function to log inactive users out (for privacy protection)
    this.timeOut = setTimeout(() => {

      this.snackBar.open('Need more time? For your security, you\'ve been logged out of your check-in session. To continue your online check-in, simply return to the login screen.', 'Close', {
        duration: 15000,
        extraClasses: ['error-info']
      });

      this.timeOut2 = setTimeout(() => {
        this.dataService.logOut();
      }, 240000);
    }, 858000);

    // Checking logged in state, if they are logged in run regInfo() and getUserInfo() functions from the global dataService.
    if (this.dataService.isLoggedIn() === true && this.dataService.tokenExpired === false) {
      // console.log('You are logged in!');

      this.getFlowStep();

      // this.getSurveyRes();
      this.getRegInfo();
      this.getUserInfo();

      // Open welcome dialog / modal if logged in and in correct route
      if (this.router.url === '/step-02') {
        this.openDialog();
      }

      this.getCheckInStatus();

      // this.updateCheckInStatus();

    } else if (this.dataService.storageToken === undefined) {
      // console.log('Auth Token Expired.');
      this.snackBar.open('Login session expired, please login again.', 'Close', {
        duration: 3500,
        extraClasses: ['error-info']
      });

      this.router.navigate(['/step-01']);
    } else {

      // if not logged in, go back to step 1 (login page)
      this.snackBar.open('You are not logged in, please login.', 'Close', {
        duration: 3500,
        extraClasses: ['error-info']
      });

      this.router.navigate(['/step-01']);
    }

    if (this.consData.getConsResponse) {

      if (this.firstName === undefined || null) {
        this.firstName = this.consData.getConsResponse.name.first;
      }

      if (this.lastName === undefined || null) {
        this.lastName = this.consData.getConsResponse.name.last;
      }

      if (this.primaryAddress1 === undefined || null) {
        this.primaryAddress1 = this.consData.getConsResponse.primary_address.street1;
      }

      if (this.primaryAddress2 === undefined || null) {
        this.primaryAddress2 = this.consData.getConsResponse.primary_address.street2;
      }

      if (this.primaryAddress2 === undefined || null) {
        this.primaryAddress2 = this.consData.getConsResponse.primary_address.street2;
      }

    }

    this.step02Form = new FormGroup({
      firstName: new FormControl(this.firstName, Validators.required),
      lastName: new FormControl(this.lastName, Validators.required),
      liveAddress1: new FormControl(this.primaryAddress1, Validators.required),
      liveAddress2: new FormControl(this.primaryAddress2),
      liveCity: new FormControl(this.primaryCity, Validators.required),
      liveState: new FormControl(this.primaryState, Validators.required),
      liveZip: new FormControl(this.primaryZip, Validators.required),
      genderSelect: new FormControl(this.gender, Validators.required)
    });

    if (this.step02Form.controls.firstName.invalid) {
      // console.log('Form invalid');
      // console.log(this.step02Form.controls);
      this.invalidOnLoad = true;
    }

  }

  // Clear the timeout function upon entering a new route
  ngOnDestroy() {
    clearTimeout(this.timeOut);
  }

  ngAfterViewInit() {
    // console.log(this.step02Form);
  }

  // Update the checkInStatus from Registration
  updateCheckInStatus() {
    this.method = 'CRTeamraiserAPI?method=updateRegistration&api_key=cfrca&v=1.0' + '&fr_id=' + this.dataService.eventID + '&sso_auth_token=' + this.dataService.ssoToken + '&checkin_status=' + this.checkInStatus + '&response_format=json';
    this.http.post(this.dataService.convioURL + this.method, null)
      .subscribe(res => {
        this.updateRegRes = res;
      });
  }

  // Gather Registration Information
  getRegInfo() {
    this.dataService.storageToken = localStorage.getItem('token');
    this.method = 'CRTeamraiserAPI?method=getRegistration&api_key=cfrca&v=1.0&response_format=json&fr_id=' + this.dataService.eventID + '&sso_auth_token=' + this.dataService.storageToken;
    this.http.post(this.dataService.convioURL + this.method, null)
      .subscribe(res => {
        this.dataService.regResponse = res;
        // console.log(this.dataService.regResponse);

        // Setting the participation ID Variables
        this.dataService.participationID = this.dataService.regResponse.getRegistrationResponse.registration.participationTypeId;
        localStorage.setItem('participationID', this.dataService.participationID);
        this.dataService.storageParticipationID = localStorage.getItem('participationID');

        // Setting the Emergency Name and Number Variables
        this.dataService.emergencyName = this.dataService.regResponse.getRegistrationResponse.registration.emergencyName;
        this.dataService.emergencyPhone = this.dataService.regResponse.getRegistrationResponse.registration.emergencyPhone;

        this.dataService.getParticipationType();

        // If participant is in a team, get the team information
        if (this.dataService.regResponse.getRegistrationResponse.registration.teamId > 0) {
          this.dataService.getTeam();
        }
      }, (err) => {
        console.log(err);
        this.dataService.tokenExpired = true;
        localStorage.clear();
        this.router.navigate(['/step-01']);
      });
  }

  // Gather Constituent Information
  getUserInfo() {
    this.dataService.storageToken = localStorage.getItem('token');
    this.method = 'CRConsAPI?method=getUser&api_key=cfrca&v=1.0&response_format=json&cons_id=' + this.dataService.storageConsID + '&sso_auth_token=' + this.dataService.storageToken;
    this.http.post(this.dataService.convioURL + this.method, null)
      .subscribe(res => {
        this.consData = res;
        // console.log(this.consData);

        // console.log(this.dataService.getConsInfo);
        this.firstName = this.consData.getConsResponse.name.first;
        this.lastName = this.consData.getConsResponse.name.last;
        this.primaryAddress1 = this.consData.getConsResponse.primary_address.street1;
        this.primaryAddress2 = this.consData.getConsResponse.primary_address.street2;
        this.primaryCity = this.consData.getConsResponse.primary_address.city;
        this.primaryState = this.consData.getConsResponse.primary_address.state;
        this.primaryZip = this.consData.getConsResponse.primary_address.zip;

        this.dataService.consUserName = this.consData.getConsResponse.user_name;

        this.gender = this.consData.getConsResponse.gender;

      }, (err) => {
        // console.log('There was an error getting the Cons Info:');
        console.log(err);
      });
  }

  // Update Constituent Information
  updateUser() {

    if (this.primaryAddress2 === null) {
      this.primaryAddress2 = '';
    }

    const consUrl = '&cons_id=' + this.dataService.storageConsID;
    const ssoUrl = '&sso_auth_token=' + this.dataService.storageToken;
    const firstNameUrl = '&name.first=' + this.firstName;
    const lastNameUrl = '&name.last=' + this.lastName;
    const address1Url = '&primary_address.street1=' + this.primaryAddress1;
    const address2Url = '&primary_address.street2=' + this.primaryAddress2;
    const cityUrl = '&primary_address.city=' + this.primaryCity;
    const stateUrl = '&primary_address.state=' + this.primaryState;
    const zipUrl = '&primary_address.zip=' + this.primaryZip;
    const genderUrl = '&gender=' + this.gender;

    this.method = 'CRConsAPI?method=update&api_key=cfrca&v=1.0&response_format=json' + consUrl + ssoUrl + firstNameUrl + lastNameUrl + genderUrl + address1Url + address2Url + cityUrl + stateUrl + zipUrl;
    this.http.post(this.dataService.convioURL + this.method, null)
      .subscribe(res => {
        this.updateUserResults = res;

        this.updateFlowStepNext();
        // this.router.navigate(['/step-03']);
      }, (err) => {
        // console.log('There was an error getting the Participation Info:');
        // console.log(err);
      });
  }

  // Save Constituent Information
  updateUserSave() {

    if (this.primaryAddress2 === null) {
      this.primaryAddress2 = '';
    }

    const consUrl = '&cons_id=' + this.dataService.storageConsID;
    const ssoUrl = '&sso_auth_token=' + this.dataService.storageToken;
    const firstNameUrl = '&name.first=' + this.firstName;
    const lastNameUrl = '&name.last=' + this.lastName;
    const address1Url = '&primary_address.street1=' + this.primaryAddress1;
    const address2Url = '&primary_address.street2=' + this.primaryAddress2;
    const cityUrl = '&primary_address.city=' + this.primaryCity;
    const stateUrl = '&primary_address.state=' + this.primaryState;
    const zipUrl = '&primary_address.zip=' + this.primaryZip;
    const genderUrl = '&gender=' + this.gender;

    this.method = 'CRConsAPI?method=update&api_key=cfrca&v=1.0&response_format=json' + consUrl + ssoUrl + firstNameUrl + lastNameUrl + genderUrl + address1Url + address2Url + cityUrl + stateUrl + zipUrl;
    this.http.post(this.dataService.convioURL + this.method, null)
      .subscribe(res => {
        this.updateUserResults = res;
        // console.log(this.updateUserResults);

        this.snackBar.open('Your information has been saved!', 'Close', {
          duration: 3500,
          extraClasses: ['saved-info']
        });

      }, (err) => {
        if (err) {
          this.snackBar.open('There was an error while trying to save. Please check the form.', 'Close', {
            duration: 3500,
            extraClasses: ['error-info']
          });
        }
      });
  }

  // Check Logged In State
  isLoggedIn() {
    return this.dataService.isLoggedIn();
  }

  // Get the current Flowstep
  getFlowStep() {
    const token = localStorage.getItem('token');
    this.method = 'CRTeamraiserAPI?method=getFlowStep&api_key=cfrca&v=1.0&response_format=json&fr_id=' + this.dataService.eventID + '&sso_auth_token=' + token;
    this.http.post(this.dataService.convioURL + this.method, null)
      .subscribe(res => {
        this.flowStepResults = res;
        this.getFlowStepNumber = this.flowStepResults.getFlowStepResponse.flowStep;

        // console.log(this.getFlowStepNumber);

        // Checking the participants flow step to prevent user from skipping a flowstep
        if (this.getFlowStepNumber !== this.flowStep) {

          // If flowstep does not match, show error message and send them back to the previous page/flowstep.
          this.snackBar.open('You have been redirected to your previously saved location.', 'Close', {
            duration: 3500,
            extraClasses: ['routing-info']
          });

          // Check the Flowstep, if matched, send them to the proper route
          if (this.getFlowStepNumber === '0') {
            this.router.navigate(['/step-02']);
          }
          if (this.getFlowStepNumber === '1') {
            this.router.navigate(['/step-02']);
          }
          if (this.getFlowStepNumber === '2') {
            this.router.navigate(['/step-03']);
          }
          if (this.getFlowStepNumber === '3') {
            this.router.navigate(['/step-04']);
          }
          if (this.getFlowStepNumber === '4') {
            this.router.navigate(['/step-05']);
          }
          if (this.getFlowStepNumber === '5') {
            this.router.navigate(['/step-06']);
          }
          if (this.getFlowStepNumber === '6') {
            this.router.navigate(['/step-07']);
          }
          if (this.getFlowStepNumber === '7') {
            this.router.navigate(['/step-08']);
          }
          if (this.getFlowStepNumber === '8') {
            this.router.navigate(['/step-09']);
          }
        }

      }, (err) => {
        // console.log(err);
        if (err) {
          this.snackBar.open('There was an error, please login again.', 'Close', {
            duration: 3500,
            extraClasses: ['error-info']
          });
        }

        this.dataService.logOut();
      });
  }

  // Get user's checkin status
  getCheckInStatus() {
    this.method = 'CRTeamraiserAPI?method=getRegistration&api_key=cfrca&v=1.0&response_format=json&fr_id='+ this.dataService.eventID + '&sso_auth_token=' + this.dataService.storageToken;
    this.http.post(this.dataService.convioURL + this.method, null)
      .subscribe(res => {
        // Results from the API Call
        this.dataService.regResponse = res;

        this.dataService.checkInStatus = this.dataService.regResponse.getRegistrationResponse.registration.checkinStatus;

        // console.log(this.dataService.checkInStatus);

        this.updateFlowStep();
      }, (error) => { });
  }

  // Get the Survey Responses
  // getSurveyRes() {
  //   this.method = 'CRTeamraiserAPI?method=getSurveyResponses&api_key=cfrca&v=1.0&fr_id=' + this.dataService.eventID + '&sso_auth_token=' + this.dataService.ssoToken + '&survey_id=' + this.dataService.surveyID + '&response_format=json';
  //   this.http.post(this.dataService.convioURL + this.method, null)
  //     .subscribe(res => {
  //       this.surveyResults = res;
  //
  //       // For Loop to get Survey Data and set it to the correct variables (to prevent data being saved as undefined or null)
  //       // for (let res of this.surveyResults.getSurveyResponsesResponse.responses) {
  //       //
  //       //   // Gender Select
  //       //   if (res.questionId === this.dataService.question30) {
  //       //     if (this.genderRes === undefined) {
  //       //       this.genderRes = '';
  //       //     }
  //       //     if (res.responseValue !== undefined || res.responseValue !== null) {
  //       //       this.genderRes = res.responseValue;
  //       //     }
  //       //     if (Object.keys(res.responseValue).length === 0) {
  //       //       this.genderRes = '';
  //       //     }
  //       //   }
  //       //
  //       // }
  //     });
  // }

  // Update the Survey Responses
  // updateSurveyRes() {
  //   const updateSurveyResponsesUrl = 'https://secure2.convio.net/cfrca/site/CRTeamraiserAPI?method=updateSurveyResponses&api_key=cfrca&v=1.0&response_format=json&fr_id='+ this.dataService.eventID + '&survey_id=' + this.dataService.surveyID;
  //
  //   const genderSelect = '&question_' + this.dataService.question30 + '=' + this.genderRes;
  //   this.http.post(updateSurveyResponsesUrl + genderSelect + '&sso_auth_token=' + this.dataService.ssoToken, null)
  //     .subscribe(res => {
  //         // console.log(res);
  //         this.snackBar.open('Your information has been saved!', 'Close', {
  //           duration: 3500,
  //           extraClasses: ['saved-info']
  //         });
  //       },
  //       (error) => {
  //         console.log(error);
  //         // this.router.navigate(['/step-01']);
  //       });
  // }

  // Update the Flow Step
  updateFlowStep() {
    if (this.dataService.getCheckInStatus) {
      // console.log(this.dataService.checkInStatus);
    }

    const paidStatus = this.dataService.checkInStatus === 'paid';
    const completeStatus = this.dataService.checkInStatus === 'complete';
    const committedStatus = this.dataService.checkInStatus === 'committed';

    if (paidStatus || completeStatus || committedStatus) {
      this.dataService.method = 'CRTeamraiserAPI?method=updateRegistration&api_key=cfrca&v=1.0' + '&fr_id=' + this.dataService.eventID + '&sso_auth_token=' + this.dataService.storageToken + '&checkin_status=' + this.dataService.checkInStatus + '&flow_step=' + this.flowStep + '&response_format=json';
    } else {
      this.dataService.method = 'CRTeamraiserAPI?method=updateRegistration&api_key=cfrca&v=1.0' + '&fr_id=' + this.dataService.eventID + '&sso_auth_token=' + this.dataService.storageToken + '&checkin_status=started' + '&flow_step=' + this.flowStep + '&response_format=json';
    }

    this.http.post(this.dataService.convioURL + this.dataService.method, null)
      .subscribe(res => {
        this.updateRegRes = res;
      });
  }

  updateFlowStepNext() {

    const paidStatus = this.dataService.checkInStatus === 'paid';
    const completeStatus = this.dataService.checkInStatus === 'complete';
    const committedStatus = this.dataService.checkInStatus === 'committed';

    if (paidStatus || completeStatus || committedStatus) {
      this.dataService.method = 'CRTeamraiserAPI?method=updateRegistration&api_key=cfrca&v=1.0' + '&fr_id=' + this.dataService.eventID + '&sso_auth_token=' + this.dataService.storageToken + '&checkin_status=' + this.dataService.checkInStatus + '&flow_step=2' + '&response_format=json';
    } else {
      this.dataService.method = 'CRTeamraiserAPI?method=updateRegistration&api_key=cfrca&v=1.0' + '&fr_id=' + this.dataService.eventID + '&sso_auth_token=' + this.dataService.storageToken + '&checkin_status=started' + '&flow_step=2' + '&response_format=json';
    }


    this.http.post(this.dataService.convioURL + this.dataService.method, null)
      .subscribe((res) => {
        this.updateRegRes = res;
        this.router.navigate(['/step-03']);
      }, (err) => {
        if (err) {
          this.snackBar.open('There was an error, please login again.', 'Close', {
            duration: 3500,
            extraClasses: ['error-info']
          });
          this.dataService.logOut();
        }
      });
  }

  openDialog() {
    this.dialog.open(Step02DialogComponent, {
      width: '600px'
    });
  }
}

@Component({
  selector: 'app-step-02-dialog',
  templateUrl: './step-02-dialog.html',
  styleUrls: ['./step-02.component.scss']
})
export class Step02DialogComponent {
  firstName: string;
  constructor
  (@Inject(MAT_DIALOG_DATA)
   public data: any,
   public dialogRef: MatDialogRef<Step02DialogComponent>,
   private dataService: DataService) {
    dataService.getUserInfo();
    this.firstName = dataService.firstName;
  }
  onNoClick(): void {
    this.dialogRef.close();
  }
}
