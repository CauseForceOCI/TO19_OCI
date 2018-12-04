import { Component, OnInit, OnDestroy , ViewChild, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';

/* HTTP Client to retrieve data */
import { HttpClient, HttpRequest, HttpEvent, HttpEventType } from '@angular/common/http';

/* Angular Material */
import { MatSnackBar } from '@angular/material';

/* Data Service */
import { DataService } from '../data.service';

@Component({
  selector: 'app-step-07',
  templateUrl: './step-07.component.html',
  styleUrls: ['./step-07.component.scss']
})
export class Step07Component implements OnInit, OnDestroy, AfterViewInit {

  // Setting the FlowStep
  flowStep = '6';
  flowStepResults: any= {};
  getFlowStepNumber: string;

  // Method for API
  method: string;

  // getSurvey Results Data
  surveyResults: any= {};
  upsellResponse: string;
  hiddenUpsellID: string;

  // Fundraising Results Data
  fundResponse: any = {};
  minimumGoal: string;
  amountRaised: string;
  fundsMet = true;
  fundraisingMetGoal = false;

  // Get Team Results Data
  getTeamRes: any= {};
  teamName: any= {};

  // Team Fundraising Variables
  teamFundResponse: any= {};
  teamExcessFunds = 0;
  partMin: any;
  teamTotalMin: number;
  totalMinRequired = 0;
  allTeamRaised = 0;
  teamFundsNeeded: number;
  totalFundsDeci: any;
  totalFundsNeeded: number;
  totalCompleted: number;
  fundsNeededPlusUpsell: any;
  buttonFundsNeeded = false;

  // Get Participants Results Data
  getParticipantRes: any= {};

  // Consituent ID
  consID: string;

  // Registration Response Data
  regResponse: any= {};
  updateRegRes: any= {};
  checkinStatus: string;
  checkInCommitted = true;

  // Get DSP/ISP ID Results
  linksResult: any = {};
  linksResultDSP: any = {};

  // ISP & DSP Variables
  ispID: string;
  ispURL: string;
  dspID: string;
  dspURL: string;
  hideDSP= true;
  hideISP= true;

  // Team boolean
  inTeam: boolean;

  // Variable for timeout function
  timeOut: any;
  timeOut2: any;

  // Upsell Data / Response
  upsellInfo: any = {};
  upsellPriceNumber: number;
  upsellPrice: any;

  constructor(private data: DataService,
              private http: HttpClient,
              private router: Router,
              public snackBar: MatSnackBar) {}

  ngOnInit() {
    window.scrollTo(0, 0);

    // Checking logged in state, and running correct functions
    if (this.data.isLoggedIn() === true && this.data.tokenExpired === false) {

      // If logged in state is correct, run functions
      this.getFlowStep();

      // this.dataService.getParticipationType();
    } else if (this.data.storageToken === undefined) {

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

  }

  ngAfterViewInit() {
    // Adding upsell addon IDs

    if (this.upsellResponse === 'Yes' && this.totalFundsNeeded <= 0 && this.hiddenUpsellID) {
      // console.log('I am inside the first dsp if statement');
      this.ispURL += '&DESIGNATED_ADDON_ID=' + this.hiddenUpsellID;
      this.dspURL += '&DESIGNATED_ADDON_ID=' + this.hiddenUpsellID;

      this.hideDSP = false;
      this.fundsMet = true;
    } else if (this.upsellResponse === 'Yes' && this.totalFundsNeeded >= 0 && this.hiddenUpsellID) {
      // console.log('I am inside the second dsp if statement');
      this.ispURL += '&DESIGNATED_ADDON_ID=' + this.hiddenUpsellID;
      this.dspURL += '&DESIGNATED_ADDON_ID=' + this.hiddenUpsellID;
    }

    if (isNaN(this.fundsNeededPlusUpsell)) {
      const tempNum = parseInt(this.minimumGoal, 0) + parseInt(this.upsellPrice, 0);
      const tempDigits = tempNum / 100;

      this.fundsNeededPlusUpsell = tempDigits.toFixed(2);
    }

    // if (this.checkinStatus) {
    //   console.log(this.checkinStatus);
    // }
  }

  // Clear the timeout function upon entering a new route
  ngOnDestroy() {
    clearTimeout(this.timeOut);
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
          // If the flow step matches to where they are supposed to be, then run the functions for the current route below
          this.getSurvey();
          this.data.getUserInfo();
        } else {
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
        console.log(err);

        // If flowstep has error, log out the user (to prevent API errors)
        this.data.logOut();
      });
  }

  // Gather Registration Information
  getRegInfo() {
    this.data.storageToken = localStorage.getItem('token');
    this.data.method = 'CRTeamraiserAPI?method=getRegistration&api_key=cfrca&v=1.0&response_format=json&fr_id=' + this.data.eventID + '&sso_auth_token=' + this.data.storageToken;
    this.http.post(this.data.convioURL + this.data.method, null)
      .subscribe(res => {
        this.regResponse = res;

        // console.log(this.regResponse);

        this.consID = this.regResponse.getRegistrationResponse.registration.consId;
        this.checkinStatus = this.regResponse.getRegistrationResponse.registration.checkinStatus;

        if (this.checkinStatus === 'committed' || this.checkinStatus === 'paid') {
          this.checkInCommitted = false;
          this.hideDSP = false;
          this.hideISP = false;
          this.fundsMet = false;
        }

        if (this.regResponse.getRegistrationResponse.registration.teamId > 0) {
          this.inTeam = true;
        }

        this.getFundraising();
        this.getIspDspID();
        this.updateFlowStep();

      }, (err) => {
        console.log(err);
        this.data.tokenExpired = true;
        this.router.navigate(['/step-01']);
      });
  }

  // Gather Fundraising Results
  getFundraising() {
    this.method = 'CRTeamraiserAPI?method=getFundraisingResults&api_key=cfrca&v=1.0&response_format=json&cons_id=' + this.consID + '&fr_id=' + this.data.eventID;
    this.http.get(this.data.convioURL + this.method)
      .subscribe(data => {
          this.fundResponse = data;

          // Setting Amount Raised and Minimum required
          const numberMin = parseInt(this.fundResponse.getFundraisingResponse.fundraisingRecord.minimumGoal);
          const numberRaised = parseInt(this.fundResponse.getFundraisingResponse.fundraisingRecord.amountRaised);

          const addDeciMin = (numberMin / 100).toFixed(2);
          const addDeciRaised = (numberRaised / 100).toFixed(2);

          const newMin = addDeciMin.toString();
          const newRaised = addDeciRaised.toString();

          this.amountRaised = newRaised;
          this.minimumGoal = newMin;

          // Total Funds needed math
          this.totalFundsNeeded = numberMin - numberRaised;

          this.totalFundsDeci = (this.totalFundsNeeded / 100).toFixed(2);

          // Algorithm for Normal Fundraising
          if (this.checkinStatus === 'paid' && this.checkInCommitted === false) {
            // console.log('Status is Paid and Has met funding requirements');
            this.hideDSP = false;
            this.hideISP = false;
            this.fundsMet = false;
          }

          if (this.upsellResponse === 'No' && this.totalFundsNeeded <= 0) {
            this.hideDSP = false;
            this.hideISP = false;
            this.fundsMet = false;
          }

          if (this.totalFundsNeeded > 0 && this.upsellResponse === 'No') {
            // console.log('No upsell selected and Funds needed exceeds 0');
          }

          if (this.upsellResponse === 'Yes' && this.totalFundsNeeded <= 0) {
            this.ispURL += '&DESIGNATED_ADDON_ID=' + this.hiddenUpsellID;
            this.dspURL += '&DESIGNATED_ADDON_ID=' + this.hiddenUpsellID;
            this.hideDSP = false;
            this.fundsMet = true;
          } else if (this.upsellResponse === 'Yes' && this.totalFundsNeeded >= 0) {
            this.ispURL += '&DESIGNATED_ADDON_ID=' + this.hiddenUpsellID;
            this.dspURL += '&DESIGNATED_ADDON_ID=' + this.hiddenUpsellID;
          }

          if (this.upsellResponse === 'Yes' && this.totalFundsNeeded <= 0 && this.checkinStatus === 'paid') {
            this.hideDSP = false;
            this.hideISP = false;
            this.fundsMet = false;
          }

          if (this.totalFundsNeeded <= 0) {
            this.fundraisingMetGoal = true;
          }

          if (this.totalFundsNeeded > 0) {
            this.buttonFundsNeeded = true;
            const mathOnUpsell = this.totalFundsNeeded + this.upsellPriceNumber;
            const cleanUpsellAmt = mathOnUpsell / 100;
            // let finalUpsellFunds = cleanUpsellAmt.toFixed(2);
            this.fundsNeededPlusUpsell = cleanUpsellAmt.toFixed(2);

            // console.log(this.fundsNeededPlusUpsell);
          }

        },
        (error) => {
          if (error) {
            console.log(error);
          }
        });
  }

  // Get the DSP and ISP IDs (used for DSP/ISP addon links)
  getIspDspID() {

    // ISP API Call
    const methodISP = 'CRTeamraiserAPI?method=getEventDataParameter&api_key=cfrca&v=1.0&response_format=json&fr_id=' + this.data.eventID + '&edp_name=F2F_OCI_ISP_FORM_ID';
    this.http.post(this.data.convioURL + methodISP, null)
      .subscribe(res => {
        this.linksResult = res;

        this.ispID = this.linksResult.getEventDataParameterResponse.stringValue;

        // console.log(this.linksResult);

        this.ispURL = 'http://ab18.conquercancer.ca/site/Donation2?df_id=' + this.ispID + '&' + this.ispID + '.donation=form1&mfc_pref=T&FILL_AMOUNT=TR_REMAINDER' + '&' + 'PROXY_ID=' + this.consID + '&' + 'PROXY_TYPE=20&FR_ID=' + this.data.eventID;

        // console.log(this.ispURL);
      }, (err) => {
        if (err) {
          console.log('There was an error!');
        }
      });

    // DSP API Call
    const methodDSP = 'CRTeamraiserAPI?method=getEventDataParameter&api_key=cfrca&v=1.0&response_format=json&fr_id=' + this.data.eventID + '&edp_name=F2F_OCI_DSP_FORM_ID';
    this.http.post(this.data.convioURL + methodDSP, null)
      .subscribe(res => {
        this.linksResultDSP = res;

        this.dspID = this.linksResultDSP.getEventDataParameterResponse.stringValue;

        // console.log(this.linksResultDSP);

        this.dspURL = 'http://ab18.conquercancer.ca/site/Donation2?df_id=' + this.dspID + '&' + this.dspID + '.donation=form1&mfc_pref=T&FILL_AMOUNT=TR_REMAINDER' + '&' + 'PROXY_ID=' + this.consID + '&' + 'PROXY_TYPE=20&FR_ID=' + this.data.eventID;

        // console.log(this.dspURL);
      }, (err) => {
        if (err) {
          console.log('There was an error!');
        }
      });

  }

  // Gather Survery Results
  getSurvey() {
    this.data.method = 'CRTeamraiserAPI?method=getSurveyResponses&api_key=cfrca&v=1.0&fr_id=' + this.data.eventID + '&survey_id=' + this.data.surveyID + '&sso_auth_token=' + this.data.ssoToken + '&response_format=json';
    this.http.post(this.data.convioURL + this.data.method, null)
      .subscribe(res => {
          this.surveyResults = res;

          // For loop to loop through the responded data from API call
          for (const data of this.surveyResults.getSurveyResponsesResponse.responses) {

            // Upsell response (yes or no)
            if (data.questionId === this.data.question6) {
              this.upsellResponse = data.responseValue;
            }
            // Hidden upsell value
            if (data.questionId === this.data.question16) {
              // console.log(data.responseValue);
              this.hiddenUpsellID = data.responseValue;
            }
          }

          this.getUpsell();
          this.getRegInfo();

          // console.log(this.upsellHiddenResult);
        },
        (err) => {
          if (err.status === 403) {

            this.data.logOut();

            this.snackBar.open('Login session expired, please login again.', 'Close', {
              duration: 3500,
              extraClasses: ['error-info']
            });

            this.router.navigate(['/step-01']);
          }
        });
  }

  // Get Team Information
  getTeam() {
    this.method = 'CRTeamraiserAPI?method=getTeam&api_key=cfrca&v=1.0&response_format=json&fr_id=' + this.data.eventID + '&sso_auth_token=' + this.data.storageToken;
    this.http.post(this.data.convioURL + this.method, null)
      .subscribe(res => {
        this.getTeamRes = res;
        this.teamName = this.getTeamRes.getTeamResponse.team.name;

        this.getParticipantList();
      }, (err) => {
        console.log(err);
      });

  }

  // Get Participants for Team Fundraising
  getParticipantList() {

    const checkComplete = 'complete';

    // Filters for the API Call to get the Participants with completed status
    const filters = '&fr_id=' + this.data.eventID + '&sso_auth_token=' + this.data.storageToken + '&team_name=' + this.teamName + '&list_filter_column=reg.CHECKIN_STATUS' + '&list_filter_text=' + checkComplete + '&list_page_size=500';
    this.method = 'CRTeamraiserAPI?method=getParticipants&api_key=cfrca&v=1.0&response_format=json';

    // Get call to get all the participants with the completed Status
    this.http.post(this.data.convioURL + this.method + filters, null)
      .subscribe(res => {
          this.getParticipantRes = res;
          // console.log(this.getParticipantRes.getParticipantsResponse.participant);

          // Checking if the data returns information
          if (this.getParticipantRes.getParticipantsResponse.participant) {

            this.totalCompleted = this.getParticipantRes.getParticipantsResponse.participant.length;

            // Checking if the participant amount is greater than 1
            if (this.totalCompleted > 0) {
              // Team Donation API Call IF/ELSE run for loop

              // If more than 1, run a for loop on all the participants
              for (const participants of this.getParticipantRes.getParticipantsResponse.participant) {

                // const partRaised = parseInt(participants.amountRaised);

                // Calculate all of the finished team members total funds raised
                this.allTeamRaised += parseInt(participants.amountRaised);

                // Do a call to get the fundraising results for each participant in this loop or team
                this.method = 'CRTeamraiserAPI?method=getFundraisingResults&api_key=cfrca&v=1.0&response_format=json&cons_id=' + participants.consId + '&fr_id=' + this.data.eventID;

                this.http.get(this.data.convioURL + this.method)
                  .subscribe(data => {
                    this.teamFundResponse = data;
                    this.partMin = parseInt(this.teamFundResponse.getFundraisingResponse.fundraisingRecord.minimumGoal);

                    // If the participant's amountRaised is greater than their minimum add the balance to the teamExcess
                    if (participants.amountRaised > this.partMin) {
                      this.totalMinRequired += (this.partMin * this.totalCompleted);

                      this.teamExcessFunds = this.allTeamRaised - this.totalMinRequired;
                      // console.log('Total team raised amount: ' + this.allTeamRaised);
                      // console.log('Total minimum required: ' + this.totalMinRequired);
                      // console.log('Total excess funds: ' + this.teamExcessFunds);
                    }

                    if (this.teamExcessFunds >= this.totalFundsNeeded && this.upsellResponse === 'No') {
                      this.fundsMet = false;
                      this.hideDSP = false;
                      this.hideISP = false;
                    } else if (this.teamExcessFunds >= this.totalFundsNeeded && this.upsellResponse === 'Yes') {
                      this.hideDSP = false;
                    }

                  }, (err) => {
                    console.log(err);
                  });
              }
            } else {

              // If the team only has 1 participant
              const raisedFunds = parseInt(this.getParticipantRes.getParticipantsResponse.participant.amountRaised);

              const calculatedExcess = raisedFunds;

              // Do a call to get the fundraising results for the 1 participant that has completed the OCI in this team
              this.method = 'CRTeamraiserAPI?method=getFundraisingResults&api_key=cfrca&v=1.0&response_format=json&cons_id=' + this.getParticipantRes.getParticipantsResponse.participant.consId + '&fr_id=' + this.data.eventID;

              this.http.get(this.data.convioURL + this.method)
                .subscribe(data => {
                  this.teamFundResponse = data;

                  this.partMin = parseInt(this.teamFundResponse.getFundraisingResponse.fundraisingRecord.minimumGoal);

                  this.partMin += this.totalFundsNeeded;

                  const participantRaised1 = parseInt(this.fundResponse.getFundraisingResponse.fundraisingRecord.amountRaised);
                  const participantRaised2 = parseInt(this.getParticipantRes.getParticipantsResponse.participant.amountRaised);
                  const bothRaised = participantRaised1 + participantRaised2;

                  // If the participant's amountRaised is greater than their minimum add the balance to the teamExcess
                  if (bothRaised >= this.partMin && this.upsellResponse === 'No') {
                    this.fundsMet = false;
                    this.hideDSP = false;
                    this.hideISP = false;
                  } else if (bothRaised >= this.partMin && this.upsellResponse === 'Yes') {
                    this.hideDSP = false;
                  }

                }, (err) => {
                  console.log(err);
                });
            }
          }

        },
        (err) =>  {
          console.log(err);
        });
  }

  // Update the current Flowstep
  updateFlowStep() {

    this.data.method = 'CRTeamraiserAPI?method=updateRegistration&api_key=cfrca&v=1.0' + '&fr_id=' + this.data.eventID + '&sso_auth_token=' + this.data.ssoToken + '&checkin_status=' + this.checkinStatus + '&flow_step=' + this.flowStep + '&response_format=json';
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
    this.flowStep = '7';
    this.data.method = 'CRTeamraiserAPI?method=updateRegistration&api_key=cfrca&v=1.0' + '&fr_id=' + this.data.eventID + '&sso_auth_token=' + this.data.ssoToken + '&checkin_status=' + this.checkinStatus + '&flow_step=' + this.flowStep + '&response_format=json';
    this.http.post(this.data.convioURL + this.data.method, null)
      .subscribe(res => {
        // Update the flowStep to the next flowstep once everything checks out properly
        this.router.navigate(['/step-08']);
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

  // Update the current Flowstep
  previousFlowStep() {
    this.flowStep = '5';
    this.data.method = 'CRTeamraiserAPI?method=updateRegistration&api_key=cfrca&v=1.0' + '&fr_id=' + this.data.eventID + '&sso_auth_token=' + this.data.ssoToken + '&checkin_status=' + this.checkinStatus + '&flow_step=' + this.flowStep + '&response_format=json';
    this.http.post(this.data.convioURL + this.data.method, null)
      .subscribe(res => {

        // Route user to previous flow step
        this.router.navigate(['/step-06']);
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

  reload() {
    window.location.reload();
  }

  getUpsell() {
    this.data.method = 'CRTeamraiserAPI?method=getUpsell&api_key=cfrca&v=1.0' + '&fr_id=' + this.data.eventID + '&upsell_id=' + this.hiddenUpsellID + '&response_format=json';
    this.http.post(this.data.convioURL + this.data.method, null)
      .subscribe(
        (res) => {
          this.upsellInfo = res;
          console.log(this.upsellInfo);
          this.upsellPriceNumber = parseInt(this.upsellInfo.getUpsellResponse.upsell.price, 0);
          const newUpsellAmt = this.upsellPriceNumber  / 100;
          const upsellFinalAmt = newUpsellAmt.toFixed(2);

          this.upsellPrice = upsellFinalAmt;
          // console.log(this.upsellInfo);
        },
        (error) => {
          console.log(error);
        });
  }
}
