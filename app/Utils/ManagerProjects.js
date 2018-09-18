import fs from 'fs';
import _ from 'lodash';

export default class ManagerProjects {
  async framework() {
    let framework;
    if (fs.existsSync('wp-admin') && fs.existsSync('wp-content') && fs.existsSync('wp-includes')) {
      framework = 'wordpress';
    }
    if (
      fs.existsSync('app/') &&
      fs.existsSync('bootstrap/') &&
      fs.existsSync('config/') &&
      fs.existsSync('public/') &&
      fs.existsSync('resources/') &&
      fs.existsSync('routes/') &&
      fs.existsSync('storage/') &&
      fs.existsSync('artisan')
    ) {
      framework = 'laravel';
    }
    if (fs.existsSync('e2e') && fs.existsSync('src') && fs.existsSync('angular.json')) {
      framework = 'angular';
    }
    if (fs.existsSync('models/') && fs.existsSync('app/') && fs.existsSync('app.js')) {
      framework = 'nodejs';
    }
    return framework;
  }

  getPort() {
    return new Promise((resolve, reject) => {
      let obj = {};
      if (fs.existsSync('.env')) {
        fs.readFile('.env', (err, data) => {
          if (err) {
            reject(err);
          }
          data = _.split(data, '\n');
          data = _.remove(data, n => {
            return !_.isEmpty(n) && n.indexOf('#') && n.indexOf('\r') && n.indexOf('^M');
          });
          for (let i in data) {
            data[i] = _.split(data[i], '=');
            obj[data[i][0]] = data[i][1];
          }
          if (obj.PORT) {
            resolve(obj.PORT);
          } else {
            resolve(80);
          }
        });
      }
      resolve(80);
    });
  }
}
