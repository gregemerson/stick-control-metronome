export class AccountConstraints {
    static userNameMin = 5;
    static userNameMax = 20;
    static passWordRegEx = /^[a-z0-9]+$/i;
    static passWordMin = 8;
    static passWordMax = 12;
}