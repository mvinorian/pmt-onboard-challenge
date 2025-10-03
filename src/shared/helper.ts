import { writeFile } from 'fs';

export const saveObjectToJSON = (filename: string, object: Object) => {
  console.log('Writing data into ' + filename);
  writeFile(filename, JSON.stringify(object, null, 2), (err) => {
    if (err) throw err;
  });
};
