from conftest import crear_usuario


def test_login_exitoso(client, db_session):
    crear_usuario(db_session, email="valida@arizonaqa.com", password="Clave1234")

    respuesta = client.post(
        "/auth/login",
        json={"email": "valida@arizonaqa.com", "password": "Clave1234"},
    )

    assert respuesta.status_code == 200
    cuerpo = respuesta.json()
    assert "access_token" in cuerpo
    assert cuerpo["usuario"]["email"] == "valida@arizonaqa.com"


def test_login_contrasena_incorrecta(client, db_session):
    crear_usuario(db_session, email="valida2@arizonaqa.com", password="Clave1234")

    respuesta = client.post(
        "/auth/login",
        json={"email": "valida2@arizonaqa.com", "password": "otra-cosa"},
    )

    assert respuesta.status_code == 401


def test_endpoint_protegido_sin_token(client):
    respuesta = client.get("/usuarios", params={"rol": "ALUMNO"})
    assert respuesta.status_code in (401, 403)
