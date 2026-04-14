export default class ServerError extends Error {

    public statusCode: number;
    public message: string;

    constructor(statusCode: number, message: string) {
        super(message);
        this.statusCode = statusCode;
        this.message = message;
    }
}