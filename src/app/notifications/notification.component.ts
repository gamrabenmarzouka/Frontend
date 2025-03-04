import {
  Component,
  OnInit,
  ChangeDetectorRef,
  ElementRef,
  PLATFORM_ID,
  Inject
} from '@angular/core';
import { NotificationService } from '@core/services/notification/notification.service';
import { ContactService } from '@core/services/contact/contact.service';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
//import * as moment from 'moment';
import _ from 'lodash';
import { walletUrl, ListTokens, tronScan } from '@config/atn.config';
import { isPlatformBrowser } from '@angular/common';
import { bscan, etherscan, polygonscan, bttscan } from '@app/config/atn.config';
//import 'moment/locale/fr'

import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { Big } from 'big.js';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TokenStorageService } from '@app/core/services/tokenStorage/token-storage-service.service';
import { INotificationsResponse } from '@app/core/notifications-response.interface';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import moment from 'moment';
import { environment } from '@environments/environment';

@Component({
  selector: 'app-history',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css']
})
export class NotificationComponent implements OnInit {
  searchTerm: any;
  term: any;
  public currentLang: string | undefined;
  form: UntypedFormGroup;
  searchvalue: string = '';
  arrayTypeNotification: Array<{ type: string; type_notif: string }>;
  arrayContact: any;
  dataNotification: any;
  dataNotificationFilter: any;
  dateDebutValue: any;
  dateFinValue: any;
  typeNotifValue: any;
  contactValue: any;
  isloading: boolean = false;
  nodata: boolean = true;
  isfocused: boolean = false;
  isClickedOutside: boolean = true;
  showSpinner!: boolean;
  crypto: any;
  private isDestroyed = new Subject();

  offset: any;
  // tansfer:string='transfer_event_currency'
  bscan = environment.bscan;
  etherscan = environment.etherscan;
  tronScan = environment.tronScan;
  polygonscan = environment.polygonscan;
  bttscan = environment.bttscan;

  newNotification: boolean = false;
  errorMessagecode = '';
  modalReference: any;
  constructor(
    private eRef: ElementRef,
    private _changeDetectorRef: ChangeDetectorRef,
    private NotificationService: NotificationService,
    private ContatcService: ContactService,
    private translate: TranslateService,
    public router: Router,
    private activatedRoute: ActivatedRoute,
    private tokenStorageService: TokenStorageService,
    @Inject(PLATFORM_ID) private platformId: string,
    private modalService: NgbModal
  ) {
    this.arrayTypeNotification = [
      { type: 'transfer_satt_event', type_notif: 'send_satt' },
      { type: 'received_satt_event', type_notif: 'receive_satt' },
      { type: 'contact_satt_event', type_notif: 'contact_' }
    ];

    this.form = new UntypedFormGroup({
      type_notification: new UntypedFormControl(null, Validators.required),
      contact: new UntypedFormControl(null, Validators.required),
      date_debut: new UntypedFormControl(null, Validators.required),
      date_fin: new UntypedFormControl(null, Validators.required)
    });

    translate.onLangChange
      .pipe(takeUntil(this.isDestroyed))
      .subscribe((event: LangChangeEvent) => {
        this.currentLang = event.lang;
        this._changeDetectorRef.detectChanges();
        this.translate.use(this.currentLang);
        this.getAllNotifications();
      });
  }
  ngOnInit(): void {
    this.getAllNotifications();
  }
  seeNotification() {
    this.NotificationService.notificationSeen()
      .pipe(takeUntil(this.isDestroyed))
      .subscribe((response: any) => {
        if (response?.message === 'Notification clicked') {
          this.newNotification = false;
        }
      });
  }

