package uis.entornos.backend_nosql.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import uis.entornos.backend_nosql.model.Cliente;

@Repository
public interface ClienteRepository extends MongoRepository<Cliente, String> {
    // Aquí puedes agregar consultas personalizadas si las necesitas
}
