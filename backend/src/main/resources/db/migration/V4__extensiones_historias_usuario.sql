-- HU-03, HU-04, HU-14, HU-16: extensions for password recovery, reputation, moderation and saved routes.

ALTER TABLE usuario ADD COLUMN IF NOT EXISTS reputacion INT NOT NULL DEFAULT 15;

CREATE TABLE IF NOT EXISTS token_recuperacion (
    id               UUID PRIMARY KEY,
    token            VARCHAR(36)  NOT NULL UNIQUE,
    usuario_id       UUID         NOT NULL REFERENCES usuario (id) ON DELETE CASCADE,
    fecha_expiracion TIMESTAMPTZ  NOT NULL,
    fecha_uso        TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_token_recuperacion_usuario ON token_recuperacion (usuario_id);

CREATE TABLE IF NOT EXISTS incidente_denuncia (
    id             UUID PRIMARY KEY,
    incidente_id   UUID         NOT NULL REFERENCES incidente (id) ON DELETE CASCADE,
    usuario_id     UUID         REFERENCES usuario (id) ON DELETE SET NULL,
    motivo         VARCHAR(50)  NOT NULL,
    comentario     VARCHAR(200),
    fecha_creacion TIMESTAMPTZ  NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_incidente_denuncia_incidente ON incidente_denuncia (incidente_id);

CREATE TABLE IF NOT EXISTS ruta_guardada (
    id             UUID PRIMARY KEY,
    usuario_id     UUID             NOT NULL REFERENCES usuario (id) ON DELETE CASCADE,
    nombre         VARCHAR(100)     NOT NULL,
    origen_nombre  VARCHAR(150),
    destino_nombre VARCHAR(150),
    lat_origen     DOUBLE PRECISION NOT NULL,
    lng_origen     DOUBLE PRECISION NOT NULL,
    lat_destino    DOUBLE PRECISION NOT NULL,
    lng_destino    DOUBLE PRECISION NOT NULL,
    distancia_km   DOUBLE PRECISION NOT NULL,
    duracion_min   BIGINT           NOT NULL,
    geometria_json TEXT             NOT NULL,
    fecha_creacion TIMESTAMPTZ      NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_ruta_guardada_usuario ON ruta_guardada (usuario_id);

ALTER TABLE incidente ADD COLUMN IF NOT EXISTS denuncias_falso INT NOT NULL DEFAULT 0;
ALTER TABLE incidente ADD COLUMN IF NOT EXISTS denuncias_duplicado INT NOT NULL DEFAULT 0;
