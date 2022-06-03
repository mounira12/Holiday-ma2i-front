export class LoginUserRequestModel {
  public UserName: string;
  public Password: string;
  public RememberMe: boolean;
  public Roles : string[];

  public constructor (email: string, password: string, rememberMe: boolean) {
    this.UserName = email;
    this.Password = password;
    this.RememberMe = rememberMe;
  }
}
