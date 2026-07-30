package com.quickserve.backend.repository;

import com.quickserve.backend.entity.MenuItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {

    /** All items sorted A → Z by name. */
    List<MenuItem> findAllByOrderByNameAsc();

    /** All items belonging to a specific category. */
    List<MenuItem> findByCategoryId(Long categoryId);

    /** Only items currently marked as available. */
    List<MenuItem> findByAvailableTrue();

    /** Duplicate-name check on create (case-insensitive). */
    boolean existsByNameIgnoreCase(String name);

    /** Duplicate-name check on update — excludes the item being updated. */
    boolean existsByNameIgnoreCaseAndIdNot(String name, Long id);
}
