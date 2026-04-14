// Definición de los atributos base
export interface BaseAttributes {
  id: number;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date | null;
}