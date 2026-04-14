import ServerError from "../../classes/ServerError";

export function checkCreatePostFields(data: any) {
    if (!data.content) {
        throw new ServerError(400, 'Título y contenido son requeridos');
    }
}