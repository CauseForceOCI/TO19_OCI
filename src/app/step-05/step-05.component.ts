import { Component, OnInit, OnDestroy, ViewChild, HostListener, Renderer2, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, FormGroup, Validators  } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

/* Angular Material */
import { MatSnackBar } from '@angular/material';

/* Data Service */
import { DataService } from '../data.service';


@Component({
  selector: 'app-step-05',
  templateUrl: './step-05.component.html',
  styleUrls: ['./step-05.component.scss']
})
export class Step05Component implements OnInit, OnDestroy {

  // Flowstep
  flowStep = '4';
  flowStepResults: any= {};
  getFlowStepNumber: string;

  // ViewChild to connect DOM Element to Typescript
  @ViewChild('videoPlayer') videoplayer: any;
  // @ViewChild('waiverTxt') waiverText: any;

  // Defining the formgroup
  waiverForm: FormGroup;

  // Variables for DOM Manipulation
  fullName: string;
  ageResponse: boolean;
  ageResponseVal: string;
  videoResponse: string;
  videoWatched = false;
  scrolledBottom = false;

  // Survey results
  surveyResults: any= {};

  // Admin panel data
  adminResults: any= {};

  // Variable for Timeout
  timeOut: any;
  timeOut2: any;

  constructor(private data: DataService,
              private http: HttpClient,
              private route: Router,
              public snackBar: MatSnackBar) {
  }

