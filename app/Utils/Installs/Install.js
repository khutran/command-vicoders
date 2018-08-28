import Os from '../Os/Os';

export default class Install {
  constructor() {
    this.os = new Os().platform();
  }
}
