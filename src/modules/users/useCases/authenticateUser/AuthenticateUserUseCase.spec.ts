import { app } from '../../../../app';
import request from 'supertest';
import { Connection, createConnection } from 'typeorm';

let connection : Connection;
const user = {
  name: "Usuário Teste",
  email: "autenticado1@email.com.br",
  password: "12345678"
}

describe("Authenticate User Controller", () => {

  beforeAll( async () => {
    connection = await createConnection();
    await connection.runMigrations();
    await request(app).post("/api/v1/users").send(user);
  });

  afterAll( async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("Should be able to authenticate an user", async () => {
    const response = await request(app).post("/api/v1/sessions").send({
      email: user.email,
      password: user.password,
    });
    expect(response.status).toBe(200);
  });

  it("Should not be able to authenticate an nonexistent user", async () => {
    const response = await request(app).post("/api/v1/sessions").send({
      email: "fake@email.com.br",
      password: user.password,
    });
    expect(response.status).toBe(401);
  });

  it("Should not be able to authenticate with incorrect password", async () => {
    const response = await request(app).post("/api/v1/sessions").send({
      email: user.email,
      password: "4567898",
    });
    expect(response.status).toBe(401);
  });

});
