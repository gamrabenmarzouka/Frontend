import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TokenStorageService } from '@core/services/tokenStorage/token-storage-service.service';
import { AuthService } from '../../../core/services/Auth/auth.service';

import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { User } from '@app/models/User';
import { DomSanitizer } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { ProfileSettingsFacadeService } from '@core/facades/profile-settings-facade.service';
import { CampaignsStoreService } from '@app/campaigns/services/campaigns-store.service';
import { CampaignsListStoreService } from '@app/campaigns/services/campaigns-list-store.service';
import { ParticipationListStoreService } from '@campaigns/services/participation-list-store.service';
import { catchError, filter, takeUntil } from 'rxjs/operators';
import { of, Subject } from 'rxjs';
import { AccountFacadeService } from '@app/core/facades/account-facade/account-facade.service';
import { SocialAccountFacadeService } from '@app/core/facades/socialAcounts-facade/socialAcounts-facade.service';
import { WalletFacadeService } from '@app/core/facades/wallet-facade.service';

declare const $: any;
@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit, OnDestroy {
  urlpic: any;
  years: string = 'years';
  errorMessage = '';
  formProfile: FormGroup;
  show: boolean = false;
  buttonName: any = 'Show';
  profile: any;
  user!: User;
  closeResult: string = '';
  urlPic: any;
  showSpinner!: boolean;
  showSpinnerProfile!: boolean;
  showSpinnerSocial!: boolean;
  showSpinnerInterest!: boolean;
  showSpinnerKYC!: boolean;
  showSpinnerSecurity!: boolean;
  showSpinnerAccount!: boolean;

  percentProf2!: string;
  percentNet2!: string;
  percentProf: number = 0;
  percentNet: number = 0;
  dataLegal: any;
  dataLegalIdentity: any;
  dataLegalDomicile: any;
  percentKyc2!: string;
  percentKyc: number = 0;
  percentInterests: number = 0;
  picUserUpdated: boolean = false;
  private account$ = this.accountFacadeService.account$;
  private onDestoy$ = new Subject();
  private socialAccount$ = this.socialAccountFacadeService.socialAccount$;
  constructor(
    private accountFacadeService: AccountFacadeService,
    public translate: TranslateService,
    private modalService: NgbModal,
    private profileSettingsFacade: ProfileSettingsFacadeService,
    private sanitizer: DomSanitizer,
    private router: Router,
    private campaignDataStore: CampaignsStoreService,
    private ParticipationListStoreService: ParticipationListStoreService,
    private campaignsListStore: CampaignsListStoreService,
    private tokenStorageService: TokenStorageService,
    private socialAccountFacadeService: SocialAccountFacadeService,
    private walletFacade: WalletFacadeService,
    private authService: AuthService
  ) {
    this.formProfile = new FormGroup({
      firstName: new FormControl(null, Validators.required),
      lastName: new FormControl(null, Validators.required),
      email: new FormControl(null, Validators.required),
      gender: new FormControl(),
      country: new FormControl(),
      phone: new FormControl(),
      address: new FormControl(),
      birthday: new FormControl(),
      zipCode: new FormControl(),
      city: new FormControl()
    });
  }

  ngOnInit(): void {
    this.getListUserLegal();
    this.getDetails();
    this.getUserInterests();
    this.getSocialNetworkPercent();
    //   var ctx = document.getElementById("doughnut-chart")
    //   //@ts-ignore
    //   new Chart(ctx, {

    //     type: 'doughnut',
    //     data: {
    //       labels: ["filled", "empty"],
    //       datasets: [
    //         {
    //           label: "",
    //           backgroundColor: ["#00CC9E"],
    //           data: [4,6]
    //         },
    //         {
    //             borderWidth: 1,
    //         }
    //       ]
    //     },
    //     options: {
    //       title: {
    //         display: false,
    //         text: ''
    //       }
    //     }
    // });
  }

  //TODO: add signout function to facade service
  signOut() {
    this.campaignDataStore.clearDataStore(); // clear globale state before logging out user.
    this.ParticipationListStoreService.clearDataFarming();
    this.tokenStorageService.signOut();
    this.campaignsListStore.clearStore();
    this.walletFacade.dispatchLogout(); //clear totalBalance and cryptoList
    this.accountFacadeService.dispatchLogoutAccount(); //clear account user
    this.socialAccountFacadeService.dispatchLogoutSocialAccounts(); // clear social accounts
    //window.location.assign("https://satt.atayen.us/#/")
    this.authService.setIsAuthenticated(false);
    this.router.navigate(['/welcome']);
  }

  openModal(content: any) {
    this.modalService.open(content);
  }

  closeModal(content: any) {
    this.modalService.dismissAll(content);
  }

  isValid(controlName: any) {
    return (
      this.formProfile.get(controlName)?.invalid &&
      this.formProfile.get(controlName)?.touched
    );
  }

  toggle() {
    this.show = !this.show;

    // CHANGE THE NAME OF THE BUTTON.
    if (this.show) {
      this.buttonName = 'Hide';
    } else {
      this.buttonName = 'Show';
    }
  }

  onImgError(event: any) {
    event.target.src = 'assets/Images/moonboy/Default_avatar_MoonBoy.png';
  }

  getDetails() {
    // this.spinner.show();
    this.showSpinner = true;
    this.account$
      .pipe(
        filter((res) => res !== null),
        takeUntil(this.onDestoy$)
      )
      .subscribe((response: any) => {
        if (response !== null && response !== undefined) {
          let count = 0;
          this.showSpinner = false;
          this.user = new User(response);
          this.urlpic = this.user.idUser;
          this.picUserUpdated = response.photoUpdated;
          if (this.user.firstName && this.user.firstName !== '') {
            count++;
          }
          if (this.user.lastName && this.user.lastName !== '') {
            count++;
          }
          if (this.user.address && this.user.address !== '') {
            count++;
          }
          if (this.user.email && this.user.email !== '') {
            count++;
          }
          if (this.user.phone && this.user.phone !== '') {
            count++;
          }
          if (this.user.gender && this.user.gender !== '') {
            count++;
          }
          if (this.user.city && this.user.city !== '') {
            count++;
          }
          if (this.user.zipCode && this.user.zipCode !== '') {
            count++;
          }
          if (this.user.country && this.user.country !== '') {
            count++;
          }
          if (this.user.birthday && this.user.birthday !== '') {
            count++;
          }
          //let count2 = 0;
          this.percentProf = (count * 100) / 10;

          this.percentProf2 = this.percentProf.toFixed(0) + '%';

          //   if(this.user.twitterLink && this.user.twitterLink !=='' ) {
          //     count2 ++;
          //   }
          //   if(this.user.youtubeLink && this.user.youtubeLink !=='' ) {
          //     count2 ++;
          //   }
          //   if(this.user.fbLink && this.user.fbLink !=='' ) {
          //     count2 ++;
          //   }
          //   if(this.user.instagramLink && this.user.instagramLink !=='' ) {
          //     count2 ++;
          //   }
          //   if( this.user.linkedinLink && this.user.linkedinLink !=='' ) {
          //     count2 ++;
          //   }
          //   if(this.user.tikTokLink && this.user.tikTokLink !==''){
          //     count2 ++;
          //   }
          //   if(this.user.idOnSn){
          //     count2++;
          // }
          // if(this.user.idOnSn2){
          //     count2++;
          // }
          // if(this.user.idOnSn3){
          //     count2++;
          // }

          //   this.percentNet=count2*100/9 ;
          //   this.percentNet2=this.percentNet.toFixed(0) +'%';

          if (!this.user.instagramLink) {
            $('#addInsta').css('pointer-events', 'none');
          }
          if (!this.user.fbLink) {
            $('#addFb').css('pointer-events', 'none');
          }
          if (!this.user.twitterLink) {
            $('#addTwitter').css('pointer-events', 'none');
          }
          if (!this.user.youtubeLink) {
            $('#youtube-link').css('pointer-events', 'none');
          }

          this.profileSettingsFacade.profilePic$
            .pipe(takeUntil(this.onDestoy$))
            .subscribe((profile: any) => {
              if (!!profile) {
                let objectURL = URL.createObjectURL(profile);
                if (this.user.idSn === 0) {
                  this.user.userPicture =
                    this.sanitizer.bypassSecurityTrustUrl(objectURL);
                }
                if (this.picUserUpdated && this.user.idSn !== 0) {
                  this.user.userPicture =
                    this.sanitizer.bypassSecurityTrustUrl(objectURL);
                }
              }

              if (this.user.picLink && !this.user.userPicture) {
                this.user.userPicture = this.user?.picLink;
              }
            });
          // if (this.user.picLink) {
          //   this.user.userPicture = this.user?.picLink;
          // }else{
          //    this.ProfileService.getUserProfilePic().subscribe(
          //   (profile: any) => {
          //     let objectURL = URL.createObjectURL(profile);
          //     this.user.userPicture =
          //       this.sanitizer.bypassSecurityTrustUrl(objectURL);
          //   }
          // );
          // }
        }
      });
  }
  goToEdit() {
    this.router.navigate(['home/settings/edit']);
    this.showSpinnerProfile = true;
  }
  goToNetworks() {
    this.router.navigate(['home/settings/social-networks']);
    this.showSpinnerSocial = true;
  }
  goTointerests() {
    this.router.navigate(['home/settings/interests']);
    this.showSpinnerInterest = true;
  }
  goToLegalKYC() {
    this.router.navigate(['home/settings/Legal_KYC']);
    this.showSpinnerKYC = true;
  }
  goTosecurity() {
    this.router.navigate(['home/settings/security']);
    this.showSpinnerSecurity = true;
  }
  goToProAccount() {
    this.router.navigate(['home/settings/pro']);
    this.showSpinnerAccount = true;
  }
  getListUserLegal() {
    let count = 0;
    this.showSpinner = true;
    this.profileSettingsFacade
      .getListUserLegal()
      .pipe(takeUntil(this.onDestoy$))
      .subscribe((response: any) => {
        if (response !== null && response !== undefined) {
          this.showSpinner = false;
          this.dataLegal = response.legal;
          this.dataLegal.forEach((item: any) => {
            switch (item.type) {
              case 'proofId':
                this.dataLegalIdentity = item;
                count++;
                break;
              case 'proofDomicile':
                this.dataLegalDomicile = item;
                count++;
                break;
            }
          });

          this.percentKyc = (count * 100) / 2;
          this.percentKyc2 = this.percentKyc + '%';
        }
      });
  }
  getUserInterests() {
    this.profileSettingsFacade
      .getInterests()
      .pipe(
        catchError((error: any) => {
          if (
            error.error.error === 'No interest found' &&
            error.error.code === 404
          ) {
            return of(null);
          }
          return of(null);
        }),
        takeUntil(this.onDestoy$)
      )
      .subscribe((response: any) => {
        console.log(response);
        if (response?.interests?.length === 0 || response == null) {
          this.percentInterests = 0;
        } else {
          this.percentInterests = Math.floor(
            (response?.interests?.length * 100) / 6
          );
        }
      });
  }
  getSocialNetworkPercent() {
    let count = 0;
    this.socialAccount$
      .pipe(takeUntil(this.onDestoy$))
      .subscribe((data: any) => {
        if (data !== null) {
          if (data.facebook.length !== 0) {
            count++;
          }
          if (data.google.length !== 0) {
            count++;
          }
          if (data.twitter.length !== 0) {
            count++;
          }
          if (data.linkedin.length !== 0) {
            count++;
          }

          this.percentNet = (count * 100) / 4;
          this.percentNet2 = this.percentNet.toFixed(0) + '%';
        } else {
          this.percentNet = 0;
          this.percentNet2 = '0';
        }
      });
  }
  ngOnDestroy() {
    this.onDestoy$.next('');
    this.onDestoy$.complete();
  }
}
