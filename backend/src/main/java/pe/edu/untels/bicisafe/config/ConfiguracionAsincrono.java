package pe.edu.untels.bicisafe.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;

/**
 * Configures asynchronous execution ({@code @Async}) for email sending so a slow SMTP
 * call never blocks an HTTP request thread.
 */
@Configuration
@EnableAsync
public class ConfiguracionAsincrono {
}
