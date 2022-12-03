import { app } from '../../../../app';
import request from 'supertest';
import { Connection, createConnection } from 'typeorm';
import { v4 as uuid } from 'uuid';

let connection : Connection;
const user = {
  name: "Usuário Teste",
  email: "usuario.profile@email.com.br",
  password: "12345678"
}
describe("Get Statement Operation", () => {

  beforeAll( async () => {
    connection = await createConnection();
    await connection.runMigrations();
    await request(app).post("/api/v1/users").send(user);
  });

  afterAll( async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("Should return a user statement", async () => {
    const authenticatedUser = await request(app).post("/api/v1/sessions").send({
      email: user.email,
      password: user.password,
    });
    const { token } = authenticatedUser.body;
    const depositResponse = await request(app).post("/api/v1/statements/deposit")
    .send({ amount: 10, description: 'Teste de depósito'})
    .set({ Authorization: `Bearer ${token}` });

    const { id: statement_id } = depositResponse.body;
    const response = await request(app).get(`/api/v1/statements/${statement_id}`).set({ Authorization: `Bearer ${token}` });

    expect(response.status).toBe(200);
  });

  it("Should not return a statement of a inexistent user", async () => {
    const authenticatedUser = await request(app).post("/api/v1/sessions").send({
      email: user.email,
      password: user.password,
    });
    const { token } = authenticatedUser.body;
    const depositResponse = await request(app).post("/api/v1/statements/deposit")
    .send({ amount: 10, description: 'Teste de depósito'})
    .set({ Authorization: `Bearer ${token}` });

    const { id: statement_id } = depositResponse.body;
    const response = await request(app).get(`/api/v1/statements/${statement_id}`)
    .send({ amount: 10, description: 'Teste de depósito'})
    .set({ Authorization: `Bearer ${null}` });
    expect(response.status).toBe(401);
  });

  it("Should not return a inexistent statement", async () => {
    const authenticatedUser = await request(app).post("/api/v1/sessions").send({
      email: user.email,
      password: user.password,
    });
    const { token } = authenticatedUser.body;
    const statement_id  = uuid();
    const response = await request(app).get(`/api/v1/statements/${statement_id}`).set({ Authorization: `Bearer ${token}` });
    expect(response.status).toBe(404);
  });


})
