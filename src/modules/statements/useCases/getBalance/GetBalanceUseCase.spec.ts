import { app } from '../../../../app';
import request from 'supertest';
import { Connection, createConnection } from 'typeorm';

let connection : Connection;
const user = {
  name: "Usuário Teste",
  email: "usuario.profile@email.com.br",
  password: "12345678"
}
describe("Get Balance Controller", () => {

  beforeAll( async () => {
    connection = await createConnection();
    await connection.runMigrations();
    await request(app).post("/api/v1/users").send(user);
  });

  afterAll( async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("Should return a user balance", async () => {
    const authenticatedUser = await request(app).post("/api/v1/sessions").send({
      email: user.email,
      password: user.password,
    });
    const { token } = authenticatedUser.body;
    const response = await request(app).get("/api/v1/statements/balance").set({
      Authorization: `Bearer ${token}`
    });
    expect(response.status).toBe(200);
    expect(response.body.balance).toBe(0);
  });

  it("Should not return a balance of an inexistent user", async () => {
    const response = await request(app).get("/api/v1/statements/balance").set({
      Authorization: `Bearer ${null}`
    });
    expect(response.status).toBe(401);
  });

})
