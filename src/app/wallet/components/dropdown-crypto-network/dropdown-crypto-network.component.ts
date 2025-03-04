import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ListTokens } from '@app/config/atn.config';
import { WalletFacadeService } from '@app/core/facades/wallet-facade.service';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-dropdown-crypto-network',
  templateUrl: './dropdown-crypto-network.component.html',
  styleUrls: ['./dropdown-crypto-network.component.scss']
})
export class DropdownCryptoNetworkComponent
  implements OnInit, OnDestroy, OnChanges
{
  @Output() selectedCrypto: EventEmitter<any> = new EventEmitter();
  selectedNetworkValue: string = 'ERC20';
  cryptoPicName: string = 'SATT';
  cryptoSymbol: string = 'SATT';
  cryptoList$ = this.walletFacade.cryptoList$;
  dataList: any = [];
  defaultcurr: any;
  defaultcurrbtt: any;

  defaultcurrbep: any;
  defaultcurrbtc: any;
  cryptoName: any;
  token: any;
  networkList: Array<{ network: string }>;
  cryptoDetails: any;
  private onDestoy$ = new Subject();
  @Input() cryptoFromComponent: any;
  @Input()
  cryptoFromDraft: any;
  isAddedToken: boolean = false;
  routerSub: any;
  isCryptoRouter: boolean = true;
  cryptoToDropdown: any;
  addedTokenNopic: boolean = false;
  private firstEmit = false;
  cryptoList: any = [];
  defaultcurrpolygon: any;
  defaultcurrtron: any;
  constructor(
    private walletFacade: WalletFacadeService,
    private route: ActivatedRoute,
    public router: Router,
    private cdref: ChangeDetectorRef
  ) {
    this.networkList = [
      { network: 'BEP20' },
      { network: 'ERC20' },
      { network: 'POLYGON' },
      { network: 'BTTC' },
      { network: 'BTC' },
      { network: 'TRON' }
    ];
  }

  ngOnInit(): void {
    this.routerSub = this.route.queryParams
      .pipe(takeUntil(this.onDestoy$))
      .subscribe((p: any) => {
        if (p.id) {
          this.firstEmit = true;
          this.isCryptoRouter = true;
          if ((this.cryptoPicName = 'SATTPOLYGON')) {
            this.cryptoPicName = 'SATT';
          }

          this.cryptoSymbol = p.id;
          this.selectedNetworkValue = p.network;
          if (p.pic === 'false') {
            this.addedTokenNopic = true;
          }
        } else {
          this.isCryptoRouter = false;
          // this.cryptoPicName = 'SATT';
          // this.cryptoSymbol = 'SATT';
          // this.selectedNetworkValue = 'ERC20';
        }
      });
    this.getusercrypto();
    this.defaultcurr = ListTokens['SATT'].name;
    this.defaultcurrbep = ListTokens['SATTBEP20'].name;
    this.defaultcurrbtc = ListTokens['BTC'].name;
    this.defaultcurrpolygon = ListTokens['MATIC'].name;
    this.defaultcurrbtt = ListTokens['BTT'].name;
    this.defaultcurrtron = ListTokens['TRX'].name;
  }
  //get list of crypto for user
  getusercrypto() {
    this.cryptoList$
      .pipe(
        filter((data) => data.length !== 0),
        takeUntil(this.onDestoy$)
      )
      .subscribe((data: any) => {
        data = JSON.parse(JSON.stringify(data));
        this.dataList = data;
        this.dataList = [
          ...this.dataList.filter(
            (data: any) =>
              data.symbol !== 'SATTPOLYGON' &&
              data.symbol !== 'SATTBTT' &&
              data.symbol !== 'SATTTRON'
          )
        ];
        /*----emit default cryto to receive compoent */
        this.dataList?.forEach((crypto: any) => {
          if (!this.cryptoFromDraft && !this.firstEmit) {
            if (crypto.symbol === 'SATT') {
              // this.selectedCrypto.emit(crypto);
              this.firstEmit = true;
            }
          }

          if (
            crypto &&
            this.cryptoFromDraft &&
            crypto.symbol === this.cryptoFromDraft
          ) {
            this.cryptoFromComponent = [crypto];
            this.cryptoSymbol = this.cryptoFromComponent[0].symbol;

            this.selectedNetworkValue = this.cryptoFromComponent[0].network;
            if (this.cryptoFromComponent[0].AddedToken) {
              this.cryptoPicName = this.cryptoFromComponent[0].picUrl;
            } else {
              this.cryptoPicName = this.cryptoFromComponent[0].undername2;
            }
            this.selectedCrypto.emit(crypto);
          }
          /**------ */
          crypto.price = this.filterAmount(crypto.price + '');
          crypto.quantity = this.filterAmount(crypto.quantity + '');
          crypto.type =
            crypto.network ?? ListTokens[crypto.symbol].type.toUpperCase();
          crypto.undername2 = crypto.undername2 ?? 'indispo';
          crypto.undername = crypto.undername ?? 'indispo';
          crypto.typetab = crypto.type;
          crypto.contrat = crypto.AddedToken || '';

          if (crypto.symbol === 'BTC') {
            crypto.typetab = 'BTC';
          }
          if (this.isCryptoRouter) {
            if (crypto.symbol === this.cryptoSymbol) {
              this.token = crypto.AddedToken;
              if (crypto.AddedToken) {
                if (crypto.picUrl) {
                  this.cryptoPicName = crypto.picUrl;
                } else {
                  this.cryptoPicName = crypto.undername2;
                }
              }

              if (crypto.symbol === 'SATT' || crypto.symbol === 'SATTBEP20') {
                if (crypto.network === this.selectedNetworkValue) {
                  this.selectedCrypto.emit(crypto);
                }
              } else {
                this.selectedCrypto.emit(crypto);
              }
            }
          }
          // else if (!this.cryptoFromComponent) {
          //   if (crypto.symbol === 'SATT') {
          //     this.selectedCrypto.emit(crypto);
          //   }
          // }
        });
      });
  }

  // fixing crypto decimals to 9
  filterAmount(input: any, nbre: any = 10) {
    if (input) {
      var out = input;
      let size = input.length;
      let toAdd = parseInt(nbre) - parseInt(size);

      if (input === 0) {
        toAdd--;
      }
      if (toAdd > 0) {
        if (input.includes('.')) {
          for (let i = 0; i < toAdd; i++) {
            out += '0';
          }
        } else {
          out += '.';
          for (let i = 0; i < toAdd; i++) {
            out += '0';
          }
        }
      } else if (toAdd < 0) {
        if (input.includes('.')) {
          if (input.split('.')[0].length > nbre) {
            out = input.substring(0, nbre);
          } else {
            out = input.substring(0, nbre);
            if (out[nbre - 1] === '.') {
              out = input.substring(0, nbre - 1);
            }
          }
        }
      }
      return out;
    } else {
      return '-';
    }
  }
  trackById(index: number, crypto: any) {
    return crypto;
  }
  trackById2(index: number, n: any) {
    return n;
  }
  //select value from the dropdown

  selectCryptoValue(
    name: string,
    picName: string,
    symbol: string,
    AddedToken: string,
    crypto: any
  ) {
    this.firstEmit = true;
    if (this.isCryptoRouter) {
      this.isCryptoRouter = false;
      this.router.navigate([], { queryParams: [] });
    }
    this.cryptoName = name;
    if (AddedToken) {
      if (crypto.picUrl === false) {
        this.addedTokenNopic = true;
        this.cryptoPicName = crypto.undername2;
      } else {
        this.cryptoPicName = crypto.picUrl;
        this.addedTokenNopic = false;
      }
    } else {
      this.cryptoPicName = picName;
    }
    this.cryptoSymbol = symbol;
    this.token = AddedToken;
    this.cryptoDetails = crypto;
    this.selectedCrypto.emit(crypto);
    this.cdref.detectChanges();
  }

  selectNetworkValue(network: string) {
    this.firstEmit = true;
    if (this.isCryptoRouter) {
      this.isCryptoRouter = false;
      this.router.navigate([], { queryParams: [] });
    }
    this.token = '';
    this.selectedNetworkValue = network;
    if (network === 'BEP20') {
      this.cryptoPicName = 'SATT';
      this.cryptoSymbol = this.defaultcurrbep;
      this.cryptoName = this.defaultcurrbep;
      this.cryptoDetails = 'SATTBEP20';
    } else if (network === 'ERC20') {
      this.cryptoSymbol = 'SATT';
      this.cryptoName = this.defaultcurr;
      this.cryptoPicName = this.defaultcurr;
      this.cryptoDetails = 'SATT';
    } else if (network === 'BTC') {
      this.cryptoSymbol = this.defaultcurrbtc;
      this.cryptoName = this.defaultcurrbtc;
      this.cryptoPicName = this.defaultcurrbtc;
      this.cryptoDetails = 'BTC';
    } else if (network === 'POLYGON') {
      this.cryptoSymbol = 'MATIC';
      this.cryptoName = this.defaultcurr;
      this.cryptoPicName = this.defaultcurr;
      this.cryptoDetails = 'MATIC';
    } else if (network === 'BTTC') {
      this.cryptoSymbol = 'BTT';
      this.cryptoName = this.defaultcurrbtt;
      this.cryptoPicName = this.defaultcurrbtt;
      this.cryptoDetails = 'BTT';
    } else if (network === 'TRON') {
      this.cryptoSymbol = 'TRX';
      this.cryptoName = this.defaultcurrtron;
      this.cryptoPicName = this.defaultcurrtron;
      this.cryptoDetails = 'TRX';
    }
    this.dataList.forEach((crypto: any) => {
      if (crypto.symbol === this.cryptoDetails) {
        this.selectedCrypto.emit(crypto);
      }
    });
    this.cdref.detectChanges(); 
  }
  ngOnDestroy() {
    this.onDestoy$.next('');
    this.onDestoy$.complete();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.cryptoFromDraft && this.router.url.includes('edit')) {
      if (this.cryptoFromDraft) {
        this.dataList.forEach((crypto: any) => {
          if (crypto.symbol === this.cryptoFromDraft) {
            this.cryptoFromComponent = [crypto];
          }
        });
        if (this.cryptoFromComponent) {
          this.isCryptoRouter = false;
          this.cryptoSymbol = this.cryptoFromComponent[0].symbol;
          this.selectedNetworkValue = this.cryptoFromComponent[0].network;
          if (this.cryptoFromComponent[0].AddedToken) {
            this.isAddedToken = true;
            this.token = this.cryptoFromComponent[0].AddedToken;
            this.cryptoPicName = this.cryptoFromComponent[0].picUrl;
          } else {
            this.token = '';
            this.isAddedToken = false;
            this.cryptoPicName = this.cryptoFromComponent[0].undername2;
          }
          this.cryptoSymbol = this.cryptoFromComponent[0].symbol;
          this.selectedNetworkValue = this.cryptoFromComponent[0].network;
          this.cdref.detectChanges();
        }
      }
    } else {
      if (this.cryptoFromComponent) {
        this.isCryptoRouter = false;
        this.cryptoSymbol = this.cryptoFromComponent.symbol;
        this.selectedNetworkValue = this.cryptoFromComponent.network;
        if (this.cryptoFromComponent.AddedToken) {
          this.isAddedToken = true;
          this.token = this.cryptoFromComponent.AddedToken;
          this.cryptoPicName = this.cryptoFromComponent.picUrl;
        } else {
          this.token = '';
          this.isAddedToken = false;
          this.cryptoPicName = this.cryptoFromComponent.undername2;
        }
        this.cryptoSymbol = this.cryptoFromComponent.symbol;
        this.selectedNetworkValue = this.cryptoFromComponent.network;
        this.cdref.detectChanges();
      }
    }
  }
}
