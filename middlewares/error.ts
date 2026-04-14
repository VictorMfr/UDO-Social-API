import { Request, Response, NextFunction } from 'express';
import ServerError from '../classes/ServerError';
import { DatabaseError, Error, UniqueConstraintError, ValidationError } from 'sequelize';

export default function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction) {

    // Imprimir error
    console.log(err);


    // Si es un error controlado por nosotros
    if (err instanceof ServerError) {
        return res.status(err.statusCode).json({
            status: 'error',
            message: err.message
        });
    }

    // Si es un error de sequelize generico
    if (err instanceof DatabaseError) {
        return res.status(500).json({
            status: 'error',
            message: 'Error de base de datos: ' + err.message
        });
    }

    // Si es un error de duplicidad de sequelize
    if (err instanceof UniqueConstraintError) {
        return res.status(400).json({
            status: 'error',
            message: 'Las credenciales ya existen en la base de datos'
        })
    }

    // Si es un error de validación de sequelize
    if (err instanceof ValidationError) {
        return res.status(400).json({
            status: 'error',
            message: err.message
        });
    }

    return res.status(500).json({
        status: 'error',
        message: 'Algo salió muy mal en el servidor'
    });

    
}