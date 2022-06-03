export class ResetPasswordModel {
    public OldPassword: string;
    public NewPassword: string;
    public ConfirmNewPassword: string;
    public EmailUser: string;
    constructor(emailUser: string) {
        this.EmailUser = emailUser;
    }
}