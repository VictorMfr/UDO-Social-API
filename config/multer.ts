import multer from "multer";

const storage = multer.memoryStorage(); // Guardar en búfer de memoria
export const upload = multer({ storage });