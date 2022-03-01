import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { sattUrl } from '@config/atn.config';
import { TokenStorageService } from '../tokenStorage/token-storage-service.service';
import { IGetSocialNetworksResponse } from '@app/user-settings/components/social-networks/social-networks.component';
import { Observable } from 'rxjs';
import { IresponseCodeQr } from '@app/core/iresponse-code-qr';
@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  constructor(
    private http: HttpClient,
    private tokenStorageService: TokenStorageService
  ) {}

  getSocialNetworks() {
    let httpHeaders = new HttpHeaders({
      'Cache-Control': 'no-store',
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + this.tokenStorageService.getToken()
    });
    return this.http.get<IGetSocialNetworksResponse>(
      sattUrl + 'profile/socialAccounts',
      { headers: httpHeaders }
    );
  }
  deleteOneSocialNetworksGoogle(id: string) {
    let header = new HttpHeaders({
      'Cache-Control': 'no-store',
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + this.tokenStorageService.getToken()
    });
    return this.http.delete(sattUrl + '/googleChannels/' + id, {
      headers: header
    });
  }
  deleleteAllSocialNetworksTwitter() {
    let header = new HttpHeaders({
      'Cache-Control': 'no-store',
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + this.tokenStorageService.getToken()
    });
    return this.http.get(sattUrl + '/twitter/all', { headers: header });
  }

  deleteOneSocialNetworksTwitter(id: string) {
    let header = new HttpHeaders({
      'Cache-Control': 'no-store',
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + this.tokenStorageService.getToken()
    });
    return this.http.delete(sattUrl + '/twitter/' + id, { headers: header });
  }
  deleleteAllSocialNetworksGoogle() {
    let header = new HttpHeaders({
      'Cache-Control': 'no-store',
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + this.tokenStorageService.getToken()
    });
    return this.http.delete(sattUrl + '/google/all/channels', {
      headers: header
    });
  }
  deleleteAllSocialNetworksFb() {
    let header = new HttpHeaders({
      'Cache-Control': 'no-store',
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + this.tokenStorageService.getToken()
    });
    return this.http.delete(sattUrl + '/facebook/all/channels', {
      headers: header
    });
  }
  deleteOneSocialNetworksFb(id: string) {
    let header = new HttpHeaders({
      'Cache-Control': 'no-store',
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + this.tokenStorageService.getToken()
    });
    return this.http.delete(sattUrl + '/facebookChannels/' + id, {
      headers: header
    });
  }
  deleteAllSocialNetworksLinkedin() {
    let header = new HttpHeaders({
      'Cache-Control': 'no-store',
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + this.tokenStorageService.getToken()
    });
    return this.http.delete(sattUrl + '/linkedin/all/channels', {
      headers: header
    });
  }
  deleteOneSocialNetworksLinkedin(organization: string) {
    let header = new HttpHeaders({
      'Cache-Control': 'no-store',
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + this.tokenStorageService.getToken()
    });
    return this.http.delete(sattUrl + '/linkedinChannels/' + organization, {
      headers: header
    });
  }
  updateprofile(body: any) {
    let httpHeaders = new HttpHeaders({
      'Cache-Control': 'no-store',
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + this.tokenStorageService.getToken()
    });

    return this.http.put(sattUrl + '/profile/UpdateProfile', body, {
      headers: httpHeaders
    });
  }
  updateEmail(body: any) {
    let httpHeaders = new HttpHeaders({
      'Cache-Control': 'no-store',
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + this.tokenStorageService.getToken()
    });
    return this.http.put(sattUrl + '/changeEmail', body, {
      headers: httpHeaders
    });
  }
  confirmChangeEmail(body: any) {
    let httpHeaders = new HttpHeaders({
      'Cache-Control': 'no-store',
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + this.tokenStorageService.getToken()
    });
    return this.http.put(sattUrl + '/confirmChangeEmail', body, {
      headers: httpHeaders
    });
  }

  completeprofile(body: any) {
    let httpHeaders = new HttpHeaders({
      'Cache-Control': 'no-store',
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + this.tokenStorageService.getToken()
    });

    return this.http.put(sattUrl + '/updateLastStep', body, {
      headers: httpHeaders
    });
  }

  exportProfileData(password: string, exportType: string) {
    let headers = new HttpHeaders({
      'Cache-Control': 'no-store',
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + this.tokenStorageService.getToken()
    });
    let body = { pass: password };
    return this.http.post(sattUrl + '/v3/' + exportType, body, {
      headers: headers
    });
  }

  getUserProfilePic() {
    let headers = new HttpHeaders({
      'Cache-Control': 'no-store',
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + this.tokenStorageService.getToken()
    });
    return this.http.get(sattUrl + '/profile/pic', {
      responseType: 'blob',
      headers: headers
    });
  }

  // exportBtc(pass:any){
  //   let headers = new HttpHeaders({
  //     'Cache-Control': 'no-store',
  //     "Content-Type": "application/json",
  //     Authorization: "Bearer " + this.tokenStorageService.getItem("access_token"),
  //   });
  //   let token=this.tokenStorageService.getToken();
  //   let body={pass:pass}
  //   return this.http.post(sattUrl + "/v3/exportbtc",body , { headers: headers }
  //   );

  // }

  //   exportMnemo(pass:any){
  //   let headers = new HttpHeaders({
  //     'Cache-Control': 'no-store',
  //     "Content-Type": "application/json",
  //     Authorization: "Bearer " + this.tokenStorageService.getItem("access_token"),
  //   });
  //   let token=this.tokenStorageService.getToken();
  //   return this.http.get(sattUrl + "/v2/printseed/" + token + "/" + encodeURIComponent(pass),{ headers: headers });
  // }

  //   export(pass:any){
  //   let headers = new HttpHeaders({
  //     'Cache-Control': 'no-store',
  //     "Content-Type": "application/json",
  //     Authorization: "Bearer " + this.tokenStorageService.getItem("access_token"),
  //   });
  //   let token=this.tokenStorageService.getToken();
  //   return this.http.get(sattUrl + "/v2/export/" + encodeURIComponent(pass) + "/" +token ,{ headers: headers });
  // }
  addInterests(body: any) {
    let httpHeaders = new HttpHeaders({
      'Cache-Control': 'no-store',
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + this.tokenStorageService.getToken()
    });

    return this.http.post(
      sattUrl + '/user/interests',
      { interests: body },
      { headers: httpHeaders }
    );
  }
  getInterests() {
    let httpHeaders = new HttpHeaders({
      'Cache-Control': 'no-store',
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + this.tokenStorageService.getToken()
    });

    return this.http.get(sattUrl + '/user/interests', { headers: httpHeaders });
  }
  updateInterests(body: any) {
    let httpHeaders = new HttpHeaders({
      'Cache-Control': 'no-store',
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + this.tokenStorageService.getToken()
    });

    return this.http.put(
      sattUrl + '/user/interests',
      { interests: body },
      { headers: httpHeaders }
    );
  }

  logoutRS(social: any) {
    let header = new HttpHeaders({
      'Cache-Control': 'no-store',
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + this.tokenStorageService.getToken()
    });
    return this.http.put(sattUrl + '/deconnection/' + social, null, {
      headers: header
    });
  }

  deleteAccount(obj: any) {
    let header = new HttpHeaders({
      'Cache-Control': 'no-store',
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + this.tokenStorageService.getToken()
    });
    return this.http.post(sattUrl + '/account/purged', obj, {
      headers: header
    });
  }
  generateQRCode() {
    let header = new HttpHeaders({
      'Cache-Control': 'no-store',
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + this.tokenStorageService.getToken()
    });
    let id = this.tokenStorageService.getIdUser();
    return this.http.get(sattUrl + '/qrCode/' + id, { headers: header });
  }
  verifyQRCode(body: any): Observable<IresponseCodeQr> {
    let header = new HttpHeaders({
      'Cache-Control': 'no-store',
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + this.tokenStorageService.getToken()
    });
    return this.http.post<IresponseCodeQr>(sattUrl + '/verifyQrCode', body, {
      headers: header
    });
  }

  socialStateGoogle(deactivate: any, channelId: any) {
    let header = new HttpHeaders({
      'Cache-Control': 'no-store',
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + this.tokenStorageService.getToken()
    });
    let body = { channelId: channelId, deactivate: deactivate };
    return this.http.post(sattUrl + '/allowYoutube', body, { headers: header });
  }

  socialStateFacebook(deactivate: any, id: any) {
    let header = new HttpHeaders({
      'Cache-Control': 'no-store',
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + this.tokenStorageService.getToken()
    });
    let body = { channelId: id, deactivate: deactivate };
    return this.http.post(sattUrl + '/allowFacebook', body, {
      headers: header
    });
  }

  socialStateTwitter(deactivate: any, twitter_id: any) {
    let header = new HttpHeaders({
      'Cache-Control': 'no-store',
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + this.tokenStorageService.getToken()
    });
    let body = { twitter_id: twitter_id, deactivate: deactivate };
    return this.http.post(sattUrl + '/allowTwitter', body, { headers: header });
  }

  socialStateLinkedin(deactivate: any, organization: any) {
    let header = new HttpHeaders({
      'Cache-Control': 'no-store',
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + this.tokenStorageService.getToken()
    });
    let body = { organization: organization, deactivate: deactivate };
    return this.http.post(sattUrl + '/allowLinkedin', body, {
      headers: header
    });
  }
}
