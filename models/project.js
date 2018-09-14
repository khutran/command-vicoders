'use strict';

module.exports = (sequelize, DataTypes) => {
  var Project = sequelize.define(
    'project',
    {
      name: DataTypes.STRING,
      dir_home: DataTypes.STRING,
      git_remote: DataTypes.STRING,
      framework: DataTypes.STRING,
      port: DataTypes.INTEGER
    },
    {
      underscored: true
      // freezeTableName: true
    }
  );

  Project.associate = models => {};

  return Project;
};
