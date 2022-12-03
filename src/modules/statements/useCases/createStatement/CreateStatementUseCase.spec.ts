import { app } from '../../../../app';
import request from 'supertest';
import { Connection, createConnection } from 'typeorm';

let connection : Connection;
const user = {
  name: "Usuário Teste",
  email: "usuario.profile@email.com.br",
  password: "12345678"
}
describe("Create Statement Controller", () => {

  beforeAll( async () => {
    connection = await createConnection();
    await connection.runMigrations();
    await request(app).post("/api/v1/users").send(user);
  });

  afterAll( async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("Should register a deposit operation", async () => {
    const authenticatedUser = await request(app).post("/api/v1/sessions").send({
      email: user.email,
      password: user.password,
    });
    const { token } = authenticatedUser.body;
    const response = await request(app).post("/api/v1/statements/deposit")
    .send({ amount: 10, description: 'Teste de depósito'})
    .set({ Authorization: `Bearer ${token}` });

    expect(response.status).toBe(201);
  });

  it("Should not register a deposit operation for a nonexistent user", async () => {
    const response = await request(app).post("/api/v1/statements/deposit")
    .send({ amount: 10, description: 'Teste de depósito' })
    .set({ Authorization: `Bearer ${null}` });

    expect(response.status).toBe(401);
  });

  it("Should register a withdraw operation", async () => {
    const authenticatedUser = await request(app).post("/api/v1/sessions").send({
      email: user.email,
      password: user.password,
    });
    const { token } = authenticatedUser.body;
    await request(app).post("/api/v1/statements/deposit")
    .send({ amount: 10, description: 'Teste de depósito'})
    .set({ Authorization: `Bearer ${token}` });

    const response = await request(app).post("/api/v1/statements/withdraw")
    .send({ amount: 5, description: 'Teste de retirada'})
    .set({ Authorization: `Bearer ${token}` });

    expect(response.status).toBe(201);
  });



})
