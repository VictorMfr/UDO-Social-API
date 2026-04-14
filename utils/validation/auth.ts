import ServerError from "../../classes/ServerError";

export function checkCreateUserFields(data: any) {
    if (!data.username || !data.email || !data.password) {
        throw new ServerError(400, 'Todos los campos son requeridos');
    }
}

export function checkLoginUserFields(data: any) {
    if (!data.email || !data.password) {
        throw new ServerError(400, 'Email y contraseña son requeridos');
    }
}