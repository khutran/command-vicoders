import decompress from 'decompress';

export class Decompresser {
  async decompress(source, dest) {
    return new Promise((resolve, reject) => {
      decompress(source, dest)
        .then(() => {
          resolve();
        })
        .catch(error => {
          reject(error);
        });
    });
  }
}
