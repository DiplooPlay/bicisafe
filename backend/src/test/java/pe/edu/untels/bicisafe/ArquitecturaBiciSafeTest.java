package pe.edu.untels.bicisafe;

import com.tngtech.archunit.core.importer.ClassFileImporter;
import com.tngtech.archunit.core.importer.ImportOption;
import com.tngtech.archunit.lang.ArchRule;
import com.tngtech.archunit.lang.syntax.ArchRuleDefinition;
import org.junit.jupiter.api.Test;

/**
 * Guards the modular-monolith boundaries from the README: controllers cannot touch
 * repositories directly (the logic lives in services), adapters do not reach other
 * modules' internals (they implement the ports), and the domain stays free of
 * framework beans.
 */
class ArquitecturaBiciSafeTest {

    private static final ClassFileImporter IMPORTADOR =
            new ClassFileImporter().withImportOption(new ImportOption.DoNotIncludeTests());

    @Test
    void losControladoresNoAccedenARepositorios() {
        ArchRule regla = ArchRuleDefinition.noClasses()
                .that().resideInAPackage("..controller..")
                .should().dependOnClassesThat().resideInAPackage("..repository..")
                .because("la lógica vive en el service (dependencias hacia adentro)");
        regla.check(IMPORTADOR.importPackages("pe.edu.untels.bicisafe"));
    }

    @Test
    void losAdaptadoresNoConocenLosInternosDeLosModulos() {
        ArchRule regla = ArchRuleDefinition.noClasses()
                .that().resideInAPackage("pe.edu.untels.bicisafe.integracion..")
                .should().dependOnClassesThat().resideInAnyPackage("..repository..", "..controller..")
                .because("los adaptadores implementan puertos, no invaden los módulos");
        regla.check(IMPORTADOR.importPackages("pe.edu.untels.bicisafe"));
    }

    @Test
    void elDominioNoDependeDeSpringNiDelFramework() {
        ArchRule regla = ArchRuleDefinition.classes()
                .that().resideInAPackage("..domain..")
                .should().onlyDependOnClassesThat()
                .resideInAnyPackage("java..", "jakarta.persistence..", "org.hibernate..", "lombok..", "..domain..")
                .because("el dominio es la capa más interna y debe ser portable");
        regla.check(IMPORTADOR.importPackages("pe.edu.untels.bicisafe"));
    }
}
