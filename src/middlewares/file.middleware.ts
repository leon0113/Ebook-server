import { RequestHandler } from "express";
import formidable, { File } from "formidable";

declare global {
    namespace Express {
        export interface Request {
            // files: {[key: string]: File | File[]}
            files: Record<string, File | File[]>
        }
    }
}

export const fileParser: RequestHandler = async (req, res, next) => {
    const form = formidable();
    const [fields, files] = await form.parse(req);

    if (!req.body) req.body = {};
    if (!req.files) req.files = {};

    for (const key in fields) {                   // fields { name: [ 'Leon' ], age: [ '26' ] }
        const fieldValue = fields[key];
        if (fieldValue) {
            req.body[key] = fieldValue[0];
        }
    }

    for (const key in files) {
        const fileValue = files[key];
        if (fileValue) {
            if (fileValue.length > 1) {
                req.files[key] = fileValue;
            } else {
                req.files[key] = fileValue[0];
            }
        }
    }

    next()
}

/*
files {
  file: [
    PersistentFile {
      _events: [Object: null prototype],
      _eventsCount: 1,
      _maxListeners: undefined,
      lastModifiedDate: 2024-10-13T04:26:19.109Z,
      filepath: 'C:\\Users\\AR\\AppData\\Local\\Temp\\8c00a3d7551d7a52d7d455800',
      newFilename: '8c00a3d7551d7a52d7d455800',
      originalFilename: '72392219_2443767785871148_5430983238099140608_n.jpg',
      mimetype: 'image/jpeg',
      hashAlgorithm: false,
      size: 64923,
      _writeStream: [WriteStream],
      hash: null,
      [Symbol(kCapture)]: false
    },
    PersistentFile {
      _events: [Object: null prototype],
      _eventsCount: 1,
      _maxListeners: undefined,
      lastModifiedDate: 2024-10-13T04:26:19.109Z,
      filepath: 'C:\\Users\\AR\\AppData\\Local\\Temp\\8c00a3d7551d7a52d7d455800',
      newFilename: '8c00a3d7551d7a52d7d455800',
      originalFilename: '72392219_2443767785871148_5430983238099140608_n.jpg',
      mimetype: 'image/jpeg',
      hashAlgorithm: false,
      size: 64923,
      _writeStream: [WriteStream],
      hash: null,
      [Symbol(kCapture)]: false
    },
  ]
}
*/