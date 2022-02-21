import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  TemplateRef,
  ChangeDetectorRef,
  HostBinding,
  Input,
  HostListener,
  ViewContainerRef,
  OnDestroy,
  Inject,
  PLATFORM_ID
} from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders
} from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { CookieService } from 'ngx-cookie-service';
import { CountdownComponent, CountdownEvent } from 'ngx-countdown';
import {
  FacebookLoginProvider,
  SocialAuthService,
  SocialUser,
  GoogleLoginProvider
} from 'angularx-social-login';
import {
  FormControl,
  FormControlName,
  FormGroup,
  Validators
} from '@angular/forms';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ContactMessageService } from '@core/services/contactmessage/contact-message.service';
import { style } from '@angular/animations';
import { TelegramLinkAccountService } from '@core/services/telegramAuth/telegram-link-account.service';
import { MatchPasswordValidator } from '@helpers/form-validators';
import { NgxSpinnerService } from 'ngx-spinner';
import {
  catchError,
  filter,
  ignoreElements,
  mergeMap,
  takeUntil,
  map
} from 'rxjs/operators';
import { DomSanitizer } from '@angular/platform-browser';
import { of, Subject, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { sattUrl } from '@config/atn.config';
import { AuthService } from '@app/core/services/Auth/auth.service';
import { TokenStorageService } from '@core/services/tokenStorage/token-storage-service.service';
import { environment } from '@environments/environment';
import { WalletFacadeService } from '@core/facades/wallet-facade.service';
import { ProfileSettingsFacadeService } from '@core/facades/profile-settings-facade.service';
import { AuthStoreService } from '@core/services/Auth/auth-store.service';
import { AccountFacadeService } from '@app/core/facades/account-facade/account-facade.service';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { IResponseWallet } from '@app/core/iresponse-wallet';
import { IresponseAccount } from '@app/core/iresponse-account';
import { IresponseAuth } from '@app/core/iresponse-auth';
import { IresponseCode, IresponseCodeQr } from '@app/core/iresponse-code-qr';
import { User } from '@app/models/User';

interface credantials {
  email: string;
  password: string;
}
@Component({
  selector: 'app-authentication',
  templateUrl: './authentication.component.html',
  styleUrls: ['./authentication.component.css']
})
export class AuthenticationComponent implements OnInit, OnDestroy {
  public code!: number;
  isClicked!: boolean;
  status = 'start';
  @HostBinding('style.background') backgroundImage =
    'url("/assets/Images/new_back_gradient.svg")';
  @HostBinding('style.background') backgroundColor =
    'linear-gradient(180deg, #001C59 20.34%, #F52079 99.19%)';
  query = '(max-width: 767.98px)';
  mediaQueryList = window.matchMedia(this.query);
  @ViewChild('countdown') counter!: CountdownComponent;
  @ViewChild('countdowncode') countercode!: CountdownComponent;

  // @ViewChild('ErrorModal', { static: false })
  // eslint-disable-next-line @typescript-eslint/naming-convention
  // public ErrorModal!: TemplateRef<any>;
  @ViewChild('lostpwdModal', { static: false })
  public lostpwdModal!: TemplateRef<ElementRef>;
  @ViewChild('script') script!: ElementRef;
  @ViewChild('iframe') myIframe: ElementRef | null = null;
  eventsSubject: Subject<void> = new Subject<void>();

  reset: object = {
    username: null
  };
  // eslint-disable-next-line @typescript-eslint/naming-convention
  errorMessage_validation: string = '';
  routerSub!: Subscription;
  loginNet: string = '';
  authForm: FormGroup;
  formL: FormGroup;
  resetPasswordForm: FormGroup;
  language: string = 'Fr';
  isSuccessful = false;
  isSubmitting = false;
  errorMessage = '';
  errorMessagecode = '';
  accountInvalideError: string = '';
  errorMessagePwd = '';
  // snLoginLoading: any[''];
  pltfrm: string = '';
  // vars: any;
  // error: any = null;
  isCollapsed: boolean = true;
  emailNotFound: boolean = false;
  languageSelected: string = 'en';
  isNotAuthorized = false;
  showSpinner: boolean = false;
  socialUser: SocialUser | undefined;
  isLoggedin: boolean = false;
  authresetpwd: string = sattUrl + '/resetpssword';
  authFacebook: string = sattUrl + '/auth/fb';
  authGoogle: string = sattUrl + '/auth/google';
  authTelegram: string = sattUrl + '/auth/telegram';
  cookiesClicked!: boolean;
  validated = '';
  // codeFromUrl: any;
  // idFromUrl: any;
  isSub = false;
  french: boolean = true;
  disabled: boolean = false;
  authError: boolean = false;
  english: boolean = true;
  showBigSpinner: boolean = false;
  cookieValue: string = this.cookie.get('satt_cookies');
  cookieExists: boolean = this.cookie.check('satt_cookies');
  scale: boolean = false;
  boo: boolean = false;
  condition: boolean = false;
  blocktime!: number;
  timeLeftToUnLock!: number;
  blockedForgetPassword: boolean = false;
  formCode: FormGroup;
  confirmCodeShow: boolean = false;
  codesms: boolean = false;
  loginshow: boolean = true;
  expiresToken!: number;
  isModalClosed: boolean = false;
  show = '';
  idUser!: number;
  forgotpassword: boolean = true;
  recoverpassword: boolean = false;
  loggedrs: boolean = false;
  private onDestroy$ = new Subject();
  private account$ = this.accountFacadeService.account$;
  constructor(
    private modalService: NgbModal,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    public translate: TranslateService,
    public contactmessage: ContactMessageService,
    private telegramLinkAccountService: TelegramLinkAccountService,
    public _changeDetectorRef: ChangeDetectorRef,
    private cookie: CookieService,
    private spinner: NgxSpinnerService,
    private profileSettingsFacade: ProfileSettingsFacadeService,
    private walletFacade: WalletFacadeService,
    private accountFacadeService: AccountFacadeService,
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: string,
    private tokenStorageService: TokenStorageService
  ) {
    translate.addLangs(['en', 'fr']);
    if (this.tokenStorageService.getLocale()) {
      // @ts-ignore
      this.languageSelected = this.tokenStorageService.getLocale();
      translate.setDefaultLang(this.languageSelected);
      this.translate.use(this.languageSelected);
    } else {
      this.tokenStorageService.setLocalLang('en');
      this.languageSelected = 'en';
      translate.setDefaultLang('en');
      this.translate.use(this.languageSelected);
    }
    translate.onLangChange
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((event: LangChangeEvent) => {
        this.languageSelected = event.lang;
        this._changeDetectorRef.detectChanges();
        this.translate.use(this.languageSelected);

        if (this.languageSelected === 'en') {
          this.english = true;
        } else {
          this.english = false;
        }
        if (this.languageSelected === 'fr') {
          this.french = true;
        } else {
          this.french = false;
        }
      });
    this.formCode = new FormGroup({
      code: new FormControl(null, [Validators.required])
    });

    this.authForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', Validators.required)
    });
    this.formL = new FormGroup({
      email: new FormControl(null, [Validators.required, Validators.email])
    });
    this.telegramLinkAccountService.init();
    this.resetPasswordForm = new FormGroup(
      {
        password: new FormControl(null, {
          validators: [
            Validators.required,
            Validators.minLength(8),
            Validators.pattern(
              /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{0,}/
            )
          ]
        }),
        confirmPassword: new FormControl(null, [Validators.required])
      },
      { validators: MatchPasswordValidator() }
    );
  }
  /*****************cookies******************** 
getCookie(key: string){
  return this.cookieService.get(key);
}
/****************************************** */

  ngOnInit() {
    if (this.mediaQueryList.matches) {
      this.backgroundImage = '';
      this.backgroundColor =
        'linear-gradient(180deg, #001C59 20.34%, #F52079 99.19%)';
    } else {
      this.backgroundImage = '';
      this.backgroundColor = '';
    }
    if (!this.cookieExists) {
      this.cookiesClicked = true;
    }
    if (this.cookieValue === 'pass') {
      this.cookiesClicked = false;
    }

    this.skipLoginWhenRedirected();
    //this.getParmsFromUrl();
    this.convertToScript();
  }
  get getControls() {
    return this.authForm.controls;
  }
  ngAfterViewInit() {
    this.convertToScript();
  }
  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    if (isPlatformBrowser(this.platformId)) {
      if (this.mediaQueryList.matches) {
        this.backgroundColor =
          'linear-gradient(180deg, #001C59 20.34%, #F52079 99.19%)';
      } else {
        this.backgroundImage = '';
        this.backgroundColor = '';
      }
    }
  }
  onCodeCompleted(code: string) {
    // this.codesms = code
    this.formCode.get('code')?.setValue(code);
    this.verifyQRCode();
  }
  onCodeConfirmCompleted(code: string) {
    // this.codesms = code
    this.formCode.get('code')?.setValue(code);
    this.verifyCode();
  }

  /**
   * Will redirect user to his wallet page without passing through
   * the login page when a query param containing token exist in th url.
   */

  skipLoginWhenRedirected() {
    this.routerSub = this.route.queryParams
      .pipe(
        mergeMap((p) => {
          if (p.message === 'account_already_used') {
            if (p.idSn === 1) {
              this.errorMessage = 'connect_with_fb';
              setTimeout(() => {
                this.errorMessage = '';
                this.router.navigate(['/auth/login']);
              }, 6000);
            } else if (p.idSn === 2) {
              this.errorMessage = 'connect_with_gplus';
              setTimeout(() => {
                this.errorMessage = '';
                this.router.navigate(['/auth/login']);
              }, 6000);
            } else if (p.idSn === 5) {
              this.errorMessage = 'connect_with_telegram';
              setTimeout(() => {
                this.errorMessage = '';
                this.router.navigate(['/auth/login']);
              }, 6000);
            } else {
              this.errorMessage = 'connect_with_form';
              setTimeout(() => {
                this.errorMessage = '';
                this.router.navigate(['/auth/login']);
              }, 6000);
            }
          } else if (p.message === 'Register First') {
            this.errorMessage = 'Register_First';
            setTimeout(() => {
              this.errorMessage = '';
              this.router.navigate(['/auth/login']);
            }, 6000);
          } else if (p.message === 'account_invalide') {
            this.errorMessage = 'account_invalide';
            setTimeout(() => {
              this.errorMessage = '';
              this.router.navigate(['/auth/login']);
            }, 6000);
          } else if (
            p.message === 'account already activated' ||
            p.message === 'activated'
          ) {
            this.errorMessage = 'account_already_activated';
            this.boo = true;
            setTimeout(() => {
              this.errorMessage = '';
              this.router.navigate(['/auth/login']);
            }, 6000);
          }
          if (p.token) {
            this.showBigSpinner = true;
            let token = JSON.parse(p.token);
            this.tokenStorageService.saveToken(token.access_token);
            this.tokenStorageService.saveExpire(token.expires_in);
            this.accountFacadeService.dispatchUpdatedAccount();
            return this.account$.pipe(
              filter((res) => res !== null),
              takeUntil(this.onDestroy$)
            );
          } else {
            return of(null);
          }
        })
      )
      .pipe(
        filter((res) => res !== null),
        takeUntil(this.onDestroy$)
      )

      .subscribe((data: User | null) => {
        this.tokenStorageService.saveIdSn(data?.idSn);
        this.tokenStorageService.saveUserId(data?.idUser);
        if (
          (!data?.completed && data?.idSn !== 0) ||
          (data?.completed && data?.idSn !== 0 && !data?.enabled) ||
          (data?.completed === undefined && data?.idSn !== 0) ||
          (data?.enabled === undefined && data?.idSn !== 0)
        ) {
          this.router.navigate(['social-registration/completeProfile']);
        } else {
          setTimeout(() => this.router.navigate(['wallet']), 2000);
        }
      });
  }

  ngOnDestroy() {
    this.onDestroy$.next('');
    this.onDestroy$.complete();
    if (!!this.routerSub) {
      this.routerSub.unsubscribe();
    }
  }

  snlogin(social: string) {
    this.scale = true;
    this.loggedrs = true;
    if (this.cookie.get('satt_cookies') === 'pass') {
      //window.location.href = sattUrl + "/snlogin/" + social;
      if (social === 'facebook') {
        this.loginNet = 'facebook';
        if (isPlatformBrowser(this.platformId)) {
          window.location.href = this.authFacebook;
        }
      } else if (social === 'google') {
        this.loginNet = 'google';
        if (isPlatformBrowser(this.platformId)) {
          window.location.href = this.authGoogle;
        }
      }
    }
  }

  /**
   * Get authForm controls.
   */
  get f() {
    return this.authForm.controls;
  }
  get formF() {
    return this.formL.controls;
  }

  onValueChanged(value: boolean, puzzle: TemplateRef<ElementRef>) {
    if (value === true) {
      this.login();
      this.closeModal(puzzle);
    }
  }
  goToSignup() {
    this.router.navigate(['/auth/registration']);
  }
  /**
   * Authenticate user
   */
  login() {
    this.isSubmitting = true;
    this.showSpinner = true;
    this.scale = true;
    if (this.authForm.valid && this.cookie.get('satt_cookies') === 'pass') {
      const noredirect = 'true';
      this.authService
        .login(this.f.email?.value, this.f.password?.value, noredirect)
        .pipe(
          takeUntil(this.onDestroy$),
          catchError((err) => {
            this.errorMessage = 'login_error';
            this.showSpinner = false;
            return of(null);
          }),
          mergeMap((data: IresponseAuth | null) => {
            if (data?.access_token !== undefined) {
              this.tokenStorageService.setItem(
                'access_token',
                data.access_token
              );
              this.tokenStorageService.saveExpire(data.expires_in);
              // this.tokenStorageService.saveToken(data.access_token);
              this.expiresToken = data.expires_in;
              this.accountFacadeService.dispatchUpdatedAccount();
              return this.account$.pipe(
                filter((response) => response !== null),
                map((response) => {
                  return { data, response };
                }),
                take(1)
              );
            } else if (data?.message === 'invalid_grant') {
              this.errorMessage = 'invalid_credentials';
              this.authForm.get('password')?.setValue('');
              this.f.password.reset();
              this.f.email.clearValidators();
              this.f.email.updateValueAndValidity();
              this.f.password.clearValidators();
              this.f.password.updateValueAndValidity();
            } else if (data?.message === 'account_invalide') {
              this.errorMessage = 'account_invalide';
              this.f.password.reset();
            } else if (data?.message === 'access_denied') {
              this.errorMessage = 'account_invalide';
              this.f.password.reset();
            } else if (data?.message === 'account_locked') {
              this.errorMessage = 'account_locked';
              if (this.blocktime && this.blocktime !== data?.blockedDate)
                this.counter.restart();
              this.blocktime = data?.blockedDate + 1800;
              this.timeLeftToUnLock =
                this.blocktime - Math.floor(Date.now() / 1000);
              this.f.password.reset();
              this.blockedForgetPassword = true;
            } else if (data?.message === 'email_already_used') {
              this.errorMessage = 'connect_with_gfplus';
              this.f.password.reset();
            }
            return of(null);
          })
        )
        .pipe(
          filter(({ data, response }: any) => {
            return response !== null;
          }),
          catchError((error: HttpErrorResponse) => {
            if (error.error.text === 'Invalid Access Token') {
              this.tokenStorageService.signOut();
            }
            return of(null);
          }),
          mergeMap(
            ({ data, response }: { data: IresponseAuth; response: User }) => {
              this.tokenStorageService.setHeader();
              this.tokenStorageService.saveUserId(response.idUser);
              this.tokenStorageService.saveIdSn(response.idSn);
              this.idUser = Number(response.idUser);
              if (response.is2FA === true) {
                this.tokenStorageService.setItem('valid2FA', 'false');
                this.confirmCodeShow = true;
                this.loginshow = false;
              } else {
                this.tokenStorageService.saveToken(data.access_token);
                if (response.enabled === 0) {
                  // this.errorMessage_validation="account_not_verified";
                  // tokenStorageService.clear();any
                  this.tokenStorageService.setItem('enabled', '0');
                  this.router.navigate(
                    ['/social-registration/activation-mail'],
                    {
                      queryParams: {
                        email: this.authForm.get('email')?.value
                      }
                    }
                  );
                } else {
                  if (response.idSn !== 0) {
                    if (
                      !response.completed ||
                      (response.completed && !response.enabled)
                    ) {
                      this.router.navigate([
                        'social-registration/completeProfile'
                      ]);
                      this.showBigSpinner = true;
                      // this.spinner.hide();
                    } else {
                      return this.walletFacade.getUserWallet().pipe(
                        map((myWallet: IResponseWallet) => ({
                          myWallet,
                          response
                        })),
                        takeUntil(this.onDestroy$)
                      );
                    }
                  } else {
                    return this.walletFacade.getUserWallet().pipe(
                      map((myWallet: IResponseWallet) => ({
                        myWallet,
                        response
                      })),
                      takeUntil(this.onDestroy$)
                    );
                  }
                }
              }
              return of(null);
            }
          )
        )
        .pipe(
          filter((res: any) => {
            if (!res) {
              return false;
            }
            return res.myWallet !== null;
          }),
          takeUntil(this.onDestroy$)
        )
        .subscribe(
          ({
            myWallet,
            response
          }: {
            myWallet: IResponseWallet;
            response: IresponseAccount;
          }) => {
            if (!myWallet) {
              return;
            }
            if (myWallet.address) {
              if (response.new) {
                if (!response.passphrase) {
                  this.router.navigate(['/social-registration/pass-phrase']);
                } else {
                  this.tokenStorageService.saveIdWallet(myWallet.address);
                  this.router.navigate(['']);
                  this.showBigSpinner = true;
                  this.backgroundImage = '';
                  this.backgroundColor = '';
                }
              } else {
                this.tokenStorageService.saveIdWallet(myWallet.address);
                this.router.navigate(['']);
                this.showBigSpinner = true;
                this.backgroundImage = '';
                this.backgroundColor = '';
              }

              // this.spinner.hide();
            } else if (myWallet.err === 'no_account') {
              this.tokenStorageService.setSecureWallet(
                'visited-completeProfile',
                'true'
              );
              this.router.navigate(['social-registration/monetize-facebook']);
              this.showBigSpinner = true;
              //this.spinner.hide();
            }
          }
        );
    } else {
      this.showSpinner = false;
    }
  }

  verifyQRCode() {
    let body = {
      id: this.idUser,
      code: this.formCode.get('code')?.value
    };
    this.profileSettingsFacade
      .verifyQRCode(body)
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((data: IresponseCodeQr) => {
        if (data.verifiedCode === false) {
          this.errorMessagecode = 'code incorrect';
          this.codesms = false;
        } else if (data.verifiedCode === true) {
          this.codesms = true;
          let msg = '';
          this.errorMessagecode = 'code correct';
        }
      });
  }
  nextRedirection() {
    if (!this.codesms) {
      return;
    }
    this.authService
      .verifyAccount()
      .pipe(
        mergeMap((response: IresponseAccount) => {
          if (response) {
            this.tokenStorageService.saveUserId(response.idUser);
            this.tokenStorageService.saveIdSn(response.idSn);
            this.tokenStorageService.setItem('valid2FA', '');
            this.tokenStorageService.setItem('isAuthenticated', 'true');
            this.tokenStorageService.saveExpire(this.expiresToken);
            this.tokenStorageService.setHeader();

            if (
              (!response.completed && response.idSn !== '0') ||
              (response.completed && response.idSn !== '0' && !response.enabled)
            ) {
              this.router.navigate(['/social-registration/completeProfile']);
              this.showBigSpinner = true;
              // this.spinner.hide();
            } else {
              return this.walletFacade.getUserWallet();
            }
          }
          return of(null);
        })
      )
      .pipe(
        filter((res) => res !== null),
        takeUntil(this.onDestroy$)
      )
      .subscribe((myWallet: IResponseWallet | null) => {
        if (myWallet?.address) {
          this.tokenStorageService.saveIdWallet(myWallet.address);
          this.router.navigate(['']);
          this.showBigSpinner = true;
          this.backgroundImage = '';
          this.backgroundColor = '';
          // this.spinner.hide();
        } else if (myWallet?.err === 'no_account') {
          this.tokenStorageService.setSecureWallet(
            'visited-completeProfile',
            'true'
          );
          this.router.navigate(['/social-registration/monetize-facebook']);
          this.showBigSpinner = true;
          //this.spinner.hide();
        }
      });
  }
  /**
   * Sends a new confirmation mail to th user.
   */
  sendConfirmationMail() {
    let email = this.authForm.get('email')?.value;
    const link = `<span style="color:#4048FF" >${email}</span >`;
    this.authService
      .sendConfirmationMail(this.authForm.get('email')?.value)
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((response) => {
        if (response) {
          if (this.languageSelected === 'fr') {
            Swal.fire({
              icon: 'success',
              html: `Un nouveau email de verification a été envoyé à l'adresse ${link}. Merci de verfier votre spam si vous puver pas le trouvez `
            }).then(() => {
              // window.location.href = "/auth/login";
              if (isPlatformBrowser(this.platformId)) {
                window.location.reload();
              }
            });
          } else {
            Swal.fire({
              icon: 'success',
              html: `A new verification email has been sent to ${link}. please check your spam in case you can't find it.`
            }).then(() => {
              if (isPlatformBrowser(this.platformId)) {
                window.location.href = '/auth/login';
              }
            });
          }
        }
      });
  }

  goToRegistration() {
    this.router.navigate(['auth/registration']);
    // this.closeModal(this.ErrorModal)
  }

  switchLang(lang: string) {
    //TOOD: Not sure what this line of code does!!
    //document.getElementById('content');
    this.tokenStorageService.removeItem('local');
    this.tokenStorageService.setItem('local', lang);
    this.languageSelected = lang;
    this.translate.use(lang);
  }
  convertToScript() {
    if (
      this.cookie.get('satt_cookies') === 'pass' &&
      isPlatformBrowser(this.platformId)
    ) {
      this.loggedrs = true;
      const element = this.script?.nativeElement;
      const script = this.document.createElement('script');
      script.src = 'https://telegram.org/js/telegram-widget.js?14';
      script.setAttribute('data-telegram-login', environment.telegramBot);
      script.setAttribute('data-size', 'large');
      //script.setAttribute("data-onauth","onTelegramAuth(user)");
      script.setAttribute('data-auth-url', sattUrl + '/auth/telegram');

      script.setAttribute('data-request-access', 'write');
      script.setAttribute('data-userpic', 'false');
      script.setAttribute('data-radius', '15');
      // Callback function in global scope
      element?.parentElement.replaceChild(script, element);
    }
  }

  openModal(content: TemplateRef<ElementRef>) {
    if (!this.blockedForgetPassword) {
      this.modalService.open(content);
    }
  }

  chooseModal() {
    this.show = 'first';
  }

  closeModal(content: TemplateRef<ElementRef>) {
    this.modalService.dismissAll(content);
    this.showSpinner = false;
  }

  verifyCode() {
    let code = this.formCode.get('code')?.value;
    let email = this.formL.get('email')?.value;
    let type = 'reset';
    this.authService
      .confirmCode(email.toLowerCase(), code, type)
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((data: IresponseCode) => {
        if (data.message === 'code incorrect') {
          this.errorMessagecode = 'code incorrect';
          this.formCode.reset();
          //  this.codeInput.reset();
          this.codesms = false;
          // setTimeout(() => {
          //     this.errorMessagecode = ''
          // }, 2000);
        } else if (data.message === 'code expired') {
          this.errorMessagecode = 'code expired';
          this.formCode.reset();
          //  this.codeInput.reset();
          this.codesms = false;
          // setTimeout(() => {
          //     this.errorMessagecode = ''
          // }, 2000);
        } else {
          this.codesms = true;
          this.errorMessagecode = 'code correct';
        }
      });
  }

  changePwd() {
    let email = this.formL.get('email')?.value;
    this.router.navigate(['auth/resetpassword'], {
      queryParams: { email }
    });
  }

  clickedReset: boolean = false;
  resetPassword() {
    this.isSub = true;
    let email = this.formL.get('email')?.value;
    const link = `<span style="color:#4048FF" >${email}</span >`;
    this.authService
      .resetPassword(email)
      .pipe(takeUntil(this.onDestroy$))
      .subscribe(
        (data) => {
          if (data && data.message) {
            this.show = 'second';
            this.forgotpassword = false;
            this.recoverpassword = true;
            this.clickedReset = !this.clickedReset;
            if (data.message === 'account_locked') {
              this.closeModal(this.lostpwdModal);
              //if(this.blocktime && this.blocktime != data.blockedDate) this.counter.restart();
              this.errorMessage = 'account_locked';
              this.blocktime = data.blockedDate + 1800;
              this.timeLeftToUnLock =
                this.blocktime - Math.floor(Date.now() / 1000);
              this.blockedForgetPassword = true;
            }

            this.isCollapsed = false;
          }
        },
        (error) => {
          if (error.error.text === 'connect_with_gplus') {
            this.errorMessagePwd = 'connect_with_gplus';
          } else if (error['error'].message === 'connect_with_fb') {
            this.errorMessagePwd = 'connect_with_fb';
          } else {
            this.errorMessagePwd = 'account_not_exists';
            setTimeout(() => {
              this.errorMessagePwd = '';
              this.formL.reset();
              this.formF.email.clearValidators();
              this.formF.email.updateValueAndValidity();
            }, 6000);
          }
        }
      );
  }

  // dontShowAgain(){
  //   this.toggle =false ;
  //    let data_profile = {
  //     toggle: false,
  //    }
  //    this.ProfileService.updateprofile(data_profile).subscribe(
  //        (response: any) => {}
  //    )
  //   }
  finishTest(event: CountdownEvent) {
    if (event.action === 'notify') {
      this.blockedForgetPassword = false;
    }
  }

  cookies() {
    this.cookie.set('satt_cookies', 'pass', { expires: 30, sameSite: 'Lax' });
    this.cookiesClicked = false;
  }

  captchapuzzle(puzzle: TemplateRef<ElementRef>) {
    this.showSpinner = true;
    setTimeout(() => {
      this.spinner.hide();
      this.showBigSpinner = false;
    }, 1000);
    this.spinner.show();
    // this.showBigSpinner = true;

    this.modalService.open(puzzle);
  }
}
