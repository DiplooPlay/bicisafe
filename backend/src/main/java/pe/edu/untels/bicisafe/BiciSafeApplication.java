package pe.edu.untels.bicisafe;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class BiciSafeApplication {

	public static void main(String[] args) {
		SpringApplication.run(BiciSafeApplication.class, args);
	}

}
