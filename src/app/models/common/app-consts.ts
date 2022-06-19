import { empty } from 'rxjs';
import { environment } from 'src/environments/environment';

export const AppConsts = {
  IS_ENV_PRODUCTION: environment.production,
  APPLICATION_NAME: "DÉCISIEL",
  DATE_FORMAT: 'DD/MM/YYYY',
  TOKEN_KEY: "auth-token",
  XSRF_TOKEN_NAME: "xsrf-token",
  API_SERVICE_URL: environment.API_SERVICE_URL,
  CurrentEmail: "CurrentEmail",
  EMAIL_PATTERN: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,10}$",
  PASSWORD_PATTERN: "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[*.! ?@#$%^&~={}():_;<>|\\-`.+,/\"]).{8,}$",
  REMEMBER_ME: "remember-me",
  USER_MAIL: "user-mail",
}

