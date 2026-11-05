# Backend

## Configuración

1. Crear y activar un entorno virtual.
2. Instalar las dependencias:

```bash
pip install -r requirements.txt
```

3. Copiar `.env.example` como `.env`.
4. Reemplazar `TU_PASSWORD_URL_ENCODED` por la contraseña de PostgreSQL.
5. Definir un valor propio para `JWT_SECRET`.

La contraseña de PostgreSQL debe compartirse por un medio seguro, nunca por GitHub, correo o chat. Cada desarrollador guarda las credenciales únicamente en su archivo `.env` local. Este archivo está excluido del repositorio.

Si la contraseña contiene caracteres especiales, debe codificarse para una URL antes de colocarla en `DATABASE_URL`.

## Ejecución

Desde la carpeta `backend`:

```bash
uvicorn app.main:app --reload
```

En Windows también se puede ejecutar sin activar el entorno:

```powershell
.\venv\Scripts\python.exe -m uvicorn app.main:app --reload
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
