import fs from 'fs';
import path from 'path';
import Sequelize from 'sequelize';
import { Config } from '../app/config/app';

const basename = path.basename(module.filename);

const db = {};
const command = process.argv[2];

if (Config.use_db_commands.indexOf(command) > -1) {
  const sequelize = new Sequelize('vcc', null, null, {
    dialect: 'sqlite',
    storage: Config.sql_lite_path,
    logging: false,
    operatorsAliases: false
  });

  fs.readdirSync(__dirname)
    .filter(file => {
      return file.indexOf('.') !== 0 && file !== basename && file.slice(-3) === '.js';
    })
    .forEach(file => {
      const model = sequelize['import'](path.join(__dirname, file));
      db[model.name] = model;
    });

  Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) {
      db[modelName].associate(db);
    }
  });

  db.sequelize = sequelize;
  db.Sequelize = Sequelize;
}

module.exports = db;
