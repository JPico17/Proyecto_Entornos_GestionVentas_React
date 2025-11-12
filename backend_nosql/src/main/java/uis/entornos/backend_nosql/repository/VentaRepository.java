package uis.entornos.backend_nosql.repository;

import uis.entornos.backend_nosql.model.Venta;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Aggregation;
import java.time.LocalDateTime;
import java.util.Optional;

public interface VentaRepository extends MongoRepository<Venta, String> {

    @Aggregation(pipeline = {
            "{ $match: { 'fecha': { $gte: ?0, $lt: ?1 } } }",
            "{ $group: { _id: null, totalSum: { $sum: '$total' } } }"
    })
    Optional<Double> sumTotalByFechaRange(LocalDateTime start, LocalDateTime end);
}
