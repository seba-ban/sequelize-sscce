// Require the necessary things from Sequelize
import { Sequelize, Op, Model, DataTypes } from 'sequelize';

// This function should be used instead of `new Sequelize()`.
// It applies the config for your SSCCE to work on CI.
import createSequelizeInstance = require('./utils/create-sequelize-instance');

// This is an utility logger that should be preferred over `console.log()`.
import log = require('./utils/log');

// You can use sinon and chai assertions directly in your SSCCE if you want.
import sinon = require('sinon');
import { expect } from 'chai';

// Your SSCCE goes inside this function.
export async function run() {
  const sequelize = createSequelizeInstance({
    logQueryParameters: true,
    benchmark: true,
    define: {
      timestamps: false // For less clutter in the SSCCE
    }
  });

  interface ExampleInterface {
    message: string;
    randomNumber: number;
  }

  class Example extends Model<
    ExampleInterface & { id: number },
    ExampleInterface
  > {
    public id!: number;
    public message!: string;
    public randomNumber!: number;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    toJSON(): ExampleInterface {
      const { message, randomNumber } = this;
      return { message, randomNumber };
    }
  }

  Example.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      message: {
        type: new DataTypes.STRING(256),
      },
      randomNumber: {
        type: DataTypes.FLOAT,
      },
    },
    { sequelize }
  );

  const spy = sinon.spy();
  sequelize.afterBulkSync(() => spy());
  await sequelize.sync();
  expect(spy).to.have.been.called;

  log(await Example.create({ message: "a", randomNumber: 10.2 }));
  expect(await Example.count()).to.equal(1);
}
