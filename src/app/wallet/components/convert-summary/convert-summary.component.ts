/* eslint-disable @typescript-eslint/naming-convention */
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { WalletFacadeService } from '@app/core/facades/wallet-facade.service';
import { concatMap, mapTo, takeUntil, tap } from 'rxjs/operators';
import {
  SearchCountryField,
  CountryISO,
  PhoneNumberFormat
} from 'ngx-intl-tel-input';
import { environment } from '../../../../environments/environment';
import { Subject } from 'rxjs';
import { TokenStorageService } from '@app/core/services/tokenStorage/token-storage-service.service';
@Component({
  selector: 'app-convert-summary',
  templateUrl: './convert-summary.component.html',
  styleUrls: ['./convert-summary.component.scss']
})
export class ConvertSummaryComponent implements OnInit {
  amount: any = '';
  currency: any = '';
  crypto: any = '';
  cryptoAmount: any = '';
  wallet_id: any = '';
  quote_id: any = '';
  symbol: any;
  PaymentID: any;
  phone: any;
  phoneNumber = new FormControl('');
  location: any;
  separateDialCode = false;
  SearchCountryField = SearchCountryField;
  CountryISO = CountryISO;
  PhoneNumberFormat = PhoneNumberFormat;
  preferredCountries: CountryISO[] = [];
  wallet_btc: any;
  domain_name: any = environment.domainName;
  simplex_url: any = environment.simplexUrl;
  payementId = '';
  private isDestroyed = new Subject();

  constructor(
    private activatedRoute: ActivatedRoute,
    public walletFacade: WalletFacadeService,
    private router: Router,
    private tokenStorageService: TokenStorageService
  ) {}

  ngOnInit(): void {
    this.getInfo();

    this.walletFacade
      .getPayementId(this.crypto, this.quote_id, this.wallet_id)
      .pipe(
        tap((res: any) => {
          this.walletFacade.setPaymentId(res.payment_id);
          this.tokenStorageService.setItem('payementId', res.payment_id);
          this.payementId = res.payment_id;
          this.walletFacade.loadCryptoAmount(this.amount);
        }),
        takeUntil(this.isDestroyed)
      )
      .subscribe();
  }

  getInfo() {
    this.amount = this.activatedRoute.snapshot.queryParamMap.get('amount');
    this.currency = this.activatedRoute.snapshot.queryParamMap.get('currency');
    this.crypto = this.activatedRoute.snapshot.queryParamMap.get('crypto');
    this.symbol = this.activatedRoute.snapshot.queryParamMap.get('symbol');
    this.wallet_id = this.activatedRoute.snapshot.queryParamMap.get('wallet');
    this.cryptoAmount =
      this.activatedRoute.snapshot.queryParamMap.get('cryptoAmount');
    this.quote_id = this.tokenStorageService.getQuoteId();
    //this.wallet_id = this.tokenStorageService.getWalletId();
    this.wallet_btc = this.tokenStorageService.getWalletBtc();
    this.tokenStorageService.setItem('CryptoAmount', this.cryptoAmount);
    this.tokenStorageService.setItem('Crypto', this.crypto);
  }

  onSubmit() {
    // console.log('clikced!');
  }
  linstingBack(event: any) {
    if (event === true) {
      // this.router.navigate(['/wallet/buy-token']);
      this.router.navigate(['/wallet/buy-token'], {
        queryParams: {
          amount: this.amount,
          currency: this.currency,
          crypto: this.crypto,
          cryptoAmount: this.cryptoAmount,
          quote_id: this.quote_id,
          symbol: this.symbol,
          wallet: this.wallet_id
        }
      });
    }
  }
  ngOnDestroy(): void {
    this.isDestroyed.next('');
    this.isDestroyed.unsubscribe();
  }
}
