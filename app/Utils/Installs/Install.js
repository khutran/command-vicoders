import os from 'os';
export default class Install {
  constructor() {
    this.os = os.platform();
  }
}