  filtrer() {
    this.showSpinner = true;
    this.dateDebutValue = this.form.get('date_debut')?.value;
    this.dateFinValue = this.form.get('date_fin')?.value;
    this.typeNotifValue = this.form.get('type_notification')?.value;
    this.contactValue = this.form.get('contact')?.value;
    this.NotificationService.getAllNotifications()
      .pipe(takeUntil(this.isDestroyed))
      .subscribe(
        (response: any) => {
          if (response.code === 200 && response.message === 'success') {
            this.showSpinner = false;
            this.dataNotificationFilter = response.data.notifications;
            //--------------------------------filter with date and type
            if (
              this.typeNotifValue &&
              this.dateDebutValue &&
              this.dateFinValue
            ) {
              const filter_type_date = this.dataNotificationFilter.forEach(
                (item: any) => {
                  return (
                    item.type === this.typeNotifValue &&
                    item.created > this.dateDebutValue &&
                    item.created < this.dateFinValue
                  );
                }
              );
              if (filter_type_date) {
                this.nodata = false;
                filter_type_date.forEach((item2: any) => {
                  this.siwtchFunction(item2);
                });
                this.dataNotification = _.chain(filter_type_date)
                  .groupBy('created')
                  .map((value: any, key: any) => ({ created: key, value }))
                  .value();
              } else {
                this.nodata = true;
                this.dataNotification = [];
              }
              this.dateDebutValue = this.form.get('date_debut')?.setValue(null);
              this.dateFinValue = this.form.get('date_fin')?.setValue(null);
              this.typeNotifValue = this.form
                .get('type_notification')
                ?.setValue(null);
            }
            //------------------------------filter with date
            else if (this.dateDebutValue && this.dateFinValue) {
              const filter_date = this.dataNotificationFilter.forEach(
                (item: any) => {
                  return (
                    item.created > this.dateDebutValue &&
                    item.created < this.dateFinValue
                  );
                }
              );
              if (filter_date) {
                this.nodata = false;
                filter_date.forEach((item2: any) => {
                  this.siwtchFunction(item2);
                });
                this.dataNotification = _.chain(filter_date)
                  .groupBy('created')
                  .map((value: any, key: any) => ({ created: key, value }))
                  .value();
              } else {
                this.nodata = true;
                this.dataNotification = [];
              }
              this.dateDebutValue = this.form.get('date_debut')?.setValue(null);
              this.dateFinValue = this.form.get('date_fin')?.setValue(null);
            }
            //------------------------------filter with type
            else if (this.typeNotifValue) {
              const filter_type = this.dataNotificationFilter.forEach(
                (item: any) => {
                  return item.type === this.typeNotifValue;
                }
              );
              if (filter_type) {
                this.nodata = false;
                filter_type.forEach((item2: any) => {
                  this.siwtchFunction(item2);
                });
                this.dataNotification = _.chain(filter_type)
                  .groupBy('created')
                  .map((value: any, key: any) => ({ created: key, value }))
                  .value();
              } else {
                this.nodata = true;
                this.dataNotification = [];
              }
            } else {
              this.getAllNotifications();
            }
            this.typeNotifValue = this.form
              .get('type_notification')
              ?.setValue(null);
          } else {
            this.nodata = true;
            this.dataNotification = [];
          }
        },
        () => {}
      );
  }
  getAllNotifications() {
    this.showSpinner = true;
    this.NotificationService.getAllNotifications()
      .pipe(takeUntil(this.isDestroyed))
      .subscribe((response: INotificationsResponse) => {
        if (!response) {
          this.showSpinner = false;

          this.errorMessagecode = 'No notifications found';
        }

        if (response !== null && response !== undefined) {
          this.showSpinner = false;
          this.isloading = false;
          this.dataNotification = response.data.notifications;
          if (response.data.isSeen !== 0) {
            this.seeNotification();
          }

          this.dataNotification.forEach((item: any) => {
            item.created =
              item.created && item.created !== 'a few seconds ago'
                ? item.created
                : item.createdAt;
            this.siwtchFunction(item);
          });
          this.dataNotification = _.chain(this.dataNotification)
            .sortBy((data) => data.createdInit)
            .reverse()
            .groupBy('created')
            .map((value: any, key: any) => {
              return { created: key, value };
            })
            .value();
        }
      });
  }
  onScroll() {
    if (this.isloading) {
      this.showSpinner = true;
    }
  }

