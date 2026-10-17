package pe.edu.untels.bicisafe.config.cache;

import java.time.Duration;

import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.cache.caffeine.CaffeineCacheManager;

import com.github.benmanes.caffeine.cache.Caffeine;

/**
 * In-memory cache (Caffeine) for external provider results. Keeps the ORS/Nominatim
 * free tiers under their rate limits for repeated searches.
 */
@Configuration
@EnableCaching
public class ConfiguracionCache {

    private static final String[] NOMBRES_CACHES = {"busquedaLugares", "rutasPlanificadas"};

    @Bean
    public CaffeineCacheManager cacheManager() {
        CaffeineCacheManager cacheManager = new CaffeineCacheManager(NOMBRES_CACHES);
        cacheManager.setCaffeine(Caffeine.newBuilder()
                .maximumSize(500)
                .expireAfterWrite(Duration.ofMinutes(10)));
        return cacheManager;
    }
}
