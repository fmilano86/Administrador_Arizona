# Backend

## Configuración

1. Crear y activar un entorno virtual.
2. Instalar las dependencias:

```bash
pip install -r requirements.txt
```

3. Copiar `.env.example` como `.env`.
4. Completar `DATABASE_URL` con la contraseña codificada para URL y definir `JWT_SECRET`.

El archivo `.env` es local y no debe subirse al repositorio.

## Ejecución

Desde la carpeta `backend`:

```bash
uvicorn app.main:app --reload
```

## Comprobaciones

- API: http://127.0.0.1:8000/health
- Base de datos: http://127.0.0.1:8000/health/database
- Documentación: http://127.0.0.1:8000/docs

Si la conexión a PostgreSQL funciona, el segundo endpoint responde:

```json
{
  "status": "ok",
  "database": "connected"
}
```
