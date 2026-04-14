export interface ICreateUserRequestBody {
    email: string;
    username: string;
    password: string;
    bio?: string;
}