  siwtchFunction(item: any) {
    const etherInWei = new Big(1000000000000000000);
    let itemDate = new Date(item.created);
    item.createdInit = item.created;
    if (this.tokenStorageService.getLocalLang() === 'en') {
      item.createdFormated = moment
        .parseZone(itemDate)
        .format(' MMMM Do YYYY, h:mm a z');
      item.created = moment.parseZone(item.created).fromNow().slice();
    } else if (this.tokenStorageService.getLocalLang() === 'fr') {
      item.createdFormated = moment
        .parseZone(itemDate)
        .locale('fr')
        .format(' Do MMMM  YYYY, HH:mm a z');
      item.created = moment.parseZone(itemDate).locale('fr').fromNow();
    }
    // console.log(this.translate.instant(''))
    //  let typeof_data=typeof(item.label)
    //  console.log(this.translate.instant(''))
    //    if(typeof_data =='object'){
    //   item._label= item.label
    // }else{
    //   item._label = JSON.parse(item.label )
    // }
    item._label = item.label;

    const receive_satt_pic = './assets/Images/notifIcons/Reception.svg';
    switch (item.type) {
      case 'buy_some_gas':
        item._label = 'buy_some_gas';
        item.img = receive_satt_pic;
        item.content = 'gas_notif';
        break;
      case 'invite_friends':
        item._label = 'invite_friends';
        item.img = receive_satt_pic;
        item.content = 'invite_notif';
        break;
      case 'join_on_social':
        item._label = 'join_on_social';
        item.img = receive_satt_pic;
        item.content = 'network_notif';
        break;
      case 'send_demande_satt_event':
        item._params = {
          nbr: item._label['price'],
          crypto:
            item._label['cryptoCurrency'] &&
            (item._label['cryptoCurrency'] === 'SATTBEP20' ||
              item._label['cryptoCurrency'] === 'SATTPOLYGON' ||
              item._label['currency'] === 'SATTBTT' ||
              item._label['currency'] === 'SATTTRON')
              ? 'SATT'
              : item._label['cryptoCurrency'] ||
                (item._label['currency'] &&
                  (item._label['currency'] === 'SATTBEP20' ||
                    item._label['currency'] === 'SATTPOLYGON' ||
                    item._label['currency'] === 'SATTBTT' ||
                    item._label['currency'] === 'SATTTRON'))
              ? 'SATT'
              : item._label['currency'],
          // crypto: item._label['currency'],
          name: item._label['name']
        };
        item._label = 'asked_to_acquire';
        item.img = receive_satt_pic;
        break;
      //////////////////////////////////////////
      case 'demande_satt_event':
        item._params = {
          nbr: item._label['price'],
          crypto:
            item._label['cryptoCurrency'] &&
            (item._label['cryptoCurrency'] === 'SATTBEP20' ||
              item._label['cryptoCurrency'] === 'SATTPOLYGON' ||
              item._label['currency'] === 'SATTBTT' ||
              item._label['currency'] === 'SATTTRON')
              ? 'SATT'
              : item._label['cryptoCurrency'] ||
                (item._label['currency'] &&
                  (item._label['currency'] === 'SATTBEP20' ||
                    item._label['currency'] === 'SATTPOLYGON' ||
                    item._label['currency'] === 'SATTBTT' ||
                    item._label['currency'] === 'SATTTRON'))
              ? 'SATT'
              : item._label['currency'],
          name: item._label['name']
        };
        item._label = 'asked_cryptoCurrency';
        item.img = receive_satt_pic;
        break;
      //////////////////////////////////////////
      case 'save_legal_file_event':
        if (item._label['type'] === 'proofDomicile') {
          item._label = 'confirm_legal_kyc_proof';
        } else {
          item._label = 'confirm_legal_kyc_identity';
        }
        item.img = './assets/Images/notifIcons/CandidValid.svg';
        break;
      //////////////////////////////////////////
      case 'validated_link':
        item._params = {
          name: item._label['cmp_name'],
          link: item._label['cmp_link'],
          hash: item._label['cmp_hash']
        };
        item._label = 'campaign_notification.candidate_accept_link';
        item.img = './assets/Images/notifIcons/lienAccepte.svg';
        break;
      //////////////////////////////////////////

      case 'transfer_event':
        if (item._label['currency']) {
          item._label['currency'] === "SATTPOLYGON" && (item._label['decimal'] = 18)
          let decimal = item._label['decimal']
            ? new Big('10').pow(item._label['decimal'])
            : ListTokens[item._label.currency].decimals;

          item._params = {
            currency:
              item._label['currency'] === 'SATTBEP20' ||
              item._label['currency'] === 'SATTPOLYGON' ||
              item._label['currency'] === 'SATTBTT' ||
              item._label['currency'] === 'SATTTRON'
                ? 'SATT'
                : item.label['currency'],
            nbr: Big(item._label['amount']).div(decimal),
            //  currency: item._label["currency"],
            to: item._label['to']
          };
          item._label = 'transfer_event_currency';
        } else if (item._label['network']) {
          item._params = {
            nbr: Big(item._label['amount']).div(etherInWei),
            network: item._label['network'],
            to: item._label['to']
          };
          item._label = 'transfer_event_network';
        }
        item.img = './assets/Images/notifIcons/envoi.svg';
        break;

      /*
            item._label['currency'] === 'SATTBEP20' ||
              item._label['currency'] === 'SATTPOLYGON'
              ? 'SATT': item.label['currency'],
        
        */
      //////////////////////////////////////////

      case 'receive_transfer_event':
        if (item._label['currency']) {

          item._label['currency'] === "SATTPOLYGON" && (item._label['decimal'] = 18)
          console.log(item._label['decimal'])
          let decimal = item._label['decimal']
            ? new Big('10').pow(item._label['decimal'])
            : ListTokens[item._label.currency]?.decimals;

          item._params = {
            nbr: Big(item._label['amount']).div(decimal ?? 18),
            currency:
              item._label['currency'] === 'SATTBEP20' ||
              item._label['currency'] === 'SATTPOLYGON' ||
              item._label['currency'] === 'SATTBTT' ||
              item._label['currency'] === 'SATTTRON'
                ? 'SATT'
                : item.label['currency'],
            from: item._label['from']
          };
          item._label = 'receive_transfer_event_currency';
        } else if (item._label['network']) {
          item._params = {
            nbr: Big(item._label['amount']).div(etherInWei),
            network: item._label['network'],
            from: item._label['from']
          };
          item._label = 'receive_transfer_event_network';
        }
        item.img = './assets/Images/notifIcons/Reception.svg';
        break;
      //////////////////////////////////////////
      case 'convert_event':
        item._params = {
          amount: Big(item._label['amount']).div(etherInWei),
          Direction: item._label['Direction']
        };
        item._label =
          item._label['Direction'] === 'ETB'
            ? 'convert_event_ETB'
            : 'convert_event_BTE';
        item.img = './assets/Images/notifIcons/CandidValid.svg';
        break;

      //////////////////////////////////////////
      case 'apply_campaign':
        item._params = {
          title: item._label['cmp_name'],
          owner: item._label['cmp_owner'],
          hash: item._label['txhash'] || item._label['hash']
        };
        item._label = 'apply_campaign';
        item.img = './assets/Images/notifIcons/CandidValid.svg';
        break;
      case 'rejected_link':
        item._params = {
          name: item._label['cmp_name'],
          link: item._label['cmp_link'],
          hash: item._label['cmp_hash']
        };
        item._label = 'campaign_notification.candidate_reject_link';
        item.img = './assets/Images/notifIcons/lienRefuse.svg';
        break;
      //////////////////////////////////////////
      case 'cmp_candidate_accept_link':
        item._params = {
          name: item._label['cmp_name'],
          link: item._label['cmp_link'],
          hash: item._label['hash']
        };
        item._label = 'campaign_notification.candidate_accept_link';
        item.img = './assets/Images/notifIcons/lienAccepte.svg';
        break;
      //////////////////////////////////////////
      case 'cmp_candidate_reject_link':
        item._params = {
          name: item._label['cmp_name'],
          link: item._label['cmp_link'],
          hash: item._label['cmp_hash']
        };
        item._label = 'campaign_notification.candidate_reject_link';
        item.img = './assets/Images/notifIcons/lienRefuse.svg';
        break;

      //////////////////////////////////////////
      case 'cmp_candidate_insert_link':
        item._params = {
          name: item._label['cmp_name'],
          hash: item._label['cmp_hash']
        };
        item._label = 'campaign_notification.candidate_insert_link';
        item.img = './assets/Images/notifIcons/ajoutLien.svg';
        break;
      //////////////////////////////////////////
      case 'cmp_candidate_accepted':
        item._params = {
          name: item._label['cmp_name'],
          hash: item._label['cmp_hash']
        };
        item._label = 'campaign_notification.candidate_insert_link';
        item.img = './assets/Images/notifIcons/lienAccepte.svg';
        break;
      //////////////////////////////////////////
      case 'cmp_candidate_rejected':
        item._params = {
          name: item._label['cmp_name'],
          editorCmpUrl: walletUrl + 'campaigns'
        };
        item._label = 'campaign_notification.editor_cmp_rejected';
        item.img = './assets/Images/notifIcons/lienRefuse.svg';
        break;
      //////////////////////////////////////////
      case 'validate_kyc':
        if (item._label['action'] === 'validated kyc') {
          item._label = 'kyc_validation_cofirm';
        }
        item.img = './assets/Images/notifIcons/CandidValid.svg';
        break;

      case 'kyc_validation':
        let obj = item._label;
        let type = obj.split('"')[7];
        let status = obj.split('"')[3];

        if (status === 'done') {
          if (type === 'proofId') {
            item._label = 'kyc_confirm2';
            item._params = { type: 'Identity' };
          } else if (type === 'proofDomicile') {
            item._label = 'kyc_confirm2';
            item._params = { type: 'Proof of address' };
          }
        } else {
          if (type === 'proofId') {
            item._label = 'kyc_reject2';
            item._params = { type: 'Identity' };
          } else {
            item._label = 'kyc_reject2';
            item._params = { type: 'Proof of address' };
          }
        }
        item.img = './assets/Images/notifIcons/CandidValid.svg';
        break;

      ////////////////old ones//////////////////////////
      case 'save_buy_satt_event':
        item._params = {
          amount: item._label['amount'],
          quantity: item._label['quantity']
        };
        item._label = 'buy_satt_notify';
        item.img = receive_satt_pic;
        break;
      //////////////////////////////////////////
      case 'transfer_satt_event':
        item._params = {
          nbr: item._label['amount'],
          crypto:
            item._label['currency'] === 'SATTBEP20' ||
            item._label['currency'] === 'SATTPOLYGON' ||
            item._label['currency'] === 'SATTBTT' ||
            item._label['currency'] === 'SATTTRON'
              ? 'SATT'
              : item.label['currency'],
          email: item._label[2]
        };
        item._label = 'transfer_money';
        item.img = './assets/Images/notifIcons/envoi.svg';
        break;
      //////////////////////////////////////////
      case 'received_satt_event':
        item._params = {
          nbr: item._label['amount'],
          crypto:
            item._label['currency'] === 'SATTBEP20' ||
            item._label['currency'] === 'SATTPOLYGON' ||
            item._label['currency'] === 'SATTBTT' ||
            item._label['currency'] === 'SATTTRON'
              ? 'SATT'
              : item.label['currency'],
          email: item._label[2]
        };
        item._label = 'received_satt';
        item.img = receive_satt_pic;
        break;
      //////////////////////////////////////////
      case 'add_contact_event':
        item._params = { nbr: item._label[0] };
        item._label = 'contact_satt';
        item.img = './assets/Images/notifIcons/userImg.svg';
        break;
      //////////////////////////////////////////
      case 'add_contact_fb_event':
        item._label = item._label[0];
        item.img = './assets/Images/notifIcons/userImg.svg';
        break;
      //////////////////////////////////////////
      case 'affiliation_contact_event':
        item._label = 'link_sent';
        item.img = './assets/Images/notifIcons/ajoutLien.svg';
        break;
      //////////////////////////////////////////
      case 'contact_satt_event':
        item._params = { email: item._label[0] };
        item._label = 'contact_satt_list';
        item.img = './assets/Images/notifIcons/userImg.svg';
        break;
      //////////////////////////////////////////
      case 'import_event':
        item._params = { nbr: item._label[2], file: item._label[1] };
        item._label = 'contact_satt_import';
        item.img = './assets/Images/notifContact.svg';
        break;
      //////////////////////////////////////////
      case 'send_mail_event':
        item._params = { email: item._label[0] };
        item._label = 'email_has_been_sent';
        item.img = './assets/Images/notifIcons/envoi.svg';
        break;
      //////////////////////////////////////////
      case 'buy_satt_event':
        item._params = {
          amount: item._label['amount'],
          quantity: item._label['quantity']
        };
        item._label = 'buy_satt_notify';
        item.img = receive_satt_pic;
        break;

      //////////////////////////////////////////
    }
  }

