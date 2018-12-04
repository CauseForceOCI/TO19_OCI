import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { Router } from '@angular/router';
import { FormGroup, FormControl, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { HttpClient, HttpRequest, HttpEvent, HttpEventType } from '@angular/common/http';
import { ErrorStateMatcher } from '@angular/material/core';

import { DataService } from '../data.service';

/** Error when invalid control is dirty, touched, or submitted. */
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'app-step-03',
  templateUrl: './step-03.component.html',
  styleUrls: ['./step-03.component.scss']
})
export class Step03Component implements OnInit, OnDestroy, AfterViewInit  {

  step03Form: FormGroup;

  matcher = new MyErrorStateMatcher();

  buttonStatus:boolean = true;

  // Flowstep
  flowStep = '2';
  flowStepResults: any = {};
  getFlowStepNumber: string;

  // Results from HTTP calls set as Objects for OOP
  surveyResults: any = {};
  regRes: any = {};

  // DOM Element Responses
  cancerRes: string;
  packetRes: string;
  vegRes: string;
  shuttleRes: string;
  shuttleRes2: string;
  shuttleRes3: string;
  shuttleRes4: string;
  shuttleRes5: string;
  shuttleRes6: string;
  bikeRes1: string;
  bikeRes2: string;
  bikeRes3: string;
  jerseyRes: string;
  attendanceRes: string;
  routeRes: string;
  experiencedRiderRes: string;
  glutenRes: string;

  emergencyName:string;
  emergencyPhone:string;

  // Variable to hide elements
  hideMe: boolean = true;

  // Select Options for Yes/No
  matSelect = [
    {value: 'Yes', viewValue: 'Yes'},
    {value: 'No', viewValue: 'No'}
  ];

  noSelect = [
    {value: 'No', viewValue: 'No'}
  ];

  // Select Options for Jesey Sizes
  jerseySelect = [
    {value: 'XS', viewValue: 'XS'},
    {value: 'S', viewValue: 'S'},
    {value: 'M', viewValue: 'M'},
    {value: 'L', viewValue: 'L'},
    {value: 'XL', viewValue: 'XL'},
    {value: '2XL', viewValue: '2XL'},
    {value: '3XL', viewValue: '3XL'}
  ];

  // Radio Button Options
  routes = [
    {value: '1', viewValue: 'Classic Route'},
    {value: '2', viewValue: 'Challenge Route.'},
    {value: '3', viewValue: 'Crew'}
  ];

  // Crew Member Only Routes
  routesCrew = [
    {value: '3', viewValue: 'Crew'}
  ];

  // Years attended Options
  years = [
    {value: '1', viewValue: '1'},
    {value: '2', viewValue: '2'},
    {value: '3', viewValue: '3'},
    {value: '4', viewValue: '4'},
    {value: '5', viewValue: '5'},
    {value: '6', viewValue: '6'},
    {value: '7', viewValue: '7'},
    {value: '8', viewValue: '8'},
    {value: '9', viewValue: '9'},
    {value: '10', viewValue: '10'}
  ];

  // Specifying API Method Variable
  method: string;

  // Variable for Timeout
  timeOut: any;
  timeOut2: any;

