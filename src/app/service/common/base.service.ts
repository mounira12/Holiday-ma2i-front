import { HttpHeaders } from "@angular/common/http";
import * as _ from 'lodash';

export class BaseService {

  constructor() { }

  getHttpHeader(isFileDownload: boolean = false, params = {}) {

    let httpHeaders = new HttpHeaders({
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      //"Cache-Control": "no-cache",
      "Access-Control-Allow-Headers": "*",
      "Access-Control-Allow-Credentials":"true",
      "X-Requested-With": "XMLHttpRequest"
    });
    let options =
    {
      headers: httpHeaders,
      params: params
    };

    if (isFileDownload) {
      options = _.assign({
        reportProgress: true,
        responseType: 'blob' as 'json',
        observe: 'response' as 'body'
      }, options);
    }

    return options;
  }

  getFileFromResponse(response: any) {
    let fileName = 'file';
    const contentDisposition = response.headers.get('Content-Disposition');

    if (contentDisposition) {
      const fileNameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
      const matches = fileNameRegex.exec(contentDisposition);
      if (matches != null && matches[1]) {
        fileName = matches[1].replace(/['"]/g, '');
      }
    }

    return {
      fileName: fileName,
      document: response.body
    };
  }
}