  tr(item: any, params: any) {
    if (!params) {
      return this.translate.instant(item || ' ');
    } else {
    }
  }

  onFocus() {
    this.isfocused = true;
  }
  focusOutFunction() {
    this.isfocused = false;
  }

  hashLink(network: any, link: any) {
    if (network === 'eth' && isPlatformBrowser(this.platformId)) {
      window.open(etherscan + link, '_blank');
    } else if (
      (network === 'bsc' || network === 'BEP20') &&
      isPlatformBrowser(this.platformId)
    ) {
      window.open(bscan + link, '_blank');
    } else if (network === 'BTTC' && isPlatformBrowser(this.platformId)) {
      window.open(bttscan + link, '_blank');
    } else if (network === 'polygon' && isPlatformBrowser(this.platformId)) {
      window.open(polygonscan + link, '_blank');
    } else if (network === 'tron' && isPlatformBrowser(this.platformId)) {
      window.open(tronScan + link, '_blank');
    }
  }

  redirect(notif: any, content: any): void {
    if (notif.type === 'join_on_social') {
      this.modalReference = this.modalService.open(content);
    }
    if (notif.type === 'invite_friends') {
      this.router.navigateByUrl('/wallet/buy-token');
    }

    if (notif.type === 'buy_some_gas') {
      this.router.navigate(['/wallet/buy-token'], {
        queryParams: { id: 'BNB', network: 'BEP20' }
      });
    }

    if (notif?.label?.txhash) {
      this.hashLink(notif?.label?.network, notif?.label?.txhash);
    } else if (notif?.label?.cmp_hash) {
      this.router.navigate(['home/farm-posts']);
    } //if the notification has cmp_has it will redirect to campaign detail component

    // if (notif?.label?.transactionHash) {
    //   let owner = notif.type === 'transfer_event' ? null : 'not owner';

    //   if (owner === 'not owner') {
    //     this.router.navigate(['home'], {
    //       queryParams: {
    //         page: 'send',
    //         transactionHash: notif?.label?.transactionHash,
    //         network: notif?.label?.network,
    //         amount: notif?.label?.amount,
    //         currency: notif?.label?.currency,
    //         owner
    //       }
    //     });
    //   } else {
    //     // this.router.navigate(['home/TransactionsHistory']);
    //   }
    // }

    // if (notif?.label?.transactionHash) {
    //   let owner = notif.type == "transfer_event" ? null : "not owner";
    //   this.router.navigate(["home/TransactionsHistory"])
    // }

    if (notif?.label?.promHash) {
      // console.log(notif?.label?.promHash)
      this.router.navigate(['home/farm-posts'], {
        queryParams: { promHash: notif?.label?.promHash }
      });
    }
    if (notif?.label?.cmp_hash && notif?.label?.linkHash) {
      // console.log(notif?.label?.promHash)
      this.router.navigate(['home/farm-posts']);
    }

    if (notif.label.network === 'eth') {
      window.open(etherscan + notif.label.transactionHash, '_blank');
    }
    if (notif.label.network === 'bsc') {
      window.open(bscan + notif.label.transactionHash, '_blank');
    }
    if (notif.label.network === 'BTTC') {
      window.open(bttscan + notif.label.transactionHash, '_blank');
    }
    if (notif.label.network === 'polygon') {
      window.open(polygonscan + notif.label.transactionHash, '_blank');
    }
    if (notif.label.network === 'tron') {
      window.open(tronScan + notif.label.transactionHash, '_blank');
    }
  }

  shareOnSocialMedias(content: any) {
    this.modalService.open(content);
  }
  ngOnDestroy(): void {
    this.isDestroyed.next('');
    this.isDestroyed.unsubscribe();
  }
}
