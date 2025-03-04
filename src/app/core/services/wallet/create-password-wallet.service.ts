import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { sattUrl } from '@app/config/atn.config';
import { TokenStorageService } from '../tokenStorage/token-storage-service.service';

@Injectable({
  providedIn: 'root'
})
export class CreatePasswordWalletService {
  constructor(
    private http: HttpClient,
    private tokenStorageService: TokenStorageService
  ) {}
  createPasswordWallet(pass: string): Observable<any> {
    
    let httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
      Authorization: 'Bearer ' + this.tokenStorageService.getToken()
    });

    return this.http.post(
      sattUrl + '/wallet/create/v2',
      {
        pass: pass
      },
      { headers: httpHeaders }
    );
  }
  getPassPhrase() {
    let httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
      Authorization: 'Bearer ' + this.tokenStorageService.getToken()
    });
    return this.http.get(sattUrl + '/wallet/getMnemo', {
      headers: httpHeaders
    });
  }

  checkPassPhraseOrdered(mnemo: string): Observable<any> {
    let httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
      Authorization: 'Bearer ' + this.tokenStorageService.getToken()
    });
    return this.http.post(
      sattUrl + '/wallet/verifyMnemo',
      { mnemo },
      { headers: httpHeaders }
    );
  }
}
