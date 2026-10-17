package pe.edu.untels.bicisafe.config.web;

import java.util.LinkedHashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import pe.edu.untels.bicisafe.compartido.excepcion.CredencialesInvalidasExcepcion;
import pe.edu.untels.bicisafe.compartido.excepcion.CuentaNoVerificadaExcepcion;
import pe.edu.untels.bicisafe.compartido.excepcion.IntegracionExcepcion;
import pe.edu.untels.bicisafe.compartido.excepcion.NegocioExcepcion;
import pe.edu.untels.bicisafe.compartido.excepcion.RecursoNoEncontradoExcepcion;
import pe.edu.untels.bicisafe.compartido.excepcion.TokenConfirmacionInvalidoExcepcion;
import pe.edu.untels.bicisafe.compartido.excepcion.ValorDuplicadoExcepcion;

/**
 * Translates business exceptions into HTTP responses with a uniform JSON body
 * ({@link CuerpoError}) so the frontend always knows how to render errors.
 */
@RestControllerAdvice
public class ManejadorGlobalExcepciones {

    private static final Logger LOGGER = LoggerFactory.getLogger(ManejadorGlobalExcepciones.class);

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<CuerpoError> manejarValidacion(MethodArgumentNotValidException excepcion) {
        Map<String, String> errores = new LinkedHashMap<>();
        excepcion.getBindingResult().getFieldErrors()
                .forEach(error -> errores.putIfAbsent(error.getField(), error.getDefaultMessage()));
        return ResponseEntity.badRequest().body(new CuerpoError("Revisa los campos del formulario.", errores));
    }

    @ExceptionHandler(ValorDuplicadoExcepcion.class)
    public ResponseEntity<CuerpoError> manejarValorDuplicado(ValorDuplicadoExcepcion excepcion) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(CuerpoError.deCampo(excepcion.getCampo(), excepcion.getMessage()));
    }

    @ExceptionHandler(CredencialesInvalidasExcepcion.class)
    public ResponseEntity<CuerpoError> manejarCredenciales(CredencialesInvalidasExcepcion excepcion) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(CuerpoError.de(excepcion.getMessage()));
    }

    @ExceptionHandler(CuentaNoVerificadaExcepcion.class)
    public ResponseEntity<CuerpoError> manejarCuentaNoVerificada(CuentaNoVerificadaExcepcion excepcion) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(CuerpoError.de(excepcion.getMessage()));
    }

    @ExceptionHandler(TokenConfirmacionInvalidoExcepcion.class)
    public ResponseEntity<CuerpoError> manejarTokenInvalido(TokenConfirmacionInvalidoExcepcion excepcion) {
        return ResponseEntity.badRequest().body(CuerpoError.de(excepcion.getMessage()));
    }

    @ExceptionHandler(RecursoNoEncontradoExcepcion.class)
    public ResponseEntity<CuerpoError> manejarRecursoNoEncontrado(RecursoNoEncontradoExcepcion excepcion) {
        if (excepcion.getCampo() != null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(CuerpoError.deCampo(excepcion.getCampo(), excepcion.getMessage()));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(CuerpoError.de(excepcion.getMessage()));
    }

    @ExceptionHandler(IntegracionExcepcion.class)
    public ResponseEntity<CuerpoError> manejarIntegracion(IntegracionExcepcion excepcion) {
        return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(CuerpoError.de(excepcion.getMessage()));
    }

    @ExceptionHandler(NegocioExcepcion.class)
    public ResponseEntity<CuerpoError> manejarNegocio(NegocioExcepcion excepcion) {
        return ResponseEntity.badRequest().body(CuerpoError.de(excepcion.getMessage()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<CuerpoError> manejarErrorInesperado(Exception excepcion) {
        LOGGER.error("Excepción no controlada", excepcion);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(CuerpoError.de("Ocurrió un error interno. Intenta de nuevo."));
    }
}
