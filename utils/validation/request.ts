import { Request } from 'express';
import ServerError from '../../classes/ServerError';

export function checkIfRequestHasBody(req: Request) {
    if (!req.body) {
        throw new ServerError(400, 'Cuerpo de la petición vacío');
    }
}