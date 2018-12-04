import { HttpClient, HttpRequest } from '@angular/common/http';

import { MatSnackBar } from '@angular/material';

import { Router } from '@angular/router';

import {Injectable, OnInit} from '@angular/core';

@Injectable()
export class DataService implements OnInit {

  /* ============  Global Variables Below ============*/

  // Event ID
  eventID: any = '1662';

  // Survey ID
  surveyID: any = '82795';

  // Survey Question ID(s) - below insert the Survey Question IDs
  question1 = '86797'; // How many years have you ridden with The Ride?
  question2 = '86798'; // Waiver and Release Full Name
  question3 = '86799'; // 18 Years Check Box

  question4 = '86800'; // Health Insurance Company name
  question5 = '86801'; // Health Insurance Policy Number

  question6 = '88078'; // Accepted Upsell Offer
  question7 = ''; // Donation Form Type
  question8 = ''; // DSP Save Value

  question9 = ''; // Citizenship
  question10 = ''; // Passport #

  question11 = ''; // Birth Month
  question12 = ''; // Birth Day
  question13 = ''; // Birth Year

  question14 = '86810'; // Want to be recognized as a cancer survivor?
  question15 = '86811'; // Vegetarian meal

  question16 = '86812'; // Hidden Upsell Value
  question17 = '86813'; // Hidden Safety Video Watched

  question18 = '86814'; // Jersey Size

  question19 = '88080'; // Shuttle Question 1
  question20 = '88217'; // Shuttle Question 2
  question21 = '88218'; // Shuttle Question 3
  question22 = '88219'; // Shuttle Question 4
  question23 = ''; // Shuttle Question 5
  question24 = ''; // Shuttle Question 6

  question28 = '88077'; // Packet Pickup

  // Additional Questions
  question30 = '88077'; // Route Selection

  // Upsell IDs
  hiddenUpsellID = '1441'; // Upsell ID #1 copied from Teamraiser - $15.00
  hiddenUpsellID2 = '1442'; // Upsell ID #2 copied from Teamraiser - $250.00
  hiddenUpsellID3 = '1443'; // Upsell ID #3 copied from Teamraiser - $165.00

  // Safety Video
  safetyVidURL = 'assets/videos/18RCBC-SAFETY-MIXED2-MED.mp4';
  safetyVidWebmURL = 'assets/videos/18RCBC-SAFETY-MIXED2-MED_1.webm';

  // Login Information
  username: string;
  password: string;

  loginErr: boolean;

  // API Call Information
  convioURL = 'https://secure2.convio.net/cfrca/site/';
  loginMethod: string;
  method: string;

  // Setting logged in state (must be false initially)
  isloggedIn: any = false;

  // Registration Variables
  regResponse: any = {};
  checkInStatus: string;

  // Setting flow step state
  flowStepResults: any = {};
  flowStep: any;

  // Results from API Call
  loginRes: any = {};
  // Login Test
  loginTestRes: any = {};

  // Results from getSurveyRes
  surveyResults: any = {};

  // Sign-on Token
  ssoToken: any = localStorage.getItem('token');
  storageToken: string = localStorage.getItem('token');
  tokenExpired: boolean;

  // Constituent Information
  consID: any;
  storageConsID: any;
  getConsInfo: any;

  consUserName: string;
  firstName: string;
  lastName: string;
  primaryAddress1: string;
  primaryAddress2: string;
  primaryCity: string;
  primaryState: string;
  primaryZip: string;
  gender: string;

  emergencyName: string;
  emergencyPhone: string;

  // Participation Type
  participationID: string;
  storageParticipationID: string;
  participationRes: any;
  participationType: string;

  // Team
  getTeamRes: any = {};
  teamName: string;
  teamExist = false;

  show = true;

  // Tentmate Status Variable
  tentStatus: string;

  constructor(private http: HttpClient, private router: Router, public snackBar: MatSnackBar) {

    if (localStorage.getItem('token') !== undefined || null) {
      this.tokenExpired = false;
    }
    // If user's logged in state returns true set login state, and add constiuent ID from the the local storage into a global variable
    if (this.isLoggedIn() === true) {
      this.isloggedIn = true;
      this.storageConsID = localStorage.getItem('consID');
      this.storageParticipationID = localStorage.getItem('participationID');
    }
  }

  ngOnInit() {
    this.getCheckInStatus();
  }

  // Log out, clear out the local storage, forcing user to log in again
  logOut() {
    localStorage.clear();
    this.router.navigate(['/step-01']);
    this.show = true;

    this.convioURL = 'https://secure2.convio.net/cfrca/site/';
    this.method = 'CRConsAPI?method=logout&api_key=cfrca&v=1.0&response_format=json';
    this.http.post(this.convioURL + this.method, null)
      .subscribe(
        (data) => {

          this.snackBar.open('You have been successfully logged out. We look forward to seeing you at the 2018 Ride!', 'Close', {
            duration: 3500,
            extraClasses: ['error-info']
          });
        },
        (error) => {
          console.log(error);
        }
      );

    // window.location.reload();
  }

