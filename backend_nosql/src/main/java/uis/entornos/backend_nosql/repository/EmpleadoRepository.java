package uis.entornos.backend_nosql.repository;

import uis.entornos.backend_nosql.model.Empleado;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface EmpleadoRepository extends MongoRepository<Empleado, String> {
    Optional<Empleado> findByEmailAndPassword(String email, String password);

    Optional<Empleado> findByUsuarioAndPassword(String usuario, String password);
}
