import { Multer } from 'multer';

declare global {
  namespace Express {
    // Adiciona `file` e `files` ao tipo padrão de Request
    interface Request {
      file?: Multer.File; // Para uploads únicos
      files?: Multer.File[]; // Para múltiplos uploads
    }
  }
}