  constructor(private dataService: DataService,
              private route: Router,
              private http: HttpClient,
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
        this.dataService.logOut();
      }, 240000);
    }, 858000);

    this.step03Form = new FormGroup({
      emergencyName: new FormControl(this.emergencyName, Validators.required),
      emergencyPhone: new FormControl(this.emergencyPhone, Validators.required),
      yearsAttended: new FormControl(null, Validators.required),
      cancerSurvivor: new FormControl(this.cancerRes, Validators.required),
      packetPickup: new FormControl(this.packetRes, Validators.required),
      vegMeals: new FormControl(this.vegRes, Validators.required),
      jerseySizes: new FormControl(this.jerseyRes, Validators.required),
      shuttle1: new FormControl(this.shuttleRes, Validators.required),
      shuttle2: new FormControl(this.shuttleRes2, Validators.required),
      shuttle3: new FormControl(this.shuttleRes3, Validators.required),
      shuttle4: new FormControl(this.shuttleRes4, Validators.required),
      // shuttle5: new FormControl(this.shuttleRes5, Validators.required),
      // glutenFree: new FormControl(this.glutenRes, Validators.required)
      // shuttle6: new FormControl(this.shuttleRes6, Validators.required),
      // bike1: new FormControl(this.bikeRes1, Validators.required),
      // bike2: new FormControl(this.bikeRes2, Validators.required),
      // bike3: new FormControl(this.bikeRes3, Validators.required)
      // experienced: new FormControl(this.experiencedRiderRes, Validators.required)
    });

    // Checking logged in state, if they are logged in run regInfo() and getUserInfo() functions from the global dataService.
    if (this.dataService.isLoggedIn() === true && this.dataService.tokenExpired === false) {

      // Get the current flowstep
      this.getFlowStep();

      this.dataService.getParticipationType();

    } else if (this.dataService.storageToken === undefined) {
      this.snackBar.open('Login session expired, please login again.', 'Close', {
        duration: 3500,
        extraClasses: ['error-info']
      });
      this.route.navigate(['/step-01']);

    } else {
      // if not logged in, go back to step 1 (login page)
      this.snackBar.open('You are not logged in, please login.', 'Close', {
        duration: 3500,
        extraClasses: ['error-info']
      });
      this.route.navigate(['/step-01']);
    }

  }

  // Clear the timeout function upon entering a new route
  ngOnDestroy() {
    clearTimeout(this.timeOut);
  }

  ngAfterViewInit() {
    // console.log(this.dataService.participationType);
    // console.log(this.step03Form);
  }

  // Get the Survey Responses
  getSurveyRes() {
    this.method = 'CRTeamraiserAPI?method=getSurveyResponses&api_key=cfrca&v=1.0&fr_id=' + this.dataService.eventID + '&sso_auth_token=' + this.dataService.ssoToken + '&survey_id=' + this.dataService.surveyID + '&response_format=json';
    this.http.post(this.dataService.convioURL + this.method, null)
      .subscribe(res => {
        this.surveyResults = res;

        // For Loop to get Survey Data and set it to the correct variables (to prevent data being saved as undefined or null)
        for (let res of this.surveyResults.getSurveyResponsesResponse.responses) {

          // Cancer Survivor
          if (res.questionId === this.dataService.question14) {
            const partCrew = this.dataService.participationType === 'Crew';
            // console.log(this.dataService.participationType);

            if (this.cancerRes === undefined) {
              this.cancerRes = '';
            }
            if (res.responseValue !== undefined || res.responseValue !== null) {
              this.cancerRes = res.responseValue;
            }
            if (Object.keys(res.responseValue).length === 0) {
              this.cancerRes = '';
            }

            if (partCrew) {
              this.cancerRes = 'No';
            }
          }

          // Vegetarian Meals
          if (res.questionId === this.dataService.question15) {
            if (this.vegRes === undefined) {
              this.vegRes = '';
            }
            if (res.responseValue !== undefined || res.responseValue !==  null) {
              this.vegRes = res.responseValue;
            }
            if (Object.keys(res.responseValue).length === 0) {
              this.vegRes = '';
            }
          }

          // How many years have you ridden with The Ride?
          if (res.questionId === this.dataService.question1) {
            if (this.attendanceRes === undefined) {
              this.attendanceRes = '';
            }
            if (res.responseValue !== undefined || res.responseValue !== null) {
              this.attendanceRes = res.responseValue;
            }
            if (Object.keys(res.responseValue).length === 0) {
              this.attendanceRes = '';
            }
          }

          // Jersey Selection
          if (res.questionId === this.dataService.question18) {
            if (this.jerseyRes === '[object Object]') {
              this.jerseyRes = '';
            }
            if (this.jerseyRes === undefined) {
              this.jerseyRes = '';
              // this.jerseyRes = res.responseValue;
            }
            if (res.responseValue !== undefined || res.responseValue !== null) {
              this.jerseyRes = res.responseValue;
            }
            if (Object.keys(res.responseValue).length === 0) {
              this.jerseyRes = '';
            }
          }

          // Shuttle 1 Selection
          if (res.questionId === this.dataService.question19) {
            if (this.shuttleRes === undefined || this.shuttleRes === null) {
              this.shuttleRes = '';
              // this.shuttleRes = res.responseValue;
            }
            if (res.responseValue !== undefined || res.responseValue !== null) {
              this.shuttleRes = res.responseValue;
            }
            if (Object.keys(res.responseValue).length === 0) {
              this.shuttleRes = '';
            }
          }

          // Shuttle 2 Selection
          if (res.questionId === this.dataService.question20) {
            if (this.shuttleRes2 === undefined || this.shuttleRes2 === null) {
              this.shuttleRes2 = '';
              // this.shuttleRes2 = res.responseValue;
            }
            if (res.responseValue !== undefined || res.responseValue !== null) {
              this.shuttleRes2 = res.responseValue;
            }
            if (Object.keys(res.responseValue).length === 0) {
              this.shuttleRes2 = '';
            }
          }

          // Shuttle 3 Selection
          if (res.questionId === this.dataService.question21) {
            if (this.shuttleRes3 === undefined || this.shuttleRes3 === null) {
              this.shuttleRes3 = '';
              // this.shuttleRes3 = res.responseValue;
            }
            if (res.responseValue !== undefined || res.responseValue !== null) {
              this.shuttleRes3 = res.responseValue;
            }
            if (Object.keys(res.responseValue).length === 0) {
              this.shuttleRes3 = '';
            }
          }

          // Shuttle 4 Selection
          if (res.questionId === this.dataService.question22) {
            if (this.shuttleRes4 === undefined || this.shuttleRes4 === null) {
              this.shuttleRes4 = '';
              // this.shuttleRes4 = res.responseValue;
            }
            if (res.responseValue !== undefined || res.responseValue !== null) {
              this.shuttleRes4 = res.responseValue;
            }
            if (Object.keys(res.responseValue).length === 0) {
              this.shuttleRes4 = '';
            }
          }

          // Shuttle 5 Selection
          if (res.questionId === this.dataService.question23) {
            if (this.shuttleRes5 === undefined || this.shuttleRes5 === null) {
              this.shuttleRes5 = '';
              // this.shuttleRes5 = res.responseValue;
            }
            if (res.responseValue !== undefined || res.responseValue !==  null) {
              this.shuttleRes5 = res.responseValue;
            }
            if (Object.keys(res.responseValue).length === 0) {
              this.shuttleRes5 = '';
            }
          }

          // Shuttle 6 Selection
          if (res.questionId === this.dataService.question24) {
            if (this.shuttleRes6 === undefined || this.shuttleRes6 === null) {
              this.shuttleRes6 = '';
              // this.shuttleRes6 = res.responseValue;
            }
            if (res.responseValue !== undefined || res.responseValue !==  null) {
              this.shuttleRes6 = res.responseValue;
            }
            if (Object.keys(res.responseValue).length === 0) {
              this.shuttleRes6 = '';
            }
          }

          // Packet Pickup
          if (res.questionId === this.dataService.question28) {
            const partCrew = this.dataService.participationType === 'Crew';

            if (this.packetRes === undefined || this.packetRes === null) {
              this.packetRes = '';
              // this.packetRes = res.responseValue;
            }
            if (res.responseValue !== undefined || res.responseValue !==  null) {
              this.packetRes = res.responseValue;
            }
            if (Object.keys(res.responseValue).length === 0) {
              this.packetRes = '';
            }

            if (partCrew) {
              this.packetRes = 'No';
            }
          }

          // // Experienced Rider (if available)
          // if (res.questionId === this.dataService.question26) {
          //   this.experiencedRiderRes = res.responseValue;
          //   if (this.experiencedRiderRes === undefined || null) {
          //     this.experiencedRiderRes = res.responseValue;
          //   }
          // }
        }
      });
  }

  // Update the Survey Responses
  updateSurveyRes() {

    for (const resp of this.surveyResults.getSurveyResponsesResponse.responses) {

      // Cancer Survivor
      if (resp.questionId === this.dataService.question14) {
        if (this.cancerRes === undefined) {
          this.cancerRes = resp.responseValue;
        }
      }

      // Vegetarian Meals
      if (resp.questionId === this.dataService.question15) {
        if (this.vegRes === undefined) {
          this.vegRes = resp.responseValue;
        }
      }

      // How many years have you ridden with The Ride?
      if (resp.questionId === this.dataService.question1) {
        if (this.attendanceRes === undefined || this.attendanceRes === null) {
          this.attendanceRes = resp.responseValue;
        }
      }

      // Jersey Selection
      if (resp.questionId === this.dataService.question18) {
        if (this.jerseyRes === undefined || this.jerseyRes === null) {
          this.jerseyRes = resp.responseValue;
        }
      }

      // Shuttle 1 Selection
      if (resp.questionId === this.dataService.question19) {
        if (this.shuttleRes === undefined || this.shuttleRes === null) {
          this.shuttleRes = resp.responseValue;
        }
      }

      // Shuttle 2 Selection
      if (resp.questionId === this.dataService.question20) {
        if (this.shuttleRes2 === undefined || this.shuttleRes2 === null) {
          this.shuttleRes2 = resp.responseValue;
        }
      }

      // Shuttle 3 Selection
      if (resp.questionId === this.dataService.question21) {
        if (this.shuttleRes3 === undefined || this.shuttleRes3 ===  null) {
          this.shuttleRes3 = resp.responseValue;
        }
      }

      // Shuttle 4 Selection
      if (resp.questionId === this.dataService.question22) {
        if (this.shuttleRes4 === undefined || this.shuttleRes4 === null) {
          this.shuttleRes4 = resp.responseValue;
        }
      }

      // Shuttle 5 Selection
      if (resp.questionId === this.dataService.question23) {
        if (this.shuttleRes5 === undefined || this.shuttleRes5 ===  null) {
          this.shuttleRes5 = resp.responseValue;
        }
      }

      // Shuttle 6 Selection
      if (resp.questionId === this.dataService.question24) {
        if (this.shuttleRes6 === undefined || this.shuttleRes6 === null) {
          this.shuttleRes6 = resp.responseValue;
        }
      }

      // Packet Pickup
      if (resp.questionId === this.dataService.question28) {
        if (this.packetRes === undefined || this.packetRes === null) {
          this.packetRes = resp.responseValue;
        }
      }

      // Experienced Rider (if used)
      // if (resp.questionId === this.dataService.question26) {
      //   if (this.experiencedRiderRes === undefined || this.experiencedRiderRes ===  null) {
      //     this.experiencedRiderRes = resp.responseValue;
      //   }
      // }

      // Packet Pickup (if used)
      // if (resp.questionId === this.dataService.question27) {
      //   if (this.packetRes === undefined || this.packetRes ===  null) {
      //     this.packetRes = resp.responseValue;
      //   }
      // }
    }

    const updateSurveyResponsesUrl = 'https://secure2.convio.net/cfrca/site/CRTeamraiserAPI?method=updateSurveyResponses&api_key=cfrca&v=1.0&response_format=json&fr_id='+ this.dataService.eventID + '&survey_id=' + this.dataService.surveyID;

    const question_attendance = '&question_' + this.dataService.question1 + '=' + this.attendanceRes;
    const question_cancer = '&question_' + this.dataService.question14 + '=' + this.cancerRes;
    const question_veg = '&question_'+ this.dataService.question15 + '=' + this.vegRes;
    // const question_gluten = '&question_'+ this.dataService.question31 + '=' + this.glutenRes;
    const question_jersey = '&question_' + this.dataService.question18 + '=' + this.jerseyRes;
    const question_shuttle1 = '&question_' + this.dataService.question19 + '=' + this.shuttleRes;
    const question_shuttle2 = '&question_' + this.dataService.question20 + '=' + this.shuttleRes2;
    const question_shuttle3 = '&question_' + this.dataService.question21 + '=' + this.shuttleRes3;
    const question_shuttle4 = '&question_' + this.dataService.question22 + '=' + this.shuttleRes4;
    const question_shuttle5 = '&question_' + this.dataService.question23 + '=' + this.shuttleRes5;
    // const question_shuttle6 = '&question_' + this.dataService.question24 + '=' + this.shuttleRes6;
    // const question_bike1 = '&question_' + this.dataService.question25 + '=' + this.bikeRes1;
    // const question_bike2 = '&question_' + this.dataService.question26 + '=' + this.bikeRes2;
    // const question_bike3 = '&question_' + this.dataService.question27 + '=' + this.bikeRes3;
    const question_packet = '&question_' + this.dataService.question28 + '=' + this.packetRes;
    // const question_87021 = '&question_87021=' + this.routeRes;
    // const question_87022 = '&question_87022=' + this.experiencedRiderRes;

    this.http.post(updateSurveyResponsesUrl + question_attendance  + question_cancer + question_veg + question_jersey + question_shuttle1 + question_shuttle2 + question_shuttle3 + question_shuttle4 + question_shuttle5 + question_packet + '&sso_auth_token=' + this.dataService.ssoToken, null)
      .subscribe(res => {
          // console.log(res);
          this.updateReg();
          this.route.navigate(['/step-05']);
        },
        (error) => {
          console.log(error);
          this.route.navigate(['/step-01']);
        });
  }

  // Save Current Survey Answers (save for later)
  saveSurveyRes() {

    // Checking to see if data in the input is null or undefined, if so send as blank (to prevent errors in survey)
    if (this.dataService.emergencyName === null || undefined) {
      this.dataService.emergencyName = '';
    }

    if (this.dataService.emergencyPhone === null || undefined) {
      this.dataService.emergencyPhone = '';
    }

    if (this.routeRes === '[object Object]') {
      this.routeRes = '';
    }


    const updateSurveyResponsesUrl = 'https://secure2.convio.net/cfrca/site/CRTeamraiserAPI?method=updateSurveyResponses&api_key=cfrca&v=1.0&response_format=json&fr_id='+ this.dataService.eventID + '&survey_id=' + this.dataService.surveyID;

    const question_attendance = '&question_' + this.dataService.question1 + '=' + this.attendanceRes;
    const question_cancer = '&question_' + this.dataService.question14 + '=' + this.cancerRes;
    const question_veg = '&question_'+ this.dataService.question15 + '=' + this.vegRes;
    // const question_gluten = '&question_'+ this.dataService.question31 + '=' + this.glutenRes;
    const question_jersey = '&question_' + this.dataService.question18 + '=' + this.jerseyRes;
    const question_shuttle1 = '&question_' + this.dataService.question19 + '=' + this.shuttleRes;
    const question_shuttle2 = '&question_' + this.dataService.question20 + '=' + this.shuttleRes2;
    const question_shuttle3 = '&question_' + this.dataService.question21 + '=' + this.shuttleRes3;
    const question_shuttle4 = '&question_' + this.dataService.question22 + '=' + this.shuttleRes4;
    const question_shuttle5 = '&question_' + this.dataService.question23 + '=' + this.shuttleRes5;
    // const question_shuttle6 = '&question_' + this.dataService.question24 + '=' + this.shuttleRes6;
    // const question_bike1 = '&question_' + this.dataService.question25 + '=' + this.bikeRes1;
    // const question_bike2 = '&question_' + this.dataService.question26 + '=' + this.bikeRes2;
    // const question_bike3 = '&question_' + this.dataService.question27 + '=' + this.bikeRes3;
    const question_packet = '&question_' + this.dataService.question28 + '=' + this.packetRes;
    // const question_87022 = '&question_87022=' + this.experiencedRiderRes;

    this.http.post(updateSurveyResponsesUrl + question_attendance  + question_cancer + question_veg + question_jersey + question_shuttle1 + question_shuttle2 + question_shuttle3 + question_shuttle4 + question_shuttle5 + question_packet + '&sso_auth_token=' + this.dataService.ssoToken, null)
      .subscribe(res => {
          this.saveUpdateReg();
        },
        (error) => {
          console.log(error);
          this.snackBar.open('There was an error while trying to save. Please check the form.', 'Close', {
            duration: 3500,
            extraClasses: ['error-info']
          });
          this.route.navigate(['/step-01']);
        });
  }

  // Update the Registration Information
  updateReg() {
    if (this.emergencyName === null || undefined) {
      this.emergencyName = '';
    }

    if (this.emergencyPhone === null || undefined) {
      this.emergencyPhone = '';
    }

    this.flowStep = '4';

    const paidStatus = this.dataService.checkInStatus === 'Paid';
    const completeStatus = this.dataService.checkInStatus === 'Complete';
    const committedStatus = this.dataService.checkInStatus === 'Committed';

    if (paidStatus || completeStatus || committedStatus) {
      this.method = 'CRTeamraiserAPI?method=updateRegistration&api_key=cfrca&v=1.0' + '&fr_id=' + this.dataService.eventID + '&sso_auth_token=' + this.dataService.ssoToken + '&checkin_status=' + this.dataService.checkInStatus + '&flow_step=' + this.flowStep + '&emergency_name=' + this.dataService.emergencyName + '&emergency_phone=' + this.dataService.emergencyPhone + '&response_format=json';
    } else {
      this.method = 'CRTeamraiserAPI?method=updateRegistration&api_key=cfrca&v=1.0' + '&fr_id=' + this.dataService.eventID + '&sso_auth_token=' + this.dataService.ssoToken + '&flow_step=' + this.flowStep + '&emergency_name=' + this.dataService.emergencyName + '&emergency_phone=' + this.dataService.emergencyPhone + '&response_format=json';
    }


    this.http.post(this.dataService.convioURL + this.method, null)
      .subscribe(res => {
        this.snackBar.open('Your information has been saved!', 'Close', {
          duration: 3500,
          extraClasses: ['saved-info']
        });
      }, (error) => {
        if (error) {
          this.snackBar.open('Sorry, there was an error, please try again.', 'Close', {
            duration: 3500,
            extraClasses: ['error-info']
          });
        }
      });
  }

  // Update the Registration Information
  saveUpdateReg() {
    if (this.emergencyName === null || undefined) {
      this.emergencyName = '';
    }

    if (this.emergencyPhone === null || undefined) {
      this.emergencyPhone = '';
    }

    this.flowStep = '2';

    const paidStatus = this.dataService.checkInStatus === 'Paid';
    const completeStatus = this.dataService.checkInStatus === 'Complete';
    const committedStatus = this.dataService.checkInStatus === 'Committed';

    if (paidStatus || completeStatus || committedStatus) {
      this.method = 'CRTeamraiserAPI?method=updateRegistration&api_key=cfrca&v=1.0' + '&fr_id=' + this.dataService.eventID + '&sso_auth_token=' + this.dataService.storageToken + '&checkin_status=' + this.dataService.checkInStatus + '&flow_step=' + this.flowStep + '&emergency_name=' + this.dataService.emergencyName + '&emergency_phone=' + this.dataService.emergencyPhone + '&response_format=json';
    } else {
      this.method = 'CRTeamraiserAPI?method=updateRegistration&api_key=cfrca&v=1.0' + '&fr_id=' + this.dataService.eventID + '&sso_auth_token=' + this.dataService.storageToken + '&flow_step=' + this.flowStep + '&emergency_name=' + this.dataService.emergencyName + '&emergency_phone=' + this.dataService.emergencyPhone + '&response_format=json';
    }

    this.http.post(this.dataService.convioURL + this.method, null)
      .subscribe(res => {
        this.snackBar.open('Your information has been saved!', 'Close', {
          duration: 3500,
          extraClasses: ['saved-info']
        });
      }, (error) => {
        if (error) {
          this.snackBar.open('Sorry, there was an error, please try again.', 'Close', {
            duration: 3500,
            extraClasses: ['error-info']
          });
        }
      });
  }

  // Get the current Flowstep
  getFlowStep() {
    const token = localStorage.getItem('token');
    this.method = 'CRTeamraiserAPI?method=getFlowStep&api_key=cfrca&v=1.0&response_format=json&fr_id=' + this.dataService.eventID + '&sso_auth_token=' + token;
    this.http.post(this.dataService.convioURL + this.method, null)
      .subscribe(res => {
        this.flowStepResults = res;
        this.getFlowStepNumber = this.flowStepResults.getFlowStepResponse.flowStep;

        // Checking the participants flow step to prevent user from skipping a flowstep
        if (this.getFlowStepNumber === this.flowStep) {
          // If the flow step matches to where they are supposed to be, then run the functions for the page below
          this.dataService.getRegInfo();
          this.getSurveyRes();

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
        this.snackBar.open('There was an error, please login again.', 'Close', {
          duration: 3500,
          extraClasses: ['error-info']
        });
        this.dataService.logOut();
      });
  }

  // Update the current Flowstep
  previousFlowStep() {
    // this.flowStep = '1';

    const paidStatus = this.dataService.checkInStatus === 'Paid';
    const completeStatus = this.dataService.checkInStatus === 'Complete';
    const committedStatus = this.dataService.checkInStatus === 'Committed';

    if (paidStatus || completeStatus || committedStatus) {
      this.dataService.method = 'CRTeamraiserAPI?method=updateRegistration&api_key=cfrca&v=1.0' + '&fr_id=' + this.dataService.eventID + '&sso_auth_token=' + this.dataService.ssoToken + '&checkin_status=' + this.dataService.checkInStatus + '&flow_step=1' + '&response_format=json';
    } else {
      this.dataService.method = 'CRTeamraiserAPI?method=updateRegistration&api_key=cfrca&v=1.0' + '&fr_id=' + this.dataService.eventID + '&sso_auth_token=' + this.dataService.ssoToken + '&flow_step=1' + '&response_format=json';
    }


    this.http.post(this.dataService.convioURL + this.dataService.method, null)
      .subscribe(res => {
        // console.log('Flow step updated.')
        this.route.navigate(['/step-02']);
      }, (err) => {
        if (err) {
            this.snackBar.open('There was an unknown error.', 'Close', {
              duration: 3500,
              extraClasses: ['error-info']
            });
          this.dataService.logOut();
        }
      });
  }

}
