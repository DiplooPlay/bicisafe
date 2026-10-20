-- E3: Incidents and community consensus votes.

CREATE TABLE incidente (
    id               UUID PRIMARY KEY,
    categoria        VARCHAR(30)      NOT NULL,
    titulo           VARCHAR(120)     NOT NULL,
    descripcion      VARCHAR(120)     NOT NULL,
    ubicacion_texto  VARCHAR(200)     NOT NULL,
    latitud          DOUBLE PRECISION NOT NULL,
    longitud         DOUBLE PRECISION NOT NULL,
    geom             geometry(Point, 4326),
    foto_url         VARCHAR(500),
    usuario_id       UUID REFERENCES usuario(id) ON DELETE SET NULL,
    autor_nombre     VARCHAR(120)     NOT NULL,
    autor_reputacion INT              NOT NULL DEFAULT 15,
    estado           VARCHAR(30)      NOT NULL DEFAULT 'PENDIENTE',
    votos_confirmar  INT              NOT NULL DEFAULT 1,
    votos_rechazar   INT              NOT NULL DEFAULT 0,
    votos_requeridos INT              NOT NULL DEFAULT 3,
    fecha_creacion   TIMESTAMPTZ      NOT NULL,
    fecha_expiracion TIMESTAMPTZ      NOT NULL
);
23
CREATE INDEX idx_incidente_geom ON incidente USING GIST(geom);
CREATE INDEX idx_incidente_estado ON incidente(estado);

CREATE TABLE incidente_voto (
    id           UUID PRIMARY KEY,
    incidente_id UUID         NOT NULL REFERENCES incidente(id) ON DELETE CASCADE,
    usuario_id   UUID REFERENCES usuario(id) ON DELETE SET NULL,
    votante_id   VARCHAR(100) NOT NULL,
    tipo_voto    VARCHAR(20)  NOT NULL,
    fecha_voto   TIMESTAMPTZ  NOT NULL,
    CONSTRAINT uq_incidente_voto UNIQUE(incidente_id, votante_id, tipo_voto)
);

CREATE INDEX idx_incidente_voto_incidente ON incidente_voto(incidente_id);