  // Check logged in state by a token retrieved by loggin into the app
  isLoggedIn() {
    return localStorage.getItem('token') !== null;
  }

  // Log into the OCI Web App
  logMeIn() {
    this.loginMethod = 'CRConsAPI?method=login&api_key=cfrca&v=1.0&user_name='+ this.username + '&password=' + this.password + '&remember_me=true&response_format=json';
    this.http.post(this.convioURL + this.loginMethod, null)
      .subscribe(res => {
        this.loginRes = res;
        // console.log(this.loginRes);
        this.ssoToken = this.loginRes.loginResponse.token;
        this.consID = this.loginRes.loginResponse.cons_id;
        localStorage.setItem('consID', this.consID);

        this.storageConsID = localStorage.getItem('consID');
        // console.log(this.consID);

        localStorage.setItem('token', this.ssoToken);
        this.tokenExpired = false;

        this.storageToken = localStorage.getItem('token');

        const nonce = this.loginRes.loginResponse.nonce;
        localStorage.setItem('nonce', nonce);

        const jsession = this.loginRes.loginResponse.JSESSIONID;
        localStorage.setItem('jsession', jsession);
        // window.location.href = 'https://secure2.convio.net/cfrca/site/' + 'EstablishSession?NONCE_TOKEN='+ nonce +'&NEXTURL=' + 'https://secure2.convio.net/cfrca/rcmo_oci_dev_moe/&NONCE_TOKEN='+ nonce;
        // window.location.href = 'https://secure2.convio.net/cfrca/site/SPageServer?pagename=mo18_pc&pc2_page=center&fr_id=1651&jsessionid='+ jsession +'?pg=entry&fr_id=1651&NONCE_TOKEN='+ nonce + '&NEXTURL=https://secure2.convio.net/cfrca/rcmo_oci_dev/';

        // Get flow step
        this.getFlowStepLogin();
      }, (err) => {
        // console.log(err);
        this.loginErr = true;

        this.snackBar.open('Error with username or password.', 'Close', {
          duration: 3500,
          extraClasses: ['error-info']
        });
      });
  }
  // Testing user's logged in state
  loginTest() {
    this.loginMethod = 'CRConsAPI?method=loginTest&api_key=cfrca&v=1.0&response_format=json&sign_redirects=true&success_redirect=https://secure2.convio.net/cfrca/rcva_oci_dev?cons_id=&error_redirect=http://www.google.com?cons_id=0';
    this.http.get(this.convioURL + this.loginMethod)
      .subscribe((res) => {
        this.loginTestRes = res;
        // console.log(this.loginTestRes);
      }, (error) => {
        // console.log(error);
      });
  }

  // Get user's checkin status, this function will be ran on EVERY step
  getCheckInStatus() {
    this.method = 'CRTeamraiserAPI?method=getRegistration&api_key=cfrca&v=1.0&response_format=json&fr_id='+ this.eventID + '&sso_auth_token=' + this.storageToken;
    this.http.post(this.convioURL + this.method, null)
      .subscribe(res => {
        // Results from the API Call
        this.regResponse = res;

        this.checkInStatus = this.regResponse.getRegistrationResponse.registration.checkinStatus;

        // console.log(this.checkInStatus);
      }, (error) => {

      });
  }

  // Get the current Flowstep and Send them to the route
  getFlowStepLogin() {
    const token = localStorage.getItem('token');
    this.method = 'CRTeamraiserAPI?method=getFlowStep&api_key=cfrca&v=1.0&response_format=json&fr_id='+ this.eventID + '&sso_auth_token='+ this.ssoToken;
    this.http.post(this.convioURL + this.method, null)
      .subscribe(res => {
        this.flowStepResults = res;
        this.flowStep = this.flowStepResults.getFlowStepResponse.flowStep;
        // console.log(this.flowStep);

        // Check the Flowstep, if matched, send them to the proper route
        if (this.flowStep === '0' || this.flowStep === '1') {
          this.router.navigate(['/step-02']);
        }
        if (this.flowStep === '2') {
          this.router.navigate(['/step-03']);
        }
        if (this.flowStep === '3') {
          this.router.navigate(['/step-05']);
        }
        if (this.flowStep === '4') {
          this.router.navigate(['/step-05']);
        }
        if (this.flowStep === '5') {
          this.router.navigate(['/step-06']);
        }
        if (this.flowStep === '6') {
          this.router.navigate(['/step-07']);
        }
        if (this.flowStep === '7') {
          this.router.navigate(['/step-08']);
        }
        if (this.flowStep === '8') {
          this.router.navigate(['/step-09']);
        }
      }, (err) => {
        // console.log(err);

        // If user tries to login with credentials from a different event display error message
        if (err.error.errorResponse.code === '2603') {
          localStorage.removeItem('token');
          this.snackBar.open("The username / password combination is incorrect for this event.", "Close", {
            duration: 3500,
            extraClasses: ['error-info']
          });
        }

      });
  }

