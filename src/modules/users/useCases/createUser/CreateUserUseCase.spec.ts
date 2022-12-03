import { app } from '../../../../app';
import request from 'supertest';
import { Connection, createConnection } from 'typeorm';

let connection : Connection;
describe("Create User Controller", () => {

  beforeAll( async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll( async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('Should create a new user', async () => {
    const user = {
      name: "Usuário Teste",
      email: "usuario@email.com.br",
      password: "12345678"
    }
    const response = await request(app).post("/api/v1/users").send(user);
    expect(response.status).toBe(201);
  });

  it('Should not create a new user if already exists', async () => {
    const user = {
      name: "Usuário Teste",
      email: "usuario@email.com.br",
      password: "12345678"
    }
    const response = await request(app).post("/api/v1/users").send(user);
    expect(response.status).toBe(400);
  });

})
