package uis.entornos.backend_nosql.repository;

import uis.entornos.backend_nosql.model.Venta;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public interface VentaRepository extends MongoRepository<Venta, String> {

    @Query(value = "{ 'fecha': { $gte: ?0, $lt: ?1 } }", fields = "{ 'total': 1 }")
    BigDecimal sumTotalByFechaRange(LocalDateTime start, LocalDateTime end);
}
