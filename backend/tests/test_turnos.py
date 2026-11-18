from conftest import crear_actividad, crear_clase, crear_usuario, headers_para


def test_reservar_turno_baja_cupos_disponibles(client, db_session):
    profesor = crear_usuario(db_session, rol="PROFESOR", email="profe1@arizonaqa.com")
    alumno = crear_usuario(db_session, rol="ALUMNO", email="alumno1@arizonaqa.com")
    actividad = crear_actividad(db_session, nombre="Pilates A")
    clase = crear_clase(db_session, actividad, profesor, cupo_maximo=7)
    db_session.commit()

    respuesta = client.post(
        "/turnos", json={"clase_id": clase.id}, headers=headers_para(alumno)
    )
    assert respuesta.status_code == 201
    cuerpo = respuesta.json()
    assert cuerpo["estado"] == "CONFIRMADO"
    assert cuerpo["tipo"] == "PRUEBA"

    detalle = client.get(f"/clases/{clase.id}", headers=headers_para(alumno))
    assert detalle.json()["cupos_disponibles"] == 6


def test_no_permite_reservar_la_misma_clase_dos_veces(client, db_session):
    profesor = crear_usuario(db_session, rol="PROFESOR", email="profe2@arizonaqa.com")
    alumno = crear_usuario(db_session, rol="ALUMNO", email="alumno2@arizonaqa.com")
    actividad = crear_actividad(db_session, nombre="Yoga B")
    clase = crear_clase(db_session, actividad, profesor, cupo_maximo=7)
    db_session.commit()
    headers = headers_para(alumno)

    client.post("/turnos", json={"clase_id": clase.id}, headers=headers)
    segunda = client.post("/turnos", json={"clase_id": clase.id}, headers=headers)

    assert segunda.status_code == 409


def test_no_permite_reservar_clases_superpuestas(client, db_session):
    profesor = crear_usuario(db_session, rol="PROFESOR", email="profe3@arizonaqa.com")
    alumno = crear_usuario(db_session, rol="ALUMNO", email="alumno3@arizonaqa.com")
    actividad = crear_actividad(db_session, nombre="Sculpt C")
    clase1 = crear_clase(db_session, actividad, profesor, cupo_maximo=7, en_minutos=60)
    clase2 = crear_clase(db_session, actividad, profesor, cupo_maximo=7, en_minutos=90)
    db_session.commit()
    headers = headers_para(alumno)

    primera = client.post("/turnos", json={"clase_id": clase1.id}, headers=headers)
    assert primera.status_code == 201

    segunda = client.post("/turnos", json={"clase_id": clase2.id}, headers=headers)
    assert segunda.status_code == 409


def test_clase_llena_pasa_a_lista_de_espera_y_promueve_al_cancelar(client, db_session):
    profesor = crear_usuario(db_session, rol="PROFESOR", email="profe4@arizonaqa.com")
    alumno1 = crear_usuario(db_session, rol="ALUMNO", email="alumno4a@arizonaqa.com")
    alumno2 = crear_usuario(db_session, rol="ALUMNO", email="alumno4b@arizonaqa.com")
    actividad = crear_actividad(db_session, nombre="Pilates D")
    clase = crear_clase(db_session, actividad, profesor, cupo_maximo=1)
    db_session.commit()

    r1 = client.post("/turnos", json={"clase_id": clase.id}, headers=headers_para(alumno1))
    assert r1.status_code == 201
    assert r1.json()["estado"] == "CONFIRMADO"
    turno1_id = r1.json()["id"]

    r2 = client.post("/turnos", json={"clase_id": clase.id}, headers=headers_para(alumno2))
    assert r2.status_code == 201
    assert r2.json()["estado"] == "EN_ESPERA"

    detalle = client.get(f"/clases/{clase.id}", headers=headers_para(alumno1))
    assert detalle.json()["en_espera"] == 1
    assert detalle.json()["cupos_disponibles"] == 0

    cancelar = client.post(
        f"/turnos/{turno1_id}/cancelar", headers=headers_para(alumno1)
    )
    assert cancelar.status_code == 200

    turnos_alumno2 = client.get(
        "/turnos", params={"alumno_id": alumno2.id}, headers=headers_para(profesor)
    )
    estados = [t["estado"] for t in turnos_alumno2.json() if t["clase_id"] == clase.id]
    assert estados == ["CONFIRMADO"]


def test_se_puede_retirar_de_la_lista_de_espera(client, db_session):
    profesor = crear_usuario(db_session, rol="PROFESOR", email="profe5@arizonaqa.com")
    alumno1 = crear_usuario(db_session, rol="ALUMNO", email="alumno5a@arizonaqa.com")
    alumno2 = crear_usuario(db_session, rol="ALUMNO", email="alumno5b@arizonaqa.com")
    actividad = crear_actividad(db_session, nombre="Pilates E")
    clase = crear_clase(db_session, actividad, profesor, cupo_maximo=1)
    db_session.commit()

    client.post("/turnos", json={"clase_id": clase.id}, headers=headers_para(alumno1))
    r2 = client.post("/turnos", json={"clase_id": clase.id}, headers=headers_para(alumno2))
    turno2_id = r2.json()["id"]
    assert r2.json()["estado"] == "EN_ESPERA"

    retiro = client.post(f"/turnos/{turno2_id}/cancelar", headers=headers_para(alumno2))
    assert retiro.status_code == 200
    assert retiro.json()["estado"] == "CANCELADO"
