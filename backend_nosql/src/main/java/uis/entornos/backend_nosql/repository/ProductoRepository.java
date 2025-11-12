package uis.entornos.backend_nosql.repository;

import uis.entornos.backend_nosql.model.Producto;
import uis.entornos.backend_nosql.model.Sucursal;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface ProductoRepository extends MongoRepository<Producto, String> {
    List<Producto> findBySucursal(Sucursal sucursal);
}