  ngOnInit() {

    window.scrollTo(0, 0);

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

    // this.adminAPI();

    // Checking logged in state, and running correct functions
    if (this.data.isLoggedIn() === true && this.data.tokenExpired === false) {
      // console.log('You are logged in!');

      // Run getRegInfo function from the dataService to make sure you capture the user's checkin status to be used for other calls (such as updateflowStep and previousFlowstep, etc)..
      this.data.getRegInfo();
      this.getFlowStep();

      // this.dataService.getParticipationType();
    } else if (this.data.storageToken === undefined) {
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

    // Defining the FormGroup with the DOM Elements and Validators
    this.waiverForm = new FormGroup({
      fullName: new FormControl('', [Validators.required, Validators.max(40), Validators.min(5)]),
      ageResponse: new FormControl('', Validators.required)
    });

  }

  // Clear the timeout function upon entering a new route
  ngOnDestroy() {
    clearTimeout(this.timeOut);
    clearTimeout(this.timeOut2);
  }

  // Admin Panel API call
  adminAPI() {
    this.http.get('http://www.conquercancer.ca/site/PageServer?pagename=to18_oci_api&pgwrap=n')
      .subscribe(res => {
        // console.log(res);
      }, (error) => {
        console.log('there was an error');
        console.log(error);
      });
  }

  // Checking the Waiver Scroll position and setting scrolledBottom boolean to true if scrolled more than or equal to 950
  // waiverScroll() {
  // 	if (this.waiverText.nativeElement.scrollY >= 950) {
  // 		this.scrolledBottom = true;
  // 	}
  // }

  // Function to prevent user from seeking the video
  seekingVideo(event) {
    const currentTime = 0;

    if (currentTime < event.target.currentTime) {
      event.target.currentTime = currentTime;
    }
  }

  vidEnded() {
    this.videoResponse = 'Yes';
    this.videoWatched = true;
  }

  playVideo(event: any) {
    this.videoplayer.nativeElement.play();
  }

  pauseVideo(event: any) {
    this.videoplayer.nativeElement.pause();
  }

  getSurveyRes() {
    this.data.method = 'CRTeamraiserAPI?method=getSurveyResponses&api_key=cfrca&v=1.0&fr_id=' + this.data.eventID + '&survey_id=' + this.data.surveyID + '&sso_auth_token=' + this.data.ssoToken + '&response_format=json';
    this.http.post(this.data.convioURL + this.data.method, null)
      .subscribe(res => {
          this.surveyResults = res;
          // console.log(this.surveyResults);

          // For loop to loop through the responded data from API call
          for (const data of this.surveyResults.getSurveyResponsesResponse.responses) {
            // If questionId is same as waiver question ID in Survey then check if fullName variable is undefined or null, if so set it as the response value else if it's length is equil to 0 or no reponseValue, then set it to a blank string

            // Waiver and Release Full Name
            if (data.questionId === this.data.question2) {
              if (this.fullName === undefined || null) {
                this.fullName = data.responseValue;
              }
              if (Object.keys(data.responseValue).length === 0) {
                this.fullName = '';
              }
            }

            // 18 Years Check Box
            if (data.questionId === this.data.question3) {
              if (this.ageResponseVal === undefined || null) {
                this.ageResponseVal = data.responseValue;
              }
              if (Object.keys(data.responseValue).length === 0) {
                this.ageResponseVal = '';
              }

              // If response value is Yes, set the checkBox to be true (checkboxes only accept true or false values, the value returned from and sent to the call are a string)
              if (data.responseValue === 'Yes') {
                this.ageResponse = true;
                this.scrolledBottom = true;
              }
              if (data.responseValue === 'No') {
                this.ageResponse = false;
              }
            }

            // Hidden Safety Video Watched
            if (data.questionId === this.data.question17) {
              if (this.videoResponse === undefined || null) {
                this.videoResponse = data.responseValue;
              }
              if (Object.keys(data.responseValue).length === 0) {
                this.videoResponse = 'No';
              }
              if (data.responseValue === 'Yes') {
                this.videoWatched = true;
              }
            }
          }
        },
        (err) => {
          console.log('There was an error!');
          if (err.status === 403) {
            this.snackBar.open('Login session expired, please login again.', 'Close', {
              duration: 3500,
              extraClasses: ['error-info']
            });

            this.route.navigate(['/step-01']);
          }
        });
  }

  updateSurveyRes() {

    const question_video = '&question_' + this.data.question17 + '=' + this.videoResponse;
    const question_age = '&question_' + this.data.question3 + '=' + this.ageResponseVal;
    const question_waiver = '&question_' + this.data.question2 + '=' + this.fullName;

    const updateSurveyResponsesUrl = 'https://secure2.convio.net/cfrca/site/CRTeamraiserAPI?method=updateSurveyResponses&api_key=cfrca&v=1.0&response_format=json&fr_id=' + this.data.eventID;

    this.http.post(updateSurveyResponsesUrl + question_video + question_age + question_waiver + '&survey_id=' + this.data.surveyID + '&sso_auth_token=' + this.data.ssoToken, null)
      .subscribe(res => {
          this.surveyResults = res;

          this.snackBar.open('Your information has been saved!', 'Close', {
            duration: 3500,
            extraClasses: ['saved-info']
          });

          // Once the updateSurveyRes() function is successful, update the flowStep to the next flowStep
          this.nextFlowStep();
        },
        error => {
          console.log('There was an error');
        });
  }

  updateSurveyResSave() {

    const question_video = '&question_' + this.data.question17 + '=' + this.videoResponse;
    const question_age = '&question_' + this.data.question3 + '=' + this.ageResponseVal;
    const question_waiver = '&question_' + this.data.question2 + '=' + this.fullName;
    const updateSurveyResponsesUrl = 'https://secure2.convio.net/cfrca/site/CRTeamraiserAPI?method=updateSurveyResponses&api_key=cfrca&v=1.0&response_format=json&fr_id=' + this.data.eventID;

    this.http.post(updateSurveyResponsesUrl + question_video + question_age + question_waiver + '&survey_id=' + this.data.surveyID + '&sso_auth_token=' + this.data.ssoToken, null)
      .subscribe(res => {
          this.surveyResults = res;

          this.snackBar.open('Your information has been saved!', 'Close', {
            duration: 3500,
            extraClasses: ['saved-info']
          });

        },
        error => {
          // console.log('There was an error');
        });
  }

  checkRes() {
    if (this.ageResponse === true) {
      this.ageResponseVal = 'Yes';
    }
    if (this.ageResponse === false) {
      this.ageResponseVal = 'No';
    }
  }

  // Update the current Flowstep
  updateFlowStep() {
    this.data.method = 'CRTeamraiserAPI?method=updateRegistration&api_key=cfrca&v=1.0' + '&fr_id=' + this.data.eventID + '&sso_auth_token=' + this.data.ssoToken + '&checkin_status=' + this.data.checkInStatus + '&flow_step=' + this.flowStep + '&response_format=json';
    this.http.post(this.data.convioURL + this.data.method, null)
      .subscribe(res => {
        // console.log('Flow step updated.')
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

  // Update the flowStep to the next flowStep once everything checks out
  nextFlowStep() {
    this.flowStep = '5';
    this.data.method = 'CRTeamraiserAPI?method=updateRegistration&api_key=cfrca&v=1.0' + '&fr_id=' + this.data.eventID + '&sso_auth_token=' + this.data.ssoToken + '&checkin_status=' + this.data.checkInStatus + '&flow_step=' + this.flowStep + '&response_format=json';
    this.http.post(this.data.convioURL + this.data.method, null)
      .subscribe(res => {

        // Update the flowStep to the next flowstep once everything checks out properly
        this.route.navigate(['/step-06']);
      }, (err) => {
        if (err) {
          // console.log(err);
          // 	  if (err.error.errorResponse.code === '5') {
          //   this.snackBar.open('Your login token has expired. Please log-in again.', 'Close', {
          //     duration: 3500,
          //     extraClasses: ['error-info']
          //   });
          // 	    this.data.logOut();
          // }
          // 		console.log('There was an error updating the flowstep.');
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
    this.data.method = 'CRTeamraiserAPI?method=updateRegistration&api_key=cfrca&v=1.0' + '&fr_id=' + this.data.eventID + '&sso_auth_token=' + this.data.ssoToken + '&checkin_status=' + this.data.checkInStatus + '&flow_step=' + this.flowStep + '&response_format=json';
    this.http.post(this.data.convioURL + this.data.method, null)
      .subscribe(res => {

        // Route user to previous flow step
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
        console.log(err);

        // If flowstep has error, log out the user (to prevent API errors)
        // this.data.logOut();
      });
  }

}