  // Gather Registration Information
  getRegInfo() {
    this.storageToken = localStorage.getItem('token');
    this.method = 'CRTeamraiserAPI?method=getRegistration&api_key=cfrca&v=1.0&response_format=json&fr_id='+ this.eventID + '&sso_auth_token='+ this.storageToken;
    this.http.post(this.convioURL + this.method, null)
      .subscribe(res => {
        // Results from the API Call
        this.regResponse = res;
        // console.log(this.regResponse);

        this.participationID = this.regResponse.getRegistrationResponse.registration.participationTypeId;
        localStorage.setItem('participationID', this.participationID);
        this.storageParticipationID = localStorage.getItem('participationID');

        this.checkInStatus = this.regResponse.getRegistrationResponse.registration.checkinStatus;

        // console.log('Storage Participation ID: ' + this.storageParticipationID);
        // console.log('Login Participation ID: ' + this.participationID);
        // console.log(this.regResponse);

        this.emergencyName = this.regResponse.getRegistrationResponse.registration.emergencyName;
        this.emergencyPhone = this.regResponse.getRegistrationResponse.registration.emergencyPhone;
        // console.log(this.regResponse.getRegistrationResponse.registration.tentmateStatus);

        if (this.regResponse.getRegistrationResponse.registration.tentmateStatus === '1') {
          this.tentStatus = 'Eligible';
        } else if (this.regResponse.getRegistrationResponse.registration.tentmateStatus === '2') {
          this.tentStatus = 'Declined';
        } else if (this.regResponse.getRegistrationResponse.registration.tentmateStatus === '3') {
          this.tentStatus = 'Random';
        } else if (this.regResponse.getRegistrationResponse.registration.tentmateStatus === '0') {
          this.tentStatus = 'None';
        } else if (this.regResponse.getRegistrationResponse.registration.tentmateStatus === '4') {
          this.tentStatus = 'Sent Invite';
        } else if (this.regResponse.getRegistrationResponse.registration.tentmateStatus === '6') {
          this.tentStatus = 'Request Pending';
        }

        this.getParticipationType();
      }, (err) => {
        // console.log('There was an error getting the Registration:')
        // console.log(err);
        this.tokenExpired = true;
        this.router.navigate(['/step-01']);
      });
  }

  // Gather Constituent Information
  getUserInfo() {
    this.storageToken = localStorage.getItem('token');
    this.method = 'CRConsAPI?method=getUser&api_key=cfrca&v=1.0&response_format=json&cons_id='+ this.storageConsID + '&sso_auth_token=' + this.storageToken;
    this.http.post(this.convioURL + this.method, null)
      .subscribe(res => {
        this.getConsInfo = res;
        // console.log(this.getConsInfo);
        this.firstName = this.getConsInfo.getConsResponse.name.first;
        this.lastName = this.getConsInfo.getConsResponse.name.last;
        this.primaryAddress1 = this.getConsInfo.getConsResponse.primary_address.street1;
        this.primaryAddress2 = this.getConsInfo.getConsResponse.primary_address.street2;
        this.primaryCity = this.getConsInfo.getConsResponse.primary_address.city;
        this.primaryState = this.getConsInfo.getConsResponse.primary_address.state;
        this.primaryZip = this.getConsInfo.getConsResponse.primary_address.zip;

        this.consUserName = this.getConsInfo.getConsResponse.user_name;

        this.gender = this.getConsInfo.getConsResponse.gender;
      }, (err) => {
        console.log(err);
      });
  }

  // Gather Participation Type
  getParticipationType() {
    this.method = 'CRTeamraiserAPI?method=getParticipationType&api_key=cfrca&v=1.0&response_format=json&fr_id=' + this.eventID + '&participation_type_id=' + this.storageParticipationID;

    this.http.post(this.convioURL + this.method, null)
      .subscribe(res => {
        this.participationRes = res;
        // console.log(this.participationRes);
        this.participationType = this.participationRes.getParticipationTypeResponse.participationType.name;
        // localStorage.setItem('participationType', this.participationType);
      }, (err) => {
        // console.log(err);
      });
  }

  // Get Team Information
  getTeam() {
    this.method = 'CRTeamraiserAPI?method=getTeam&api_key=cfrca&v=1.0&response_format=json&fr_id=' + this.eventID + '&sso_auth_token=' + this.storageToken;
    this.http.post(this.convioURL + this.method, null)
      .subscribe(res => {
        this.getTeamRes = res;
        // console.log(this.getTeamRes);
        this.teamName = this.getTeamRes.getTeamResponse.team.name;
        this.teamExist = true;
      }, (err) => {
        // console.log('There was an error getting the getTeam Info');
        // console.log(err);
        this.teamExist = false;
      });

  }

}
