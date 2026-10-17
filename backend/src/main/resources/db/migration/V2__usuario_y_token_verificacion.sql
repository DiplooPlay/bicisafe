-- E1: users and email verification tokens.

CREATE TABLE usuario (
    id             UUID PRIMARY KEY,
    correo         VARCHAR(255) NOT NULL UNIQUE,
    hash_password  VARCHAR(255) NOT NULL,
    nombre         VARCHAR(120) NOT NULL,
    rol            VARCHAR(20)  NOT NULL,
    estado         VARCHAR(30)  NOT NULL,
    fecha_registro TIMESTAMPTZ  NOT NULL,
    fecha_verificacion TIMESTAMPTZ
);

CREATE TABLE token_verificacion (
    id              UUID PRIMARY KEY,
    token           VARCHAR(36)  NOT NULL UNIQUE,
    usuario_id      UUID         NOT NULL REFERENCES usuario (id) ON DELETE CASCADE,
    fecha_expiracion TIMESTAMPTZ NOT NULL,
    fecha_uso       TIMESTAMPTZ
);

CREATE INDEX idx_token_verificacion_usuario ON token_verificacion (usuario_id);
