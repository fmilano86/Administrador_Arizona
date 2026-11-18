from conftest import crear_usuario, headers_para


def test_no_permite_actividades_duplicadas(client, db_session):
    admin = crear_usuario(db_session, rol="ADMINISTRADOR", email="admin@arizonaqa.com")
    headers = headers_para(admin)

    primera = client.post("/actividades", json={"nombre": "Yoga"}, headers=headers)
    assert primera.status_code == 201

    segunda = client.post("/actividades", json={"nombre": "Yoga"}, headers=headers)
    assert segunda.status_code == 409
